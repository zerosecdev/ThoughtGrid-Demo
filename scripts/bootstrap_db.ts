// scripts/bootstrap_db.ts
import fs from 'fs';
import path from 'path';
import { db, pool } from '../packages/utils/db';
/**
 * DATABASE SETUP ENGINE
 * This script builds the database tables and handles updates. 
 * It scans the 'data/migrations' folder for .sql files (named like 01_users.sql) 
 * and runs them in order. It also remembers which files it already ran so it 
 * doesn't double-post data.
 */
async function bootstrap() {
  console.log('\x1b[95m%s\x1b[0m', '[*] Waking up database substrate...');
  const migrationPath = path.join(process.cwd(), 'data/migrations');
  // Check if the migrations folder exists
  if (!fs.existsSync(migrationPath)) {
    console.error('[-] Error: Migration folder not found at', migrationPath);
    process.exit(1);
  }

  
  try {
    // 1. Create a tracking table if it doesn't exist yet
    // This table acts as a memory for the script
    await db.query(`
      CREATE TABLE IF NOT EXISTS _grid_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Scan the folder for SQL files and sort them (00, 01, 02...)
    const folderFiles = fs.readdirSync(migrationPath).sort();
    // 3. Find out which files we already ran in the past
    const dbRecord = await db.query('SELECT filename FROM _grid_migrations');
    const alreadyRun = new Set(dbRecord.rows.map(r => r.filename));

    let count = 0;
    // 4. Run the new files
    for (const file of folderFiles) {
      if (!file.endsWith('.sql')) continue; // Ignore non-sql files
      if (alreadyRun.has(file)) continue;    // Skip files already in the DB
      console.log(`[+] Running setup file: ${file}`);
      const sqlCode = fs.readFileSync(path.join(migrationPath, file), 'utf8');
      /**
       * We use a transaction here. 
       * If the SQL fails, it rolls back everything so the DB doesn't get messy.
       */
      try {
        await db.transaction(async (client) => {
          await client.query(sqlCode);
          await client.query(
            'INSERT INTO _grid_migrations (filename) VALUES ($1)',
            [file]
          );
        });
        console.log(`    -> Done.`);
        count++;
      } catch (err: any) {
        console.error(`[!] Failed at ${file}: ${err.message}`);
        await pool.end();
        process.exit(1);
      }
    }

    if (count === 0) {
      console.log('\x1b[36m%s\x1b[0m', '[i] Database is already up to date.');
    } else {
      console.log('\x1b[32m%s\x1b[0m', `[OK] Successfully applied ${count} new setup files.`);
    }

  } catch (err: any) {
    console.error('[!] Database connection error:', err.message);
  } finally {
    // Close the connection so the script can exit
    await pool.end();
  }
}



// Start the process
bootstrap();
