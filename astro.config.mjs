import { defineConfig } from 'astro/config';

// Fully static output -> upload the contents of /dist to Hostinger public_html.
export default defineConfig({
  site: 'https://promisegd.com',
  output: 'static',
  compressHTML: true,
  build: { inlineStylesheets: 'always' },
});
