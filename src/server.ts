import express, { Express, Request, Response, NextFunction } from 'express';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { errorHandler } from './middleware/errorHandler';
import fundRoutes from './routes/funds';
import investorRoutes from './routes/investors';
import investmentRoutes from './routes/investments';

const app: Express = express();
const port = process.env.PORT || 3000;
export const prisma = new PrismaClient();

// Middleware
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/funds', fundRoutes);
app.use('/investors', investorRoutes);
app.use('/funds', investmentRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

// Error handler (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
