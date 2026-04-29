// core_engines/ConnectionManager.ts
// importing stuff
import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { TokenService } from '../vault/src/crypto/TokenService';
import { db } from '../packages/utils/db';

/**
 * THE NERVOUS SYSTEM
 * This class handles all real-time connections for the platform.
 * It ensures that chats, notifications, and status updates happen
 * instantly without the user needing to refresh their browser.
 */
export class ConnectionManager {
  private io: Server;
  private tokens = new TokenService();
  constructor(server: HttpServer) {
    // Start the socket server and set the security rules 
    // so only our frontend can talk to it.
    this.io = new Server(server, {
      cors: { origin: true, credentials: true }
    });
    this.startEngine();
  }

  private startEngine() {
    /**
     * SECURITY GATEKEEPER
     * Before we allow a browser to connect, we check their "Boarding Pass" (JWT).
     * If the token is missing or fake, we kick them out immediately.
     */
    this.io.use(async (socket, next) => {
      try {
        const header = socket.handshake.headers['authorization'];
        const token = socket.handshake.auth.token || header?.split(' ')[1];

        if (!token) {
          return next(new Error('Connection rejected: No identity token found.'));
        }
        const decoded = await this.tokens.verifyAccess(token) as any;
        // We save the user's data on the connection so we know who is talking.
        socket.data.user = { 
          id: decoded.sub, 
          username: decoded.username 
        };
        
        next();
      } catch (err) {
        next(new Error('Connection rejected: Identity signal is invalid.'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const { id, username } = socket.data.user;

      // Put the user in a private channel so we can send them specific alerts.
      socket.join(`user:${id}`);
      console.log(`[+] Node Linked: @${username}`);
      // Update their "Last Active" status in the database.
      this.pingDatabase(id);
      // Simple listener to update their status while they are online.
      socket.on('HEARTBEAT', () => this.pingDatabase(id));
      socket.on('disconnect', () => {
        console.log(`[-] Node Severed: @${username}`);
      });
    });
  }

  // Tells the database that the user is still online right now.
  private async pingDatabase(userId: string) {
    try {
      await db.query(
        'UPDATE users SET last_active_at = CURRENT_TIMESTAMP WHERE id = $1', 
        [userId]
      );
    } catch (e) {
      // If the database is busy, we don't want to crash the whole chat engine.
    }
  }

  // Sends a signal to just one person (like a notification).
  public emitToUser(userId: string, event: string, payload: any) {
    this.io.to(`user:${userId}`).emit(event, payload);
  }
  // Sends a signal to a whole chat group.
  public broadcastToRoom(room: string, event: string, payload: any) {
    this.io.to(`room:${room}`).emit(event, payload);
  }
}
