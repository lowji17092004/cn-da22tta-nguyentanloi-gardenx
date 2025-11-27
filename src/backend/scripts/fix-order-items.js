const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

mongoose.connect('mongodb://127.0.0.1:27017/flower-shop')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const orders = await Order.find({});
    console.log(`Found ${orders.length} orders to check`);
    
    let updatedCount = 0;
    
    for (const order of orders) {
      let needsUpdate = false;
      
      for (let i = 0; i < order.items.length; i++) {
        const item = order.items[i];
        
        // Nếu thiếu name hoặc image, lấy từ Product
        if (!item.name || !item.image) {
          const product = await Product.findById(item.product);
          if (product) {
            if (!item.name) {
              order.items[i].name = product.name;
              needsUpdate = true;
            }
            if (!item.image && product.images?.[0]) {
              order.items[i].image = product.images[0];
              needsUpdate = true;
            }
            console.log(`  - Updated item: ${product.name}`);
          } else {
            console.log(`  - Product not found for item ${i}`);
          }
        }
      }
      
      if (needsUpdate) {
        await order.save();
        updatedCount++;
        console.log(`Updated order: ${order._id}`);
      }
    }
    
    console.log(`\nDone! Updated ${updatedCount} orders`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
