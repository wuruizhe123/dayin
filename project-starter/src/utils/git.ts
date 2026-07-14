import shell from 'shelljs';
import chalk from 'chalk';

export const initGit = async (projectName: string): Promise<void> => {
  const projectPath = `${process.cwd()}/${projectName}`;
  
  const result = shell.exec(`cd ${projectPath} && git init`, { silent: true });
  
  if (result.code !== 0) {
    throw new Error('Git仓库初始化失败');
  }

  const gitignoreContent = `node_modules/
dist/
build/
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
.idea/
.vscode/
*.log`;

  shell.ShellString(gitignoreContent).to(`${projectPath}/.gitignore`);

  shell.exec(`cd ${projectPath} && git add .`, { silent: true });
  shell.exec(`cd ${projectPath} && git commit -m "Initial commit"`, { silent: true });

  console.log(chalk.green('✅ Git仓库初始化成功'));
};

export const checkGit = (): boolean => {
  const result = shell.exec('git --version', { silent: true });
  return result.code === 0;
};