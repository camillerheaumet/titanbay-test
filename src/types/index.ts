// Fund Types
export interface Fund {
  id: string;
  name: string;
  vintage_year: number;
  target_size_usd: number;
  status: 'Fundraising' | 'Investing' | 'Closed';
  created_at: string;
}

export interface CreateFundInput {
  name: string;
  vintage_year: number;
  target_size_usd: number;
  status?: 'Fundraising' | 'Investing' | 'Closed';
}

export interface UpdateFundInput {
  id: string;
  name?: string;
  vintage_year?: number;
  target_size_usd?: number;
  status?: 'Fundraising' | 'Investing' | 'Closed';
}

// Investor Types
export interface Investor {
  id: string;
  name: string;
  investor_type: 'Individual' | 'Institution' | 'FamilyOffice';
  email: string;
  created_at: string;
}

export interface CreateInvestorInput {
  name: string;
  investor_type: 'Individual' | 'Institution' | 'FamilyOffice';
  email: string;
}

export interface UpdateInvestorInput {
  id: string;
  name?: string;
  investor_type?: 'Individual' | 'Institution' | 'FamilyOffice';
  email?: string;
}

// Investment Types
export interface Investment {
  id: string;
  investor_id: string;
  fund_id: string;
  amount_usd: number;
  investment_date: string;
}

export interface CreateInvestmentInput {
  investor_id: string;
  amount_usd: number;
  investment_date: string;
}

// API Response Types
export interface ApiError {
  error: {
    code: string;
    message: string;
    timestamp: string;
  };
}
