import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://visioneffectsgh.com',
  integrations: [sitemap()],
});
