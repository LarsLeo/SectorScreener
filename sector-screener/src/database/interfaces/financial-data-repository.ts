import { ETFData, FinancialDataFilter } from '../../types/financial-data-types';

export interface FinancialDataRepository {
    create(data: Omit<ETFData, '_id' | 'createdAt' | 'updatedAt'>): Promise<ETFData>;
    findById(id: string): Promise<ETFData | null>;
    findBySymbol(symbol: string): Promise<ETFData | null>;
    findAll(filter?: FinancialDataFilter): Promise<ETFData[]>;
    update(id: string, data: Partial<ETFData>): Promise<ETFData | null>;
    delete(id: string): Promise<boolean>;
    upsertBySymbol(symbol: string, data: Omit<ETFData, '_id' | 'createdAt' | 'updatedAt'>): Promise<ETFData>;
}
