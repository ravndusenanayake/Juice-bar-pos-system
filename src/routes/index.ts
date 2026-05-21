import { Router } from 'express';
import authRoutes from './auth.routes';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Mount public authentication routes at /api/auth
router.use('/auth', authRoutes);

// Protected profile endpoint (requires active JWT)
router.get('/protected-profile', authenticateJWT, (req, res) => {
  res.json({
    message: 'You have successfully accessed a protected route.',
    user: req.user,
  });
});

// Super admin-only restricted endpoint
router.get('/admin-only', authenticateJWT, requireRole(['SUPER_ADMIN']), (req, res) => {
  res.json({
    message: 'Access granted. Welcome Super Admin!',
    user: req.user,
  });
});

export default router;
