// materials.js – sākumlapas materiālu sadaļai
document.addEventListener('DOMContentLoaded', () => {
  const updatedEl = document.querySelector('#home-materials-updated');
  const cards = document.querySelectorAll('[data-material-id]');

  if (!cards.length) return; // ja nav kartiņu, nav ko darīt

  fetch('/api/materials')
    .then(res => res.json())
    .then(data => {
      const { lastUpdate, materials } = data;

      // Globālais datums
      if (updatedEl && lastUpdate) {
        updatedEl.textContent = `Dati atjaunoti: ${lastUpdate}`;
      }

      cards.forEach(card => {
        const id = card.dataset.materialId;
        const mat = materials.find(m => m.id === id);

        if (!mat) return;

        const priceEl = card.querySelector('.js-price');
        const statusEl = card.querySelector('.js-status');
        const notesEl = card.querySelector('.js-notes');

        const isUnavailable =
          mat.availability &&
          mat.availability.toLowerCase() === 'nav pieejams';

        // Cena + mērvienība, bet tikai ja nav "nav pieejams"
        if (priceEl) {
          if (!isUnavailable && mat.price != null && mat.unit) {
            priceEl.textContent = `${mat.price} ${mat.unit}`;
          } else {
            // ja nav pieejams, var atstāt tukšu vai atstāt veco tekstu
            // priceEl.textContent = '';
          }
        }

        // Pieejamība / INTERESĒTIES
        if (statusEl) {
          if (isUnavailable) {
            statusEl.textContent = 'INTERESĒTIES';
            statusEl.classList.add('material-status-interest');
          } else {
            statusEl.textContent = mat.availability || '';
            statusEl.classList.remove('material-status-interest');
          }
        }

        // Piezīmes
        if (notesEl) {
          if (mat.notes && mat.notes.trim() !== '') {
            notesEl.textContent = mat.notes;
            notesEl.style.display = '';
          } else {
            notesEl.textContent = '';
            notesEl.style.display = 'none';
          }
        }
      });
    })
    .catch(err => {
      console.error('Neizdevās ielādēt materials.json', err);
      if (updatedEl) {
        updatedEl.textContent = 'Neizdevās ielādēt materiālu datus.';
      }
    });
});
