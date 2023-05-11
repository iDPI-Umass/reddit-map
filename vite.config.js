import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
  chokidarWatchOptions: {
    usePolling: true
  },
  server: {
    host: true
  }
};

export default config;
