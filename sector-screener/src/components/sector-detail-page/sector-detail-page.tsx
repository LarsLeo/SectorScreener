import React, { useEffect, useState } from "react";
import { SectorDetailData } from "../../types/sector-data";
import styles from "./sector-detail-page.module.css";

interface SectorDetailPageProps {
    sectorName: string;
}

const SectorDetailPage: React.FC<SectorDetailPageProps> = ({ sectorName }) => {
    const [sectorData, setSectorData] = useState<SectorDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSectorData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/sector-detail?sector=${encodeURIComponent(sectorName)}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch sector data: ${response.status}`);
                }

                const data = await response.json();
                setSectorData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
                console.error('Error fetching sector data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (sectorName) {
            fetchSectorData();
        }
    }, [sectorName]);

    const formatPercentage = (value: string): string => {
        const num = parseFloat(value);
        return isNaN(num) ? value : `${num.toFixed(2)}%`;
    };

    const formatCurrency = (value: string): string => {
        const num = parseFloat(value);
        if (isNaN(num)) return value;

        if (num >= 1e9) {
            return `$${(num / 1e9).toFixed(1)}B`;
        } else if (num >= 1e6) {
            return `$${(num / 1e6).toFixed(1)}M`;
        } else if (num >= 1e3) {
            return `$${(num / 1e3).toFixed(1)}K`;
        }
        return `$${num.toFixed(2)}`;
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading sector data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <h2>Error Loading Sector Data</h2>
                    <p>{error}</p>
                    <button
                        className={styles.retryButton}
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!sectorData) {
        return (
            <div className={styles.container}>
                <div className={styles.noData}>
                    <h2>No Data Available</h2>
                    <p>No data found for sector: {sectorName}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>{sectorData.sectorName}</h1>
                <div className={styles.sectorStats}>
                    <div className={styles.statCard}>
                        <h3>Portfolio Weight</h3>
                        <p className={styles.statValue}>{formatPercentage(sectorData.weight.equity)}</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>Relative to Category</h3>
                        <p className={styles.statValue}>{formatPercentage(sectorData.weight.relativeToCategory)}</p>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Top Holdings in {sectorData.sectorName}</h2>
                {sectorData.topHoldings.length > 0 ? (
                    <div className={styles.holdingsTable}>
                        <div className={styles.tableHeader}>
                            <div className={styles.headerCell}>Company</div>
                            <div className={styles.headerCell}>Symbol</div>
                            <div className={styles.headerCell}>Portfolio %</div>
                            <div className={styles.headerCell}>Shares Held</div>
                            <div className={styles.headerCell}>Market Value</div>
                        </div>
                        {sectorData.topHoldings.map((holding, index) => (
                            <div key={index} className={styles.tableRow}>
                                <div className={styles.cell}>
                                    <div className={styles.companyName}>{holding.name}</div>
                                </div>
                                <div className={styles.cell}>{holding.symbol}</div>
                                <div className={styles.cell}>{formatPercentage(holding.portfolioPercent)}</div>
                                <div className={styles.cell}>{parseInt(holding.sharesHeld).toLocaleString()}</div>
                                <div className={styles.cell}>{formatCurrency(holding.marketValue)}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.noHoldings}>
                        <p>No holdings data available for this sector.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SectorDetailPage;
