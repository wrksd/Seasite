/* Guest services, editorial gallery and locally simulated requests. */
(() => {
  const get = selector => document.querySelector(selector);
  const panel = get('#sr-dialog');
  const body = get('#sr-dialog-body');
  const contact = get('#sr-contact-form');
  const gallery = get('.sr-gallery');
  const icons = () => window.lucide?.createIcons();
  const pictures = [
    ['pool', 'Plaj & Havuz', 'Havuz başında'],
    ['deluxe', 'Odalar', 'Deluxe oda'],
    ['restaurant', 'Restoran', 'Ege sofrası'],
    ['architecture', 'Mimari', 'Mimariden detaylar'],
    ['beach', 'Plaj & Havuz', 'Sahilden bir manzara'],
    ['villa', 'Odalar', 'Villadan bir kare']
  ];
  const categories = ['Tümü', 'Plaj & Havuz', 'Odalar', 'Restoran', 'Mimari'];
  let visiblePictures = pictures;
  let currentPhoto = 0;
  let toastTimer;
  function notify(message) {
    clearTimeout(toastTimer);
    get('#sr-toast').textContent = message;
    toastTimer = setTimeout(() => get('#sr-toast').textContent = '', 5500);
  }
  function openPanel(title, content, viewer = false) {
    panel.classList.toggle('sr-viewer', viewer);
    get('#sr-dialog-title').textContent = title;
    body.replaceChildren(content);
    if (!panel.open) panel.showModal();
    icons();
  }
  function plainInfo(title, text) {
    const p = document.createElement('p');
    p.textContent = text;
    openPanel(title, p);
  }
  function requestStay(text, subject = 'Rezervasyon') {
    if (panel.open) panel.close();
    contact.elements.message.value = text;
    contact.elements.subject.value = subject;
    contact.scrollIntoView({block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    contact.elements.fullname.focus({preventScroll:true});
  }
  window.requestStay = requestStay;
  function filterGallery(category) {
    visiblePictures = category === 'Tümü' ? pictures : pictures.filter(photo => photo[1] === category);
    gallery.replaceChildren();
    visiblePictures.forEach(([file, , caption], index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', caption + ' fotoğrafını büyüt');
      button.innerHTML = '<img loading="lazy" alt="" src="img/' + file + '.webp"><span>' + caption + '</span>';
      button.addEventListener('click', () => showPhoto(index));
      gallery.append(button);
    });
    get('.sr-tabs').querySelectorAll('button').forEach(tab => tab.setAttribute('aria-pressed', String(tab.textContent === category)));
  }
  categories.forEach(category => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.textContent = category;
    tab.addEventListener('click', () => filterGallery(category));
    get('.sr-tabs').append(tab);
  });
  filterGallery('Tümü');
  function showPhoto(index) {
    currentPhoto = (index + visiblePictures.length) % visiblePictures.length;
    const [file, , caption] = visiblePictures[currentPhoto];
    const wrapper = document.createElement('div');
    wrapper.innerHTML = '<img class="sr-viewimg" src="img/' + file + '.webp" alt="' + caption + '"><div class="sr-viewnav"><button type="button" aria-label="Önceki fotoğraf" data-sr-photo="-1"><i data-lucide="chevron-left"></i></button><span>' + (currentPhoto + 1) + ' / ' + visiblePictures.length + '</span><button type="button" aria-label="Sonraki fotoğraf" data-sr-photo="1"><i data-lucide="chevron-right"></i></button></div>';
    if (visiblePictures.length === 1) wrapper.querySelector('.sr-viewnav').remove();
    openPanel(caption, wrapper, true);
  }
  const reviews = [
    ['Sabah erkenden iskeleye inip denize girmek, ardından uzun uzun kahvaltı etmek tatilin en güzel ritüeliydi.', 'Deniz A.', 'TR'],
    ['Terasımızdan gün batımını izledik. Restoranda önerilen mevsim balığı ve Ege otlarının tadı hâlâ aklımızda.', 'Clara M.', 'DE'],
    ['Hamam ritüelinden sonra koyda geçirdiğimiz sakin öğleden sonrayı uzun süre hatırlayacağız.', 'Oliver W.', 'GB']
  ];
  let reviewIndex = 0;
  function showReview(delta) {
    reviewIndex = (reviewIndex + delta + reviews.length) % reviews.length;
    const [text, name, country] = reviews[reviewIndex];
    get('.sr-review').innerHTML = '<div class="sr-stars" aria-label="5 üzerinden 5 yıldız">★★★★★</div><blockquote>“' + text + '”</blockquote><cite>' + name + ' · ' + country + '</cite>';
    get('.sr-counter').textContent = (reviewIndex + 1) + ' / ' + reviews.length;
  }
  showReview(0);
  const policies = {
    'KVKK': 'Bu konsept sitede özel talep ve e-bülten formlarına yazılan bilgiler herhangi bir otele veya veri tabanına gönderilmez. Form örneğini denemek için temsili bilgiler kullanabilirsiniz.',
    'İptal & İade Koşulları': 'Fiyat önizlemesi konaklama planlamak içindir. Ödeme alınmaz ve kesin rezervasyon oluşturulmaz. Gerçek bir rezervasyonda iade ve değişiklik koşulları seçilen tarife ile birlikte onay öncesinde paylaşılır.',
    'Çerez Politikası': 'Sayfa içindeki form ve galeri etkileşimleri oturum süresince tarayıcı belleğinde çalışır. Harita bağlantısı sizi ayrı bir hizmete götürür.'
  };
  function showSupport() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = '<p>Rezervasyon, transfer veya özel gün talepleriniz için iletişim formunu kullanabilirsiniz. Bu örnek sitede WhatsApp hattı tanımlanmamıştır.</p><button type="button" class="sr-primary" data-sr-contact>Talep formunu aç</button>';
    openPanel('Misafir desteği', wrapper);
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const data = button.dataset;
    if ('srClose' in data) panel.close();
    else if ('srReview' in data) showReview(Number(data.srReview));
    else if ('srPhoto' in data) { showPhoto(currentPhoto + Number(data.srPhoto)); body.querySelector('[data-sr-photo="' + data.srPhoto + '"]')?.focus(); }
    else if ('srPolicy' in data) plainInfo(data.srPolicy, policies[data.srPolicy]);
    else if ('srSupport' in data) showSupport();
    else if ('srContact' in data) requestStay(contact.elements.message.value, contact.elements.subject.value);
    else if ('srRequest' in data) requestStay(data.srRequest, 'Spa ve Aktiviteler');
    else if ('srSocial' in data) plainInfo(data.srSocial, 'Bu konsept otele ait bir ' + data.srSocial + ' hesabı tanımlanmamıştır. Otelden kareleri Galeri bölümünde inceleyebilirsiniz.');
  });
  panel.addEventListener('click', e => { if (e.target === panel && !e.target.closest('.sr-dialoghead')) {const r=panel.getBoundingClientRect(); if(e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom) panel.close();} });
  panel.addEventListener('keydown', e => {
    if (!panel.classList.contains('sr-viewer')) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      showPhoto(currentPhoto + (e.key === 'ArrowRight' ? 1 : -1));
      panel.querySelector('[data-sr-close]').focus();
    }
  });
  contact.addEventListener('submit', e => {
    e.preventDefault();
    notify('Talebiniz örnek formda doğrulandı. Otele herhangi bir bilgi gönderilmedi.');
    contact.reset();
  });
  get('#sr-news').addEventListener('submit', e => {
    e.preventDefault();
    notify('E-posta adresiniz örnek bülten formunda doğrulandı. Gerçek abonelik oluşturulmadı.');
    e.target.reset();
  });
  const backToTop = get('#sr-top');
  const setScrollState = () => { backToTop.hidden = window.scrollY < 600; };
  window.addEventListener('scroll', setScrollState, {passive:true});
  setScrollState();
  backToTop.addEventListener('click', () => window.scrollTo({top:0, behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}));
})();
