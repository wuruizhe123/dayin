#!/usr/bin/env node

import { Command } from 'commander';
import { initProject } from './commands/init.js';
import { showHelp } from './commands/help.js';
import { startProject } from './commands/start.js';
import { buildProject } from './commands/build.js';
import { printEnvStatus } from './utils/env.js';

const program = new Command();

program
  .name('project-starter')
  .description('快速启动项目的命令行工具')
  .version('1.0.0');

program
  .command('init')
  .description('初始化一个新项目')
  .option('-n, --name <name>', '项目名称')
  .option('-t, --type <type>', '项目类型: frontend, backend, fullstack')
  .option('-f, --framework <framework>', '前端框架: react, vue, angular')
  .option('-b, --backend <backend>', '后端框架: express, nest, koa')
  .option('-l, --language <language>', '语言: typescript, javascript')
  .option('-g, --git', '初始化Git仓库', false)
  .option('-i, --install', '自动安装依赖', false)
  .action(initProject);

program
  .command('start')
  .description('一键启动项目（在项目根目录执行）')
  .action(startProject);

program
  .command('build')
  .description('一键打包部署（生成 deploy 目录）')
  .action(buildProject);

program
  .command('check')
  .description('检查开发环境')
  .action(printEnvStatus);

program
  .command('help')
  .description('显示帮助信息')
  .action(showHelp);

program.parse(process.argv);

if (!program.args.length) {
  program.outputHelp();
}