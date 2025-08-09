# Database Setup Guide

This guide explains how to set up and use the MongoDB database for the Sector Screener application.

## Prerequisites

- Docker and Docker Compose installed
- Node.js and npm installed

## Quick Start

### 1. Start the Database

```bash
# From the root directory
docker-compose up -d
```

This will start:
- **MongoDB** on port `27017`
- **Mongo Express** (Web UI) on port `8081`

### 2. Install Dependencies

```bash
cd sector-screener
npm install
```

### 3. Import VTI Data

```bash
# Import the VTI data from vti.json into the database
npm run db:import-vti
```

## Database Access

### MongoDB Connection
- **Host:** localhost:27017
- **Username:** admin
- **Password:** password123
- **Database:** sector_screener

### Mongo Express Web UI
- **URL:** http://localhost:8081
- **Username:** admin
- **Password:** admin123

## API Endpoints

### Financial Data API (`/api/financial-data`)

#### GET - Retrieve Data
```bash
# Get all financial data
GET /api/financial-data

# Get by symbol
GET /api/financial-data?symbol=VTI

# Get by ID
GET /api/financial-data?id=60f7b3b3b3b3b3b3b3b3b3b3

# Filter by type
GET /api/financial-data?type=ETF

# Filter by exchange
GET /api/financial-data?exchange=NYSE ARCA
```

#### POST - Create New Data
```bash
POST /api/financial-data
Content-Type: application/json

{
  "symbol": "SPY",
  "general": {
    "code": "SPY",
    "type": "ETF",
    "name": "SPDR S&P 500 ETF Trust",
    "exchange": "NYSE ARCA",
    "currencyCode": "USD",
    "currencyName": "US Dollar",
    "currencySymbol": "$",
    "countryName": "USA",
    "countryISO": "US",
    "category": "Large Blend",
    "updatedAt": "2025-08-09"
  }
}
```

#### POST - Upsert (Create or Update)
```bash
POST /api/financial-data
Content-Type: application/json

{
  "symbol": "VTI",
  "upsert": true,
  "general": { ... },
  "technicals": { ... },
  "etfData": { ... }
}
```

#### PUT - Update Existing Data
```bash
PUT /api/financial-data?id=60f7b3b3b3b3b3b3b3b3b3b3
Content-Type: application/json

{
  "general": {
    "category": "Updated Category"
  }
}
```

#### DELETE - Remove Data
```bash
DELETE /api/financial-data?id=60f7b3b3b3b3b3b3b3b3b3b3
```

## Repository Usage in Code

```typescript
import { MongoFinancialDataRepository } from '../database/MongoFinancialDataRepository';

const repository = new MongoFinancialDataRepository();

// Create new record
const newData = await repository.create({
  symbol: 'SPY',
  general: { ... },
  // ... other fields
});

// Find by symbol
const vtiData = await repository.findBySymbol('VTI');

// Find all ETFs
const etfs = await repository.findAll({ type: 'ETF' });

// Upsert (update if exists, create if not)
const upsertedData = await repository.upsertBySymbol('VTI', transformedData);
```

## Useful npm Scripts

```bash
# Start MongoDB containers
npm run db:up

# Stop MongoDB containers
npm run db:down

# View MongoDB logs
npm run db:logs

# Import VTI data
npm run db:import-vti
```

## Data Transformation

The repository includes a utility method to transform raw JSON data (like your `vti.json`) into the structured `ETFData` format:

```typescript
const rawData = JSON.parse(fs.readFileSync('vti.json', 'utf8'));
const transformedData = MongoFinancialDataRepository.transformRawDataToETFData(rawData, 'VTI');
```

## Environment Variables

Create a `.env.local` file in the `sector-screener` directory:

```env
MONGODB_URI=mongodb://admin:password123@localhost:27017
MONGODB_DB_NAME=sector_screener
```

## Troubleshooting

### Connection Issues
1. Ensure Docker containers are running: `docker-compose ps`
2. Check MongoDB logs: `npm run db:logs`
3. Verify connection string in `.env.local`

### Data Import Issues
1. Ensure the `vti.json` file exists in the project root
2. Check that MongoDB is running before importing
3. Verify the file path in the import script

### API Issues
1. Check that dependencies are installed: `npm install`
2. Ensure MongoDB connection is working
3. Check API logs in the Next.js console
