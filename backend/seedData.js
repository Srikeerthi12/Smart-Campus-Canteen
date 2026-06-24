const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Canteen = require('./models/Canteen');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully for seeding');

    // 1. Clear existing non-admin data
    console.log('Cleaning existing data...');
    await Order.deleteMany({});
    await MenuItem.deleteMany({});
    await Canteen.deleteMany({});
    // Delete students and owners, keep superAdmin
    await User.deleteMany({ role: { $ne: 'superAdmin' } });

    // Ensure superAdmin exists
    const adminExists = await User.findOne({ role: 'superAdmin' });
    if (!adminExists) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      const newAdmin = new User({
        name: 'Super Administrator',
        email: 'superadmin@campuseats.com',
        password: adminPassword,
        role: 'superAdmin',
      });
      await newAdmin.save();
      console.log('Super Admin user created.');
    }

    // Hash common passwords
    const ownerPassword = await bcrypt.hash('owner123', 10);
    const studentPassword = await bcrypt.hash('student123', 10);

    // 2. Create Student Account
    const student = new User({
      name: 'Rahul Sharma',
      email: 'student@campuseats.com',
      password: studentPassword,
      role: 'student',
    });
    await student.save();
    console.log('✅ Student account created: student@campuseats.com / student123');

    // 3. Define Canteens and their Owners
    const canteensData = [
      {
        canteenName: 'Main Cafeteria',
        location: 'South Campus, Near Central Library',
        openTime: '08:00 AM',
        closeTime: '08:00 PM',
        contactPhone: '+91 98765 43210',
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
        ownerEmail: 'owner1@campuseats.com',
        ownerName: 'Vikram Singh',
        menu: [
          {
            name: 'Masala Dosa',
            description: 'Crispy rice crepe filled with spiced potato mash, served with sambar and coconut chutney.',
            price: 60,
            imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600',
          },
          {
            name: 'Veg Biryani',
            description: 'Fragrant basmati rice cooked with assorted fresh vegetables and aromatic Indian spices.',
            price: 120,
            imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600',
          },
          {
            name: 'Paneer Butter Masala',
            description: 'Soft cottage cheese cubes cooked in a rich, creamy, and mildly sweet tomato-based gravy.',
            price: 140,
            imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600',
          },
          {
            name: 'Butter Naan',
            description: 'Soft and leavened flatbread cooked in a tandoor, brushed generously with fresh butter.',
            price: 30,
            imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600', // Substituted with a good naan/flatbread look
          },
          {
            name: 'Samosa (Plate of 2)',
            description: 'Crispy deep-fried pastries stuffed with spiced potatoes and peas, served with sweet & spicy chutneys.',
            price: 30,
            imageUrl: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600',
          },
          {
            name: 'Chole Bhature',
            description: 'Spicy chickpeas curry served with two large fluffy deep-fried leavened breads.',
            price: 90,
            imageUrl: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600', // Good indian food representation
          }
        ]
      },
      {
        canteenName: 'Vikas Food Court',
        location: 'Central Block, Ground Floor',
        openTime: '09:00 AM',
        closeTime: '09:30 PM',
        contactPhone: '+91 87654 32109',
        imageUrl: 'https://images.unsplash.com/photo-1562059390-a761a0847685?w=800',
        ownerEmail: 'owner2@campuseats.com',
        ownerName: 'Vikas Gupta',
        menu: [
          {
            name: 'Classic Cheese Burger',
            description: 'Juicy grilled veg patty topped with melted cheddar cheese, fresh lettuce, tomatoes, and house sauce.',
            price: 80,
            imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
          },
          {
            name: 'Paneer Tikka Pizza',
            description: 'Freshly baked thin crust pizza topped with spicy marinated paneer cubes, capsicum, onions, and lots of mozzarella.',
            price: 180,
            imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600',
          },
          {
            name: 'Crispy French Fries',
            description: 'Golden, crispy potato fries lightly seasoned with sea salt, served hot with tomato ketchup.',
            price: 50,
            imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600',
          },
          {
            name: 'Spicy Schezwan Noodles',
            description: 'Wok-tossed noodles with colorful stir-fried vegetables in a fiery Schezwan chili sauce.',
            price: 100,
            imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600',
          },
          {
            name: 'Veg Spring Rolls',
            description: 'Crispy deep-fried wrappers stuffed with seasoned crunchy vegetables, served with sweet chili dip.',
            price: 70,
            imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600',
          }
        ]
      },
      {
        canteenName: 'Nescafe Corner',
        location: 'Engineering Block A, Courtyard',
        openTime: '08:30 AM',
        closeTime: '07:00 PM',
        contactPhone: '+91 76543 21098',
        imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
        ownerEmail: 'owner3@campuseats.com',
        ownerName: 'Anil Mehta',
        menu: [
          {
            name: 'Premium Cappuccino',
            description: 'Rich espresso shot topped with smooth, creamy steamed milk foam and a dusting of cocoa.',
            price: 55,
            imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600',
          },
          {
            name: 'Ice Blended Cold Coffee',
            description: 'Refreshing cold coffee blended with milk, ice cream, and chocolate syrup, served chilled.',
            price: 70,
            imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600',
          },
          {
            name: 'Grilled Cheese Sandwich',
            description: 'Perfectly toasted golden bread slices filled with melted mozzarella and cheddar, seasoned with Italian herbs.',
            price: 65,
            imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600',
          },
          {
            name: 'Chocolate Chip Muffin',
            description: 'Soft, moist, and fluffy oven-baked muffin loaded with sweet chocolate chips throughout.',
            price: 45,
            imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600', // Good baked product representation
          },
          {
            name: 'Hot Masala Chai',
            description: 'Traditional brewed Indian milk tea infused with aromatic spices like cardamom, ginger, and cloves.',
            price: 20,
            imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600',
          }
        ]
      },
      {
        canteenName: 'Healthy Bites & Juices',
        location: 'Sports Complex Main Entrance',
        openTime: '07:00 AM',
        closeTime: '08:30 PM',
        contactPhone: '+91 65432 10987',
        imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800',
        ownerEmail: 'owner4@campuseats.com',
        ownerName: 'Meera Nair',
        menu: [
          {
            name: 'Fresh Orange Juice',
            description: '100% natural, freshly squeezed orange juice rich in Vitamin C, served chilled without added sugar.',
            price: 60,
            imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600',
          },
          {
            name: 'Nutritious Fruit Salad Bowl',
            description: 'A vibrant mix of freshly cut seasonal fruits including apples, bananas, papaya, pomegranate, and grapes.',
            price: 80,
            imageUrl: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=600',
          },
          {
            name: 'Protein Power Shake',
            description: 'A healthy blend of whey protein, bananas, oats, almond milk, and a spoonful of natural peanut butter.',
            price: 110,
            imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600', // Good shake representation
          },
          {
            name: 'Avocado Veggie Toast',
            description: 'Toasted whole wheat bread topped with creamy mashed avocado, cherry tomatoes, cucumbers, and a pinch of black pepper.',
            price: 95,
            imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600',
          }
        ]
      }
    ];

    // 4. Create and Link Canteens & Owners
    for (const c of canteensData) {
      console.log(`Seeding ${c.canteenName}...`);

      // Create Canteen Owner
      const owner = new User({
        name: c.ownerName,
        email: c.ownerEmail,
        password: ownerPassword,
        role: 'canteenOwner',
      });
      await owner.save();

      // Create Canteen
      const canteen = new Canteen({
        name: c.canteenName,
        location: c.location,
        openTime: c.openTime,
        closeTime: c.closeTime,
        contactPhone: c.contactPhone,
        imageUrl: c.imageUrl,
        ownerId: owner._id,
      });
      await canteen.save();

      // Update owner with Canteen ID
      owner.canteenId = canteen._id;
      await owner.save();

      // Create Menu Items
      for (const item of c.menu) {
        const menuItem = new MenuItem({
          name: item.name,
          description: item.description,
          price: item.price,
          imageUrl: item.imageUrl,
          canteen: canteen._id,
          isAvailable: true,
        });
        await menuItem.save();
      }
      
      console.log(`✅ Seeded ${c.canteenName} with Owner: ${c.ownerEmail} / owner123 and ${c.menu.length} items`);
    }

    console.log('🎉 All data seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedData();
