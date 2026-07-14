import shell from 'shelljs';

export const generateExpressJsTemplate = async (projectPath: string): Promise<void> => {
  const directories = [
    'src',
    'src/controllers',
    'src/services',
    'src/routes',
    'src/middleware',
    'src/config',
  ];

  directories.forEach((dir) => {
    shell.mkdir('-p', `${projectPath}/${dir}`);
  });

  const packageJson = {
    "name": "express-js-api",
    "version": "1.0.0",
    "private": true,
    "main": "src/index.js",
    "scripts": {
      "dev": "nodemon src/index.js",
      "start": "node src/index.js",
      "lint": "eslint . --ext js --report-unused-disable-directives --max-warnings 0"
    },
    "dependencies": {
      "express": "^4.18.2",
      "cors": "^2.8.5",
      "dotenv": "^16.3.1"
    },
    "devDependencies": {
      "eslint": "^8.55.0",
      "nodemon": "^3.0.2"
    }
  };

  const envContent = `PORT=3000
NODE_ENV=development`;

  const indexJs = `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { router } from './routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', router);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Express + JavaScript API' });
});

app.listen(PORT, () => {
  console.log(\`Server is running on http://localhost:\${PORT}\`);
});`;

  const routesJs = `import { Router } from 'express';
import { helloController } from '../controllers/hello.js';

export const router = Router();

router.get('/hello', helloController.getHello);
router.get('/hello/:name', helloController.getHelloByName);`;

  const helloControllerJs = `import { helloService } from '../services/hello.js';

export const helloController = {
  getHello: (req, res) => {
    const message = helloService.getHello();
    res.json({ message });
  },

  getHelloByName: (req, res) => {
    const { name } = req.params;
    const message = helloService.getHelloByName(name);
    res.json({ message });
  },
};`;

  const helloServiceJs = `export const helloService = {
  getHello: () => {
    return 'Hello, World!';
  },

  getHelloByName: (name) => {
    return \`Hello, \${name}!\`;
  },
};`;

  const eslintConfig = `{
  "root": true,
  "env": { "node": true, "es2020": true },
  "extends": ["eslint:recommended"],
  "ignorePatterns": [".eslintrc.cjs"],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {}
}`;

  shell.ShellString(JSON.stringify(packageJson, null, 2)).to(`${projectPath}/package.json`);
  shell.ShellString(envContent).to(`${projectPath}/.env`);
  shell.ShellString(indexJs).to(`${projectPath}/src/index.js`);
  shell.ShellString(routesJs).to(`${projectPath}/src/routes/index.js`);
  shell.ShellString(helloControllerJs).to(`${projectPath}/src/controllers/hello.js`);
  shell.ShellString(helloServiceJs).to(`${projectPath}/src/services/hello.js`);
  shell.ShellString(eslintConfig).to(`${projectPath}/.eslintrc.cjs`);
};