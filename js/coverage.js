async function initCoverageChecker() {
  const input = document.getElementById('coverage-postcode');
  const button = document.getElementById('coverage-btn');
  const result = document.getElementById('coverage-result');

  if (!input || !button) return;

  button.addEventListener('click', async () => {
    const postcode = input.value.trim();
    if (!postcode || postcode.length < 5) {
      result.innerHTML = '<span class="text-danger">Enter a valid postcode.</span>';
      return;
    }

    result.innerHTML = '<span class="text-muted">Checking...</span>';

    try {
      const data = await checkCoverage(postcode);
      if (data.fibre_available) {
        result.innerHTML = `
          <span class="text-success fw-semibold">&#10003; Fibre available in ${data.area}, ${data.state}. Max speed: ${data.max_speed}.</span>
        `;
      } else {
        result.innerHTML = `
          <span class="text-warning fw-semibold">&#10007; Unifi Fibre is not available in ${postcode} yet. Check back soon.</span>
        `;
      }
    } catch (err) {
      result.innerHTML = '<span class="text-danger">Could not reach server. Is the backend running?</span>';
    }
  });

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') button.click();
  });
}
