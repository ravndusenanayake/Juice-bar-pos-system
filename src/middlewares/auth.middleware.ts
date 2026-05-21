import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserPayload } from '../@types/express';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-juice-bar-pos-key';

/**
 * Middleware to authenticate requests via JWT Bearer Token
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access token is missing or invalid' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Access token is expired or invalid' });
  }
};

/**
 * Middleware to restrict access to users with specific roles
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
      return;
    }

    next();
  };
};
