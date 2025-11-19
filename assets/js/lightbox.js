/*! Simple Lightbox (Saulstari) */
(function(){
  function qs(s,root){ return (root||document).querySelector(s); }

  const backdrop = document.createElement('div');
  backdrop.className = 'lb-backdrop';
  backdrop.innerHTML = '<div class="lb-frame"><button class="lb-close" aria-label="Aizvērt">×</button><button class="lb-prev" aria-label="Iepriekšējais">‹</button><img alt=""><button class="lb-next" aria-label="Nākamais">›</button></div>';
  document.addEventListener('DOMContentLoaded', ()=> document.body.appendChild(backdrop));

  let images = []; let i = 0;

  function open(list, startIndex){
    images = list || [];
    i = startIndex || 0;
    update();
    backdrop.classList.add('active');
  }
  function close(){ backdrop.classList.remove('active'); }
  function update(){ const img = qs('img', backdrop); if (!images.length) return; img.src = images[i]; }
  function prev(){ i = (i - 1 + images.length) % images.length; update(); }
  function next(){ i = (i + 1) % images.length; update(); }

  document.addEventListener('click', (e)=>{
    const media = e.target.closest('[data-gallery]');
    if (media){
      const list = (media.getAttribute('data-gallery')||'').split('|').filter(Boolean);
      const start = parseInt(media.getAttribute('data-start')||'0',10) || 0;
      open(list, start);
    }
    if (e.target.classList.contains('lb-close')) close();
    if (e.target.classList.contains('lb-prev')) prev();
    if (e.target.classList.contains('lb-next')) next();
    if (e.target === backdrop) close();
  });

  document.addEventListener('keydown', (e)=>{
    if (!backdrop.classList.contains('active')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });
})();
