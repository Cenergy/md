import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { exec } from "child_process";

const localBuildPlugin = () => ({
  name: "local-build-plugin",
  configureServer(server) {
    server.middlewares.use("/api/local-build", (req, res, next) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const projectId = url.searchParams.get("projectId");
      console.log(
        `Triggering local build for project: ${projectId || "default"}...`,
      );

      const env = { ...process.env };
      if (projectId) {
        env.PROJECT_ID = projectId;
      }

      exec("npm run build:docs", { env }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Build error: ${error}`);
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: error.message }));
          return;
        }
        console.log(`Build stdout: ${stdout}`);
        if (stderr) console.error(`Build stderr: ${stderr}`);

        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            success: true,
            message: "Build completed successfully",
          }),
        );
      });
    });
  },
});

export default defineConfig({
  plugins: [vue(), localBuildPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/glicon": {
        target: "http://localhost:3001",
        // target: 'https://mdpress.glicon.design/common',
        // rewrite: (path) => path.replace(/^\/glicon/, ''),
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
