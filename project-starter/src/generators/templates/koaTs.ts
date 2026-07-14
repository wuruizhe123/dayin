import shell from 'shelljs';

export const generateKoaTsTemplate = async (projectPath: string): Promise<void> => {
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
    "name": "koa-ts-api",
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
      "koa": "^2.14.2",
      "koa-router": "^12.0.1",
      "koa-bodyparser": "^4.4.1",
      "dotenv": "^16.3.1"
    },
    "devDependencies": {
      "@types/koa": "^2.14.0",
      "@types/koa-bodyparser": "^4.3.12",
      "@types/koa-router": "^7.4.8",
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

  const indexTs = `import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import dotenv from 'dotenv';

dotenv.config();

const app = new Koa();
const router = new Router();
const PORT = process.env.PORT || 3000;

app.use(bodyParser());

router.get('/', (ctx) => {
  ctx.body = { message: 'Welcome to Koa + TypeScript API' };
});

router.get('/hello', (ctx) => {
  ctx.body = { message: 'Hello, World!' };
});

router.get('/hello/:name', (ctx) => {
  const { name } = ctx.params;
  ctx.body = { message: \`Hello, \${name}!\` };
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(\`Server is running on http://localhost:\${PORT}\`);
});`;

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
  shell.ShellString(eslintConfig).to(`${projectPath}/.eslintrc.cjs`);
};