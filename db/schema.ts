import { pgTable, text, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const packages = pgTable("packages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").unique().notNull(),
  description: text("description"),
  version: text("version"),
  maintainerId: text("maintainer_id"),
  githubRepo: text("github_repo"),
  downloads: integer("downloads").default(0),
  tokensRaised: text("tokens_raised").default("0"),
  fundingGoal: text("funding_goal"),
  fundingLinks: jsonb("funding_links").$type<Array<{ type: string; url: string }>>(),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const maintainers = pgTable("maintainers", {
  id: text("id").primaryKey(), // GitHub ID
  username: text("username").notNull(),
  avatarUrl: text("avatar_url"),
  ethereumAddress: text("ethereum_address"),
  isVerified: boolean("is_verified").default(false),
});

export const fundingEvents = pgTable("funding_events", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  packageId: integer("package_id").references(() => packages.id),
  amount: text("amount").notNull(),
  fromAddress: text("from_address").notNull(),
  txHash: text("tx_hash").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertPackageSchema = createInsertSchema(packages);
export const selectPackageSchema = createSelectSchema(packages);
export type Package = z.infer<typeof selectPackageSchema>;

export const insertMaintainerSchema = createInsertSchema(maintainers);
export const selectMaintainerSchema = createSelectSchema(maintainers);
export type Maintainer = z.infer<typeof selectMaintainerSchema>;

export const insertFundingEventSchema = createInsertSchema(fundingEvents);
export const selectFundingEventSchema = createSelectSchema(fundingEvents);
export type FundingEvent = z.infer<typeof selectFundingEventSchema>;
