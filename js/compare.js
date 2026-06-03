const API = 'http://localhost:3000/api';

let selectedPlans = new Set();
let allPlans = [];

async function init() {
  try {
    allPlans = await fetch('/api/plans?category=fibre').then(r => r.json());
  } catch {
    allPlans = [
      { id:1, name:'PlanPilih Lite', speed:'100Mbps', price:89, features:'Free router. Unlimited data.', highlighted:0 },
      { id:2, name:'PlanPilih Advance', speed:'300Mbps', price:139, features:'Free router + Mesh WiFi.', highlighted:0 },
      { id:3, name:'PlanPilih Pro', speed:'800Mbps', price:249, features:'Free router + Mesh. 600Mbps upload.', highlighted:0 },
      { id:4, name:'PlanPilih Ultimate', speed:'2Gbps', price:379, features:'Free router + Mesh. 1Gbps upload.', highlighted:1 },
    ];
  }
  renderCards();
}

function renderCards() {
  const container = document.getElementById('plan-selector');
  container.innerHTML = allPlans.map((p) => {
    const sel = selectedPlans.has(p.id);
    return `
      <div class="col-md-6 col-lg-3">
        <div class="card plan-check-card h-100 ${sel ? 'selected' : ''}" onclick="togglePlan(${p.id})">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <h6 class="fw-bold mb-0" style="color:var(--brand-blue);">${p.name}</h6>
              <div class="check-indicator">&#10003;</div>
            </div>
            <p class="text-muted small mb-2">${p.speed}</p>
            <h4 class="fw-bold mb-1" style="color:var(--brand-red);">RM${p.price}</h4>
            <p class="text-muted small">/month</p>
            <p class="text-muted small mt-2">${p.features}</p>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const btn = document.getElementById('compare-btn');
  btn.disabled = selectedPlans.size < 2;
}

function togglePlan(id) {
  if (selectedPlans.has(id)) {
    selectedPlans.delete(id);
  } else {
    if (selectedPlans.size >= 4) return;
    selectedPlans.add(id);
  }
  renderCards();
}

function compare() {
  if (selectedPlans.size < 2) return;

  const selected = allPlans.filter(p => selectedPlans.has(p.id));

  // Calculate metrics
  const pricePerMbps = selected.map(p => {
    const mbps = parseInt(p.speed);
    return { id: p.id, value: mbps ? p.price / mbps : Infinity };
  });

  const cheapest = selected.reduce((a, b) => a.price < b.price ? a : b);
  const fastest = selected.reduce((a, b) => parseInt(a.speed) > parseInt(b.speed) ? a : b);
  const bestValue = pricePerMbps.reduce((a, b) => a.value < b.value ? a : b);

  // Upload speeds
  const uploads = {
    'PlanPilih Lite': '50Mbps',
    'PlanPilih Advance': '100Mbps',
    'PlanPilih Pro': '600Mbps',
    'PlanPilih Ultimate': '1Gbps',
  };

  // Build table head
  const head = document.getElementById('comparison-head');
  head.innerHTML = `
    <tr>
      <th>Feature</th>
      ${selected.map(p => `
        <th class="${p.id === cheapest.id ? 'cheapest-col' : ''} ${p.id === fastest.id ? 'fastest-col' : ''}">
          ${p.name}<br>
          <small style="font-weight:400; opacity:0.85;">${p.speed}</small>
        </th>
      `).join('')}
    </tr>
  `;

  // Build table body
  const rows = [
    { label: 'Monthly Price', get: p => `RM${p.price}`, highlight: cheapest.id, type: 'price' },
    { label: 'Speed', get: p => p.speed, highlight: fastest.id, type: 'speed' },
    { label: 'Price per Mbps', get: p => {
      const mbps = parseInt(p.speed);
      return mbps ? `RM${(p.price / mbps).toFixed(2)}` : '--';
    }, highlight: bestValue.id, type: 'value' },
    { label: 'Upload Speed', get: p => uploads[p.name] || '--', highlight: null, type: null },
    { label: 'Free Router', get: () => 'Included', highlight: null, type: null },
    { label: 'Mesh WiFi', get: p => p.name.includes('Lite') ? 'No' : 'Included', highlight: null, type: null },
    { label: 'Contract', get: () => '24 months', highlight: null, type: null },
  ];

  const body = document.getElementById('comparison-body');
  body.innerHTML = rows.map(row => `
    <tr class="${row.type === 'value' ? 'best-value' : ''}">
      <td class="fw-semibold">${row.label}</td>
      ${selected.map(p => `
        <td class="${p.id === cheapest.id && !row.type ? 'cheapest-col' : ''} ${p.id === fastest.id && !row.type ? 'fastest-col' : ''}">
          ${row.get(p)}
          ${row.highlight === p.id && row.type === 'price' ? ' <span class="badge bg-success">Cheapest</span>' : ''}
          ${row.highlight === p.id && row.type === 'speed' ? ' <span class="badge" style="background:var(--brand-blue);">Fastest</span>' : ''}
          ${row.highlight === p.id && row.type === 'value' ? ' <span class="badge bg-success">Best Value</span>' : ''}
        </td>
      `).join('')}
    </tr>
  `).join('');

  document.getElementById('comparison-section').style.display = 'block';
  document.getElementById('comparison-section').scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('compare-btn').addEventListener('click', compare);
init();
