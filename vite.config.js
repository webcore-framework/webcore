import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: 'terser',
    sourcemap: false,

    rollupOptions: {
      input: '/src/main.js',
      output: {
        name: 'WebCore',
        entryFileNames: 'webcore.all.js',
        format: 'iife',
        compact: true,
      }
    },

    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        unused: true,
        dead_code: true,
        pure_funcs: ['console.log'],
        keep_classnames: true,
        // passes: 2,
      },

      mangle: {
        toplevel: true,
        keep_classnames: true,
      },

      format: {
        ascii_only: true,
        comments: false,
        beautify: false,
      },

    },
  }
})
