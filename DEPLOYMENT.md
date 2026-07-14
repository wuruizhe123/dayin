# Ziddy 部署指南

## 📋 环境要求

| 项目 | 版本要求 |
|------|---------|
| Node.js | ≥ 18.0.0 |
| npm | ≥ 9.0.0 |
| Git | ≥ 2.0.0 |

---

## 🚀 步骤一：上传到 GitHub

### 1.1 创建 GitHub 仓库

1. 登录 [GitHub](https://github.com/)
2. 点击 "New repository" 创建新仓库
3. 仓库名称建议：`ziddy`
4. 选择 "Public" 或 "Private"

### 1.2 初始化本地仓库

```bash
# 进入项目目录
cd ziddy

# 初始化 Git
git init

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/your-username/ziddy.git
```

### 1.3 更新 .gitignore

确保 `.gitignore` 包含以下内容：

```gitignore
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Dependencies
node_modules

# Build outputs
dist
dist-ssr
deploy

# Installer server logs
installer-logs

# Editor directories
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment variables
.env
.env.local
.env.*.local

# OS files
Thumbs.db

# Electron build
installer/dist
packager/dist
```

### 1.4 提交并推送

```bash
# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Ziddy Document Print System"

# 推送到 GitHub
git push -u origin main
```

---

## 🚀 步骤二：服务器部署

### 2.1 服务器环境准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js（Ubuntu/Debian）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 npm
sudo npm install -g npm@latest

# 安装 PM2（进程管理器）
sudo npm install -g pm2

# 安装 Nginx（反向代理）
sudo apt install nginx -y
```

### 2.2 克隆代码到服务器

```bash
# 创建项目目录
mkdir -p /var/www/ziddy
cd /var/www/ziddy

# 克隆代码
git clone https://github.com/your-username/ziddy.git .

# 安装依赖
npm install

# 构建项目
npm run build
```

### 2.3 配置 PM2

创建 PM2 配置文件 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [
    {
      name: 'ziddy',
      script: 'npm',
      args: 'run dev',
      cwd: '/var/www/ziddy',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5173
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/var/log/ziddy/error.log',
      out_file: '/var/log/ziddy/output.log',
      combine_logs: true
    }
  ]
};
```

启动应用：

```bash
# 创建日志目录
mkdir -p /var/log/ziddy

# 启动应用
pm2 start ecosystem.config.js

# 设置开机自启
pm2 startup systemd

# 保存当前进程状态
pm2 save
```

### 2.4 配置 Nginx 反向代理

创建 Nginx 配置文件：

```bash
sudo nano /etc/nginx/sites-available/ziddy
```

添加以下配置：

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    root /var/www/ziddy/dist;
    index index.html;

    # 前端静态文件
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理（如有后端）
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 禁止访问敏感文件
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # 日志配置
    access_log /var/log/nginx/ziddy-access.log;
    error_log /var/log/nginx/ziddy-error.log;
}
```

启用配置并重启 Nginx：

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/ziddy /etc/nginx/sites-enabled/

# 检查配置语法
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 2.5 配置 HTTPS（推荐）

使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 设置自动续期
sudo certbot renew --dry-run
```

---

## 🚀 步骤三：部署验证

### 3.1 检查服务状态

```bash
# 检查 PM2 进程
pm2 status

# 检查 Nginx 状态
sudo systemctl status nginx

# 查看日志
pm2 logs ziddy
```

### 3.2 访问验证

在浏览器中访问：
- 开发环境：`http://localhost:5173`
- 生产环境：`https://your-domain.com`

---

## 📤 一键部署脚本

创建 `deploy-to-server.sh`：

```bash
#!/bin/bash
set -e

echo "========================================"
echo "   Ziddy Deployment Script"
echo "========================================"

# 配置
REPO_URL="https://github.com/your-username/ziddy.git"
PROJECT_DIR="/var/www/ziddy"
DOMAIN="your-domain.com"

# 1. 更新代码
echo ""
echo "[1/5] Pulling latest code..."
cd $PROJECT_DIR
git pull origin main

# 2. 安装依赖
echo ""
echo "[2/5] Installing dependencies..."
npm install

# 3. 构建项目
echo ""
echo "[3/5] Building project..."
npm run build

# 4. 重启 PM2
echo ""
echo "[4/5] Restarting PM2..."
pm2 restart ziddy

# 5. 验证
echo ""
echo "[5/5] Verifying deployment..."
sleep 3
pm2 status

echo ""
echo "========================================"
echo "   Deployment Complete!"
echo "========================================"
echo ""
echo "Your app is running at: https://$DOMAIN"
echo ""
```

