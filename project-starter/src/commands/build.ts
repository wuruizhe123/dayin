import chalk from 'chalk';
import shell from 'shelljs';
import * as path from 'path';

export const buildProject = async () => {
  console.log(chalk.bold('\n📦 一键打包部署'));
  console.log(chalk.gray('==================\n'));

  const currentDir = process.cwd();
  const packageJsonPath = path.join(currentDir, 'package.json');

  if (!shell.test('-f', packageJsonPath)) {
    console.log(chalk.red('❌ 未找到 package.json，请在项目根目录执行此命令'));
    process.exit(1);
  }

  let packageJson: any;
  try {
    packageJson = JSON.parse(shell.cat(packageJsonPath).toString());
  } catch {
    console.log(chalk.red('❌ package.json 解析失败'));
    process.exit(1);
  }

  const scripts = packageJson.scripts || {};
  const projectType = detectProjectType(packageJson);

  console.log(chalk.blue(`📁 项目名称: ${packageJson.name || '未知'}`));
  console.log(chalk.blue(`🔧 项目类型: ${projectType}`));
  console.log('');

  const deployDir = path.join(currentDir, 'deploy');
  if (shell.test('-d', deployDir)) {
    shell.rm('-rf', deployDir);
    console.log(chalk.gray('🗑️  清理旧部署目录'));
  }
  shell.mkdir('-p', deployDir);

  if (!scripts.build) {
    console.log(chalk.yellow('⚠️  未找到 build 脚本，跳过构建步骤'));
  } else {
    console.log(chalk.blue('🔨 执行构建...'));
    const buildResult = shell.exec('npm run build', { silent: true });
    
    if (buildResult.code !== 0) {
      console.log(chalk.red('❌ 构建失败:'));
      console.log(chalk.red(buildResult.stderr || buildResult.stdout));
      process.exit(1);
    }
    console.log(chalk.green('✅ 构建成功'));
  }

  console.log(chalk.blue('📋 复制部署文件...'));

  if (shell.test('-d', path.join(currentDir, 'dist'))) {
    shell.cp('-R', path.join(currentDir, 'dist'), deployDir);
    console.log(chalk.green('   ✅ 复制 dist/'));
  }

  if (shell.test('-d', path.join(currentDir, 'build'))) {
    shell.cp('-R', path.join(currentDir, 'build'), deployDir);
    console.log(chalk.green('   ✅ 复制 build/'));
  }

  if (shell.test('-f', packageJsonPath)) {
    shell.cp(packageJsonPath, deployDir);
    console.log(chalk.green('   ✅ 复制 package.json'));
  }

  const packageLockPath = path.join(currentDir, 'package-lock.json');
  if (shell.test('-f', packageLockPath)) {
    shell.cp(packageLockPath, deployDir);
    console.log(chalk.green('   ✅ 复制 package-lock.json'));
  }

  const yarnLockPath = path.join(currentDir, 'yarn.lock');
  if (shell.test('-f', yarnLockPath)) {
    shell.cp(yarnLockPath, deployDir);
    console.log(chalk.green('   ✅ 复制 yarn.lock'));
  }

  const pnpmLockPath = path.join(currentDir, 'pnpm-lock.yaml');
  if (shell.test('-f', pnpmLockPath)) {
    shell.cp(pnpmLockPath, deployDir);
    console.log(chalk.green('   ✅ 复制 pnpm-lock.yaml'));
  }

  const envExamplePath = path.join(currentDir, '.env.example');
  if (shell.test('-f', envExamplePath)) {
    shell.cp(envExamplePath, deployDir);
    console.log(chalk.green('   ✅ 复制 .env.example'));
  }

  const envPath = path.join(currentDir, '.env');
  if (shell.test('-f', envPath)) {
    shell.cp(envPath, deployDir);
    console.log(chalk.green('   ✅ 复制 .env'));
  }

  if (projectType === '后端项目' || projectType === '全栈项目') {
    const srcDir = path.join(currentDir, 'src');
    const apiDir = path.join(currentDir, 'api');
    
    if (shell.test('-d', srcDir)) {
      shell.cp('-R', srcDir, deployDir);
      console.log(chalk.green('   ✅ 复制 src/'));
    }
    
    if (shell.test('-d', apiDir)) {
      shell.cp('-R', apiDir, deployDir);
      console.log(chalk.green('   ✅ 复制 api/'));
    }

    const tsconfigPath = path.join(currentDir, 'tsconfig.json');
    if (shell.test('-f', tsconfigPath)) {
      shell.cp(tsconfigPath, deployDir);
      console.log(chalk.green('   ✅ 复制 tsconfig.json'));
    }
  }

  const dockerFilePath = path.join(currentDir, 'Dockerfile');
  if (shell.test('-f', dockerFilePath)) {
    shell.cp(dockerFilePath, deployDir);
    console.log(chalk.green('   ✅ 复制 Dockerfile'));
  }

  const composeFilePath = path.join(currentDir, 'docker-compose.yml');
  if (shell.test('-f', composeFilePath)) {
    shell.cp(composeFilePath, deployDir);
    console.log(chalk.green('   ✅ 复制 docker-compose.yml'));
  }

  const readmePath = path.join(currentDir, 'README.md');
  if (shell.test('-f', readmePath)) {
    shell.cp(readmePath, deployDir);
    console.log(chalk.green('   ✅ 复制 README.md'));
  }

  generateDeployScript(deployDir, projectType);

  console.log('\n' + chalk.green('🎉 打包完成!'));
  console.log(chalk.gray(`\n部署目录: ${deployDir}`));
  console.log(chalk.gray('\n部署步骤:'));
  console.log(chalk.gray(`  cd ${path.basename(deployDir)}`));
  console.log(chalk.gray(`  npm install`));
  
  if (projectType === '前端项目') {
    console.log(chalk.gray(`  npm run start   # 或使用静态服务器`));
  } else {
    console.log(chalk.gray(`  npm run start`));
  }
  
  console.log(chalk.gray('\n或者使用一键部署脚本:'));
  console.log(chalk.gray(`  windows: deploy.bat`));
  console.log(chalk.gray(`  linux/mac: deploy.sh`));
};

