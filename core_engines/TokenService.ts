// core_engines/TokenService.ts
import jwt from 'jsonwebtoken';
import { db } from '../packages/utils/db';
import crypto from 'crypto';


/**
 * THE SESSION VAULT
 * This class handles all the security "keys" (tokens) for the app. 
 * It issues a short-lived key for browsing and a long-lived key 
 * to keep you logged in. It also makes sure these keys are 
 * scrambled before they touch the database.
 */

export class TokenService {
  private readonly ACCESS_SECRET = process.env.JWT_SECRET || 'tg_access_fallback';
  private readonly REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'tg_refresh_fallback';
  /**
   * generatePair:
   * This runs every time you log in. It gives you two keys.
   */
  async generatePair(payload: { sub: string; username: string }, ip: string, ua: string) {
    try {
      // 1. ACCESS KEY (Lasts 1 hour)
      // This is what the browser sends with every click to prove who you are.
      const accessToken = jwt.sign(payload, this.ACCESS_SECRET, { expiresIn: '1h' });
      // 2. REFRESH KEY (Lasts 7 days)
      // This is a special key used to get a new Access Key automatically.
      // We add a random ID (jti) so that every login is 100% unique.
      const refreshToken = jwt.sign(
        { 
          sub: payload.sub,
          jti: crypto.randomUUID() 
        }, 
        this.REFRESH_SECRET, 
        { expiresIn: '7d' }
      );

      // 3. CRYPTOGRAPHIC SCRAMBLING
      // We never save the real Refresh Key in the database. 
      // We "scramble" (hash) it first so that if a hacker steals our 
      // database, they just see a pile of useless text.
      const scrambledKey = crypto.createHash('sha256').update(refreshToken).digest('hex');
      
      // 4. SAVE THE SESSION
      // We record which IP address and device created this session.
      await db.query(`
        INSERT INTO user_sessions (user_id, refresh_token_hash, ip_address, device_fingerprint)
        VALUES ($1, $2, $3, $4)
      `, [payload.sub, scrambledKey, ip, ua]);
      return { accessToken, refreshToken };
    } catch (err: any) {
      console.error("[!] Failed to create security keys.");
      throw new Error(`SECURITY_FAULT`);
    }
  }

  /**
   * verifyAccess:
   * Checks if the browser's key is real or fake.
   */
  async verifyAccess(token: string): Promise<any> {
    try {
      return jwt.verify(token, this.ACCESS_SECRET);
    } catch {
      return null;
    }
  }

  /**
   * refreshSignal:
   * This handles the "Rotation." When you get a new session, 
   * we delete the old one. If someone tries to use an old, 
   * deleted key, the system sounds an alarm.
   */
  async refreshSignal(oldToken: string, ip: string, ua: string) {
    try {
      const decoded = jwt.verify(oldToken, this.REFRESH_SECRET) as any;
      const oldScramble = crypto.createHash('sha256').update(oldToken).digest('hex');

      const session = await db.transaction(async (tx) => {
        // Find the old session and delete it instantly (Rotation)
        const check = await tx.query(
          'DELETE FROM user_sessions WHERE refresh_token_hash = $1 AND is_revoked = FALSE RETURNING id',
          [oldScramble]
        );
        // If the key wasn't in the DB, it might be a hack attempt!
        if (check.rowCount === 0) {
          console.warn(`[SECURITY ALERT] Token reuse detected for: ${decoded.sub}`);
          throw new Error("REUSE_DETECTED");
        }
        // Fetch user data to create the new pair
        const userRes = await tx.query('SELECT id, username FROM users WHERE id = $1', [decoded.sub]);
        const user = userRes.rows[0];
        return await this.generatePair({ sub: user.id, username: user.username }, ip, ua);
      });

      return session;
    } catch (err: any) {
      return null;
    }
  }
}
