import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, BarChart3, TrendingUp } from 'lucide-react';
import { useUsageTracker } from '@/hooks/useUsageTracker';

export function UsageTracker() {
  const { usage, limits, getUsagePercentage } = useUsageTracker();

  return (
    <Card className="p-4 min-w-[300px]">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Usage Today</h3>
        </div>

        <div className="space-y-3">
          {/* Portfolio Analyses */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-3 w-3 text-muted-foreground" />
                <span>Portfolio Analyses</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {usage.portfolioAnalyses}/{limits.portfolioAnalyses}
              </Badge>
            </div>
            <Progress 
              value={getUsagePercentage('portfolioAnalyses')} 
              className="h-2"
            />
          </div>

          {/* Stock Queries */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                <span>Stock Queries</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {usage.stockQueries}/{limits.stockQueries}
              </Badge>
            </div>
            <Progress 
              value={getUsagePercentage('stockQueries')} 
              className="h-2"
            />
          </div>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
          <div className="text-center">
            <div className="text-lg font-semibold text-primary">{usage.totalConsultations}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-success">{usage.portfolioAnalyses}</div>
            <div className="text-xs text-muted-foreground">Today</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-warning">{limits.portfolioAnalyses - usage.portfolioAnalyses}</div>
            <div className="text-xs text-muted-foreground">Remaining</div>
          </div>
        </div>

        {/* Billing Simulation */}
        <div className="pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Cost per analysis:</span>
              <span className="font-medium">$0.50</span>
            </div>
            <div className="flex justify-between">
              <span>Today's cost:</span>
              <span className="font-medium text-primary">${(usage.portfolioAnalyses * 0.5).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}