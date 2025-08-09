import { NextApiRequest, NextApiResponse } from "next";
import { MongoFinancialDataRepository } from "../../src/database/mongo-financial-data-repository";
import { SectorDetailData } from "../../src/types/sector-data";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<SectorDetailData | { error: string }>
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { sector } = req.query;

    if (!sector || typeof sector !== "string") {
        return res.status(400).json({ error: "Sector parameter is required" });
    }

    try {
        const repository = new MongoFinancialDataRepository();

        // Get the VTI data that contains sector information
        const etfData = await repository.findBySymbol("VTI");

        if (!etfData) {
            return res.status(404).json({ error: "ETF data not found" });
        }

        // Extract sector data from raw data
        const rawData = etfData.rawData;
        if (!rawData || !rawData.Sector_Weights) {
            return res.status(404).json({ error: "Sector weights data not found" });
        }

        // Find the specific sector
        const sectorWeights = rawData.Sector_Weights;
        const sectorWeight = sectorWeights[sector];

        if (!sectorWeight) {
            return res.status(404).json({ error: `Sector '${sector}' not found` });
        }

        // Extract top holdings for this sector
        const topHoldings: Array<{
            name: string;
            symbol: string;
            portfolioPercent: string;
            sharesHeld: string;
            marketValue: string;
        }> = [];

        if (rawData.Holdings && rawData.Holdings.Holdings_Data) {
            const holdings = rawData.Holdings.Holdings_Data;

            // Filter holdings by sector and get top holdings
            Object.values(holdings).forEach((holding: any) => {
                if (holding.Sector === sector) {
                    topHoldings.push({
                        name: holding.Name || "Unknown",
                        symbol: holding.Ticker || "N/A",
                        portfolioPercent: holding.Portfolio_Percent || "0",
                        sharesHeld: holding.Shares_Held || "0",
                        marketValue: holding.Market_Value || "0"
                    });
                }
            });
        }

        // Sort by portfolio percentage (descending)
        topHoldings.sort((a, b) => {
            const aPercent = parseFloat(a.portfolioPercent) || 0;
            const bPercent = parseFloat(b.portfolioPercent) || 0;
            return bPercent - aPercent;
        });

        // Take top 20 holdings
        const limitedHoldings = topHoldings.slice(0, 20);

        const sectorDetailData: SectorDetailData = {
            sectorName: sector,
            weight: {
                equity: sectorWeight["Equity_%"] || "0",
                relativeToCategory: sectorWeight["Relative_to_Category"] || "0"
            },
            topHoldings: limitedHoldings
        };

        res.status(200).json(sectorDetailData);
    } catch (error) {
        console.error("Error fetching sector data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
