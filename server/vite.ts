// import express, { type Express } from "express";
// import fs from "fs";
// import path from "path";
// import { createServer as createViteServer, createLogger } from "vite";
// import { type Server } from "http";
// import viteConfig from "../vite.config";
// import { nanoid } from "nanoid";

// const viteLogger = createLogger();

// export function log(message: string, source = "express") {
//   const formattedTime = new Date().toLocaleTimeString("en-US", {
//     hour: "numeric",
//     minute: "2-digit",
//     second: "2-digit",
//     hour12: true,
//   });

//   console.log(`${formattedTime} [${source}] ${message}`);
// }

// export async function setupVite(app: Express, server: Server) {
//   const serverOptions = {
//     middlewareMode: true,
//     hmr: { server },
//     allowedHosts: true as const,
//   };

//   const vite = await createViteServer({
//     ...viteConfig,
//     configFile: false,
//     customLogger: {
//       ...viteLogger,
//       error: (msg, options) => {
//         viteLogger.error(msg, options);
//         process.exit(1);
//       },
//     },
//     server: serverOptions,
//     appType: "custom",
//   });

//   app.use(vite.middlewares);
//   app.use("*", async (req, res, next) => {
//     const url = req.originalUrl;

//     try {
//       const clientTemplate = path.resolve(
//         import.meta.dirname,
//         "..",
//         "client",
//         "index.html",
//       );

//       // always reload the index.html file from disk incase it changes
//       let template = await fs.promises.readFile(clientTemplate, "utf-8");
//       template = template.replace(
//         `src="/src/main.tsx"`,
//         `src="/src/main.tsx?v=${nanoid()}"`,
//       );
//       const page = await vite.transformIndexHtml(url, template);
//       res.status(200).set({ "Content-Type": "text/html" }).end(page);
//     } catch (e) {
//       vite.ssrFixStacktrace(e as Error);
//       next(e);
//     }
//   });
// }

// export function serveStatic(app: Express) {
//   const distPath = path.resolve(import.meta.dirname, "public");

//   if (!fs.existsSync(distPath)) {
//     throw new Error(
//       `Could not find the build directory: ${distPath}, make sure to build the client first`,
//     );
//   }

//   app.use(express.static(distPath));

//   // fall through to index.html if the file doesn't exist
//   app.use("*", (_req, res) => {
//     res.sendFile(path.resolve(distPath, "index.html"));
//   });
// }


import type { Express, ViteDevServer } from "express";
import path from "path";
import fs from "fs";
import express from "express";

export const log = (msg: string) => console.log(`[express] ${msg}`);

export async function setupVite(app: Express, server: any): Promise<void> {
  // Only import vite in development
  const { createServer } = await import("vite");

  const vite = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e: any) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}

export function serveStatic(app: Express): void {
  // Serve static files from dist/public in production
  const publicDir = path.resolve(import.meta.dirname, "..", "dist", "public");

  // Check if public directory exists
  if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));

    // SPA fallback: serve index.html for all unknown routes
    app.use("*", (req, res) => {
      const indexPath = path.join(publicDir, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Client build not found. Run npm run build");
      }
    });
  } else {
    log(`WARNING: Public directory not found at ${publicDir}`);
    app.use("*", (req, res) => {
      res.status(404).json({
        error: "Client build not found",
        message: "Run npm run build before starting production server",
      });
    });
  }
}