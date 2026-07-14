import inquirer from 'inquirer';
import chalk from 'chalk';
import { checkEnv } from '../utils/env.js';
import { createProjectStructure } from '../generators/projectGenerator.js';
import { installDependencies } from '../utils/install.js';
import { initGit } from '../utils/git.js';
import { ProjectConfig } from '../types/index.js';

export const initProject = async (options: {
  name?: string;
  type?: string;
  framework?: string;
  backend?: string;
  language?: string;
  git?: boolean;
  install?: boolean;
}) => {
  console.log(chalk.bold('\n🚀 欢迎使用项目初始化工具'));
  console.log(chalk.gray('================================\n'));

  const envStatus = checkEnv();
  if (!envStatus.node || !envStatus.npm) {
    console.log(chalk.red('❌ 缺少必要的开发环境'));
    console.log(chalk.yellow('请先安装 Node.js 和 npm'));
    process.exit(1);
  }

  console.log(chalk.green(`✅ Node.js: ${envStatus.node}`));
  console.log(chalk.green(`✅ npm: ${envStatus.npm}`));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: '项目名称:',
      default: options.name || 'my-project',
      validate: (value: string) => {
        if (!value || value.trim() === '') {
          return '请输入项目名称';
        }
        return true;
      },
    },
    {
      type: 'list',
      name: 'projectType',
      message: '项目类型:',
      choices: [
        { name: '前端项目 (Frontend)', value: 'frontend' },
        { name: '后端项目 (Backend)', value: 'backend' },
        { name: '全栈项目 (Fullstack)', value: 'fullstack' },
      ],
      default: options.type || 'frontend',
    },
    {
      type: 'list',
      name: 'frontendFramework',
      message: '前端框架:',
      choices: [
        { name: 'React + TypeScript', value: 'react-ts' },
        { name: 'Vue 3 + TypeScript', value: 'vue-ts' },
        { name: 'React + JavaScript', value: 'react-js' },
        { name: 'Vue 3 + JavaScript', value: 'vue-js' },
        { name: 'Angular', value: 'angular' },
      ],
      default: options.framework ? `${options.framework}-${options.language || 'ts'}` : 'react-ts',
      when: (answers: any) => answers.projectType === 'frontend' || answers.projectType === 'fullstack',
    },
    {
      type: 'list',
      name: 'backendFramework',
      message: '后端框架:',
      choices: [
        { name: 'Express + TypeScript', value: 'express-ts' },
        { name: 'NestJS', value: 'nest' },
        { name: 'Express + JavaScript', value: 'express-js' },
        { name: 'Koa + TypeScript', value: 'koa-ts' },
      ],
      default: options.backend ? `${options.backend}-${options.language || 'ts'}` : 'express-ts',
      when: (answers: any) => answers.projectType === 'backend' || answers.projectType === 'fullstack',
    },
    {
      type: 'confirm',
      name: 'initGit',
      message: '初始化Git仓库?',
      default: options.git !== undefined ? options.git : true,
    },
    {
      type: 'confirm',
      name: 'installDeps',
      message: '自动安装依赖?',
      default: options.install !== undefined ? options.install : true,
    },
  ]);

  const config: ProjectConfig = {
    projectName: answers.projectName,
    projectType: answers.projectType,
    frontendFramework: answers.frontendFramework,
    backendFramework: answers.backendFramework,
    initGit: answers.initGit,
    installDeps: answers.installDeps,
  };

  console.log(chalk.blue('\n📋 项目配置:'));
  console.log(chalk.gray(`  名称: ${config.projectName}`));
  console.log(chalk.gray(`  类型: ${config.projectType}`));
  if (config.frontendFramework) {
    console.log(chalk.gray(`  前端: ${config.frontendFramework}`));
  }
  if (config.backendFramework) {
    console.log(chalk.gray(`  后端: ${config.backendFramework}`));
  }
  console.log(chalk.gray(`  Git: ${config.initGit ? '是' : '否'}`));
  console.log(chalk.gray(`  安装依赖: ${config.installDeps ? '是' : '否'}`));

  const confirm = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: '确认以上配置并开始创建项目?',
      default: true,
    },
  ]);

  if (!confirm.confirm) {
    console.log(chalk.yellow('\n👋 已取消项目创建'));
    process.exit(0);
  }

  try {
    console.log(chalk.blue('\n📁 创建项目结构...'));
    await createProjectStructure(config);

    if (config.initGit) {
      console.log(chalk.blue('🔧 初始化Git仓库...'));
      await initGit(config.projectName);
    }

    if (config.installDeps) {
      console.log(chalk.blue('📦 安装依赖...'));
      await installDependencies(config);
    }

    console.log(chalk.green('\n🎉 项目创建成功!'));
    console.log(chalk.gray(`\n项目路径: ${process.cwd()}/${config.projectName}`));
    console.log(chalk.gray(`\n下一步:`));
    console.log(chalk.gray(`  cd ${config.projectName}`));
    
    if (config.projectType === 'frontend' || config.frontendFramework) {
      console.log(chalk.gray(`  npm run dev`));
    }
    if (config.projectType === 'backend' || config.backendFramework) {
      console.log(chalk.gray(`  npm run start:dev`));
    }
    if (config.projectType === 'fullstack') {
      console.log(chalk.gray(`  npm run dev`));
    }

  } catch (error) {
    console.log(chalk.red('\n❌ 项目创建失败:'));
    console.log(chalk.red((error as Error).message));
    process.exit(1);
  }
};