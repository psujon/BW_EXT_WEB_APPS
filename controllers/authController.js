const jwt = require('jsonwebtoken');
const { prisma } = require('../db');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkeyforgarmentsdashboard12345';

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: { permissions: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const permissions = {};
    user.permissions.forEach(p => {
      permissions[p.menu_key] = !!p.can_view;
    });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        email: user.email
      },
      permissions,
      isMockMode: false
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, username: true, email: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const permissionsList = await prisma.permission.findMany({
      where: { user_id: user.id }
    });

    const permissions = {};
    permissionsList.forEach(p => {
      permissions[p.menu_key] = !!p.can_view;
    });

    res.json({
      user,
      permissions,
      isMockMode: false
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getStats = async (req, res) => {
  try {
    res.json({
      cards: [
        { title: 'Total Buyers', value: '14', change: '+2 new this month', trend: 'up' },
        { title: 'Active Styles', value: '42', change: '+8 running', trend: 'up' },
        { title: 'Today Production', value: '2,050 pcs', change: '93% efficiency', trend: 'stable' },
        { title: 'Yarn Stock', value: '4,520 kg', change: '-340 kg today', trend: 'down' }
      ],
      productionOverview: [
        { month: 'Jan', H_M: 4500, Zara: 3200, Levis: 2100 },
        { month: 'Feb', H_M: 5200, Zara: 4100, Levis: 2800 },
        { month: 'Mar', H_M: 6100, Zara: 4900, Levis: 3100 },
        { month: 'Apr', H_M: 5800, Zara: 5200, Levis: 3500 },
        { month: 'May', H_M: 7100, Zara: 6000, Levis: 4200 },
        { month: 'Jun', H_M: 8500, Zara: 6800, Levis: 5100 }
      ],
      recentActivities: [
        { id: 1, user: 'Admin', action: 'Added Style #SW-5021 for Zara', time: '10 mins ago' },
        { id: 2, user: 'Manager', action: 'Production Entry: 850 pcs completed', time: '34 mins ago' },
        { id: 3, user: 'Admin', action: 'Created new yarn challan #CH-8802', time: '2 hours ago' },
        { id: 4, user: 'Manager', action: 'Updated Piece Rate for Style #PL-1102', time: '4 hours ago' }
      ]
    });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'বর্তমান পাসওয়ার্ড এবং নতুন পাসওয়ার্ড উভয় ঘর পূরণ করুন!' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ message: 'ইউজার খুঁজে পাওয়া যায়নি!' });
    }

    if (user.password !== currentPassword) {
      return res.status(400).json({ message: 'আপনার বর্তমান পাসওয়ার্ডটি সঠিক নয়!' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: newPassword }
    });

    res.json({ message: 'আপনার পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
