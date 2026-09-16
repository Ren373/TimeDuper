import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://ren373.github.io',
  base: '/TimeDuper',
  output: 'static',
  build: {
    format: 'directory',
  },
});
