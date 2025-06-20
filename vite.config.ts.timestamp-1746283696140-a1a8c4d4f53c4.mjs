// vite.config.ts
import { defineConfig, loadEnv } from "file:///E:/Bolt_sandbox/gigs/v25_gigsmanualcreation_frontend/node_modules/vite/dist/node/index.js";
import react from "file:///E:/Bolt_sandbox/gigs/v25_gigsmanualcreation_frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
import qiankun from "file:///E:/Bolt_sandbox/gigs/v25_gigsmanualcreation_frontend/node_modules/vite-plugin-qiankun/dist/index.js";
import * as cheerio from "file:///E:/Bolt_sandbox/gigs/v25_gigsmanualcreation_frontend/node_modules/cheerio/dist/esm/index.js";
var __vite_injected_original_dirname = "E:\\Bolt_sandbox\\gigs\\v25_gigsmanualcreation_frontend";
var removeReactRefreshScript = () => {
  return {
    name: "remove-react-refresh",
    transformIndexHtml(html) {
      const $ = cheerio.load(html);
      $('script[src="/@react-refresh"]').remove();
      return $.html();
    }
  };
};
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    base: "https://gigsmanual.harx.ai/",
    plugins: [
      react({
        jsxRuntime: "classic"
      }),
      qiankun("app6", {
        useDevMode: true
      }),
      removeReactRefreshScript()
      // Add the script removal plugin
    ],
    define: {
      "import.meta.env": env
    },
    server: {
      port: 5178,
      cors: true,
      hmr: false,
      fs: {
        strict: true
        // Ensure static assets are correctly resolved
      }
    },
    build: {
      target: "esnext",
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          format: "umd",
          name: "app6",
          entryFileNames: "index.js",
          // Fixed name for the JS entry file
          chunkFileNames: "chunk-[name].js",
          // Fixed name for chunks
          assetFileNames: (assetInfo) => {
            if (assetInfo.name.endsWith(".css")) {
              return "index.css";
            }
            return "[name].[ext]";
          }
        }
      }
    },
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "src")
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxCb2x0X3NhbmRib3hcXFxcZ2lnc1xcXFx2MjVfZ2lnc21hbnVhbGNyZWF0aW9uX2Zyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxCb2x0X3NhbmRib3hcXFxcZ2lnc1xcXFx2MjVfZ2lnc21hbnVhbGNyZWF0aW9uX2Zyb250ZW5kXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9Cb2x0X3NhbmRib3gvZ2lncy92MjVfZ2lnc21hbnVhbGNyZWF0aW9uX2Zyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgcWlhbmt1biBmcm9tICd2aXRlLXBsdWdpbi1xaWFua3VuJztcclxuaW1wb3J0ICogYXMgY2hlZXJpbyBmcm9tICdjaGVlcmlvJztcclxuXHJcbi8vIFBsdWdpbiB0byByZW1vdmUgUmVhY3QgUmVmcmVzaCBwcmVhbWJsZVxyXG5jb25zdCByZW1vdmVSZWFjdFJlZnJlc2hTY3JpcHQgPSAoKSA9PiB7XHJcbiAgcmV0dXJuIHtcclxuICAgIG5hbWU6ICdyZW1vdmUtcmVhY3QtcmVmcmVzaCcsXHJcbiAgICB0cmFuc2Zvcm1JbmRleEh0bWwoaHRtbDogYW55KSB7XHJcbiAgICAgIGNvbnN0ICQgPSBjaGVlcmlvLmxvYWQoaHRtbCk7XHJcbiAgICAgICQoJ3NjcmlwdFtzcmM9XCIvQHJlYWN0LXJlZnJlc2hcIl0nKS5yZW1vdmUoKTtcclxuICAgICAgcmV0dXJuICQuaHRtbCgpO1xyXG4gICAgfSxcclxuICB9O1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xyXG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgJycpO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgYmFzZTogJ2h0dHBzOi8vZ2lnc21hbnVhbC5oYXJ4LmFpLycsXHJcbiAgICBwbHVnaW5zOiBbXHJcbiAgICAgIHJlYWN0KHtcclxuICAgICAgICBqc3hSdW50aW1lOiAnY2xhc3NpYycsXHJcbiAgICAgIH0pLFxyXG4gICAgICBxaWFua3VuKCdhcHA2Jywge1xyXG4gICAgICAgIHVzZURldk1vZGU6IHRydWUsXHJcbiAgICAgIH0pLFxyXG4gICAgICByZW1vdmVSZWFjdFJlZnJlc2hTY3JpcHQoKSwgLy8gQWRkIHRoZSBzY3JpcHQgcmVtb3ZhbCBwbHVnaW5cclxuICAgIF0sXHJcblxyXG4gICAgZGVmaW5lOiB7XHJcbiAgICAgICdpbXBvcnQubWV0YS5lbnYnOiBlbnYsXHJcbiAgICB9LFxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgIHBvcnQ6IDUxNzgsXHJcbiAgICAgIGNvcnM6IHRydWUsXHJcbiAgICAgIGhtcjogZmFsc2UsXHJcbiAgICAgIGZzOiB7XHJcbiAgICAgICAgc3RyaWN0OiB0cnVlLCAvLyBFbnN1cmUgc3RhdGljIGFzc2V0cyBhcmUgY29ycmVjdGx5IHJlc29sdmVkXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgYnVpbGQ6IHtcclxuICAgICAgdGFyZ2V0OiAnZXNuZXh0JyxcclxuICAgICAgY3NzQ29kZVNwbGl0OiBmYWxzZSxcclxuICAgICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAgIG91dHB1dDoge1xyXG4gICAgICAgICAgZm9ybWF0OiAndW1kJyxcclxuICAgICAgICAgIG5hbWU6ICdhcHA2JyxcclxuICAgICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnaW5kZXguanMnLCAvLyBGaXhlZCBuYW1lIGZvciB0aGUgSlMgZW50cnkgZmlsZVxyXG4gICAgICAgICAgY2h1bmtGaWxlTmFtZXM6ICdjaHVuay1bbmFtZV0uanMnLCAvLyBGaXhlZCBuYW1lIGZvciBjaHVua3NcclxuICAgICAgICAgIGFzc2V0RmlsZU5hbWVzOiAoYXNzZXRJbmZvKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIEVuc3VyZSBDU1MgZmlsZXMgYXJlIGNvbnNpc3RlbnRseSBuYW1lZFxyXG4gICAgICAgICAgICBpZiAoYXNzZXRJbmZvLm5hbWUuZW5kc1dpdGgoJy5jc3MnKSkge1xyXG4gICAgICAgICAgICAgIHJldHVybiAnaW5kZXguY3NzJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gJ1tuYW1lXS5bZXh0XSc7IC8vIERlZmF1bHQgZm9yIG90aGVyIGFzc2V0IHR5cGVzXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICBhbGlhczoge1xyXG4gICAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9O1xyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFzVixTQUFTLGNBQWMsZUFBZTtBQUM1WCxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sYUFBYTtBQUNwQixZQUFZLGFBQWE7QUFKekIsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTSwyQkFBMkIsTUFBTTtBQUNyQyxTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixtQkFBbUIsTUFBVztBQUM1QixZQUFNLElBQVksYUFBSyxJQUFJO0FBQzNCLFFBQUUsK0JBQStCLEVBQUUsT0FBTztBQUMxQyxhQUFPLEVBQUUsS0FBSztBQUFBLElBQ2hCO0FBQUEsRUFDRjtBQUNGO0FBRUEsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBRTNDLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxNQUNQLE1BQU07QUFBQSxRQUNKLFlBQVk7QUFBQSxNQUNkLENBQUM7QUFBQSxNQUNELFFBQVEsUUFBUTtBQUFBLFFBQ2QsWUFBWTtBQUFBLE1BQ2QsQ0FBQztBQUFBLE1BQ0QseUJBQXlCO0FBQUE7QUFBQSxJQUMzQjtBQUFBLElBRUEsUUFBUTtBQUFBLE1BQ04sbUJBQW1CO0FBQUEsSUFDckI7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLEtBQUs7QUFBQSxNQUNMLElBQUk7QUFBQSxRQUNGLFFBQVE7QUFBQTtBQUFBLE1BQ1Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsTUFDUixjQUFjO0FBQUEsTUFDZCxlQUFlO0FBQUEsUUFDYixRQUFRO0FBQUEsVUFDTixRQUFRO0FBQUEsVUFDUixNQUFNO0FBQUEsVUFDTixnQkFBZ0I7QUFBQTtBQUFBLFVBQ2hCLGdCQUFnQjtBQUFBO0FBQUEsVUFDaEIsZ0JBQWdCLENBQUMsY0FBYztBQUU3QixnQkFBSSxVQUFVLEtBQUssU0FBUyxNQUFNLEdBQUc7QUFDbkMscUJBQU87QUFBQSxZQUNUO0FBQ0EsbUJBQU87QUFBQSxVQUNUO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxLQUFLO0FBQUEsTUFDcEM7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
