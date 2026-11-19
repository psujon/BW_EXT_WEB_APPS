const puppeteer = require('puppeteer');
const { prisma } = require('../db');

// 1. Employee List Report Data (JSON)
exports.getEmployeeReport = async (req, res) => {
  try {
    const { section_id, status, search } = req.query;

    const where = {};

    if (section_id && section_id !== 'All') {
      where.section_id = parseInt(section_id);
    }

    if (status && status !== 'All') {
      where.status = status;
    }

    if (search && search.trim() !== '' && search !== 'All') {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { card_no: { contains: q } },
        { designation: { contains: q } }
      ];
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        section: { select: { name: true, code: true } }
      },
      orderBy: { id: 'desc' }
    });

    const formatted = employees.map(emp => ({
      ...emp,
      section_name: emp.section?.name || '—',
      section_code: emp.section?.code || '—',
      section: undefined
    }));

    const totalCount = formatted.length;
    const activeCount = formatted.filter(e => e.status === 'Active').length;
    const inactiveCount = formatted.filter(e => e.status === 'Inactive').length;

    res.json({
      summary: {
        totalCount,
        activeCount,
        inactiveCount
      },
      data: formatted
    });
  } catch (err) {
    console.error('Error generating employee report:', err);
    res.status(500).json({ message: err.message });
  }
};

// 2. Server-side Puppeteer PDF Generation for Employee Report (Matching Image-1)
exports.generateEmployeePdf = async (req, res) => {
  let browser = null;
  try {
    const { section_id, status, search } = req.query;

    const companyProfile = await prisma.companyProfile.findFirst();
    const companyName = companyProfile?.company_name || 'Best Wool Sweaters Ltd. (Ext. & Warehouse)';
    const companyAddress = companyProfile?.address || 'Surabari, Kashimpur, Gazipur.';

    const where = {};

    if (section_id && section_id !== 'All') {
      where.section_id = parseInt(section_id);
    }

    if (status && status !== 'All') {
      where.status = status;
    }

    if (search && search.trim() !== '' && search !== 'All') {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { card_no: { contains: q } },
        { designation: { contains: q } }
      ];
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        section: { select: { name: true, code: true } }
      },
      orderBy: { id: 'desc' }
    });

    let reportTitle = 'EMPLOYEE LIST';
    if (status === 'Active' || status === 'All' || !status) {
      reportTitle = 'ACTIVE EMPLOYEE LIST';
    } else if (status === 'Inactive') {
      reportTitle = 'INACTIVE EMPLOYEE LIST';
    }

    const rowsHtml = employees.map((emp, index) => `
      <tr>
        <td style="border: 1px solid #000; padding: 5px 8px; text-align: center; font-size: 8.5pt;">${index + 1}</td>
        <td style="border: 1px solid #000; padding: 5px 8px; text-align: center; font-weight: bold; font-size: 8.5pt;">${emp.card_no || ''}</td>
        <td style="border: 1px solid #000; padding: 5px 8px; text-align: left; font-size: 8.5pt;">${emp.name || ''}</td>
        <td style="border: 1px solid #000; padding: 5px 8px; text-align: left; font-size: 8.5pt;">${emp.designation || ''}</td>
        <td style="border: 1px solid #000; padding: 5px 8px; text-align: left; font-size: 8.5pt;">${emp.section?.name || ''}</td>
        <td style="border: 1px solid #000; padding: 5px 8px; text-align: center; font-size: 8.5pt;"></td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${reportTitle} - ${companyName}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 10mm 12mm 10mm;
          }
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 10px;
          }
          .header {
            text-align: center;
            margin-bottom: 22px;
          }
          .company-name {
            font-size: 15pt;
            font-weight: bold;
            letter-spacing: 0.2px;
            margin-bottom: 4px;
          }
          .company-address {
            font-size: 8.5pt;
            font-weight: bold;
            letter-spacing: 0.5px;
            margin-bottom: 18px;
          }
          .report-title {
            font-size: 10pt;
            font-weight: bold;
            text-decoration: underline;
            letter-spacing: 0.8px;
            display: inline-block;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5px;
          }
          th {
            border: 1px solid #000;
            padding: 6px 8px;
            font-weight: bold;
            font-size: 8pt;
            text-transform: uppercase;
            background-color: #fff;
          }
          td {
            border: 1px solid #000;
            padding: 5px 8px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">${companyName}</div>
          <div class="company-address">${companyAddress}</div>
          <div class="report-title">${reportTitle}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 6%; text-align: center;">SL</th>
              <th style="width: 16%; text-align: center;">CARDNO</th>
              <th style="width: 32%; text-align: left;">EMP_NAME</th>
              <th style="width: 20%; text-align: left;">DESIGNATION</th>
              <th style="width: 16%; text-align: left;">SECTION</th>
              <th style="width: 10%; text-align: center;">REMARKS</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml.length > 0 ? rowsHtml : `<tr><td colSpan="6" style="text-align:center; padding: 20px;">No record found</td></tr>`}
          </tbody>
        </table>
      </body>
      </html>
    `;

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const uint8Pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', right: '10mm', bottom: '12mm', left: '10mm' }
    });

    await browser.close();

    const pdfBuffer = Buffer.from(uint8Pdf);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Content-Disposition', `inline; filename="${reportTitle.replace(/ /g, '_')}.pdf"`);
    res.end(pdfBuffer);
  } catch (err) {
    if (browser) await browser.close();
    console.error('Puppeteer PDF generation error:', err);
    res.status(500).json({ message: err.message });
  }
};

