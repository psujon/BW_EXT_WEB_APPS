@echo off
title Add Garments Server to Windows Startup
set "TARGET_DIR=%~dp0"
set "VBS_SCRIPT=%TEMP%\create_shortcut.vbs"

echo Creating Windows Startup shortcut...

echo Set oWS = WScript.CreateObject("WScript.Shell") > "%VBS_SCRIPT%"
echo sLinkFile = oWS.SpecialFolders("Startup") ^& "\Garments Server AutoStart.lnk" >> "%VBS_SCRIPT%"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%VBS_SCRIPT%"
echo oLink.TargetPath = "%TARGET_DIR%start_server.bat" >> "%VBS_SCRIPT%"
echo oLink.WorkingDirectory = "%TARGET_DIR%" >> "%VBS_SCRIPT%"
echo oLink.Description = "Garments Dashboard Auto Server" >> "%VBS_SCRIPT%"
echo oLink.Save >> "%VBS_SCRIPT%"

cscript //nologo "%VBS_SCRIPT%"
del "%VBS_SCRIPT%"

echo.
echo ========================================================
echo SUCCESS: Server shortcut has been added to Startup!
echo Server will now start automatically whenever Windows boots.
echo ========================================================
echo.
pause
