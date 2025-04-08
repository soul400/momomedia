import { users, type User, type InsertUser, media, type Media, type InsertMedia, supporters, type Supporter, type InsertSupporter } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// استخدام connect-pg-simple لتخزين جلسات في PostgreSQL
const PostgresSessionStore = connectPg(session);

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

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
    
    // التحقق مما إذا كان المستخدم الإداري موجوداً بالفعل
    this.getUserByUsername("admin").then(user => {
      if (!user) {
        // إنشاء مستخدم إداري افتراضي إذا لم يكن موجوداً
        this.createUser({
          username: "admin",
          password: "adminpassword", // سيتم تشفيره في auth.ts
          isAdmin: true
        });
      }
    }).catch(err => {
      console.error("Error checking for admin user:", err);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Media methods
  async getAllMedia(): Promise<Media[]> {
    return await db.select().from(media);
  }

  async getMediaById(id: number): Promise<Media | undefined> {
    const [mediaItem] = await db.select().from(media).where(eq(media.id, id));
    return mediaItem;
  }

  async getMediaByYearMonth(year: number, month: number): Promise<Media[]> {
    return await db.select().from(media).where(
      and(
        eq(media.year, year),
        eq(media.month, month)
      )
    );
  }

  async getFeaturedMedia(): Promise<Media[]> {
    return await db.select().from(media).where(eq(media.isFeatured, true));
  }

  async createMedia(insertMedia: InsertMedia): Promise<Media> {
    const [mediaItem] = await db.insert(media).values({
      ...insertMedia,
      views: 0
    }).returning();
    return mediaItem;
  }

  async updateMedia(id: number, updateData: Partial<Media>): Promise<Media | undefined> {
    const [updatedMedia] = await db.update(media)
      .set(updateData)
      .where(eq(media.id, id))
      .returning();
    return updatedMedia;
  }

  async deleteMedia(id: number): Promise<boolean> {
    const result = await db.delete(media).where(eq(media.id, id));
    return result.count > 0;
  }

  // Supporter methods
  async getAllSupporters(): Promise<Supporter[]> {
    return await db.select().from(supporters);
  }

  async getTopSupporters(year: number, month: number, limit: number): Promise<Supporter[]> {
    return await db.select().from(supporters)
      .where(
        and(
          eq(supporters.year, year),
          eq(supporters.month, month)
        )
      )
      .orderBy(supporters.rank)
      .limit(limit);
  }

  async createSupporter(insertSupporter: InsertSupporter): Promise<Supporter> {
    const [supporter] = await db.insert(supporters)
      .values(insertSupporter)
      .returning();
    return supporter;
  }

  async updateSupporter(id: number, updateData: Partial<Supporter>): Promise<Supporter | undefined> {
    const [updatedSupporter] = await db.update(supporters)
      .set(updateData)
      .where(eq(supporters.id, id))
      .returning();
    return updatedSupporter;
  }

  async deleteSupporter(id: number): Promise<boolean> {
    const result = await db.delete(supporters).where(eq(supporters.id, id));
    return result.count > 0;
  }
}

export const storage = new DatabaseStorage();
