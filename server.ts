import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock API for downloading
  app.post("/api/download", (req, res) => {
    const { url, format, quality } = req.body;
    
    // Simulate processing time
    setTimeout(() => {
      res.json({
        success: true,
        message: "Download ready",
        data: {
          title: "Sample Downloaded Media",
          downloadUrl: "https://www.w3schools.com/html/mov_bbb.mp4", // Sample video
          thumbnail: "https://picsum.photos/seed/video/320/180",
          format,
          quality
        }
      });
    }, 3000);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
