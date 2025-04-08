import { users, type User, type InsertUser, media, type Media, type InsertMedia, supporters, type Supporter, type InsertSupporter } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Media operations
  getAllMedia(): Promise<Media[]>;
  getMediaById(id: number): Promise<Media | undefined>;
  getMediaByYearMonth(year: number, month: number): Promise<Media[]>;
  getFeaturedMedia(): Promise<Media[]>;
  createMedia(media: InsertMedia): Promise<Media>;
  updateMedia(id: number, media: Partial<Media>): Promise<Media | undefined>;
  deleteMedia(id: number): Promise<boolean>;
  
  // Supporter operations
  getAllSupporters(): Promise<Supporter[]>;
  getTopSupporters(year: number, month: number, limit: number): Promise<Supporter[]>;
  createSupporter(supporter: InsertSupporter): Promise<Supporter>;
  updateSupporter(id: number, supporter: Partial<Supporter>): Promise<Supporter | undefined>;
  deleteSupporter(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private media: Map<number, Media>;
  private supporters: Map<number, Supporter>;
  private userId: number;
  private mediaId: number;
  private supporterId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.media = new Map();
    this.supporters = new Map();
    this.userId = 1;
    this.mediaId = 1;
    this.supporterId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Create default admin user
    this.createUser({
      username: "admin",
      password: "adminpassword", // This will be hashed in auth.ts
      isAdmin: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Media methods
  async getAllMedia(): Promise<Media[]> {
    return Array.from(this.media.values());
  }

  async getMediaById(id: number): Promise<Media | undefined> {
    return this.media.get(id);
  }

  async getMediaByYearMonth(year: number, month: number): Promise<Media[]> {
    return Array.from(this.media.values()).filter(
      (media) => media.year === year && media.month === month
    );
  }

  async getFeaturedMedia(): Promise<Media[]> {
    return Array.from(this.media.values()).filter(
      (media) => media.isFeatured
    );
  }

  async createMedia(insertMedia: InsertMedia): Promise<Media> {
    const id = this.mediaId++;
    const media: Media = { ...insertMedia, id, views: 0 };
    this.media.set(id, media);
    return media;
  }

  async updateMedia(id: number, updateData: Partial<Media>): Promise<Media | undefined> {
    const media = this.media.get(id);
    if (!media) {
      return undefined;
    }
    
    const updatedMedia = { ...media, ...updateData };
    this.media.set(id, updatedMedia);
    return updatedMedia;
  }

  async deleteMedia(id: number): Promise<boolean> {
    return this.media.delete(id);
  }

  // Supporter methods
  async getAllSupporters(): Promise<Supporter[]> {
    return Array.from(this.supporters.values());
  }

  async getTopSupporters(year: number, month: number, limit: number): Promise<Supporter[]> {
    return Array.from(this.supporters.values())
      .filter((supporter) => supporter.year === year && supporter.month === month)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, limit);
  }

  async createSupporter(insertSupporter: InsertSupporter): Promise<Supporter> {
    const id = this.supporterId++;
    const supporter: Supporter = { ...insertSupporter, id };
    this.supporters.set(id, supporter);
    return supporter;
  }

  async updateSupporter(id: number, updateData: Partial<Supporter>): Promise<Supporter | undefined> {
    const supporter = this.supporters.get(id);
    if (!supporter) {
      return undefined;
    }
    
    const updatedSupporter = { ...supporter, ...updateData };
    this.supporters.set(id, updatedSupporter);
    return updatedSupporter;
  }

  async deleteSupporter(id: number): Promise<boolean> {
    return this.supporters.delete(id);
  }
}

export const storage = new MemStorage();