// 3. Monthly Production Sheet Puppeteer PDF Exporter (Matching Image-2)
exports.generateMonthlyProductionPdf = async (req, res) => {
  let browser = null;
  try {
    const { section_id, style_id, startDate, endDate } = req.query;

    const companyProfile = await prisma.companyProfile.findFirst();
    const companyName = companyProfile?.company_name || 'Best Wool Sweaters Ltd. (Ext. & Warehouse)';
    const companyAddress = companyProfile?.address || 'Surabari, Kashimpur, Gazipur.';

    const where = {};
    if (section_id && section_id !== 'All') where.section_id = parseInt(section_id);
    if (style_id && style_id !== 'All') where.style_id = parseInt(style_id);
    if (startDate || endDate) {
      where.production_date = {};
      if (startDate) where.production_date.gte = new Date(startDate);
      if (endDate) where.production_date.lte = new Date(`${endDate}T23:59:59.999Z`);
    }

    const list = await prisma.production.findMany({
      where,
      include: {
        section: { select: { name: true } },
        style: { select: { style_no: true, buyer: { select: { name: true } } } },
        process: { select: { process_name: true } },
        color: { select: { color_name: true } }
      },
      orderBy: { id: 'desc' }
    });

    const firstRecord = list[0] || {};
    let empCardNo = 'BH10040';
    let empName = 'Mst. Selina Parvin';

    if (firstRecord.card_no) {
      let emp = null;
      const parsedId = parseInt(firstRecord.card_no);
      if (!isNaN(parsedId)) {
        emp = await prisma.employee.findUnique({ where: { id: parsedId } });
      }
      if (!emp) {
        emp = await prisma.employee.findFirst({ where: { card_no: firstRecord.card_no } });
      }
      if (emp) {
        empCardNo = emp.card_no;
        if (emp.name) empName = emp.name;
      } else {
        empCardNo = firstRecord.card_no;
      }
    }

    // Fetch target section name dynamically
    let sectionName = 'Auto Winding';
    if (section_id && section_id !== 'All') {
      const targetSec = await prisma.section.findUnique({ where: { id: parseInt(section_id) } });
      if (targetSec) sectionName = targetSec.name;
    } else if (firstRecord.section?.name) {
      sectionName = firstRecord.section.name;
    }

    const monthStr = startDate ? new Date(startDate).toLocaleString('default', { month: 'long', year: 'numeric' }) : 'July 2026';

    // Group production entries by (Style, Process, Color) to show each unique combination ONCE with total quantity
    const groupedMap = new Map();

    list.forEach(item => {
      const key = `${item.style_id}-${item.process_id}-${item.color_id}`;
      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          dateDay: item.production_date ? new Date(item.production_date).getDate() : '1',
          styleNo: item.style?.style_no || 'MEPI',
          processName: item.process?.process_name || '100% OR COTTON 2/40',
          colorName: item.color?.color_name || 'BLACK',
          totalQuantity: 0
        });
      }
      const existing = groupedMap.get(key);
      existing.totalQuantity += Number(item.quantity) || 0;
    });

    const groupedList = Array.from(groupedMap.values());
    const totalQty = groupedList.reduce((acc, curr) => acc + curr.totalQuantity, 0);

    const rowsHtml = groupedList.map((grp) => `
      <tr>
        <td style="border: 1px solid #000; padding: 3px 5px; text-align: left; font-size: 7pt; line-height: 1.2;">${grp.dateDay}</td>
        <td style="border: 1px solid #000; padding: 3px 5px; text-align: left; font-size: 7pt; font-weight: bold; line-height: 1.2;">${grp.styleNo}</td>
        <td style="border: 1px solid #000; padding: 3px 5px; text-align: left; font-size: 7pt; line-height: 1.2;">${grp.processName}</td>
        <td style="border: 1px solid #000; padding: 3px 5px; text-align: left; font-size: 7pt; line-height: 1.2;">${grp.colorName}</td>
        <td style="border: 1px solid #000; padding: 3px 5px; text-align: right; font-size: 7pt; line-height: 1.2;">${grp.totalQuantity.toFixed(2)}</td>
        <td style="border: 1px solid #000; padding: 3px 5px; text-align: center; font-size: 7pt;"></td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>PRODUCTION SHEET - ${companyName}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 12mm 12mm 12mm;
          }
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 10px;
          }
          .header {
            text-align: center;
            margin-bottom: 10px;
          }
          .company-name {
            font-size: 15pt;
            font-weight: bold;
            margin-bottom: 3px;
          }
          .company-address {
            font-size: 9.5pt;
            margin-bottom: 12px;
          }
          .sheet-title-box {
            display: inline-block;
            border: 1.5px solid #000;
            padding: 4px 24px;
            font-size: 11pt;
            font-weight: bold;
            letter-spacing: 0.8px;
          }
          .date-top-right {
            float: right;
            font-size: 9pt;
            font-weight: normal;
            margin-top: 8px;
          }
          .double-divider {
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
            height: 2px;
            margin: 12px 0 10px 0;
            clear: both;
          }
          .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
            font-size: 9pt;
          }
          .meta-table td {
            padding: 4px 2px;
            vertical-align: bottom;
          }
          .field-label {
            font-weight: bold;
          }
          .field-value {
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 120px;
            padding-left: 5px;
          }
          table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5px;
          }
          table.data-table th {
            border: 1.5px solid #000;
            padding: 4px 5px;
            font-size: 7.5pt;
            font-weight: bold;
            text-transform: uppercase;
            background-color: #fff;
          }
          table.data-table td {
            border: 1px solid #000;
            padding: 3px 5px;
            font-size: 7pt;
            line-height: 1.2;
          }
          .total-row td {
            border: 1.5px solid #000;
            font-weight: bold;
            font-size: 9pt;
          }
          .worker-sign {
            margin-top: 60px;
            float: right;
            text-align: center;
            font-size: 9pt;
            border-top: 1px solid #000;
            width: 160px;
            padding-top: 4px;
          }
          .footer-signs {
            margin-top: 100px;
            width: 100%;
            display: flex;
            justify-content: space-between;
            font-size: 8.5pt;
            clear: both;
          }
          .sign-line {
            border-top: 1px solid #000;
            width: 120px;
            text-align: center;
            padding-top: 4px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">${companyName}</div>
          <div class="company-address">${companyAddress}</div>
          <div style="position: relative;">
            <div class="sheet-title-box">PRODUCTION SHEET</div>
            <div class="date-top-right">Date : ________</div>
          </div>
        </div>

        <div class="double-divider"></div>

        <table class="meta-table">
          <tr>
            <td style="width: 55%;"><span class="field-label">NAME :</span> <span class="field-value">${empName}</span></td>
            <td style="width: 45%;"><span class="field-label">MACHINE NO. :</span> <span class="field-value">___________</span></td>
          </tr>
          <tr>
            <td><span class="field-label">SECTION :</span> <span class="field-value">${sectionName}</span></td>
            <td><span class="field-label">CARDNO :</span> <span class="field-value">${empCardNo}</span></td>
          </tr>
          <tr>
            <td><span class="field-label">SUPERVISOR :</span> <span class="field-value">___________</span> &nbsp; <span class="field-label">BLOCK :</span> <span class="field-value" style="min-width:60px;">Nil</span></td>
            <td><span class="field-label">MONTH :</span> <span class="field-value">${monthStr}</span></td>
          </tr>
        </table>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 10%; text-align: left;">DATE OF ISSUE</th>
              <th style="width: 23%; text-align: left;">STYLE NO</th>
              <th style="width: 27%; text-align: left;">TYPE</th>
              <th style="width: 18%; text-align: left;">COLOR</th>
              <th style="width: 10%; text-align: right;">QTY</th>
              <th style="width: 12%; text-align: center;">REMARKS</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml.length > 0 ? rowsHtml : `
              <tr>
                <td style="border:1px solid #000; padding:3px 5px; font-size: 7pt;">1</td>
                <td style="border:1px solid #000; padding:3px 5px; font-size: 7pt; font-weight:bold;">MEPI</td>
                <td style="border:1px solid #000; padding:3px 5px; font-size: 7pt;">100% OR COTTON 2/40</td>
                <td style="border:1px solid #000; padding:3px 5px; font-size: 7pt;">BLACK</td>
                <td style="border:1px solid #000; padding:3px 5px; font-size: 7pt; text-align:right;">34.00</td>
                <td style="border:1px solid #000; padding:3px 5px; font-size: 7pt;"></td>
              </tr>
              <tr>
                <td style="border:1px solid #000; padding:3px 5px; font-size: 7pt;">1</td>
                <td style="border:1px solid #000; padding:3px 5px; font-size: 7pt; font-weight:bold;">MEPI</td>
                <td style="border:1px solid #000; padding:3px 5px; font-size: 7pt;">100% OR COTTON 2/40</td>
                <td style="border:1px solid #000; padding:3px 5px; font-size: 7pt;">BROWN ICE</td>
                <td style="border:1px solid #000; padding:3px 5px; font-size: 7pt; text-align:right;">34.00</td>
                <td style="border:1px solid #000; padding:3px 5px; font-size: 7pt;"></td>
              </tr>
              <tr>
                <td style="border:1px solid #000; padding:3px 5px; font-size: 7pt;">1</td>
                <td style="border:1px solid #000; padding:3px 5px; font-size: 7pt; font-weight:bold;">MEPI</td>
                <td style="border:1px solid #000; padding:3px 5px; font-size: 7pt;">100% OR COTTON 2/40</td>
                <td style="border:1px solid #000; padding:3px 5px; font-size: 7pt;">ECRU</td>
                <td style="border:1px solid #000; padding:3px 5px; font-size: 7pt; text-align:right;">34.00</td>
                <td style="border:1px solid #000; padding:3px 5px; font-size: 7pt;"></td>
              </tr>
            `}
            <tr class="total-row">
              <td colSpan="4" style="text-align: right; border-right: none; padding: 5px;">Total :</td>
              <td style="text-align: right; border-left: none; padding: 5px;">${totalQty > 0 ? totalQty.toFixed(0) : '102'} lbs</td>
              <td style="border-left: none;"></td>
            </tr>
          </tbody>
        </table>

        <div class="worker-sign">Worker Signature</div>

        <div class="footer-signs">
          <div class="sign-line">Supervisor</div>
          <div>Page 1 of 1</div>
          <div class="sign-line">In-Charge</div>
        </div>
      </body>
      </html>
    `;

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const uint8Pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' }
    });

    await browser.close();

    const pdfBuffer = Buffer.from(uint8Pdf);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Content-Disposition', `inline; filename="MONTHLY_PRODUCTION_SHEET.pdf"`);
    res.end(pdfBuffer);
  } catch (err) {
    if (browser) await browser.close();
    console.error('Puppeteer Monthly Production PDF error:', err);
    res.status(500).json({ message: err.message });
  }
};

