/**
 * ============================================================
 * SAKARIA REPAIR MANAGER - Secure Backend API
 * Version: 3.0.0
 * Stack: Node.js + Express + sql.js (SQLite) + JWT + bcrypt
 * ============================================================
 * 
 * Architecture:
 *   POST   /api/auth/login              → No auth required
 *   GET    /api/auth/me                 → All authenticated
 *   
 *   GET    /api/tickets                 → All authenticated
 *   POST   /api/tickets                 → Admin + Receptionist
 *   PUT    /api/tickets/:id             → Admin + Technician (own) + Receptionist
 *   DELETE /api/tickets/:id             → Admin only
 *   
 *   GET    /api/customers               → All authenticated
 *   
 *   GET    /api/users                   → Admin only
 *   POST   /api/users                   → Admin only
 *   PUT    /api/users/:id               → Admin only
 *   DELETE /api/users/:id               → Admin only
 *   
 *   GET    /api/audit-logs              → Admin only
 *   GET    /api/reports                 → Admin + Receptionist
 *   
 *   POST   /api/backup/create           → Admin only
 *   POST   /api/backup/restore          → Admin only
 *   GET    /api/backup/list             → Admin only
 *   
 *   POST   /api/reset                   → Admin only (DANGEROUS)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = (() => { 
  const crypto = require('crypto'); 
  return { v4: () => crypto.randomUUID() }; 
})();

const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';
const DB_PATH = process.env.DB_PATH || './data/sakaria.db';
const BACKUP_DIR = process.env.BACKUP_DIR || './data/backups';

// ============================================================
// MIDDLEWARE SETUP
// ============================================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:3000',
    'https://sakariacade.github.io'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' }
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  message: { error: 'Too many requests.' }
});

app.use('/api/auth/login', authLimiter);
app.use('/api', apiLimiter);

// ============================================================
// DATABASE SETUP (sql.js - pure JS SQLite)
// ============================================================
let db = null;
let SQL = null;

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    ensureDir(path.dirname(DB_PATH));
    fs.writeFileSync(DB_PATH, buffer);
  }
}

async function initDatabase() {
  SQL = await initSqlJs();
  
  ensureDir(path.dirname(DB_PATH));
  ensureDir(BACKUP_DIR);
  
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log('✅ Database loaded from:', DB_PATH);
  } else {
    db = new SQL.Database();
    console.log('✅ New database created at:', DB_PATH);
  }

  // Enable WAL mode for better performance
  db.run('PRAGMA journal_mode=WAL;');
  db.run('PRAGMA foreign_keys=ON;');

  createTables();
  seedDefaultData();
  saveDatabase();
}

function createTables() {
  // Users table (Admin, Technician, Receptionist)
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'technician', 'receptionist')),
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`);

  // Customers table
  db.run(`CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`);

  // Devices table
  db.run(`CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    customer_id TEXT REFERENCES customers(id),
    type TEXT NOT NULL,
    brand_model TEXT NOT NULL,
    serial TEXT,
    accessories TEXT,
    device_password TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  // Repairs table (tickets)
  db.run(`CREATE TABLE IF NOT EXISTS repairs (
    id TEXT PRIMARY KEY,
    ticket_number TEXT UNIQUE NOT NULL,
    customer_id TEXT REFERENCES customers(id),
    device_id TEXT REFERENCES devices(id),
    issue TEXT NOT NULL,
    tech_notes TEXT,
    status TEXT NOT NULL DEFAULT 'Received' CHECK(status IN ('Received','Repairing','Ready','Delivered','Cancelled')),
    technician_id TEXT REFERENCES users(id),
    technician_name TEXT,
    labor REAL DEFAULT 0,
    parts_cost REAL DEFAULT 0,
    discount REAL DEFAULT 0,
    total REAL DEFAULT 0,
    paid REAL DEFAULT 0,
    balance REAL DEFAULT 0,
    payment_method TEXT DEFAULT 'Cash',
    created_by TEXT REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`);

  // Payments table
  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    repair_id TEXT REFERENCES repairs(id),
    amount REAL NOT NULL,
    method TEXT NOT NULL DEFAULT 'Cash',
    received_by TEXT REFERENCES users(id),
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  // Inventory / Spare Parts table
  db.run(`CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    quantity INTEGER DEFAULT 0,
    unit_price REAL DEFAULT 0,
    reorder_level INTEGER DEFAULT 5,
    supplier TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`);

  // Repair Parts used (links repairs to inventory)
  db.run(`CREATE TABLE IF NOT EXISTS repair_parts (
    id TEXT PRIMARY KEY,
    repair_id TEXT REFERENCES repairs(id),
    inventory_id TEXT REFERENCES inventory(id),
    part_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price REAL DEFAULT 0,
    total_price REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  // Settings table
  db.run(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
  )`);

  // Employees table
  db.run(`CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    position TEXT DEFAULT 'Technician',
    salary REAL DEFAULT 0,
    hire_date TEXT,
    status TEXT DEFAULT 'Active',
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  // Attendance ⭐ (ZK Fingerprint ready)
  db.run(`CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    employee_id TEXT REFERENCES employees(id),
    date TEXT NOT NULL,
    check_in TEXT,
    check_out TEXT,
    status TEXT DEFAULT 'Present' CHECK(status IN ('Present','Late','Absent','On Leave')),
    zk_fingerprint_id TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  // Expenses table
  db.run(`CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT DEFAULT 'General',
    date TEXT DEFAULT (date('now')),
    created_by TEXT REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  // Audit Logs table
  db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    username TEXT,
    role TEXT,
    action TEXT NOT NULL,
    entity TEXT,
    entity_id TEXT,
    details TEXT,
    ip_address TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  console.log('✅ All tables created/verified');
}

function seedDefaultData() {
  // Check if admin user exists
  const adminCheck = db.exec("SELECT id FROM users WHERE role='admin' LIMIT 1");
  if (adminCheck.length === 0 || adminCheck[0].values.length === 0) {
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@Sakaria2026';
    const hash = bcrypt.hashSync(adminPassword, 12);
    db.run(`INSERT INTO users (id, username, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), 'admin', hash, 'Administrator', 'admin']);
    
    // Add technicians
    const techHash = bcrypt.hashSync('Tech@Sakaria123', 12);
    db.run(`INSERT OR IGNORE INTO users (id, username, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), 'sakaria', techHash, 'Sakaria', 'technician']);
    db.run(`INSERT OR IGNORE INTO users (id, username, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), 'cabdiraxmaan', techHash, 'Cabdiraxmaan', 'technician']);
    db.run(`INSERT OR IGNORE INTO users (id, username, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), 'sakaria_dheere', techHash, 'Sakaria Dheere', 'technician']);
    
    // Add receptionist
    const recepHash = bcrypt.hashSync('Recep@Sakaria123', 12);
    db.run(`INSERT OR IGNORE INTO users (id, username, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), 'receptionist', recepHash, 'Receptionist', 'receptionist']);

    console.log('✅ Default users seeded');
  }

  // Default settings
  const defaultSettings = [
    ['shop_name', 'Sakaria Repair Center'],
    ['shop_phone', '+252 61 1616691'],
    ['shop_address', 'Mogadishu, Somalia'],
    ['currency', 'USD'],
    ['ticket_prefix', 'SRM'],
    ['auto_backup', 'daily'],
  ];
  
  defaultSettings.forEach(([key, value]) => {
    db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`, [key, value]);
  });

  console.log('✅ Default settings seeded');
}

// ============================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}` 
      });
    }
    next();
  };
}

// ============================================================
// AUDIT LOG HELPER
// ============================================================
function auditLog(userId, username, role, action, entity, entityId, details, ip) {
  try {
    db.run(
      `INSERT INTO audit_logs (id, user_id, username, role, action, entity, entity_id, details, ip_address) VALUES (?,?,?,?,?,?,?,?,?)`,
      [uuidv4(), userId || null, username || 'system', role || 'system', action, entity || null, entityId || null, 
       typeof details === 'object' ? JSON.stringify(details) : details, ip || null]
    );
    saveDatabase();
  } catch (e) {
    console.error('Audit log error:', e.message);
  }
}

// Helper to get rows as objects
function dbAll(query, params = []) {
  try {
    const result = db.exec(query, params);
    if (!result.length) return [];
    const { columns, values } = result[0];
    return values.map(row => {
      const obj = {};
      columns.forEach((col, i) => { obj[col] = row[i]; });
      return obj;
    });
  } catch (e) {
    console.error('DB Query Error:', e.message, query);
    return [];
  }
}

function dbGet(query, params = []) {
  const rows = dbAll(query, params);
  return rows.length ? rows[0] : null;
}

function dbRun(query, params = []) {
  try {
    db.run(query, params);
    saveDatabase();
    return true;
  } catch (e) {
    console.error('DB Run Error:', e.message, query);
    throw e;
  }
}

// ============================================================
// AUTO TICKET NUMBER GENERATOR
// ============================================================
function generateTicketNumber() {
  const prefix = (() => {
    const s = dbGet("SELECT value FROM settings WHERE key='ticket_prefix'");
    return s ? s.value : 'SRM';
  })();
  
  const last = dbGet("SELECT ticket_number FROM repairs ORDER BY created_at DESC LIMIT 1");
  let nextNum = 1001;
  
  if (last) {
    const match = last.ticket_number.match(/(\d+)$/);
    if (match) nextNum = parseInt(match[1]) + 1;
  }
  
  return `${prefix}-${nextNum}`;
}

// ============================================================
// ROUTES: AUTH
// ============================================================
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = dbGet('SELECT * FROM users WHERE username=? AND is_active=1', [username.toLowerCase().trim()]);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    auditLog(user.id, user.username, user.role, 'LOGIN_FAILED', 'auth', null, 'Wrong password', req.ip);
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, fullName: user.full_name },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  auditLog(user.id, user.username, user.role, 'LOGIN', 'auth', null, 'Successful login', req.ip);

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      role: user.role
    }
  });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  const user = dbGet('SELECT id, username, full_name, role FROM users WHERE id=?', [req.user.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, username: user.username, fullName: user.full_name, role: user.role });
});

app.post('/api/auth/change-password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Both current and new password are required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }

  const user = dbGet('SELECT * FROM users WHERE id=?', [req.user.id]);
  const isValid = await bcrypt.compare(currentPassword, user.password_hash);
  
  if (!isValid) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  dbRun('UPDATE users SET password_hash=?, updated_at=datetime("now") WHERE id=?', [newHash, req.user.id]);
  
  auditLog(req.user.id, req.user.username, req.user.role, 'PASSWORD_CHANGED', 'users', req.user.id, null, req.ip);
  res.json({ message: 'Password changed successfully' });
});

// ============================================================
// ROUTES: TICKETS / REPAIRS
// ============================================================
app.get('/api/tickets', authenticate, (req, res) => {
  let query = `
    SELECT r.*, 
           c.name as customer_name, c.phone as customer_phone, c.email as customer_email,
           d.type as device_type, d.brand_model, d.serial, d.accessories, d.device_password
    FROM repairs r
    LEFT JOIN customers c ON r.customer_id = c.id
    LEFT JOIN devices d ON r.device_id = d.id
  `;
  
  // Technicians only see their own tickets
  const params = [];
  if (req.user.role === 'technician') {
    query += ' WHERE r.technician_id=?';
    params.push(req.user.id);
  }
  
  query += ' ORDER BY r.created_at DESC';
  
  const tickets = dbAll(query, params);
  
  // Format for frontend compatibility
  const formatted = tickets.map(t => ({
    id: t.ticket_number,
    dbId: t.id,
    customer: { name: t.customer_name, phone: t.customer_phone, email: t.customer_email || '' },
    device: { 
      type: t.device_type, brandModel: t.brand_model, serial: t.serial || '',
      accessories: t.accessories || '', password: t.device_password || ''
    },
    issue: t.issue,
    techNotes: t.tech_notes || '',
    status: t.status,
    technician: t.technician_name || '',
    pricing: {
      labor: t.labor, parts: t.parts_cost, discount: t.discount,
      total: t.total, paid: t.paid, balance: t.balance, method: t.payment_method
    },
    createdAt: t.created_at,
    updatedAt: t.updated_at
  }));

  res.json({ tickets: formatted, total: formatted.length });
});

app.post('/api/tickets', authenticate, requireRole('admin', 'receptionist'), (req, res) => {
  const { customer, device, issue, techNotes, status, technicianName, pricing } = req.body;
  
  if (!customer?.name || !customer?.phone || !device?.brandModel || !issue) {
    return res.status(400).json({ error: 'Customer name, phone, device, and issue are required' });
  }

  try {
    // Find or create customer
    let cust = dbGet('SELECT * FROM customers WHERE phone=?', [customer.phone.trim()]);
    if (!cust) {
      const custId = uuidv4();
      dbRun('INSERT INTO customers (id, name, phone, email) VALUES (?,?,?,?)',
        [custId, customer.name.trim(), customer.phone.trim(), customer.email || '']);
      cust = { id: custId };
    } else {
      dbRun('UPDATE customers SET name=?, email=?, updated_at=datetime("now") WHERE id=?',
        [customer.name.trim(), customer.email || cust.email, cust.id]);
    }

    // Create device record
    const deviceId = uuidv4();
    dbRun('INSERT INTO devices (id, customer_id, type, brand_model, serial, accessories, device_password) VALUES (?,?,?,?,?,?,?)',
      [deviceId, cust.id, device.type || 'Laptop', device.brandModel.trim(), 
       device.serial || '', device.accessories || '', device.password || '']);

    // Find technician user
    let technicianId = null;
    if (technicianName) {
      const tech = dbGet('SELECT id FROM users WHERE full_name=? AND role="technician"', [technicianName]);
      if (tech) technicianId = tech.id;
    }

    // Calculate pricing
    const labor = parseFloat(pricing?.labor) || 0;
    const partsCost = parseFloat(pricing?.parts) || 0;
    const discount = parseFloat(pricing?.discount) || 0;
    const total = Math.max(0, labor + partsCost - discount);
    const paid = parseFloat(pricing?.paid) || 0;
    const balance = Math.max(0, total - paid);

    // Generate ticket number
    const ticketNumber = generateTicketNumber();
    const repairId = uuidv4();

    dbRun(`INSERT INTO repairs 
      (id, ticket_number, customer_id, device_id, issue, tech_notes, status, technician_id, technician_name,
       labor, parts_cost, discount, total, paid, balance, payment_method, created_by)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [repairId, ticketNumber, cust.id, deviceId, issue.trim(), techNotes || '',
       status || 'Received', technicianId, technicianName || '',
       labor, partsCost, discount, total, paid, balance, pricing?.method || 'Cash', req.user.id]);

    // Record payment if any
    if (paid > 0) {
      dbRun('INSERT INTO payments (id, repair_id, amount, method, received_by) VALUES (?,?,?,?,?)',
        [uuidv4(), repairId, paid, pricing?.method || 'Cash', req.user.id]);
    }

    auditLog(req.user.id, req.user.username, req.user.role, 
      'CREATE_TICKET', 'repairs', repairId, { ticketNumber, customer: customer.name }, req.ip);

    res.status(201).json({ 
      message: 'Ticket created successfully', 
      ticketNumber,
      id: repairId 
    });
  } catch (e) {
    console.error('Create ticket error:', e);
    res.status(500).json({ error: 'Failed to create ticket: ' + e.message });
  }
});

app.put('/api/tickets/:ticketNumber', authenticate, (req, res) => {
  const { ticketNumber } = req.params;
  const repair = dbGet('SELECT * FROM repairs WHERE ticket_number=?', [ticketNumber]);
  
  if (!repair) return res.status(404).json({ error: 'Ticket not found' });

  // Role check: Technicians can only update their own tickets (status + tech notes)
  if (req.user.role === 'technician' && repair.technician_id !== req.user.id) {
    return res.status(403).json({ error: 'You can only update tickets assigned to you' });
  }

  const { customer, device, issue, techNotes, status, technicianName, pricing } = req.body;
  
  try {
    // Update customer if admin/receptionist
    if (customer && req.user.role !== 'technician') {
      dbRun('UPDATE customers SET name=?, phone=?, email=?, updated_at=datetime("now") WHERE id=?',
        [customer.name, customer.phone, customer.email || '', repair.customer_id]);
    }

    // Update device if admin/receptionist  
    if (device && req.user.role !== 'technician') {
      dbRun('UPDATE devices SET type=?, brand_model=?, serial=?, accessories=?, device_password=? WHERE id=?',
        [device.type, device.brandModel, device.serial || '', device.accessories || '', device.password || '', repair.device_id]);
    }

    // Calculate pricing
    const labor = parseFloat(pricing?.labor ?? repair.labor);
    const partsCost = parseFloat(pricing?.parts ?? repair.parts_cost);
    const discount = parseFloat(pricing?.discount ?? repair.discount);
    const total = Math.max(0, labor + partsCost - discount);
    const newPaid = parseFloat(pricing?.paid ?? repair.paid);
    const balance = Math.max(0, total - newPaid);

    // Record additional payment
    if (newPaid > repair.paid) {
      const additionalPayment = newPaid - repair.paid;
      dbRun('INSERT INTO payments (id, repair_id, amount, method, received_by) VALUES (?,?,?,?,?)',
        [uuidv4(), repair.id, additionalPayment, pricing?.method || 'Cash', req.user.id]);
    }

    let technicianId = repair.technician_id;
    if (technicianName && req.user.role !== 'technician') {
      const tech = dbGet('SELECT id FROM users WHERE full_name=? AND role="technician"', [technicianName]);
      if (tech) technicianId = tech.id;
    }

    dbRun(`UPDATE repairs SET 
      issue=?, tech_notes=?, status=?, technician_id=?, technician_name=?,
      labor=?, parts_cost=?, discount=?, total=?, paid=?, balance=?, payment_method=?,
      updated_at=datetime('now')
      WHERE ticket_number=?`,
      [issue || repair.issue, techNotes ?? repair.tech_notes, 
       status || repair.status, technicianId, technicianName || repair.technician_name,
       labor, partsCost, discount, total, newPaid, balance, pricing?.method || repair.payment_method,
       ticketNumber]);

    auditLog(req.user.id, req.user.username, req.user.role,
      'UPDATE_TICKET', 'repairs', repair.id, { ticketNumber, status: status || repair.status }, req.ip);

    res.json({ message: 'Ticket updated successfully' });
  } catch (e) {
    console.error('Update ticket error:', e);
    res.status(500).json({ error: 'Failed to update ticket: ' + e.message });
  }
});

app.delete('/api/tickets/:ticketNumber', authenticate, requireRole('admin'), (req, res) => {
  const { ticketNumber } = req.params;
  const repair = dbGet('SELECT * FROM repairs WHERE ticket_number=?', [ticketNumber]);
  
  if (!repair) return res.status(404).json({ error: 'Ticket not found' });

  try {
    dbRun('DELETE FROM payments WHERE repair_id=?', [repair.id]);
    dbRun('DELETE FROM repair_parts WHERE repair_id=?', [repair.id]);
    dbRun('DELETE FROM repairs WHERE ticket_number=?', [ticketNumber]);
    
    auditLog(req.user.id, req.user.username, req.user.role,
      'DELETE_TICKET', 'repairs', repair.id, { ticketNumber }, req.ip);

    res.json({ message: 'Ticket deleted successfully' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete ticket: ' + e.message });
  }
});

// ============================================================
// ROUTES: CUSTOMERS
// ============================================================
app.get('/api/customers', authenticate, (req, res) => {
  const customers = dbAll(`
    SELECT c.*, 
      COUNT(r.id) as total_repairs,
      COALESCE(SUM(r.paid), 0) as total_paid,
      COALESCE(SUM(r.balance), 0) as total_balance
    FROM customers c
    LEFT JOIN repairs r ON c.id = r.customer_id
    GROUP BY c.id
    ORDER BY c.name
  `);
  res.json({ customers, total: customers.length });
});

// ============================================================
// ROUTES: USERS (Admin only)
// ============================================================
app.get('/api/users', authenticate, requireRole('admin'), (req, res) => {
  const users = dbAll('SELECT id, username, full_name, role, is_active, created_at FROM users ORDER BY role, full_name');
  res.json({ users });
});

app.post('/api/users', authenticate, requireRole('admin'), async (req, res) => {
  const { username, password, fullName, role } = req.body;
  
  if (!username || !password || !fullName || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (!['admin', 'technician', 'receptionist'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const existing = dbGet('SELECT id FROM users WHERE username=?', [username.toLowerCase()]);
    if (existing) return res.status(409).json({ error: 'Username already exists' });

    const hash = await bcrypt.hash(password, 12);
    const id = uuidv4();
    
    dbRun('INSERT INTO users (id, username, password_hash, full_name, role) VALUES (?,?,?,?,?)',
      [id, username.toLowerCase().trim(), hash, fullName.trim(), role]);

    auditLog(req.user.id, req.user.username, req.user.role, 
      'CREATE_USER', 'users', id, { username, role }, req.ip);

    res.status(201).json({ message: 'User created successfully', id });
  } catch (e) {
    res.status(500).json({ error: 'Failed to create user: ' + e.message });
  }
});

app.put('/api/users/:id', authenticate, requireRole('admin'), async (req, res) => {
  const { fullName, role, isActive, password } = req.body;
  const { id } = req.params;
  
  const user = dbGet('SELECT * FROM users WHERE id=?', [id]);
  if (!user) return res.status(404).json({ error: 'User not found' });

  try {
    if (password) {
      if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
      const hash = await bcrypt.hash(password, 12);
      dbRun('UPDATE users SET password_hash=?, updated_at=datetime("now") WHERE id=?', [hash, id]);
    }

    dbRun(`UPDATE users SET full_name=?, role=?, is_active=?, updated_at=datetime('now') WHERE id=?`,
      [fullName || user.full_name, role || user.role, isActive !== undefined ? (isActive ? 1 : 0) : user.is_active, id]);

    auditLog(req.user.id, req.user.username, req.user.role, 
      'UPDATE_USER', 'users', id, { fullName, role }, req.ip);

    res.json({ message: 'User updated successfully' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update user: ' + e.message });
  }
});

app.delete('/api/users/:id', authenticate, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  
  if (id === req.user.id) {
    return res.status(400).json({ error: 'You cannot delete your own account' });
  }

  const user = dbGet('SELECT * FROM users WHERE id=?', [id]);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Soft delete - just deactivate
  dbRun('UPDATE users SET is_active=0, updated_at=datetime("now") WHERE id=?', [id]);
  
  auditLog(req.user.id, req.user.username, req.user.role,
    'DEACTIVATE_USER', 'users', id, { username: user.username }, req.ip);

  res.json({ message: 'User deactivated successfully' });
});

// ============================================================
// ROUTES: REPORTS
// ============================================================
app.get('/api/reports', authenticate, requireRole('admin', 'receptionist'), (req, res) => {
  const { period } = req.query; // daily, monthly, yearly, all
  
  let dateFilter = '';
  if (period === 'daily') dateFilter = "AND date(r.created_at)=date('now')";
  else if (period === 'monthly') dateFilter = "AND strftime('%Y-%m', r.created_at)=strftime('%Y-%m', 'now')";
  else if (period === 'yearly') dateFilter = "AND strftime('%Y', r.created_at)=strftime('%Y', 'now')";

  const summary = dbGet(`
    SELECT 
      COUNT(*) as total_tickets,
      SUM(CASE WHEN status='Received' THEN 1 ELSE 0 END) as received,
      SUM(CASE WHEN status='Repairing' THEN 1 ELSE 0 END) as repairing,
      SUM(CASE WHEN status='Ready' THEN 1 ELSE 0 END) as ready,
      SUM(CASE WHEN status='Delivered' THEN 1 ELSE 0 END) as delivered,
      COALESCE(SUM(total), 0) as total_revenue,
      COALESCE(SUM(paid), 0) as total_paid,
      COALESCE(SUM(balance), 0) as total_pending,
      COALESCE(SUM(parts_cost), 0) as total_parts_cost
    FROM repairs r WHERE 1=1 ${dateFilter}
  `);

  const byTechnician = dbAll(`
    SELECT technician_name, 
      COUNT(*) as tickets, 
      SUM(paid) as revenue,
      SUM(CASE WHEN status='Delivered' THEN 1 ELSE 0 END) as completed
    FROM repairs r WHERE technician_name != '' ${dateFilter}
    GROUP BY technician_name
    ORDER BY revenue DESC
  `);

  const dailyRevenue = dbAll(`
    SELECT date(created_at) as date, 
      COUNT(*) as tickets, 
      SUM(paid) as revenue
    FROM repairs WHERE 1=1 ${period === 'monthly' ? "AND strftime('%Y-%m', created_at)=strftime('%Y-%m', 'now')" : ''}
    GROUP BY date(created_at)
    ORDER BY date DESC
    LIMIT 30
  `);

  res.json({ summary, byTechnician, dailyRevenue, period: period || 'all' });
});

// ============================================================
// ROUTES: AUDIT LOGS (Admin only)
// ============================================================
app.get('/api/audit-logs', authenticate, requireRole('admin'), (req, res) => {
  const { limit = 100, offset = 0 } = req.query;
  const logs = dbAll(`
    SELECT * FROM audit_logs 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `, [parseInt(limit), parseInt(offset)]);
  
  const total = dbGet('SELECT COUNT(*) as count FROM audit_logs');
  res.json({ logs, total: total?.count || 0 });
});

// ============================================================
// ROUTES: SETTINGS (Admin only)
// ============================================================
app.get('/api/settings', authenticate, (req, res) => {
  const rows = dbAll('SELECT key, value FROM settings');
  const settings = {};
  rows.forEach(r => { settings[r.key] = r.value; });
  res.json({ settings });
});

app.put('/api/settings', authenticate, requireRole('admin'), (req, res) => {
  const { settings } = req.body;
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ error: 'Settings object required' });
  }

  Object.entries(settings).forEach(([key, value]) => {
    dbRun(`INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))`,
      [key, String(value)]);
  });

  auditLog(req.user.id, req.user.username, req.user.role, 
    'UPDATE_SETTINGS', 'settings', null, Object.keys(settings), req.ip);
  
  res.json({ message: 'Settings updated successfully' });
});

// ============================================================
// ROUTES: BACKUP & RESTORE (Admin only)
// ============================================================
app.get('/api/backup/list', authenticate, requireRole('admin'), (req, res) => {
  ensureDir(BACKUP_DIR);
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith('.db'))
    .map(f => {
      const stat = fs.statSync(path.join(BACKUP_DIR, f));
      return { name: f, size: stat.size, createdAt: stat.mtime.toISOString() };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json({ backups: files });
});

app.post('/api/backup/create', authenticate, requireRole('admin'), (req, res) => {
  try {
    ensureDir(BACKUP_DIR);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupName = `SAKARIA_REPAIR_BACKUP_${timestamp}.db`;
    const backupPath = path.join(BACKUP_DIR, backupName);
    
    const data = db.export();
    fs.writeFileSync(backupPath, Buffer.from(data));

    auditLog(req.user.id, req.user.username, req.user.role,
      'BACKUP_CREATED', 'database', null, { backupName }, req.ip);

    res.json({ message: 'Backup created successfully', backupName });
  } catch (e) {
    res.status(500).json({ error: 'Backup failed: ' + e.message });
  }
});

app.post('/api/backup/restore', authenticate, requireRole('admin'), (req, res) => {
  const { backupName } = req.body;
  if (!backupName) return res.status(400).json({ error: 'Backup name is required' });

  const backupPath = path.join(BACKUP_DIR, backupName);
  if (!fs.existsSync(backupPath)) {
    return res.status(404).json({ error: 'Backup file not found' });
  }

  try {
    // Create current backup before restoring
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const safeguardPath = path.join(BACKUP_DIR, `BEFORE_RESTORE_${timestamp}.db`);
    fs.writeFileSync(safeguardPath, Buffer.from(db.export()));

    // Restore
    const fileBuffer = fs.readFileSync(backupPath);
    db = new SQL.Database(fileBuffer);
    saveDatabase();

    auditLog(req.user.id, req.user.username, req.user.role,
      'BACKUP_RESTORED', 'database', null, { backupName }, req.ip);

    res.json({ message: `Database restored from ${backupName}. Server restart recommended.` });
  } catch (e) {
    res.status(500).json({ error: 'Restore failed: ' + e.message });
  }
});


// ============================================================
// ROUTES: EMPLOYEES (Admin only)
// ============================================================
app.get('/api/employees', authenticate, (req, res) => {
  const employees = dbAll("SELECT * FROM employees ORDER BY name ASC");
  res.json({ employees });
});

app.post('/api/employees', authenticate, requireRole('admin'), (req, res) => {
  const { name, phone, position, salary, hire_date } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });
  const id = uuidv4();
  dbRun(`INSERT INTO employees (id, name, phone, position, salary, hire_date) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, name.trim(), phone.trim(), position || 'Technician', salary || 0, hire_date || new Date().toISOString().slice(0,10)]);
  auditLog(req.user.id, req.user.username, req.user.role, 'CREATE_EMPLOYEE', 'employee', id, { name }, req.ip);
  res.status(201).json({ message: 'Employee added', id });
});

app.put('/api/employees/:id', authenticate, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const { name, phone, position, salary, status } = req.body;
  dbRun(`UPDATE employees SET name=?, phone=?, position=?, salary=?, status=? WHERE id=?`,
    [name, phone, position, salary, status || 'Active', id]);
  auditLog(req.user.id, req.user.username, req.user.role, 'UPDATE_EMPLOYEE', 'employee', id, { name }, req.ip);
  res.json({ message: 'Employee updated' });
});

app.delete('/api/employees/:id', authenticate, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  dbRun("DELETE FROM employees WHERE id=?", [id]);
  auditLog(req.user.id, req.user.username, req.user.role, 'DELETE_EMPLOYEE', 'employee', id, {}, req.ip);
  res.json({ message: 'Employee deleted' });
});

// ============================================================
// ROUTES: ATTENDANCE ⭐ (ZKTeco Fingerprint Ready)
// ============================================================
app.get('/api/attendance', authenticate, (req, res) => {
  const { date, month } = req.query;
  let query = `SELECT a.*, e.name as employee_name, e.position FROM attendance a JOIN employees e ON a.employee_id = e.id`;
  const params = [];
  if (date) { query += ' WHERE a.date = ?'; params.push(date); }
  else if (month) { query += ` WHERE strftime('%Y-%m', a.date) = ?`; params.push(month); }
  else { query += ' WHERE a.date = ?'; params.push(new Date().toISOString().slice(0,10)); }
  query += ' ORDER BY e.name ASC';
  const records = dbAll(query, params);
  res.json({ attendance: records });
});

app.post('/api/attendance', authenticate, (req, res) => {
  const { employee_id, date, check_in, check_out, status, zk_fingerprint_id, notes } = req.body;
  if (!employee_id) return res.status(400).json({ error: 'Employee ID is required' });
  const id = uuidv4();
  const recDate = date || new Date().toISOString().slice(0,10);
  const nowTime = new Date().toLocaleTimeString();
  dbRun(`INSERT INTO attendance (id, employee_id, date, check_in, check_out, status, zk_fingerprint_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, employee_id, recDate, check_in || nowTime, check_out || null, status || 'Present', zk_fingerprint_id || null, notes || '']);
  auditLog(req.user.id, req.user.username, req.user.role, 'RECORD_ATTENDANCE', 'attendance', id, { employee_id, status }, req.ip);
  res.status(201).json({ message: 'Attendance recorded', id });
});

app.put('/api/attendance/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { check_in, check_out, status, notes } = req.body;
  dbRun(`UPDATE attendance SET check_in=?, check_out=?, status=?, notes=? WHERE id=?`,
    [check_in, check_out, status, notes, id]);
  res.json({ message: 'Attendance updated' });
});

// ============================================================
// ROUTES: EXPENSES
// ============================================================
app.get('/api/expenses', authenticate, (req, res) => {
  const { month } = req.query;
  let query = `SELECT ex.*, u.full_name as created_by_name FROM expenses ex LEFT JOIN users u ON ex.created_by = u.id`;
  const params = [];
  if (month) { query += ` WHERE strftime('%Y-%m', ex.date) = ?`; params.push(month); }
  query += ' ORDER BY ex.date DESC';
  const expenses = dbAll(query, params);
  res.json({ expenses });
});

app.post('/api/expenses', authenticate, requireRole('admin', 'receptionist'), (req, res) => {
  const { description, amount, category, date } = req.body;
  if (!description || !amount) return res.status(400).json({ error: 'Description and amount required' });
  const id = uuidv4();
  dbRun(`INSERT INTO expenses (id, description, amount, category, date, created_by) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, description.trim(), parseFloat(amount), category || 'General', date || new Date().toISOString().slice(0,10), req.user.id]);
  auditLog(req.user.id, req.user.username, req.user.role, 'CREATE_EXPENSE', 'expense', id, { description, amount }, req.ip);
  res.status(201).json({ message: 'Expense added', id });
});

app.delete('/api/expenses/:id', authenticate, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  dbRun("DELETE FROM expenses WHERE id=?", [id]);
  auditLog(req.user.id, req.user.username, req.user.role, 'DELETE_EXPENSE', 'expense', id, {}, req.ip);
  res.json({ message: 'Expense deleted' });
});

// ============================================================
// ROUTES: FINANCIAL REPORTS & PROFIT SUMMARY
// ============================================================
app.get('/api/reports/summary', authenticate, (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = new Date().toISOString().slice(0, 7);

  const dailyRev = dbAll(`SELECT SUM(paid) as sum FROM repairs WHERE DATE(created_at) = ?`, [today]);
  const dailyRevenue = dailyRev[0]?.sum || 0;

  const monthRev = dbAll(`SELECT SUM(paid) as sum FROM repairs WHERE strftime('%Y-%m', created_at) = ?`, [thisMonth]);
  const monthlyRevenue = monthRev[0]?.sum || 0;

  const completed = dbAll(`SELECT COUNT(*) as count FROM repairs WHERE status IN ('Ready', 'Delivered')`);
  const repairsCompleted = completed[0]?.count || 0;

  const unpaid = dbAll(`SELECT COUNT(*) as count, SUM(balance) as sum FROM repairs WHERE balance > 0`);
  const unpaidCount = unpaid[0]?.count || 0;
  const unpaidSum = unpaid[0]?.sum || 0;

  const monthExp = dbAll(`SELECT SUM(amount) as sum FROM expenses WHERE strftime('%Y-%m', date) = ?`, [thisMonth]);
  const monthlyExpenses = monthExp[0]?.sum || 0;

  const monthParts = dbAll(`SELECT SUM(parts_cost) as sum FROM repairs WHERE strftime('%Y-%m', created_at) = ?`, [thisMonth]);
  const monthlyPartsCost = monthParts[0]?.sum || 0;

  const netProfit = monthlyRevenue - monthlyExpenses - monthlyPartsCost;

  const invVal = dbAll(`SELECT SUM(quantity * unit_price) as sum FROM inventory`);
  const inventoryValue = invVal[0]?.sum || 0;

  const totalRepairs = dbAll(`SELECT COUNT(*) as count FROM repairs`);
  const allRepairs = totalRepairs[0]?.count || 0;

  res.json({
    today, thisMonth,
    dailyRevenue, monthlyRevenue,
    repairsCompleted, allRepairs,
    unpaidCount, unpaidSum,
    monthlyExpenses, monthlyPartsCost, netProfit,
    inventoryValue
  });
});

// ============================================================
// ROUTES: RESET (Admin only - DANGEROUS)
// ============================================================
app.post('/api/reset', authenticate, requireRole('admin'), (req, res) => {
  const { confirmText } = req.body;
  
  // Double confirmation required
  if (confirmText !== 'RESET_ALL_DATA') {
    return res.status(400).json({ 
      error: 'To reset, send confirmText: "RESET_ALL_DATA"' 
    });
  }

  try {
    // Backup before reset
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupPath = path.join(BACKUP_DIR, `BEFORE_RESET_${timestamp}.db`);
    ensureDir(BACKUP_DIR);
    fs.writeFileSync(backupPath, Buffer.from(db.export()));

    // Delete all ticket data (keep users & settings)
    dbRun('DELETE FROM payments');
    dbRun('DELETE FROM repair_parts');
    dbRun('DELETE FROM repairs');
    dbRun('DELETE FROM devices');
    dbRun('DELETE FROM customers');
    dbRun('DELETE FROM audit_logs');

    auditLog(req.user.id, req.user.username, req.user.role,
      'SYSTEM_RESET', 'database', null, { backupCreated: backupPath }, req.ip);

    res.json({ message: 'System reset complete. Backup saved to: ' + path.basename(backupPath) });
  } catch (e) {
    res.status(500).json({ error: 'Reset failed: ' + e.message });
  }
});

// ============================================================
// AUTOMATIC DAILY BACKUP
// ============================================================
function scheduleAutoBackup() {
  const INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  
  const doBackup = () => {
    try {
      ensureDir(BACKUP_DIR);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const backupName = `AUTO_DAILY_${timestamp}.db`;
      fs.writeFileSync(path.join(BACKUP_DIR, backupName), Buffer.from(db.export()));
      
      // Keep only last 7 daily backups
      const autoBackups = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.startsWith('AUTO_DAILY_'))
        .sort()
        .reverse();
      autoBackups.slice(7).forEach(f => {
        fs.unlinkSync(path.join(BACKUP_DIR, f));
      });
      
      console.log('✅ Auto backup created:', backupName);
    } catch (e) {
      console.error('Auto backup failed:', e.message);
    }
  };

  // Do first backup after 1 hour, then every 24 hours
  setTimeout(() => {
    doBackup();
    setInterval(doBackup, INTERVAL);
  }, 60 * 60 * 1000);
  
  console.log('✅ Auto-backup scheduler started (every 24h)');
}

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    database: db ? 'connected' : 'disconnected'
  });
});

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================================
// START SERVER
// ============================================================
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log('\n========================================');
    console.log('🔧 SAKARIA REPAIR MANAGER - Backend API');
    console.log('========================================');
    console.log(`🚀 Server running on: http://localhost:${PORT}`);
    console.log(`📦 Database: ${DB_PATH}`);
    console.log(`💾 Backups: ${BACKUP_DIR}`);
    console.log('');
    console.log('👤 Default Login Credentials:');
    console.log('   Admin:        admin / Admin@Sakaria2026');
    console.log('   Technician:   sakaria / Tech@Sakaria123');
    console.log('   Receptionist: receptionist / Recep@Sakaria123');
    console.log('');
    console.log('⚠️  IMPORTANT: Change default passwords after first login!');
    console.log('========================================\n');
    
    scheduleAutoBackup();
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
