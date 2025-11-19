(function(){
  var toggle = document.querySelector('.menu-toggle');
  var menu   = document.querySelector('.mobile-menu');
  var closeBtn = document.querySelector('.mobile-menu-close');

  if(!toggle || !menu || !closeBtn) return;

  function openMenu(){
    menu.classList.add('is-open');
    document.body.classList.add('menu-open');
    toggle.setAttribute('aria-expanded','true');
    menu.setAttribute('aria-hidden','false');
  }

  function closeMenu(){
    menu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded','false');
    menu.setAttribute('aria-hidden','true');
  }

  toggle.addEventListener('click', function(){
    if(menu.classList.contains('is-open')) closeMenu();
    else openMenu();
  });

  closeBtn.addEventListener('click', closeMenu);

  menu.addEventListener('click', function(e){
    if(e.target.tagName === 'A'){
      closeMenu();
    }
  });
})();