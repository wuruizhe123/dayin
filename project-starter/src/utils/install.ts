import shell from 'shelljs';
import chalk from 'chalk';
import { ProjectConfig } from '../types';

export const installDependencies = async (config: ProjectConfig): Promise<void> => {
  const projectPath = `${process.cwd()}/${config.projectName}`;

  if (config.projectType === 'frontend' || config.frontendFramework) {
    console.log(chalk.gray('  ├─ 安装前端依赖...'));
    const frontendPath = config.projectType === 'fullstack' 
      ? `${projectPath}/frontend` 
      : projectPath;
    
    const result = shell.exec(`cd ${frontendPath} && npm install`, { silent: true });
    
    if (result.code !== 0) {
      throw new Error(`前端依赖安装失败: ${result.stderr}`);
    }
    console.log(chalk.green('  └─ ✅ 前端依赖安装成功'));
  }

  if (config.projectType === 'backend' || config.backendFramework) {
    console.log(chalk.gray('  ├─ 安装后端依赖...'));
    const backendPath = config.projectType === 'fullstack' 
      ? `${projectPath}/backend` 
      : projectPath;
    
    const result = shell.exec(`cd ${backendPath} && npm install`, { silent: true });
    
    if (result.code !== 0) {
      throw new Error(`后端依赖安装失败: ${result.stderr}`);
    }
    console.log(chalk.green('  └─ ✅ 后端依赖安装成功'));
  }

  if (config.projectType === 'fullstack') {
    console.log(chalk.gray('  ├─ 安装根目录依赖...'));
    const result = shell.exec(`cd ${projectPath} && npm install`, { silent: true });
    
    if (result.code !== 0) {
      throw new Error(`根目录依赖安装失败: ${result.stderr}`);
    }
    console.log(chalk.green('  └─ ✅ 根目录依赖安装成功'));
  }
};

export const installGlobalPackage = async (packageName: string): Promise<void> => {
  const result = shell.exec(`npm install -g ${packageName}`, { silent: true });
  
  if (result.code !== 0) {
    throw new Error(`全局依赖安装失败: ${packageName}`);
  }
};