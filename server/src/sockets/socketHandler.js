import { logger } from '../utils/logger.js';

let ioInstance = null;

export const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    logger.info(`Socket client connected: ${socket.id}`);

    // Join room for a specific show's seatmap
    socket.on('join-show', (showId) => {
      socket.join(`show:${showId}`);
      logger.info(`Socket ${socket.id} joined show room: show:${showId}`);
    });

    // Leave room
    socket.on('leave-show', (showId) => {
      socket.leave(`show:${showId}`);
      logger.info(`Socket ${socket.id} left show room: show:${showId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  return ioInstance;
};

// Helper to broadcast seat updates to clients in the room
export const broadcastSeatUpdate = (showId, eventType, payload) => {
  if (ioInstance) {
    ioInstance.to(`show:${showId}`).emit(eventType, payload);
    logger.debug(`Broadcasted ${eventType} to show:${showId}`, payload);
  }
};
