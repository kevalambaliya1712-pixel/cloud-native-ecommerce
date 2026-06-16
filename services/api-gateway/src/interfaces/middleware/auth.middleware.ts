import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../../config/services.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Forbidden: Invalid or expired token.' });
      }

      req.user = user as { id: string; email: string; role: string };
      // Forward the user metadata down as custom headers to microservices
      req.headers['x-user-id'] = req.user.id;
      req.headers['x-user-email'] = req.user.email;
      req.headers['x-user-role'] = req.user.role;
      
      next();
    });
  } else {
    res.status(401).json({ error: 'Unauthorized: No token provided.' });
  }
};

export const optionalAuthenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, jwtSecret, (err, user) => {
      if (!err && user) {
        req.user = user as { id: string; email: string; role: string };
        req.headers['x-user-id'] = req.user.id;
        req.headers['x-user-email'] = req.user.email;
        req.headers['x-user-role'] = req.user.role;
      }
      next();
    });
  } else {
    next();
  }
};
