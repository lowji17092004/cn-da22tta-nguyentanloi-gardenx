require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Article = require('./models/Article');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/flower_shop');
  console.log('Connected to mongo for seeding');

  await User.deleteMany({});
  await Product.deleteMany({});
  await Article.deleteMany({});

  const adminPass = await bcrypt.hash('admin123', 10);
  const admin = new User({ name: 'Admin', email: 'admin@flower.local', password: adminPass, role: 'admin' });
  await admin.save();

  const p1 = new Product({ name: 'Hoa Hồng', description: 'Hoa hồng tươi đỏ', price: 200000, images: [], category: 'rose', stock: 10 });
  const p2 = new Product({ name: 'Cây May Mắn', description: 'Cây phong thủy dễ trồng', price: 150000, images: [], category: 'indoor', stock: 15 });
  await p1.save();
  await p2.save();

  const a1 = new Article({ title: 'Cách chăm sóc hoa hồng', slug: 'cham-soc-hoa-hong', summary: 'Mẹo tưới, bón phân, cắt tỉa', content: 'Nội dung chi tiết về chăm sóc hoa hồng.' });
  const a2 = new Article({ title: 'Bonsai cho người mới', slug: 'bonsai-cho-nguoi-moi', summary: 'Bước đầu cho bonsai', content: 'Nội dung chi tiết về bonsai.' });
  await a1.save();
  await a2.save();

  console.log('Seed completed');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
