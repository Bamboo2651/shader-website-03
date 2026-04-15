import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/shader-website-03/', // ここをリポジトリ名に合わせて追加
    plugins: [glsl()]
})