# Ziddy Packager - 专业打包解决方案

## 简介

Ziddy Packager 是一个专业的应用程序打包工具，能够将应用程序及其所有依赖项打包成可移植格式，支持在其他计算机上便捷部署和运行。

## 功能特性

### 打包功能
- **版本控制**：自动管理应用版本号，支持语义化版本控制
- **完整性校验**：使用 SHA256 算法生成文件校验和，确保文件完整性
- **压缩优化**：支持多级别压缩，优化包体积
- **跨平台支持**：支持 Windows、Linux、macOS 三大平台

### 一键启动程序
- **GUI 界面**：直观的图形化用户界面，支持双击启动
- **环境检测**：自动检测 Node.js 版本、npm 版本和依赖状态
- **依赖管理**：自动安装缺失的依赖项
- **错误处理**：完善的错误处理和日志记录机制
- **实时日志**：显示系统操作日志，便于问题排查

## 目录结构

```
packager/
├── src/
│   ├── utils/
│   │   ├── logger.js        # 日志工具
│   │   ├── version.js       # 版本管理工具
│   │   └── integrity.js     # 完整性校验工具
│   ├── index.js             # 打包器入口
│   └── packager.js          # 打包器核心逻辑
├── starter/
│   ├── assets/              # 启动程序资源
│   ├── main.js              # Electron 主进程
│   ├── index.html           # 启动程序界面
│   ├── renderer.js          # 启动程序渲染逻辑
│   ├── style.css            # 启动程序样式
│   └── package.json         # 启动程序配置
├── package.json             # 打包器依赖配置
└── README.md                # 使用说明文档
```

## 安装

```bash
cd packager
npm install
```

## 使用方法

### 命令行模式

```bash
node src/index.js
```

### 交互配置

运行后会提示输入以下配置项：

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| 项目目录 | 要打包的项目根目录 | 当前目录 |
| 包名称 | 打包后的包名称 | ziddy |
| 输出目录 | 打包文件输出目录 | ./dist |
| 包含 node_modules | 是否包含依赖目录 | true |
| 压缩打包 | 是否压缩成 ZIP | true |
| 压缩级别 | 压缩级别(1-9) | 9 |

### 配置示例

```bash
========================================
   Ziddy Packager - Professional Packing
========================================

? 项目目录: /path/to/ziddy
? 包名称: ziddy
? 输出目录: /path/to/dist
? 包含 node_modules? Yes
? 压缩打包? Yes
? 压缩级别: 高 (9)

Packaging configuration:
  Project: /path/to/ziddy
  Package Name: ziddy
  Output: /path/to/dist
  Include node_modules: true
  Compression: Yes (level 9)

? 确认开始打包? Yes
```

## 打包流程

1. **版本递增**：自动读取当前版本并递增 patch 版本号
2. **项目构建**：执行 npm run build 构建项目
3. **文件准备**：复制 dist、build、node_modules 等目录
4. **校验和生成**：为所有文件生成 SHA256 校验和
5. **压缩归档**：生成 ZIP 压缩包
6. **启动脚本生成**：生成 start.bat（Windows）、start.sh（Linux/Mac）
7. **部署信息生成**：生成 deploy-info.json 和 DEPLOYMENT.md

## 输出文件

打包完成后，输出目录包含以下文件：

| 文件 | 说明 |
|------|------|
| `ziddy-x.x.x-platform-timestamp.zip` | 打包后的 ZIP 压缩包 |
| `package/` | 打包过程中的临时目录 |

ZIP 包解压后包含：

| 文件/目录 | 说明 |
|-----------|------|
| `dist/` | 前端构建产物 |
| `node_modules/` | 项目依赖 |
| `package.json` | 项目配置 |
| `start.bat` | Windows 启动脚本 |
| `start.sh` | Linux/Mac 启动脚本 |
| `start.vbs` | Windows 静默启动脚本 |
| `checksums.json` | 文件校验和 |
| `deploy-info.json` | 部署信息 |
| `DEPLOYMENT.md` | 部署指南 |
| `main.js` | Electron 主进程文件 |
| `index.html` | 启动程序界面 |
| `renderer.js` | 启动程序渲染逻辑 |
| `style.css` | 启动程序样式 |

## 部署指南

### Windows

**方式一：使用一键启动程序（推荐）**

1. 解压 ZIP 包到任意目录
2. 安装 Electron：`npm install electron`
3. 运行：`npx electron .`
4. 或者构建成可执行文件：`npm run build:win`

**方式二：使用启动脚本**

```bash
# 双击 start.bat 文件
# 或在命令行执行
start.bat
```

### Linux / macOS

```bash
# 解压
unzip ziddy-x.x.x-linux-timestamp.zip

# 进入目录
cd ziddy-x.x.x

# 赋予执行权限
chmod +x start.sh

# 运行
./start.sh
```

## 完整性校验

打包后的包包含 `checksums.json` 文件，可以用来验证文件完整性：

```bash
node -e "
const checksums = require('./checksums.json');
const crypto = require('crypto');
const fs = require('fs');

let allValid = true;
for (const [file, expected] of Object.entries(checksums)) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(file));
  const actual = hash.digest('hex');
  if (actual !== expected) {
    console.log(\`INVALID: \${file}\`);
    allValid = false;
  }
}
console.log(allValid ? 'All files verified successfully' : 'Integrity check failed');
"
```

## 日志管理

打包器会生成日志文件：

| 文件 | 说明 |
|------|------|
| `packager/logs/packager.log` | 常规操作日志 |
| `packager/logs/packager-error.log` | 错误日志 |

日志文件最大 5MB，保留最近 5 个日志文件。

## 跨平台兼容性

### Node.js 版本要求

- 推荐版本：Node.js 18.x 或更高
- 最低版本：Node.js 16.x

### 操作系统支持

| 平台 | 支持状态 | 启动方式 |
|------|----------|----------|
| Windows 10/11 | 完全支持 | start.bat / Electron |
| Linux (Ubuntu/Debian) | 完全支持 | start.sh |
| macOS 10.15+ | 完全支持 | start.sh |

### 文件编码

- Windows：GBK / UTF-8 (BOM)
- Linux/Mac：UTF-8

## 常见问题

### Q: 打包失败，提示 Node.js 版本过低

**A:** 请升级 Node.js 到 18.x 或更高版本。

### Q: 解压后无法启动

**A:** 检查以下事项：
1. 是否安装了 Node.js
2. 是否安装了依赖：`npm install`
3. 检查日志输出获取详细错误信息

### Q: 启动脚本执行报错

**A:** Windows 用户请确保使用管理员权限运行，Linux/Mac 用户请确保脚本有执行权限：
```bash
chmod +x start.sh
```

### Q: 完整性校验失败

**A:** 文件可能在传输过程中损坏，请重新下载或检查文件完整性。

## 技术栈

### 打包器
- Node.js 18+
- fs-extra：文件系统操作
- archiver：ZIP 压缩
- semver：版本控制
- winston：日志管理
- inquirer：命令行交互

### 一键启动程序
- Electron 28+
- HTML5 / CSS3
- JavaScript (ES6+)

## 开发说明

### 开发模式

```bash
# 开发打包器
cd packager
npm run dev

# 开发启动程序
cd packager/starter
npm install
npm start
```

### 构建启动程序

```bash
cd packager/starter
npm run build:win   # Windows
npm run build:linux # Linux
npm run build:mac   # macOS
```

## 许可证

MIT License

## 支持

如需支持，请联系开发团队。