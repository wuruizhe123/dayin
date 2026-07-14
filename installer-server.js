import http from 'http';
import fs from 'fs';
import path from 'path';
import { execFile, spawn } from 'child_process';

const PORT = 3000;
const projectDir = path.dirname(import.meta.url).replace('file:///', '');

function checkNode(callback) {
  execFile('node', ['--version'], (error, stdout) => {
    if (error) {
      callback({ installed: false, version: null });
    } else {
      callback({ installed: true, version: stdout.trim() });
    }
  });
}

function checkNpm(callback) {
  execFile('npm', ['--version'], (error, stdout) => {
    if (error) {
      callback({ installed: false, version: null });
    } else {
      callback({ installed: true, version: stdout.trim() });
    }
  });
}

function checkDependencies(callback) {
  const packagePath = path.join(projectDir, 'package.json');
  const nodeModulesPath = path.join(projectDir, 'node_modules');
  
  callback({
    hasPackageJson: fs.existsSync(packagePath),
    hasNodeModules: fs.existsSync(nodeModulesPath) && fs.readdirSync(nodeModulesPath).length > 0
  });
}

function installDependencies(callback) {
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
    callback({
      success: code === 0,
      code,
      output
    });
  });

  npmProcess.on('error', (error) => {
    callback({
      success: false,
      code: -1,
      output: error.message
    });
  });
}

function handleRequest(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = req.url;

  if (url === '/check-node') {
    checkNode((result) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    });
  } else if (url === '/check-npm') {
    checkNpm((result) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    });
  } else if (url === '/check-dependencies') {
    checkDependencies((result) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    });
  } else if (url === '/install-dependencies') {
    installDependencies((result) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    });
  } else if (url === '/' || url === '/install.html') {
    const installPath = path.join(projectDir, 'install.html');
    fs.readFile(installPath, (error, data) => {
      if (error) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('install.html not found');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
}

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`Installer Server running on http://localhost:${PORT}`);
  console.log('Open install.html in your browser to start the installer');
});