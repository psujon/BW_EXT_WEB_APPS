@echo off
title Garments Web App Server
cd /d "%~dp0"
echo ===================================================
echo Starting Garments Dashboard Production Server...
echo Address: http://localhost:5000
echo ===================================================
node server.js
pause
