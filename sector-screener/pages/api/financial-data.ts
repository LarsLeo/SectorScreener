import { NextApiRequest, NextApiResponse } from 'next';
import { MongoFinancialDataRepository } from '../../src/database/mongo-financial-data-repository';

const repository = new MongoFinancialDataRepository();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        switch (req.method) {
            case 'GET':
                await handleGet(req, res);
                break;
            case 'POST':
                await handlePost(req, res);
                break;
            case 'PUT':
                await handlePut(req, res);
                break;
            case 'DELETE':
                await handleDelete(req, res);
                break;
            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                res.status(405).json({ error: 'Method not allowed' });
                break;
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    const { id, symbol, type, exchange, category } = req.query;

    if (id && typeof id === 'string') {
        const data = await repository.findById(id);
        if (!data) {
            return res.status(404).json({ error: 'Financial data not found' });
        }
        return res.status(200).json(data);
    }

    if (symbol && typeof symbol === 'string') {
        const data = await repository.findBySymbol(symbol);
        if (!data) {
            return res.status(404).json({ error: 'Financial data not found' });
        }
        return res.status(200).json(data);
    }

    // Get all with optional filters
    const filter = {
        type: typeof type === 'string' ? type : undefined,
        exchange: typeof exchange === 'string' ? exchange : undefined,
        category: typeof category === 'string' ? category : undefined,
    };

    const data = await repository.findAll(filter);
    res.status(200).json(data);
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    const { symbol, upsert = false, ...dataFields } = req.body;

    if (!symbol) {
        return res.status(400).json({ error: 'Symbol is required' });
    }

    if (upsert) {
        const data = await repository.upsertBySymbol(symbol, dataFields);
        return res.status(200).json(data);
    } else {
        const data = await repository.create({ symbol, ...dataFields });
        return res.status(201).json(data);
    }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'ID is required' });
    }

    const data = await repository.update(id, req.body);
    if (!data) {
        return res.status(404).json({ error: 'Financial data not found' });
    }

    res.status(200).json(data);
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'ID is required' });
    }

    const success = await repository.delete(id);
    if (!success) {
        return res.status(404).json({ error: 'Financial data not found' });
    }

    res.status(204).end();
}
