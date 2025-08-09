export interface SectorWeight {
    equity: string;
    relativeToCategory: string;
}

export interface SectorData {
    symbol: string;
    name: string;
    sectorWeights: Record<string, SectorWeight>;
    totalAssets?: string;
    yield?: string;
    expenseRatio?: string;
    inceptionDate?: string;
    description?: string;
    topHoldings?: Array<{
        name: string;
        symbol: string;
        sector: string;
        portfolioPercent: string;
        sharesHeld: string;
        marketValue: string;
    }>;
}

export interface SectorDetailData {
    sectorName: string;
    weight: SectorWeight;
    topHoldings: Array<{
        name: string;
        symbol: string;
        portfolioPercent: string;
        sharesHeld: string;
        marketValue: string;
    }>;
}
