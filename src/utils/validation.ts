import { createError } from '../middleware/errorHandler';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function validateFundData(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    errors.push({ field: 'name', message: 'Name is required and must be a non-empty string' });
  }

  if (!data.vintage_year || typeof data.vintage_year !== 'number' || data.vintage_year < 1980) {
    errors.push({ field: 'vintage_year', message: 'Vintage year must be a number >= 1980' });
  }

  if (!data.target_size_usd || Number(data.target_size_usd) <= 0) {
    errors.push({ field: 'target_size_usd', message: 'Target size must be a positive number' });
  }

  if (data.status && !['Fundraising', 'Investing', 'Closed'].includes(data.status)) {
    errors.push({
      field: 'status',
      message: 'Status must be one of: Fundraising, Investing, Closed',
    });
  }

  return errors;
}

export function validateInvestorData(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    errors.push({ field: 'name', message: 'Name is required and must be a non-empty string' });
  }

  if (
    !data.investor_type ||
    !['Individual', 'Institution', 'FamilyOffice'].includes(data.investor_type)
  ) {
    errors.push({
      field: 'investor_type',
      message: 'Investor type must be one of: Individual, Institution, FamilyOffice',
    });
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'Valid email is required' });
  }

  return errors;
}

export function validateInvestmentData(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.investor_id || !validateUUID(data.investor_id)) {
    errors.push({ field: 'investor_id', message: 'Valid investor ID (UUID) is required' });
  }

  if (!data.amount_usd || Number(data.amount_usd) <= 0) {
    errors.push({ field: 'amount_usd', message: 'Amount must be a positive number' });
  }

  if (!data.investment_date || !isValidDate(data.investment_date)) {
    errors.push({ field: 'investment_date', message: 'Valid investment date is required' });
  }

  return errors;
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}
