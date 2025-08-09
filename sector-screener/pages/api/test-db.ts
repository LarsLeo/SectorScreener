import { NextApiRequest, NextApiResponse } from "next";
import { MongoFinancialDataRepository } from "../../src/database/mongo-financial-data-repository";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const repository = new MongoFinancialDataRepository();

        console.log("Attempting to connect to database...");

        // Try to find VTI data
        const etfData = await repository.findBySymbol("VTI");

        if (!etfData) {
            console.log("VTI data not found in database");

            // Let's check what data exists
            const allData = await repository.findAll({});
            console.log("Available data:", allData.slice(0, 10).map(d => d.symbol));

            return res.status(404).json({
                error: "VTI data not found",
                availableSymbols: allData.slice(0, 10).map(d => d.symbol)
            });
        }

        console.log("VTI data found:", {
            symbol: etfData.symbol,
            hasRawData: !!etfData.rawData,
            hasSectorWeights: !!(etfData.rawData && etfData.rawData.Sector_Weights)
        });

        res.status(200).json({
            success: true,
            symbol: etfData.symbol,
            hasRawData: !!etfData.rawData,
            hasSectorWeights: !!(etfData.rawData && etfData.rawData.Sector_Weights),
            sectorCount: etfData.rawData?.Sector_Weights ? Object.keys(etfData.rawData.Sector_Weights).length : 0
        });
    } catch (error) {
        console.error("Database test error:", error);
        res.status(500).json({
            error: "Database connection failed",
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