使用方法：

```bash
chmod +x deploy-to-server.sh
./deploy-to-server.sh
```

---

## ⚠️ 注意事项

### 安全建议

1. **不要上传敏感信息**：确保 `.env` 文件包含在 `.gitignore` 中
2. **使用 HTTPS**：生产环境务必配置 SSL 证书
3. **限制文件权限**：设置正确的文件权限，避免安全风险
4. **定期更新**：定期更新依赖和系统

### 常见问题

**Q1: 构建失败怎么办？**
```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules 重新安装
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Q2: PM2 进程崩溃？**
```bash
# 查看错误日志
pm2 logs ziddy --lines 100

# 手动重启
pm2 restart ziddy
```

**Q3: Nginx 无法启动？**
```bash
# 检查配置语法
nginx -t

# 查看错误日志
cat /var/log/nginx/error.log
```

**Q4: 静态资源加载失败？**
- 确保 `vite.config.ts` 中的 `base` 配置正确
- 检查 Nginx 配置中的 `root` 路径

---

## 📁 部署文件结构

```
/var/www/ziddy/
├── src/                      # 源码
├── dist/                     # 构建产物（自动生成）
├── node_modules/             # 依赖（自动安装）
├── ecosystem.config.js       # PM2 配置
├── package.json              # 项目配置
└── deploy-to-server.sh       # 部署脚本

/var/log/
├── ziddy/                    # PM2 日志
│   ├── error.log
│   └── output.log
└── nginx/                    # Nginx 日志
    ├── ziddy-access.log
    └── ziddy-error.log
```

---

## 📞 技术支持

如果遇到问题，请检查以下日志：

| 日志类型 | 路径 |
|---------|------|
| PM2 错误日志 | `/var/log/ziddy/error.log` |
| PM2 输出日志 | `/var/log/ziddy/output.log` |
| Nginx 访问日志 | `/var/log/nginx/ziddy-access.log` |
| Nginx 错误日志 | `/var/log/nginx/ziddy-error.log` |

---

## 🐳 方法二：Docker 容器化部署

### 方式 A：本地构建 + 部署

#### 1. 创建 Dockerfile

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# 运行阶段
FROM nginx:1.25-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 2. 创建 Nginx 配置文件 `nginx.conf`

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;

        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

#### 3. 构建镜像

```bash
docker build -t ziddy:latest .
```

#### 4. 运行容器

```bash
docker run -d \
  --name ziddy \
  -p 80:80 \
  --restart=always \
  ziddy:latest
```

### 方式 B：Docker Compose 部署

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  ziddy:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    restart: always
    container_name: ziddy
    networks:
      - ziddy-network

networks:
  ziddy-network:
    driver: bridge
```

启动服务：

```bash
docker-compose up -d
```

### 方式 C：使用 Docker Hub 镜像

```bash
# 推送镜像到 Docker Hub
docker tag ziddy:latest your-username/ziddy:latest
docker push your-username/ziddy:latest

# 在服务器上拉取并运行
docker pull your-username/ziddy:latest
docker run -d -p 80:80 --restart=always your-username/ziddy:latest
```

---

## ☁️ 方法三：使用 PaaS 平台部署

### 3.1 Vercel（推荐）

