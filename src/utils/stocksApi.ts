// src/utils/stocksApi.ts

import { useState, useEffect } from "react";

// ✅ Interfaces
export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  lastUpdated: Date;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  region: string;
  lastUpdated: Date;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  imageUrl?: string;
  publishedAt: Date;
}

// ✅ Mock data (fallback)
export const mockStocks: Stock[] = [
  {
    symbol: "RELIANCE.BSE",
    name: "Reliance Industries",
    price: 2825.65,
    change: 12.3,
    changePercent: 0.44,
    volume: 4829300,
    marketCap: 19845000000000,
    lastUpdated: new Date(),
  },
  {
    symbol: "TCS.BSE",
    name: "Tata Consultancy Services",
    price: 3825.4,
    change: -10.2,
    changePercent: -0.27,
    volume: 1543200,
    marketCap: 14050000000000,
    lastUpdated: new Date(),
  },
  {
    symbol: "INFY.BSE",
    name: "Infosys Ltd",
    price: 1689.5,
    change: 8.4,
    changePercent: 0.5,
    volume: 2320000,
    marketCap: 7420000000000,
    lastUpdated: new Date(),
  },
];

export const mockIndices: MarketIndex[] = [
  {
    symbol: "^NSEI",
    name: "Nifty 50",
    value: 22045.6,
    change: 124.5,
    changePercent: 0.57,
    region: "India",
    lastUpdated: new Date(),
  },
  {
    symbol: "^BSESN",
    name: "Sensex",
    value: 73245.8,
    change: 250.3,
    changePercent: 0.34,
    region: "India",
    lastUpdated: new Date(),
  },
];

export const mockNews: NewsItem[] = [
  {
    id: "1",
    title: "Indian markets close higher on positive global cues",
    summary:
      "The Nifty 50 and Sensex ended the session with modest gains as investors showed confidence in banking and IT stocks.",
    source: "MoneyControl",
    url: "https://www.moneycontrol.com/",
    imageUrl:
      "https://images.moneycontrol.com/static-mcnews/2023/05/markets1-770x433.jpg",
    publishedAt: new Date(),
  },
  {
    id: "2",
    title: "Rupee strengthens against USD amid steady oil prices",
    summary:
      "The Indian rupee gained 0.3% against the US dollar today as global crude oil prices remained stable.",
    source: "Economic Times",
    url: "https://economictimes.indiatimes.com/",
    imageUrl:
      "https://img.etimg.com/thumb/msid-98908910,width-640,height-480,imgsize-150220,resizemode-4/rupee-shutterstock.jpg",
    publishedAt: new Date(),
  },
];

// ✅ Helper: Random history generator
export function generatePriceHistory(days: number, basePrice: number, volatility = 2) {
  const history = [];
  let price = basePrice;
  for (let i = days - 1; i >= 0; i--) {
    const change = (Math.random() - 0.5) * volatility;
    price = Math.max(1, price + change);
    history.push({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      price: parseFloat(price.toFixed(2)),
    });
  }
  return history;
}

// ✅ Hooks (Mock Fallbacks)
export function useStockData(initial: Stock[]) {
  const [data, setData] = useState(initial);
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) =>
        prev.map((stock) => ({
          ...stock,
          price: stock.price + (Math.random() - 0.5) * 5,
          changePercent: (Math.random() - 0.5) * 1,
          lastUpdated: new Date(),
        }))
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  return data;
}

export function useMarketIndices(initial: MarketIndex[]) {
  const [data, setData] = useState(initial);
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) =>
        prev.map((idx) => ({
          ...idx,
          value: idx.value + (Math.random() - 0.5) * 50,
          changePercent: (Math.random() - 0.5) * 0.5,
          lastUpdated: new Date(),
        }))
      );
    }, 10000);
    return () => clearInterval(interval);
  }, []);
  return data;
}

// ✅ Environment keys
const ALPHA_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
const NEWS_KEY = import.meta.env.VITE_NEWSDATA_API_KEY;

// ✅ Fetch live stock data
export async function fetchStockQuote(symbol: string) {
  try {
    const res = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_KEY}`
    );
    const data = await res.json();
    const quote = data["Global Quote"];
    if (!quote) return null;

    const price = parseFloat(quote["05. price"]) || 0;
    const change = parseFloat(quote["09. change"]) || 0;
    const changePercent =
      parseFloat(quote["10. change percent"]?.replace("%", "")) || 0;
    const volume = parseInt(quote["06. volume"]) || 0;

    return {
      symbol,
      name: symbol,
      price,
      change,
      changePercent,
      volume,
      marketCap: 0,
      lastUpdated: new Date(),
    };
  } catch (err) {
    console.error(`Error fetching ${symbol}:`, err);
    return null;
  }
}

// ✅ Live Stock Hook
export function useLiveStocks(
  symbols: string[] = ["RELIANCE.BSE", "TCS.BSE", "INFY.BSE"]
) {
  const [stocks, setStocks] = useState<Stock[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const results = await Promise.all(symbols.map(fetchStockQuote));
      setStocks(results.filter(Boolean) as Stock[]);
    };
    fetchAll();
    const interval = setInterval(fetchAll, 60000);
    return () => clearInterval(interval);
  }, [symbols]);

  return stocks.length > 0 ? stocks : mockStocks;
}

// ✅ Live Indices Hook
export function useLiveIndices() {
  const [indices, setIndices] = useState<MarketIndex[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const nifty = await fetchStockQuote("^NSEI");
      const sensex = await fetchStockQuote("^BSESN");
      setIndices(
        [nifty, sensex]
          .filter(Boolean)
          .map((i: any) => ({
            symbol: i.symbol,
            name: i.symbol === "^NSEI" ? "Nifty 50" : "Sensex",
            value: i.price,
            change: i.change,
            changePercent: i.changePercent,
            region: "India",
            lastUpdated: new Date(),
          }))
      );
    };
    fetchAll();
    const interval = setInterval(fetchAll, 60000);
    return () => clearInterval(interval);
  }, []);

  return indices.length > 0 ? indices : mockIndices;
}

// Format currency values for Indian stocks
export function formatCurrency(value: number) {
  if (!value && value !== 0) return "-";
  
  // Handle large numbers (crores, lakhs)
  if (value >= 1_00_00_000) {
    return `₹${(value / 1_00_00_000).toFixed(2)} Cr`;
  } else if (value >= 1_00_000) {
    return `₹${(value / 1_00_000).toFixed(2)} L`;
  }
  
  // Default format for smaller values
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

// ✅ Fetch Market News
export async function fetchMarketNews() {
  try {
    const res = await fetch(
      `https://newsdata.io/api/1/news?apikey=${NEWS_KEY}&category=business&language=en`
    );
    const json = await res.json();
    if (!json.results) return mockNews;

    return json.results.slice(0, 10).map((n: any, idx: number) => ({
      id: String(idx),
      title: n.title,
      summary: n.description || "",
      source: n.source_id,
      url: n.link,
      imageUrl: n.image_url,
      publishedAt: new Date(n.pubDate || Date.now()),
    }));
  } catch (err) {
    console.error("Error fetching news:", err);
    return mockNews;
  }
}
