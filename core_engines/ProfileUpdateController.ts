// core_engines/ProfileUpdateController.ts
import { Request, Response } from 'express';
import { db } from '../packages/utils/db';

/**
 * THE PROFILE ENGINE
 * This file handles all the data when you click "Save" on your profile.
 * It manages both your personal info (like your Bio) and your visual 
 * design (like your theme colors and layout settings).
 */
export class ProfileUpdateController {

  /**
   * update:
   * This function runs when the frontend sends a PATCH request.
   */
  update = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      let updates = req.body;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      // --- 1. DATA PREP ---
      // If the user updated their design in Studio Mode, we wrap those 
      // settings into the 'profile_theme' block so the database stays organized.
      if (updates.main || updates.timeline || updates.about_page) {
        updates = { profile_theme: updates };
      }

      // --- 2. THE DATABASE COMMIT ---
      // We use a transaction here to make sure either everything saves, 
      // or nothing saves. This prevents half-saved data if the server lags.
      const result = await db.transaction(async (tx) => {
        const updateRes = await tx.query(`
          UPDATE users 
          SET display_name = COALESCE($1, display_name),
              bio = COALESCE($2, bio),
              city = COALESCE($3, city),
              country = COALESCE($4, country),
              website = COALESCE($5, website),
              profile_theme = COALESCE($6, profile_theme),
              social_links = COALESCE($7, social_links),
              reality_mode = COALESCE($8, reality_mode),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $9
          RETURNING 
              id, username, display_name, email, bio, avatar_url, cover_url, 
              gender, birthdate, city, country, website, social_links, 
              profile_layout, profile_theme, reality_mode,
              subscription_tier, status, created_at, trust_score
        `, [
          updates.display_name || null, 
          updates.bio || null, 
          updates.city || null, 
          updates.country || null, 
          updates.website || null, 
          updates.profile_theme ? JSON.stringify(updates.profile_theme) : null,
          updates.social_links ? JSON.stringify(updates.social_links) : null,
          updates.reality_mode || null,
          userId
        ]);

        if (updateRes.rows.length === 0) throw new Error("USER_NOT_FOUND");

        // --- 3. SYSTEM LOGGING ---
        // We log what was changed so the user can see it in their activity history.
        let action = 'IDENTITY_UPDATED';
        if (updates.bio && !updates.display_name) action = 'BIO_UPDATED';
        if (updates.profile_theme) action = 'LAYOUT_RECONFIGURED';
        await tx.query(`
          INSERT INTO audit_logs (actor_id, action_slug, metadata, ip_address, user_agent)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          userId, 
          action, 
          JSON.stringify({ changed: Object.keys(updates) }),
          req.ip || '0.0.0.0', 
          req.headers['user-agent'] || 'unknown'
        ]);
        return updateRes.rows[0];
      });

      // --- 4. THE HANDSHAKE ---
      // We parse the database data back into clean JSON objects. 
      // This lets the UI update instantly without the user having to refresh.
      const clean = (data: any) => {
        if (!data) return {};
        return typeof data === 'string' ? JSON.parse(data) : data;
      };

      const finalData = {
        ...result,
        social_links: clean(result.social_links),
        profile_theme: clean(result.profile_theme),
        profile_layout: clean(result.profile_layout)
      };

      console.log(`[OK] Profile updated for node: ${finalData.username}`);
      return res.json({
        success: true,
        data: finalData
      });

    } catch (e: any) {
      console.error("[-] Profile update failed:", e.message);
      return res.status(500).json({ success: false, error: 'Database rejected the changes.' });
    }
  };
}

