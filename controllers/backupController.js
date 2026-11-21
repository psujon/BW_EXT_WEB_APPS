const path = require('path');
const fs = require('fs');
const { prisma } = require('../db');

const backupDir = path.join(__dirname, '../backups');

const createBackupFile = async (triggerType = 'Manual', userId = null) => {
  // Ensure backups directory exists
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const now = new Date();
  const dateStr = now.toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-');
  const filename = `garments_db_full_backup_${dateStr}.sql`;
  const filePath = path.join(backupDir, filename);

  // 1. Fetch all table names dynamically from MySQL
  const tablesRaw = await prisma.$queryRawUnsafe(`SHOW TABLES`);
  const tableNames = tablesRaw.map(row => Object.values(row)[0]);

  let sqlDump = `-- ========================================================\n`;
  sqlDump += `-- GARMENTS DASHBOARD COMPLETE MYSQL DATABASE BACKUP\n`;
  sqlDump += `-- Database: garments_db\n`;
  sqlDump += `-- Created At: ${now.toLocaleString()}\n`;
  sqlDump += `-- Trigger Source: ${triggerType}\n`;
  sqlDump += `-- Total Tables Exported: ${tableNames.length}\n`;
  sqlDump += `-- Includes: DATABASE, TABLE STRUCTURE (DDL) & DATA\n`;
  sqlDump += `-- ========================================================\n\n`;

  sqlDump += `CREATE DATABASE IF NOT EXISTS \`garments_db\` DEFAULT CHARACTER SET utf8mb4;\n`;
  sqlDump += `USE \`garments_db\`;\n\n`;
  sqlDump += `SET FOREIGN_KEY_CHECKS = 0;\n`;
  sqlDump += `SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";\n\n`;

  for (const tableName of tableNames) {
    sqlDump += `-- --------------------------------------------------------\n`;
    sqlDump += `-- Table structure & data for table \`${tableName}\`\n`;
    sqlDump += `-- --------------------------------------------------------\n\n`;
    sqlDump += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;

    // Fetch exact DDL CREATE TABLE query
    try {
      const createResult = await prisma.$queryRawUnsafe(`SHOW CREATE TABLE \`${tableName}\``);
      if (createResult && createResult[0]) {
        const createSql = createResult[0]['Create Table'] || Object.values(createResult[0])[1];
        sqlDump += `${createSql};\n\n`;
      }
    } catch (ddlErr) {
      console.warn(`Could not get CREATE TABLE for ${tableName}:`, ddlErr.message);
    }

    // Fetch all table records
    const records = await prisma.$queryRawUnsafe(`SELECT * FROM \`${tableName}\``);
    if (Array.isArray(records) && records.length > 0) {
      sqlDump += `-- Dumping data for table \`${tableName}\` (${records.length} records)\n`;

      const keys = Object.keys(records[0]).map(k => `\`${k}\``).join(', ');

      records.forEach(row => {
        const values = Object.values(row).map(val => {
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'number' || typeof val === 'boolean') return val;
          if (val instanceof Date) {
            return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
          }
          if (typeof val === 'object') {
            return `'${String(JSON.stringify(val)).replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;
          }
          return `'${String(val).replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;
        }).join(', ');

        sqlDump += `INSERT INTO \`${tableName}\` (${keys}) VALUES (${values});\n`;
      });
      sqlDump += `\n`;
    }
  }

  sqlDump += `SET FOREIGN_KEY_CHECKS = 1;\n`;

  // Save full SQL dump file
  fs.writeFileSync(filePath, sqlDump, 'utf8');

  const stats = fs.statSync(filePath);
  const sizeInBytes = stats.size;
  const sizeFormatted = sizeInBytes > 1024 * 1024 
    ? `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB` 
    : `${(sizeInBytes / 1024).toFixed(1)} KB`;

  const backup = await prisma.backupHistory.create({
    data: {
      backup_name: filename,
      status: 'Success',
      file_size: sizeFormatted,
      processed_by: userId,
      processed_date: new Date()
    }
  });

  return { backup, filePath, filename, sizeFormatted };
};

exports.createBackupFile = createBackupFile;

exports.getAll = async (req, res) => {
  try {
    const history = await prisma.backupHistory.findMany({
      orderBy: { id: 'desc' }
    });
    res.json(history);
  } catch (err) {
    console.error('Error fetching backup history:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.create = async (req, res) => {
  const userId = req.user ? req.user.id : null;
  try {
    const { backup, filePath } = await createBackupFile('Manual UI Request', userId);

    res.json({
      message: 'সম্পূর্ণ ডাটাবেজ, টেবিল স্ট্রাকচার ও ডাটাসহ ফুল ব্যাকআপ সফলভাবে সম্পন্ন হয়েছে!',
      backup: {
        id: backup.id,
        backup_name: backup.backup_name,
        backup_date: backup.backup_date,
        status: backup.status,
        file_size: backup.file_size,
        filePath: filePath
      }
    });
  } catch (err) {
    console.error('Full database backup creation error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.download = async (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(backupDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Backup file not found on server' });
  }

  res.download(filePath, filename);
};

exports.restore = async (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(backupDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'ব্যাকআপ ফাইলটি সার্ভারে পাওয়া যায়নি' });
  }

  try {
    const sqlContent = fs.readFileSync(filePath, 'utf8');

    // Split queries by semicolon line end while ignoring comments
    const statements = sqlContent
      .split(/;\s*$/m)
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 0;`);

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await prisma.$executeRawUnsafe(statement);
        } catch (stmtErr) {
          console.warn(`Restore statement notice: ${stmtErr.message}`);
        }
      }
    }

    await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 1;`);

    res.json({ message: `"${filename}" ব্যাকআপ ডাটাবেজে সফলভাবে রিস্টোর করা হয়েছে!` });
  } catch (err) {
    console.error('Database restore error:', err);
    res.status(500).json({ message: `রিস্টোর ব্যর্থ হয়েছে: ${err.message}` });
  }
};
