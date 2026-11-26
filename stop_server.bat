@echo off
title Stop Garments Web App Server
echo Searching for process running on port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do (
    echo Killing PID: %%a
    taskkill /f /pid %%a
)
echo Server has been stopped successfully.
pause
