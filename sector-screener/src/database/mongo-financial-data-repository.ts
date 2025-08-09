import { ObjectId, Collection } from 'mongodb';
import { connectToDatabase } from '../lib/database';
import {
    ETFData,
    FinancialDataFilter
} from '../types/financial-data-types';
import { FinancialDataRepository } from './interfaces/financial-data-repository';

export class MongoFinancialDataRepository implements FinancialDataRepository {
    private collectionName = 'financial_data';

    private async getCollection(): Promise<Collection<ETFData>> {
        const { db } = await connectToDatabase();
        return db.collection<ETFData>(this.collectionName);
    }

    async create(data: Omit<ETFData, '_id' | 'createdAt' | 'updatedAt'>): Promise<ETFData> {
        const collection = await this.getCollection();
        const now = new Date();

        const etfData: Omit<ETFData, '_id'> = {
            ...data,
            createdAt: now,
            updatedAt: now,
        };

        const result = await collection.insertOne(etfData as ETFData);
        const insertedDoc = await collection.findOne({ _id: result.insertedId });

        if (!insertedDoc) {
            throw new Error('Failed to create financial data record');
        }

        return insertedDoc;
    }

    async findById(id: string): Promise<ETFData | null> {
        const collection = await this.getCollection();

        if (!ObjectId.isValid(id)) {
            return null;
        }

        return await collection.findOne({ _id: new ObjectId(id) } as any);
    }

    async findBySymbol(symbol: string): Promise<ETFData | null> {
        const collection = await this.getCollection();
        return await collection.findOne({ symbol: symbol.toUpperCase() });
    }

    async findAll(filter: FinancialDataFilter = {}): Promise<ETFData[]> {
        const collection = await this.getCollection();
        const query: any = {};

        if (filter.symbol) {
            query.symbol = filter.symbol.toUpperCase();
        }

        if (filter.type) {
            query['general.type'] = filter.type;
        }

        if (filter.exchange) {
            query['general.exchange'] = filter.exchange;
        }

        if (filter.category) {
            query['general.category'] = filter.category;
        }

        if (filter.createdAfter || filter.createdBefore) {
            query.createdAt = {};
            if (filter.createdAfter) {
                query.createdAt.$gte = filter.createdAfter;
            }
            if (filter.createdBefore) {
                query.createdAt.$lte = filter.createdBefore;
            }
        }

        return await collection.find(query).toArray();
    }

    async update(id: string, data: Partial<ETFData>): Promise<ETFData | null> {
        const collection = await this.getCollection();

        if (!ObjectId.isValid(id)) {
            return null;
        }

        const updateData = {
            ...data,
            updatedAt: new Date(),
        };

        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) } as any,
            { $set: updateData },
            { returnDocument: 'after' }
        );

        return result;
    }

    async delete(id: string): Promise<boolean> {
        const collection = await this.getCollection();

        if (!ObjectId.isValid(id)) {
            return false;
        }

        const result = await collection.deleteOne({ _id: new ObjectId(id) } as any);
        return result.deletedCount === 1;
    }

    async upsertBySymbol(
        symbol: string,
        data: Omit<ETFData, '_id' | 'createdAt' | 'updatedAt'>
    ): Promise<ETFData> {
        const collection = await this.getCollection();
        const now = new Date();

        const upsertData = {
            ...data,
            symbol: symbol.toUpperCase(),
            updatedAt: now,
        };

        const result = await collection.findOneAndUpdate(
            { symbol: symbol.toUpperCase() },
            {
                $set: upsertData,
                $setOnInsert: { createdAt: now }
            },
            {
                upsert: true,
                returnDocument: 'after'
            }
        );

        if (!result) {
            throw new Error('Failed to upsert financial data record');
        }

        return result;
    }

    // Utility method to transform raw JSON data (like vti.json) into ETFData format
    static transformRawDataToETFData(rawData: any, symbol: string): Omit<ETFData, '_id' | 'createdAt' | 'updatedAt'> {
        return {
            symbol: symbol.toUpperCase(),
            general: {
                code: rawData.General?.Code || symbol,
                type: rawData.General?.Type || 'Unknown',
                name: rawData.General?.Name || '',
                exchange: rawData.General?.Exchange || '',
                currencyCode: rawData.General?.CurrencyCode || '',
                currencyName: rawData.General?.CurrencyName || '',
                currencySymbol: rawData.General?.CurrencySymbol || '',
                countryName: rawData.General?.CountryName || '',
                countryISO: rawData.General?.CountryISO || '',
                openFigi: rawData.General?.OpenFigi,
                description: rawData.General?.Description,
                category: rawData.General?.Category,
                updatedAt: rawData.General?.UpdatedAt || new Date().toISOString().split('T')[0],
            },
            technicals: rawData.Technicals ? {
                beta: rawData.Technicals.Beta,
                fiftyTwoWeekHigh: rawData.Technicals['52WeekHigh'],
                fiftyTwoWeekLow: rawData.Technicals['52WeekLow'],
                fiftyDayMA: rawData.Technicals['50DayMA'],
                twoHundredDayMA: rawData.Technicals['200DayMA'],
            } : undefined,
            etfData: rawData.ETF_Data ? {
                isin: rawData.ETF_Data.ISIN,
                companyName: rawData.ETF_Data.Company_Name,
                companyURL: rawData.ETF_Data.Company_URL,
                etfURL: rawData.ETF_Data.ETF_URL,
                domicile: rawData.ETF_Data.Domicile,
                indexName: rawData.ETF_Data.Index_Name,
                yield: rawData.ETF_Data.Yield,
                dividendPayingFrequency: rawData.ETF_Data.Dividend_Paying_Frequency,
                inceptionDate: rawData.ETF_Data.Inception_Date,
                maxAnnualMgmtCharge: rawData.ETF_Data.Max_Annual_Mgmt_Charge,
                ongoingCharge: rawData.ETF_Data.Ongoing_Charge,
                dateOngoingCharge: rawData.ETF_Data.Date_Ongoing_Charge,
                netExpenseRatio: rawData.ETF_Data.NetExpenseRatio,
                annualHoldingsTurnover: rawData.ETF_Data.AnnualHoldingsTurnover,
                totalAssets: rawData.ETF_Data.TotalAssets,
                averageMktCapMil: rawData.ETF_Data.Average_Mkt_Cap_Mil,
                marketCapitalisation: rawData.ETF_Data.Market_Capitalisation,
                assetAllocation: rawData.ETF_Data.Asset_Allocation,
                topSectorsAllocations: rawData.ETF_Data.Top_Sectors_Allocations,
                holdings: rawData.ETF_Data.Holdings,
            } : undefined,
            rawData: rawData, // Store the complete original data for reference
        };
    }
}