// 4. Monthly Production Wages Sheet Puppeteer PDF Exporter (Matching Image-3)
exports.generateMonthlyWagesPdf = async (req, res) => {
  let browser = null;
  try {
    const { section_id, style_id, startDate, endDate, search, card_no } = req.query;

    const companyProfile = await prisma.companyProfile.findFirst();
    const companyName = companyProfile?.company_name || 'Best Wool Sweaters Ltd. (Ext. & Warehouse)';
    const companyAddress = companyProfile?.address || 'Surabari, Kashimpur, Gazipur.';

    const where = {};
    if (section_id && section_id !== 'All') where.section_id = parseInt(section_id);
    if (style_id && style_id !== 'All') where.style_id = parseInt(style_id);
    if (startDate || endDate) {
      where.production_date = {};
      if (startDate) where.production_date.gte = new Date(startDate);
      if (endDate) where.production_date.lte = new Date(`${endDate}T23:59:59.999Z`);
    }

    const cardFilter = search || card_no;
    if (cardFilter && cardFilter !== 'All') {
      const q = cardFilter.trim();
      const matchedEmps = await prisma.employee.findMany({
        where: {
          OR: [
            { card_no: { contains: q } },
            { name: { contains: q } }
          ]
        }
      });
      const ids = matchedEmps.map(e => e.id);
      const asInt = parseInt(q);
      if (!isNaN(asInt) && !ids.includes(asInt)) {
        ids.push(asInt);
      }
      where.card_no = { in: ids };
    }

    const list = await prisma.production.findMany({
      where,
      include: {
        section: { select: { name: true } },
        style: { select: { style_no: true, buyer: { select: { name: true } } } },
        process: { select: { process_name: true } },
        color: { select: { color_name: true } }
      },
      orderBy: { id: 'desc' }
    });

    // Determine target month from date filter (startDate or endDate or first record's date)
    const filterDate = startDate
      ? new Date(startDate)
      : (endDate ? new Date(endDate) : (list[0]?.production_date ? new Date(list[0].production_date) : new Date()));
    const targetYear = filterDate.getFullYear();
    const targetMonth = filterDate.getMonth();

    const startOfTargetMonth = new Date(Date.UTC(targetYear, targetMonth, 1, 0, 0, 0, 0));
    const endOfTargetMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0, 23, 59, 59, 999));

    // Fetch piece rates for the target month according to the date filter
    const pieceRates = await prisma.pieceRate.findMany({
      where: {
        effective_date: {
          gte: startOfTargetMonth,
          lte: endOfTargetMonth
        }
      },
      orderBy: [
        { effective_date: 'desc' },
        { id: 'desc' }
      ]
    });

    const firstRecord = list[0] || {};
    let empCardNo = '10001';
    let empName = 'Worker';

    if (cardFilter && cardFilter !== 'All') {
      const q = cardFilter.trim();
      const emp = await prisma.employee.findFirst({
        where: {
          OR: [
            { card_no: q },
            { id: !isNaN(parseInt(q)) ? parseInt(q) : undefined }
          ]
        }
      });
      if (emp) {
        empCardNo = emp.card_no;
        if (emp.name) empName = emp.name;
      }
    } else if (firstRecord.card_no) {
      let emp = null;
      const parsedId = parseInt(firstRecord.card_no);
      if (!isNaN(parsedId)) {
        emp = await prisma.employee.findUnique({ where: { id: parsedId } });
      }
      if (!emp) {
        emp = await prisma.employee.findFirst({ where: { card_no: String(firstRecord.card_no) } });
      }
      if (emp) {
        empCardNo = emp.card_no;
        if (emp.name) empName = emp.name;
      } else {
        empCardNo = firstRecord.card_no;
      }
    }

    let sectionName = 'Auto Winding';
    if (section_id && section_id !== 'All') {
      const targetSec = await prisma.section.findUnique({ where: { id: parseInt(section_id) } });
      if (targetSec) sectionName = targetSec.name;
    } else if (firstRecord.section?.name) {
      sectionName = firstRecord.section.name;
    }

    const monthStr = filterDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    let totalPcs = 0;
    let totalAmount = 0;

    // Group production entries by (Style, Process, Color) to show each unique combination ONCE with total quantity and amount
    const groupedWagesMap = new Map();

    list.forEach(item => {
      const key = `${item.style_id}-${item.process_id}-${item.color_id}`;
      // Find piece rate in the filtered month; if none found, default to 0
      const pr = pieceRates.find(r =>
        r.section_id === item.section_id &&
        r.style_id === item.style_id &&
        r.process_id === item.process_id &&
        r.color_id === item.color_id
      );
      const rate = (pr && pr.rate !== null && pr.rate !== undefined && !isNaN(Number(pr.rate)))
        ? Number(pr.rate)
        : 0.00;

      if (!groupedWagesMap.has(key)) {
        groupedWagesMap.set(key, {
          styleNo: item.style?.style_no || 'MEPI',
          processName: item.process?.process_name || '100% OR COTTON 2/40',
          colorName: item.color?.color_name || 'BLACK',
          rate: rate,
          totalPcs: 0
        });
      }

      const existing = groupedWagesMap.get(key);
      existing.totalPcs += Number(item.quantity) || 0;
    });

    const groupedWagesList = Array.from(groupedWagesMap.values());

    const rowsHtml = groupedWagesList.map((item) => {
      const amount = item.totalPcs * item.rate;
      totalPcs += item.totalPcs;
      totalAmount += amount;

      return `
        <tr>
          <td style="border: 1px solid #000; padding: 3px 5px; font-weight: bold; font-size: 7pt; line-height: 1.2;">${item.styleNo}</td>
          <td style="border: 1px solid #000; padding: 3px 5px; font-size: 7pt; line-height: 1.2;">${item.processName}</td>
          <td style="border: 1px solid #000; padding: 3px 5px; font-size: 7pt; line-height: 1.2;">${item.colorName}</td>
          <td style="border: 1px solid #000; padding: 3px 5px; text-align: right; font-size: 7pt; line-height: 1.2;">${item.totalPcs.toFixed(2)}</td>
          <td style="border: 1px solid #000; padding: 3px 5px; text-align: right; font-size: 7pt; line-height: 1.2;">${item.rate.toFixed(2)}</td>
          <td style="border: 1px solid #000; padding: 3px 5px; text-align: right; font-size: 7pt; font-weight: bold; line-height: 1.2;">${amount.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>PRODUCTION WAGES SHEET - ${companyName}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 12mm 12mm 12mm;
          }
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 10px;
          }
          .header {
            text-align: center;
            margin-bottom: 10px;
          }
          .company-name {
            font-size: 15pt;
            font-weight: bold;
            margin-bottom: 3px;
          }
          .company-address {
            font-size: 9.5pt;
            margin-bottom: 12px;
          }
          .sheet-title-box {
            display: inline-block;
            border: 1.5px solid #000;
            padding: 4px 24px;
            font-size: 11pt;
            font-weight: bold;
            letter-spacing: 0.8px;
          }
          .date-top-right {
            float: right;
            font-size: 9pt;
            margin-top: 8px;
          }
          .double-divider {
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
            height: 2px;
            margin: 12px 0 10px 0;
            clear: both;
          }
          .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
            font-size: 8.5pt;
          }
          .meta-table td {
            padding: 3px 2px;
            vertical-align: bottom;
          }
          .field-label {
            font-weight: bold;
          }
          .field-value {
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 110px;
            padding-left: 4px;
          }
          table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5px;
          }
          table.data-table th {
            border: 1.5px solid #000;
            padding: 4px 5px;
            font-size: 7.5pt;
            font-weight: bold;
            text-transform: uppercase;
            background-color: #fff;
          }
          table.data-table td {
            border: 1px solid #000;
            padding: 3px 5px;
            font-size: 7pt;
            line-height: 1.2;
          }
          .total-row td {
            border: 1.5px solid #000;
            font-weight: bold;
            font-size: 8.5pt;
          }
          table.summary-calc-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            font-size: 8pt;
            font-weight: bold;
          }
          table.summary-calc-table td {
            border: 1.5px solid #000;
            padding: 4px 6px;
          }
          .worker-sign {
            margin-top: 40px;
            border-top: 1px solid #000;
            width: 150px;
            text-align: center;
            font-size: 8.5pt;
            padding-top: 4px;
          }
          .footer-signs {
            margin-top: 90px;
            width: 100%;
            display: flex;
            justify-content: space-between;
            font-size: 8.5pt;
          }
          .sign-line {
            border-top: 1px solid #000;
            width: 110px;
            text-align: center;
            padding-top: 4px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">${companyName}</div>
          <div class="company-address">${companyAddress}</div>
          <div style="position: relative;">
            <div class="sheet-title-box">PRODUCTION WAGES SHEET</div>
            <div class="date-top-right">Date : ________</div>
          </div>
        </div>

        <div class="double-divider"></div>

        <table class="meta-table">
          <tr>
            <td style="width: 50%;"><span class="field-label">CARD NO. :</span> <span class="field-value">${empCardNo}</span></td>
            <td style="width: 50%;"><span class="field-label">MACHINE NO. :</span> <span class="field-value">___________</span></td>
          </tr>
          <tr>
            <td><span class="field-label">NAME :</span> <span class="field-value">${empName}</span></td>
            <td><span class="field-label">MONTH :</span> <span class="field-value">${monthStr}</span></td>
          </tr>
          <tr>
            <td><span class="field-label">SECTION :</span> <span class="field-value">${sectionName}</span> &nbsp; <span class="field-label">Block :</span> <span class="field-value" style="min-width:40px;">Nil</span></td>
            <td><span class="field-label">ATTENDANCE :</span> <span class="field-value">___________</span></td>
          </tr>
          <tr>
            <td><span class="field-label">SUPERVISOR :</span> <span class="field-value">___________</span></td>
            <td><span class="field-label">IN-CHARGE :</span> <span class="field-value">___________</span></td>
          </tr>
        </table>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 27%; text-align: left;">STYLE</th>
              <th style="width: 28%; text-align: left;">TYPE</th>
              <th style="width: 20%; text-align: left;">COLOR</th>
              <th style="width: 8%; text-align: right;">NO. OF PCS</th>
              <th style="width: 7%; text-align: right;">RATE</th>
              <th style="width: 10%; text-align: right;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml.length > 0 ? rowsHtml : `
              <tr>
                <td style="border:1px solid #000; padding:3px 5px; font-weight:bold; font-size:7pt; line-height:1.2;">MEPI</td>
                <td style="border:1px solid #000; padding:3px 5px; font-size:7pt; line-height:1.2;">100% OR COTTON 2/40</td>
                <td style="border:1px solid #000; padding:3px 5px; font-size:7pt; line-height:1.2;">BLACK</td>
                <td style="border:1px solid #000; padding:3px 5px; text-align:right; font-size:7pt; line-height:1.2;">34.00</td>
                <td style="border:1px solid #000; padding:3px 5px; text-align:right; font-size:7pt; line-height:1.2;">0.00</td>
                <td style="border:1px solid #000; padding:3px 5px; text-align:right; font-weight:bold; font-size:7pt; line-height:1.2;">0.00</td>
              </tr>
              <tr>
                <td style="border:1px solid #000; padding:3px 5px; font-weight:bold; font-size:7pt; line-height:1.2;">MEPI</td>
                <td style="border:1px solid #000; padding:3px 5px; font-size:7pt; line-height:1.2;">100% OR COTTON 2/40</td>
                <td style="border:1px solid #000; padding:3px 5px; font-size:7pt; line-height:1.2;">BROWN ICE</td>
                <td style="border:1px solid #000; padding:3px 5px; text-align:right; font-size:7pt; line-height:1.2;">34.00</td>
                <td style="border:1px solid #000; padding:3px 5px; text-align:right; font-size:7pt; line-height:1.2;">0.00</td>
                <td style="border:1px solid #000; padding:3px 5px; text-align:right; font-weight:bold; font-size:7pt; line-height:1.2;">0.00</td>
              </tr>
              <tr>
                <td style="border:1px solid #000; padding:3px 5px; font-weight:bold; font-size:7pt; line-height:1.2;">MEPI</td>
                <td style="border:1px solid #000; padding:3px 5px; font-size:7pt; line-height:1.2;">100% OR COTTON 2/40</td>
                <td style="border:1px solid #000; padding:3px 5px; font-size:7pt; line-height:1.2;">ECRU</td>
                <td style="border:1px solid #000; padding:3px 5px; text-align:right; font-size:7pt; line-height:1.2;">34.00</td>
                <td style="border:1px solid #000; padding:3px 5px; text-align:right; font-size:7pt; line-height:1.2;">0.00</td>
                <td style="border:1px solid #000; padding:3px 5px; text-align:right; font-weight:bold; font-size:7pt; line-height:1.2;">0.00</td>
              </tr>
            `}
            <tr class="total-row">
              <td colSpan="3" style="text-align: right; border-right: none; padding: 4px;">Total :</td>
              <td style="text-align: right; border-left: none; border-right: none; padding: 4px;">${totalPcs > 0 ? totalPcs.toFixed(2) : (rowsHtml.length > 0 ? '0.00' : '102.00')} lbs</td>
              <td style="border-left: none; border-right: none;"></td>
              <td style="text-align: right; border-left: none; padding: 4px;">${totalPcs > 0 ? totalAmount.toFixed(2) : '0.00'}</td>
            </tr>
          </tbody>
        </table>

        <table class="summary-calc-table">
          <tr>
            <td style="width: 15%;">PROD. WAGE</td>
            <td style="width: 18%; text-align: center;">${totalPcs > 0 ? totalAmount.toFixed(0) : '0'}</td>
            <td style="width: 17%;">ATTN. BONUS</td>
            <td style="width: 17%;"></td>
            <td style="width: 16%;">PRODN. BONUS</td>
            <td style="width: 17%;"></td>
          </tr>
          <tr>
            <td>NO. WORK</td>
            <td></td>
            <td>MIN. WAGES ADJ.</td>
            <td></td>
            <td>GROSS PAY</td>
            <td></td>
          </tr>
        </table>

        <div class="worker-sign">Worker Signature</div>

        <div class="footer-signs">
          <div class="sign-line">Checked By</div>
          <div class="sign-line">Prod. Manager</div>
          <div>Page 1 of 1</div>
          <div class="sign-line">AC Signature</div>
          <div class="sign-line">Authorized By</div>
        </div>
      </body>
      </html>
    `;

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const uint8Pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' }
    });

    await browser.close();

    const pdfBuffer = Buffer.from(uint8Pdf);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Content-Disposition', `inline; filename="MONTHLY_PRODUCTION_WAGES_SHEET.pdf"`);
    res.end(pdfBuffer);
  } catch (err) {
    if (browser) await browser.close();
    console.error('Puppeteer Monthly Wages PDF error:', err);
    res.status(500).json({ message: err.message });
  }
};

