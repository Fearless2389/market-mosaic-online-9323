
import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Treemap, LineChart, Line } from 'recharts';
import { mockStocks, generatePriceHistory, formatNumber, formatCurrency } from '@/utils/stocksApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bitcoin, TrendingUp, TrendingDown } from 'lucide-react';

const Analysis = () => {
  // Mock data for sector performance (Indian market sectors)
  const sectorPerformance = [
    { name: 'Information Technology', value: 8.2 },
    { name: 'Banking & Financial Services', value: 3.5 },
    { name: 'Oil & Gas', value: -1.2 },
    { name: 'Pharmaceuticals', value: 2.8 },
    { name: 'Automobiles', value: -2.5 },
    { name: 'FMCG', value: 0.9 },
    { name: 'Telecommunications', value: -0.7 },
  ];
  
  // Mock data for risk assessment
  const riskData = [
    { name: 'Volatility', value: 65 },
    { name: 'Correlation', value: 42 },
    { name: 'Downside Risk', value: 38 },
    { name: 'Sharpe Ratio', value: 78 },
    { name: 'Liquidity', value: 85 },
  ];
  
  // Mock data for portfolio distribution
  const distributionData = [
    { name: 'Large Cap', value: 55 },
    { name: 'Mid Cap', value: 30 },
    { name: 'Small Cap', value: 15 },
  ];
  
  // Format stock data for the heatmap (treemap)
  const stockGrowthData = mockStocks
    .map(stock => ({
      name: stock.symbol,
      value: Math.abs(stock.changePercent),
      changePercent: stock.changePercent
    }))
    .sort((a, b) => b.changePercent - a.changePercent);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Custom content for the treemap
  const CustomizedContent = (props: any) => {
    const { root, depth, x, y, width, height, index, name, changePercent, value } = props;
    
    // Color based on change percent (green for positive, red for negative)
    const safeChangePercent = changePercent ?? 0;
    const color = safeChangePercent >= 0 ? "#4ade80" : "#f87171";
    const cellValue = safeChangePercent >= 0 ? `+${safeChangePercent.toFixed(2)}%` : `${safeChangePercent.toFixed(2)}%`;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: color,
            stroke: '#fff',
            strokeWidth: 2 / (depth + 1e-10),
            strokeOpacity: 1 / (depth + 1e-10),
          }}
        />
        {width > 50 && height > 30 ? (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 6}
              textAnchor="middle"
              fill="#fff"
              fontSize={14}
              fontWeight="bold"
            >
              {name}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 12}
              textAnchor="middle"
              fill="#fff"
              fontSize={12}
            >
              {cellValue}
            </text>
          </>
        ) : null}
      </g>
    );
  };
  
  return (
    <PageLayout title="Market Analysis">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Sector Performance (YTD)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sectorPerformance}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Performance']} />
                <Bar 
                  dataKey="value" 
                  name="YTD Performance" 
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                >
                  {sectorPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#4ade80' : '#f87171'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="lg:col-span-2 bg-card rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Stock Performance Heatmap</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={stockGrowthData}
                dataKey="value"
                aspectRatio={4/3}
                stroke="#fff"
                fill="#8884d8"
                content={<CustomizedContent />}
              />
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Showing performance by percentage change. Green indicates positive growth, red indicates decline.</p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Analysis;
