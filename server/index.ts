import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { createServer } from "http";
import { db } from "db";
import { packages } from "db/schema";
import { getPopularPackages, getGithubRepoFromNpm } from "../client/src/lib/npm";
import { eq } from "drizzle-orm";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

async function seedDatabase() {
  try {
    console.log("Fetching popular packages with funding info...");
    const npmPackages = await getPopularPackages();
    
    for (const pkg of npmPackages) {
      // Check if package already exists
      const [existing] = await db
        .select()
        .from(packages)
        .where(eq(packages.name, pkg.name))
        .limit(1);

      const packageData = {
        name: pkg.name,
        description: pkg.description,
        version: pkg.version,
        downloads: pkg.downloads,
        githubRepo: getGithubRepoFromNpm(pkg),
        fundingLinks: pkg.funding,
        lastUpdated: new Date(),
      };

      if (existing) {
        // Update existing package
        await db
          .update(packages)
          .set(packageData)
          .where(eq(packages.id, existing.id));
        console.log(`Updated package: ${pkg.name}`);
      } else {
        // Insert new package
        await db.insert(packages).values(packageData);
        console.log(`Added new package: ${pkg.name}`);
      }
    }
    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

(async () => {
  registerRoutes(app);
  const server = createServer(app);

  // Run database seeding
  await seedDatabase();
  
  // Set up a periodic update every 12 hours
  setInterval(seedDatabase, 12 * 60 * 60 * 1000);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client
  const PORT = 5000;
  server.listen(PORT, "0.0.0.0", () => {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    console.log(`${formattedTime} [express] serving on port ${PORT}`);
  });
})();
