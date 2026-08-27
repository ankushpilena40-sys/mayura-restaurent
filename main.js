(function(){
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const toggle = document.getElementById("menuToggle");
  const overlay = document.getElementById("mobileOverlay");
  function closeOverlay(){
    if (!overlay || !toggle) return;
    overlay.classList.remove("open");
    toggle.setAttribute("aria-expanded","false");
    document.body.style.overflow = "";
    setTimeout(()=>{ if(!overlay.classList.contains("open")) overlay.hidden = true; }, 350);
  }
  function openOverlay(){
    if (!overlay || !toggle) return;
    overlay.hidden = false;
    requestAnimationFrame(()=> overlay.classList.add("open"));
    toggle.setAttribute("aria-expanded","true");
    document.body.style.overflow = "hidden";
  }
  if (toggle && overlay) {
    toggle.addEventListener("click", ()=> overlay.classList.contains("open") ? closeOverlay() : openOverlay());
    overlay.querySelectorAll("a").forEach(a=> a.addEventListener("click", closeOverlay));
  }

  const header = document.getElementById("siteHeader");
  const actionBar = document.querySelector(".mobile-action-bar");
  let lastY = window.scrollY, ticking = false;
  function onScroll(){
    const y = window.scrollY;
    const goingDown = y > lastY && y > 120;
    if (header) header.classList.toggle("hide", goingDown);
    if (actionBar) actionBar.classList.toggle("hide", goingDown);
    lastY = y; ticking = false;
  }
  window.addEventListener("scroll", ()=>{ if(!ticking){ requestAnimationFrame(onScroll); ticking = true; } }, {passive:true});

  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach((entry, i)=>{
        if(entry.isIntersecting){ setTimeout(()=> entry.target.classList.add("in"), (i%4)*70); io.unobserve(entry.target); }
      });
    }, {threshold:.15, rootMargin:"0px 0px -40px 0px"});
    revealEls.forEach(el=> io.observe(el));
  } else revealEls.forEach(el=> el.classList.add("in"));

  const feathers = document.querySelectorAll(".feather-line");
  if ("IntersectionObserver" in window){
    const fio = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{ if(entry.isIntersecting){ entry.target.classList.add("drawn"); fio.unobserve(entry.target); } });
    }, {threshold:.4});
    feathers.forEach(f=> fio.observe(f));
  } else feathers.forEach(f=> f.classList.add("drawn"));

  const heroImg = document.getElementById("heroImg");
  if (heroImg && !reduceMotion){
    window.addEventListener("scroll", ()=>{
      const y = window.scrollY;
      if (y < window.innerHeight) heroImg.style.transform = `scale(1.06) translateY(${y*0.12}px)`;
    }, {passive:true});
  }

  const tabsEl = document.getElementById("menuTabs");
  const panelsEl = document.getElementById("menuPanels");
  const tagLabel = {v:"Veg", vg:"Vegan", gf:"GF", spicy:"Spicy"};
  function activate(idx){
    if (!tabsEl || !panelsEl) return;
    tabsEl.querySelectorAll(".menu-tab").forEach((t,i)=> t.setAttribute("aria-selected", i===idx ? "true":"false"));
    panelsEl.querySelectorAll(".menu-panel").forEach((p,i)=> p.classList.toggle("active", i===idx));
    tabsEl.children[idx]?.scrollIntoView({behavior: reduceMotion?"auto":"smooth", inline:"center", block:"nearest"});
  }
  function renderMenu(){
    if (!window.MAYURA_MENU || !tabsEl || !panelsEl) return;
    MAYURA_MENU.forEach((group, idx)=>{
      const id = "panel-" + idx;
      const tab = document.createElement("button");
      tab.className = "menu-tab"; tab.setAttribute("role","tab");
      tab.setAttribute("aria-selected", idx===0 ? "true":"false");
      tab.setAttribute("aria-controls", id); tab.id = "tab-" + idx; tab.textContent = group.cat;
      tab.addEventListener("click", ()=> activate(idx)); tabsEl.appendChild(tab);
      const panel = document.createElement("div");
      panel.className = "menu-panel" + (idx===0 ? " active":""); panel.id = id;
      panel.setAttribute("role","tabpanel"); panel.setAttribute("aria-labelledby","tab-"+idx);
      group.items.forEach(([name, price, desc, tags])=>{
        const item = document.createElement("div"); item.className = "menu-item";
        const tagHtml = tags ? `<span class="tags">${tags.split(",").map(t=>`<span class="tag ${t}">${tagLabel[t]||t}</span>`).join("")}</span>` : "";
        item.innerHTML = `<div class="menu-item-top"><span>${name}${tagHtml}</span><span class="menu-item-price">$${price}</span></div>${desc ? `<p>${desc}</p>` : ""}`;
        panel.appendChild(item);
      });
      panelsEl.appendChild(panel);
    });
  }
  renderMenu();

  const GALLERY = [
    ["Mayura-1-68.webp","g-1","Mayura Indian Kitchen dining room"],
    ["Mayura-1-46.webp","g-2","South Indian dish at Mayura"],
    ["Mayura-1-70.webp","g-3","Kerala curry at Mayura"],
    ["Mayura-1-58.webp","g-4","Dosa preparation at Mayura"],
    ["Mayura-1-69.webp","g-5","Tandoori dish at Mayura"],
    ["Mayura-1-49.webp","g-6","Signature plate at Mayura"],
    ["Mayura-1-72.webp","g-7","Mayura table spread"],
  ];
  const galleryGrid = document.getElementById("galleryGrid");
  if (galleryGrid) GALLERY.forEach(([file, cls, alt])=>{
    const a = document.createElement("a");
    a.href = `https://mayura-indian-restaurant.com/wp-content/uploads/${file}`;
    a.target = "_blank"; a.rel = "noopener"; a.className = cls;
    a.innerHTML = `<img loading="lazy" src="https://mayura-indian-restaurant.com/wp-content/uploads/${file}" alt="${alt}">`;
    galleryGrid.appendChild(a);
  });
})();