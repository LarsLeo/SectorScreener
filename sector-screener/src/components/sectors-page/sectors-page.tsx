import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./sectors-page.module.css";

interface SectorInfo {
    name: string;
    weight: string;
    relativeToCategory: string;
}

const SectorsPage: React.FC = () => {
    const [sectors, setSectors] = useState<SectorInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSectors = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch("/api/sectors");

                if (!response.ok) {
                    throw new Error(`Failed to fetch sectors: ${response.status}`);
                }

                const data = await response.json();
                setSectors(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
                console.error('Error fetching sectors:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSectors();
    }, []);

    const formatPercentage = (value: string): string => {
        const num = parseFloat(value);
        return isNaN(num) ? value : `${num.toFixed(2)}%`;
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading sectors...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <h2>Error Loading Sectors</h2>
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

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>All Sectors</h1>
                <p className={styles.subtitle}>
                    Explore detailed information about each sector in the VTI portfolio
                </p>
            </div>

            <div className={styles.sectorsGrid}>
                {sectors.map((sector) => (
                    <Link
                        key={sector.name}
                        href={`/sector/${encodeURIComponent(sector.name)}`}
                        className={styles.sectorCard}
                    >
                        <div className={styles.cardHeader}>
                            <h3 className={styles.sectorName}>{sector.name}</h3>
                        </div>
                        <div className={styles.cardStats}>
                            <div className={styles.stat}>
                                <span className={styles.statLabel}>Portfolio Weight</span>
                                <span className={styles.statValue}>{formatPercentage(sector.weight)}</span>
                            </div>
                            <div className={styles.stat}>
                                <span className={styles.statLabel}>Relative to Category</span>
                                <span className={styles.statValue}>{formatPercentage(sector.relativeToCategory)}</span>
                            </div>
                        </div>
                        <div className={styles.cardFooter}>
                            <span className={styles.viewDetails}>View Details →</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default SectorsPage;
