import app from "./app";
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import http from 'http';
import { socketService } from './modules/realtime/socket';

dotenv.config();

const PORT = process.env.PORT || 5000;

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://jaiswarkushagra047_db_user:0Xo2z9ofLXsJnKBc@cluster0.oatpqv4.mongodb.net/ascendpath?retryWrites=true&w=majority&appName=Cluster0';

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB Atlas');

    const server = http.createServer(app);
    socketService.init(server);

    server.listen(PORT, () => {
      console.log(`🚀 AscendPath server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });

    // ── Graceful Shutdown ──────────────────────────────────────────────────
    const shutdown = async (signal: string) => {
      console.log(`\n⚠️  ${signal} received — shutting down gracefully…`);
      server.close(async () => {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed.');
        process.exit(0);
      });
      // Force kill after 10s if stuck
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

