import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	// Evita pré-bundle do pgLite, que quebra a resolução dos assets .wasm/.data
	optimizeDeps: {
		exclude: ['@electric-sql/pglite']
	},
	// Garanta que Vite trate .wasm e .data como assets servíveis
	assetsInclude: ['**/*.wasm', '**/*.data']
});
