import { Express } from "express";
import { setupAuth } from "./auth";
import { db } from "db";
import { packages, fundingEvents } from "db/schema";
import { eq, like } from "drizzle-orm";
import { setupGithubAuth } from "./github";

export function registerRoutes(app: Express) {
  setupAuth(app);
  setupGithubAuth(app);

  // Get all packages with optional search
  app.get("/api/packages", async (req, res) => {
    try {
      const { search } = req.query;
      let query = db.select().from(packages);
      
      if (search) {
        query = query.where(like(packages.name, `%${search}%`));
      }
      
      const results = await query;
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch packages" });
    }
  });

  // Get single package details
  app.get("/api/packages/:name", async (req, res) => {
    try {
      const [pkg] = await db
        .select()
        .from(packages)
        .where(eq(packages.name, req.params.name))
        .limit(1);

      if (!pkg) {
        return res.status(404).json({ error: "Package not found" });
      }

      res.json(pkg);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch package" });
    }
  });

  // Get package funding events
  app.get("/api/packages/:name/events", async (req, res) => {
    try {
      const [pkg] = await db
        .select()
        .from(packages)
        .where(eq(packages.name, req.params.name))
        .limit(1);

      if (!pkg) {
        return res.status(404).json({ error: "Package not found" });
      }

      const events = await db
        .select()
        .from(fundingEvents)
        .where(eq(fundingEvents.packageId, pkg.id))
        .orderBy(fundingEvents.timestamp);

      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  // Record a new funding event
  app.post("/api/packages/:name/fund", async (req, res) => {
    try {
      const [pkg] = await db
        .select()
        .from(packages)
        .where(eq(packages.name, req.params.name))
        .limit(1);

      if (!pkg) {
        return res.status(404).json({ error: "Package not found" });
      }

      const { amount, fromAddress, txHash } = req.body;

      const [event] = await db
        .insert(fundingEvents)
        .values({
          packageId: pkg.id,
          amount,
          fromAddress,
          txHash,
        })
        .returning();

      // Update package total
      await db
        .update(packages)
        .set({
          tokensRaised: (
            Number(pkg.tokensRaised) + Number(amount)
          ).toString(),
        })
        .where(eq(packages.id, pkg.id));

      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to record funding" });
    }
  });
}
