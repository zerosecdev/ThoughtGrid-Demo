// core_engines/SpamSentinel.ts

/**
 * THE CONDUCT GATEKEEPER
 * This class handles rate-limiting. It works entirely in the server's RAM
 * so it is incredibly fast. It checks if a user is posting too quickly 
 * and blocks them if they are still in their "cooldown" window.
 */

// A simple memory map to keep track of everyone's last post time.
const memoryLattice = new Map<string, number>();
export class SpamSentinel {
  /**
   * check: 
   * This is the main function that decides if a user is allowed to post.
   * 
   * @param userId Who is trying to post?
   * @param rank What is their trust level? (Basic, Gold, Platinum, etc.)
   * @param actionType Are they making a 'post' or a 'comment'?
   */
  async check(
    userId: string, 
    rank: string, 
    actionType: 'post' | 'comment' = 'post'
  ): Promise<boolean> {
    const now = Date.now();
    const key = `${userId}:${actionType}`;

    
    // --- 1. SET THE TIMERS ---
    // We want to be strict with main posts, but let comments be faster 
    // so that conversations feel natural.
    let cooldown = 0;
    
    if (actionType === 'post') {
      // Main signals (Broadcasts)
      // Admins and Platinum users have no wait.
      // Gold users wait 5 seconds. Everyone else waits 30 seconds.
      cooldown = (rank === 'admin' || rank === 'platinum') ? 0 : (rank === 'gold' ? 5000 : 30000);
    } else {
      // Small signals (Comments)
      // High-rank users wait 1 second. Basic users wait 5 seconds.
      cooldown = rank === 'admin' ? 0 : (rank === 'gold' || rank === 'platinum' ? 1000 : 5000);
    }
    
    // If you are an Admin, we just let you through immediately.
    if (cooldown === 0) return false;

    // --- 2. CHECK THE CLOCK ---
    const lastAttempt = memoryLattice.get(key);

    if (lastAttempt && (now - lastAttempt < cooldown)) {
      /**
       * If you get here, you are posting too fast!
       * We return 'true' (which means "Yes, this is spam").
       * Note: we don't update the time here, otherwise you'd be 
       * locked out forever if you kept clicking.
       */
      return true; 
    }
    // --- 3. LOG THE SUCCESS ---
    // User passed the check. We save the current time and let them post.
    memoryLattice.set(key, now);
    /**
     * SELF-CLEANING
     * To keep the server from running out of memory, we wipe this 
     * list clean if it grows larger than 20,000 entries.
     */
    if (memoryLattice.size > 20000) {
      console.log("[SENTINEL] Memory threshold reached. Flushing buffer.");
      memoryLattice.clear();
    }

    return false; // Not spam - go ahead!
  }
}
