// core_engines/TrustScoreMaterializer.ts
import { gridBus } from '../domain/core/EventBus';
import { db } from '../packages/utils/db';
/**
 * THE REPUTATION BRAIN
 * This script is a "listener." It waits for the system to say 
 * "Hey, someone's reputation changed!" and then it does the math 
 * to update their Trust Score in the database.
 * 
 * We do this in the background so that the main app stays fast.
 */


// Listen for the 'REPUTATION_UPDATED' event from the network pulse
gridBus.subscribe('REPUTATION_UPDATED', async (payload: { userId: string }) => {
  const { userId } = payload;
  try {
    /**
     * THE SCORE MATH:
     * We look at all reactions to the user's posts.
     * 
     * - A 'Like' gives them +0.1 points.
     * - 'Insightful' gives them +0.5 points (High value).
     * - 'Toxic' takes away -1.0 points (Bad behavior).
     * 
     * Everyone starts with a baseline of 10.0 points.
     */
    const result = await db.query(`
      SELECT 
        COALESCE(SUM(
          CASE 
            WHEN r.reaction_type = 'like' THEN 0.1
            WHEN r.reaction_type = 'insightful' THEN 0.5
            WHEN r.reaction_type = 'toxic' THEN -1.0
            ELSE 0.1 
          END
        ), 0) + 10.0 as raw_total
      FROM reactions r
      JOIN timeline_posts p ON r.entity_id = p.id
      JOIN users actor ON r.user_id = actor.id
      WHERE p.author_id = $1 
        AND actor.status = 'active'
    `, [userId]);

    const rawTotal = parseFloat(result.rows[0].raw_total);
    /**
     * SAFETY LIMITS:
     * We "clamp" the score so it stays between 0 and 100. 
     * You can't have negative trust, and you can't be more than 100% trusted.
     */
    const finalizedScore = Math.min(Math.max(rawTotal, 0.0), 100.0);

    // Save the new score to the user's profile
    await db.query(`
      UPDATE users 
      SET trust_score = $1, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `, [finalizedScore.toFixed(2), userId]);
    console.log(`[Trust Update] Node ${userId.slice(0, 8)} is now at ${finalizedScore.toFixed(2)}%`);
  } catch (err) {
    console.error(`[!] Failed to update reputation for user: ${userId}`);
  }
});


// Confirm the brain is active in the server logs
console.log("[System] TrustScoreMaterializer is online and listening.");
