import { useMemo } from 'react';
import { PortfolioHolding } from '@/pages/Consultant';
import { mockStocks } from '@/utils/stocksApi';

interface AnalysisResult {
  overview: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  diversificationScore: number;
}

export function useConsultantEngine() {
  const generateAnalysis = useMemo(() => {
    return (portfolio: PortfolioHolding[]): AnalysisResult => {
      if (portfolio.length === 0) {
        return {
          overview: "No portfolio data available for analysis.",
          recommendations: ["Add stocks to your portfolio to get personalized advice."],
          riskLevel: 'low',
          diversificationScore: 0
        };
      }

      // Calculate portfolio metrics
      const portfolioData = portfolio.map(holding => {
        const stock = mockStocks.find(s => s.symbol === holding.symbol);
        const currentValue = stock ? stock.price * holding.quantity : 0;
        return {
          ...holding,
          stock,
          currentValue,
          weight: 0 // Will be calculated below
        };
      });

      const totalValue = portfolioData.reduce((sum, item) => sum + item.currentValue, 0);
      
      // Calculate weights
      portfolioData.forEach(item => {
        item.weight = totalValue > 0 ? (item.currentValue / totalValue) * 100 : 0;
      });

      // Sector analysis
      const getSector = (symbol: string) => {
        const sectors: { [key: string]: string } = {
          AAPL: 'Technology', MSFT: 'Technology', GOOGL: 'Technology',
          AMZN: 'Consumer Discretionary', NVDA: 'Technology', TSLA: 'Consumer Discretionary',
          META: 'Technology', V: 'Financial Services'
        };
        return sectors[symbol] || 'Other';
      };

      const sectorAllocation = portfolioData.reduce((acc, item) => {
        const sector = getSector(item.symbol);
        acc[sector] = (acc[sector] || 0) + item.currentValue;
        return acc;
      }, {} as { [key: string]: number });

      const sectorCount = Object.keys(sectorAllocation).length;
      const maxSectorWeight = Math.max(...Object.values(sectorAllocation)) / totalValue * 100;
      const maxStockWeight = Math.max(...portfolioData.map(item => item.weight));

      // Risk Assessment
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      let riskFactors: string[] = [];

      if (maxStockWeight > 50) {
        riskLevel = 'high';
        riskFactors.push('high concentration in single stock');
      } else if (maxStockWeight > 30) {
        riskLevel = 'medium';
        riskFactors.push('moderate concentration risk');
      }

      if (maxSectorWeight > 70) {
        riskLevel = 'high';
        riskFactors.push('heavy sector concentration');
      } else if (maxSectorWeight > 50) {
        if (riskLevel === 'low') riskLevel = 'medium';
        riskFactors.push('sector concentration');
      }

      if (portfolio.length < 3) {
        if (riskLevel === 'low') riskLevel = 'medium';
        riskFactors.push('insufficient diversification');
      }

      // Check for high-volatility stocks
      const volatileStocks = portfolioData.filter(item => 
        item.stock && Math.abs(item.stock.changePercent) > 3
      );
      if (volatileStocks.length > portfolio.length * 0.5) {
        if (riskLevel === 'low') riskLevel = 'medium';
        if (riskLevel === 'medium') riskLevel = 'high';
        riskFactors.push('high-volatility holdings');
      }

      // Diversification Score
      let diversificationScore = 0;
      if (portfolio.length >= 5) diversificationScore += 30;
      else if (portfolio.length >= 3) diversificationScore += 20;
      else diversificationScore += 10;

      if (maxStockWeight < 30) diversificationScore += 30;
      else if (maxStockWeight < 50) diversificationScore += 20;
      else diversificationScore += 10;

      if (sectorCount >= 3) diversificationScore += 40;
      else if (sectorCount >= 2) diversificationScore += 25;
      else diversificationScore += 10;

      diversificationScore = Math.min(diversificationScore, 100);

      // Generate Overview
      let overview = `Your portfolio contains ${portfolio.length} holdings with a total value of $${totalValue.toLocaleString()}. `;
      
      if (diversificationScore >= 80) {
        overview += "You have excellent diversification across stocks and sectors. ";
      } else if (diversificationScore >= 60) {
        overview += "Your portfolio shows good diversification, but there's room for improvement. ";
      } else {
        overview += "Your portfolio needs better diversification to reduce risk. ";
      }

      if (riskFactors.length > 0) {
        overview += `Key risk factors include: ${riskFactors.join(', ')}. `;
      }

      // Generate Recommendations
      const recommendations: string[] = [];

      // Concentration recommendations
      const overweightStocks = portfolioData.filter(item => item.weight > 25);
      if (overweightStocks.length > 0) {
        const stockName = overweightStocks[0].symbol;
        recommendations.push(`${stockName} makes up ${overweightStocks[0].weight.toFixed(1)}% of your portfolio. Consider reducing this to below 25% to lower concentration risk.`);
      }

      // Diversification recommendations
      if (portfolio.length < 5) {
        recommendations.push("Consider adding more stocks to your portfolio. Aim for at least 5-10 different holdings for better diversification.");
      }

      // Sector diversification
      if (sectorCount < 3) {
        const dominantSector = Object.entries(sectorAllocation)
          .sort(([,a], [,b]) => b - a)[0]?.[0];
        if (dominantSector === 'Technology') {
          recommendations.push("Your portfolio is heavily weighted in Technology. Consider adding stocks from Healthcare, Financial Services, or Consumer Goods for balance.");
        } else {
          recommendations.push(`Consider diversifying beyond ${dominantSector} by adding stocks from other sectors like Technology, Healthcare, or Financial Services.`);
        }
      }

      // Performance-based recommendations
      const gainers = portfolioData.filter(item => 
        item.stock && item.stock.changePercent > 2
      );
      const losers = portfolioData.filter(item => 
        item.stock && item.stock.changePercent < -2
      );

      if (gainers.length > 0) {
        recommendations.push(`${gainers[0].symbol} is showing strong performance (+${gainers[0].stock?.changePercent.toFixed(1)}%). Consider taking some profits if it becomes overweight.`);
      }

      if (losers.length > 0) {
        recommendations.push(`${losers[0].symbol} is down ${losers[0].stock?.changePercent.toFixed(1)}%. Review the fundamentals before deciding to hold or sell.`);
      }

      // Add generic recommendations if none specific
      if (recommendations.length === 0) {
        recommendations.push("Your portfolio looks well-balanced. Continue monitoring your holdings and rebalance quarterly.");
        recommendations.push("Consider setting stop-loss orders at 15-20% below your purchase price to limit downside risk.");
      }

      return {
        overview,
        recommendations: recommendations.slice(0, 4), // Limit to 4 recommendations
        riskLevel,
        diversificationScore
      };
    };
  }, []);

  return { generateAnalysis };
}