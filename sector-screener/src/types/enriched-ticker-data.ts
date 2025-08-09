import type { TickerData } from "./ticker-data";
import type { DataPoint } from "./data-point";
import { TimeRange } from "./time-range";

export interface EnrichedTickerData {
    tickerData: TickerData;
    enrichmentByRange: Partial<Record<TimeRange, Enrichment>>;
}

export interface Enrichment {
    high: DataPoint;
    percentualIncrease: number;
}
