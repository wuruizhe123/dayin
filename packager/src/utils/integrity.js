import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export class IntegrityChecker {
  constructor() {
    this.algorithm = 'sha256';
  }

  generateChecksum(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash(this.algorithm);
      const stream = fs.createReadStream(filePath);
      
      stream.on('data', (data) => {
        hash.update(data);
      });
      
      stream.on('end', () => {
        resolve(hash.digest('hex'));
      });
      
      stream.on('error', (err) => {
        reject(err);
      });
    });
  }

  async generateChecksums(directory, excludePatterns = []) {
    const checksums = {};
    const files = this.getFilesRecursive(directory);
    
    for (const file of files) {
      const relativePath = file.replace(directory, '').replace(/^[\\/]/, '');
      
      let shouldExclude = false;
      for (const pattern of excludePatterns) {
        if (relativePath.match(pattern)) {
          shouldExclude = true;
          break;
        }
      }
      
      if (shouldExclude) continue;
      
      try {
        const checksum = await this.generateChecksum(file);
        checksums[relativePath] = checksum;
      } catch (error) {
        console.warn(`Failed to generate checksum for ${file}: ${error.message}`);
      }
    }
    
    return checksums;
  }

  async verifyChecksums(directory, checksums) {
    const results = {
      valid: [],
      invalid: [],
      missing: []
    };
    
    for (const [relativePath, expectedChecksum] of Object.entries(checksums)) {
      const filePath = path.join(directory, relativePath);
      
      if (!fs.existsSync(filePath)) {
        results.missing.push(relativePath);
        continue;
      }
      
      try {
        const actualChecksum = await this.generateChecksum(filePath);
        if (actualChecksum === expectedChecksum) {
          results.valid.push(relativePath);
        } else {
          results.invalid.push(relativePath);
        }
      } catch (error) {
        results.invalid.push(relativePath);
      }
    }
    
    return results;
  }

  getFilesRecursive(directory) {
    const files = [];
    
    function walk(dir) {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory()) {
          walk(fullPath);
        } else {
          files.push(fullPath);
        }
      }
    }
    
    walk(directory);
    return files;
  }

  generateSignature(privateKey, data) {
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    sign.end();
    return sign.sign(privateKey, 'base64');
  }

  verifySignature(publicKey, data, signature) {
    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    verify.end();
    return verify.verify(publicKey, signature, 'base64');
  }
}