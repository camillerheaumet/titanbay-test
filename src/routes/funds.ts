import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { createError } from '../middleware/errorHandler';
import { validateFundData, validateUUID } from '../utils/validation';
import { Decimal } from '@prisma/client/runtime/library';
import type { Fund, CreateFundInput, UpdateFundInput } from '../types';

const router = Router();

// GET /funds - List all funds
router.get('/', async (req: Request, res: Response<Fund[]>, next: NextFunction) => {
  try {
    const funds = await prisma.fund.findMany({
      orderBy: { created_at: 'desc' },
    });

    const formattedFunds = funds.map((fund: Exclude<typeof funds[number], never>) => ({
      id: fund.id,
      name: fund.name,
      vintage_year: fund.vintage_year,
      target_size_usd: parseFloat(fund.target_size_usd.toString()),
      status: fund.status,
      created_at: fund.created_at.toString(),
    }));

    res.json(formattedFunds);
  } catch (error) {
    next(error);
  }
});

// POST /funds - Create a new fund
router.post('/', async (req: Request<{}, Fund, CreateFundInput>, res: Response<Fund>, next: NextFunction) => {
  try {
    const validationErrors = validateFundData(req.body);
    if (validationErrors.length > 0) {
      return next(createError(400, 'Validation failed', 'VALIDATION_ERROR'));
    }

    const fund = await prisma.fund.create({
      data: {
        name: req.body.name,
        vintage_year: req.body.vintage_year,
        target_size_usd: new Decimal(req.body.target_size_usd),
        status: req.body.status || 'Fundraising',
      },
    });

    res.status(201).json({
      id: fund.id,
      name: fund.name,
      vintage_year: fund.vintage_year,
      target_size_usd: parseFloat(fund.target_size_usd.toString()),
      status: fund.status,
      created_at: fund.created_at.toISOString(),
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      next(createError(409, 'Fund already exists', 'CONFLICT'));
    } else {
      next(error);
    }
  }
});

// GET /funds/:id - Get a specific fund
router.get('/:id', async (req: Request, res: Response<Fund>, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!validateUUID(id)) {
      return next(createError(400, 'Invalid fund ID format', 'INVALID_ID'));
    }

    const fund = await prisma.fund.findUnique({
      where: { id },
    });

    if (!fund) {
      return next(createError(404, 'Fund not found', 'NOT_FOUND'));
    }

    res.json({
      id: fund.id,
      name: fund.name,
      vintage_year: fund.vintage_year,
      target_size_usd: parseFloat(fund.target_size_usd.toString()),
      status: fund.status,
      created_at: fund.created_at.toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// PUT /funds - Update an existing fund
router.put('/', async (req: Request<{}, Fund, UpdateFundInput>, res: Response<Fund>, next: NextFunction) => {
  try {
    const { id, ...updateData } = req.body;

    if (!id || !validateUUID(id)) {
      return next(createError(400, 'Valid fund ID is required', 'INVALID_ID'));
    }

    const validationErrors = validateFundData(updateData);
    if (validationErrors.length > 0) {
      return next(createError(400, 'Validation failed', 'VALIDATION_ERROR'));
    }

    const fund = await prisma.fund.findUnique({
      where: { id },
    });

    if (!fund) {
      return next(createError(404, 'Fund not found', 'NOT_FOUND'));
    }

    const updated = await prisma.fund.update({
      where: { id },
      data: {
        name: updateData.name ?? fund.name,
        vintage_year: updateData.vintage_year ?? fund.vintage_year,
        target_size_usd: updateData.target_size_usd
          ? new Decimal(updateData.target_size_usd)
          : fund.target_size_usd,
        status: updateData.status ?? fund.status,
      },
    });

    res.json({
      id: updated.id,
      name: updated.name,
      vintage_year: updated.vintage_year,
      target_size_usd: parseFloat(updated.target_size_usd.toString()),
      status: updated.status,
      created_at: updated.created_at.toISOString(),
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      next(createError(404, 'Fund not found', 'NOT_FOUND'));
    } else {
      next(error);
    }
  }
});

export default router;