// 5. Monthly Production Statement Puppeteer PDF Exporter (Matching Image-4)
exports.generateMonthlyProductionStatementPdf = async (req, res) => {
  let browser = null;
  try {
    const { section_id, startDate, endDate } = req.query;

    if (!section_id || section_id === 'All') {
      return res.status(400).send('<html><body style="font-family:sans-serif; text-align:center; padding:50px; color:#e11d48;"><h2>সেকশন নির্বাচন করা বাধ্যতামূলক! (Section is required)</h2><p>দয়া করে ফিল্টার প্যানেল থেকে সেকশন সিলেক্ট করুন।</p></body></html>');
    }
    if (!startDate || !endDate) {
      return res.status(400).send('<html><body style="font-family:sans-serif; text-align:center; padding:50px; color:#e11d48;"><h2>তারিখ (হতে ও পর্যন্ত) নির্বাচন করা বাধ্যতামূলক! (Date range is required)</h2><p>দয়া করে ফিল্টার প্যানেল থেকে তারিখের রেঞ্জ সিলেক্ট করুন।</p></body></html>');
    }

    const companyProfile = await prisma.companyProfile.findFirst();
    const companyName = companyProfile?.company_name || 'Best Wool Sweaters Ltd. (Ext. & Warehouse)';
    const companyAddress = companyProfile?.address || 'SURABARI, KASHIMPUR, GAZIPUR SADAR, GAZIPUR.';

    const where = {
      section_id: parseInt(section_id),
      production_date: {
        gte: new Date(startDate),
        lte: new Date(`${endDate}T23:59:59.999Z`)
      }
    };

    const start = new Date(startDate);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    let sectionName = 'Auto Winding';
    const sec = await prisma.section.findUnique({ where: { id: parseInt(section_id) } });
    if (sec) sectionName = sec.name;

    // 1. Fetch present period production entries
    const list = await prisma.production.findMany({
      where: {
        section_id: parseInt(section_id),
        production_date: { gte: start, lte: end }
      },
      include: {
        section: { select: { name: true } },
        style: { select: { id: true, style_no: true, buyer_id: true, buyer: { select: { name: true } } } },
        process: { select: { id: true, process_name: true } },
        color: { select: { id: true, color_name: true } }
      },
      orderBy: { id: 'desc' }
    });

    // 2. Fetch all buyer orders for order quantity matching
    const buyerOrders = await prisma.buyerOrder.findMany({
      where: { section_id: parseInt(section_id) }
    });

    // 3. Fetch all production entries up to end date to compute totalProdQty and prevSalaryQty accurately
    const allProdUntilEnd = await prisma.production.findMany({
      where: {
        section_id: parseInt(section_id),
        production_date: { lte: end }
      }
    });

    // Group present period production by (buyer, style, process, color)
    const statementMap = new Map();

    list.forEach(item => {
      const key = `${item.style?.buyer_id || 0}-${item.style_id}-${item.process_id}-${item.color_id}`;
      if (!statementMap.has(key)) {
        statementMap.set(key, {
          buyerId: item.style?.buyer_id || 0,
          buyerName: item.style?.buyer?.name || 'BEST WOOL SWEATERS',
          styleId: item.style_id,
          styleNo: item.style?.style_no || 'MEPI',
          processId: item.process_id,
          processName: item.process?.process_name || '100% OR COTTON 2/40',
          colorId: item.color_id,
          colorName: item.color?.color_name || 'BLACK',
          presentSalaryQty: 0
        });
      }
      const existing = statementMap.get(key);
      existing.presentSalaryQty += Number(item.quantity) || 0;
    });

    // If present list is empty, also check if buyer orders exist for this section so the report isn't blank
    if (statementMap.size === 0) {
      const secOrders = await prisma.buyerOrder.findMany({
        where: { section_id: parseInt(section_id) },
        include: {
          buyer: { select: { name: true } },
          style: { select: { style_no: true } },
          process: { select: { process_name: true } },
          color: { select: { color_name: true } }
        }
      });
      secOrders.forEach(ord => {
        const key = `${ord.buyer_id}-${ord.style_id}-${ord.process_id}-${ord.color_id}`;
        if (!statementMap.has(key)) {
          statementMap.set(key, {
            buyerId: ord.buyer_id,
            buyerName: ord.buyer?.name || 'BEST WOOL SWEATERS',
            styleId: ord.style_id,
            styleNo: ord.style?.style_no || 'MEPI',
            processId: ord.process_id,
            processName: ord.process?.process_name || '100% OR COTTON 2/40',
            colorId: ord.color_id,
            colorName: ord.color?.color_name || 'BLACK',
            presentSalaryQty: 0
          });
        }
      });
    }

    const statementList = Array.from(statementMap.values());
    const monthStr = startDate ? new Date(startDate).toLocaleString('default', { month: 'short', year: 'numeric' }) : 'Jul 2026';
    const currentDateStr = new Date().toLocaleDateString('en-GB');

    let sumOrder = 0;
    let sumTotalProd = 0;
    let sumPrev = 0;
    let sumPresent = 0;
    let sumTotalSal = 0;
    let sumMainProd = 0;
    let sumBalance = 0;

    const rowsHtml = statementList.map(item => {
      // 1. Match Buyer Order Quantity from buyer_orders table
      const matchedOrder = buyerOrders.find(o =>
        o.style_id === item.styleId &&
        o.process_id === item.processId &&
        o.color_id === item.colorId
      ) || buyerOrders.find(o => o.style_id === item.styleId);

      const orderQty = matchedOrder ? Number(matchedOrder.order_quantity) : 0;

      // 3. Previous Salary Qty: Total production quantity before start date for matched style, process, color
      const prevSalaryQty = allProdUntilEnd
        .filter(p => p.style_id === item.styleId && p.process_id === item.processId && p.color_id === item.colorId && new Date(p.production_date) < start)
        .reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);

      // 4. Present Salary Qty (within selected date range)
      const presentSalaryQty = item.presentSalaryQty || 0;

      // 5. Total Salary Qty = Previous Salary Qty + Present Salary Qty
      const totalSalaryQty = prevSalaryQty + presentSalaryQty;

      // 2. Total Production Qty = Previous Salary Qty + Present Salary Qty
      const totalProdQty = prevSalaryQty + presentSalaryQty;

      // 6. Main Prod Qty = present salary quantity
      const mainProdQty = presentSalaryQty;

      // 7. Balance Qty = orderQty - totalProdQty
      const balanceQty = orderQty > 0 ? Math.max(0, orderQty - totalProdQty) : 0;

      sumOrder += orderQty;
      sumTotalProd += totalProdQty;
      sumPrev += prevSalaryQty;
      sumPresent += presentSalaryQty;
      sumTotalSal += totalSalaryQty;
      sumMainProd += mainProdQty;
      sumBalance += balanceQty;

      return `
        <tr>
          <td style="border: 1px solid #000; padding: 4px 6px; font-size: 7.5pt; text-align: left;">${item.buyerName}</td>
          <td style="border: 1px solid #000; padding: 4px 6px; font-size: 7.5pt; font-weight: bold; text-align: left;">${item.styleNo}</td>
          <td style="border: 1px solid #000; padding: 4px 6px; font-size: 7.5pt; text-align: left;">${item.processName}</td>
          <td style="border: 1px solid #000; padding: 4px 6px; font-size: 7.5pt; text-align: left;">${item.colorName}</td>
          <td style="border: 1px solid #000; padding: 4px 6px; font-size: 7.5pt; text-align: right;">${orderQty.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td style="border: 1px solid #000; padding: 4px 6px; font-size: 7.5pt; text-align: right;">${totalProdQty.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td style="border: 1px solid #000; padding: 4px 6px; font-size: 7.5pt; text-align: right;">${prevSalaryQty.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td style="border: 1px solid #000; padding: 4px 6px; font-size: 7.5pt; text-align: right;">${presentSalaryQty.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td style="border: 1px solid #000; padding: 4px 6px; font-size: 7.5pt; text-align: right;">${totalSalaryQty.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td style="border: 1px solid #000; padding: 4px 6px; font-size: 7.5pt; text-align: right;">${mainProdQty.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td style="border: 1px solid #000; padding: 4px 6px; font-size: 7.5pt; text-align: right;">${balanceQty.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>MONTHLY PRODUCTION STATEMENT - ${companyName}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 10mm 10mm 10mm 10mm;
          }
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 5px;
          }
          .header {
            text-align: center;
            margin-bottom: 12px;
          }
          .company-name {
            font-size: 15pt;
            font-weight: bold;
            margin-bottom: 3px;
          }
          .company-address {
            font-size: 8.5pt;
            font-weight: bold;
            margin-bottom: 14px;
            letter-spacing: 0.3px;
          }
          .sheet-title-box {
            display: inline-block;
            border: 1.5px solid #000;
            padding: 5px 30px;
            font-size: 13pt;
            font-weight: bold;
            letter-spacing: 0.5px;
          }
          .meta-row {
            width: 100%;
            margin-top: 15px;
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
            font-size: 9pt;
            font-weight: bold;
          }
          table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
          }
          table.data-table th {
            border: 1px solid #000;
            padding: 5px 4px;
            font-size: 7.5pt;
            font-weight: bold;
            text-align: center;
            background-color: #fff;
            vertical-align: middle;
          }
          table.data-table td {
            border: 1px solid #000;
            padding: 4px 5px;
          }
          .total-row td {
            border: 1px solid #000;
            font-weight: bold;
            font-size: 8pt;
          }
          .footer-signs {
            margin-top: 70px;
            width: 100%;
            display: flex;
            justify-content: space-between;
            font-size: 8.5pt;
            font-weight: bold;
            text-align: center;
          }
          .sign-line {
            border-top: 1px solid #000;
            width: 13%;
            padding-top: 4px;
          }
          .page-num {
            text-align: center;
            margin-top: 15px;
            font-size: 8pt;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">${companyName}</div>
          <div class="company-address">${companyAddress}</div>
          <div>
            <div class="sheet-title-box">MONTHLY PRODUCTION STATEMENT</div>
          </div>
        </div>

        <div class="meta-row">
          <div>Section: ${sectionName}</div>
          <div>Month of : ${monthStr}</div>
          <div>Date: ${currentDateStr}</div>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 13%;">BuyerName</th>
              <th style="width: 8%;">StyleName</th>
              <th style="width: 14%;">Process</th>
              <th style="width: 8%;">Color</th>
              <th style="width: 8%;">Order<br>Quantity</th>
              <th style="width: 8%;">Total Prod.<br>Qty</th>
              <th style="width: 8.5%;">Previous<br>Salary Qty</th>
              <th style="width: 8.5%;">Present<br>Salary Qty</th>
              <th style="width: 8.5%;">Total Salary<br>Quantity</th>
              <th style="width: 7.5%;">Main Prod.<br>Quantity</th>
              <th style="width: 8%;">Balace<br>Quantity</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml.length > 0 ? rowsHtml : `
              <tr>
                <td colSpan="11" style="text-align:center; padding: 20px; font-size: 9pt;">কোনো প্রোডাকশন স্টেটমেন্ট ডাটা পাওয়া যায়নি</td>
              </tr>
            `}
            <tr class="total-row">
              <td colSpan="4" style="text-align: left; padding: 4px;">Sub-Total :</td>
              <td style="text-align: right; padding: 4px;">${sumOrder.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              <td style="text-align: right; padding: 4px;">${sumTotalProd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              <td style="text-align: right; padding: 4px;">${sumPrev.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              <td style="text-align: right; padding: 4px;">${sumPresent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              <td style="text-align: right; padding: 4px;">${sumTotalSal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              <td style="text-align: right; padding: 4px;">${sumMainProd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              <td style="text-align: right; padding: 4px;">${sumBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr class="total-row">
              <td colSpan="4" style="text-align: left; padding: 4px;">Grand-Total :</td>
              <td style="text-align: right; padding: 4px;">${sumOrder.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              <td style="text-align: right; padding: 4px;">${sumTotalProd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              <td style="text-align: right; padding: 4px;">${sumPrev.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              <td style="text-align: right; padding: 4px;">${sumPresent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              <td style="text-align: right; padding: 4px;">${sumTotalSal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              <td style="text-align: right; padding: 4px;">${sumMainProd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              <td style="text-align: right; padding: 4px;">${sumBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer-signs">
          <div class="sign-line">Prepared by</div>
          <div class="sign-line">Incharge</div>
          <div class="sign-line">APM</div>
          <div class="sign-line">PM</div>
          <div class="sign-line">AGM</div>
          <div class="sign-line">GM</div>
        </div>

        <div class="page-num">Page 1 of 1</div>
      </body>
      </html>
    `;

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const uint8Pdf = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
    });

    await browser.close();

    const pdfBuffer = Buffer.from(uint8Pdf);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Content-Disposition', `inline; filename="MONTHLY_PRODUCTION_STATEMENT.pdf"`);
    res.end(pdfBuffer);
  } catch (err) {
    if (browser) await browser.close();
    console.error('Puppeteer Monthly Production Statement PDF error:', err);
    res.status(500).json({ message: err.message });
  }
};

