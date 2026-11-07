@echo off
chcp 65001 >nul 2>&1
setlocal
set "DIR=%~dp0"
if not exist "%DIR%index.html" (
  echo index.html が見つかりません: %DIR%
  pause
  exit /b 1
)
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Python が見つかりません。python.org からインストールしてください。
  pause
  exit /b 1
)
for /f "tokens=2 delims=:" %%P in ('netstat -ano ^| findstr ":8080" ^| findstr LISTENING') do (
  set "USED=%%P"
  goto :busy
)
echo TaskMind サーバー起動中: http://localhost:8080/
start "" "http://localhost:8080/"
python -m http.server 8080 --directory "%DIR%"
goto :eof
:busy
echo ポート 8080 は使用中です。ブラウザで http://localhost:8080/ を開きます。
start "" "http://localhost:8080/"
pause
