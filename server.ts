import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import * as cheerio from "cheerio";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Handle OPTIONS request for CORS preflight
  app.options("/api/download", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.sendStatus(200);
  });

  // API for downloading
  app.post("/api/download", async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    console.log("Received POST /api/download request:", req.body);
    const { url, format, quality, platform } = req.body;
    
    try {
      let title = "Downloaded Media";
      let thumbnail = "https://picsum.photos/seed/video/320/180";
      
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

      // Map format and quality to loader.to format
      let loaderFormat = '720';
      if (format === 'mp4') {
        if (quality === 'high') loaderFormat = '1080';
        else if (quality === 'medium') loaderFormat = '720';
        else if (quality === 'low') loaderFormat = '360';
      } else if (format === 'mp3') {
        loaderFormat = 'mp3';
      }

      // Call loader.to API
      const loaderUrl = `https://loader.to/ajax/download.php?button=1&start=1&end=1&format=${loaderFormat}&url=${encodeURIComponent(url)}`;
      const loaderRes = await fetch(loaderUrl);
      
      if (!loaderRes.ok) {
        throw new Error("Failed to initiate download with provider");
      }
      
      const loaderData = await loaderRes.json();
      
      if (!loaderData.success || !loaderData.id) {
        throw new Error("Provider returned an error");
      }

      res.json({
        success: true,
        message: "Download initiated",
        data: {
          title: loaderData.title || title,
          thumbnail: loaderData.info?.image || thumbnail,
          format,
          quality,
          jobId: loaderData.id,
          progressUrl: loaderData.progress_url || `https://p.savenow.to/api/progress?id=${loaderData.id}`
        }
      });

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
