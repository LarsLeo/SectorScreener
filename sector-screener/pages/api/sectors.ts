import { NextApiRequest, NextApiResponse } from "next";
import { MongoFinancialDataRepository } from "../../src/database/mongo-financial-data-repository";

interface SectorInfo {
    name: string;
    weight: string;
    relativeToCategory: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<SectorInfo[] | { error: string }>
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
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
        if (!rawData || !rawData.ETF_Data || !rawData.ETF_Data.Holdings) {
            return res.status(404).json({ error: "Holdings data not found" });
        }

        const holdings = rawData.ETF_Data.Holdings;
        const sectorMap = new Map<string, { totalWeight: number, count: number }>();

        // Aggregate holdings by sector
        Object.values(holdings).forEach((holding: any) => {
            const sector = holding.Sector;
            const weight = holding["Assets_%"] || 0;

            if (sector && sector !== null && sector !== "null") {
                if (sectorMap.has(sector)) {
                    const existing = sectorMap.get(sector)!;
                    sectorMap.set(sector, {
                        totalWeight: existing.totalWeight + weight,
                        count: existing.count + 1
                    });
                } else {
                    sectorMap.set(sector, {
                        totalWeight: weight,
                        count: 1
                    });
                }
            }
        });

        const sectors: SectorInfo[] = [];

        // Convert sector map to array
        sectorMap.forEach((data, sectorName) => {
            sectors.push({
                name: sectorName,
                weight: data.totalWeight.toFixed(2),
                relativeToCategory: "0" // This data is not available in the current structure
            });
        });

        // Sort sectors by weight (descending)
        sectors.sort((a, b) => {
            const aWeight = parseFloat(a.weight) || 0;
            const bWeight = parseFloat(b.weight) || 0;
            return bWeight - aWeight;
        });

        res.status(200).json(sectors);
    } catch (error) {
        console.error("Error fetching sectors:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