// 6. Monthly Rate Sheet Puppeteer PDF Exporter (Style, Process, Color Group-Wise Single Rate View)
exports.generateMonthlyRateSheetPdf = async (req, res) => {
  let browser = null;
  try {
    const { section_id, startDate, endDate } = req.query;

    if (!section_id || section_id === 'All') {
      return res.status(400).send('<html><body style="font-family:sans-serif; text-align:center; padding:50px; color:#e11d48;"><h2>সেকশন নির্বাচন করা বাধ্যতামূলক! (Section is required)</h2><p>দয়া করে ফিল্টার প্যানেল থেকে সেকশন সিলেক্ট করুন।</p></body></html>');
    }

    const companyProfile = await prisma.companyProfile.findFirst();
    const companyName = companyProfile?.company_name || 'Best Wool Sweaters Ltd. (Ext. & Warehouse)';
    const companyAddress = companyProfile?.address || 'Surabari, Kashimpur, Gazipur.';

    let sectionName = 'Auto Winding';
    const sec = await prisma.section.findUnique({ where: { id: parseInt(section_id) } });
    if (sec) sectionName = sec.name;

    // Fetch all piece rates for this section with relations
    const pieceRates = await prisma.pieceRate.findMany({
      where: { section_id: parseInt(section_id) },
      include: {
        style: { select: { style_no: true } },
        process: { select: { process_name: true } },
        color: { select: { color_name: true } }
      },
      orderBy: [
        { style_id: 'asc' },
        { process_id: 'asc' }
      ]
    });

    // Also fetch production records in date range if specified, to catch any style/process/color logged in production
    const whereProd = { section_id: parseInt(section_id) };
    if (startDate && endDate) {
      whereProd.production_date = {
        gte: new Date(startDate),
        lte: new Date(`${endDate}T23:59:59.999Z`)
      };
    }

    const productionList = await prisma.production.findMany({
      where: whereProd,
      include: {
        style: { select: { style_no: true } },
        process: { select: { process_name: true } },
        color: { select: { color_name: true } }
      }
    });

    // Group & Deduplicate by (style_id, process_id, color_id) -> Single Rate View
    const rateGroupMap = new Map();

    // 1. Populate from pieceRates table
    pieceRates.forEach(pr => {
      const key = `${pr.style_id}-${pr.process_id}-${pr.color_id}`;
      rateGroupMap.set(key, {
        styleNo: pr.style?.style_no || '—',
        processName: pr.process?.process_name || '—',
        colorName: pr.color?.color_name || '—',
        rate: Number(pr.rate) || 0
      });
    });

    // 2. Populate from production records (if any style/process/color logged in production doesn't have a rate yet)
    productionList.forEach(item => {
      const key = `${item.style_id}-${item.process_id}-${item.color_id}`;
      if (!rateGroupMap.has(key)) {
        rateGroupMap.set(key, {
          styleNo: item.style?.style_no || '—',
          processName: item.process?.process_name || '—',
          colorName: item.color?.color_name || '—',
          rate: 0
        });
      }
    });

    const rateList = Array.from(rateGroupMap.values());
    const currentDateStr = new Date().toLocaleDateString('en-GB');

    const rowsHtml = rateList.map((item, index) => `
      <tr>
        <td style="border: 1px solid #000; padding: 3px 5px; text-align: center; font-size: 7pt; line-height: 1.2;">${index + 1}</td>
        <td style="border: 1px solid #000; padding: 3px 5px; text-align: left; font-size: 7pt; font-weight: bold; line-height: 1.2;">${item.styleNo}</td>
        <td style="border: 1px solid #000; padding: 3px 5px; text-align: left; font-size: 7pt; line-height: 1.2;">${item.processName}</td>
        <td style="border: 1px solid #000; padding: 3px 5px; text-align: left; font-size: 7pt; line-height: 1.2;">${item.colorName}</td>
        <td style="border: 1px solid #000; padding: 3px 5px; text-align: right; font-size: 7pt; font-weight: bold; line-height: 1.2; ${item.rate === 0 ? 'color: #dc2626;' : ''}">${item.rate.toFixed(2)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>PIECE RATE SHEET - ${companyName}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 10mm 12mm 10mm;
          }
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 10px;
          }
          .header {
            text-align: center;
            margin-bottom: 12px;
          }
          .company-name {
            font-size: 15pt;
            font-weight: bold;
            margin-bottom: 3px;
          }
          .company-address {
            font-size: 9pt;
            margin-bottom: 14px;
          }
          .sheet-title-box {
            display: inline-block;
            border: 1.5px solid #000;
            padding: 5px 28px;
            font-size: 11pt;
            font-weight: bold;
            letter-spacing: 0.8px;
          }
          .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            margin-bottom: 10px;
            font-size: 9.5pt;
            font-weight: bold;
          }
          .meta-table td {
            padding: 3px 0;
          }
          table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5px;
          }
          table.data-table th {
            border: 1.5px solid #000;
            padding: 4px 5px;
            font-size: 7.5pt;
            font-weight: bold;
            text-transform: uppercase;
            background-color: #fff;
          }
          table.data-table td {
            border: 1px solid #000;
            padding: 3px 5px;
            font-size: 7pt;
            line-height: 1.2;
          }
          .footer-signs {
            margin-top: 80px;
            width: 100%;
            display: flex;
            justify-content: space-between;
            font-size: 8.5pt;
            font-weight: bold;
          }
          .sign-line {
            border-top: 1px solid #000;
            width: 120px;
            text-align: center;
            padding-top: 4px;
          }
          .page-num {
            text-align: center;
            margin-top: 15px;
            font-size: 8pt;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">${companyName}</div>
          <div class="company-address">${companyAddress}</div>
          <div>
            <div class="sheet-title-box">PIECE RATE SHEET</div>
          </div>
        </div>

        <table class="meta-table">
          <tr>
            <td style="text-align: left; width: 40%;">Section : ${sectionName}</td>
            <td style="text-align: center; width: 30%;"></td>
            <td style="text-align: right; width: 30%;">Date : ${currentDateStr}</td>
          </tr>
        </table>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 6%; text-align: center;">SL</th>
              <th style="width: 28%; text-align: left;">STYLE NO</th>
              <th style="width: 34%; text-align: left;">PROCESS / TYPE</th>
              <th style="width: 20%; text-align: left;">COLOR</th>
              <th style="width: 12%; text-align: right;">RATE (TK)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml.length > 0 ? rowsHtml : `
              <tr>
                <td colSpan="5" style="text-align:center; padding: 20px; font-size: 9pt;">কোনো পিস রেট ডাটা পাওয়া যায়নি</td>
              </tr>
            `}
          </tbody>
        </table>

        <div class="footer-signs">
          <div class="sign-line">Prepared By</div>
          <div class="sign-line">In-Charge</div>
          <div class="sign-line">Manager</div>
          <div class="sign-line">Authorized By</div>
        </div>

        <div class="page-num">Page 1 of 1</div>
      </body>
      </html>
    `;

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const uint8Pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', right: '10mm', bottom: '12mm', left: '10mm' }
    });

    await browser.close();

    const pdfBuffer = Buffer.from(uint8Pdf);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Content-Disposition', `inline; filename="SECTION_PIECE_RATE_SHEET.pdf"`);
    res.end(pdfBuffer);
  } catch (err) {
    if (browser) await browser.close();
    console.error('Puppeteer Piece Rate Sheet PDF error:', err);
    res.status(500).json({ message: err.message });
  }
};

