import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Bot, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { PortfolioHolding, ConsultationReport } from '@/pages/Consultant';
import { mockStocks } from '@/utils/stocksApi';
import { useConsultantEngine } from '@/hooks/useConsultantEngine';
import { useUsageTracker } from '@/hooks/useUsageTracker';

interface ConsultantAnalysisProps {
  portfolio: PortfolioHolding[];
  isAnalyzing: boolean;
  onAnalysisComplete: (report: ConsultationReport | null) => void;
}

export function ConsultantAnalysis({ portfolio, isAnalyzing, onAnalysisComplete }: ConsultantAnalysisProps) {
  const [currentReport, setCurrentReport] = useState<ConsultationReport | null>(null);
  const { generateAnalysis } = useConsultantEngine();
  const { trackUsage } = useUsageTracker();

  useEffect(() => {
    if (isAnalyzing && portfolio.length > 0) {
      generateAnalysisReport();
    }
  }, [isAnalyzing]);

  const generateAnalysisReport = async () => {
    try {
      const analysis = generateAnalysis(portfolio);
      const report: ConsultationReport = {
        id: Date.now().toString(),
        timestamp: new Date(),
        portfolio: [...portfolio],
        analysis: analysis.overview,
        recommendations: analysis.recommendations,
        riskLevel: analysis.riskLevel
      };
      
      setCurrentReport(report);
      onAnalysisComplete(report);
      trackUsage('portfolio_analysis');
    } catch (error) {
      console.error('Analysis failed:', error);
      setCurrentReport(null);
      onAnalysisComplete(null);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-danger';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <CheckCircle className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  if (portfolio.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">AI Analysis</h2>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <Bot className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg mb-2">Ready to help!</p>
          <p>Add some stocks to your portfolio to get personalized advice</p>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary animate-pulse" />
          <h2 className="text-xl font-semibold">AI Analysis</h2>
        </div>
        <div className="text-center py-12">
          <div className="animate-pulse space-y-4">
            <Bot className="h-16 w-16 mx-auto text-primary" />
            <div className="space-y-2">
              <p className="text-lg font-medium">Analyzing your portfolio...</p>
              <p className="text-muted-foreground">This may take a few seconds</p>
            </div>
            <div className="w-32 h-2 bg-muted rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentReport) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">AI Analysis</h2>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p>Click "Get AI Advice" to analyze your portfolio</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">AI Analysis</h2>
        </div>
        <div className="flex items-center gap-2">
          {getRiskIcon(currentReport.riskLevel)}
          <Badge variant="outline" className={getRiskColor(currentReport.riskLevel)}>
            {currentReport.riskLevel.toUpperCase()} RISK
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        {/* Overview */}
        <Alert>
          <Bot className="h-4 w-4" />
          <AlertDescription className="text-sm leading-relaxed">
            {currentReport.analysis}
          </AlertDescription>
        </Alert>

        {/* Recommendations */}
        <Card className="p-4">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            Actionable Recommendations
          </h3>
          <div className="space-y-3">
            {currentReport.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">{index + 1}</span>
                </div>
                <p className="text-sm leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </Card>

        <Separator />

        {/* Analysis Timestamp */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Analysis generated at {currentReport.timestamp.toLocaleTimeString()}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateAnalysisReport()}
            className="text-xs"
          >
            Re-analyze
          </Button>
        </div>
      </div>
    </div>
  );
}