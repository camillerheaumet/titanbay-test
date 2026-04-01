import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { createError } from '../middleware/errorHandler';
import { validateInvestorData, validateUUID } from '../utils/validation';
import type { Investor, CreateInvestorInput, UpdateInvestorInput } from '../types';

const router = Router();

// GET /investors - List all investors
router.get('/', async (req: Request, res: Response<Investor[]>, next: NextFunction) => {
  try {
    const investors = await prisma.investor.findMany({
      orderBy: { created_at: 'desc' },
    });

    const formatted: Investor[] = investors.map((investor: Investor) => ({
      id: investor.id,
      name: investor.name,
      investor_type: investor.investor_type,
      email: investor.email,
      created_at: investor.created_at.toString(),
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
});

// POST /investors - Create a new investor
router.post('/', async (req: Request<{}, Investor, CreateInvestorInput>, res: Response<Investor>, next: NextFunction) => {
  try {
    const validationErrors = validateInvestorData(req.body);
    if (validationErrors.length > 0) {
      return next(createError(400, 'Validation failed', 'VALIDATION_ERROR'));
    }

    const investor = await prisma.investor.create({
      data: {
        name: req.body.name,
        investor_type: req.body.investor_type,
        email: req.body.email,
      },
    });

    res.status(201).json({
      id: investor.id,
      name: investor.name,
      investor_type: investor.investor_type,
      email: investor.email,
      created_at: investor.created_at.toISOString(),
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      next(createError(409, 'Email already exists', 'CONFLICT'));
    } else {
      next(error);
    }
  }
});

// GET /investors/:id - Get a specific investor
router.get('/:id', async (req: Request, res: Response<Investor>, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!validateUUID(id)) {
      return next(createError(400, 'Invalid investor ID format', 'INVALID_ID'));
    }

    const investor = await prisma.investor.findUnique({
      where: { id },
    });

    if (!investor) {
      return next(createError(404, 'Investor not found', 'NOT_FOUND'));
    }

    res.json({
      id: investor.id,
      name: investor.name,
      investor_type: investor.investor_type,
      email: investor.email,
      created_at: investor.created_at.toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// PUT /investors - Update an existing investor
router.put('/', async (req: Request<{}, Investor, UpdateInvestorInput>, res: Response<Investor>, next: NextFunction) => {
  try {
    const { id, ...updateData } = req.body;

    if (!id || !validateUUID(id)) {
      return next(createError(400, 'Valid investor ID is required', 'INVALID_ID'));
    }

    const investor = await prisma.investor.findUnique({
      where: { id },
    });

    if (!investor) {
      return next(createError(404, 'Investor not found', 'NOT_FOUND'));
    }

    // Only validate fields that are being updated
    const dataToValidate = { ...investor, ...updateData };
    const validationErrors = validateInvestorData(dataToValidate);
    if (validationErrors.length > 0) {
      return next(createError(400, 'Validation failed', 'VALIDATION_ERROR'));
    }

    const updated = await prisma.investor.update({
      where: { id },
      data: {
        name: updateData.name ?? investor.name,
        investor_type: updateData.investor_type ?? investor.investor_type,
        email: updateData.email ?? investor.email,
      },
    });

    res.json({
      id: updated.id,
      name: updated.name,
      investor_type: updated.investor_type,
      email: updated.email,
      created_at: updated.created_at.toISOString(),
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      next(createError(404, 'Investor not found', 'NOT_FOUND'));
    } else if (error.code === 'P2002') {
      next(createError(409, 'Email already exists', 'CONFLICT'));
    } else {
      next(error);
    }
  }
});

export default router;
