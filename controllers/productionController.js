const { prisma } = require('../db');

exports.getAll = async (req, res) => {
  const { section_name, style_no, process_name, color_name, card_no, from_date, to_date } = req.query;

  try {
    // 1. Fetch employees to map saved IDs to live Card Numbers & Names
    const allEmployees = await prisma.employee.findMany({
      select: { id: true, card_no: true, name: true, designation: true }
    });

    const empById = new Map(allEmployees.map(e => [e.id, e]));
    const empByCard = new Map(allEmployees.map(e => [e.card_no.toLowerCase(), e]));

    const where = {};

    if (card_no && card_no.trim() !== '') {
      const q = card_no.trim();
      const qLower = q.toLowerCase();

      // Find employees matching search query by card_no, name, or id
      const matchingEmps = allEmployees.filter(e =>
        e.card_no.toLowerCase().includes(qLower) ||
        e.name.toLowerCase().includes(qLower) ||
        String(e.id) === q
      );

      const matchingCardIds = matchingEmps.map(e => e.id);
      const asNum = parseInt(q);
      if (!isNaN(asNum) && !matchingCardIds.includes(asNum)) {
        matchingCardIds.push(asNum);
      }

      where.card_no = { in: matchingCardIds };
    }

    if (from_date || to_date) {
      where.production_date = {};
      if (from_date) {
        where.production_date.gte = new Date(`${from_date}T00:00:00.000Z`);
      }
      if (to_date) {
        where.production_date.lte = new Date(`${to_date}T23:59:59.999Z`);
      }
    }

    if (section_name && section_name.trim() !== '') {
      where.section = { name: { equals: section_name.trim() } };
    }
    if (style_no && style_no.trim() !== '') {
      where.style = { style_no: { equals: style_no.trim() } };
    }
    if (process_name && process_name.trim() !== '') {
      where.process = { process_name: { equals: process_name.trim() } };
    }
    if (color_name && color_name.trim() !== '') {
      where.color = { color_name: { equals: color_name.trim() } };
    }

    const [list, users] = await Promise.all([
      prisma.production.findMany({
        where,
        include: {
          section: { select: { name: true } },
          style: { select: { style_no: true } },
          process: { select: { process_name: true } },
          color: { select: { color_name: true } }
        },
        orderBy: { id: 'desc' }
      }),
      prisma.user.findMany({ select: { id: true, name: true, username: true } })
    ]);

    const userMap = new Map(users.map(u => [u.id, u.name || u.username]));

    const result = list.map(p => {
      // Find employee by ID first, then fallback to raw card_no string
      let matchedEmp = null;
      const parsedId = parseInt(p.card_no);
      if (!isNaN(parsedId) && empById.has(parsedId)) {
        matchedEmp = empById.get(parsedId);
      } else if (empByCard.has(String(p.card_no).toLowerCase())) {
        matchedEmp = empByCard.get(String(p.card_no).toLowerCase());
      }

      const displayCardNo = matchedEmp ? matchedEmp.card_no : p.card_no;
      const empName = matchedEmp ? matchedEmp.name : null;
      const empDesignation = matchedEmp ? matchedEmp.designation : null;

      return {
        ...p,
        raw_card_no: p.card_no,
        card_no: displayCardNo, // Always displays current card_no from Employee table
        employee_id: matchedEmp ? matchedEmp.id : null,
        employee_name: empName,
        employee_designation: empDesignation,
        section_name: p.section?.name || null,
        style_no: p.style?.style_no || null,
        process_name: p.process?.process_name || null,
        color_name: p.color?.color_name || null,
        processed_by_name: p.processed_by ? (userMap.get(p.processed_by) || `User #${p.processed_by}`) : '—',
        section: undefined,
        style: undefined,
        process: undefined,
        color: undefined
      };
    });

    res.json(result);
  } catch (err) {
    console.error('Error fetching production records:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  const { section_id, style_id, process_id, color_id, production_date, items, card_no, employee_id, quantity } = req.body;
  const userId = req.user ? req.user.id : null;

  if (!section_id || !style_id || !process_id || !color_id || !production_date) {
    return res.status(400).json({ message: 'সেকশন, স্টাইল, প্রসেস, কালার ও প্রোডাকশন ডেট পূরণ করা বাধ্যতামূলক!' });
  }

  const pDate = new Date(production_date);

  try {
    // Fetch all employees to strictly resolve Employee ID (ID column)
    const allEmployees = await prisma.employee.findMany({
      select: { id: true, card_no: true, section_id: true, name: true }
    });

    const resolveEmployeeId = (itemCardNo, itemEmpId, secId) => {
      // 1. If explicit employee_id is passed and valid in employees table
      if (itemEmpId) {
        const found = allEmployees.find(e => e.id === parseInt(itemEmpId));
        if (found) return String(found.id);
      }
      // 2. Search employee by exact card_no in selected section
      const trimmed = String(itemCardNo || '').trim().toLowerCase();
      if (trimmed) {
        const foundInSec = allEmployees.find(e => e.section_id === parseInt(secId) && e.card_no.trim().toLowerCase() === trimmed);
        if (foundInSec) return String(foundInSec.id);

        const foundAnywhere = allEmployees.find(e => e.card_no.trim().toLowerCase() === trimmed);
        if (foundAnywhere) return String(foundAnywhere.id);
      }
      // 3. If itemCardNo was already an employee ID number
      const asNum = parseInt(itemCardNo);
      if (!isNaN(asNum)) {
        const foundById = allEmployees.find(e => e.id === asNum);
        if (foundById) return String(foundById.id);
      }
      return null;
    };

    if (Array.isArray(items) && items.length > 0) {
      // Batch creation for multiple card entries
      const validItems = items.filter(item => (item.card_no || item.employee_id) && parseInt(item.quantity) > 0);

      if (validItems.length === 0) {
        return res.status(400).json({ message: 'কমপক্ষে ১ টি বৈধ কার্ড নম্বর ও কোয়ান্টিটি প্রয়োজন!' });
      }

      const recordsData = [];
      for (const item of validItems) {
        const empId = resolveEmployeeId(item.card_no, item.employee_id, section_id);
        if (!empId) {
          return res.status(400).json({ 
            message: `কার্ড নম্বর "${item.card_no || item.employee_id}" এর জন্য কোনো ভ্যালিড ইমপ্লয়ী আইডি পাওয়া যায়নি!` 
          });
        }
        recordsData.push({
          section_id: parseInt(section_id),
          style_id: parseInt(style_id),
          process_id: parseInt(process_id),
          color_id: parseInt(color_id),
          production_date: pDate,
          card_no: parseInt(empId), // STRICTLY save the Employee ID (INT)!
          quantity: parseInt(item.quantity),
          processed_by: userId,
          processed_date: new Date()
        });
      }

      await prisma.production.createMany({
        data: recordsData
      });

      res.status(201).json({ 
        message: `${validItems.length} টি কার্ড প্রোডাকশন এন্ট্রি সফলভাবে সংরক্ষণ করা হয়েছে! (কার্ড আইডি সংরক্ষিত)`,
        count: validItems.length
      });
    } else if ((card_no || employee_id) && quantity) {
      // Single card entry
      const empId = resolveEmployeeId(card_no, employee_id, section_id);
      if (!empId) {
        return res.status(400).json({ 
          message: `কার্ড নম্বর "${card_no || employee_id}" এর জন্য কোনো ভ্যালিড ইমপ্লয়ী আইডি পাওয়া যায়নি!` 
        });
      }
      const created = await prisma.production.create({
        data: {
          section_id: parseInt(section_id),
          style_id: parseInt(style_id),
          process_id: parseInt(process_id),
          color_id: parseInt(color_id),
          production_date: pDate,
          card_no: parseInt(empId), // STRICTLY save the Employee ID (INT)!
          quantity: parseInt(quantity),
          processed_by: userId,
          processed_date: new Date()
        }
      });
      res.status(201).json(created);
    } else {
      res.status(400).json({ message: 'কার্ড নম্বর ও কোয়ান্টিটি প্রদান করুন!' });
    }
  } catch (err) {
    console.error('Error creating production entry:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateQuantity = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const userId = req.user ? req.user.id : null;

  if (quantity === undefined || isNaN(parseInt(quantity)) || parseInt(quantity) < 0) {
    return res.status(400).json({ message: 'সঠিক প্রোডাকশন কোয়ান্টিটি প্রদান করুন!' });
  }

  try {
    const updated = await prisma.production.update({
      where: { id: parseInt(id) },
      data: {
        quantity: parseInt(quantity),
        processed_by: userId,
        processed_date: new Date()
      }
    });

    res.json(updated);
  } catch (err) {
    console.error('Error updating production quantity:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.production.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Production record deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
