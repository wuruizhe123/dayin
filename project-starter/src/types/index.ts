export interface ProjectConfig {
  projectName: string;
  projectType: 'frontend' | 'backend' | 'fullstack';
  frontendFramework?: 'react-ts' | 'react-js' | 'vue-ts' | 'vue-js' | 'angular';
  backendFramework?: 'express-ts' | 'express-js' | 'nest' | 'koa-ts';
  initGit: boolean;
  installDeps: boolean;
}

export interface EnvStatus {
  node: string | null;
  npm: string | null;
  git: string | null;
  typescript: string | null;
}

export interface TemplateConfig {
  files: {
    path: string;
    content: string;
  }[];
  directories: string[];
}

export type FrameworkType = ProjectConfig['frontendFramework'] | ProjectConfig['backendFramework'];