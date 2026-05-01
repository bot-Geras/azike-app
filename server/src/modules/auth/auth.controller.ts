// backend/src/modules/auth/auth.controller.ts
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthRequest } from '../../middleware/auth';
import {prisma} from '../../../lib/prisma'

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.register(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Registration successful. Please verify your phone number.',
        data: result
      });
    } catch (error: any) {
      if (error.message === 'email_already_exists') {
        res.status(409).json({
          success: false,
          message: 'Registration failed',
          errors: [{ field: 'email', message: 'Email already registered' }]
        });
        return;
      }
      
      if (error.message === 'phone_number_already_exists') {
        res.status(409).json({
          success: false,
          message: 'Registration failed',
          errors: [{ field: 'phone_number', message: 'Phone number already registered' }]
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        errors: [{ field: 'server', message: 'Internal server error' }]
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { identifier, password, fcm_token } = req.body;
      const result = await authService.login(identifier, password, fcm_token);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error: any) {
      if (error.message === 'invalid_credentials') {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          errors: [{ field: 'credentials', message: 'Invalid email/phone or password' }]
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Login failed',
        errors: [{ field: 'server', message: 'Internal server error' }]
      });
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refresh_token } = req.body;
      const result = await authService.refreshToken(refresh_token);
      
      res.status(200).json({
        success: true,
        message: 'Token refreshed',
        data: result
      });
    } catch (error: any) {
      if (error.message === 'invalid_refresh_token') {
        res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
          errors: [{ field: 'refresh_token', message: 'Invalid or expired refresh token' }]
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Token refresh failed',
        errors: [{ field: 'server', message: 'Internal server error' }]
      });
    }
  }

  async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await authService.getCurrentUser(req.user!.userId);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user data',
        errors: [{ field: 'server', message: 'Internal server error' }]
      });
    }
  }

  async updateDeviceToken(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { fcm_token } = req.body;
    
    if (!fcm_token) {
      res.status(400).json({
        success: false,
        message: 'FCM token is required',
        errors: [{ field: 'fcm_token', message: 'Missing device token' }]
      });
      return;
    }
    
    await prisma.users.update({
      where: { id: req.user!.userId },
      data: { fcm_token }
    });
    
    res.status(200).json({
      success: true,
      message: 'Device token updated successfully'
    });
  } catch (error) {
    console.error('Update device token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update device token',
      errors: [{ field: 'server', message: 'Internal server error' }]
    });
  }
}
}

