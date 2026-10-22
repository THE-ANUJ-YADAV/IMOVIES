import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';
import { initSocket } from './sockets/socketHandler.js';
import { startHoldCleaner } from './services/holdCleaner.js';

const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

initSocket(io);

const startServer = async () => {
  try {
    await connectDB();

    // Start background hold expiration monitor
    startHoldCleaner(15000); // checks every 15 seconds

    server.listen(config.port, () => {
      logger.info(`🎬 IMovies Server listening in ${config.env} mode on port ${config.port}`);
      logger.info(`🚀 API Base URL: http://localhost:${config.port}/api/v1`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

export { app, server, io };
