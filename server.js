const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Logger Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- Mount Modular Router Modules ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/buyers', require('./routes/buyers'));
app.use('/api/styles', require('./routes/styles'));
app.use('/api/processes', require('./routes/processes'));
app.use('/api/piece-rates', require('./routes/pieceRates'));
app.use('/api/buyer-orders', require('./routes/buyerOrders'));
app.use('/api/yarn-challans', require('./routes/yarnChallans'));
app.use('/api/production', require('./routes/production'));
app.use('/api/users', require('./routes/users'));
app.use('/api/backup', require('./routes/backups'));
app.use('/api/sections', require('./routes/sections'));
app.use('/api/colors', require('./routes/colors'));
app.use('/api/company', require('./routes/company'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/approvals', require('./routes/approvals'));
app.use('/api/reports', require('./routes/reports'));



// --- Frontend Static Servicing in Production ---
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback to React SPA index.html for non-API client routes
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const { initAutoBackupScheduler } = require('./services/backupScheduler');

// Start Express server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Garments Dashboard Server running on http://0.0.0.0:${PORT}`);
  // Initialize Daily 5:00 PM Auto Backup Scheduler
  initAutoBackupScheduler();
});