const detectProjectType = (packageJson: any): string => {
  const dependencies = packageJson.dependencies || {};

  if (dependencies['react'] || dependencies['vue'] || dependencies['@angular/core']) {
    if (dependencies['express'] || dependencies['@nestjs/core'] || dependencies['koa']) {
      return '全栈项目';
    }
    return '前端项目';
  }

  if (dependencies['express'] || dependencies['@nestjs/core'] || dependencies['koa']) {
    return '后端项目';
  }

  return '未知项目类型';
};

const generateDeployScript = (deployDir: string, projectType: string) => {
  const batContent = `@echo off
echo ========================================
echo  一键部署脚本
echo ========================================
echo.

echo [1/3] 安装依赖...
call npm install
if %errorlevel% neq 0 (
    echo 依赖安装失败!
    pause
    exit /b 1
)
echo 依赖安装成功!
echo.

echo [2/3] 构建项目...
call npm run build
if %errorlevel% neq 0 (
    echo 构建失败!
    pause
    exit /b 1
)
echo 构建成功!
echo.

echo [3/3] 启动项目...
${projectType === '前端项目' ? 'call npm run preview' : 'call npm run start'}
pause`;

  const shContent = `#!/bin/bash
set -e

echo "========================================"
echo "  一键部署脚本"
echo "========================================"
echo ""

echo "[1/3] 安装依赖..."
npm install
echo "依赖安装成功!"
echo ""

echo "[2/3] 构建项目..."
npm run build
echo "构建成功!"
echo ""

echo "[3/3] 启动项目..."
${projectType === '前端项目' ? 'npm run preview' : 'npm run start'}`;

  shell.ShellString(batContent).to(path.join(deployDir, 'deploy.bat'));
  shell.ShellString(shContent).to(path.join(deployDir, 'deploy.sh'));
  
  shell.chmod('+x', path.join(deployDir, 'deploy.sh'));
  
  console.log(chalk.green('   ✅ 生成 deploy.bat'));
  console.log(chalk.green('   ✅ 生成 deploy.sh'));
};