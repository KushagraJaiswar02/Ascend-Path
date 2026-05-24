"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const http_1 = __importDefault(require("http"));
const socket_1 = require("./modules/realtime/socket");
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI ||
    'mongodb+srv://jaiswarkushagra047_db_user:0Xo2z9ofLXsJnKBc@cluster0.oatpqv4.mongodb.net/ascendpath?retryWrites=true&w=majority&appName=Cluster0';
const startServer = async () => {
    try {
        await mongoose_1.default.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ Connected to MongoDB Atlas');
        const server = http_1.default.createServer(app_1.default);
        socket_1.socketService.init(server);
        server.listen(PORT, () => {
            console.log(`🚀 AscendPath server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
        });
        // ── Graceful Shutdown ──────────────────────────────────────────────────
        const shutdown = async (signal) => {
            console.log(`\n⚠️  ${signal} received — shutting down gracefully…`);
            server.close(async () => {
                await mongoose_1.default.connection.close();
                console.log('✅ MongoDB connection closed.');
                process.exit(0);
            });
            // Force kill after 10s if stuck
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
