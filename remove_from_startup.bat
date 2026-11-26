@echo off
title Remove Garments Server from Windows Startup
set "VBS_SCRIPT=%TEMP%\remove_shortcut.vbs"

echo Set oWS = WScript.CreateObject("WScript.Shell") > "%VBS_SCRIPT%"
echo Set objFSO = CreateObject("Scripting.FileSystemObject") >> "%VBS_SCRIPT%"
echo sLinkFile = oWS.SpecialFolders("Startup") ^& "\Garments Server AutoStart.lnk" >> "%VBS_SCRIPT%"
echo If objFSO.FileExists(sLinkFile) Then objFSO.DeleteFile(sLinkFile) >> "%VBS_SCRIPT%"

cscript //nologo "%VBS_SCRIPT%"
del "%VBS_SCRIPT%"

echo.
echo ========================================================
echo Server shortcut has been removed from Startup folder.
echo ========================================================
echo.
pause
