const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const { sendAdminNotification, sendAutoReply } = require('./mailer');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Serve frontend files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// Initialize SQLite
const db = new Database(path.join(__dirname, 'unifi.db'));

db.exec(`
  CREATE TABLE plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    speed TEXT NOT NULL,
    price INTEGER NOT NULL,
    category TEXT NOT NULL,
    features TEXT,
    highlighted INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE coverage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    postcode TEXT NOT NULL,
    area TEXT NOT NULL,
    state TEXT NOT NULL,
    fibre_available INTEGER DEFAULT 0,
    max_speed TEXT
  );

  CREATE TABLE enquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    topic TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed data
const seedPlans = db.prepare('INSERT INTO plans (name, speed, price, category, features, highlighted, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)');

const fibrePlans = [
  ['PlanPilih Lite', '100Mbps', 89, 'fibre', 'Free router. Unlimited data.', 0, 1],
  ['PlanPilih Advance', '300Mbps', 139, 'fibre', 'Free router + Mesh WiFi.', 0, 2],
  ['PlanPilih Pro', '800Mbps', 249, 'fibre', 'Free router + Mesh. 600Mbps upload.', 0, 3],
  ['PlanPilih Ultimate', '2Gbps', 379, 'fibre', 'Free router + Mesh. 1Gbps upload.', 1, 4],
];

const mobilePlans = [
  ['Postpaid 39', '30GB 5G', 39, 'mobile', '30GB 5G data. Unlimited calls. Free 5G access.', 0, 1],
  ['Postpaid 59', '60GB 5G', 59, 'mobile', '60GB 5G data. Unlimited calls. Free 5G access + hotspot.', 1, 2],
];

const seedCoverage = db.prepare('INSERT INTO coverage (postcode, area, state, fibre_available, max_speed) VALUES (?, ?, ?, ?, ?)');

const coverageData = [
  ['50000', 'Kuala Lumpur City Centre', 'Kuala Lumpur', 1, '2Gbps'],
  ['50450', 'KLCC', 'Kuala Lumpur', 1, '2Gbps'],
  ['40150', 'Shah Alam', 'Selangor', 1, '800Mbps'],
  ['46000', 'Petaling Jaya', 'Selangor', 1, '2Gbps'],
  ['47500', 'Subang Jaya', 'Selangor', 1, '2Gbps'],
  ['43000', 'Kajang', 'Selangor', 1, '800Mbps'],
  ['80300', 'Johor Bahru', 'Johor', 1, '800Mbps'],
  ['11700', 'Gelugor', 'Penang', 1, '2Gbps'],
  ['31400', 'Ipoh', 'Perak', 1, '800Mbps'],
  ['93050', 'Kuching', 'Sarawak', 0, null],
];

const insertAll = db.transaction(() => {
  for (const p of fibrePlans) seedPlans.run(...p);
  for (const p of mobilePlans) seedPlans.run(...p);
  for (const c of coverageData) seedCoverage.run(...c);
});

insertAll();

// API Routes

// Get plans by category
app.get('/api/plans', (req, res) => {
  const category = req.query.category || 'fibre';
  const plans = db.prepare('SELECT * FROM plans WHERE category = ? ORDER BY sort_order').all(category);
  res.json(plans);
});

// Coverage check
app.get('/api/coverage/:postcode', (req, res) => {
  const { postcode } = req.params;
  const result = db.prepare('SELECT * FROM coverage WHERE postcode = ?').get(postcode);
  if (result) {
    res.json(result);
  } else {
    res.json({ postcode, area: 'Unknown', state: 'Unknown', fibre_available: 0, max_speed: null });
  }
});

// Submit contact enquiry
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, topic, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }
  const result = db.prepare(
    'INSERT INTO enquiries (name, email, phone, topic, message) VALUES (?, ?, ?, ?, ?)'
  ).run(name, email, phone || '', topic || '', message);

  const enquiry = { id: result.lastInsertRowid, name, email, phone, topic, message };

  Promise.allSettled([
    sendAdminNotification(enquiry),
    sendAutoReply(enquiry),
  ]);

  res.json({ success: true, id: result.lastInsertRowid });
});

// GET enquiries (for testing)
app.get('/api/enquiries', (req, res) => {
  const enquiries = db.prepare('SELECT * FROM enquiries ORDER BY created_at DESC').all();
  res.json(enquiries);
});

app.listen(PORT, () => {
  console.log(`PlanPilih API running at http://localhost:${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}/index.html`);
});
