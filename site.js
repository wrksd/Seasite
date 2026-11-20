// Header navigation, language preview and keyboard-accessible photo controls.
(() => {
  const header = document.querySelector('.topbar');
  const menu = document.querySelector('.hamb');
  const nav = document.querySelector('#mainnav');
  const closeMenu = () => {
    header.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Menüyü aç');
  };
  menu.onclick = () => {
    const opened = header.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(opened));
    menu.setAttribute('aria-label', opened ? 'Menüyü kapat' : 'Menüyü aç');
  };
  const scrollState = () => header.classList.toggle('scrolled', window.scrollY > 24);
  scrollState();
  addEventListener('scroll', scrollState, {passive:true});
  header.addEventListener('click', event => { if(event.target.closest('a')) closeMenu(); });
  const navLinks = [...nav.querySelectorAll('a')];
  const sectionWatch = new IntersectionObserver(entries => {
    entries.filter(entry => entry.isIntersecting).forEach(entry => {
      navLinks.forEach(link => link.classList.toggle('active', link.hash === '#' + entry.target.id));
    });
  }, {rootMargin:'-8% 0px -58% 0px'});
  navLinks.forEach(link => { const section = document.querySelector(link.hash); if(section) sectionWatch.observe(section); });

  const languages = document.querySelector('#language-list');
  const languageButton = document.querySelector('#lang');
  const hideLanguages = () => {languages.hidden = true; languageButton.setAttribute('aria-expanded','false');};
  languageButton.onclick = () => { languages.hidden = !languages.hidden; languageButton.setAttribute('aria-expanded', String(!languages.hidden)); };
  ['TR', 'EN', 'DE', 'RU'].forEach(code => {
    const item = document.createElement('button');
    item.type = 'button'; item.textContent = code;
    item.onclick = () => {
      hideLanguages();
      languageButton.focus();
      const note = document.getElementById('language-note');
      note.hidden = false; note.textContent = code === 'TR' ? 'Türkçe seçili.' : code + ' dil seçeneği önizlemededir. Site dili Türkçe.';
      clearTimeout(note.dismiss); note.dismiss = setTimeout(() => note.hidden = true, 3500);
    };
    languages.append(item);
  });
  document.addEventListener('click', e => { if(!e.target.closest('.langs')) hideLanguages(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape'){hideLanguages();closeMenu();} });
  const slides = ['img/terrace.webp','img/hero.webp','img/cove.webp'];
  const photo = document.querySelector('.hero-photo');
  let index = 0;
  document.querySelectorAll('[data-slide]').forEach(button => button.onclick = () => {
    index = (index + Number(button.dataset.slide) + slides.length) % slides.length;
    photo.style.backgroundImage = 'url("' + slides[index] + '")';
    document.getElementById('slidenum').textContent = String(index+1).padStart(2,'0');
  });
  window.lucide?.createIcons();
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window){
    const observer = new IntersectionObserver(items => items.forEach(entry => {
      if(entry.isIntersecting){ entry.target.animate([{opacity:.55,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:450}); observer.unobserve(entry.target); }
    }));
    document.querySelectorAll('.aboutcontent, main section:not(.sea-hero) h2').forEach(el => observer.observe(el));
  }
})();
