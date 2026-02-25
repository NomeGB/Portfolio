// ─── Load json info ──────────────────────────────────────────────────────────
fetch('/Portfolio/pages/data-contact.json')
  .then(res => res.json())
  .then(data => {
    const contactList = document.getElementById('contactList');

    data.forEach(contact => {
      const item = document.createElement('div');
      item.classList.add('contactItem');

      const icon = document.createElement('img');
      icon.src = contact.icon;
      icon.classList.add('contactIcon');
      item.appendChild(icon);

      const text = document.createElement('div');
      text.textContent = contact.text;
      text.classList.add('contactText');
      item.appendChild(text);

      if (contact.link) {
        item.addEventListener('click', () => {
          if (contact.link.startsWith('mailto:')) {
            console.log("click:", contact.link);
            window.location.href = contact.link;
          } else {
            window.open(contact.link, '_blank');
          }
        });
      }

      contactList.appendChild(item);
    });
  })
  .catch(err => console.error('Error loading contacts:', err));

// ─── Iris anim ──────────────────────────────────────────────────────────

window.addEventListener('load', () => {

    const circle = document.getElementById('irisCircle');
    const maxR   = Math.hypot(window.innerWidth, window.innerHeight);

    circle.setAttribute('r', 0);

    const start    = performance.now();
    const duration = 1200;

    function animateIris(now) {
        const t     = Math.min((now - start) / duration, 1);
        const eased = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
        circle.setAttribute('r', eased * maxR);

        if (t < 1) {
            requestAnimationFrame(animateIris);
        } else {
            document.getElementById('introTransition').remove();
        }
    }

    requestAnimationFrame(animateIris);
});