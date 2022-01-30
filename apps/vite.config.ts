import { defineConfig } from 'vite';
import path from 'path';
import yaml from '@rollup/plugin-yaml';

const app = path.basename(process.cwd());

export default defineConfig({
  plugins: [yaml()],
  build: {
    outDir: `../../../static/apps/${app}`,
  },
});
