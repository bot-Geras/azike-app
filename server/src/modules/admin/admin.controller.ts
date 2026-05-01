// backend/src/modules/admin/admin.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { AdminService } from './admin.service';

const adminService = new AdminService();

export class AdminController {
  async getEvents(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status, limit, page } = req.query;
      
      const result = await adminService.getEvents({
        status: status as string,
        limit: limit ? parseInt(limit as string) : undefined,
        page: page ? parseInt(page as string) : undefined
      });
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Admin get events error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch events',
        errors: [{ field: 'server', message: 'Internal server error' }]
      });
    }
  }

  async createEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const event = await adminService.createEvent({
        ...req.body,
        created_by: req.user!.userId
      });
      
      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: { event_id: event.id }
      });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create event',
        errors: [{ field: 'server', message: 'Internal server error' }]
      });
    }
  }

  async updateEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      
      await adminService.updateEvent(id, req.body);
      
      res.status(200).json({
        success: true,
        message: 'Event updated successfully'
      });
    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update event',
        errors: [{ field: 'server', message: 'Internal server error' }]
      });
    }
  }

  async deleteEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      
      await adminService.deleteEvent(id);
      
      res.status(200).json({
        success: true,
        message: 'Event cancelled successfully'
      });
    } catch (error) {
      console.error('Delete event error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete event',
        errors: [{ field: 'server', message: 'Internal server error' }]
      });
    }
  }

  async getAnnouncements(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { limit, page } = req.query;
      
      const result = await adminService.getAnnouncements({
        limit: limit ? parseInt(limit as string) : undefined,
        page: page ? parseInt(page as string) : undefined
      });
      
      res.status(200).json({
        success: true,
        data: result
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

  async createAnnouncement(req: AuthRequest, res: Response): Promise<void> {
    try {
      const announcement = await adminService.createAnnouncement({
        ...req.body,
        created_by: req.user!.userId
      });
      
      res.status(201).json({
        success: true,
        message: 'Announcement created successfully',
        data: { announcement_id: announcement.id }
      });
    } catch (error) {
      console.error('Create announcement error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create announcement',
        errors: [{ field: 'server', message: 'Internal server error' }]
      });
    }
  }

  async getDashboardStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await adminService.getDashboardStats();
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard stats',
        errors: [{ field: 'server', message: 'Internal server error' }]
      });
    }
  }
}