import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import * as cheerio from "cheerio";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API for downloading
  app.post("/api/download", async (req, res) => {
    const { url, format, quality, platform } = req.body;
    
    try {
      let title = "Downloaded Media";
      let thumbnail = "https://picsum.photos/seed/video/320/180";
      let downloadUrl = "https://www.w3schools.com/html/mov_bbb.mp4"; // Fallback video
      
      if (platform === 'youtube') {
        try {
          // Fetch real metadata from YouTube oEmbed
          const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
          if (oembedRes.ok) {
            const data = await oembedRes.json();
            title = data.title || title;
            thumbnail = data.thumbnail_url || thumbnail;
          }
        } catch (e) {
          console.error("YouTube oEmbed failed", e);
        }
      } else {
        try {
          // Generic metadata scraper for other platforms
          const pageRes = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          if (pageRes.ok) {
            const html = await pageRes.text();
            const $ = cheerio.load(html);
            const ogTitle = $('meta[property="og:title"]').attr('content');
            const ogImage = $('meta[property="og:image"]').attr('content');
            
            if (ogTitle) title = ogTitle;
            if (ogImage) thumbnail = ogImage;
          }
        } catch (e) {
          console.error("Generic scraper failed", e);
        }
      }

      // Simulate processing time
      setTimeout(() => {
        res.json({
          success: true,
          message: "Download ready",
          data: {
            title,
            downloadUrl,
            thumbnail,
            format,
            quality
          }
        });
      }, 2000);

    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to process video" });
    }
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
