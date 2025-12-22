/**
 * Script để sửa các đơn hàng cũ không có thông tin items đầy đủ
 * Chạy: node scripts/fix-orders-items.js
 */

const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/florana')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

const Order = require('../models/Order');
const Product = require('../models/Product');

async function fixOrdersItems() {
  try {
    console.log('\n📦 Đang kiểm tra các đơn hàng...\n');
    
    const orders = await Order.find({});
    console.log(`Tìm thấy ${orders.length} đơn hàng\n`);
    
    let fixed = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const order of orders) {
      try {
        // Kiểm tra nếu items trống hoặc thiếu thông tin
        if (!order.items || order.items.length === 0) {
          console.log(`⚠️ Đơn hàng ${order._id} không có items`);
          skipped++;
          continue;
        }
        
        let needsUpdate = false;
        const updatedItems = [];
        
        for (const item of order.items) {
          // Nếu item thiếu name hoặc image, lấy từ Product
          if (!item.name || !item.image) {
            const product = await Product.findById(item.product);
            
            if (product) {
              updatedItems.push({
                product: item.product,
                name: item.name || product.name,
                price: item.price || product.price,
                quantity: item.quantity,
                image: item.image || product.images?.[0] || '',
                reviewed: item.reviewed || false
              });
              needsUpdate = true;
              console.log(`  📝 Cập nhật item: ${product.name}`);
            } else {
              // Giữ nguyên nếu không tìm thấy product
              updatedItems.push({
                ...item.toObject(),
                name: item.name || 'Sản phẩm không còn tồn tại',
                image: item.image || ''
              });
              needsUpdate = true;
            }
          } else {
            updatedItems.push(item.toObject());
          }
        }
        
        if (needsUpdate) {
          order.items = updatedItems;
          await order.save();
          fixed++;
          console.log(`✅ Đã sửa đơn hàng ${order._id}\n`);
        } else {
          skipped++;
        }
        
      } catch (itemError) {
        console.error(`❌ Lỗi xử lý đơn hàng ${order._id}:`, itemError.message);
        errors++;
      }
    }
    
    console.log('\n========================================');
    console.log(`📊 Kết quả:`);
    console.log(`   ✅ Đã sửa: ${fixed} đơn hàng`);
    console.log(`   ⏭️ Bỏ qua: ${skipped} đơn hàng`);
    console.log(`   ❌ Lỗi: ${errors} đơn hàng`);
    console.log('========================================\n');
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Đã ngắt kết nối MongoDB');
  }
}

// Chạy script
fixOrdersItems();
