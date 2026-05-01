// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.status(401).json({
      success: false,
      message: 'No authorization token provided',
      errors: [{ field: 'authorization', message: 'Missing token' }]
    });
    return;
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expired',
        errors: [{ field: 'authorization', message: 'Token expired' }]
      });
      return;
    }
    
    res.status(401).json({
      success: false,
      message: 'Invalid token',
      errors: [{ field: 'authorization', message: 'Invalid token' }]
    });
  }
};