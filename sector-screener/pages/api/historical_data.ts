import type { NextApiRequest, NextApiResponse } from 'next';
import type { DataPoint } from '../../src/types/shared_types/DataPoint';
import type { TickerData } from '../../src/types/TickerData';
import { TICKER_MAP } from '../../src/types/shared_types/TickerMap';

function generateMockData(ticker: string): TickerData {
    const data: DataPoint[] = [];
    const today = new Date();
    let base = 100;
    const numDays = 365;
    // Randomly choose positive or negative trend
    const trendDirection = Math.random() > 0.5 ? 1 : -1;
    // Random trend strength between 0.05 and 0.5 per day
    const trendStrength = (Math.random() * 0.45 + 0.05) * trendDirection;
    let price = base;
    for (let i = numDays - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        // Add trend and random noise
        price += trendStrength + (Math.random() - 0.5) * 2;
        // Ensure price is always positive
        price = Math.max(price, 1);
        data.push({
            date: date.toISOString().slice(0, 10),
            price: Math.round(price),
        });
    }
    return {
        ticker: TICKER_MAP[ticker as keyof typeof TICKER_MAP] || ticker,
        data,
    };
}

export default function handler(req: NextApiRequest, res: NextApiResponse<TickerData[]>) {
    let tickers: string[] = [];
    if (req.query.ticker) {
        if (Array.isArray(req.query.ticker)) {
            tickers = req.query.ticker;
        } else {
            tickers = (req.query.ticker as string).split(',').map(s => s.trim().toUpperCase());
        }
    } else {
        tickers = [];
    }
    const data = tickers.map(generateMockData);
    res.status(200).json(data);
}
