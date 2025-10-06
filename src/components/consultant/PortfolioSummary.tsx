import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { PortfolioHolding } from '@/pages/Consultant';
import { mockStocks, formatCurrency } from '@/utils/stocksApi';

interface PortfolioSummaryProps {
  portfolio: PortfolioHolding[];
  detailed?: boolean;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--danger))', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

export function PortfolioSummary({ portfolio, detailed = false }: PortfolioSummaryProps) {
  if (portfolio.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8 text-muted-foreground">
          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No portfolio data to display</p>
        </div>
      </Card>
    );
  }

  // Calculate portfolio metrics
  const portfolioData = portfolio.map(holding => {
    const stock = mockStocks.find(s => s.symbol === holding.symbol);
    const currentValue = stock ? stock.price * holding.quantity : 0;
    const purchaseValue = holding.purchasePrice ? holding.purchasePrice * holding.quantity : currentValue;
    const gainLoss = currentValue - purchaseValue;
    const gainLossPercent = purchaseValue > 0 ? (gainLoss / purchaseValue) * 100 : 0;

    return {
      symbol: holding.symbol,
      name: stock?.name || holding.symbol,
      quantity: holding.quantity,
      currentPrice: stock?.price || 0,
      purchasePrice: holding.purchasePrice || 0,
      currentValue,
      purchaseValue,
      gainLoss,
      gainLossPercent,
      weight: 0 // Will be calculated below
    };
  });

  const totalValue = portfolioData.reduce((sum, item) => sum + item.currentValue, 0);
  const totalGainLoss = portfolioData.reduce((sum, item) => sum + item.gainLoss, 0);
  const totalPurchaseValue = portfolioData.reduce((sum, item) => sum + item.purchaseValue, 0);
  const totalGainLossPercent = totalPurchaseValue > 0 ? (totalGainLoss / totalPurchaseValue) * 100 : 0;

  // Calculate weights
  portfolioData.forEach(item => {
    item.weight = totalValue > 0 ? (item.currentValue / totalValue) * 100 : 0;
  });

  // Data for charts
  const pieData = portfolioData.map((item, index) => ({
    name: item.symbol,
    value: item.currentValue,
    color: COLORS[index % COLORS.length]
  }));

  const barData = portfolioData.map(item => ({
    symbol: item.symbol,
    value: item.currentValue,
    gainLoss: item.gainLoss
  }));

  // Sector analysis (simplified - based on Indian stock sectors)
  const getSector = (symbol: string) => {
    const sectors: { [key: string]: string } = {
      RELIANCE: 'Oil & Gas',
      TCS: 'Technology',
      HDFCBANK: 'Banking & Financial Services',
      INFY: 'Technology',
      ICICIBANK: 'Banking & Financial Services',
      BHARTIARTL: 'Telecommunications',
      SBIN: 'Banking & Financial Services',
      WIPRO: 'Technology',
      LT: 'Construction & Engineering',
      AXISBANK: 'Banking & Financial Services'
    };
    return sectors[symbol] || 'Other';
  };

  const sectorAllocation = portfolioData.reduce((acc, item) => {
    const sector = getSector(item.symbol);
    acc[sector] = (acc[sector] || 0) + item.currentValue;
    return acc;
  }, {} as { [key: string]: number });

  const sectorData = Object.entries(sectorAllocation).map(([sector, value], index) => ({
    name: sector,
    value,
    percentage: (value / totalValue) * 100,
    color: COLORS[index % COLORS.length]
  }));

  const getDiversificationScore = () => {
    const holdings = portfolioData.length;
    const maxWeight = Math.max(...portfolioData.map(item => item.weight));
    const sectors = Object.keys(sectorAllocation).length;
    
    let score = 0;
    if (holdings >= 5) score += 30;
    else if (holdings >= 3) score += 20;
    else score += 10;
    
    if (maxWeight < 30) score += 30;
    else if (maxWeight < 50) score += 20;
    else score += 10;
    
    if (sectors >= 3) score += 40;
    else if (sectors >= 2) score += 25;
    else score += 10;
    
    return Math.min(score, 100);
  };

  const diversificationScore = getDiversificationScore();

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Gain/Loss</p>
              <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss)}
              </p>
            </div>
            {totalGainLoss >= 0 ? (
              <TrendingUp className="h-8 w-8 text-success" />
            ) : (
              <TrendingDown className="h-8 w-8 text-danger" />
            )}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Return %</p>
              <p className={`text-2xl font-bold ${totalGainLossPercent >= 0 ? 'text-success' : 'text-danger'}`}>
                {totalGainLossPercent >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%
              </p>
            </div>
            <Badge variant={totalGainLossPercent >= 0 ? 'default' : 'destructive'}>
              {totalGainLossPercent >= 0 ? 'Profit' : 'Loss'}
            </Badge>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Diversification</p>
              <p className="text-2xl font-bold">{diversificationScore}/100</p>
            </div>
            <div className="flex flex-col items-end">
              <Progress value={diversificationScore} className="w-16 h-2" />
              <Badge variant="outline" className="mt-1 text-xs">
                {diversificationScore >= 80 ? 'Excellent' : 
                 diversificationScore >= 60 ? 'Good' : 
                 diversificationScore >= 40 ? 'Fair' : 'Poor'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {detailed && (
        <>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Portfolio Allocation */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Portfolio Allocation</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [formatCurrency(value), 'Value']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Holdings Performance */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Holdings Performance</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="symbol" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        formatCurrency(value),
                        name === 'gainLoss' ? 'Gain/Loss' : 'Current Value'
                      ]}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                    <Bar dataKey="gainLoss" fill="hsl(var(--success))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Sector Allocation */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Sector Allocation</h3>
            <div className="space-y-3">
              {sectorData.map((sector, index) => (
                <div key={sector.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{sector.name}</span>
                    <span>{formatCurrency(sector.value)} ({sector.percentage.toFixed(1)}%)</span>
                  </div>
                  <Progress value={sector.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </Card>

          {/* Holdings Details */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Holdings Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Symbol</th>
                    <th className="text-right p-2">Shares</th>
                    <th className="text-right p-2">Current Price</th>
                    <th className="text-right p-2">Current Value</th>
                    <th className="text-right p-2">Gain/Loss</th>
                    <th className="text-right p-2">Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioData.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{item.symbol}</div>
                          <div className="text-xs text-muted-foreground truncate">{item.name}</div>
                        </div>
                      </td>
                      <td className="text-right p-2">{item.quantity}</td>
                      <td className="text-right p-2">{formatCurrency(item.currentPrice)}</td>
                      <td className="text-right p-2">{formatCurrency(item.currentValue)}</td>
                      <td className={`text-right p-2 ${item.gainLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                        {item.gainLoss >= 0 ? '+' : ''}{formatCurrency(item.gainLoss)}
                        <br />
                        <span className="text-xs">
                          ({item.gainLossPercent >= 0 ? '+' : ''}{item.gainLossPercent.toFixed(1)}%)
                        </span>
                      </td>
                      <td className="text-right p-2">{item.weight.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}