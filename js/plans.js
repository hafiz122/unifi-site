async function loadFibrePlans() {
  const container = document.getElementById('fibre-plans');
  if (!container) return;

  try {
    const plans = await fetchPlans('fibre');
    container.innerHTML = plans.map((p, i) => {
      const isHighlighted = p.highlighted === 1;
      return `
        <div class="col-md-6 col-lg-3">
          <div class="card h-100" ${isHighlighted ? 'style="border-top: 3px solid var(--brand-red);"' : ''}>
            <div class="card-body text-center p-4">
              ${isHighlighted ? '<span class="badge rounded-pill mb-2 px-3 py-1" style="background:var(--brand-red); font-weight:500;">Recommended</span>' : ''}
              <h6 class="fw-bold mb-3" style="color:var(--brand-blue);">${p.name}</h6>
              <p class="text-muted small mb-3">${p.speed}</p>
              <h3 class="fw-bold mb-1" style="color:var(--brand-red);">RM${p.price}</h3>
              <p class="text-muted small mb-4">/month</p>
              <p class="text-muted small">${p.features}</p>
              <a href="broadband.html" class="btn ${isHighlighted ? 'btn-warning' : 'btn-outline-dark'} btn-sm rounded-pill px-4 mt-3">Subscribe</a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.log('Backend not running, using static plans.');
  }
}

async function loadMobilePlans() {
  const container = document.getElementById('mobile-plans');
  if (!container) return;

  try {
    const plans = await fetchPlans('mobile');
    container.innerHTML = plans.map((p) => {
      const isPopular = p.highlighted === 1;
      const features = p.features.split('. ').filter(f => f);
      return `
        <div class="col-md-5">
          <div class="card h-100" ${isPopular ? 'style="border-top: 3px solid var(--brand-red);"' : ''}>
            <div class="card-body text-center p-4">
              ${isPopular ? '<span class="badge rounded-pill mb-2 px-3 py-1" style="background:var(--brand-red); font-weight:500;">Popular</span>' : ''}
              <h6 class="fw-bold mb-3" style="color:var(--brand-blue);">${p.name}</h6>
              <h3 class="fw-bold mb-1" style="color:var(--brand-red);">RM${p.price}</h3>
              <p class="text-muted small mb-4">/month</p>
              <ul class="list-unstyled text-muted small text-start mx-auto mb-4" style="max-width:200px;">
                ${features.map(f => `<li class="mb-2">&check; ${f}</li>`).join('')}
              </ul>
              <a href="broadband.html" class="btn ${isPopular ? 'btn-warning' : 'btn-outline-dark'} btn-sm rounded-pill px-4">Subscribe</a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.log('Backend not running, using static plans.');
  }
}
