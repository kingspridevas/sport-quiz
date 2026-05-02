// vite.config.ts
import { defineConfig } from "file:///home/runner/workspace/node_modules/vite/dist/node/index.js";
import react from "file:///home/runner/workspace/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
var __vite_injected_original_dirname = "/home/runner/workspace";
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "client/src"),
      "@shared": path.resolve(__vite_injected_original_dirname, "shared"),
      "@assets": path.resolve(__vite_injected_original_dirname, "attached_assets")
    }
  },
  root: path.resolve(__vite_injected_original_dirname, "client"),
  publicDir: path.resolve(__vite_injected_original_dirname, "public"),
  build: {
    outDir: path.resolve(__vite_injected_original_dirname, "dist/public"),
    emptyOutDir: true,
    minify: "esbuild",
    target: "es2020",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["lucide-react"]
        }
      }
    }
  },
  server: {
    host: "0.0.0.0",
    port: 5e3,
    strictPort: true,
    allowedHosts: true
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
    esbuildOptions: {
      target: "esnext"
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9ydW5uZXIvd29ya3NwYWNlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9ydW5uZXIvd29ya3NwYWNlL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3J1bm5lci93b3Jrc3BhY2Uvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3JlYWN0KCldLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcImNsaWVudC9zcmNcIiksXG4gICAgICBcIkBzaGFyZWRcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJzaGFyZWRcIiksXG4gICAgICBcIkBhc3NldHNcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJhdHRhY2hlZF9hc3NldHNcIiksXG4gICAgfSxcbiAgfSxcbiAgcm9vdDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJjbGllbnRcIiksXG4gIHB1YmxpY0RpcjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJwdWJsaWNcIiksXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcImRpc3QvcHVibGljXCIpLFxuICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxuICAgIG1pbmlmeTogJ2VzYnVpbGQnLFxuICAgIHRhcmdldDogJ2VzMjAyMCcsXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgIHZlbmRvcjogWydyZWFjdCcsICdyZWFjdC1kb20nXSxcbiAgICAgICAgICB1aTogWydsdWNpZGUtcmVhY3QnXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogXCIwLjAuMC4wXCIsXG4gICAgcG9ydDogNTAwMCxcbiAgICBzdHJpY3RQb3J0OiB0cnVlLFxuICAgIGFsbG93ZWRIb3N0czogdHJ1ZSxcbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXhjbHVkZTogW1wibHVjaWRlLXJlYWN0XCJdLFxuICAgIGVzYnVpbGRPcHRpb25zOiB7XG4gICAgICB0YXJnZXQ6IFwiZXNuZXh0XCIsXG4gICAgfSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvUCxTQUFTLG9CQUFvQjtBQUNqUixPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBRmpCLElBQU0sbUNBQW1DO0FBSXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxZQUFZO0FBQUEsTUFDekMsV0FBVyxLQUFLLFFBQVEsa0NBQVcsUUFBUTtBQUFBLE1BQzNDLFdBQVcsS0FBSyxRQUFRLGtDQUFXLGlCQUFpQjtBQUFBLElBQ3REO0FBQUEsRUFDRjtBQUFBLEVBQ0EsTUFBTSxLQUFLLFFBQVEsa0NBQVcsUUFBUTtBQUFBLEVBQ3RDLFdBQVcsS0FBSyxRQUFRLGtDQUFXLFFBQVE7QUFBQSxFQUMzQyxPQUFPO0FBQUEsSUFDTCxRQUFRLEtBQUssUUFBUSxrQ0FBVyxhQUFhO0FBQUEsSUFDN0MsYUFBYTtBQUFBLElBQ2IsUUFBUTtBQUFBLElBQ1IsUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFVBQ1osUUFBUSxDQUFDLFNBQVMsV0FBVztBQUFBLFVBQzdCLElBQUksQ0FBQyxjQUFjO0FBQUEsUUFDckI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLFlBQVk7QUFBQSxJQUNaLGNBQWM7QUFBQSxFQUNoQjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLGNBQWM7QUFBQSxJQUN4QixnQkFBZ0I7QUFBQSxNQUNkLFFBQVE7QUFBQSxJQUNWO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
