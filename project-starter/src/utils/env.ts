import shell from 'shelljs';
import chalk from 'chalk';
import { EnvStatus } from '../types';

export const checkEnv = (): EnvStatus => {
  const nodeVersion = shell.exec('node --version', { silent: true }).stdout.trim();
  const npmVersion = shell.exec('npm --version', { silent: true }).stdout.trim();
  const gitVersion = shell.exec('git --version', { silent: true }).stdout.trim();
  const tsVersion = shell.exec('tsc --version', { silent: true }).stdout.trim();

  return {
    node: nodeVersion ? nodeVersion.replace('v', '') : null,
    npm: npmVersion || null,
    git: gitVersion ? (gitVersion.split(' ').pop() || null) : null,
    typescript: tsVersion ? (tsVersion.split(' ').pop() || null) : null,
  };
};

export const printEnvStatus = () => {
  const status = checkEnv();

  console.log(chalk.bold('\n📦 开发环境检查'));
  console.log(chalk.gray('===================\n'));

  if (status.node) {
    console.log(chalk.green(`✅ Node.js: ${status.node}`));
  } else {
    console.log(chalk.red('❌ Node.js: 未安装'));
  }

  if (status.npm) {
    console.log(chalk.green(`✅ npm: ${status.npm}`));
  } else {
    console.log(chalk.red('❌ npm: 未安装'));
  }

  if (status.git) {
    console.log(chalk.green(`✅ Git: ${status.git}`));
  } else {
    console.log(chalk.yellow('⚠️  Git: 未安装（可选）'));
  }

  if (status.typescript) {
    console.log(chalk.green(`✅ TypeScript: ${status.typescript}`));
  } else {
    console.log(chalk.yellow('⚠️  TypeScript: 未安装（可选）'));
  }

  console.log('\n');

  if (!status.node || !status.npm) {
    console.log(chalk.red('\n❌ 缺少必要的开发环境，请先安装 Node.js 和 npm'));
    console.log(chalk.blue('下载地址: https://nodejs.org/\n'));
    process.exit(1);
  }
};