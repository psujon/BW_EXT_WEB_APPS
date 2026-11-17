const { prisma } = require('../db');

exports.getAll = async (req, res) => {
  try {
    const { search, limit } = req.query;
    const where = {};

    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { style_no: { contains: q } },
        { status: { contains: q } },
        { buyer: { name: { contains: q } } }
      ];
    }

    const takeLimit = limit ? parseInt(limit) : (search ? undefined : 50);

    const styles = await prisma.style.findMany({
      where,
      take: takeLimit,
      include: { buyer: { select: { name: true } } },
      orderBy: { id: 'desc' }
    });
    const result = styles.map(s => ({
      ...s,
      buyer_name: s.buyer?.name || null,
      buyer: undefined
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  const { style_no, buyer_id, status } = req.body;
  const userId = req.user ? req.user.id : null;
  try {
    const bId = parseInt(buyer_id);
    const sNo = (style_no || '').trim();

    // Check duplicate style for buyer
    const existingList = await prisma.style.findMany({
      where: { buyer_id: bId }
    });

    const isDuplicate = existingList.some(
      s => s.style_no && s.style_no.trim().toLowerCase() === sNo.toLowerCase()
    );

    if (isDuplicate) {
      return res.status(400).json({ 
        message: 'ডুপ্লিকেট এন্ট্রি সম্ভব নয়! এই বায়ারের জন্য এই স্টাইল নম্বরটি ইতোমধ্যে বিদ্যমান রয়েছে।' 
      });
    }

    const style = await prisma.style.create({
      data: { 
        style_no: sNo, 
        buyer_id: bId, 
        status,
        processed_by: userId,
        processed_date: new Date()
      }
    });
    res.status(201).json(style);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { style_no, buyer_id, status } = req.body;
  const userId = req.user ? req.user.id : null;
  try {
    const styleId = parseInt(id);
    const bId = parseInt(buyer_id);
    const sNo = (style_no || '').trim();

    // Check duplicate style excluding current record
    const existingList = await prisma.style.findMany({
      where: {
        buyer_id: bId,
        NOT: { id: styleId }
      }
    });

    const isDuplicate = existingList.some(
      s => s.style_no && s.style_no.trim().toLowerCase() === sNo.toLowerCase()
    );

    if (isDuplicate) {
      return res.status(400).json({ 
        message: 'ডুপ্লিকেট এন্ট্রি সম্ভব নয়! এই বায়ারের জন্য এই স্টাইল নম্বরটি ইতোমধ্যে বিদ্যমান রয়েছে।' 
      });
    }

    const style = await prisma.style.update({
      where: { id: styleId },
      data: { 
        style_no: sNo, 
        buyer_id: bId, 
        status,
        processed_by: userId,
        processed_date: new Date()
      }
    });
    res.json(style);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.style.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Style deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
