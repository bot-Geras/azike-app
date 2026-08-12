import jwt from 'jsonwebtoken';
import { StringValue } from 'ms';

import { JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN, JWT_REFRESH_SECRET, JWT_SECRET } from '../config/env';
export interface TokenPayload {
  userId: string;
  email: string;
  roles: string[];
}

export const generateTokens = (payload: TokenPayload) => {
  const accessToken = jwt.sign(
    payload,
    JWT_SECRET!,
    { expiresIn: (JWT_EXPIRES_IN as StringValue) || '1h' }
  );

  const refreshToken = jwt.sign(
    { userId: payload.userId },
    JWT_REFRESH_SECRET!,
    { expiresIn: (JWT_REFRESH_EXPIRES_IN as StringValue) || '30d' }
  );

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET!) as TokenPayload;
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  return jwt.verify(token, JWT_REFRESH_SECRET!) as { userId: string };
};