const API = 'http://localhost:3000/api';

async function fetchPlans(category) {
  const res = await fetch(`${API}/plans?category=${category}`);
  const plans = await res.json();
  return plans;
}

async function checkCoverage(postcode) {
  const res = await fetch(`${API}/coverage/${postcode}`);
  const data = await res.json();
  return data;
}

async function submitEnquiry(formData) {
  const res = await fetch(`${API}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  return res.json();
}
