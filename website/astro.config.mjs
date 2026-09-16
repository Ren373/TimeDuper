import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://timeduper.github.io',
  base: '/TimeDuper',
  output: 'static',
  build: {
    format: 'directory',
  },
});
