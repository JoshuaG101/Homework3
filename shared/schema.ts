import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Product schema
export const products = pgTable("products", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

export const insertProductSchema = createInsertSchema(products);
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Transaction schema
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  items: text("items").array().notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, timestamp: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Frontend-only types for mining results
export type FrequentItemset = {
  items: string[];
  support: number;
  count: number;
};

export type AssociationRule = {
  antecedent: string[];
  consequent: string[];
  support: number;
  confidence: number;
  lift: number;
};

export type MiningResult = {
  frequentItemsets: FrequentItemset[];
  rules: AssociationRule[];
  totalTransactions: number;
  processingTime: number;
};

export type MiningConfig = {
  minSupport: number;
  minConfidence: number;
};

// Statistics type
export type TransactionStats = {
  totalTransactions: number;
  uniqueItems: number;
  avgItemsPerTransaction: number;
  mostFrequentItems: { item: string; count: number }[];
};
