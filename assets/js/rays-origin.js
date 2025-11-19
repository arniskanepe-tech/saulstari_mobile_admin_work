
// Compute logo center and set CSS variables for ray origin
(function(){
  function setOrigin(){
    var brand = document.querySelector('.brand img, .brand'); // try img first, fallback to container
    if(!brand) return;
    var rect = brand.getBoundingClientRect();
    var cx = rect.left + rect.width/2;
    var cy = rect.top + rect.height/2;
    // Apply to root as px values
    document.documentElement.style.setProperty('--ray-origin-x', cx + 'px');
    document.documentElement.style.setProperty('--ray-origin-y', cy + 'px');
  }
  window.addEventListener('DOMContentLoaded', setOrigin);
  window.addEventListener('load', setOrigin);
  window.addEventListener('resize', setOrigin);
  window.addEventListener('scroll', setOrigin);
})();
