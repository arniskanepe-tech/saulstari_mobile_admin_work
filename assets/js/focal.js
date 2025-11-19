// Apply object-position from data-focal for hero/gallery images
(function(){
  function applyFocalPositions(root){
    (root || document).querySelectorAll('img[data-focal]').forEach(function(img){
      var fp = (img.getAttribute('data-focal') || '').trim();
      if(fp){ img.style.objectPosition = fp; }
    });
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ applyFocalPositions(document); });
  } else {
    applyFocalPositions(document);
  }
})();