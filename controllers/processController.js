const { prisma } = require('../db');

exports.getAll = async (req, res) => {
  try {
    const { search, limit } = req.query;
    const where = {};

    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { process_name: { contains: q } },
        { type: { contains: q } },
        { status: { contains: q } },
        { section: { name: { contains: q } } },
        { buyer: { name: { contains: q } } },
        { style: { style_no: { contains: q } } }
      ];
    }

    const takeLimit = limit ? parseInt(limit) : (search ? undefined : 50);

    const list = await prisma.process.findMany({
      where,
      take: takeLimit,
      include: {
        section: { select: { name: true } },
        buyer: { select: { name: true } },
        style: { select: { style_no: true } }
      },
      orderBy: { id: 'desc' }
    });
    const result = list.map(p => ({
      ...p,
      section_name: p.section?.name || null,
      buyer_name: p.buyer?.name || null,
      style_no: p.style?.style_no || null,
      section: undefined,
      buyer: undefined,
      style: undefined
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  const { section_id, buyer_id, style_id, process_name, type, status } = req.body;
  const userId = req.user ? req.user.id : null;
  try {
    const sId = parseInt(section_id);
    const bId = parseInt(buyer_id);
    const stId = parseInt(style_id);
    const pName = (process_name || '').trim();

    // Check for duplicate process entry
    const existingList = await prisma.process.findMany({
      where: {
        section_id: sId,
        buyer_id: bId,
        style_id: stId
      }
    });

    const isDuplicate = existingList.some(
      p => p.process_name && p.process_name.trim().toLowerCase() === pName.toLowerCase()
    );

    if (isDuplicate) {
      return res.status(400).json({ 
        message: 'ডুপ্লিকেট এন্ট্রি সম্ভব নয়! এই সেকশন, বায়ার, স্টাইল এবং প্রসেস নাম দিয়ে ইতোমধ্যে একটি রেকর্ড রয়েছে।' 
      });
    }

    const process = await prisma.process.create({
      data: {
        section_id: sId,
        buyer_id: bId,
        style_id: stId,
        process_name: pName,
        type,
        status: status || 'Active',
        processed_by: userId,
        processed_date: new Date()
      }
    });
    res.status(201).json(process);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { section_id, buyer_id, style_id, process_name, type, status } = req.body;
  const userId = req.user ? req.user.id : null;
  try {
    const procId = parseInt(id);
    const sId = parseInt(section_id);
    const bId = parseInt(buyer_id);
    const stId = parseInt(style_id);
    const pName = (process_name || '').trim();

    // Check for duplicate process entry excluding current record
    const existingList = await prisma.process.findMany({
      where: {
        section_id: sId,
        buyer_id: bId,
        style_id: stId,
        NOT: { id: procId }
      }
    });

    const isDuplicate = existingList.some(
      p => p.process_name && p.process_name.trim().toLowerCase() === pName.toLowerCase()
    );

    if (isDuplicate) {
      return res.status(400).json({ 
        message: 'ডুপ্লিকেট এন্ট্রি সম্ভব নয়! এই সেকশন, বায়ার, স্টাইল এবং প্রসেস নাম দিয়ে ইতোমধ্যে একটি রেকর্ড রয়েছে।' 
      });
    }

    const process = await prisma.process.update({
      where: { id: procId },
      data: {
        section_id: sId,
        buyer_id: bId,
        style_id: stId,
        process_name: pName,
        type,
        status,
        processed_by: userId,
        processed_date: new Date()
      }
    });
    res.json(process);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.process.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Process deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
