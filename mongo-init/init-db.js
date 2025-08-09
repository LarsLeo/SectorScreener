// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

db = db.getSiblingDB('sector_screener');

// Create collections with indexes for optimal performance
db.createCollection('financial_data');

// Create indexes for faster queries
db.financial_data.createIndex({ "symbol": 1 }, { unique: true });
db.financial_data.createIndex({ "general.type": 1 });
db.financial_data.createIndex({ "general.exchange": 1 });
db.financial_data.createIndex({ "general.category": 1 });
db.financial_data.createIndex({ "createdAt": 1 });
db.financial_data.createIndex({ "updatedAt": 1 });

print('Database initialization completed successfully!');
print('Created indexes for financial_data collection:');
print('- symbol (unique)');
print('- general.type');
print('- general.exchange');
print('- general.category');
print('- createdAt');
print('- updatedAt');
