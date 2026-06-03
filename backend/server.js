const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

const plans = [
  { id:1, name:'PlanPilih Lite', speed:'100Mbps', price:89, category:'fibre', features:'Free router. Unlimited data.', highlighted:0, sort_order:1 },
  { id:2, name:'PlanPilih Advance', speed:'300Mbps', price:139, category:'fibre', features:'Free router + Mesh WiFi.', highlighted:0, sort_order:2 },
  { id:3, name:'PlanPilih Pro', speed:'800Mbps', price:249, category:'fibre', features:'Free router + Mesh. 600Mbps upload.', highlighted:0, sort_order:3 },
  { id:4, name:'PlanPilih Ultimate', speed:'2Gbps', price:379, category:'fibre', features:'Free router + Mesh. 1Gbps upload.', highlighted:1, sort_order:4 },
  { id:5, name:'Postpaid 39', speed:'30GB 5G', price:39, category:'mobile', features:'30GB 5G data. Unlimited calls. Free 5G access.', highlighted:0, sort_order:1 },
  { id:6, name:'Postpaid 59', speed:'60GB 5G', price:59, category:'mobile', features:'60GB 5G data. Unlimited calls. Free 5G access + hotspot.', highlighted:1, sort_order:2 },
];

const coverage = [
  { postcode:'50000', area:'Kuala Lumpur City Centre', state:'Kuala Lumpur', fibre_available:1, max_speed:'2Gbps' },
  { postcode:'50450', area:'KLCC', state:'Kuala Lumpur', fibre_available:1, max_speed:'2Gbps' },
  { postcode:'40150', area:'Shah Alam', state:'Selangor', fibre_available:1, max_speed:'800Mbps' },
  { postcode:'46000', area:'Petaling Jaya', state:'Selangor', fibre_available:1, max_speed:'2Gbps' },
  { postcode:'47500', area:'Subang Jaya', state:'Selangor', fibre_available:1, max_speed:'2Gbps' },
  { postcode:'43000', area:'Kajang', state:'Selangor', fibre_available:1, max_speed:'800Mbps' },
  { postcode:'80300', area:'Johor Bahru', state:'Johor', fibre_available:1, max_speed:'800Mbps' },
  { postcode:'11700', area:'Gelugor', state:'Penang', fibre_available:1, max_speed:'2Gbps' },
  { postcode:'31400', area:'Ipoh', state:'Perak', fibre_available:1, max_speed:'800Mbps' },
  { postcode:'93050', area:'Kuching', state:'Sarawak', fibre_available:0, max_speed:null },
];

const enquiries = [];

app.get('/api/plans', (req, res) => {
  const category = req.query.category || 'fibre';
  res.json(plans.filter(p => p.category === category).sort((a,b) => a.sort_order - b.sort_order));
});

app.get('/api/coverage/:postcode', (req, res) => {
  const result = coverage.find(c => c.postcode === req.params.postcode);
  if (result) {
    res.json(result);
  } else {
    res.json({ postcode: req.params.postcode, area:'Unknown', state:'Unknown', fibre_available:0, max_speed:null });
  }
});

app.post('/api/contact', (req, res) => {
  const { name, email, phone, topic, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }
  const enquiry = { id: enquiries.length + 1, name, email, phone: phone || '', topic: topic || '', message, created_at: new Date().toISOString() };
  enquiries.push(enquiry);

  try {
    const { sendAdminNotification, sendAutoReply } = require('./mailer');
    Promise.allSettled([sendAdminNotification(enquiry), sendAutoReply(enquiry)]);
  } catch (e) {
    console.log('Mailer not configured. Email skipped.');
  }

  res.json({ success: true, id: enquiry.id });
});

app.get('/api/enquiries', (req, res) => {
  res.json(enquiries.slice().reverse());
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log('PlanPilih API running at http://localhost:' + PORT);
    console.log('Frontend: http://localhost:' + PORT + '/index.html');
  });
}

module.exports = app;
