async function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const topic = form.querySelector('[name="topic"]').value;
    const message = form.querySelector('[name="message"]').value.trim();
    const status = document.getElementById('contact-status');

    if (!name || !email || !message) {
      status.innerHTML = '<span class="text-danger">Name, email, and message are required.</span>';
      return;
    }

    status.innerHTML = '<span class="text-muted">Sending...</span>';

    try {
      const res = await submitEnquiry({ name, email, topic, message });
      if (res.success) {
        status.innerHTML = '<span class="text-success">&#10003; Message sent. We will get back to you soon.</span>';
        form.reset();
      } else {
        status.innerHTML = '<span class="text-danger">Something went wrong. Try again.</span>';
      }
    } catch (err) {
      status.innerHTML = '<span class="text-danger">Could not reach server. Is the backend running?</span>';
    }
  });
}
