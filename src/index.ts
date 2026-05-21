import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Basic test route
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Basic DB check to ensure Prisma is working correctly
    const roleCount = await prisma.role.count();
    res.json({
      status: 'OK',
      timestamp: new Date(),
      database: {
        connected: true,
        rolesCount: roleCount
      }
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date(),
      database: {
        connected: false,
        error: error.message
      }
    });
  }
});

// Run server
app.listen(PORT, () => {
  console.log(`🚀 Juice Bar POS Server running on http://localhost:${PORT}`);
});
