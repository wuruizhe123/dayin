import shell from 'shelljs';

export const generateVueJsTemplate = async (projectPath: string): Promise<void> => {
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
    "name": "vue-js-app",
    "version": "1.0.0",
    "private": true,
    "type": "module",
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "preview": "vite preview",
      "lint": "eslint . --ext js,vue --report-unused-disable-directives --max-warnings 0"
    },
    "dependencies": {
      "vue": "^3.4.21"
    },
    "devDependencies": {
      "@vitejs/plugin-vue": "^5.0.4",
      "eslint": "^8.56.0",
      "eslint-plugin-vue": "^9.20.1",
      "vite": "^5.1.0"
    }
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
    <title>Vue 3 + JavaScript App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>`;

  const mainJs = `import { createApp } from 'vue'
import './styles/index.css'
import App from './App.vue'

createApp(App).mount('#app')`;

  const appVue = `<script setup>
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

  const helloVue = `<script setup>
defineProps({
  name: {
    type: String,
    default: 'World'
  }
})
</script>

<template>
  <h1>Hello, {{ name }}!</h1>
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
    "plugin:vue/vue3-recommended"
  ],
  "parserOptions": {
    "ecmaVersion": "latest"
  },
  "plugins": ["vue"],
  "rules": {}
}`;

  shell.ShellString(JSON.stringify(packageJson, null, 2)).to(`${projectPath}/package.json`);
  shell.ShellString(viteConfig).to(`${projectPath}/vite.config.js`);
  shell.ShellString(indexHtml).to(`${projectPath}/index.html`);
  shell.ShellString(mainJs).to(`${projectPath}/src/main.js`);
  shell.ShellString(appVue).to(`${projectPath}/src/App.vue`);
  shell.ShellString(helloVue).to(`${projectPath}/src/components/Hello.vue`);
  shell.ShellString(indexCss).to(`${projectPath}/src/styles/index.css`);
  shell.ShellString(eslintConfig).to(`${projectPath}/.eslintrc.cjs`);
  shell.ShellString('').to(`${projectPath}/public/vite.svg`);
};