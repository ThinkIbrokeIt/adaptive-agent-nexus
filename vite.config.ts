import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins = [react()];

  // Only add componentTagger in development mode
  if (mode === 'development') {
    try {
      const { componentTagger } = await import("lovable-tagger");
      plugins.push(componentTagger());
    } catch (error) {
      // Silently ignore if lovable-tagger is not available
      console.warn('lovable-tagger not available, skipping component tagging');
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Core React libraries
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            // UI libraries
            'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-tabs'],
            // Utility libraries
            'utils-vendor': ['uuid', 'date-fns', 'clsx', 'tailwind-merge'],
            // Chart libraries
            'charts-vendor': ['recharts'],
          },
        },
      },
      chunkSizeWarningLimit: 600, // Slightly higher limit for production
      sourcemap: false, // Disable sourcemaps for production
      minify: 'esbuild', // Use esbuild for minification (faster and built-in)
    },
  };
});
