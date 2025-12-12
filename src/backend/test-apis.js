// Test script to check database data
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/flower-shop';

async function testDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB\n');

    // Count documents in each collection
    const collections = [
      { name: 'users', model: 'User' },
      { name: 'products', model: 'Product' },
      { name: 'orders', model: 'Order' },
      { name: 'reviews', model: 'Review' },
      { name: 'categories', model: 'Category' },
      { name: 'articles', model: 'Article' }
    ];

    console.log('Database Statistics:');
    console.log('===================');

    for (const col of collections) {
      try {
        const count = await mongoose.connection.db.collection(col.name).countDocuments();
        console.log(`${col.name.padEnd(15)}: ${count} items`);
        
        // Sample first item
        if (count > 0) {
          const sample = await mongoose.connection.db.collection(col.name).findOne({});
          console.log(`  Sample ID: ${sample._id}`);
        }
      } catch (err) {
        console.log(`${col.name.padEnd(15)}: Error - ${err.message}`);
      }
    }

    console.log('\n✓ Database check complete');
    
  } catch (err) {
    console.error('✗ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testDatabase();
