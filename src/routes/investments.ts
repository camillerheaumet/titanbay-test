import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';
import { validateInvestmentData, validateUUID } from '../utils/validation';
import { Decimal } from '@prisma/client/runtime/library';
import type { Investment, CreateInvestmentInput } from '../types';

const router = Router();

// GET /funds/:fund_id/investments - List all investments for a fund
router.get('/:fund_id/investments', async (req: Request, res: Response<Investment[]>, next: NextFunction) => {
  try {
    const { fund_id } = req.params;

    if (!validateUUID(fund_id)) {
      return next(createError(400, 'Invalid fund ID format', 'INVALID_ID'));
    }

    const fund = await prisma.fund.findUnique({
      where: { id: fund_id },
    });

    if (!fund) {
      return next(createError(404, 'Fund not found', 'NOT_FOUND'));
    }

    const investments = await prisma.investment.findMany({
      where: { fund_id },
      orderBy: { investment_date: 'desc' },
    });

    const formatted = investments.map((inv: Exclude<typeof investments[number], never>) => ({
      id: inv.id,
      investor_id: inv.investor_id,
      fund_id: inv.fund_id,
      amount_usd: parseFloat(inv.amount_usd.toString()),
      investment_date: inv.investment_date.toString().split('T')[0],
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
});

// POST /funds/:fund_id/investments - Create a new investment
router.post('/:fund_id/investments', async (req: Request<{fund_id: string}, Investment, CreateInvestmentInput>, res: Response<Investment>, next: NextFunction) => {
  try {
    const { fund_id } = req.params;

    if (!validateUUID(fund_id)) {
      return next(createError(400, 'Invalid fund ID format', 'INVALID_ID'));
    }

    const fund = await prisma.fund.findUnique({
      where: { id: fund_id },
    });

    if (!fund) {
      return next(createError(404, 'Fund not found', 'NOT_FOUND'));
    }

    const validationErrors = validateInvestmentData(req.body);
    if (validationErrors.length > 0) {
      return next(createError(400, 'Validation failed', 'VALIDATION_ERROR'));
    }

    // Check if investor exists
    const investor = await prisma.investor.findUnique({
      where: { id: req.body.investor_id },
    });

    if (!investor) {
      return next(createError(404, 'Investor not found', 'NOT_FOUND'));
    }

    const investment = await prisma.investment.create({
      data: {
        investor_id: req.body.investor_id,
        fund_id,
        amount_usd: new Decimal(req.body.amount_usd),
        investment_date: new Date(req.body.investment_date),
      },
    });

    res.status(201).json({
      id: investment.id,
      investor_id: investment.investor_id,
      fund_id: investment.fund_id,
      amount_usd: parseFloat(investment.amount_usd.toString()),
      investment_date: investment.investment_date.toISOString().split('T')[0],
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      next(
        createError(
          409,
          'Investor already has an investment in this fund',
          'CONFLICT'
        )
      );
    } else if (error.code === 'P2003') {
      next(createError(400, 'Invalid fund or investor ID', 'INVALID_REFERENCE'));
    } else {
      next(error);
    }
  }
});

export default router;
