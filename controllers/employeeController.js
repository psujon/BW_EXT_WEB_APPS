const { prisma } = require('../db');

exports.getAllActive = async (req, res) => {
  try {
    const list = await prisma.employee.findMany({
      where: { status: 'Active' },
      include: {
        section: { select: { name: true, code: true } }
      },
      orderBy: { id: 'desc' }
    });

    const result = list.map(emp => ({
      ...emp,
      section_name: emp.section?.name || null,
      section_code: emp.section?.code || null,
      section: undefined
    }));

    res.json(result);
  } catch (err) {
    console.error('Error fetching active employees:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  const { card_no, name, designation, join_date, section_id, section_name, section_code } = req.body;
  const userId = req.user ? req.user.id : null;

  if (!card_no || !name || !designation || !join_date) {
    return res.status(400).json({ message: 'কার্ড নং, নাম, পদবী ও জয়েন ডেট পূরণ করা বাধ্যতামূলক!' });
  }

  let finalSectionId = section_id ? parseInt(section_id) : null;

  try {
    // If section_id was not provided but section_name is given, find or create the section
    if (!finalSectionId && section_name) {
      let sec = await prisma.section.findFirst({
        where: { name: section_name.trim() }
      });
      if (!sec) {
        sec = await prisma.section.create({
          data: {
            name: section_name.trim(),
            code: (section_code || 'AUTO').trim(),
            status: 'Active',
            processed_by: userId,
            processed_date: new Date()
          }
        });
      }
      finalSectionId = sec.id;
    }

    if (!finalSectionId) {
      return res.status(400).json({ message: 'সেকশন নির্বাচন করা বাধ্যতামূলক!' });
    }

    const trimmedCardNo = card_no.trim();
    const existing = await prisma.employee.findFirst({
      where: { card_no: trimmedCardNo }
    });

    let employee;
    if (existing) {
      employee = await prisma.employee.update({
        where: { id: existing.id },
        data: {
          name: name.trim(),
          designation: designation.trim(),
          join_date: new Date(join_date),
          section_id: finalSectionId,
          status: 'Active',
          processed_by: userId,
          processed_date: new Date()
        },
        include: {
          section: { select: { name: true, code: true } }
        }
      });
    } else {
      employee = await prisma.employee.create({
        data: {
          card_no: trimmedCardNo,
          name: name.trim(),
          designation: designation.trim(),
          join_date: new Date(join_date),
          section_id: finalSectionId,
          status: 'Active',
          processed_by: userId,
          processed_date: new Date()
        },
        include: {
          section: { select: { name: true, code: true } }
        }
      });
    }

    const result = {
      ...employee,
      section_name: employee.section?.name || null,
      section_code: employee.section?.code || null,
      section: undefined
    };

    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating employee:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { card_no, name, designation, join_date, section_id, status } = req.body;
  const userId = req.user ? req.user.id : null;

  try {
    const employee = await prisma.employee.update({
      where: { id: parseInt(id) },
      data: {
        card_no: card_no ? card_no.trim() : undefined,
        name: name ? name.trim() : undefined,
        designation: designation ? designation.trim() : undefined,
        join_date: join_date ? new Date(join_date) : undefined,
        section_id: section_id ? parseInt(section_id) : undefined,
        status: status || 'Active',
        processed_by: userId,
        processed_date: new Date()
      }
    });

    res.json(employee);
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.employee.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search Employee from external MSSQL database (On-Demand Connection Only)
exports.searchExternalEmployee = async (req, res) => {
  const sql = require('mssql');
  const { card_no } = req.query;

  if (!card_no || !card_no.trim()) {
    return res.status(400).json({ message: 'কার্ড নম্বর প্রদান করুন!' });
  }

  const cardNo = card_no.trim();
  const serverHost = process.env.MSSQL_SERVER || '10.10.2.2';
  const serverPort = parseInt(process.env.MSSQL_PORT || '4368');
  const dbUser = process.env.MSSQL_USER || 'sa';
  const dbPassword = process.env.MSSQL_PASSWORD !== undefined ? process.env.MSSQL_PASSWORD : '';
  const dbName = process.env.MSSQL_DATABASE || 'garments_db';

  // Strategy 1: Direct TCP/IP connection to port 4368 (Fastest, avoids UDP 1434 SQL Browser timeout)
  const configDirectPort = {
    user: dbUser,
    password: dbPassword,
    server: serverHost,
    port: serverPort,
    database: dbName,
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true
    },
    connectionTimeout: 12000,
    requestTimeout: 20000
  };

  // Strategy 2: Instance-based connection via SQL Browser (fallback)
  const configInstanceFallback = {
    user: dbUser,
    password: dbPassword,
    server: serverHost,
    database: dbName,
    options: {
      encrypt: false,
      trustServerCertificate: true,
      instanceName: process.env.MSSQL_INSTANCE || 'sql2012',
      enableArithAbort: true
    },
    connectionTimeout: 12000,
    requestTimeout: 20000
  };

  let pool = null;

  try {
    let result = null;

    // Connect ONLY when search button is clicked
    try {
      pool = await sql.connect(configDirectPort);
      result = await pool.request()
        .input('cardNo', sql.VarChar, cardNo)
        .query(`
          select eb.emp_id, eb.emp_name, b_designation.designation_name, B_section.section_name, B_section.section_code, ebi.join_date 
          from emp_basic as eb
          INNER join emp_basic_info as ebi on eb.emp_no=ebi.emp_no
          inner join b_designation on ebi.designation_code=b_designation.Designation_code
          inner join B_section on ebi.section_code=B_section.section_code
          where eb.emp_id = @cardNo
        `);
    } catch (directErr) {
      console.warn(`Direct port ${serverPort} connection failed: ${directErr.message}. Trying instance fallback...`);
      if (pool) {
        try { await pool.close(); } catch (_) {}
        pool = null;
      }
      pool = await sql.connect(configInstanceFallback);
      result = await pool.request()
        .input('cardNo', sql.VarChar, cardNo)
        .query(`
          select eb.emp_id, eb.emp_name, b_designation.designation_name, B_section.section_name, B_section.section_code, ebi.join_date 
          from emp_basic as eb
          INNER join emp_basic_info as ebi on eb.emp_no=ebi.emp_no
          inner join b_designation on ebi.designation_code=b_designation.Designation_code
          inner join B_section on ebi.section_code=B_section.section_code
          where eb.emp_id = @cardNo
        `);
    }

    if (!result || !result.recordset || result.recordset.length === 0) {
      return res.status(404).json({ message: `কার্ড নং '${cardNo}' দিয়ে কোনো এমপ্লয়ী পাওয়া যায়নি!` });
    }

    const row = result.recordset[0];

    // Check if this employee already exists in MySQL
    const localEmployee = await prisma.employee.findFirst({
      where: { card_no: row.emp_id },
      include: { section: { select: { name: true } } }
    });

    return res.json({
      success: true,
      data: {
        emp_id: row.emp_id,
        emp_name: row.emp_name ? row.emp_name.trim() : '',
        designation_name: row.designation_name ? row.designation_name.trim() : '',
        section_name: row.section_name ? row.section_name.trim() : '',
        section_code: row.section_code ? String(row.section_code).trim() : '',
        join_date: row.join_date ? new Date(row.join_date).toISOString().split('T')[0] : '',
        already_saved: !!localEmployee,
        local_employee_id: localEmployee ? localEmployee.id : null,
        local_section_name: localEmployee ? localEmployee.section?.name : null
      }
    });
  } catch (err) {
    console.error('Error querying MSSQL database:', err);
    return res.status(500).json({ message: `এমএসএসকিউএল ডাটাবেজে সংযোগ ব্যর্থ হয়েছে: ${err.message}` });
  } finally {
    // ALWAYS close connection pool immediately when search is finished
    if (pool) {
      try {
        await pool.close();
      } catch (closeErr) {
        console.error('Error closing MSSQL pool:', closeErr);
      }
    }
  }
};

// Directly Save / Import Employee from external MSSQL search
exports.saveExternalEmployee = async (req, res) => {
  const { card_no, name, designation, section_name, section_code, join_date } = req.body;
  const userId = req.user ? req.user.id : null;

  if (!card_no || !name || !designation) {
    return res.status(400).json({ message: 'কার্ড নং, নাম ও পদবী আবশ্যক!' });
  }

  try {
    const trimmedCardNo = card_no.trim();
    const trimmedName = name.trim();
    const trimmedDesig = designation.trim();
    const trimmedSecName = (section_name || 'General').trim();
    const trimmedSecCode = (section_code || 'AUTO').trim();

    // 1. Find or auto-create the section in MySQL
    let section = await prisma.section.findFirst({
      where: {
        OR: [
          { name: { equals: trimmedSecName } },
          { code: { equals: trimmedSecCode } }
        ]
      }
    });

    if (!section) {
      section = await prisma.section.create({
        data: {
          name: trimmedSecName,
          code: trimmedSecCode,
          status: 'Active',
          processed_by: userId,
          processed_date: new Date()
        }
      });
    }

    // 2. Check if employee already exists in MySQL
    let employee = await prisma.employee.findFirst({
      where: { card_no: trimmedCardNo }
    });

    const parsedJoinDate = join_date ? new Date(join_date) : new Date();

    if (employee) {
      // Update existing employee
      employee = await prisma.employee.update({
        where: { id: employee.id },
        data: {
          name: trimmedName,
          designation: trimmedDesig,
          join_date: parsedJoinDate,
          section_id: section.id,
          status: 'Active',
          processed_by: userId,
          processed_date: new Date()
        },
        include: {
          section: { select: { name: true, code: true } }
        }
      });
    } else {
      // Create new employee
      employee = await prisma.employee.create({
        data: {
          card_no: trimmedCardNo,
          name: trimmedName,
          designation: trimmedDesig,
          join_date: parsedJoinDate,
          section_id: section.id,
          status: 'Active',
          processed_by: userId,
          processed_date: new Date()
        },
        include: {
          section: { select: { name: true, code: true } }
        }
      });
    }

    const formattedEmp = {
      ...employee,
      section_name: employee.section?.name || section.name,
      section_code: employee.section?.code || section.code,
      section: undefined
    };

    return res.status(200).json({
      success: true,
      message: `এমপ্লয়ী '${trimmedName}' (${trimmedCardNo}) সফলভাবে ডাটাবেজে সংরক্ষণ করা হয়েছে!`,
      employee: formattedEmp,
      section
    });

  } catch (err) {
    console.error('Error saving external employee:', err);
    return res.status(500).json({ message: err.message });
  }
};
