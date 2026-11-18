const { prisma } = require('../db');

exports.getAll = async (req, res) => {
  const { from_date, to_date, date } = req.query;

  try {
    const where = {};

    if (from_date || to_date) {
      where.effective_date = {};
      if (from_date) {
        where.effective_date.gte = new Date(`${from_date}T00:00:00.000Z`);
      }
      if (to_date) {
        where.effective_date.lte = new Date(`${to_date}T23:59:59.999Z`);
      }
    } else if (date) {
      where.effective_date = {
        gte: new Date(`${date}T00:00:00.000Z`),
        lte: new Date(`${date}T23:59:59.999Z`)
      };
    }

    const list = await prisma.pieceRate.findMany({
      where,
      include: {
        section: { select: { name: true } },
        style: { select: { style_no: true } },
        process: { select: { process_name: true } },
        color: { select: { color_name: true } }
      },
      orderBy: { id: 'desc' }
    });
    const result = list.map(pr => ({
      ...pr,
      section_name: pr.section?.name || null,
      style_no: pr.style?.style_no || null,
      process_name: pr.process?.process_name || null,
      color_name: pr.color?.color_name || null,
      section: undefined,
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
  const { section_id, style_id, process_id, color_id, rate, effective_date } = req.body;
  const userId = req.user ? req.user.id : null;
  try {
    const sId = parseInt(section_id);
    const stId = parseInt(style_id);
    const pId = parseInt(process_id);
    const cId = parseInt(color_id);

    const effDate = new Date(effective_date);
    const year = effDate.getFullYear();
    const month = effDate.getMonth();
    const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

    // Check duplicate piece rate in the same effective month
    const existing = await prisma.pieceRate.findFirst({
      where: {
        section_id: sId,
        style_id: stId,
        process_id: pId,
        color_id: cId,
        effective_date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    if (existing) {
      const monthNames = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
      return res.status(400).json({ 
        message: `ডুপ্লিকেট এন্ট্রি সম্ভব নয়! এই সেকশন, স্টাইল, প্রসেস এবং কালারের জন্য ${monthNames[month]} ${year} মাসে ইতোমধ্যে একটি পিস রেট এন্ট্রি বিদ্যমান রয়েছে।` 
      });
    }

    const pieceRate = await prisma.pieceRate.create({
      data: {
        section_id: sId,
        style_id: stId,
        process_id: pId,
        color_id: cId,
        rate: parseFloat(rate),
        effective_date: new Date(effective_date),
        processed_by: userId,
        processed_date: new Date()
      }
    });
    res.status(201).json(pieceRate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { section_id, style_id, process_id, color_id, rate, effective_date } = req.body;
  const userId = req.user ? req.user.id : null;
  try {
    const prId = parseInt(id);
    const sId = parseInt(section_id);
    const stId = parseInt(style_id);
    const pId = parseInt(process_id);
    const cId = parseInt(color_id);

    const effDate = new Date(effective_date);
    const year = effDate.getFullYear();
    const month = effDate.getMonth();
    const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

    // Check duplicate piece rate excluding current record in the same effective month
    const existing = await prisma.pieceRate.findFirst({
      where: {
        section_id: sId,
        style_id: stId,
        process_id: pId,
        color_id: cId,
        effective_date: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        NOT: { id: prId }
      }
    });

    if (existing) {
      const monthNames = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
      return res.status(400).json({ 
        message: `ডুপ্লিকেট এন্ট্রি সম্ভব নয়! এই সেকশন, স্টাইল, প্রসেস এবং কালারের জন্য ${monthNames[month]} ${year} মাসে ইতোমধ্যে একটি পিস রেট এন্ট্রি বিদ্যমান রয়েছে।` 
      });
    }

    const pieceRate = await prisma.pieceRate.update({
      where: { id: prId },
      data: {
        section_id: sId,
        style_id: stId,
        process_id: pId,
        color_id: cId,
        rate: parseFloat(rate),
        effective_date: new Date(effective_date),
        processed_by: userId,
        processed_date: new Date()
      }
    });
    res.json(pieceRate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.pieceRate.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Piece rate deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.bulkImportFromProduction = async (req, res) => {
  const { section_id, start_date, end_date, effective_date } = req.body;
  const userId = req.user ? req.user.id : null;

  if (!section_id || !start_date || !end_date) {
    return res.status(400).json({ 
      message: 'সেকশন, শুরুর তারিখ এবং শেষের তারিখ প্রদান করা বাধ্যতামূলক!' 
    });
  }

  const sId = parseInt(section_id);
  const start = new Date(`${start_date}T00:00:00.000Z`);
  const end = new Date(`${end_date}T23:59:59.999Z`);
  const targetEffectiveDate = effective_date 
    ? new Date(`${effective_date}T00:00:00.000Z`) 
    : new Date(`${end_date}T00:00:00.000Z`);

  try {
    // 1. Fetch production records for the given section and date range
    const productions = await prisma.production.findMany({
      where: {
        section_id: sId,
        production_date: {
          gte: start,
          lte: end
        }
      },
      select: {
        section_id: true,
        style_id: true,
        process_id: true,
        color_id: true
      }
    });

    if (productions.length === 0) {
      return res.status(404).json({ 
        message: 'নির্বাচিত সেকশন ও তারিখ রেঞ্জের মধ্যে কোনো প্রোডাকশন রেকর্ড পাওয়া যায়নি!' 
      });
    }

    // 2. Extract distinct combinations of (style_id, process_id, color_id)
    const uniqueMap = new Map();
    for (const p of productions) {
      const key = `${p.style_id}-${p.process_id}-${p.color_id}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, {
          section_id: sId,
          style_id: p.style_id,
          process_id: p.process_id,
          color_id: p.color_id
        });
      }
    }

    const uniqueItems = Array.from(uniqueMap.values());

    // 3. For each combination, find last effective piece rate or set 0
    let importedCount = 0;
    let updatedCount = 0;
    let withPrevRateCount = 0;
    let zeroRateCount = 0;

    for (const item of uniqueItems) {
      // Find latest piece rate for this combination (ordered by effective_date desc, id desc)
      const lastRate = await prisma.pieceRate.findFirst({
        where: {
          section_id: item.section_id,
          style_id: item.style_id,
          process_id: item.process_id,
          color_id: item.color_id
        },
        orderBy: [
          { effective_date: 'desc' },
          { id: 'desc' }
        ]
      });

      let rateValue = 0.00;
      if (lastRate && lastRate.rate !== null && lastRate.rate !== undefined && Number(lastRate.rate) > 0) {
        rateValue = parseFloat(lastRate.rate);
        withPrevRateCount++;
      } else {
        rateValue = 0.00;
        zeroRateCount++;
      }

      const effY = targetEffectiveDate.getFullYear();
      const effM = targetEffectiveDate.getMonth();
      const startOfEffMonth = new Date(Date.UTC(effY, effM, 1, 0, 0, 0, 0));
      const endOfEffMonth = new Date(Date.UTC(effY, effM + 1, 0, 23, 59, 59, 999));

      // Check if an entry already exists for this exact combination in the target effective month
      const existingInTargetMonth = await prisma.pieceRate.findFirst({
        where: {
          section_id: item.section_id,
          style_id: item.style_id,
          process_id: item.process_id,
          color_id: item.color_id,
          effective_date: {
            gte: startOfEffMonth,
            lte: endOfEffMonth
          }
        }
      });

      if (existingInTargetMonth) {
        // If already exists in target month, update with rateValue
        await prisma.pieceRate.update({
          where: { id: existingInTargetMonth.id },
          data: {
            rate: rateValue,
            effective_date: targetEffectiveDate,
            processed_by: userId,
            processed_date: new Date()
          }
        });
        updatedCount++;
      } else {
        await prisma.pieceRate.create({
          data: {
            section_id: item.section_id,
            style_id: item.style_id,
            process_id: item.process_id,
            color_id: item.color_id,
            rate: rateValue,
            effective_date: targetEffectiveDate,
            processed_by: userId,
            processed_date: new Date()
          }
        });
        importedCount++;
      }
    }

    return res.status(200).json({
      message: `মোট ${uniqueItems.length} টি আইটেম পাওয়া গেছে। ${importedCount} টি নতুন যুক্ত এবং ${updatedCount} টি হালনাগাদ করা হয়েছে (${withPrevRateCount} টি পূর্বের রেট সহ, ${zeroRateCount} টি ০ রেট সহ)।`,
      totalFound: uniqueItems.length,
      importedCount,
      updatedCount,
      withPrevRateCount,
      zeroRateCount,
      targetEffectiveDate: targetEffectiveDate.toISOString().split('T')[0]
    });

  } catch (err) {
    console.error('Error bulk importing piece rates from production:', err);
    return res.status(500).json({ message: err.message });
  }
};
