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
const startServer = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ascendPath';
        await mongoose_1.default.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        const server = http_1.default.createServer(app_1.default);
        socket_1.socketService.init(server);
        server.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
