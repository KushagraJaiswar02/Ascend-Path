import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';

export const socketService = {
  io: null as Server | null,

  init(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // WebSockets Auth Handshake Middleware
    this.io.use(async (socket: any, next) => {
      try {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (!token) {
          return next(new Error('WS Authentication failed: Token not found'));
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
        socket.userId = decoded.userId;
        socket.role = decoded.role;
        next();
      } catch (err) {
        next(new Error('WS Authentication failed: Token signature is invalid'));
      }
    });

    this.io.on('connection', (socket: any) => {
      console.log(`🔌 [Websocket] User ${socket.userId} joined active room user_${socket.userId}`);
      
      // Enforce user-specific isolated room subscription
      socket.join(`user_${socket.userId}`);

      socket.on('disconnect', () => {
        console.log(`🔌 [Websocket] User ${socket.userId} disconnected from connection registry`);
      });
    });
  },

  toUser(userId: string, eventName: string, payload: any) {
    if (this.io) {
      this.io.to(`user_${userId}`).emit(eventName, payload);
    }
  },
};
