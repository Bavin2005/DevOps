const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./config/db');

// Demo users to seed
const demoUsers = [
  {
    name: 'John Employee',
    email: 'employee@example.com',
    password: 'password123',
    role: 'Employee',
    department: 'General'
  },
  {
    name: 'Sarah IT Staff',
    email: 'it@example.com',
    password: 'password123',
    role: 'IT',
    department: 'IT Support'
  },
  {
    name: 'Mike Admin',
    email: 'admin@example.com',
    password: 'password123',
    role: 'Admin',
    department: 'Administration'
  }
];

const seedUsers = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Clear existing demo users
    await User.deleteMany({ 
      email: { 
        $in: ['employee@example.com', 'it@example.com', 'admin@example.com'] 
      } 
    });
    console.log('🗑️  Cleared existing demo users');

    // Create new demo users with hashed passwords
    for (const userData of demoUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = new User({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        department: userData.department
      });

      await user.save();
      console.log(`✅ Created ${userData.role}: ${userData.email}`);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Demo Credentials:');
    console.log('─────────────────────────────────────');
    demoUsers.forEach(user => {
      console.log(`${user.role.padEnd(10)} → ${user.email} / ${user.password}`);
    });
    console.log('─────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();
