import app from './app';
import mongoose from 'mongoose';
import http from 'http';
import { socketService } from './modules/realtime/socket';
import { env } from './config/env';

// ── Global Error Guards ───────────────────────────────────────────────────────
// Must be registered BEFORE anything async runs so no rejection slips through.

process.on('uncaughtException', (err: Error) => {
  console.error('💥 uncaughtException — shutting down:', err.message, err.stack);
  // Give logger a tick to flush, then force exit
  setTimeout(() => process.exit(1), 500);
});

process.on('unhandledRejection', (reason: unknown) => {
  console.error('💥 unhandledRejection — reason:', reason);
  // Throw so uncaughtException above picks it up and exits cleanly
  throw reason;
});

// ── Server Bootstrap ──────────────────────────────────────────────────────────

const startServer = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
    });
    console.log('✅ Connected to MongoDB Atlas');

    const server = http.createServer(app);
    socketService.init(server);

    server.listen(env.PORT, () => {
      console.log(`🚀 AscendPath server running on port ${env.PORT} [${env.NODE_ENV}]`);
    });

    // ── Graceful Shutdown ────────────────────────────────────────────────────
    const shutdown = async (signal: string) => {
      console.log(`\n⚠️  ${signal} received — shutting down gracefully…`);
      server.close(async () => {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed.');
        process.exit(0);
      });
      // Force-kill after 10 s if something hangs
      setTimeout(() => process.exit(1), 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
