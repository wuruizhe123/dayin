# Project Starter

快速启动项目的命令行工具，支持前端、后端、全栈等多种项目类型。

## 功能特性

- 🚀 **快速初始化**：一键创建项目基础结构
- 🎨 **多种模板**：支持 React、Vue、Angular、Express、NestJS、Koa 等
- 📦 **自动安装**：自动检测并安装项目依赖
- 🔧 **环境检查**：检查 Node.js、npm、Git 等开发环境
- 📝 **版本控制**：自动初始化 Git 仓库
- ⚙️ **自定义配置**：支持命令行参数和交互式配置

## 支持的项目类型

### 前端项目
- React + TypeScript
- React + JavaScript
- Vue 3 + TypeScript
- Vue 3 + JavaScript
- Angular

### 后端项目
- Express + TypeScript
- Express + JavaScript
- NestJS
- Koa + TypeScript

### 全栈项目
- 前端 + 后端的组合模板

## 安装

```bash
# 全局安装
npm install -g project-starter

# 或者使用 npx
npx project-starter init
```

## 使用方法

### 初始化项目

**交互式模式**（推荐）：

```bash
project-starter init
```

**命令行参数模式**：

```bash
# 创建前端项目
project-starter init -n my-app -t frontend -f react -l typescript

# 创建后端项目
project-starter init -n my-api -t backend -b express -l typescript

# 创建全栈项目
project-starter init -n my-fullstack -t fullstack -f react -b nest
```

### 检查环境

```bash
project-starter check
```

### 显示帮助

```bash
project-starter help
```

## 命令选项

| 选项 | 描述 | 默认值 |
|------|------|--------|
| `-n, --name <name>` | 项目名称 | my-project |
| `-t, --type <type>` | 项目类型 | frontend |
| `-f, --framework <fw>` | 前端框架 | react |
| `-b, --backend <fw>` | 后端框架 | express |
| `-l, --language <lang>` | 语言 | typescript |
| `-g, --git` | 初始化 Git 仓库 | true |
| `-i, --install` | 自动安装依赖 | true |

## 项目结构示例

### 前端项目 (React + TypeScript)

```
my-app/
├── src/
│   ├── components/     # 组件
│   ├── pages/          # 页面
│   ├── hooks/          # 自定义 hooks
│   ├── utils/          # 工具函数
│   ├── assets/         # 静态资源
│   ├── styles/         # 样式文件
│   ├── App.tsx         # 主应用组件
│   └── main.tsx        # 入口文件
├── public/             # 公共资源
├── index.html          # HTML 模板
├── vite.config.ts      # Vite 配置
├── tsconfig.json       # TypeScript 配置
└── package.json        # 项目依赖
```

### 后端项目 (Express + TypeScript)

```
my-api/
├── src/
│   ├── controllers/    # 控制器
│   ├── services/       # 服务层
│   ├── routes/         # 路由配置
│   ├── middleware/     # 中间件
│   ├── config/         # 配置文件
│   ├── types/          # 类型定义
│   └── index.ts        # 入口文件
├── .env                # 环境变量
├── tsconfig.json       # TypeScript 配置
└── package.json        # 项目依赖
```

### 全栈项目

```
my-fullstack/
├── frontend/           # 前端代码
├── backend/            # 后端代码
├── package.json        # 根目录配置（同时启动）
└── README.md           # 项目说明
```

## 开发

```bash
# 克隆项目
git clone <repository>
cd project-starter

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 测试
npm run start
```

## 配置文件

### tsconfig.json

TypeScript 配置文件，包含路径别名、编译目标等设置。

### vite.config.ts / webpack.config.js

构建工具配置，支持热更新、代码分割等功能。

### .env

环境变量配置，包含端口号、数据库连接等敏感信息。

## 常见问题

### Q: 为什么项目创建失败？

A: 请检查以下几点：
1. 确保 Node.js 和 npm 已安装
2. 确保目标目录不存在
3. 确保有足够的文件系统权限

### Q: 如何添加新的项目模板？

A: 在 `src/generators/templates/` 目录下创建新的模板文件，并在 `projectGenerator.ts` 中添加相应的 case 分支。

### Q: 如何自定义模板内容？

A: 修改 `src/generators/templates/` 目录下的相应模板文件即可。

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 GitHub Issue
- 发送邮件至 [email]

---

**享受快速开发的乐趣！** 🚀