@echo off
chcp 65001 >nul
title 打印中心 - 启动程序

:MENU
cls
echo.
echo  ██████╗ ██████╗  █████╗ ███╗   ███╗███╗   ███╗███████╗██████╗ 
echo ██╔════╝ ██╔══██╗██╔══██╗████╗ ████║████╗ ████║██╔════╝██╔══██╗
echo ██║  ███╗██████╔╝███████║██╔████╔██║██╔████╔██║█████╗  ██████╔╝
echo ██║   ██║██╔══██╗██╔══██║██║╚██╔╝██║██║╚██╔╝██║██╔══╝  ██╔══██╗
echo ╚██████╔╝██████╔╝██║  ██║██║ ╚═╝ ██║██║ ╚═╝ ██║███████╗██║  ██║
echo  ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝
echo.
echo ==============================================
echo          打印中心 - 启动程序
echo ==============================================
echo.
echo  [1] 启动开发服务器 (开发模式)
echo  [2] 构建生产版本
echo  [3] 预览生产版本
echo  [4] 运行类型检查
echo  [5] 运行代码检查
echo  [6] 退出
echo.
echo ==============================================
echo.
set /p "choice=请输入选项 [1-6]: "

if "%choice%"=="1" goto DEV
if "%choice%"=="2" goto BUILD
if "%choice%"=="3" goto PREVIEW
if "%choice%"=="4" goto CHECK
if "%choice%"=="5" goto LINT
if "%choice%"=="6" exit /b 0

echo 无效选项，请重新输入
pause
goto MENU

:DEV
cls
echo ==============================================
echo          启动开发服务器
echo ==============================================
echo.

cd /d "%~dp0"

echo [1/3] 检查 Node.js 环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: 未检测到 Node.js，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    goto MENU
)

echo [2/3] 检查项目依赖...
if not exist node_modules (
    echo 正在安装依赖，请稍候...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: 依赖安装失败
        pause
        goto MENU
    )
    echo 依赖安装完成
) else (
    echo 依赖已存在，跳过安装
)

echo.
echo [3/3] 启动开发服务器...
echo ==============================================
echo 服务器将在浏览器中自动打开
echo 访问地址: http://localhost:5173/
echo 后台管理: http://localhost:5173/admin/login
echo 默认密码: admin
echo ==============================================
echo.

start "" "http://localhost:5173/"
npm run dev

pause
goto MENU

:BUILD
cls
echo ==============================================
echo          构建生产版本
echo ==============================================
echo.

cd /d "%~dp0"

echo [1/2] 检查项目依赖...
if not exist node_modules (
    echo 正在安装依赖，请稍候...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: 依赖安装失败
        pause
        goto MENU
    )
)

echo [2/2] 开始构建...
npm run build

echo.
if %errorlevel% equ 0 (
    echo ==============================================
    echo 构建成功!
    echo 生成的文件位于: dist/ 目录
    echo ==============================================
) else (
    echo ==============================================
    echo 构建失败，请检查错误信息
    echo ==============================================
)

pause
goto MENU

:PREVIEW
cls
echo ==============================================
echo          预览生产版本
echo ==============================================
echo.

cd /d "%~dp0"

echo [1/2] 检查是否已构建...
if not exist dist (
    echo 正在先构建生产版本...
    npm run build
    if %errorlevel% neq 0 (
        echo ERROR: 构建失败
        pause
        goto MENU
    )
)

echo [2/2] 启动预览服务器...
echo ==============================================
echo 访问地址: http://localhost:4173/
echo ==============================================

start "" "http://localhost:4173/"
npm run preview

pause
goto MENU

:CHECK
cls
echo ==============================================
echo          运行类型检查
echo ==============================================
echo.

cd /d "%~dp0"

npm run check

echo.
if %errorlevel% equ 0 (
    echo ==============================================
    echo 类型检查通过!
    echo ==============================================
) else (
    echo ==============================================
    echo 类型检查失败，请检查错误信息
    echo ==============================================
)

pause
goto MENU

:LINT
cls
echo ==============================================
echo          运行代码检查
echo ==============================================
echo.

cd /d "%~dp0"

npm run lint

echo.
if %errorlevel% equ 0 (
    echo ==============================================
    echo 代码检查通过!
    echo ==============================================
) else (
    echo ==============================================
    echo 代码检查失败，请检查错误信息
    echo ==============================================
)

pause
goto MENU