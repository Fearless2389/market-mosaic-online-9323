
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useStockData, mockStocks, formatCurrency } from '@/utils/stocksApi';
import { PieChart, Cell, Pie, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const Portfolio = () => {
  const stocks = useStockData(mockStocks);
  
  // Mock portfolio data (Indian stocks)
  const portfolio = [
    { symbol: 'RELIANCE', shares: 50, costBasis: 2700.00 },
    { symbol: 'TCS', shares: 30, costBasis: 3500.00 },
    { symbol: 'HDFCBANK', shares: 40, costBasis: 1600.00 },
    { symbol: 'INFY', shares: 60, costBasis: 1400.00 },
  ];
  
  // Calculate portfolio values
  const portfolioItems = portfolio.map(item => {
    const stock = stocks.find(s => s.symbol === item.symbol);
    if (!stock) return null;
    
    const currentValue = stock.price * item.shares;
    const costBasis = item.costBasis * item.shares;
    const gain = currentValue - costBasis;
    const gainPercent = (gain / costBasis) * 100;
    
    return {
      ...item,
      name: stock.name,
      currentPrice: stock.price,
      currentValue,
      costBasis,
      gain,
      gainPercent
    };
  }).filter(Boolean);
  
  const totalValue = portfolioItems.reduce((sum, item) => sum + item.currentValue, 0);
  const totalCost = portfolioItems.reduce((sum, item) => sum + item.costBasis, 0);
  const totalGain = totalValue - totalCost;
  const totalGainPercent = (totalGain / totalCost) * 100;
  
  // Data for pie chart
  const pieData = portfolioItems.map(item => ({
    name: item.symbol,
    value: item.currentValue
  }));
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  return (
    <PageLayout title="Portfolio">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Portfolio Summary</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Gain/Loss</p>
                <div className="flex items-center">
                  <p className={`text-xl font-bold ${totalGain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(totalGain)}
                  </p>
                  <p className={`ml-2 ${totalGain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ({totalGain >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%)
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Value']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Holdings</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Symbol</th>
                    <th className="text-left py-2 px-4">Name</th>
                    <th className="text-right py-2 px-4">Shares</th>
                    <th className="text-right py-2 px-4">Price</th>
                    <th className="text-right py-2 px-4">Value</th>
                    <th className="text-right py-2 px-4">Gain/Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioItems.map((item) => (
                    <tr key={item.symbol} className="border-b">
                      <td className="py-3 px-4 font-medium">{item.symbol}</td>
                      <td className="py-3 px-4">{item.name}</td>
                      <td className="py-3 px-4 text-right">{item.shares}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(item.currentPrice)}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(item.currentValue)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className={item.gain >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {formatCurrency(item.gain)} ({item.gain >= 0 ? '+' : ''}{item.gainPercent.toFixed(2)}%)
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Portfolio;
