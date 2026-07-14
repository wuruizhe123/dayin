import shell from 'shelljs';

export const generateAngularTemplate = async (projectPath: string): Promise<void> => {
  const directories = [
    'src',
    'src/app',
    'src/assets',
    'src/environments',
  ];

  directories.forEach((dir) => {
    shell.mkdir('-p', `${projectPath}/${dir}`);
  });

  const packageJson = {
    "name": "angular-app",
    "version": "1.0.0",
    "private": true,
    "scripts": {
      "ng": "ng",
      "start": "ng serve",
      "build": "ng build",
      "watch": "ng build --watch --configuration development",
      "test": "ng test"
    },
    "dependencies": {
      "@angular/animations": "^17.0.0",
      "@angular/common": "^17.0.0",
      "@angular/compiler": "^17.0.0",
      "@angular/core": "^17.0.0",
      "@angular/forms": "^17.0.0",
      "@angular/platform-browser": "^17.0.0",
      "@angular/platform-browser-dynamic": "^17.0.0",
      "@angular/router": "^17.0.0",
      "rxjs": "~7.8.0",
      "tslib": "^2.3.0",
      "zone.js": "~0.14.2"
    },
    "devDependencies": {
      "@angular-devkit/build-angular": "^17.0.0",
      "@angular/cli": "^17.0.0",
      "@angular/compiler-cli": "^17.0.0",
      "@types/jasmine": "~5.1.0",
      "jasmine-core": "~5.1.0",
      "karma": "~6.4.0",
      "karma-chrome-launcher": "~3.2.0",
      "karma-coverage": "~2.2.0",
      "karma-jasmine": "~5.1.0",
      "karma-jasmine-html-reporter": "~2.1.0",
      "typescript": "~5.2.2"
    }
  };

  const tsconfigJson = {
    "compileOnSave": false,
    "compilerOptions": {
      "baseUrl": "./",
      "outDir": "./dist/out-tsc",
      "forceConsistentCasingInFileNames": true,
      "strict": true,
      "noImplicitOverride": true,
      "noPropertyAccessFromIndexSignature": true,
      "noImplicitReturns": true,
      "noFallthroughCasesInSwitch": true,
      "sourceMap": true,
      "declaration": false,
      "downlevelIteration": true,
      "experimentalDecorators": true,
      "moduleResolution": "node",
      "importHelpers": true,
      "target": "ES2022",
      "module": "ES2022",
      "useDefineForClassFields": false,
      "lib": ["ES2022", "DOM", "DOM.Iterable"]
    },
    "angularCompilerOptions": {
      "enableI18nLegacyMessageIdFormat": false,
      "strictInjectionParameters": true,
      "strictInputAccessModifiers": true,
      "strictTemplates": true
    }
  };

  const angularJson = `{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "angular-app": {
      "projectType": "application",
      "schematics": {
        "@schematics/angular:component": {
          "style": "css"
        }
      },
      "root": "",
      "sourceRoot": "src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "outputPath": "dist/angular-app",
            "index": "src/index.html",
            "browser": "src/main.ts",
            "polyfills": ["zone.js"],
            "tsConfig": "tsconfig.json",
            "assets": ["src/favicon.ico", "src/assets"],
            "styles": ["src/styles.css"],
            "scripts": []
          },
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kb",
                  "maximumError": "1mb"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "2kb",
                  "maximumError": "4kb"
                }
              ],
              "outputHashing": "all"
            },
            "development": {
              "optimization": false,
              "extractLicenses": false,
              "sourceMap": true
            }
          },
          "defaultConfiguration": "production"
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "configurations": {
            "production": {
              "buildTarget": "angular-app:build:production"
            },
            "development": {
              "buildTarget": "angular-app:build:development"
            }
          },
          "defaultConfiguration": "development"
        },
        "extract-i18n": {
          "builder": "@angular-devkit/build-angular:extract-i18n",
          "options": {
            "buildTarget": "angular-app:build"
          }
        },
        "test": {
          "builder": "@angular-devkit/build-angular:karma",
          "options": {
            "polyfills": ["zone.js", "zone.js/testing"],
            "tsConfig": "tsconfig.spec.json",
            "assets": ["src/favicon.ico", "src/assets"],
            "styles": ["src/styles.css"],
            "scripts": []
          }
        }
      }
    }
  }
}`;

  const indexHtml = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <title>Angular App</title>
    <base href="/" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="favicon.ico" />
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>`;

  const mainTs = `import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));`;

  const appConfigTs = `import { ApplicationConfig } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: []
};`;

  const appComponentTs = `import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  template: \`
    <h1>Hello, World!</h1>
    <div class="counter">
      <button (click)="decrement()">-</button>
      <span>{{ count }}</span>
      <button (click)="increment()">+</button>
    </div>
  \`,
  styles: [\`
    .counter {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
    }
    .counter button {
      width: 40px;
      height: 40px;
      font-size: 1.5rem;
      cursor: pointer;
    }
    .counter span {
      font-size: 1.5rem;
      min-width: 40px;
      text-align: center;
    }
  \`]
})
export class AppComponent {
  count = 0;

  increment() {
    this.count++;
  }

  decrement() {
    this.count--;
  }
}`;

  const stylesCss = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}`;

  const tsconfigSpecJson = {
    "compilerOptions": {
      "outDir": "./out-tsc/spec",
      "baseUrl": "./",
      "module": "CommonJS",
      "target": "ES2022",
      "types": ["jasmine"]
    },
    "include": ["src/**/*.spec.ts", "src/**/*.d.ts"]
  };

  const karmaConfigJs = `module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        random: false
      },
      clearContext: false
    },
    jasmineHtmlReporter: {
      suppressAll: true
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/angular-app'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }]
    },
    reporters: ['progress', 'kjhtml'],
    browsers: ['Chrome'],
    restartOnFileChange: true
  });
};`;

  shell.ShellString(JSON.stringify(packageJson, null, 2)).to(`${projectPath}/package.json`);
  shell.ShellString(JSON.stringify(tsconfigJson, null, 2)).to(`${projectPath}/tsconfig.json`);
  shell.ShellString(JSON.stringify(tsconfigSpecJson, null, 2)).to(`${projectPath}/tsconfig.spec.json`);
  shell.ShellString(angularJson).to(`${projectPath}/angular.json`);
  shell.ShellString(indexHtml).to(`${projectPath}/src/index.html`);
  shell.ShellString(mainTs).to(`${projectPath}/src/main.ts`);
  shell.ShellString(appConfigTs).to(`${projectPath}/src/app/app.config.ts`);
  shell.ShellString(appComponentTs).to(`${projectPath}/src/app/app.component.ts`);
  shell.ShellString(stylesCss).to(`${projectPath}/src/styles.css`);
  shell.ShellString(karmaConfigJs).to(`${projectPath}/karma.conf.js`);
  shell.ShellString('').to(`${projectPath}/src/favicon.ico`);
};