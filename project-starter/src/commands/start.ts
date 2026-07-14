import chalk from 'chalk';
import shell from 'shelljs';
import * as path from 'path';

export const startProject = async () => {
  console.log(chalk.bold('\n🚀 一键启动项目'));
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
  console.log(chalk.blue(`📝 可用脚本:`));
  Object.keys(scripts).forEach((script) => {
    console.log(chalk.gray(`   - ${script}`));
  });
  console.log('');

  const startScript = getStartScript(scripts, projectType);
  
  if (!startScript) {
    console.log(chalk.yellow('⚠️  未找到合适的启动脚本'));
    console.log(chalk.gray('可用脚本:'));
    Object.keys(scripts).forEach((script) => {
      console.log(chalk.gray(`  npm run ${script}`));
    });
    process.exit(1);
  }

  console.log(chalk.green(`▶️  启动命令: npm run ${startScript}`));
  console.log(chalk.gray('================================\n'));

  const result = shell.exec(`npm run ${startScript}`, { async: true });
  
  result.stdout?.on('data', (data: string) => {
    console.log(chalk.gray(data));
  });
  
  result.stderr?.on('data', (data: string) => {
    console.log(chalk.red(data));
  });
  
  result.on('close', (code: number) => {
    if (code !== 0) {
      console.log(chalk.red(`\n❌ 项目启动失败，退出码: ${code}`));
      process.exit(code);
    }
  });
};

const detectProjectType = (packageJson: any): string => {
  const dependencies = packageJson.dependencies || {};
  const devDependencies = packageJson.devDependencies || {};

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

const getStartScript = (scripts: Record<string, string>, projectType: string): string | null => {
  const priorityOrder = [
    'dev',
    'start:dev',
    'start',
    'serve',
    'develop',
    'watch',
  ];

  for (const script of priorityOrder) {
    if (scripts[script]) {
      return script;
    }
  }

  if (projectType === '前端项目') {
    if (scripts['vite'] || scripts['webpack-dev-server']) {
      return scripts['vite'] ? 'vite' : 'webpack-dev-server';
    }
  }

  return null;
};