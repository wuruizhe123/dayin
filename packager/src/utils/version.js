import semver from 'semver';
import fs from 'fs';
import path from 'path';

export class VersionManager {
  constructor(projectDir) {
    this.projectDir = projectDir;
    this.versionFile = path.join(projectDir, 'VERSION');
    this.packageJson = path.join(projectDir, 'package.json');
  }

  getCurrentVersion() {
    try {
      if (fs.existsSync(this.versionFile)) {
        return fs.readFileSync(this.versionFile, 'utf8').trim();
      }
      
      if (fs.existsSync(this.packageJson)) {
        const pkg = JSON.parse(fs.readFileSync(this.packageJson, 'utf8'));
        return pkg.version || '1.0.0';
      }
      
      return '1.0.0';
    } catch (error) {
      return '1.0.0';
    }
  }

  bumpVersion(release = 'patch') {
    const currentVersion = this.getCurrentVersion();
    
    if (!semver.valid(currentVersion)) {
      return '1.0.0';
    }
    
    let newVersion;
    switch (release) {
      case 'major':
        newVersion = semver.inc(currentVersion, 'major');
        break;
      case 'minor':
        newVersion = semver.inc(currentVersion, 'minor');
        break;
      case 'patch':
      default:
        newVersion = semver.inc(currentVersion, 'patch');
        break;
    }
    
    fs.writeFileSync(this.versionFile, newVersion);
    
    if (fs.existsSync(this.packageJson)) {
      const pkg = JSON.parse(fs.readFileSync(this.packageJson, 'utf8'));
      pkg.version = newVersion;
      fs.writeFileSync(this.packageJson, JSON.stringify(pkg, null, 2));
    }
    
    return newVersion;
  }

  setVersion(version) {
    if (!semver.valid(version)) {
      throw new Error(`Invalid version: ${version}`);
    }
    
    fs.writeFileSync(this.versionFile, version);
    
    if (fs.existsSync(this.packageJson)) {
      const pkg = JSON.parse(fs.readFileSync(this.packageJson, 'utf8'));
      pkg.version = version;
      fs.writeFileSync(this.packageJson, JSON.stringify(pkg, null, 2));
    }
    
    return version;
  }

  generateBuildNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}${hour}${minute}`;
  }
}