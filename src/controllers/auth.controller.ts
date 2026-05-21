import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
  /**
   * Handle user login request
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const result = await authService.login(email, password);

      res.status(200).json({
        message: 'Login successful',
        token: result.token,
        user: result.user,
      });
    } catch (error: any) {
      if (error.message === 'Invalid email or password') {
        res.status(401).json({ error: error.message });
      } else {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}
