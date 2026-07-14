import shell from 'shelljs';

export const generateExpressTsTemplate = async (projectPath: string): Promise<void> => {
  const directories = [
    'src',
    'src/controllers',
    'src/services',
    'src/routes',
    'src/middleware',
    'src/config',
    'src/types',
  ];

  directories.forEach((dir) => {
    shell.mkdir('-p', `${projectPath}/${dir}`);
  });

  const packageJson = {
    "name": "express-ts-api",
    "version": "1.0.0",
    "private": true,
    "main": "dist/index.js",
    "scripts": {
      "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
      "build": "tsc",
      "start": "node dist/index.js",
      "lint": "eslint . --ext ts --report-unused-disable-directives --max-warnings 0"
    },
    "dependencies": {
      "express": "^4.18.2",
      "cors": "^2.8.5",
      "dotenv": "^16.3.1"
    },
    "devDependencies": {
      "@types/cors": "^2.8.17",
      "@types/express": "^4.17.21",
      "@types/node": "^20.10.4",
      "@typescript-eslint/eslint-plugin": "^6.14.0",
      "@typescript-eslint/parser": "^6.14.0",
      "eslint": "^8.55.0",
      "ts-node-dev": "^2.0.0",
      "typescript": "^5.3.3"
    }
  };

  const tsconfigJson = {
    "compilerOptions": {
      "target": "ES2020",
      "module": "CommonJS",
      "outDir": "./dist",
      "rootDir": "./src",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true,
      "resolveJsonModule": true,
      "declaration": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules"]
  };

  const envContent = `PORT=3000
NODE_ENV=development`;

  const indexTs = `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { router } from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', router);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Express + TypeScript API' });
});

app.listen(PORT, () => {
  console.log(\`Server is running on http://localhost:\${PORT}\`);
});`;

  const routesTs = `import { Router } from 'express';
import { helloController } from '../controllers/hello';

export const router = Router();

router.get('/hello', helloController.getHello);
router.get('/hello/:name', helloController.getHelloByName);`;

  const helloControllerTs = `import { Request, Response } from 'express';
import { helloService } from '../services/hello';

export const helloController = {
  getHello: (req: Request, res: Response) => {
    const message = helloService.getHello();
    res.json({ message });
  },

  getHelloByName: (req: Request, res: Response) => {
    const { name } = req.params;
    const message = helloService.getHelloByName(name);
    res.json({ message });
  },
};`;

  const helloServiceTs = `export const helloService = {
  getHello: (): string => {
    return 'Hello, World!';
  },

  getHelloByName: (name: string): string => {
    return \`Hello, \${name}!\`;
  },
};`;

  const eslintConfig = `{
  "root": true,
  "env": { "node": true, "es2020": true },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "ignorePatterns": ["dist", ".eslintrc.cjs"],
  "parser": "@typescript-eslint/parser",
  "rules": {}
}`;

  shell.ShellString(JSON.stringify(packageJson, null, 2)).to(`${projectPath}/package.json`);
  shell.ShellString(JSON.stringify(tsconfigJson, null, 2)).to(`${projectPath}/tsconfig.json`);
  shell.ShellString(envContent).to(`${projectPath}/.env`);
  shell.ShellString(indexTs).to(`${projectPath}/src/index.ts`);
  shell.ShellString(routesTs).to(`${projectPath}/src/routes/index.ts`);
  shell.ShellString(helloControllerTs).to(`${projectPath}/src/controllers/hello.ts`);
  shell.ShellString(helloServiceTs).to(`${projectPath}/src/services/hello.ts`);
  shell.ShellString(eslintConfig).to(`${projectPath}/.eslintrc.cjs`);
};