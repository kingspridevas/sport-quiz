import express, { type Express, type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, type ViteDevServer } from "vite";
import { type Server } from "http";

export function log(message: string) {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [express] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({
    configFile: path.resolve(process.cwd(), "vite.config.ts"),
    server: { 
      middlewareMode: true,
      hmr: { server }
    },
    appType: "spa",
    root: path.resolve(process.cwd(), "client"),
  });

  app.use(vite.middlewares);

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    
    const url = req.originalUrl;
    const clientHtmlPath = path.resolve(process.cwd(), "client", "index.html");
    
    if (!fs.existsSync(clientHtmlPath)) {
      return res.status(404).send("Client index.html not found");
    }

    fs.readFile(clientHtmlPath, "utf-8", async (err, html) => {
      if (err) {
        return next(err);
      }
      try {
        html = await vite.transformIndexHtml(url, html);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  });

  return server;
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist/public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  app.use((req: Request, res: Response) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
