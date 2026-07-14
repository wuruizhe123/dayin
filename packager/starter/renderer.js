const { ipcRenderer } = require('electron');

let isRunning = false;

function updateStatus(id, status, value) {
  const item = document.getElementById(id);
  const icon = document.getElementById(`${id.split('-')[0]}-icon`);
  const valueEl = document.getElementById(`${id.split('-')[0]}-value`);

  item.className = `status-item ${status}`;
  icon.className = `status-icon ${status}`;
  icon.textContent = status === 'success' ? '✓' : status === 'error' ? '✗' : status === 'warning' ? '!' : '?';
  valueEl.textContent = value;
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

async function checkEnvironment() {
  addLog('Checking system environment...', 'info');
  updateProgress(10, 'Checking environment...');

  const [nodeResult, npmResult, depResult] = await Promise.all([
    ipcRenderer.invoke('check-node'),
    ipcRenderer.invoke('check-npm'),
    ipcRenderer.invoke('check-dependencies')
  ]);

  if (nodeResult.installed) {
    updateStatus('node-status', 'success', nodeResult.version);
    addLog(`Node.js detected: ${nodeResult.version}`, 'success');
  } else {
    updateStatus('node-status', 'error', 'Not installed');
    addLog('ERROR: Node.js is not installed!', 'error');
  }

  if (npmResult.installed) {
    updateStatus('npm-status', 'success', npmResult.version);
    addLog(`npm detected: ${npmResult.version}`, 'success');
  } else {
    updateStatus('npm-status', 'error', 'Not installed');
    addLog('ERROR: npm is not installed!', 'error');
  }

  if (depResult.hasPackageJson && depResult.hasNodeModules) {
    updateStatus('dep-status', 'success', 'Installed');
    addLog('Dependencies are installed', 'success');
  } else if (depResult.hasPackageJson && !depResult.hasNodeModules) {
    updateStatus('dep-status', 'warning', 'Not installed');
    addLog('Dependencies not found, will install on startup', 'warning');
  } else {
    updateStatus('dep-status', 'error', 'No package.json');
    addLog('ERROR: package.json not found!', 'error');
  }

  updateProgress(30, 'Verifying integrity...');
  
  const integrityResult = await ipcRenderer.invoke('verify-integrity');
  if (integrityResult.success) {
    updateStatus('integrity-status', 'success', 'Verified');
    addLog('Integrity check passed', 'success');
  } else {
    updateStatus('integrity-status', 'warning', 'Failed');
    addLog(`Integrity check: ${integrityResult.message}`, 'warning');
  }

  const deployInfo = await ipcRenderer.invoke('get-deploy-info');
  if (deployInfo) {
    document.getElementById('version-info').textContent = `Version: ${deployInfo.version} | Build: ${new Date(deployInfo.buildDate).toLocaleDateString()}`;
  }

  updateProgress(100, 'Ready');
  addLog('System check completed', 'info');
}

async function startApplication() {
  if (isRunning) return;

  const nodeResult = await ipcRenderer.invoke('check-node');
  if (!nodeResult.installed) {
    await ipcRenderer.invoke('show-dialog', {
      type: 'error',
      title: 'Error',
      message: 'Node.js is not installed',
      detail: 'Please install Node.js from https://nodejs.org/ before starting the application.'
    });
    return;
  }

  isRunning = true;
  document.getElementById('start-btn').disabled = true;
  document.getElementById('stop-btn').disabled = false;
  
  addLog('Starting application...', 'info');
  updateProgress(40, 'Starting...');

  const depResult = await ipcRenderer.invoke('check-dependencies');
  if (!depResult.hasNodeModules) {
    addLog('Installing dependencies...', 'info');
    updateProgress(50, 'Installing dependencies...');
    
    const installResult = await ipcRenderer.invoke('install-dependencies');
    if (installResult.success) {
      addLog('Dependencies installed successfully', 'success');
      updateStatus('dep-status', 'success', 'Installed');
    } else {
      addLog(`Failed to install dependencies: ${installResult.output}`, 'error');
      await ipcRenderer.invoke('show-dialog', {
        type: 'error',
        title: 'Installation Failed',
        message: 'Failed to install dependencies',
        detail: installResult.output.substring(0, 500)
      });
      isRunning = false;
      document.getElementById('start-btn').disabled = false;
      document.getElementById('stop-btn').disabled = true;
      updateProgress(0, 'Error');
      return;
    }
  }

  updateProgress(70, 'Starting application...');
  
  try {
    const startResult = await ipcRenderer.invoke('start-application');
    
    if (startResult.success) {
      addLog('Application started successfully', 'success');
      updateProgress(100, 'Running');
      document.getElementById('browser-btn').disabled = false;
      addLog('Application is running. Open browser to access.', 'info');
    } else {
      addLog(`Application failed to start: ${startResult.output}`, 'error');
      await ipcRenderer.invoke('show-dialog', {
        type: 'error',
        title: 'Start Failed',
        message: 'Application failed to start',
        detail: startResult.output.substring(0, 500)
      });
      isRunning = false;
      document.getElementById('start-btn').disabled = false;
      document.getElementById('stop-btn').disabled = true;
      updateProgress(0, 'Error');
    }
  } catch (error) {
    addLog(`Error: ${error.message}`, 'error');
    isRunning = false;
    document.getElementById('start-btn').disabled = false;
    document.getElementById('stop-btn').disabled = true;
    updateProgress(0, 'Error');
  }
}

async function stopApplication() {
  if (!isRunning) return;

  addLog('Stopping application...', 'info');
  updateProgress(80, 'Stopping...');

  const result = await ipcRenderer.invoke('kill-process');
  
  if (result.success) {
    addLog('Application stopped', 'success');
  } else {
    addLog('Failed to stop application', 'error');
  }

  isRunning = false;
  document.getElementById('start-btn').disabled = false;
  document.getElementById('stop-btn').disabled = true;
  document.getElementById('browser-btn').disabled = true;
  updateProgress(0, 'Ready');
}

async function openBrowser() {
  addLog('Opening browser...', 'info');
  await ipcRenderer.invoke('open-browser');
}

document.addEventListener('DOMContentLoaded', () => {
  checkEnvironment();
});