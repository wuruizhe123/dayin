import chalk from 'chalk';

export const showHelp = () => {
  console.log(chalk.bold('\n📖 项目初始化工具 - 使用说明'));
  console.log(chalk.gray('================================\n'));

  console.log(chalk.blue('命令列表:'));
  console.log(chalk.gray('  project-starter init       初始化新项目'));
  console.log(chalk.gray('  project-starter check      检查开发环境'));
  console.log(chalk.gray('  project-starter help       显示帮助信息'));
  console.log(chalk.gray('  project-starter --version  显示版本号\n'));

  console.log(chalk.blue('init 命令选项:'));
  console.log(chalk.gray('  -n, --name <name>         项目名称'));
  console.log(chalk.gray('  -t, --type <type>         项目类型: frontend, backend, fullstack'));
  console.log(chalk.gray('  -f, --framework <fw>      前端框架: react, vue, angular'));
  console.log(chalk.gray('  -b, --backend <fw>        后端框架: express, nest, koa'));
  console.log(chalk.gray('  -l, --language <lang>     语言: typescript, javascript'));
  console.log(chalk.gray('  -g, --git                 初始化Git仓库'));
  console.log(chalk.gray('  -i, --install             自动安装依赖\n'));

  console.log(chalk.blue('项目类型:'));
  console.log(chalk.gray('  frontend    - 纯前端项目'));
  console.log(chalk.gray('  backend     - 纯后端项目'));
  console.log(chalk.gray('  fullstack   - 全栈项目（前后端分离）\n'));

  console.log(chalk.blue('前端框架:'));
  console.log(chalk.gray('  react-ts    - React + TypeScript'));
  console.log(chalk.gray('  react-js    - React + JavaScript'));
  console.log(chalk.gray('  vue-ts      - Vue 3 + TypeScript'));
  console.log(chalk.gray('  vue-js      - Vue 3 + JavaScript'));
  console.log(chalk.gray('  angular     - Angular\n'));

  console.log(chalk.blue('后端框架:'));
  console.log(chalk.gray('  express-ts  - Express + TypeScript'));
  console.log(chalk.gray('  express-js  - Express + JavaScript'));
  console.log(chalk.gray('  nest        - NestJS'));
  console.log(chalk.gray('  koa-ts      - Koa + TypeScript\n'));

  console.log(chalk.blue('示例:'));
  console.log(chalk.gray('  project-starter init -n my-app -t frontend -f react -l typescript'));
  console.log(chalk.gray('  project-starter init -n my-api -t backend -b express -l typescript'));
  console.log(chalk.gray('  project-starter init -n my-fullstack -t fullstack -f react -b nest'));
  console.log(chalk.gray('  project-starter check\n'));

  console.log(chalk.yellow('提示: 如果不指定选项，将进入交互式配置模式\n'));
};