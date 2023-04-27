import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
  chokidarWatchOptions: {
    usePolling: true
  }
};

export default config;
