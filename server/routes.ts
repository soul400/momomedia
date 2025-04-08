import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import multer from "multer";
import fs from "fs";
import path from "path";
import { insertMediaSchema, insertSupporterSchema } from "@shared/schema";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage_config,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

// Admin middleware
function isAdmin(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', express.static(uploadsDir));

  // Media endpoints
  app.get("/api/media", async (req, res) => {
    try {
      const media = await storage.getAllMedia();
      res.json(media);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  app.get("/api/media/featured", async (req, res) => {
    try {
      const featuredMedia = await storage.getFeaturedMedia();
      res.json(featuredMedia);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured media" });
    }
  });

  app.get("/api/media/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const media = await storage.getMediaById(id);
      
      if (!media) {
        return res.status(404).json({ message: "Media not found" });
      }
      
      // Increment view count
      await storage.updateMedia(id, { views: media.views + 1 });
      
      res.json(media);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  app.get("/api/media/year/:year/month/:month", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      
      if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ message: "Invalid year or month" });
      }
      
      const media = await storage.getMediaByYearMonth(year, month);
      res.json(media);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch media by year and month" });
    }
  });

  // Media upload endpoint (admin only)
  app.post("/api/media", isAdmin, upload.fields([
    { name: 'media', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (!files.media || !files.media.length) {
        return res.status(400).json({ message: "No media file uploaded" });
      }
      
      const mediaFile = files.media[0];
      const thumbnailFile = files.thumbnail?.[0];
      
      const mediaType = mediaFile.mimetype.startsWith('video/') ? 'video' : 'image';
      
      // Validate with zod schema
      const mediaData = insertMediaSchema.parse({
        ...req.body,
        year: parseInt(req.body.year),
        month: parseInt(req.body.month),
        mediaType,
        fileUrl: `/uploads/${mediaFile.filename}`,
        thumbnailUrl: thumbnailFile ? `/uploads/${thumbnailFile.filename}` : null,
        uploadDate: new Date(),
        uploadedBy: req.user!.id,
        isFeatured: req.body.isFeatured === 'true'
      });
      
      const createdMedia = await storage.createMedia(mediaData);
      res.status(201).json(createdMedia);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid media data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to upload media" });
    }
  });

  // Update media (admin only)
  app.put("/api/media/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const media = await storage.getMediaById(id);
      
      if (!media) {
        return res.status(404).json({ message: "Media not found" });
      }
      
      const updatedMedia = await storage.updateMedia(id, {
        title: req.body.title || media.title,
        description: req.body.description || media.description,
        isFeatured: req.body.isFeatured !== undefined ? req.body.isFeatured : media.isFeatured
      });
      
      res.json(updatedMedia);
    } catch (error) {
      res.status(500).json({ message: "Failed to update media" });
    }
  });

  // Delete media (admin only)
  app.delete("/api/media/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const media = await storage.getMediaById(id);
      
      if (!media) {
        return res.status(404).json({ message: "Media not found" });
      }
      
      // Delete files from disk
      if (media.fileUrl) {
        const filePath = path.join(process.cwd(), media.fileUrl.replace(/^\/uploads/, 'uploads'));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      if (media.thumbnailUrl) {
        const thumbnailPath = path.join(process.cwd(), media.thumbnailUrl.replace(/^\/uploads/, 'uploads'));
        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath);
        }
      }
      
      await storage.deleteMedia(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete media" });
    }
  });

  // Supporter endpoints
  app.get("/api/supporters", async (req, res) => {
    try {
      const supporters = await storage.getAllSupporters();
      res.json(supporters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supporters" });
    }
  });

  app.get("/api/supporters/top", async (req, res) => {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      const limit = parseInt(req.query.limit as string) || 6;
      
      const topSupporters = await storage.getTopSupporters(year, month, limit);
      res.json(topSupporters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top supporters" });
    }
  });

  // Create supporter (admin only)
  app.post("/api/supporters", isAdmin, async (req, res) => {
    try {
      const supporterData = insertSupporterSchema.parse({
        ...req.body,
        supportAmount: parseInt(req.body.supportAmount),
        rank: parseInt(req.body.rank),
        year: parseInt(req.body.year),
        month: parseInt(req.body.month)
      });
      
      const supporter = await storage.createSupporter(supporterData);
      res.status(201).json(supporter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid supporter data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create supporter" });
    }
  });

  // Update supporter (admin only)
  app.put("/api/supporters/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const supporter = await storage.updateSupporter(id, req.body);
      
      if (!supporter) {
        return res.status(404).json({ message: "Supporter not found" });
      }
      
      res.json(supporter);
    } catch (error) {
      res.status(500).json({ message: "Failed to update supporter" });
    }
  });

  // Delete supporter (admin only)
  app.delete("/api/supporters/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSupporter(id);
      
      if (!success) {
        return res.status(404).json({ message: "Supporter not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete supporter" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}

import express from 'express';
