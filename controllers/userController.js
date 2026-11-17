const { prisma } = require('../db');

exports.getAll = async (req, res) => {
  try {
    // Automatically convert any existing 'manager' roles in DB to 'operator'
    await prisma.user.updateMany({
      where: { role: 'manager' },
      data: { role: 'operator' }
    });

    // Ensure default Operator user exists in DB for initial setup
    const existingOp = await prisma.user.findFirst({
      where: { role: 'operator' }
    });

    if (!existingOp) {
      const createdOp = await prisma.user.create({
        data: {
          name: 'Factory Operator',
          username: 'operator',
          password: 'operator123',
          email: 'operator@bestwool.com',
          role: 'operator'
        }
      });

      const menuKeys = ['dashboard', 'production_entry', 'production_show', 'employee_info', 'yarn_challan', 'buyer_order_info', 'style', 'buyer'];
      await prisma.permission.createMany({
        data: menuKeys.map(menu => ({
          user_id: createdOp.id,
          menu_key: menu,
          can_view: true
        }))
      });
    }

    const users = await prisma.user.findMany({
      select: { id: true, name: true, username: true, email: true, role: true, created_at: true }
    });
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.create = async (req, res) => {
  const { name, username, password, email, role } = req.body;
  if (!name || !username || !password) {
    return res.status(400).json({ message: 'Name, username, and password are required' });
  }
  try {
    const userRole = role === 'manager' ? 'operator' : (role || 'operator');
    const user = await prisma.user.create({
      data: { name, username, password, email, role: userRole }
    });

    const menuKeys = ['dashboard', 'production_entry', 'production_show', 'employee_info', 'yarn_challan', 'buyer_order_info', 'style', 'buyer'];
    await prisma.permission.createMany({
      data: menuKeys.map(menu => ({
        user_id: user.id,
        menu_key: menu,
        can_view: true
      }))
    });

    res.json({ message: 'User created successfully', id: user.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ message: 'Role is required' });
  }

  try {
    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role }
    });
    res.json({ message: 'Role updated successfully', user: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllPermissions = async (req, res) => {
  try {
    const list = await prisma.permission.findMany();
    res.json(list);
  } catch (err) {
    console.error('Error fetching permissions:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.toggleUserPermission = async (req, res) => {
  const { id } = req.params;
  const { menu_key, can_view } = req.body;
  const userId = parseInt(id);

  if (!menu_key) {
    return res.status(400).json({ message: 'Menu key is required' });
  }

  try {
    const existing = await prisma.permission.findFirst({
      where: { user_id: userId, menu_key }
    });

    let updated;
    if (existing) {
      updated = await prisma.permission.update({
        where: { id: existing.id },
        data: { can_view: !!can_view }
      });
    } else {
      updated = await prisma.permission.create({
        data: {
          user_id: userId,
          menu_key,
          can_view: !!can_view
        }
      });
    }

    res.json({ message: 'Permission updated successfully', permission: updated });
  } catch (err) {
    console.error('Error updating user permission:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updatePassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.trim() === '') {
    return res.status(400).json({ message: 'নতুন পাসওয়ার্ড প্রদান করুন' });
  }

  try {
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { password: newPassword.trim() }
    });
    res.json({ message: 'ইউজার পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!' });
  } catch (err) {
    console.error('Error updating user password:', err);
    res.status(500).json({ message: err.message });
  }
};
