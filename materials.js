// materials.js – lasām no /api/materials un aizpildām index.html vlistu

document.addEventListener('DOMContentLoaded', () => {
  const updatedEl = document.getElementById('home-materials-updated');
  const rows = document.querySelectorAll('.vitem[data-material-id]');

  if (!rows.length) {
    console.warn('Nav nevienas .vitem rindas ar data-material-id');
    return;
  }

  fetch('/api/materials?_=' + Date.now())
    .then(r => r.json())
    .then(data => {
      const materials = Array.isArray(data)
        ? data
        : (data.materials || data.items || []);

      // Kopējais atjaunošanas datums
      if (updatedEl && data.lastUpdate) {
        updatedEl.textContent = 'Dati atjaunoti: ' + data.lastUpdate;
      }

      // Uztaisām map pēc id
      const byId = new Map();
      materials.forEach(m => {
        if (m.id) byId.set(m.id, m);
      });

      rows.forEach(row => {
        const id = row.dataset.materialId;
        const material = byId.get(id);
        if (!material) return;

        const priceEl = row.querySelector('.js-price');
        const notesEl = row.querySelector('.js-notes');
        const dotEl = row.querySelector('.dot');
        const statusEl = row.querySelector('.js-status');
        const actionEl = row.querySelector('.avail-action');

        // Cena + mērvienība + PIEZĪME vienā rindā
        if (priceEl) {
          const basePrice =
            material.price !== undefined && material.price !== null
              ? trimPrice(material.price)
              : '';
          const unit = material.unit ? ' ' + material.unit : '';
          const note = (material.notes || '').toString().trim();
          const notePart = note ? ' ' + note : '';
          priceEl.textContent = basePrice + unit + notePart;
        }

        // Veco notu lauku iztukšojam (vairs nav vajadzīgs)
        if (notesEl) {
          notesEl.textContent = '';
        }

        // Pieejamība
        const availability = (material.availability || material.status || '')
          .toString()
          .trim()
          .toLowerCase();

        let dotClass = 'grey';
        let statusText = '';
        let interest = false;

        switch (availability) {
          case 'pieejams':
            dotClass = 'green';
            statusText = 'Pieejams';
            break;
          case 'neliels daudzums':
            dotClass = 'yellow';
            statusText = 'Neliels daudzums';
            break;
          case 'nav pieejams':
            dotClass = 'red';
            statusText = 'Nav pieejams';
            interest = true;
            break;
          default:
            dotClass = 'grey';
            statusText = '';
        }

        if (dotEl) {
          dotEl.classList.remove('green', 'yellow', 'red', 'grey');
          dotEl.classList.add(dotClass);
        }

        if (statusEl) {
          statusEl.textContent = statusText;
        }

        if (actionEl) {
          if (interest) {
            actionEl.innerHTML =
              '<a href="contact.html#fast-form">interesēties</a>';
          } else {
            actionEl.innerHTML = '';
          }
        }
      });
    })
    .catch(err => {
      console.error('Neizdevās ielādēt materiālus no API', err);
      if (updatedEl) {
        updatedEl.textContent = 'Kļūda ielādējot materiālu datus.';
      }
    });
});

function trimPrice(value) {
  if (value === '' || value == null) return '';
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.00$/, '');
}
