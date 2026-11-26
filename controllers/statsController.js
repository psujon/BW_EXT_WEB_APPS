const { prisma } = require('../db');

exports.getStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    // Calculate rolling 6 months start date (5 months back from current month)
    const startOf6Months = new Date(today.getFullYear(), today.getMonth() - 5, 1, 0, 0, 0, 0);

    const [
      totalBuyers,
      totalStyles,
      todayProdAggregate,
      activeEmployeesCount,
      recentProd,
      recentStyles,
      periodProductions,
      dbBuyersList
    ] = await Promise.all([
      prisma.buyer.count(),
      prisma.style.count(),
      prisma.production.aggregate({
        _sum: { quantity: true },
        where: {
          production_date: {
            gte: startOfToday,
            lte: endOfToday
          }
        }
      }),
      prisma.employee.count({ where: { status: 'Active' } }),
      prisma.production.findMany({
        take: 5,
        orderBy: { id: 'desc' },
        include: {
          section: { select: { name: true } },
          style: { select: { style_no: true } }
        }
      }),
      prisma.style.findMany({
        take: 5,
        orderBy: { id: 'desc' },
        include: {
          buyer: { select: { name: true } }
        }
      }),
      prisma.production.findMany({
        where: {
          production_date: {
            gte: startOf6Months
          }
        },
        include: {
          style: {
            include: {
              buyer: { select: { name: true } }
            }
          }
        }
      }),
      prisma.buyer.findMany({
        select: { name: true }
      })
    ]);

    const todayQty = Number(todayProdAggregate._sum.quantity || 0);

    // Map top buyers from database
    const buyerTotals = {};
    dbBuyersList.forEach(b => { buyerTotals[b.name] = 0; });

    periodProductions.forEach(p => {
      const bName = p.style?.buyer?.name;
      const qty = parseFloat(p.quantity) || 0;
      if (bName && buyerTotals[bName] !== undefined) {
        buyerTotals[bName] += qty;
      }
    });

    const sortedBuyers = Object.keys(buyerTotals).sort((a, b) => buyerTotals[b] - buyerTotals[a]);
    const topBuyers = sortedBuyers.slice(0, 4);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Generate accurate list of the last 6 months
    const sixMonthsList = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      sixMonthsList.push({
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
        month: monthNames[d.getMonth()]
      });
    }

    const productionOverview = sixMonthsList.map(m => {
      const row = { month: m.month, totalQty: 0 };
      topBuyers.forEach(b => { row[b] = 0; });

      periodProductions.forEach(p => {
        const pDate = new Date(p.production_date);
        if (pDate.getFullYear() === m.year && pDate.getMonth() === m.monthIndex) {
          const qty = parseFloat(p.quantity) || 0;
          row.totalQty = parseFloat((row.totalQty + qty).toFixed(2));
          const bName = p.style?.buyer?.name;
          if (bName && topBuyers.includes(bName)) {
            row[bName] = parseFloat(((row[bName] || 0) + qty).toFixed(2));
          }
        }
      });

      return row;
    });

    // Recent Activities list
    const activities = [
      ...recentProd.map(p => ({
        id: `prod-${p.id}`,
        user: `কার্ড ${p.card_no}`,
        action: `উৎপাদন এন্ট্রি: ${Number(p.quantity) || 0} pcs (${p.section?.name || '—'} - ${p.style?.style_no || '—'})`,
        time: p.processed_date ? new Date(p.processed_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'আজ'
      })),
      ...recentStyles.map(s => ({
        id: `style-${s.id}`,
        user: 'নতুন স্টাইল',
        action: `স্টাইল এন্ট্রি: #${s.style_no} (${s.buyer?.name || '—'})`,
        time: s.created_at ? new Date(s.created_at).toLocaleDateString() : 'সম্প্রতি'
      }))
    ].slice(0, 6);

    res.json({
      cards: [
        { title: 'TOTAL BUYERS', value: String(totalBuyers), change: 'নিবন্ধিত বায়িং হাউস', trend: 'up' },
        { title: 'ACTIVE STYLES', value: String(totalStyles), change: 'রানিং স্টাইল', trend: 'up' },
        { title: 'TODAY PRODUCTION', value: `${todayQty.toLocaleString()} pcs`, change: 'আজকের মোট উৎপাদন', trend: 'stable' },
        { title: 'ACTIVE EMPLOYEES', value: `${activeEmployeesCount} জন`, change: 'কারখানার স্টাফ', trend: 'up' }
      ],
      productionOverview,
      topBuyers,
      recentActivities: activities
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getMonthlyStyleSummary = async (req, res) => {
  try {
    const today = new Date();
    const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const selectedMonth = req.query.month && /^\d{4}-\d{2}$/.test(req.query.month)
      ? req.query.month
      : defaultMonth;

    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr);
    const monthNum = parseInt(monthStr);

    const startDate = new Date(year, monthNum - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

    const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthNamesBn = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

    const [monthProductions, allProdsDates] = await Promise.all([
      prisma.production.findMany({
        where: {
          production_date: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          style: {
            include: {
              buyer: { select: { name: true } }
            }
          },
          section: { select: { name: true } }
        },
        orderBy: { id: 'desc' }
      }),
      prisma.production.findMany({
        select: { production_date: true },
        distinct: ['production_date']
      })
    ]);

    // Set of months that actually have data
    const dbMonthsSet = new Set();
    allProdsDates.forEach(p => {
      if (p.production_date) {
        const d = new Date(p.production_date);
        dbMonthsSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      }
    });

    // Available 24 months list for dropdown
    const availableMonths = [];
    for (let i = 0; i < 24; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const key = `${y}-${String(m + 1).padStart(2, '0')}`;
      availableMonths.push({
        value: key,
        label: `${monthNamesEn[m]} ${y}`,
        labelBn: `${monthNamesBn[m]} ${y}`,
        year: y,
        month: m + 1,
        hasData: dbMonthsSet.has(key),
        isCurrent: key === defaultMonth
      });
    }

    // Include any older production months from DB if not already present
    dbMonthsSet.forEach(key => {
      if (!availableMonths.some(am => am.value === key)) {
        const [y, m] = key.split('-').map(Number);
        availableMonths.push({
          value: key,
          label: `${monthNamesEn[m - 1]} ${y}`,
          labelBn: `${monthNamesBn[m - 1]} ${y}`,
          year: y,
          month: m,
          hasData: true,
          isCurrent: false
        });
      }
    });

    // Aggregate by Style
    const styleMap = new Map();
    let totalQuantity = 0;

    monthProductions.forEach(p => {
      const sId = p.style_id;
      const qty = parseFloat(p.quantity) || 0;
      totalQuantity += qty;

      if (!styleMap.has(sId)) {
        styleMap.set(sId, {
          style_id: sId,
          style_no: p.style?.style_no || 'Unknown',
          buyer_name: p.style?.buyer?.name || '—',
          total_quantity: 0,
          entry_count: 0,
          cards: new Set(),
          sections: new Set()
        });
      }

      const s = styleMap.get(sId);
      s.total_quantity = parseFloat((s.total_quantity + qty).toFixed(2));
      s.entry_count += 1;
      if (p.card_no) s.cards.add(p.card_no);
      if (p.section?.name) s.sections.add(p.section.name);
    });

    totalQuantity = parseFloat(totalQuantity.toFixed(2));

    const styles = Array.from(styleMap.values()).map(s => ({
      ...s,
      unique_cards: s.cards.size,
      sections: Array.from(s.sections).join(', ') || '—',
      percentage: totalQuantity > 0 ? parseFloat(((s.total_quantity / totalQuantity) * 100).toFixed(1)) : 0,
      cards: undefined
    })).sort((a, b) => b.total_quantity - a.total_quantity);

    res.json({
      selectedMonth,
      monthLabel: `${monthNamesEn[monthNum - 1]} ${year}`,
      monthLabelBn: `${monthNamesBn[monthNum - 1]} ${year}`,
      totalQuantity,
      totalStyles: styles.length,
      totalEntries: monthProductions.length,
      styles,
      availableMonths
    });
  } catch (err) {
    console.error('Error fetching monthly style summary:', err);
    res.status(500).json({ message: err.message });
  }
};
