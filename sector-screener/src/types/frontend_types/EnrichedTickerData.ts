import type { TickerData } from "../shared_types/TickerData";
import type { DataPoint } from "../shared_types/DataPoint";
import { TimeRange } from "../shared_types/TimeRange";

export interface EnrichedTickerData {
    tickerData: TickerData;
    enrichmentByRange: Partial<Record<TimeRange, Enrichment>>;
}

export interface Enrichment {
    high: DataPoint;
    percentualIncrease: number;
}
