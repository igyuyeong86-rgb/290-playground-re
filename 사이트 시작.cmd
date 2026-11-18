@echo off
cd /d "%~dp0"
set "PORTFOLIO_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%PORTFOLIO_NODE%" set "PORTFOLIO_NODE=node"
"%PORTFOLIO_NODE%" scripts\run-framework.mjs dev
pause
