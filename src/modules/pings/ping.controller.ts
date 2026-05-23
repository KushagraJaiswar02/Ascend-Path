import { Request, Response, NextFunction } from 'express';
import { pingService } from './ping.service';
import { toPingDTO, toPingDTOs } from './ping.dto';

export const pingController = {
  async createPing(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const ping = await pingService.createPing(userId, req.body);
      res.status(201).json({ success: true, data: { ping: toPingDTO(ping) } });
    } catch (error) {
      next(error);
    }
  },

  async respondPing(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const ping = await pingService.respondPing(userId, req.params.id as string, req.body);
      if (!ping) {
        res.status(404);
        throw new Error('Ping not found');
      }
      res.status(200).json({ success: true, data: { ping: toPingDTO(ping) } });
    } catch (error) {
      next(error);
    }
  },

  async ratePing(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const ping = await pingService.ratePing(userId, req.params.id as string, req.body);
      if (!ping) {
        res.status(404);
        throw new Error('Ping not found');
      }
      res.status(200).json({ success: true, data: { ping: toPingDTO(ping) } });
    } catch (error) {
      next(error);
    }
  },

  async closePing(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const ping = await pingService.closePing(userId, req.params.id as string);
      if (!ping) {
        res.status(404);
        throw new Error('Ping not found');
      }
      res.status(200).json({ success: true, data: { ping: toPingDTO(ping) } });
    } catch (error) {
      next(error);
    }
  },

  async getSentPings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const pings = await pingService.getPingsSentByUser(userId);
      res.status(200).json({ success: true, data: { pings: toPingDTOs(pings) } });
    } catch (error) {
      next(error);
    }
  },

  async getInboxPings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const pings = await pingService.getPingsReceivedByUser(userId);
      res.status(200).json({ success: true, data: { pings: toPingDTOs(pings) } });
    } catch (error) {
      next(error);
    }
  },
};

