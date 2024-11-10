import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Express } from "express";
import { db } from "db";
import { maintainers } from "db/schema";
import { eq } from "drizzle-orm";

export function setupGithubAuth(app: Express) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        callbackURL: "/auth/github/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let [maintainer] = await db
            .select()
            .from(maintainers)
            .where(eq(maintainers.id, profile.id))
            .limit(1);

          if (!maintainer) {
            [maintainer] = await db
              .insert(maintainers)
              .values({
                id: profile.id,
                username: profile.username!,
                avatarUrl: profile._json.avatar_url,
              })
              .returning();
          }

          done(null, maintainer);
        } catch (err) {
          done(err);
        }
      }
    )
  );

  app.get("/auth/github", passport.authenticate("github", { scope: ["user"] }));

  app.get(
    "/auth/github/callback",
    passport.authenticate("github", { failureRedirect: "/login" }),
    (req, res) => {
      res.redirect("/dashboard");
    }
  );
}
