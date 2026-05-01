// backend/src/modules/announcements/announcements.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { AnnouncementsService } from './announcements.service';

const service = new AnnouncementsService();

export class AnnouncementsController {
  async getAnnouncements(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { limit = 20, includeExpired = false } = req.query;
      
      const result = await service.getAnnouncements({
        userId: req.user?.userId,
        limit: parseInt(limit as string),
        includeExpired: includeExpired === 'true'
      });
      
      res.status(200).json({
        success: true,
        data: { announcements: result }
      });
    } catch (error) {
      console.error('Get announcements error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch announcements',
        errors: [{ field: 'server', message: 'Internal server error' }]
      });
    }
  }

  async getNotifications(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { limit = 50 } = req.query;
      
      const result = await service.getUserNotifications(
        req.user!.userId,
        parseInt(limit as string)
      );
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications',
        errors: [{ field: 'server', message: 'Internal server error' }]
      });
    }
  }

  async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      
      await service.markAsRead(id, req.user!.userId);
      
      res.status(200).json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
        errors: [{ field: 'server', message: 'Internal server error' }]
      });
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      await service.markAllAsRead(req.user!.userId);
      
      res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      console.error('Mark all as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications as read',
        errors: [{ field: 'server', message: 'Internal server error' }]
      });
    }
  }
}