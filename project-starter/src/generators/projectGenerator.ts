import shell from 'shelljs';
import { ProjectConfig } from '../types/index.js';
import { generateReactTsTemplate } from './templates/reactTs.js';
import { generateVueTsTemplate } from './templates/vueTs.js';
import { generateReactJsTemplate } from './templates/reactJs.js';
import { generateVueJsTemplate } from './templates/vueJs.js';
import { generateAngularTemplate } from './templates/angular.js';
import { generateExpressTsTemplate } from './templates/expressTs.js';
import { generateExpressJsTemplate } from './templates/expressJs.js';
import { generateNestTemplate } from './templates/nest.js';
import { generateKoaTsTemplate } from './templates/koaTs.js';

export const createProjectStructure = async (config: ProjectConfig): Promise<void> => {
  const projectPath = `${process.cwd()}/${config.projectName}`;

  if (shell.test('-d', projectPath)) {
    throw new Error(`目录 ${projectPath} 已存在`);
  }

  shell.mkdir('-p', projectPath);

  if (config.projectType === 'frontend') {
    await generateFrontendProject(projectPath, config.frontendFramework || 'react-ts');
  } else if (config.projectType === 'backend') {
    await generateBackendProject(projectPath, config.backendFramework || 'express-ts');
  } else if (config.projectType === 'fullstack') {
    await generateFullstackProject(projectPath, config);
  }
};

const generateFrontendProject = async (projectPath: string, framework: string): Promise<void> => {
  switch (framework) {
    case 'react-ts':
      await generateReactTsTemplate(projectPath);
      break;
    case 'react-js':
      await generateReactJsTemplate(projectPath);
      break;
    case 'vue-ts':
      await generateVueTsTemplate(projectPath);
      break;
    case 'vue-js':
      await generateVueJsTemplate(projectPath);
      break;
    case 'angular':
      await generateAngularTemplate(projectPath);
      break;
    default:
      throw new Error(`不支持的前端框架: ${framework}`);
  }
};

const generateBackendProject = async (projectPath: string, framework: string): Promise<void> => {
  switch (framework) {
    case 'express-ts':
      await generateExpressTsTemplate(projectPath);
      break;
    case 'express-js':
      await generateExpressJsTemplate(projectPath);
      break;
    case 'nest':
      await generateNestTemplate(projectPath);
      break;
    case 'koa-ts':
      await generateKoaTsTemplate(projectPath);
      break;
    default:
      throw new Error(`不支持的后端框架: ${framework}`);
  }
};

const generateFullstackProject = async (projectPath: string, config: ProjectConfig): Promise<void> => {
  const frontendPath = `${projectPath}/frontend`;
  const backendPath = `${projectPath}/backend`;

  shell.mkdir('-p', frontendPath);
  shell.mkdir('-p', backendPath);

  if (config.frontendFramework) {
    await generateFrontendProject(frontendPath, config.frontendFramework);
  }

  if (config.backendFramework) {
    await generateBackendProject(backendPath, config.backendFramework);
  }

  const rootPackageJson = {
    "name": config.projectName,
    "version": "1.0.0",
    "description": "Fullstack project",
    "scripts": {
      "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
      "dev:frontend": "cd frontend && npm run dev",
      "dev:backend": "cd backend && npm run start:dev",
      "build": "npm run build:frontend && npm run build:backend",
      "build:frontend": "cd frontend && npm run build",
      "build:backend": "cd backend && npm run build",
      "start": "cd backend && npm run start"
    },
    "devDependencies": {
      "concurrently": "^8.2.2"
    }
  };

  shell.ShellString(JSON.stringify(rootPackageJson, null, 2)).to(`${projectPath}/package.json`);

  const readmeContent = `# ${config.projectName}

全栈项目模板

## 项目结构

\`\`\`
.
├── frontend/    # 前端代码
├── backend/     # 后端代码
└── package.json # 根目录配置
\`\`\`

## 开发

\`\`\`bash
npm run dev          # 同时启动前后端
npm run dev:frontend # 只启动前端
npm run dev:backend  # 只启动后端
\`\`\`

## 构建

\`\`\`bash
npm run build
\`\`\`

## 生产环境

\`\`\`bash
npm start
\`\`\``;

  shell.ShellString(readmeContent).to(`${projectPath}/README.md`);
};