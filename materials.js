// materials.js
document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.querySelector('[data-materials-list]');
  const dateEl = document.querySelector('[data-materials-updated]');

  if (!listEl) {
    console.error('Nav atrasts [data-materials-list] konteiners.');
    return;
  }

  fetch('data/materials.json?_=' + Date.now())
    .then(r => r.json())
    .then(data => {
      const items = data.materials || data.items || data || [];
      listEl.innerHTML = '';

      if (dateEl && data.lastUpdated) {
        dateEl.textContent = data.lastUpdated;
      }

      items.forEach(material => {
        const card = createMaterialCard(material);
        listEl.appendChild(card);
      });
    })
    .catch(err => {
      console.error('Neizdevās ielādēt materials.json', err);
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
  if (material.notes && String(material.notes).trim() !== '') {
    const noteSpan = document.createElement('span');
    noteSpan.className = 'material-note-inline';
    noteSpan.textContent = ' ' + String(material.notes).trim();
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

  const dot = document.createElement('span');
  dot.className = 'status-dot ' + getStatusDotClass(material.status);

  const text = document.createElement('span');
  text.className = 'status-text';
  text.textContent = material.status || '';

  right.appendChild(label);
  right.appendChild(dot);
  right.appendChild(text);

  // Links "interesēties" tikai, ja nav pieejams
  if (material.status === 'nav pieejams') {
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
  const n = Number(value);
  if (Number.isNaN(n)) return '';
  // ja .0 – nerādām komatu, ja ir – rādām ar vienu zīmi
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, '');
}

function getStatusDotClass(status) {
  switch (status) {
    case 'pieejams':
      return 'status-dot--green';
    case 'neliels daudzums':
      return 'status-dot--yellow';
    case 'nav pieejams':
      return 'status-dot--red';
    default:
      return 'status-dot--grey';
  }
}
