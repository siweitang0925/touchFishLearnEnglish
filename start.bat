@echo off
echo 启动英语学习助手...
cd /d "%~dp0"
if exist "release\win-unpacked\英语学习助手.exe" (
    start "" "release\win-unpacked\英语学习助手.exe"
) else (
    echo 错误：找不到可执行文件
    echo 请先运行 npm run electron-pack-win 进行打包
    pause
) 