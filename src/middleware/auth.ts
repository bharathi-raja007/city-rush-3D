import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';

export interface AuthUser {
  uid: string;
  email?: string;
  username: string;
  isGuest: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const authenticateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const guestHeader = req.headers['x-guest-id'] as string | undefined;

  // 1. Check if Firebase token provided
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      req.user = {
        uid: decoded.uid,
        email: decoded.email,
        username: decoded.name || decoded.email?.split('@')[0] || `Runner_${decoded.uid.slice(0, 5)}`,
        isGuest: false,
      };
      return next();
    } catch (err) {
      console.warn('Invalid Firebase token, checking guest fallback:', err);
    }
  }

  // 2. Check if Guest ID provided
  if (guestHeader && typeof guestHeader === 'string' && guestHeader.trim().length > 3) {
    const cleanGuestId = guestHeader.trim().slice(0, 40);
    req.user = {
      uid: cleanGuestId.startsWith('guest_') ? cleanGuestId : `guest_${cleanGuestId}`,
      email: undefined,
      username: `Guest_${cleanGuestId.replace('guest_', '').slice(0, 4).toUpperCase()}`,
      isGuest: true,
    };
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized: missing authentication or guest id' });
};
