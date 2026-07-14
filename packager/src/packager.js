import fs from 'fs-extra';
import path from 'path';
import archiver from 'archiver';
import { logger, logToConsole } from './utils/logger.js';
import { VersionManager } from './utils/version.js';
import { IntegrityChecker } from './utils/integrity.js';

export class Packager {
  constructor(options) {
    this.options = {
      projectDir: process.cwd(),
      outputDir: path.join(process.cwd(), 'dist'),
      packageName: 'app',
      version: '1.0.0',
      platform: process.platform,
      includeNodeModules: true,
      compress: true,
      compressionLevel: 9,
      exclude: ['node_modules/.cache', '.git', '*.log'],
      ...options
    };
    
    this.versionManager = new VersionManager(this.options.projectDir);
    this.integrityChecker = new IntegrityChecker();
  }

  async package() {
    try {
      logToConsole('Starting packaging process...', 'info');
      logger.info('Starting packaging process');

      await this.bumpVersion();
      await this.buildProject();
      await this.preparePackage();
      await this.generateChecksums();
      await this.createArchive();
      await this.generateStartupScripts();
      await this.generateDeploymentInfo();

      logToConsole('Packaging completed successfully!', 'success');
      logger.info('Packaging completed successfully');
      
      return {
        success: true,
        version: this.options.version,
        outputPath: this.outputPath
      };
    } catch (error) {
      logToConsole(`Packaging failed: ${error.message}`, 'error');
      logger.error(`Packaging failed: ${error.message}`);
      throw error;
    }
  }

  async bumpVersion() {
    const currentVersion = this.versionManager.getCurrentVersion();
    logToConsole(`Current version: ${currentVersion}`, 'info');
    logger.info(`Current version: ${currentVersion}`);
    
    const newVersion = this.versionManager.bumpVersion('patch');
    this.options.version = newVersion;
    
    logToConsole(`Bumped version to: ${newVersion}`, 'success');
    logger.info(`Bumped version to: ${newVersion}`);
  }

  async buildProject() {
    logToConsole('Building project...', 'info');
    logger.info('Building project');

    const packageJson = path.join(this.options.projectDir, 'package.json');
    if (!fs.existsSync(packageJson)) {
      throw new Error('package.json not found');
    }

    const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
    
    if (!pkg.scripts || !pkg.scripts.build) {
      logToConsole('No build script found, skipping build', 'warning');
      logger.warn('No build script found, skipping build');
      return;
    }

    const { execSync } = await import('child_process');
    try {
      execSync('npm run build', { 
        cwd: this.options.projectDir,
        stdio: 'inherit'
      });
      logToConsole('Build completed', 'success');
      logger.info('Build completed');
    } catch (error) {
      throw new Error(`Build failed: ${error.message}`);
    }
  }

  async preparePackage() {
    logToConsole('Preparing package directory...', 'info');
    logger.info('Preparing package directory');

    const packageDir = path.join(this.options.outputDir, 'package');
    if (fs.existsSync(packageDir)) {
      fs.removeSync(packageDir);
    }
    fs.mkdirSync(packageDir, { recursive: true });

    const distDir = path.join(this.options.projectDir, 'dist');
    if (fs.existsSync(distDir)) {
      fs.copySync(distDir, path.join(packageDir, 'dist'));
      logToConsole('Copied dist directory', 'success');
      logger.info('Copied dist directory');
    }

    const buildDir = path.join(this.options.projectDir, 'build');
    if (fs.existsSync(buildDir)) {
      fs.copySync(buildDir, path.join(packageDir, 'build'));
      logToConsole('Copied build directory', 'success');
      logger.info('Copied build directory');
    }

    if (this.options.includeNodeModules) {
      const nodeModulesDir = path.join(this.options.projectDir, 'node_modules');
      if (fs.existsSync(nodeModulesDir)) {
        fs.copySync(nodeModulesDir, path.join(packageDir, 'node_modules'), {
          filter: (src) => {
            const relative = path.relative(nodeModulesDir, src);
            return !this.options.exclude.some(pattern => 
              relative.match(new RegExp(pattern))
            );
          }
        });
        logToConsole('Copied node_modules', 'success');
        logger.info('Copied node_modules');
      }
    }

    const filesToCopy = ['package.json', 'package-lock.json', 'README.md', '.env'];
    for (const file of filesToCopy) {
      const src = path.join(this.options.projectDir, file);
      const dest = path.join(packageDir, file);
      if (fs.existsSync(src)) {
        fs.copySync(src, dest);
        logToConsole(`Copied ${file}`, 'success');
        logger.info(`Copied ${file}`);
      }
    }

    await this.copyStarterFiles(packageDir);

    this.packageDir = packageDir;
  }

