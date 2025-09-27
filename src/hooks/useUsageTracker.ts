import { useState, useEffect } from 'react';

interface UsageData {
  portfolioAnalyses: number;
  stockQueries: number;
  totalConsultations: number;
  lastResetDate: string;
}

interface UsageLimits {
  portfolioAnalyses: number;
  stockQueries: number;
}

export function useUsageTracker() {
  const [usage, setUsage] = useState<UsageData>({
    portfolioAnalyses: 0,
    stockQueries: 0,
    totalConsultations: 0,
    lastResetDate: new Date().toDateString()
  });

  const limits: UsageLimits = {
    portfolioAnalyses: 10,
    stockQueries: 50
  };

  // Load usage data from localStorage
  useEffect(() => {
    const savedUsage = localStorage.getItem('consultantUsage');
    if (savedUsage) {
      const parsedUsage = JSON.parse(savedUsage);
      
      // Check if we need to reset daily limits
      const today = new Date().toDateString();
      if (parsedUsage.lastResetDate !== today) {
        // Reset daily counters but keep total
        const resetUsage = {
          ...parsedUsage,
          portfolioAnalyses: 0,
          stockQueries: 0,
          lastResetDate: today
        };
        setUsage(resetUsage);
        localStorage.setItem('consultantUsage', JSON.stringify(resetUsage));
      } else {
        setUsage(parsedUsage);
      }
    }
  }, []);

  // Save usage data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('consultantUsage', JSON.stringify(usage));
  }, [usage]);

  const trackUsage = (type: 'portfolio_analysis' | 'stock_query') => {
    setUsage(prev => {
      const newUsage = { ...prev };
      
      switch (type) {
        case 'portfolio_analysis':
          if (newUsage.portfolioAnalyses < limits.portfolioAnalyses) {
            newUsage.portfolioAnalyses += 1;
            newUsage.totalConsultations += 1;
          }
          break;
        case 'stock_query':
          if (newUsage.stockQueries < limits.stockQueries) {
            newUsage.stockQueries += 1;
          }
          break;
      }
      
      return newUsage;
    });
  };

  const canUse = (type: 'portfolio_analysis' | 'stock_query'): boolean => {
    switch (type) {
      case 'portfolio_analysis':
        return usage.portfolioAnalyses < limits.portfolioAnalyses;
      case 'stock_query':
        return usage.stockQueries < limits.stockQueries;
      default:
        return false;
    }
  };

  const getUsagePercentage = (type: 'portfolioAnalyses' | 'stockQueries'): number => {
    const current = usage[type];
    const limit = limits[type];
    return (current / limit) * 100;
  };

  const getRemainingUsage = (type: 'portfolioAnalyses' | 'stockQueries'): number => {
    return limits[type] - usage[type];
  };

  const resetDailyUsage = () => {
    setUsage(prev => ({
      ...prev,
      portfolioAnalyses: 0,
      stockQueries: 0,
      lastResetDate: new Date().toDateString()
    }));
  };

  return {
    usage,
    limits,
    trackUsage,
    canUse,
    getUsagePercentage,
    getRemainingUsage,
    resetDailyUsage
  };
}
