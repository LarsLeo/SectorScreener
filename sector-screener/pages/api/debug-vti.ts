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

        // Get the VTI data that contains sector information
        const etfData = await repository.findBySymbol("VTI");

        if (!etfData) {
            return res.status(404).json({ error: "ETF data not found" });
        }

        // Return the full raw data structure to see what's available
        res.status(200).json({
            symbol: etfData.symbol,
            rawDataKeys: etfData.rawData ? Object.keys(etfData.rawData) : [],
            etfDataKeys: etfData.rawData?.ETF_Data ? Object.keys(etfData.rawData.ETF_Data) : []
        });
    } catch (error) {
        console.error("Error fetching VTI debug data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
