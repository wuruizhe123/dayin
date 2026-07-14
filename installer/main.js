const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { execFile, spawn } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 550,
    resizable: false,
    maximizable: false,
    minimizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    title: 'Ziddy Installer',
    autoHideMenuBar: true
  });

  mainWindow.loadFile('index.html');
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
  const packagePath = path.join(app.getAppPath(), '../', 'package.json');
  const nodeModulesPath = path.join(app.getAppPath(), '../', 'node_modules');
  
  return {
    hasPackageJson: fs.existsSync(packagePath),
    hasNodeModules: fs.existsSync(nodeModulesPath) && fs.readdirSync(nodeModulesPath).length > 0
  };
});

ipcMain.handle('install-dependencies', async () => {
  return new Promise((resolve) => {
    const projectDir = path.join(app.getAppPath(), '../');
    
    const npmProcess = spawn('npm', ['install'], {
      cwd: projectDir,
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

ipcMain.handle('install-node', async () => {
  return new Promise((resolve) => {
    const { shell } = require('electron');
    shell.openExternal('https://nodejs.org/en/download/');
    resolve({ success: true, message: 'Opening Node.js download page...' });
  });
});

ipcMain.handle('show-dialog', async (event, options) => {
  return dialog.showMessageBox(mainWindow, options);
});

ipcMain.handle('check-installation', async () => {
  const projectDir = path.join(app.getAppPath(), '../');
  const packagePath = path.join(projectDir, 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    return { success: false, message: 'package.json not found' };
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const deps = pkg.dependencies || {};
    const devDeps = pkg.devDependencies || {};
    
    const totalDeps = Object.keys(deps).length + Object.keys(devDeps).length;
    
    return {
      success: true,
      message: `Project has ${totalDeps} dependencies`,
      dependencies: totalDeps,
      hasScripts: !!pkg.scripts
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
});