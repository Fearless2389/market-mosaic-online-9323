-- Create portfolio holdings table for Indian stock market
CREATE TABLE IF NOT EXISTS public.portfolio_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  company_name TEXT NOT NULL,
  exchange TEXT DEFAULT 'NSE' CHECK (exchange IN ('NSE','BSE')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  purchase_price DECIMAL(12, 2) NOT NULL,
  total_investment DECIMAL(14,2) GENERATED ALWAYS AS (quantity * purchase_price) STORED,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_price DECIMAL(12,2),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, symbol)
);

-- Enable RLS
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_portfolio_timestamp
BEFORE UPDATE ON public.portfolio_holdings
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- RLS Policies
CREATE POLICY "Users can view own holdings"
  ON public.portfolio_holdings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own holdings"
  ON public.portfolio_holdings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own holdings"
  ON public.portfolio_holdings
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own holdings"
  ON public.portfolio_holdings
  FOR DELETE
  USING (auth.uid() = user_id);