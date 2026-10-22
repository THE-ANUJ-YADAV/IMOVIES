import { SeatHold } from '../models/SeatHold.js';
import { broadcastSeatUpdate } from '../sockets/socketHandler.js';
import { logger } from '../utils/logger.js';

export const startHoldCleaner = (intervalMs = 30000) => {
  setInterval(async () => {
    try {
      const now = new Date();
      const expiredHolds = await SeatHold.find({
        status: 'held',
        expiresAt: { $lt: now }
      });

      if (expiredHolds.length > 0) {
        logger.info(`Found ${expiredHolds.length} expired seat holds. Cleaning up...`);

        for (const hold of expiredHolds) {
          hold.status = 'expired';
          await hold.save();

          // Broadcast release to everyone viewing this show
          broadcastSeatUpdate(hold.show.toString(), 'seat-released', {
            seats: hold.seats,
            reason: 'expired'
          });
        }
      }
    } catch (err) {
      logger.error('Error during expired seat holds cleanup:', err);
    }
  }, intervalMs);
};