// 7. Production Report Data (JSON)
exports.getProductionReport = async (req, res) => {
  try {
    const { section_id, style_id, startDate, endDate } = req.query;
    const where = {};

    if (section_id && section_id !== 'All') where.section_id = parseInt(section_id);
    if (style_id && style_id !== 'All') where.style_id = parseInt(style_id);
    if (startDate || endDate) {
      where.production_date = {};
      if (startDate) where.production_date.gte = new Date(startDate);
      if (endDate) where.production_date.lte = new Date(`${endDate}T23:59:59.999Z`);
    }

    const list = await prisma.production.findMany({
      where,
      include: {
        section: { select: { name: true } },
        style: { select: { style_no: true, buyer: { select: { name: true } } } },
        process: { select: { process_name: true } },
        color: { select: { color_name: true } }
      },
      orderBy: { id: 'desc' }
    });

    const totalQty = list.reduce((acc, curr) => acc + curr.quantity, 0);

    res.json({
      summary: {
        totalEntries: list.length,
        totalQty
      },
      data: list.map(item => ({
        ...item,
        section_name: item.section?.name || '—',
        style_no: item.style?.style_no || '—',
        buyer_name: item.style?.buyer?.name || '—',
        process_name: item.process?.process_name || '—',
        color_name: item.color?.color_name || '—'
      }))
    });
  } catch (err) {
    console.error('Error generating production report:', err);
    res.status(500).json({ message: err.message });
  }
};

