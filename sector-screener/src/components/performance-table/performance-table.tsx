import React from "react";
import type { EnrichedTickerData } from "../../types/enriched-ticker-data";
import styles from "./performance-table.module.css";

import type { TimeRange } from "../../types/time-range";

interface PerformanceTableProps {
    data: EnrichedTickerData[];
    range: TimeRange;
}

const PerformanceTable: React.FC<PerformanceTableProps> = ({ data, range }) => (
    <div className={styles.container}>
        <table className={styles.table}>
            <thead className={styles.thead}>
                <tr>
                    <th className={styles.th}>Ticker</th>
                    <th className={styles.th}>Percentual Increase</th>
                    <th className={styles.th}>High Point</th>
                </tr>
            </thead>
            <tbody>
                {data.map(enriched => {
                    const enrichment = enriched.enrichmentByRange[range];
                    return (
                        <tr key={enriched.tickerData.ticker}>
                            <td className={styles.td}>{enriched.tickerData.ticker}</td>
                            <td className={`${styles.td} ${enrichment && enrichment.percentualIncrease < 0 ? styles.negative : styles.positive}`}>
                                {enrichment
                                    ? `${enrichment.percentualIncrease >= 0 ? "+" : ""}${enrichment.percentualIncrease.toFixed(2)}%`
                                    : "-"}
                            </td>
                            <td className={styles.td}>
                                {enrichment
                                    ? `${enrichment.high.price.toLocaleString()} EUR (${enrichment.high.date})`
                                    : "-"}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
);

export default PerformanceTable;
