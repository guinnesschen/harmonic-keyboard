import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function registerRoutes(app: Express): Server {
  // Serve the PDF file statically
  app.get('/sheet-music.pdf', (req, res) => {
    const pdfPath = path.join(__dirname, '../attached_assets/Harmonic Keyboard sheet music.pdf');
    res.sendFile(pdfPath);
  });

  const httpServer = createServer(app);
  return httpServer;
}