(() => {
  const rooms = [
    {id:"deluxe", name:"Deluxe Deniz Manzaralı Oda", image:"deluxe", category:"Deniz Manzaralı", size:38, capacity:3, price:8500, extras:[["sun","Balkon"]], text:"Sabah ışığını içeri alan geniş pencereler, keten dokular ve denize açılan özel balkon. İki kişilik yatak ve açılır koltuk, sakin bir kıyı kaçamağına eşlik eder."},
    {id:"swim-up", name:"Swim-Up Teras Süit", image:"suite", category:"Özel Havuzlu", size:58, capacity:4, price:12400, extras:[["waves","Özel havuz"]], text:"Taş terasınızdan doğrudan özel havuzunuza geçin. Ayrı oturma alanı, geniş duş ve gölgeli dinlenme köşesi, günü kendi ritminizde geçirmeniz için tasarlandı."},
    {id:"panoramik", name:"Panoramik Köşe Süit", image:"panorama", category:"Deniz Manzaralı", size:72, capacity:5, price:15900, extras:[["bath","Jakuzi"]], text:"Köşeyi dönen cam cephe ve geniş teras, koyu iki yönden seyre açar. Jakuzili banyo ve ayrı salon, ailece konaklamaya alan kazandırır."},
    {id:"royal", name:"Royal Beach Villa", image:"villa", category:"Kral Dairesi", size:160, capacity:7, price:28700, extras:[["waves","Özel havuz"]], text:"Denizin kıyısında üç yatak odası, özel havuz ve açık havada yemek alanı. Bahçedeki gölgeli teras, uzun sofralara ve sessiz öğleden sonralarına ayrıldı."}
  ];
  const get = id => document.getElementById(id);
  const form = get("rezervasyon"), arrival = get("stay-arrival"), departure = get("stay-departure");
  const adults = get("stay-adults"), children = get("stay-children"), roomSelect = get("stay-room");
  const dialog = get("stay-dialog"), modalContent = get("stay-modal-content");
  const filterBar = document.querySelector(".stay-filters"), grid = document.querySelector(".stay-grid");
  const money = amount => new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",maximumFractionDigits:0}).format(amount);
  const displayDate = date => new Intl.DateTimeFormat("tr-TR",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(date));
  const icon = name => '<i data-lucide="'+name+'" aria-hidden="true"></i>';
  const refreshIcons = () => { if(window.lucide) window.lucide.createIcons(); if(window.renderIcons) window.renderIcons(); };
  // Date inputs use calendar days. UTC arithmetic keeps the stay length stable across daylight-saving changes.
  const dayMs = 86400000;
  const addDays = (date, n) => new Date(Date.parse(date) + n * dayMs).toISOString().slice(0,10);
  const localToday = () => {
    const now = new Date();
    return [now.getFullYear(),String(now.getMonth()+1).padStart(2,"0"),String(now.getDate()).padStart(2,"0")].join("-");
  };
  function syncDates() {
    arrival.min = localToday();
    departure.min = addDays(arrival.value || arrival.min, 1);
    if(!departure.value || departure.value < departure.min) departure.value = departure.min;
  }
  arrival.value = addDays(localToday(), 1);
  departure.value = addDays(arrival.value, 2);
  syncDates();
  arrival.addEventListener("change", syncDates);
  rooms.forEach(room => roomSelect.add(new Option(room.name, room.id)));
  const categories = ["Tümü","Deniz Manzaralı","Özel Havuzlu","Kral Dairesi"];
  const amenityList = room => [["wifi","Wi-Fi"],["snowflake","Klima"],...room.extras].map(([symbol,label])=>'<span>'+icon(symbol)+label+'</span>').join("");
  const facts = room => '<div class="stay-facts"><span>'+icon("maximize") + room.size+' m²</span><span>'+icon("users")+'En fazla '+room.capacity+' kişi</span></div>';
  function renderRooms(category) {
    for(const button of filterBar.children) button.setAttribute("aria-pressed",String(button.textContent === category));
    grid.innerHTML = rooms.filter(room => category === "Tümü" || room.category === category || (category === "Özel Havuzlu" && room.id === "royal")).map(room =>
      '<article class="stay-card"><div class="stay-photo"><img loading="lazy" src="img/'+room.image+'.webp" alt="'+room.name+'"></div><div class="stay-card-copy"><div class="stay-price">Gecelik <strong>'+money(room.price)+'</strong> başlangıç fiyatı</div><h3>'+room.name+'</h3>'+facts(room)+'<div class="stay-amenities">'+amenityList(room)+'</div><div class="stay-actions"><button type="button" class="stay-detail" data-details="'+room.id+'">Detayları Gör</button><button type="button" class="stay-primary" data-select="'+room.id+'">Odayı Seç</button></div></div></article>').join("");
    refreshIcons();
  }
  for(const category of categories) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = category;
    button.addEventListener("click", () => renderRooms(category));
    filterBar.append(button);
  }
  function openModal(html) {
    modalContent.innerHTML = html;
    if(!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    refreshIcons();
  }
  function details(room) {
    openModal('<img class="stay-modal-img" src="img/'+room.image+'.webp" alt="'+room.name+'"><div class="stay-modal-copy"><p class="stay-kicker">'+room.category+'</p><h2 id="stay-modal-heading">'+room.name+'</h2>'+facts(room)+'<p>'+room.text+'</p><div class="stay-amenities">'+amenityList(room)+'</div><p>Gecelik başlangıç fiyatı <strong>'+money(room.price)+'</strong></p><button class="stay-primary" type="button" data-select="'+room.id+'">Odayı Seç</button></div>');
  }
  function choose(id) {
    if(dialog.open) dialog.close();
    roomSelect.value = id;
    form.scrollIntoView({behavior:"smooth",block:"center"});
    arrival.focus({preventScroll:true});
  }
  function listenForRoomAction(e) {
    const button = e.target.closest("button");
    if(!button) return;
    if(button.dataset.details) details(rooms.find(room=>room.id===button.dataset.details));
    if(button.dataset.select) choose(button.dataset.select);
  }
  grid.addEventListener("click",listenForRoomAction);
  modalContent.addEventListener("click",listenForRoomAction);
  dialog.querySelector(".stay-close").addEventListener("click",()=>dialog.close());
  dialog.addEventListener("click",e=>{if(e.target===dialog) dialog.close()});
  function nightlyPrice(room) {
    return room.price + Math.max(0,Number(adults.value)-2)*850 + Number(children.value)*350;
  }
  const nightCount = () => Math.round((Date.parse(departure.value)-Date.parse(arrival.value))/dayMs);
  function showRates(e) {
    e.preventDefault();
    arrival.min = localToday();
    if(!form.reportValidity()) return;
    const guests = Number(adults.value)+Number(children.value);
    const matches = rooms.filter(room => (!roomSelect.value || room.id===roomSelect.value) && room.capacity>=guests);
    const nights = nightCount();
    const summary = displayDate(arrival.value)+" – "+ displayDate(departure.value)+" · "+nights+" gece · "+adults.value+" yetişkin, "+children.value+" çocuk";
    const rows = matches.map(room=>'<div class="stay-result"><div><strong>'+room.name+'</strong><small>'+money(nightlyPrice(room))+' / gece · Toplam '+money(nightlyPrice(room)*nights)+'</small></div><button type="button" class="stay-primary" data-request="'+room.id+'">Talep oluştur</button></div>').join("");
    const empty = '<p>Bu misafir sayısına uygun '+(roomSelect.value?'seçili oda bulunmuyor. Tüm oda tiplerini arayabilir veya ':'tek oda bulunmuyor. Birden fazla oda için özel talep oluşturabilir ya da ')+'misafir sayısını değiştirebilirsiniz.</p><div class="stay-actions">'+(roomSelect.value?'<button type="button" class="stay-primary" data-all>Tüm odalarda ara</button>':'<button type="button" class="stay-primary" data-multiple>Birden fazla oda talep et</button>')+'<button type="button" class="stay-detail" data-edit>Aramayı düzenle</button></div>';
    openModal('<div class="stay-modal-copy"><p class="stay-kicker">KONAKLAMA PLANINIZ</p><h2 id="stay-modal-heading">Müsaitlik önizlemesi</h2><p>'+summary+'</p>'+(matches.length?rows:empty)+'<p class="stay-note">Fiyatlar örnektir. Kesin fiyat ve müsaitlik, otelin onayıyla belirlenir.</p></div>');
    modalContent.querySelector("[data-all]")?.addEventListener("click",()=>{roomSelect.value="";form.requestSubmit()});
    modalContent.querySelector("[data-edit]")?.addEventListener("click",()=>choose(roomSelect.value));
    const request = text => {dialog.close(); window.requestStay(text);};
    modalContent.querySelector("[data-multiple]")?.addEventListener("click",()=>request(summary+" için birden fazla oda talep ediyorum."));
    modalContent.querySelectorAll("[data-request]").forEach(button=>{
      button.addEventListener("click",()=>{
        const room = rooms.find(item=>item.id===button.dataset.request);
        request(room.name+" için rezervasyon talebim var. "+summary+". Örnek toplam tutar "+money(nightlyPrice(room)*nights)+".");
      });
    });
  }
  form.addEventListener("submit",showRates);
  renderRooms("Tümü");
})();
