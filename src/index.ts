import express, { Request, Response } from 'express';
import { prisma } from './config/prisma';
import apiRoutes from './routes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Register API routes
app.use('/api', apiRoutes);

// Health check route
app.get('/health', async (req: Request, res: Response) => {
  try {
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