1. 访问 [Vercel](https://vercel.com/)
2. 登录并点击 "New Project"
3. 选择 GitHub 仓库 `ziddy`
4. 配置构建命令：
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. 点击 "Deploy"

### 3.2 Netlify

1. 访问 [Netlify](https://www.netlify.com/)
2. 登录并点击 "Add new site" → "Import an existing project"
3. 选择 GitHub 仓库
4. 配置：
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. 点击 "Deploy site"

### 3.3 Cloudflare Pages

1. 访问 [Cloudflare Pages](https://pages.cloudflare.com/)
2. 登录并点击 "Create a project"
3. 选择 GitHub 仓库
4. 配置：
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. 点击 "Save and Deploy"

### 3.4 GitHub Pages

由于这是 React + Vite 项目，需要配置静态导出：

1. 安装 gh-pages：
   ```bash
   npm install gh-pages --save-dev
   ```

2. 更新 `package.json`：
   ```json
   {
     "scripts": {
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://your-username.github.io/ziddy"
   }
   ```

3. 更新 `vite.config.ts`：
   ```typescript
   import { defineConfig } from 'vite'
   
   export default defineConfig({
     base: '/ziddy/'
   })
   ```

4. 部署：
   ```bash
   npm run build
   npm run deploy
   ```

---

## 🧱 方法四：宝塔面板部署（国内服务器推荐）

### 4.1 安装宝塔面板

```bash
# CentOS
yum install -y wget && wget -O install.sh https://download.bt.cn/install/install_6.0.sh && sh install.sh ed8484bec

# Ubuntu/Debian
wget -O install.sh https://download.bt.cn/install/install-ubuntu_6.0.sh && sudo bash install.sh ed8484bec
```

### 4.2 部署步骤

1. 打开宝塔面板（默认端口 8888）
2. 点击左侧 "网站" → "添加站点"
3. 填写域名和根目录（指向 `dist` 目录）
4. 点击 "设置" → "SSL" → "申请 Let's Encrypt 证书"
5. 点击 "设置" → "伪静态" → 添加：
   ```
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```

### 4.3 使用 PM2 管理器

1. 点击左侧 "软件商店" → 安装 "PM2 管理器"
2. 点击 "PM2 管理器" → "添加项目"
3. 填写项目名称、启动文件（`npm`）、运行目录
4. 启动命令：`run dev`

---

## 🤖 方法五：GitHub Actions 自动化部署

### 5.1 部署到 VPS（SSH 方式）

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to VPS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Deploy to VPS
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USERNAME }}
          password: ${{ secrets.VPS_PASSWORD }}
          source: 'dist'
          target: '/var/www/ziddy'

      - name: Restart PM2
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USERNAME }}
          password: ${{ secrets.VPS_PASSWORD }}
          script: |
            pm2 restart ziddy
```

### 5.2 在 GitHub Secrets 中配置

| 名称 | 说明 |
|------|------|
| `VPS_HOST` | VPS 服务器 IP |
| `VPS_USERNAME` | SSH 用户名 |
| `VPS_PASSWORD` | SSH 密码 |

### 5.3 部署到 Docker Hub

创建 `.github/workflows/docker.yml`：

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/ziddy:latest
```

---

## 🔄 方法六：使用 rsync 同步部署

```bash
#!/bin/bash

# 配置
LOCAL_DIR="/path/to/ziddy/dist"
REMOTE_USER="your-username"
REMOTE_HOST="your-server-ip"
REMOTE_DIR="/var/www/ziddy/dist"

# 构建项目
npm run build

# 同步文件
rsync -avz --delete \
  $LOCAL_DIR/ \
  $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/

# 重启服务
ssh $REMOTE_USER@$REMOTE_HOST "pm2 restart ziddy"

echo "Deployment complete!"
```

---

## 📊 部署方式对比

| 方式 | 难度 | 成本 | 适用场景 |
|------|------|------|---------|
| 手动部署（PM2 + Nginx） | 中等 | 低 | 个人项目、小型团队 |
| Docker 容器化 | 中等 | 低 | 生产环境、多环境部署 |
| Docker Compose | 中等 | 低 | 多容器项目、开发环境 |
| Vercel/Netlify | 简单 | 免费/低 | 个人项目、快速上线 |
| Cloudflare Pages | 简单 | 免费/低 | 全球加速、高可用 |
| GitHub Pages | 简单 | 免费 | 静态网站、开源项目 |
| 宝塔面板 | 简单 | 低 | 国内服务器、运维新手 |
| GitHub Actions | 中等 | 低 | 自动化部署、CI/CD |

---

## 🎯 推荐方案

### 方案选择指南

| 场景 | 推荐方式 |
|------|---------|
| 个人项目、快速上线 | **Vercel / Netlify** |
| 需要全球加速 | **Cloudflare Pages** |
| 开源项目展示 | **GitHub Pages** |
| 生产环境、自有服务器 | **Docker + Nginx** |
| 国内服务器、运维新手 | **宝塔面板** |
| 需要自动化部署 | **GitHub Actions** |

---

**最后更新**: 2026-07-14