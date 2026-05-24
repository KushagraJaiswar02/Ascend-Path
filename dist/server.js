"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const mongoose_1 = __importDefault(require("mongoose"));
const http_1 = __importDefault(require("http"));
const socket_1 = require("./modules/realtime/socket");
const env_1 = require("./config/env");
// ── Global Error Guards ───────────────────────────────────────────────────────
// Must be registered BEFORE anything async runs so no rejection slips through.
process.on('uncaughtException', (err) => {
    console.error('💥 uncaughtException — shutting down:', err.message, err.stack);
    // Give logger a tick to flush, then force exit
    setTimeout(() => process.exit(1), 500);
});
process.on('unhandledRejection', (reason) => {
    console.error('💥 unhandledRejection — reason:', reason);
    // Throw so uncaughtException above picks it up and exits cleanly
    throw reason;
});
// ── Server Bootstrap ──────────────────────────────────────────────────────────
const startServer = async () => {
    try {
        await mongoose_1.default.connect(env_1.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10_000,
            socketTimeoutMS: 45_000,
        });
        console.log('✅ Connected to MongoDB Atlas');
        const server = http_1.default.createServer(app_1.default);
        socket_1.socketService.init(server);
        server.listen(env_1.env.PORT, () => {
            console.log(`🚀 AscendPath server running on port ${env_1.env.PORT} [${env_1.env.NODE_ENV}]`);
        });
        // ── Graceful Shutdown ────────────────────────────────────────────────────
        const shutdown = async (signal) => {
            console.log(`\n⚠️  ${signal} received — shutting down gracefully…`);
            server.close(async () => {
                await mongoose_1.default.connection.close();
                console.log('✅ MongoDB connection closed.');
                process.exit(0);
            });
            // Force-kill after 10 s if something hangs
            setTimeout(() => process.exit(1), 10_000);
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