  async copyStarterFiles(packageDir) {
    const starterDir = path.join(__dirname, '..', 'starter');
    
    if (fs.existsSync(starterDir)) {
      const starterFiles = ['index.html', 'renderer.js', 'style.css'];
      for (const file of starterFiles) {
        const src = path.join(starterDir, file);
        const dest = path.join(packageDir, file);
        if (fs.existsSync(src)) {
          fs.copySync(src, dest);
          logToConsole(`Copied starter ${file}`, 'success');
          logger.info(`Copied starter ${file}`);
        }
      }

      const starterAssets = path.join(starterDir, 'assets');
      if (fs.existsSync(starterAssets)) {
        fs.copySync(starterAssets, path.join(packageDir, 'assets'), { recursive: true });
        logToConsole('Copied starter assets', 'success');
        logger.info('Copied starter assets');
      }

      const starterMain = path.join(starterDir, 'main.js');
      if (fs.existsSync(starterMain)) {
        let mainContent = fs.readFileSync(starterMain, 'utf8');
        mainContent = mainContent.replace(
          /shell\.openExternal\('http:\/\/localhost:5173'\)/g,
          `shell.openExternal('http://localhost:${process.env.PORT || 5173}')`
        );
        fs.writeFileSync(path.join(packageDir, 'main.js'), mainContent);
        logToConsole('Copied starter main.js', 'success');
        logger.info('Copied starter main.js');
      }

      const starterPkg = path.join(starterDir, 'package.json');
      if (fs.existsSync(starterPkg)) {
        const pkg = JSON.parse(fs.readFileSync(starterPkg, 'utf8'));
        pkg.version = this.options.version;
        fs.writeFileSync(path.join(packageDir, 'starter-package.json'), JSON.stringify(pkg, null, 2));
        logToConsole('Copied starter package.json', 'success');
        logger.info('Copied starter package.json');
      }
    } else {
      logToConsole('Starter files not found, skipping', 'warning');
      logger.warn('Starter files not found, skipping');
    }
  }

  async generateChecksums() {
    logToConsole('Generating integrity checksums...', 'info');
    logger.info('Generating integrity checksums');

    const checksums = await this.integrityChecker.generateChecksums(
      this.packageDir,
      ['node_modules']
    );

    const checksumsFile = path.join(this.packageDir, 'checksums.json');
    fs.writeFileSync(checksumsFile, JSON.stringify(checksums, null, 2));
    
    logToConsole(`Generated checksums for ${Object.keys(checksums).length} files`, 'success');
    logger.info(`Generated checksums for ${Object.keys(checksums).length} files`);
    
    this.checksums = checksums;
  }

