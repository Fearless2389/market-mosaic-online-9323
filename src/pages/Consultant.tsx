import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PortfolioBuilder } from '@/components/consultant/PortfolioBuilder';
import { ConsultantAnalysis } from '@/components/consultant/ConsultantAnalysis';
import { UsageTracker } from '@/components/consultant/UsageTracker';
import { PortfolioSummary } from '@/components/consultant/PortfolioSummary';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, TrendingUp, Activity } from 'lucide-react';

export interface PortfolioHolding {
  symbol: string;
  quantity: number;
  purchasePrice?: number;
}

export interface ConsultationReport {
  id: string;
  timestamp: Date;
  portfolio: PortfolioHolding[];
  analysis: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export default function Consultant() {
  const [portfolio, setPortfolio] = useState<PortfolioHolding[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<ConsultationReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handlePortfolioUpdate = (newPortfolio: PortfolioHolding[]) => {
    setPortfolio(newPortfolio);
  };

  const handleGetAdvice = async () => {
    if (portfolio.length === 0) return;
    
    setIsAnalyzing(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // This will be handled by ConsultantAnalysis component
    setIsAnalyzing(false);
  };

  return (
    <PageLayout title="AI Stock Consultant">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Stock Market Consultant</h1>
              <p className="text-muted-foreground">Get personalized investment advice in simple terms</p>
            </div>
          </div>
          <UsageTracker />
        </div>

        <Tabs defaultValue="consultant" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="consultant" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Consultant
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="consultant" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Portfolio Input */}
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Your Portfolio</h2>
                    <Button 
                      onClick={handleGetAdvice}
                      disabled={portfolio.length === 0 || isAnalyzing}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isAnalyzing ? 'Analyzing...' : 'Get AI Advice'}
                    </Button>
                  </div>
                  <PortfolioBuilder 
                    portfolio={portfolio} 
                    onUpdate={handlePortfolioUpdate} 
                  />
                </div>
              </Card>

              {/* Analysis Results */}
              <Card className="p-6">
                <ConsultantAnalysis 
                  portfolio={portfolio}
                  isAnalyzing={isAnalyzing}
                  onAnalysisComplete={setCurrentAnalysis}
                />
              </Card>
            </div>

            {/* Portfolio Summary */}
            {portfolio.length > 0 && (
              <PortfolioSummary portfolio={portfolio} />
            )}
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <PortfolioSummary portfolio={portfolio} detailed />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Consultation History</h2>
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Your consultation history will appear here</p>
                <p className="text-sm">Get your first AI consultation to start tracking</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}