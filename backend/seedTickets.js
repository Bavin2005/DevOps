const mongoose = require('mongoose');
const Ticket = require('./models/Ticket');
const User = require('./models/User');
const connectDB = require('./config/db');

const seedTickets = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Get the employee user
    const employee = await User.findOne({ email: 'employee@example.com' });
    
    if (!employee) {
      console.log('❌ Employee user not found. Run seedUsers.js first!');
      process.exit(1);
    }

    // Clear existing demo tickets
    await Ticket.deleteMany({ createdBy: employee._id });
    console.log('🗑️  Cleared existing demo tickets');

    // Sample tickets (using valid categories: Network, Software, Hardware, Other)
    const sampleTickets = [
      {
        title: 'Laptop won\'t turn on',
        description: 'My laptop suddenly stopped working. The power button doesn\'t respond at all.',
        category: 'Hardware',
        priority: 'High',
        status: 'Open',
        createdBy: employee._id,
      },
      {
        title: 'Need access to shared drive',
        description: 'I need access to the Marketing shared drive for the new campaign materials.',
        category: 'Other',
        priority: 'Medium',
        status: 'In Progress',
        createdBy: employee._id,
      },
      {
        title: 'Email not syncing on mobile',
        description: 'My work email stopped syncing on my iPhone. Last sync was 2 days ago.',
        category: 'Software',
        priority: 'Medium',
        status: 'Open',
        createdBy: employee._id,
      },
      {
        title: 'VPN connection issues',
        description: 'Cannot connect to VPN from home. Getting "Connection timeout" error.',
        category: 'Network',
        priority: 'High',
        status: 'In Progress',
        createdBy: employee._id,
      },
      {
        title: 'Password reset request',
        description: 'Locked out of my account after too many failed login attempts.',
        category: 'Other',
        priority: 'Low',
        status: 'Resolved',
        createdBy: employee._id,
      },
      {
        title: 'Printer not printing',
        description: 'Office printer on 3rd floor shows as ready but documents won\'t print.',
        category: 'Hardware',
        priority: 'Low',
        status: 'Resolved',
        createdBy: employee._id,
      },
    ];

    // Create tickets
    for (const ticketData of sampleTickets) {
      const ticket = await Ticket.create(ticketData);
      console.log(`✅ Created ticket: ${ticket.title}`);
    }

    console.log('\n🎉 Demo tickets created successfully!');
    console.log(`📊 Total tickets: ${sampleTickets.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding tickets:', error);
    process.exit(1);
  }
};

seedTickets();
