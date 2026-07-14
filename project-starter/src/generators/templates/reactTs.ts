import shell from 'shelljs';

export const generateReactTsTemplate = async (projectPath: string): Promise<void> => {
  const directories = [
    'src',
    'src/components',
    'src/pages',
    'src/hooks',
    'src/utils',
    'src/assets',
    'src/styles',
    'public',
  ];

  directories.forEach((dir) => {
    shell.mkdir('-p', `${projectPath}/${dir}`);
  });

  const packageJson = {
    "name": "react-ts-app",
    "version": "1.0.0",
    "private": true,
    "type": "module",
    "scripts": {
      "dev": "vite",
      "build": "tsc && vite build",
      "preview": "vite preview",
      "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
    },
    "dependencies": {
      "react": "^18.2.0",
      "react-dom": "^18.2.0"
    },
    "devDependencies": {
      "@types/react": "^18.2.43",
      "@types/react-dom": "^18.2.17",
      "@typescript-eslint/eslint-plugin": "^6.14.0",
      "@typescript-eslint/parser": "^6.14.0",
      "@vitejs/plugin-react": "^4.2.1",
      "eslint": "^8.55.0",
      "eslint-plugin-react-hooks": "^4.6.0",
      "eslint-plugin-react-refresh": "^0.4.5",
      "typescript": "^5.2.2",
      "vite": "^5.0.8"
    }
  };

  const tsconfigJson = {
    "compilerOptions": {
      "target": "ES2020",
      "useDefineForClassFields": true,
      "lib": ["ES2020", "DOM", "DOM.Iterable"],
      "module": "ESNext",
      "skipLibCheck": true,
      "moduleResolution": "bundler",
      "allowImportingTsExtensions": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": true,
      "jsx": "react-jsx",
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noFallthroughCasesInSwitch": true
    },
    "include": ["src"]
  };

  const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`;

  const indexHtml = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React + TypeScript App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

  const mainTsx = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)`;

  const appTsx = `import { useState } from 'react'
import Hello from './components/Hello'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <Hello />
      <div className="counter">
        <button onClick={() => setCount((c) => c - 1)}>
          -
        </button>
        <span>{count}</span>
        <button onClick={() => setCount((c) => c + 1)}>
          +
        </button>
      </div>
    </div>
  )
}

export default App`;

  const helloTsx = `interface HelloProps {
  name?: string
}

function Hello({ name = 'World' }: HelloProps) {
  return <h1>Hello, {name}!</h1>
}

export default Hello`;

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
  "env": { "browser": true, "es2020": true },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ],
  "ignorePatterns": ["dist", ".eslintrc.cjs"],
  "parser": "@typescript-eslint/parser",
  "plugins": ["react-refresh"],
  "rules": {
    "react-refresh/only-export-components": [
      "warn",
      { "allowConstantExport": true }
    ]
  }
}`;

  shell.ShellString(JSON.stringify(packageJson, null, 2)).to(`${projectPath}/package.json`);
  shell.ShellString(JSON.stringify(tsconfigJson, null, 2)).to(`${projectPath}/tsconfig.json`);
  shell.ShellString(viteConfig).to(`${projectPath}/vite.config.ts`);
  shell.ShellString(indexHtml).to(`${projectPath}/index.html`);
  shell.ShellString(mainTsx).to(`${projectPath}/src/main.tsx`);
  shell.ShellString(appTsx).to(`${projectPath}/src/App.tsx`);
  shell.ShellString(helloTsx).to(`${projectPath}/src/components/Hello.tsx`);
  shell.ShellString(indexCss).to(`${projectPath}/src/styles/index.css`);
  shell.ShellString(eslintConfig).to(`${projectPath}/.eslintrc.cjs`);
  shell.ShellString('').to(`${projectPath}/public/vite.svg`);
};