const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec, execFile, spawn } = require('child_process');
const crypto = require('crypto');

let mainWindow;
let appProcess = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 500,
    resizable: false,
    maximizable: false,
    minimizable: true,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    title: 'Ziddy Document Print System'
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    if (appProcess) {
      appProcess.kill();
    }
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.handle('check-node', async () => {
  return new Promise((resolve) => {
    execFile('node', ['--version'], (error, stdout) => {
      if (error) {
        resolve({ installed: false, version: null });
      } else {
        resolve({ installed: true, version: stdout.trim() });
      }
    });
  });
});

ipcMain.handle('check-npm', async () => {
  return new Promise((resolve) => {
    execFile('npm', ['--version'], (error, stdout) => {
      if (error) {
        resolve({ installed: false, version: null });
      } else {
        resolve({ installed: true, version: stdout.trim() });
      }
    });
  });
});

ipcMain.handle('check-dependencies', async () => {
  const packagePath = path.join(__dirname, 'package.json');
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  
  if (!fs.existsSync(packagePath)) {
    return { hasPackageJson: false, hasNodeModules: false };
  }
  
  return {
    hasPackageJson: true,
    hasNodeModules: fs.existsSync(nodeModulesPath) && fs.readdirSync(nodeModulesPath).length > 0
  };
});

ipcMain.handle('install-dependencies', async () => {
  return new Promise((resolve) => {
    const npmProcess = spawn('npm', ['install'], {
      cwd: __dirname,
      stdio: 'pipe'
    });

    let output = '';
    
    npmProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    npmProcess.stderr.on('data', (data) => {
      output += data.toString();
    });

    npmProcess.on('close', (code) => {
      resolve({
        success: code === 0,
        code,
        output
      });
    });

    npmProcess.on('error', (error) => {
      resolve({
        success: false,
        code: -1,
        output: error.message
      });
    });
  });
});

ipcMain.handle('start-application', async () => {
  return new Promise((resolve) => {
    const packagePath = path.join(__dirname, 'package.json');
    let startScript = 'start';
    
    if (fs.existsSync(packagePath)) {
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      if (pkg.scripts) {
        if (pkg.scripts.start) startScript = 'start';
        else if (pkg.scripts.dev) startScript = 'dev';
        else if (pkg.scripts.preview) startScript = 'preview';
      }
    }

    appProcess = spawn('npm', ['run', startScript], {
      cwd: __dirname,
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'production' }
    });

    let output = '';
    let hasStarted = false;

    appProcess.stdout.on('data', (data) => {
      const str = data.toString();
      output += str;
      
      if (!hasStarted && (str.includes('running') || str.includes('listening') || str.includes('started') || str.includes('localhost'))) {
        hasStarted = true;
        resolve({ success: true, output });
      }
    });

    appProcess.stderr.on('data', (data) => {
      output += data.toString();
    });

    appProcess.on('close', (code) => {
      if (!hasStarted) {
        resolve({
          success: code === 0,
          code,
          output
        });
      }
    });

    appProcess.on('error', (error) => {
      resolve({
        success: false,
        code: -1,
        output: error.message
      });
    });

    setTimeout(() => {
      if (!hasStarted) {
        resolve({ success: true, output: 'Application started (timeout)' });
      }
    }, 10000);
  });
});

ipcMain.handle('verify-integrity', async () => {
  const checksumsPath = path.join(__dirname, 'checksums.json');
  
  if (!fs.existsSync(checksumsPath)) {
    return { success: false, message: 'checksums.json not found' };
  }

  try {
    const checksums = JSON.parse(fs.readFileSync(checksumsPath, 'utf8'));
    const results = { valid: [], invalid: [], missing: [] };

    for (const [file, expected] of Object.entries(checksums)) {
      const filePath = path.join(__dirname, file);
      
      if (!fs.existsSync(filePath)) {
        results.missing.push(file);
        continue;
      }

      const hash = crypto.createHash('sha256');
      hash.update(fs.readFileSync(filePath));
      const actual = hash.digest('hex');

      if (actual === expected) {
        results.valid.push(file);
      } else {
        results.invalid.push(file);
      }
    }

    const allValid = results.invalid.length === 0 && results.missing.length === 0;
    return {
      success: allValid,
      message: allValid ? 'All files verified successfully' : `Integrity check failed: ${results.invalid.length} invalid, ${results.missing.length} missing`,
      results
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('open-browser', async () => {
  shell.openExternal('http://localhost:5173');
});

ipcMain.handle('show-dialog', async (event, options) => {
  return dialog.showMessageBox(mainWindow, options);
});

ipcMain.handle('get-deploy-info', async () => {
  const deployInfoPath = path.join(__dirname, 'deploy-info.json');
  
  if (fs.existsSync(deployInfoPath)) {
    return JSON.parse(fs.readFileSync(deployInfoPath, 'utf8'));
  }
  
  return null;
});

ipcMain.handle('kill-process', async () => {
  if (appProcess) {
    appProcess.kill();
    appProcess = null;
    return { success: true };
  }
  return { success: false };
});