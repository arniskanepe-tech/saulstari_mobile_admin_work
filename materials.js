// materials.js
document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.querySelector('[data-materials-list]');
  const dateEl = document.querySelector('[data-materials-updated]');

  if (!listEl) {
    console.error('Nav atrasts [data-materials-list] konteiners.');
    return;
  }

  // Tagad lasām no API, nevis statiska materials.json
  fetch('/api/materials?_=' + Date.now())
    .then(r => r.json())
    .then(data => {
      const items = Array.isArray(data)
        ? data
        : (data.materials || data.items || []);

      listEl.innerHTML = '';

      // Atrast jaunāko updated_at laiku
      if (dateEl && items.length > 0) {
        let latest = null;
        items.forEach(m => {
          if (m.updated_at && (!latest || m.updated_at > latest)) {
            latest = m.updated_at;
          }
        });
        if (latest) {
          dateEl.textContent = latest;
        }
      }

      items.forEach(material => {
        const card = createMaterialCard(material);
        listEl.appendChild(card);
      });
    })
    .catch(err => {
      console.error('Neizdevās ielādēt materiālus no API', err);
    });
});

function createMaterialCard(material) {
  const card = document.createElement('article');
  card.className = 'material-row';

  // ==== Kreisā puse – nosaukums + cena + piezīme ====
  const left = document.createElement('div');
  left.className = 'material-row-main';

  const titleRow = document.createElement('div');
  titleRow.className = 'material-row-title';

  const nameEl = document.createElement('div');
  nameEl.className = 'material-name';
  nameEl.textContent = material.name || '';

  const priceEl = document.createElement('div');
  priceEl.className = 'material-price';

  const mainPriceSpan = document.createElement('span');
  mainPriceSpan.textContent =
    (material.price !== undefined && material.price !== null
      ? trimPrice(material.price)
      : '') +
    (material.unit ? ' ' + material.unit : '');

  priceEl.appendChild(mainPriceSpan);

  // Piezīme – A variants: vienā rindā aiz mērvienības, tikai ja ir
  const noteText = (
    (material.notes != null ? material.notes : material.note) || ''
  ).toString().trim();

  if (noteText !== '') {
    const noteSpan = document.createElement('span');
    noteSpan.className = 'material-note-inline';
    noteSpan.textContent = ' ' + noteText;
    priceEl.appendChild(noteSpan);
  }

  titleRow.appendChild(nameEl);
  titleRow.appendChild(priceEl);
  left.appendChild(titleRow);
  card.appendChild(left);

  // ==== Labā puse – statuss + "interesēties" ====
  const right = document.createElement('div');
  right.className = 'material-row-status';

  const label = document.createElement('span');
  label.className = 'status-label';
  label.textContent = 'Pieejamība:';

  const statusInfo = normalizeStatus(material);

  const dot = document.createElement('span');
  dot.className = 'status-dot ' + statusInfo.dotClass;

  const text = document.createElement('span');
  text.className = 'status-text';
  text.textContent = statusInfo.text || '';

  right.appendChild(label);
  right.appendChild(dot);
  right.appendChild(text);

  // Links "interesēties" tikai, ja nav pieejams
  if (statusInfo.text === 'nav pieejams') {
    const link = document.createElement('a');
    link.href = '#kontakti';
    link.className = 'status-link';
    link.textContent = 'interesēties';
    right.appendChild(link);
  }

  card.appendChild(right);

  return card;
}

function trimPrice(value) {
  if (value === '' || value == null) return '';
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  // ja .0 – nerādām komatu, ja ir – rādām ar vienu zīmi
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, '');
}

function normalizeStatus(material) {
  // 1) ja jau ir teksts "pieejams / neliels daudzums / nav pieejams"
  if (material.status) {
    const s = material.status.toString().trim().toLowerCase();
    if (s === 'pieejams') {
      return { text: 'pieejams', dotClass: 'status-dot--green' };
    }
    if (s === 'neliels daudzums') {
      return { text: 'neliels daudzums', dotClass: 'status-dot--yellow' };
    }
    if (s === 'nav pieejams') {
      return { text: 'nav pieejams', dotClass: 'status-dot--red' };
    }
  }

  // 2) ja nāk no API ar availability: available / limited / not_available
  const av = (material.availability || '').toString().trim();
  switch (av) {
    case 'available':
      return { text: 'pieejams', dotClass: 'status-dot--green' };
    case 'limited':
      return { text: 'neliels daudzums', dotClass: 'status-dot--yellow' };
    case 'not_available':
      return { text: 'nav pieejams', dotClass: 'status-dot--red' };
    default:
      return { text: '', dotClass: 'status-dot--grey' };
  }
}
