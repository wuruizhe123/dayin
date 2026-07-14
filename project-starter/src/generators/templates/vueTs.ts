import shell from 'shelljs';

export const generateVueTsTemplate = async (projectPath: string): Promise<void> => {
  const directories = [
    'src',
    'src/components',
    'src/pages',
    'src/composables',
    'src/utils',
    'src/assets',
    'src/styles',
    'public',
  ];

  directories.forEach((dir) => {
    shell.mkdir('-p', `${projectPath}/${dir}`);
  });

  const packageJson = {
    "name": "vue-ts-app",
    "version": "1.0.0",
    "private": true,
    "type": "module",
    "scripts": {
      "dev": "vite",
      "build": "vue-tsc && vite build",
      "preview": "vite preview",
      "lint": "eslint . --ext ts,vue --report-unused-disable-directives --max-warnings 0"
    },
    "dependencies": {
      "vue": "^3.4.21"
    },
    "devDependencies": {
      "@types/node": "^20.11.0",
      "@vitejs/plugin-vue": "^5.0.4",
      "eslint": "^8.56.0",
      "eslint-plugin-vue": "^9.20.1",
      "typescript": "^5.3.3",
      "vite": "^5.1.0",
      "vue-tsc": "^2.0.6"
    }
  };

  const tsconfigJson = {
    "compilerOptions": {
      "target": "ES2020",
      "useDefineForClassFields": true,
      "module": "ESNext",
      "lib": ["ES2020", "DOM", "DOM.Iterable"],
      "skipLibCheck": true,
      "moduleResolution": "bundler",
      "allowImportingTsExtensions": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": true,
      "jsx": "preserve",
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noFallthroughCasesInSwitch": true,
      "types": ["node"]
    },
    "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
    "references": [{ "path": "./tsconfig.node.json" }]
  };

  const tsconfigNodeJson = {
    "compilerOptions": {
      "composite": true,
      "skipLibCheck": true,
      "module": "ESNext",
      "moduleResolution": "bundler",
      "allowSyntheticDefaultImports": true
    },
    "include": ["vite.config.ts"]
  };

  const viteConfig = `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})`;

  const indexHtml = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vue 3 + TypeScript App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`;

  const mainTs = `import { createApp } from 'vue'
import './styles/index.css'
import App from './App.vue'

createApp(App).mount('#app')`;

  const appVue = `<script setup lang="ts">
import { ref } from 'vue'
import Hello from './components/Hello.vue'

const count = ref(0)

const increment = () => {
  count.value++
}

const decrement = () => {
  count.value--
}
</script>

<template>
  <div class="app">
    <Hello />
    <div class="counter">
      <button @click="decrement">-</button>
      <span>{{ count }}</span>
      <button @click="increment">+</button>
    </div>
  </div>
</template>`;

  const helloVue = `<script setup lang="ts">
defineProps<{
  name?: string
}>()
</script>

<template>
  <h1>Hello, {{ name || 'World' }}!</h1>
</template>`;

  const indexCss = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}

.counter {
  display: flex;
  align-items: center;
  gap: 1rem;
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
}`;

  const eslintConfig = `{
  "root": true,
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    "@typescript-eslint/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "parser": "@typescript-eslint/parser"
  },
  "plugins": ["vue", "@typescript-eslint"],
  "rules": {}
}`;

  shell.ShellString(JSON.stringify(packageJson, null, 2)).to(`${projectPath}/package.json`);
  shell.ShellString(JSON.stringify(tsconfigJson, null, 2)).to(`${projectPath}/tsconfig.json`);
  shell.ShellString(JSON.stringify(tsconfigNodeJson, null, 2)).to(`${projectPath}/tsconfig.node.json`);
  shell.ShellString(viteConfig).to(`${projectPath}/vite.config.ts`);
  shell.ShellString(indexHtml).to(`${projectPath}/index.html`);
  shell.ShellString(mainTs).to(`${projectPath}/src/main.ts`);
  shell.ShellString(appVue).to(`${projectPath}/src/App.vue`);
  shell.ShellString(helloVue).to(`${projectPath}/src/components/Hello.vue`);
  shell.ShellString(indexCss).to(`${projectPath}/src/styles/index.css`);
  shell.ShellString(eslintConfig).to(`${projectPath}/.eslintrc.cjs`);
  shell.ShellString('').to(`${projectPath}/public/vite.svg`);
};