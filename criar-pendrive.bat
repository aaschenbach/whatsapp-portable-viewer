@echo off
if "%~1"=="" (
    echo Uso: criar-pendrive.bat LETRA
    echo Exemplo: criar-pendrive.bat E
    echo Execute da raiz do projeto.
    exit /b 1
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0criar-pendrive.ps1" -Drive "%~1"
exit /b %errorlevel%
