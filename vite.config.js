import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
    base: '/shader-website-03/',
    plugins: [
        glsl({
            watch: true,
            compress: false,
            defaultExtension: 'frag',
        })
    ],
    build: {
        outDir: 'dist',
    }
})