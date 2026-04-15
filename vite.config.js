import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
    base: '/shader-website-03/',

    plugins: [
        glsl()
    ],

    build: {
        assetsInlineLimit: 0,
        rollupOptions: {
            output: {
                entryFileNames: `assets/[name].js`,
                chunkFileNames: `assets/[name].js`,
                assetFileNames: `assets/[name].[ext]`,
            },
        },
    },
})