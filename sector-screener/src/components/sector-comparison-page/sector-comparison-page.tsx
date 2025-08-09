import React, { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { EnrichedTickerData, Enrichment } from "../../types/enriched-ticker-data";
import type { DataPoint } from "../../types/data-point";
import type { TickerData } from "../../types/ticker-data";
import { TICKER_MAP } from "../../types/ticker-map";
import { TimeRange } from "../../types/time-range";
import PerformanceTable from "../performance-table/performance-table";
import styles from "./sector-comparison-page.module.css";

const SYMBOLS = Object.entries(TICKER_MAP).map(([code, name]) => ({ code, name }));

const COLORS = ["#8884d8", "#82ca9d", "#ff7300"];

const SectorComparisonPage: React.FC = () => {
    const [selectedSymbols, setSelectedSymbols] = useState<string[]>(SYMBOLS.map(s => s.code));
    const [data, setData] = useState<EnrichedTickerData[]>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<TimeRange>(TimeRange.Month);

    // Helper to enrich TickerData[] to EnrichedTickerData[]
    const enrichTickerDataArray = (arr: TickerData[]): EnrichedTickerData[] => {
        const ranges: TimeRange[] = [TimeRange.Month, TimeRange.SixMonths, TimeRange.Year];
        return arr.map((td) => {
            const enrichmentByRange: Partial<Record<TimeRange, Enrichment>> = {};
            for (const r of ranges) {
                // Get filtered data for this range
                let days = 30;
                if (r === TimeRange.SixMonths) days = 182;
                if (r === TimeRange.Year) days = 365;
                const filtered = td.data.slice(-days);
                if (filtered.length === 0) continue;
                // Find high DataPoint
                let high: DataPoint = filtered[0];
                for (const dp of filtered) {
                    if (dp.price > high.price) high = dp;
                }
                // Calculate percentualIncrease
                const startPrice = filtered[0]?.price ?? 0;
                const endPrice = filtered[filtered.length - 1]?.price ?? 0;
                const percentualIncrease = startPrice !== 0 ? ((endPrice - startPrice) / startPrice) * 100 : 0;
                enrichmentByRange[r] = { high, percentualIncrease };
            }
            return {
                tickerData: td,
                enrichmentByRange,
            };
        });
    };

    useEffect(() => {
        setLoading(true);
        fetch(`/api/historical-data?ticker=${selectedSymbols.join(",")}`)
            .then((res) => res.json())
            .then((json: TickerData[]) => {
                const enriched = enrichTickerDataArray(json);
                setData(enriched);
                setLoading(false);
            });
    }, [selectedSymbols]);

    const handleSymbolChange = (code: string) => {
        setSelectedSymbols((prev) =>
            prev.includes(code)
                ? prev.filter((s) => s !== code)
                : [...prev, code]
        );
    };

    const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRange(e.target.value as TimeRange);
    }

    // Aggregate data points to 20 per range
    const aggregateDataPoints = (data: DataPoint[], targetPoints: number): DataPoint[] => {
        if (data.length <= targetPoints) return data;
        const step = Math.floor(data.length / targetPoints);
        const aggregated: DataPoint[] = [];
        for (let i = 0; i < targetPoints; i++) {
            const startIdx = i * step;
            const endIdx = i === targetPoints - 1 ? data.length : (i + 1) * step;
            const slice = data.slice(startIdx, endIdx);
            const avgPrice = Math.round(slice.reduce((sum, d) => sum + d.price, 0) / slice.length);
            aggregated.push({ date: slice[Math.floor(slice.length / 2)].date, price: avgPrice });
        }
        return aggregated;
    };

    // Filter and aggregate data by selected range
    const getFilteredData = (input: TickerData | EnrichedTickerData): DataPoint[] => {
        let ticker: TickerData;
        if ("tickerData" in input) {
            ticker = input.tickerData;
        } else {
            ticker = input;
        }
        let days = 30;
        if (range === TimeRange.SixMonths) days = 182;
        if (range === TimeRange.Year) days = 365;
        const filtered = ticker.data.slice(-days);
        return aggregateDataPoints(filtered, 20);
    };

    // Find the max length of data for X axis
    const chartDates = data[0] ? getFilteredData(data[0]).map((d) => d.date) : [];

    return (
        <div className={styles.container}>
            <div className={styles.sectorBar}>
                <span style={{ fontWeight: 600, fontSize: "1.2rem" }}>Select Sectors:</span>
                <div>
                    {SYMBOLS.map((symbol) => (
                        <label key={symbol.code} className={styles.sectorLabel} style={{ display: "block", marginBottom: 8 }}>
                            <input
                                type="checkbox"
                                checked={selectedSymbols.includes(symbol.code)}
                                onChange={() => handleSymbolChange(symbol.code)}
                                className={styles.sectorCheckbox}
                            />
                            <span className={selectedSymbols.includes(symbol.code) ? styles.sectorNameSelected : styles.sectorName}>{symbol.name}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
                <span style={{ fontWeight: 500, fontSize: "1.1rem", marginRight: "1em" }}>Time Range:</span>
                <label style={{ marginRight: "1em" }}>
                    <input type="radio" name="range" value={TimeRange.Month} checked={range === TimeRange.Month} onChange={handleRangeChange} /> 1 Month
                </label>
                <label style={{ marginRight: "1em" }}>
                    <input type="radio" name="range" value={TimeRange.SixMonths} checked={range === TimeRange.SixMonths} onChange={handleRangeChange} /> 6 Months
                </label>
                <label>
                    <input type="radio" name="range" value={TimeRange.Year} checked={range === TimeRange.Year} onChange={handleRangeChange} /> 1 Year
                </label>
            </div>
            {selectedSymbols.length === 0 ? (
                <div className={styles.centeredText}>No sectors selected. Please select at least one sector.</div>
            ) : loading ? (
                <div className={styles.centeredText}>Loading...</div>
            ) : (
                <div>
                    <ResponsiveContainer width="100%" height={420}>
                        <LineChart margin={{ top: 30, right: 40, left: 0, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="6 6" stroke="#393e46" />
                            <XAxis dataKey="date" type="category" allowDuplicatedCategory={false} ticks={chartDates} tick={{ fill: "#fff", fontSize: 13 }} axisLine={{ stroke: "#393e46" }} />
                            <YAxis tick={{ fill: "#fff", fontSize: 13 }} axisLine={{ stroke: "#393e46" }} />
                            <Tooltip
                                contentStyle={{ background: "#22223b", borderRadius: 12, border: "none", color: "#fff" }}
                                labelStyle={{ color: "#00adb5" }}
                                itemStyle={{ color: "#fff" }}
                            />
                            {data.map((enriched, idx) => (
                                <Line
                                    key={enriched.tickerData.ticker}
                                    data={getFilteredData(enriched)}
                                    name={enriched.tickerData.ticker}
                                    type="monotone"
                                    dataKey="price"
                                    stroke={COLORS[idx % COLORS.length]}
                                    strokeWidth={3}
                                    dot={{ r: 3, stroke: COLORS[idx % COLORS.length], strokeWidth: 2, fill: "#fff" }}
                                    activeDot={{ r: 6 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                    <PerformanceTable data={data} range={range} />
                </div>
            )}
        </div>
    );
};

export default SectorComparisonPage;