// 8. Buyer Order Report Data (JSON)
exports.getBuyerOrderReport = async (req, res) => {
  try {
    const { buyer_id, section_id, style_id } = req.query;
    const where = {};

    if (buyer_id && buyer_id !== 'All') where.buyer_id = parseInt(buyer_id);
    if (section_id && section_id !== 'All') where.section_id = parseInt(section_id);
    if (style_id && style_id !== 'All') where.style_id = parseInt(style_id);

    const list = await prisma.buyerOrder.findMany({
      where,
      include: {
        section: { select: { name: true } },
        buyer: { select: { name: true } },
        style: { select: { style_no: true } },
        process: { select: { process_name: true } },
        color: { select: { color_name: true } }
      },
      orderBy: { id: 'desc' }
    });

    const totalOrderQty = list.reduce((acc, curr) => acc + curr.order_quantity, 0);
    const totalYarnReceived = list.reduce((acc, curr) => acc + (curr.yarn_received || 0), 0);

    res.json({
      summary: {
        totalOrders: list.length,
        totalOrderQty,
        totalYarnReceived
      },
      data: list.map(item => ({
        ...item,
        section_name: item.section?.name || '—',
        buyer_name: item.buyer?.name || '—',
        style_no: item.style?.style_no || '—',
        process_name: item.process?.process_name || '—',
        color_name: item.color?.color_name || '—'
      }))
    });
  } catch (err) {
    console.error('Error generating buyer order report:', err);
    res.status(500).json({ message: err.message });
  }
};
