const { ipcRenderer } = require('electron');

let scanResults = {
  node: null,
  npm: null,
  deps: null
};

function updateStatus(id, status, value, actionText, actionEnabled, actionClass) {
  const card = document.getElementById(`${id}-card`);
  const icon = document.getElementById(`${id}-icon`);
  const valueEl = document.getElementById(`${id}-value`);
  const actionBtn = document.getElementById(`${id}-action`);

  card.className = `status-card ${status}`;
  icon.className = `status-icon ${status}`;
  icon.textContent = status === 'success' ? '✓' : status === 'error' ? '✗' : status === 'warning' ? '!' : '?';
  valueEl.textContent = value;
  
  actionBtn.textContent = actionText;
  actionBtn.disabled = !actionEnabled;
  actionBtn.className = `action-btn ${actionClass}`;
}

function addLog(message, type = 'info') {
  const logContent = document.getElementById('log-content');
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  
  const timestamp = new Date().toLocaleTimeString();
  entry.innerHTML = `<span>[${timestamp}]</span> ${message}`;
  
  logContent.appendChild(entry);
  logContent.scrollTop = logContent.scrollHeight;
}

function clearLog() {
  document.getElementById('log-content').innerHTML = '';
}

function updateProgress(percent, text) {
  document.getElementById('progress-fill').style.width = `${percent}%`;
  document.getElementById('progress-text').textContent = text;
}

function updateInstallAllButton() {
  const hasMissing = !scanResults.node?.installed || !scanResults.npm?.installed || !scanResults.deps?.hasNodeModules;
  const installAllBtn = document.getElementById('install-all-btn');
  
  if (hasMissing) {
    installAllBtn.disabled = false;
    installAllBtn.textContent = '📦 Install All Missing';
  } else {
    installAllBtn.disabled = true;
    installAllBtn.textContent = '✓ All Dependencies Installed';
  }
}

async function scanSystem() {
  addLog('Scanning system for dependencies...', 'info');
  updateProgress(10, 'Scanning...');

  const [nodeResult, npmResult, depsResult] = await Promise.all([
    ipcRenderer.invoke('check-node'),
    ipcRenderer.invoke('check-npm'),
    ipcRenderer.invoke('check-dependencies')
  ]);

  scanResults.node = nodeResult;
  scanResults.npm = npmResult;
  scanResults.deps = depsResult;

  if (nodeResult.installed) {
    updateStatus('node', 'success', nodeResult.version, 'Installed', false, 'success');
    addLog(`Node.js detected: ${nodeResult.version}`, 'success');
  } else {
    updateStatus('node', 'error', 'Not installed', 'Install Node.js', true, 'install');
    addLog('ERROR: Node.js is not installed', 'error');
  }

  if (npmResult.installed) {
    updateStatus('npm', 'success', npmResult.version, 'Installed', false, 'success');
    addLog(`npm detected: ${npmResult.version}`, 'success');
  } else {
    updateStatus('npm', 'error', 'Not installed', 'Install npm', true, 'install');
    addLog('ERROR: npm is not installed', 'error');
  }

  if (depsResult.hasPackageJson && depsResult.hasNodeModules) {
    updateStatus('deps', 'success', 'Dependencies installed', 'Installed', false, 'success');
    addLog('Dependencies are installed', 'success');
  } else if (depsResult.hasPackageJson && !depsResult.hasNodeModules) {
    updateStatus('deps', 'warning', 'Dependencies missing', 'Install Dependencies', true, 'install');
    addLog('Dependencies not found, need to install', 'warning');
  } else {
    updateStatus('deps', 'error', 'No package.json', 'Check Project', false, 'install');
    addLog('ERROR: package.json not found', 'error');
  }

  updateInstallAllButton();
  updateProgress(100, 'Scan complete');
  addLog('System scan completed', 'info');
}

async function handleNodeAction() {
  const actionBtn = document.getElementById('node-action');
  
  if (!scanResults.node?.installed) {
    actionBtn.textContent = 'Opening download...';
    actionBtn.disabled = true;
    
    const result = await ipcRenderer.invoke('install-node');
    addLog(result.message, 'info');
    
    setTimeout(() => {
      scanSystem();
    }, 5000);
  }
}

async function handleNpmAction() {
  const actionBtn = document.getElementById('npm-action');
  
  if (!scanResults.npm?.installed) {
    actionBtn.textContent = 'Opening download...';
    actionBtn.disabled = true;
    
    const result = await ipcRenderer.invoke('install-node');
    addLog('npm is bundled with Node.js. Opening Node.js download...', 'info');
    
    setTimeout(() => {
      scanSystem();
    }, 5000);
  }
}

async function handleDepsAction() {
  const actionBtn = document.getElementById('deps-action');
  
  if (scanResults.deps?.hasPackageJson && !scanResults.deps?.hasNodeModules) {
    actionBtn.textContent = 'Installing...';
    actionBtn.disabled = true;
    actionBtn.className = 'action-btn installing';
    
    updateProgress(30, 'Installing dependencies...');
    addLog('Starting npm install...', 'info');
    
    const result = await ipcRenderer.invoke('install-dependencies');
    
    if (result.success) {
      updateStatus('deps', 'success', 'Dependencies installed', 'Installed', false, 'success');
      addLog('Dependencies installed successfully', 'success');
      updateProgress(100, 'Installation complete');
    } else {
      updateStatus('deps', 'error', 'Installation failed', 'Retry', true, 'install');
      addLog(`Failed to install dependencies: ${result.output.substring(0, 100)}`, 'error');
      updateProgress(0, 'Installation failed');
      
      await ipcRenderer.invoke('show-dialog', {
        type: 'error',
        title: 'Installation Failed',
        message: 'Failed to install dependencies',
        detail: result.output.substring(0, 500)
      });
    }
    
    updateInstallAllButton();
  }
}

async function installAll() {
  const installAllBtn = document.getElementById('install-all-btn');
  installAllBtn.disabled = true;
  installAllBtn.textContent = 'Installing...';
  
  let steps = 0;
  const totalSteps = (!scanResults.node?.installed ? 1 : 0) + (!scanResults.deps?.hasNodeModules && scanResults.deps?.hasPackageJson ? 1 : 0);
  
  if (!scanResults.node?.installed) {
    addLog('Step 1: Opening Node.js download page...', 'info');
    await ipcRenderer.invoke('install-node');
    steps++;
    updateProgress((steps / totalSteps) * 100, 'Waiting for Node.js installation...');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  if (scanResults.deps?.hasPackageJson && !scanResults.deps?.hasNodeModules) {
    addLog('Step 2: Installing project dependencies...', 'info');
    updateProgress((steps / totalSteps) * 100, 'Installing dependencies...');
    
    const result = await ipcRenderer.invoke('install-dependencies');
    
    if (result.success) {
      addLog('Dependencies installed successfully', 'success');
      steps++;
      updateProgress(100, 'All installations complete');
    } else {
      addLog('Failed to install dependencies', 'error');
      updateProgress(0, 'Installation failed');
      
      await ipcRenderer.invoke('show-dialog', {
        type: 'error',
        title: 'Installation Failed',
        message: 'Failed to install project dependencies',
        detail: result.output.substring(0, 500)
      });
    }
  }
  
  setTimeout(() => {
    scanSystem();
    installAllBtn.textContent = '📦 Install All Missing';
  }, 2000);
}

document.addEventListener('DOMContentLoaded', () => {
  addLog('Ziddy Installer initialized', 'info');
});