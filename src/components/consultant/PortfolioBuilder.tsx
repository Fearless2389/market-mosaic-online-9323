import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Search } from 'lucide-react';
import { mockStocks } from '@/utils/stocksApi';
import { PortfolioHolding } from '@/pages/Consultant';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface PortfolioBuilderProps {
  portfolio: PortfolioHolding[];
  onUpdate: (portfolio: PortfolioHolding[]) => void;
}

export function PortfolioBuilder({ portfolio, onUpdate }: PortfolioBuilderProps) {
  const [selectedStock, setSelectedStock] = useState('');
  const [quantity, setQuantity] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load portfolio from database on mount
  useEffect(() => {
    loadPortfolio();
  }, [user]);

  const loadPortfolio = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data) {
        const loadedPortfolio: PortfolioHolding[] = data.map(holding => ({
          symbol: holding.symbol,
          quantity: holding.quantity,
          purchasePrice: Number(holding.purchase_price)
        }));
        onUpdate(loadedPortfolio);
      }
    } catch (error: any) {
      console.error('Error loading portfolio:', error);
    }
  };

  const saveToDatabase = async (holding: PortfolioHolding) => {
    if (!user) return;

    try {
      const stock = mockStocks.find(s => s.symbol === holding.symbol);
      
      const { error } = await supabase
        .from('portfolio_holdings')
        .upsert({
          user_id: user.id,
          symbol: holding.symbol,
          company_name: stock?.name || holding.symbol,
          exchange: 'NSE',
          quantity: holding.quantity,
          purchase_price: holding.purchasePrice || stock?.price || 0,
          current_price: stock?.price || null,
          last_synced_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,symbol'
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Portfolio updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteFromDatabase = async (symbol: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('portfolio_holdings')
        .delete()
        .eq('user_id', user.id)
        .eq('symbol', symbol);

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const addStock = async () => {
    if (!selectedStock || !quantity || parseFloat(quantity) <= 0) return;

    const existingIndex = portfolio.findIndex(h => h.symbol === selectedStock);
    
    let updatedHolding: PortfolioHolding;
    
    if (existingIndex >= 0) {
      // Update existing holding
      const updatedPortfolio = [...portfolio];
      updatedPortfolio[existingIndex].quantity += parseFloat(quantity);
      updatedHolding = updatedPortfolio[existingIndex];
      onUpdate(updatedPortfolio);
    } else {
      // Add new holding
      const stock = mockStocks.find(s => s.symbol === selectedStock);
      updatedHolding = {
        symbol: selectedStock,
        quantity: parseFloat(quantity),
        purchasePrice: stock?.price
      };
      onUpdate([...portfolio, updatedHolding]);
    }

    await saveToDatabase(updatedHolding);

    setSelectedStock('');
    setQuantity('');
  };

  const removeStock = async (symbol: string) => {
    await deleteFromDatabase(symbol);
    onUpdate(portfolio.filter(h => h.symbol !== symbol));
  };

  const loadSamplePortfolio = () => {
    const samplePortfolio: PortfolioHolding[] = [
      { symbol: 'AAPL', quantity: 50, purchasePrice: 180.00 },
      { symbol: 'MSFT', quantity: 25, purchasePrice: 395.00 },
      { symbol: 'GOOGL', quantity: 15, purchasePrice: 160.00 },
      { symbol: 'NVDA', quantity: 10, purchasePrice: 920.00 },
    ];
    onUpdate(samplePortfolio);
  };

  const getTotalValue = () => {
    return portfolio.reduce((total, holding) => {
      const stock = mockStocks.find(s => s.symbol === holding.symbol);
      return total + (stock ? stock.price * holding.quantity : 0);
    }, 0);
  };

  return (
    <div className="space-y-4">
      {/* Add Stock Form */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label htmlFor="stock-search">Stock Symbol</Label>
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={searchOpen}
                className="w-full justify-between"
              >
                {selectedStock || "Search stocks..."}
                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search stocks..." />
                <CommandList>
                  <CommandEmpty>No stocks found.</CommandEmpty>
                  <CommandGroup>
                    {mockStocks.map((stock) => (
                      <CommandItem
                        key={stock.symbol}
                        value={stock.symbol}
                        onSelect={(value) => {
                          setSelectedStock(value);
                          setSearchOpen(false);
                        }}
                      >
                        <div className="flex justify-between w-full">
                          <span className="font-medium">{stock.symbol}</span>
                          <span className="text-muted-foreground text-sm">${stock.price}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{stock.name}</div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="quantity">Shares</Label>
          <Input
            id="quantity"
            type="number"
            placeholder="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="0.01"
            step="0.01"
          />
        </div>
        
        <div className="space-y-2">
          <Label>&nbsp;</Label>
          <Button onClick={addStock} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Stock
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={loadSamplePortfolio}>
          Load Sample Portfolio
        </Button>
        <Button variant="outline" size="sm" onClick={() => onUpdate([])}>
          Clear All
        </Button>
      </div>

      {/* Current Holdings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Current Holdings</h3>
          {portfolio.length > 0 && (
            <Badge variant="secondary">
              Total Value: ${getTotalValue().toLocaleString()}
            </Badge>
          )}
        </div>

        {portfolio.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Plus className="h-8 w-8" />
            </div>
            <p>No stocks in your portfolio yet</p>
            <p className="text-sm">Add some stocks to get started</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {portfolio.map((holding, index) => {
              const stock = mockStocks.find(s => s.symbol === holding.symbol);
              const currentValue = stock ? stock.price * holding.quantity : 0;
              const gainLoss = holding.purchasePrice 
                ? ((stock?.price || 0) - holding.purchasePrice) * holding.quantity
                : 0;
              
              return (
                <Card key={index} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{holding.symbol}</Badge>
                        <span className="text-sm font-medium">{holding.quantity} shares</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>Current: ${stock?.price.toFixed(2) || 'N/A'}</span>
                        <span>Value: ${currentValue.toLocaleString()}</span>
                        {gainLoss !== 0 && (
                          <span className={`font-medium ${gainLoss > 0 ? 'text-success' : 'text-danger'}`}>
                            {gainLoss > 0 ? '+' : ''}${gainLoss.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStock(holding.symbol)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}