  async createArchive() {
    logToConsole('Creating archive...', 'info');
    logger.info('Creating archive');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveName = `${this.options.packageName}-${this.options.version}-${this.options.platform}-${timestamp}.zip`;
    this.outputPath = path.join(this.options.outputDir, archiveName);

    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(this.outputPath);
      const archive = archiver('zip', {
        zlib: { level: this.options.compressionLevel }
      });

      output.on('close', () => {
        logToConsole(`Archive created: ${archiveName} (${archive.pointer()} bytes)`, 'success');
        logger.info(`Archive created: ${archiveName} (${archive.pointer()} bytes)`);
        resolve();
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);
      archive.directory(this.packageDir, false);
      archive.finalize();
    });
  }

  async generateStartupScripts() {
    logToConsole('Generating startup scripts...', 'info');
    logger.info('Generating startup scripts');

    const packageJson = path.join(this.packageDir, 'package.json');
    let pkg = {};
    if (fs.existsSync(packageJson)) {
      pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
    }

    const startScript = pkg.scripts?.start || pkg.scripts?.dev || pkg.scripts?.preview;
    const hasDist = fs.existsSync(path.join(this.packageDir, 'dist'));

    const batContent = this.generateBatchScript(startScript, hasDist);
    const shContent = this.generateShellScript(startScript, hasDist);
    const vbsContent = this.generateVBScript(startScript, hasDist);

    fs.writeFileSync(path.join(this.packageDir, 'start.bat'), batContent);
    fs.writeFileSync(path.join(this.packageDir, 'start.sh'), shContent);
    fs.writeFileSync(path.join(this.packageDir, 'start.vbs'), vbsContent);
    fs.chmodSync(path.join(this.packageDir, 'start.sh'), 0o755);

    logToConsole('Generated startup scripts', 'success');
    logger.info('Generated startup scripts');
  }

  generateBatchScript(startScript, hasDist) {
    return `@echo off
chcp 65001 >nul
title Ziddy ${this.options.version}

echo ========================================
echo   Ziddy Document Print System
echo   Version: ${this.options.version}
echo ========================================
echo.

echo [1/3] Checking Node.js environment...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo Node.js detected: %NODE_VERSION%
echo.

echo [2/3] Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
)
echo Dependencies check passed.
echo.

echo [3/3] Starting application...
echo.
${startScript ? `call npm run ${startScript}` : hasDist ? 'call npm run preview' : 'echo ERROR: No start script found!'}

pause`;
  }

  generateShellScript(startScript, hasDist) {
    return `#!/bin/bash
set -e

export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8

echo "========================================"
echo "   Ziddy Document Print System"
echo "   Version: ${this.options.version}"
echo "========================================"
echo ""

echo "[1/3] Checking Node.js environment..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=\$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "\$(printf '%s\\n' "\$REQUIRED_VERSION" "\$NODE_VERSION" | sort -V | head -n1)" = "\$REQUIRED_VERSION" ]; then
    echo "Node.js detected: \$NODE_VERSION"
else
    echo "WARNING: Node.js version \$NODE_VERSION is below recommended \$REQUIRED_VERSION"
fi
echo ""

echo "[2/3] Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi
echo "Dependencies check passed."
echo ""

echo "[3/3] Starting application..."
echo ""
${startScript ? `npm run ${startScript}` : hasDist ? 'npm run preview' : 'echo ERROR: No start script found!'}
`;
  }

  generateVBScript(startScript, hasDist) {
    return `Set WshShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

WshShell.Run "cmd /c start.bat", 0, False`;
  }

  async generateDeploymentInfo() {
    logToConsole('Generating deployment information...', 'info');
    logger.info('Generating deployment information');

    const deploymentInfo = {
      name: this.options.packageName,
      version: this.options.version,
      platform: this.options.platform,
      buildDate: new Date().toISOString(),
      checksumCount: Object.keys(this.checksums || {}).length,
      startupScript: this.options.platform === 'win32' ? 'start.bat' : 'start.sh',
      instructions: {
        windows: 'Double-click start.bat to run',
        linux: 'Run: chmod +x start.sh && ./start.sh',
        mac: 'Run: chmod +x start.sh && ./start.sh'
      }
    };

    const infoFile = path.join(this.packageDir, 'deploy-info.json');
    fs.writeFileSync(infoFile, JSON.stringify(deploymentInfo, null, 2));

    const readmeContent = this.generateReadme(deploymentInfo);
    fs.writeFileSync(path.join(this.packageDir, 'DEPLOYMENT.md'), readmeContent);

    logToConsole('Generated deployment information', 'success');
    logger.info('Generated deployment information');
  }

  generateReadme(deploymentInfo) {
    return `# Ziddy Document Print System - Deployment Guide

## Version: ${deploymentInfo.version}

## Quick Start

### Windows
Double-click \`start.bat\` to launch the application.

### Linux / macOS
\`\`\`bash
chmod +x start.sh
./start.sh
\`\`\`

## Requirements

- Node.js 18.x or higher
- npm or yarn package manager

## Manual Installation

1. Extract the archive
2. Navigate to the extracted directory
3. Install dependencies: \`npm install\`
4. Start the application: \`npm run start\`

## Files Included

- \`dist/\` - Frontend build artifacts
- \`node_modules/\` - Project dependencies
- \`package.json\` - Project configuration
- \`start.bat\` - Windows startup script
- \`start.sh\` - Linux/macOS startup script
- \`start.vbs\` - Windows silent startup script
- \`checksums.json\` - Integrity verification checksums
- \`deploy-info.json\` - Deployment information

## Integrity Verification

To verify the integrity of the package, run:

\`\`\`bash
node -e "
const checksums = require('./checksums.json');
const crypto = require('crypto');
const fs = require('fs');

let allValid = true;
for (const [file, expected] of Object.entries(checksums)) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(file));
  const actual = hash.digest('hex');
  if (actual !== expected) {
    console.log(\`INVALID: \${file}\`);
    allValid = false;
  }
}
console.log(allValid ? 'All files verified successfully' : 'Integrity check failed');
"
\`\`\`

## Troubleshooting

### Node.js not found
Download and install Node.js from https://nodejs.org/

### Port already in use
Change the port in .env file or close the conflicting application.

### Dependencies installation failed
Try running \`npm install\` manually.

## Support

For support, please contact the development team.`;
  }
}