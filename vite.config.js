import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            src: '/src',
            components: '/src/components',
            hoc: '/src/hoc',
            assets: '/src/assets',
            constants: '/src/constants',
            utils: '/src/utils',
            hooks: '/src/hooks',
            styles: '/src/styles',
        },
    },
});
