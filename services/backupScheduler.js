const cron = require('node-cron');
const { createBackupFile } = require('../controllers/backupController');

/**
 * Initializes auto database backup schedule.
 * Runs automatically every day at 5:00 PM (17:00).
 */
function initAutoBackupScheduler() {
  // Cron syntax: minute hour day-of-month month day-of-week
  // '0 17 * * *' = At 17:00 (5:00 PM) every day
  const cronExpression = '0 17 * * *';

  cron.schedule(cronExpression, async () => {
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
  }, {
    timezone: 'Asia/Dhaka'
  });

  console.log('⏰ Auto Database Backup Scheduler active: Runs daily at 5:00 PM (17:00 Asia/Dhaka)');
}

module.exports = { initAutoBackupScheduler };
