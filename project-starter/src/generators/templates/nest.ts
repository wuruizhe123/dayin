import shell from 'shelljs';

export const generateNestTemplate = async (projectPath: string): Promise<void> => {
  const directories = [
    'src',
    'src/app',
    'src/main.ts',
  ];

  directories.forEach((dir) => {
    const isFile = dir.includes('.ts');
    if (!isFile) {
      shell.mkdir('-p', `${projectPath}/${dir}`);
    }
  });

  const packageJson = {
    "name": "nest-app",
    "version": "1.0.0",
    "description": "",
    "author": "",
    "private": true,
    "license": "MIT",
    "scripts": {
      "build": "nest build",
      "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
      "start": "nest start",
      "start:dev": "nest start --watch",
      "start:prod": "node dist/main",
      "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
      "test": "jest",
      "test:watch": "jest --watch",
      "test:cov": "jest --coverage",
      "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
      "test:e2e": "jest --config ./test/jest-e2e.json"
    },
    "dependencies": {
      "@nestjs/common": "^10.0.0",
      "@nestjs/core": "^10.0.0",
      "@nestjs/platform-express": "^10.0.0",
      "reflect-metadata": "^0.1.13",
      "rxjs": "^7.8.1"
    },
    "devDependencies": {
      "@nestjs/cli": "^10.0.0",
      "@nestjs/schematics": "^10.0.0",
      "@nestjs/testing": "^10.0.0",
      "@types/express": "^4.17.17",
      "@types/jest": "^29.5.2",
      "@types/node": "^20.3.1",
      "@types/supertest": "^2.0.12",
      "@typescript-eslint/eslint-plugin": "^6.0.0",
      "@typescript-eslint/parser": "^6.0.0",
      "eslint": "^8.42.0",
      "eslint-config-prettier": "^9.0.0",
      "eslint-plugin-prettier": "^5.0.0",
      "jest": "^29.5.0",
      "prettier": "^3.0.0",
      "source-map-support": "^0.5.21",
      "supertest": "^6.3.3",
      "ts-jest": "^29.1.0",
      "ts-loader": "^9.4.3",
      "ts-node": "^10.9.1",
      "tsconfig-paths": "^4.2.0",
      "typescript": "^5.1.3"
    }
  };

  const tsconfigJson = {
    "compilerOptions": {
      "module": "commonjs",
      "declaration": true,
      "removeComments": true,
      "emitDecoratorMetadata": true,
      "experimentalDecorators": true,
      "allowSyntheticDefaultImports": true,
      "target": "ES2021",
      "sourceMap": true,
      "outDir": "./dist",
      "baseUrl": "./",
      "incremental": true,
      "skipLibCheck": true,
      "strictNullChecks": false,
      "noImplicitAny": false,
      "strictBindCallApply": false,
      "forceConsistentCasingInFileNames": false,
      "noFallthroughCasesInSwitch": false
    }
  };

  const nestCliJson = `{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}`;

  const mainTs = `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(\`Application is running on: http://localhost:\${port}\`);
}
bootstrap();`;

  const appModuleTs = `import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}`;

  const appControllerTs = `import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('hello/:name')
  getHelloByName(@Param('name') name: string): string {
    return this.appService.getHelloByName(name);
  }
}`;

  const appServiceTs = `import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello, World!';
  }

  getHelloByName(name: string): string {
    return \`Hello, \${name}!\`;
  }
}`;

  const jestConfigJson = `{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": "src",
  "testRegex": ".*\\.spec\\.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "collectCoverageFrom": ["**/*.(t|j)s"],
  "coverageDirectory": "../coverage",
  "testEnvironment": "node"
}`;

  const eslintConfig = `{
  "root": true,
  "env": { "node": true, "jest": true },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "prettier"],
  "rules": {
    "prettier/prettier": "error"
  }
}`;

  shell.ShellString(JSON.stringify(packageJson, null, 2)).to(`${projectPath}/package.json`);
  shell.ShellString(JSON.stringify(tsconfigJson, null, 2)).to(`${projectPath}/tsconfig.json`);
  shell.ShellString(nestCliJson).to(`${projectPath}/nest-cli.json`);
  shell.ShellString(mainTs).to(`${projectPath}/src/main.ts`);
  shell.ShellString(appModuleTs).to(`${projectPath}/src/app/app.module.ts`);
  shell.ShellString(appControllerTs).to(`${projectPath}/src/app/app.controller.ts`);
  shell.ShellString(appServiceTs).to(`${projectPath}/src/app/app.service.ts`);
  shell.ShellString(JSON.stringify(jestConfigJson, null, 2)).to(`${projectPath}/jest.config.json`);
  shell.ShellString(eslintConfig).to(`${projectPath}/.eslintrc.js`);
};