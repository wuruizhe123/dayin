#!/usr/bin/env node

import path from 'path';
import inquirer from 'inquirer';
import { Packager } from './packager.js';
import { logToConsole } from './utils/logger.js';

const main = async () => {
  logToConsole('========================================', 'info');
  logToConsole('   Ziddy Packager - Professional Packing', 'info');
  logToConsole('========================================', 'info');
  logToConsole('', 'info');

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectDir',
      message: '项目目录:',
      default: process.cwd(),
      validate: (value) => {
        const fs = await import('fs');
        if (!fs.existsSync(value)) {
          return '目录不存在';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'packageName',
      message: '包名称:',
      default: 'ziddy',
      validate: (value) => {
        if (!value || value.trim() === '') {
          return '请输入包名称';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'outputDir',
      message: '输出目录:',
      default: path.join(process.cwd(), 'dist')
    },
    {
      type: 'confirm',
      name: 'includeNodeModules',
      message: '包含 node_modules?',
      default: true
    },
    {
      type: 'confirm',
      name: 'compress',
      message: '压缩打包?',
      default: true
    },
    {
      type: 'list',
      name: 'compressionLevel',
      message: '压缩级别:',
      choices: [
        { name: '低 (1)', value: 1 },
        { name: '中 (5)', value: 5 },
        { name: '高 (9)', value: 9 }
      ],
      default: 9,
      when: (answers) => answers.compress
    }
  ]);

  logToConsole('', 'info');
  logToConsole('Packaging configuration:', 'info');
  logToConsole(`  Project: ${answers.projectDir}`, 'info');
  logToConsole(`  Package Name: ${answers.packageName}`, 'info');
  logToConsole(`  Output: ${answers.outputDir}`, 'info');
  logToConsole(`  Include node_modules: ${answers.includeNodeModules}`, 'info');
  logToConsole(`  Compression: ${answers.compress ? `Yes (level ${answers.compressionLevel})` : 'No'}`, 'info');
  logToConsole('', 'info');

  const confirm = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: '确认开始打包?',
      default: true
    }
  ]);

  if (!confirm.confirm) {
    logToConsole('Packaging cancelled', 'warning');
    process.exit(0);
  }

  const packager = new Packager({
    projectDir: answers.projectDir,
    packageName: answers.packageName,
    outputDir: answers.outputDir,
    includeNodeModules: answers.includeNodeModules,
    compress: answers.compress,
    compressionLevel: answers.compressionLevel
  });

  try {
    const result = await packager.package();
    logToConsole('', 'info');
    logToConsole('========================================', 'success');
    logToConsole('   Packaging Complete!', 'success');
    logToConsole('========================================', 'success');
    logToConsole(`  Version: ${result.version}`, 'success');
    logToConsole(`  Output: ${result.outputPath}`, 'success');
    logToConsole('', 'success');
    logToConsole('Deployment Instructions:', 'info');
    logToConsole('  1. Extract the archive', 'info');
    logToConsole('  2. Double-click start.bat (Windows)', 'info');
    logToConsole('  3. Or run: chmod +x start.sh && ./start.sh (Linux/Mac)', 'info');
  } catch (error) {
    logToConsole(`Error: ${error.message}`, 'error');
    process.exit(1);
  }
};

main().catch((error) => {
  logToConsole(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});