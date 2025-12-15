import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			// default options are shown. On some platforms
			// these options are set automatically — see below
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: false,
			strict: true
		}),
		// GitHub Pages uses a base path for non-root repos
		// Set this to your repo name, or leave empty for root repos
		paths: {
			base: process.env.GITHUB_PAGES_BASE || ''
		},
		// Suppress 404 errors for assets during prerendering
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				// Ignore 404s for favicon and other assets
				if (path.includes('favicon') || path.includes('.svg') || path.includes('.png') || path.includes('.ico')) {
					return;
				}
				// Throw for other errors
				throw new Error(`${message} (${path})`);
			}
		}
	}
};

export default config;
