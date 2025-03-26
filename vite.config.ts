import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	build: {
		outDir: "dist",
		sourcemap: true,
		rollupOptions: {
			output: {
				manualChunks: undefined,
			},
		},
	},
	server: {
		proxy: {
			"/api": {
				target: "https://bgwiper.dommacademy.com",
				changeOrigin: true,
				secure: true,
				rewrite: (path) => path.replace(/^\/api/, ""),
				configure: (proxy) => {
					proxy.on("error", (err) => {
						// @ts-ignore
						console.error("proxy error", err);
					});
					proxy.on("proxyReq", (proxyReq) => {
						proxyReq.setHeader("Access-Control-Allow-Origin", "*");
						proxyReq.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
						proxyReq.setHeader("Access-Control-Allow-Headers", "Content-Type");
					});
				},
			},
		},
	},
});
