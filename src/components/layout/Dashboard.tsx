import React, { useState } from 'react';
import { 
  useStockData, 
  useMarketIndices, 
  generatePriceHistory,
  mockStocks,
  mockIndices
} from '@/utils/stocksApi';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { StockCard } from '@/components/stocks/StockCard';
import { StockChart } from '@/components/stocks/StockChart';
import { MarketOverview } from '@/components/markets/MarketOverview';
import { NewsCard } from '@/components/news/NewsCard';
import { StatsCard } from '@/components/ui/StatsCard';
import { BarChart3, TrendingDown, TrendingUp, Wallet2 } from 'lucide-react';

export function Dashboard() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedStock, setSelectedStock] = useState(mockStocks[0]);

  // ✅ Fetch live or fallback data
  const stocks = useStockData(mockStocks);
  const indices = useMarketIndices(mockIndices);

  // ✅ Generate chart data for selected stock
  const selectedStockData = stocks.find(s => s.symbol === selectedStock.symbol);
  const selectedStockHistory = generatePriceHistory(
    30,
    selectedStockData?.price || 1000,
    2
  );

  // ✅ Append chart history for watchlist cards
  const stocksWithHistory = stocks.map(stock => ({
    ...stock,
    priceHistory: generatePriceHistory(30, stock.price || 1000, 2)
  }));

  // ✅ Calculate market insights
  const gainers = stocks.filter(stock => stock.changePercent > 0);
  const losers = stocks.filter(stock => stock.changePercent < 0);

  const topGainer = gainers.length > 0 
    ? gainers.sort((a, b) => b.changePercent - a.changePercent)[0]
    : { symbol: "—", name: "No Data", changePercent: 0 };

  const topLoser = losers.length > 0 
    ? losers.sort((a, b) => a.changePercent - b.changePercent)[0]
    : { symbol: "—", name: "No Data", changePercent: 0 };

  const totalMarketCap = stocks.reduce((sum, s) => sum + (s.marketCap || 0), 0);
  const totalVolume = stocks.reduce((sum, s) => sum + (s.volume || 0), 0);

  const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="flex-1 flex">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
        
        <main className="flex-1 transition-all duration-300">
          <div className="container max-w-full p-4 lg:p-6 animate-fade-in">
            <h1 className="text-2xl font-bold mb-6">Indian Market Dashboard 🇮🇳</h1>
            
            {/* 📊 Market Stats */}
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-slide-up"
              style={{ '--delay': '100ms' } as React.CSSProperties}
            >
              <StatsCard 
                title="Total Market Cap" 
                value={`₹${(totalMarketCap / 1e12).toFixed(2)}T`}
                trend={0.47}
                icon={<Wallet2 />}
                className="bg-primary/5"
              />
              <StatsCard 
                title="Trading Volume" 
                value={`${(totalVolume / 1e6).toFixed(2)}M`}
                description="Today's Volume"
                icon={<BarChart3 />}
                className="bg-primary/5"
              />
              <StatsCard 
                title="Top Gainer" 
                value={topGainer.symbol}
                trend={topGainer.changePercent}
                trendLabel={topGainer.name}
                icon={<TrendingUp />}
                className="bg-success/5"
              />
              <StatsCard 
                title="Top Loser" 
                value={topLoser.symbol}
                trend={topLoser.changePercent}
                trendLabel={topLoser.name}
                icon={<TrendingDown />}
                className="bg-danger/5"
              />
            </div>
            
            {/* 🧭 Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* 🧾 Watchlist */}
              <div 
                className="lg:col-span-1 space-y-4 animate-slide-up"
                style={{ '--delay': '200ms' } as React.CSSProperties}
              >
                <h2 className="text-xl font-semibold">Watchlist</h2>
                <div className="space-y-4">
                  {stocksWithHistory.map(stock => (
                    <StockCard
                      key={stock.symbol}
                      stock={stock}
                      priceHistory={stock.priceHistory}
                      onClick={() => setSelectedStock(stock)}
                      className={selectedStock.symbol === stock.symbol ? "ring-2 ring-primary" : ""}
                    />
                  ))}
                </div>
              </div>

              {/* 📈 Chart + News */}
              <div 
                className="lg:col-span-2 space-y-4 animate-slide-up"
                style={{ '--delay': '300ms' } as React.CSSProperties}
              >
                <StockChart 
                  symbol={selectedStock.symbol} 
                  name={selectedStock.name} 
                  currentPrice={selectedStockData?.price || 1000}
                  volatility={2.5}
                />
                
                {/* 🗞️ News Section */}
                <NewsCard 
                  news={[
                    {
                      id: "1",
                      title: "Nifty, Sensex rise amid strong domestic cues",
                      summary: "Markets remain optimistic as IT and banking stocks rally.",
                      source: "Moneycontrol",
                      url: "https://www.moneycontrol.com/",
                      publishedAt: new Date()
                    },
                    {
                      id: "2",
                      title: "Rupee strengthens against USD",
                      summary: "The Indian Rupee gains as FII inflows continue.",
                      source: "Economic Times",
                      url: "https://economictimes.indiatimes.com/",
                      publishedAt: new Date()
                    }
                  ]}
                  className="mt-6"
                />
              </div>

              {/* 📊 Indices */}
              <div 
                className="lg:col-span-1 space-y-4 animate-slide-up"
                style={{ '--delay': '400ms' } as React.CSSProperties}
              >
                <MarketOverview indices={indices} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
