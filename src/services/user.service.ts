import { prisma } from '../config/prisma';
import bcrypt from 'bcryptjs';

export class UserService {
  /**
   * Retrieve all users (with their roles), excluding sensitive data
   */
  async getUsers() {
    const users = await prisma.user.findMany({
      include: {
        role: true,
      },
      orderBy: { id: 'desc' },
    });

    return users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
  }

  /**
   * Create a new cashier user
   */
  async createCashier(data: { name: string; email: string; passwordRaw: string }) {
    const cashierRole = await prisma.role.findUnique({
      where: { name: 'CASHIER' },
    });

    if (!cashierRole) {
      throw new Error('CASHIER role does not exist in the database');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.passwordRaw, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: hashedPassword,
        role_id: cashierRole.id,
      },
      include: {
        role: true,
      },
    });

    const { password, ...safeUser } = newUser;
    return safeUser;
  }
}
