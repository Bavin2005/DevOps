const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// Get all users (Admin only)
router.get('/', protect, async (req, res) => {
  try {
    // Only admins can view all users
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Employee directory - all logged-in users can see (name, email, department, role)
router.get('/directory', protect, async (req, res) => {
  try {
    const users = await User.find().select('name email department role');
    res.json(users);
  } catch (error) {
    console.error('Error fetching directory:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get today's birthdays and work anniversaries
router.get('/celebrations', protect, async (req, res) => {
  try {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    const users = await User.find({
      $or: [
        { birthDate: { $exists: true, $ne: null }, $expr: { $and: [{ $eq: [{ $month: '$birthDate' }, month] }, { $eq: [{ $dayOfMonth: '$birthDate' }, day] }] } },
        { joiningDate: { $exists: true, $ne: null }, $expr: { $and: [{ $eq: [{ $month: '$joiningDate' }, month] }, { $eq: [{ $dayOfMonth: '$joiningDate' }, day] }] } },
      ],
    }).select('name birthDate joiningDate department');

    const birthdays = users.filter((u) => u.birthDate && u.birthDate.getMonth() === today.getMonth() && u.birthDate.getDate() === day);
    const anniversaries = users.filter((u) => u.joiningDate && u.joiningDate.getMonth() === today.getMonth() && u.joiningDate.getDate() === day);

    res.json({ birthdays, anniversaries });
  } catch (error) {
    console.error('Error fetching celebrations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get IT staff only (for ticket assignment)
router.get('/it-staff', protect, async (req, res) => {
  try {
    // Only admins can fetch IT staff for assignment
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const itStaff = await User.find({ role: 'IT' }).select('-password');
    res.json(itStaff);
  } catch (error) {
    console.error('Error fetching IT staff:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user (Admin only) - for birthDate, joiningDate, etc.
router.put('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const { birthDate, joiningDate } = req.body;
    const updates = {};
    if (birthDate !== undefined) updates.birthDate = birthDate ? new Date(birthDate) : null;
    if (joiningDate !== undefined) updates.joiningDate = joiningDate ? new Date(joiningDate) : null;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
