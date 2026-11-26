let cron = null;
try {
  cron = require('node-cron');
} catch (e) {
  // node-cron not installed, will fallback to native Node.js timer
}

const { createBackupFile } = require('../controllers/backupController');

/**
 * Native daily 5:00 PM scheduler in pure JavaScript (Requires 0 external dependencies).
 * Works reliably even if node-cron is not installed in node_modules.
 */
function scheduleNativeDaily5PM(task) {
  function getMsUntil5PM() {
    const now = new Date();
    const next5PM = new Date(now);
    next5PM.setHours(17, 0, 0, 0); // 17:00:00 (5:00 PM)

    if (now.getTime() >= next5PM.getTime()) {
      // 5 PM today has already passed, schedule for tomorrow 5 PM
      next5PM.setDate(next5PM.getDate() + 1);
    }

    return next5PM.getTime() - now.getTime();
  }

  function armNextTimer() {
    const msUntilNext = getMsUntil5PM();
    const hours = (msUntilNext / (1000 * 60 * 60)).toFixed(2);
    console.log(`⏰ [Auto Backup] Next scheduled backup in ${hours} hours (at 5:00 PM).`);

    setTimeout(async () => {
      try {
        await task();
      } catch (err) {
        console.error('[Auto Backup Error]:', err.message);
      }
      // Re-arm timer for the next day
      armNextTimer();
    }, msUntilNext);
  }

  armNextTimer();
}

/**
 * Initializes auto database backup schedule.
 * Runs automatically every day at 5:00 PM (17:00).
 */
function initAutoBackupScheduler() {
  const runBackup = async () => {
    console.log(`\n======================================================`);
    console.log(`[Auto Backup] [${new Date().toLocaleString()}] Starting scheduled daily 5:00 PM database backup...`);
    try {
      const result = await createBackupFile('Auto Schedule (Daily 5 PM)');
      console.log(`[Auto Backup] Success! Saved file: ${result.filename} (${result.sizeFormatted})`);
      console.log(`======================================================\n`);
    } catch (error) {
      console.error('[Auto Backup Error] Failed to generate scheduled backup:', error);
      console.log(`======================================================\n`);
    }
  };

  if (cron && typeof cron.schedule === 'function') {
    try {
      cron.schedule('0 17 * * *', runBackup, { timezone: 'Asia/Dhaka' });
      console.log('⏰ Auto Database Backup Scheduler active (node-cron): Runs daily at 5:00 PM (17:00 Asia/Dhaka)');
      return;
    } catch (err) {
      console.warn('node-cron schedule failed, falling back to native scheduler:', err.message);
    }
  }

  // Fallback: Pure native Node.js scheduler (no external package needed)
  scheduleNativeDaily5PM(runBackup);
  console.log('⏰ Auto Database Backup Scheduler active (Native): Runs daily at 5:00 PM (17:00 local time)');
}

module.exports = { initAutoBackupScheduler };
