// core_engines/TimelineMutationService.ts
import { db } from '../packages/utils/db';
import { TimelinePostUpdateInput } from '../domain/timeline/timeline.schema';
import fs from 'fs';
import path from 'path';

/**
 * THE LIFECYCLE ENGINE
 * This class handles the "evolution" of a post. It handles 
 * version history (so edits are tracked) and it makes sure that 
 * when you delete a post or a photo, it is actually wiped 
 * from the server's hard drive to save space.
 */

export class TimelineMutationService {
  /**
   * updatePost:
   * This function runs when you edit a post.
   */
  async updatePost(editorId: string, postId: string, data: TimelinePostUpdateInput) {
    // 1. SECURITY CHECK
    // We fetch the post to make sure the person editing it is actually the owner.
    const check = await db.query(
      'SELECT author_id, content FROM timeline_posts WHERE id = $1', 
      [postId]
    );
    
    if (check.rows.length === 0) throw new Error("Signal not found.");
    if (check.rows[0].author_id !== editorId) throw new Error("Unauthorized edit attempt.");
    return await db.transaction(async (tx) => {
      
      // 2. HISTORY TRACKING
      // Before we change the post, we save the "Old Version" in the 
      // 'timeline_post_versions' table so we have an audit trail.
      if (data.content !== undefined && data.content !== check.rows[0].content) {
        await tx.query(`
          INSERT INTO timeline_post_versions (post_id, content_raw)
          VALUES ($1, $2)
        `, [postId, check.rows[0].content]);
      }

      // 3. DATABASE UPDATE
      // We build a dynamic update list based on what the user actually changed.
      const updates: string[] = []; 
      const values: any[] = []; 
      let idx = 1;
      
      const fields = ['content', 'is_pinned', 'is_archived', 'privacy', 'is_comments_locked'];
      fields.forEach(f => {
        if ((data as any)[f] !== undefined) {
          updates.push(`${f} = $${idx++}`);
          values.push((data as any)[f]);
        }
      });

      if (updates.length > 0) {
        values.push(postId);
        await tx.query(`
          UPDATE timeline_posts 
          SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
          WHERE id = $${idx}
        `, values);
      }

      // 4. STORAGE CLEANUP
      // If the user removed a photo from the post, we find it and 
      // physically delete it from the server's 'uploads' folder.
      if (data.media) {
        const oldMedia = await tx.query(`SELECT url FROM timeline_media WHERE post_id = $1`, [postId]);
        const newUrls = data.media.map(m => m.url);
        const orphans = oldMedia.rows
          .map(r => r.url)
          .filter(url => !newUrls.includes(url));
        this.wipePhysicalFiles(orphans);

        // Sync the media list in the database
        await tx.query(`DELETE FROM timeline_media WHERE post_id = $1`, [postId]);
        for (let i = 0; i < data.media.length; i++) {
          const m = data.media[i];
          await tx.query(`
            INSERT INTO timeline_media (post_id, media_type, url, file_size_bytes, order_index) 
            VALUES ($1, $2, $3, $4, $5)
          `, [postId, m.media_type, m.url, m.file_size_bytes || 0, i]);
        }
      }
      
      return true;
    });
  }

  /**
   * deletePost: 
   * Marks a post as deleted and purges its images from the disk.
   */
  async deletePost(userId: string, postId: string) {
    const postRes = await db.query(
      'SELECT id FROM timeline_posts WHERE id = $1 AND author_id = $2', 
      [postId, userId]
    );
    
    if (postRes.rows.length === 0) throw new Error("Delete failed: Not authorized.");
    // Find all images attached to this post
    const media = await db.query(`SELECT url FROM timeline_media WHERE post_id = $1`, [postId]);
    // Soft-delete in DB, but hard-delete from disk
    await db.query(`UPDATE timeline_posts SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1`, [postId]);
    this.wipePhysicalFiles(media.rows.map(r => r.url));
    
    return true;
  }

  /**
   * wipePhysicalFiles:
   * Private helper to safely delete files from the 'uploads' folder.
   */
  private wipePhysicalFiles(urls: string[]) {
    for (const url of urls) {
      try {
        const filename = url.split('/').pop();
        if (!filename) continue;
        const filepath = path.join(process.cwd(), 'uploads/timeline', filename);
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      } catch (err) {
        // Log the error but keep going so the server doesn't stop
      }
    }
  }
}
