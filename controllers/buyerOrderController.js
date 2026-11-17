const { prisma } = require('../db');

exports.getAll = async (req, res) => {
  try {
    const { search, limit } = req.query;
    const where = {};

    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { section: { name: { contains: q } } },
        { buyer: { name: { contains: q } } },
        { style: { style_no: { contains: q } } },
        { process: { process_name: { contains: q } } },
        { color: { color_name: { contains: q } } }
      ];
    }

    const takeLimit = limit ? parseInt(limit) : (search ? undefined : 50);

    const list = await prisma.buyerOrder.findMany({
      where,
      take: takeLimit,
      include: {
        section: { select: { name: true } },
        buyer: { select: { name: true } },
        style: { select: { style_no: true } },
        process: { select: { process_name: true } },
        color: { select: { color_name: true } }
      },
      orderBy: { id: 'desc' }
    });
    const result = list.map(bo => ({
      ...bo,
      section_name: bo.section?.name || null,
      buyer_name: bo.buyer?.name || null,
      style_no: bo.style?.style_no || null,
      process_name: bo.process?.process_name || null,
      color_name: bo.color?.color_name || null,
      section: undefined,
      buyer: undefined,
      style: undefined,
      process: undefined,
      color: undefined
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  const { section_id, buyer_id, style_id, process_id, color_id, order_quantity } = req.body;
  const userId = req.user ? req.user.id : null;
  try {
    const sId = parseInt(section_id);
    const bId = parseInt(buyer_id);
    const stId = parseInt(style_id);
    const pId = parseInt(process_id);
    const cId = parseInt(color_id);

    // Check duplicate order entry
    const existing = await prisma.buyerOrder.findFirst({
      where: {
        section_id: sId,
        buyer_id: bId,
        style_id: stId,
        process_id: pId,
        color_id: cId
      }
    });

    if (existing) {
      return res.status(400).json({ 
        message: 'ডুপ্লিকেট এন্ট্রি সম্ভব নয়! এই সেকশন, বায়ার, স্টাইল, প্রসেস এবং কালারের জন্য ইতোমধ্যে একটি বায়ার অর্ডার এন্ট্রি বিদ্যমান রয়েছে।' 
      });
    }

    const order = await prisma.buyerOrder.create({
      data: {
        section_id: sId,
        buyer_id: bId,
        style_id: stId,
        process_id: pId,
        color_id: cId,
        order_quantity: parseInt(order_quantity),
        processed_by: userId,
        processed_date: new Date()
      }
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { section_id, buyer_id, style_id, process_id, color_id, order_quantity } = req.body;
  const userId = req.user ? req.user.id : null;
  try {
    const orderId = parseInt(id);
    const sId = parseInt(section_id);
    const bId = parseInt(buyer_id);
    const stId = parseInt(style_id);
    const pId = parseInt(process_id);
    const cId = parseInt(color_id);

    // Check duplicate order entry excluding current record
    const existing = await prisma.buyerOrder.findFirst({
      where: {
        section_id: sId,
        buyer_id: bId,
        style_id: stId,
        process_id: pId,
        color_id: cId,
        NOT: { id: orderId }
      }
    });

    if (existing) {
      return res.status(400).json({ 
        message: 'ডুপ্লিকেট এন্ট্রি সম্ভব নয়! এই সেকশন, বায়ার, স্টাইল, প্রসেস এবং কালারের জন্য ইতোমধ্যে একটি বায়ার অর্ডার এন্ট্রি বিদ্যমান রয়েছে।' 
      });
    }

    const order = await prisma.buyerOrder.update({
      where: { id: orderId },
      data: {
        section_id: sId,
        buyer_id: bId,
        style_id: stId,
        process_id: pId,
        color_id: cId,
        order_quantity: parseInt(order_quantity),
        processed_by: userId,
        processed_date: new Date()
      }
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.buyerOrder.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
