const { prisma } = require('../db');

exports.getAll = async (req, res) => {
  try {
    const { search, limit, section_id, style_id, process_id } = req.query;
    const where = {};

    if (section_id) where.section_id = parseInt(section_id);
    if (style_id) where.style_id = parseInt(style_id);
    if (process_id) where.process_id = parseInt(process_id);

    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { color_name: { contains: q } },
        { section: { name: { contains: q } } },
        { style: { style_no: { contains: q } } },
        { process: { process_name: { contains: q } } }
      ];
    }

    const takeLimit = limit ? parseInt(limit) : undefined;

    const list = await prisma.color.findMany({
      where,
      take: takeLimit,
      include: {
        section: { select: { name: true } },
        style: { select: { style_no: true } },
        process: { select: { process_name: true } }
      },
      orderBy: { id: 'desc' }
    });
    const result = list.map(c => ({
      ...c,
      section_name: c.section?.name || null,
      style_no: c.style?.style_no || null,
      process_name: c.process?.process_name || null,
      section: undefined,
      style: undefined,
      process: undefined
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  const { section_id, style_id, process_id, color_name } = req.body;
  const userId = req.user ? req.user.id : null;
  try {
    const sId = parseInt(section_id);
    const stId = parseInt(style_id);
    const pId = parseInt(process_id);
    const cName = (color_name || '').trim();

    // Check duplicate color
    const existingList = await prisma.color.findMany({
      where: {
        section_id: sId,
        style_id: stId,
        process_id: pId
      }
    });

    const isDuplicate = existingList.some(
      c => c.color_name && c.color_name.trim().toLowerCase() === cName.toLowerCase()
    );

    if (isDuplicate) {
      return res.status(400).json({ 
        message: 'ডুপ্লিকেট এন্ট্রি সম্ভব নয়! এই সেকশন, স্টাইল, প্রসেস এবং কালার নাম দিয়ে ইতোমধ্যে একটি রেকর্ড রয়েছে।' 
      });
    }

    const color = await prisma.color.create({
      data: {
        section_id: sId,
        style_id: stId,
        process_id: pId,
        color_name: cName,
        processed_by: userId,
        processed_date: new Date()
      }
    });
    res.status(201).json(color);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { section_id, style_id, process_id, color_name } = req.body;
  const userId = req.user ? req.user.id : null;
  try {
    const colorId = parseInt(id);
    const sId = parseInt(section_id);
    const stId = parseInt(style_id);
    const pId = parseInt(process_id);
    const cName = (color_name || '').trim();

    // Check duplicate color excluding current record
    const existingList = await prisma.color.findMany({
      where: {
        section_id: sId,
        style_id: stId,
        process_id: pId,
        NOT: { id: colorId }
      }
    });

    const isDuplicate = existingList.some(
      c => c.color_name && c.color_name.trim().toLowerCase() === cName.toLowerCase()
    );

    if (isDuplicate) {
      return res.status(400).json({ 
        message: 'ডুপ্লিকেট এন্ট্রি সম্ভব নয়! এই সেকশন, স্টাইল, প্রসেস এবং কালার নাম দিয়ে ইতোমধ্যে একটি রেকর্ড রয়েছে।' 
      });
    }

    const color = await prisma.color.update({
      where: { id: colorId },
      data: {
        section_id: sId,
        style_id: stId,
        process_id: pId,
        color_name: cName,
        processed_by: userId,
        processed_date: new Date()
      }
    });
    res.json(color);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.color.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Color deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
