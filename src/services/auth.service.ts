import { prisma } from '../config/prisma';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UserPayload } from '../@types/express';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-juice-bar-pos-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export class AuthService {
  /**
   * Authenticate a user by email and password, returning user data and a JWT token.
   */
  async login(email: string, rawPassword: string) {
    // 1. Fetch user by email and include their associated role
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // 2. Compare the provided password with the hashed password in the DB
    const isPasswordValid = await bcrypt.compare(rawPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // 3. Create the token payload
    const payload: UserPayload = {
      userId: user.id,
      email: user.email,
      role: user.role.name,
    };

    // 4. Sign the token
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    // 5. Exclude password from the returned user object
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }
}
