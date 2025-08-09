export interface ETFData {
    _id?: string;
    symbol: string;
    createdAt: Date;
    updatedAt: Date;
    general: {
        code: string;
        type: string;
        name: string;
        exchange: string;
        currencyCode: string;
        currencyName: string;
        currencySymbol: string;
        countryName: string;
        countryISO: string;
        openFigi?: string;
        description?: string;
        category?: string;
        updatedAt: string;
    };
    technicals?: {
        beta?: number;
        fiftyTwoWeekHigh?: number;
        fiftyTwoWeekLow?: number;
        fiftyDayMA?: number;
        twoHundredDayMA?: number;
    };
    etfData?: {
        isin?: string;
        companyName?: string;
        companyURL?: string;
        etfURL?: string;
        domicile?: string;
        indexName?: string;
        yield?: string;
        dividendPayingFrequency?: string;
        inceptionDate?: string;
        maxAnnualMgmtCharge?: string;
        ongoingCharge?: string;
        dateOngoingCharge?: string;
        netExpenseRatio?: string;
        annualHoldingsTurnover?: string;
        totalAssets?: string;
        averageMktCapMil?: string;
        marketCapitalisation?: {
            mega?: string;
            big?: string;
            medium?: string;
            small?: string;
            micro?: string;
        };
        assetAllocation?: Record<string, any>;
        topSectorsAllocations?: Record<string, any>;
        holdings?: Record<string, any>;
    };
    rawData?: Record<string, any>; // Store original JSON structure
}

export interface FinancialDataFilter {
    symbol?: string;
    type?: string;
    exchange?: string;
    category?: string;
    createdAfter?: Date;
    createdBefore?: Date;
}
