import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

export const mediaTypeEnum = pgEnum("media_type", ["video", "image"]);

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  mediaType: mediaTypeEnum("media_type").notNull(),
  fileUrl: text("file_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  duration: text("duration"),
  views: integer("views").default(0).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  uploadDate: timestamp("upload_date").defaultNow().notNull(),
  uploadedBy: integer("uploaded_by").notNull()
});

export const insertMediaSchema = createInsertSchema(media).omit({
  id: true,
  views: true,
});

export const supporters = pgTable("supporters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  supportAmount: integer("support_amount").notNull(),
  rank: integer("rank").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull()
});

export const insertSupporterSchema = createInsertSchema(supporters).omit({
  id: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Media = typeof media.$inferSelect;
export type InsertMedia = z.infer<typeof insertMediaSchema>;

export type Supporter = typeof supporters.$inferSelect;
export type InsertSupporter = z.infer<typeof insertSupporterSchema>;
