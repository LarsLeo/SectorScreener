import type { DataPoint } from "./data-point";

export enum TickerSymbol {
    IT = "IT",
    RE = "RE",
    CS = "CS"
}

export interface TickerData {
    ticker: TickerSymbol | string;
    data: DataPoint[];
}
