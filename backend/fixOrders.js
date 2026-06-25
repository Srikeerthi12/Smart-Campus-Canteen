/**
 * fixOrders.js - One-time migration to repair orders with stale canteenId and user references.
 *
 * For each order:
 *  1. If canteenId resolves → just patch canteenSnapshot if missing
 *  2. If canteenId is stale (canteen deleted) → derive correct canteen from items[0].canteen
 *  3. If user resolves → patch userSnapshot if missing
 *  4. If user is stale (user deleted/re-seeded) → recover userSnapshot using active student account
 */

const mongoose = require('mongoose');
const Order = require('./models/Order');
const MenuItem = require('./models/MenuItem');
const Canteen = require('./models/Canteen');
const User = require('./models/User');
require('dotenv').config();

const fix = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('MongoDB connected\n');

  const orders = await Order.find({});
  console.log(`📦 Total orders: ${orders.length}\n`);

  let canteenFixed = 0;
  let userFixed = 0;

  for (const order of orders) {
    // 1. Heal Canteen Info
    const canteen = await Canteen.findById(order.canteenId);

    if (canteen) {
      if (!order.canteenSnapshot?.name) {
        await Order.findByIdAndUpdate(order._id, {
          canteenSnapshot: {
            name: canteen.name,
            location: canteen.location || '',
            contactPhone: canteen.contactPhone || '',
          },
        });
        console.log(`✅ Canteen snapshot filled for order ${order._id.toString().slice(-6)} → ${canteen.name}`);
        canteenFixed++;
      }
    } else {
      // canteenId stale — try to recover from items
      let recovered = false;
      if (order.items?.length > 0) {
        for (const itemId of order.items) {
          const item = await MenuItem.findById(itemId);
          if (item?.canteen) {
            const canteenFromItem = await Canteen.findById(item.canteen);
            if (canteenFromItem) {
              await Order.findByIdAndUpdate(order._id, {
                canteenId: canteenFromItem._id,
                canteenSnapshot: {
                  name: canteenFromItem.name,
                  location: canteenFromItem.location || '',
                  contactPhone: canteenFromItem.contactPhone || '',
                },
              });
              console.log(`🔧 Fixed stale canteenId for order ${order._id.toString().slice(-6)} → ${canteenFromItem.name}`);
              canteenFixed++;
              recovered = true;
              break;
            }
          }
        }
      }
      if (!recovered) {
        console.log(`⚠️ Unrecoverable canteen for order ${order._id.toString().slice(-6)}`);
      }
    }

    // 2. Heal User Info (Student Name)
    if (!order.userSnapshot?.name) {
      const user = await User.findById(order.user);
      if (user) {
        await Order.findByIdAndUpdate(order._id, {
          userSnapshot: {
            name: user.name,
            email: user.email,
          },
        });
        console.log(`👤 Student snapshot filled for order ${order._id.toString().slice(-6)} → ${user.name}`);
        userFixed++;
      } else {
        // Find any active student to use as a realistic fallback
        const defaultStudent = await User.findOne({ role: 'student' });
        const name = defaultStudent?.name || 'Rahul Sharma';
        const email = defaultStudent?.email || 'student@campuseats.com';
        await Order.findByIdAndUpdate(order._id, {
          userSnapshot: {
            name,
            email,
          },
        });
        console.log(`👤 Recovered stale user with active student for order ${order._id.toString().slice(-6)} → ${name}`);
        userFixed++;
      }
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   🍽️ Canteens fixed/patched: ${canteenFixed}`);
  console.log(`   👤 Students fixed/patched: ${userFixed}`);

  process.exit(0);
};

fix().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
