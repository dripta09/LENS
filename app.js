// ════════════════════════════════════════════════════
//  LENS — Photography Portfolio
//  Main Application Script
// ════════════════════════════════════════════════════

// ── DATA LAYER ───────────────────────────────────────
const DB = {
  g: k => { try { return JSON.parse(localStorage.getItem(k)) } catch { return null } },
  s: (k, v) => localStorage.setItem(k, JSON.stringify(v))
};

const DEFAULT_CATEGORIES = ['All', 'Portraits', 'Landscape', 'Travel', 'Street', 'Nature', 'Architecture', 'Events'];

const gS = () => DB.g('s_cfg') || {
  name: 'Your Name',
  tagline: 'Portrait · Landscape · Documentary',
  bio: 'Update your bio in Admin → Settings.',
  skills: 'Portraits,Landscape,Travel',
  email: 'you@email.com',
  avatar: '',
  password: 'admin123',
  heroH: 'Capturing<br><em>Light &</em><br>Stillness',
  heroSub: 'Visual stories told through the lens — portraits, landscapes, and the quiet in-between moments.'
};

const gP = () => DB.g('s_photos') || [];
const gB = () => DB.g('s_posts') || [];
const gM = () => DB.g('s_msgs') || [];
const gC = () => DB.g('s_photo_cats') || DEFAULT_CATEGORIES.slice(1); // exclude 'All'


// ── ROUTING ──────────────────────────────────────────
const navKeys = ['home', 'gallery', 'blog', 'post', 'about', 'admin'];

function go(id) {
  document.querySelectorAll('.pg').forEach(p => p.classList.remove('on'));
  document.querySelectorAll('.nl').forEach(b => b.classList.remove('on'));
  const pg = document.getElementById('pg-' + id);
  if (pg) pg.classList.add('on');
  const nb = document.getElementById('nl-' + id);
  if (nb) nb.classList.add('on');
  window.scrollTo(0, 0);
  if (id === 'home') rHome();
  if (id === 'gallery') rGallery();
  if (id === 'blog') rBlog();
  if (id === 'about') rAbout();
  if (id === 'admin') rAdmin();
}

function toggleMobileNav() {
  const m = document.getElementById('nav-mobile');
  m.style.display = m.style.display === 'none' ? 'flex' : 'none';
}

window.addEventListener('scroll', () => {
  const n = document.getElementById('nav');
  n.classList.toggle('scrolled', window.scrollY > 60);
});


// ── HOME ─────────────────────────────────────────────
function rHome() {
  const s = gS();
  document.getElementById('hero-h1').innerHTML = s.heroH || 'Capturing<br><em>Light &</em><br>Stillness';
  document.getElementById('hero-sub').textContent = s.heroSub || '';
  document.getElementById('home-about-name').textContent = s.name || 'Your Name';
  document.getElementById('home-about-bio').textContent = s.bio || '';
  document.getElementById('ft-txt').textContent = '© ' + new Date().getFullYear() + ' ' + (s.name || 'LENS') + ' — All Rights Reserved';

  const tags = (s.skills || '').split(',').map(x => x.trim()).filter(Boolean);
  document.getElementById('home-tags').innerHTML = tags.map(t => `<span class="tag">${t}</span>`).join('');

  const aw = document.getElementById('home-about-img');
  aw.innerHTML = s.avatar
    ? `<img src="${s.avatar}" alt="${s.name}" style="width:100%;height:100%;object-fit:cover">`
    : `<div class="about-img-ph">📷</div>`;

  // Featured grid — show featured photos first, then latest
  const allPhotos = gP();
  const featured = allPhotos.filter(p => p.featured);
  const photos = featured.length >= 3 ? featured.slice(0, 3) : allPhotos.slice(0, 3);
  // Set lbPhotos so lightbox works from featured section
  lbPhotos = allPhotos;
  const feat = document.getElementById('home-feat');
  if (!photos.length) {
    feat.innerHTML = `<div class="feat-main"><div class="feat-placeholder">📷</div></div><div class="feat-side"><div class="feat-placeholder">📷</div></div><div class="feat-side"><div class="feat-placeholder">📷</div></div>`;
    // Blog preview (no photos case)
    const posts = gB().filter(p => p.status === 'published').slice(0, 2);
    document.getElementById('home-blog').innerHTML = posts.length
      ? posts.map(blogRow).join('')
      : `<p style="color:var(--muted);font-size:0.88rem">No posts yet.</p>`;
    return;
  }

  let html = '';
  const heroP = photos[0];
  const heroIdx = allPhotos.indexOf(heroP);
  html += `<div class="feat-main" onclick="lbOpen(${heroIdx})"><img class="feat-img" src="${heroP.url}" alt="${heroP.caption || ''}" onerror="this.parentElement.innerHTML='<div class=\\'feat-placeholder\\'>📷</div>'"><div class="feat-overlay"></div><div class="feat-label"><div class="feat-label-cat">${heroP.category || 'Featured'}</div><div class="feat-label-title">${heroP.caption || 'Untitled'}</div></div></div>`;

  [1, 2].forEach(i => {
    const ph = photos[i];
    if (ph) {
      const realIdx = allPhotos.indexOf(ph);
      html += `<div class="feat-side" onclick="lbOpen(${realIdx})"><img class="feat-img" src="${ph.url}" alt="${ph.caption || ''}" onerror="this.parentElement.innerHTML='<div class=\\'feat-placeholder\\'>📷</div>'"><div class="feat-overlay"></div><div class="feat-label"><div class="feat-label-cat">${ph.category || 'Gallery'}</div><div class="feat-label-title">${ph.caption || ''}</div></div></div>`;
    } else {
      html += `<div class="feat-side"><div class="feat-placeholder">📷</div></div>`;
    }
  });
  feat.innerHTML = html;

  // Blog preview
  const posts = gB().filter(p => p.status === 'published').slice(0, 2);
  document.getElementById('home-blog').innerHTML = posts.length
    ? posts.map(blogRow).join('')
    : `<p style="color:var(--muted);font-size:0.88rem">No posts yet.</p>`;
}


// ── GALLERY & LIGHTBOX ───────────────────────────────
let lbPhotos = [];
let lbIdx = 0;
let galFilter = 'All';

function rGallery() {
  const photos = gP();
  const cats = getUsedCategories(photos);

  // Render filter tabs
  const filterWrap = document.getElementById('gallery-filters');
  const allCount = photos.length;
  let filterHtml = `<button class="gal-filter${galFilter === 'All' ? ' on' : ''}" onclick="setGalFilter('All')">All <span class="filter-count">${allCount}</span></button>`;
  cats.forEach(cat => {
    const count = photos.filter(p => p.category === cat).length;
    filterHtml += `<button class="gal-filter${galFilter === cat ? ' on' : ''}" onclick="setGalFilter('${esc(cat)}')">${cat} <span class="filter-count">${count}</span></button>`;
  });
  filterWrap.innerHTML = filterHtml;

  // Filter photos
  const filtered = galFilter === 'All' ? photos : photos.filter(p => p.category === galFilter);
  lbPhotos = filtered;

  const el = document.getElementById('gallery-masonry');
  const em = document.getElementById('gallery-empty');
  if (!filtered.length) { el.innerHTML = ''; em.style.display = 'block'; return; }
  em.style.display = 'none';
  el.innerHTML = filtered.map((ph, i) => `<div class="m-item" onclick="lbOpen(${i})">
    <img src="${ph.url}" alt="${ph.caption || ''}" loading="lazy" onerror="this.parentElement.style.display='none'">
    <div class="m-overlay"><div class="m-zoom">+</div></div>
    ${ph.category ? `<div class="m-cat-badge">${ph.category}</div>` : ''}
    ${ph.caption ? `<div class="m-caption">${ph.caption}</div>` : ''}
  </div>`).join('');
}

function setGalFilter(cat) {
  galFilter = cat;
  rGallery();
}

function getUsedCategories(photos) {
  const set = new Set();
  photos.forEach(p => { if (p.category) set.add(p.category); });
  return Array.from(set).sort();
}

function lbOpen(i) { lbIdx = i; lbShow() }

function lbShow() {
  const ph = lbPhotos[lbIdx];
  if (!ph) return;
  document.getElementById('lb-img').src = ph.url;
  document.getElementById('lb-caption').textContent = ph.caption || '';
  document.getElementById('lb').classList.add('on');
}

function lbClose() { document.getElementById('lb').classList.remove('on') }

function lbNav(d) {
  lbIdx = (lbIdx + d + lbPhotos.length) % lbPhotos.length;
  lbShow();
}

document.addEventListener('keydown', e => {
  if (!document.getElementById('lb').classList.contains('on')) return;
  if (e.key === 'ArrowRight') lbNav(1);
  if (e.key === 'ArrowLeft') lbNav(-1);
  if (e.key === 'Escape') lbClose();
});


// ── BLOG ─────────────────────────────────────────────
function blogRow(post) {
  const imgHtml = post.coverImage
    ? `<img src="${post.coverImage}" alt="${post.title}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.innerHTML='<div class=\\'blog-thumb-ph\\'>✍️</div>'">`
    : `<div class="blog-thumb-ph">✍️</div>`;
  return `<div class="blog-item" onclick="openPost('${post.id}')">
    <div class="blog-thumb">${imgHtml}</div>
    <div class="blog-info">
      <div class="blog-cat">${post.category || 'Journal'}</div>
      <h3 class="blog-title">${post.title}</h3>
      <p class="blog-excerpt">${post.excerpt || strip(post.content).slice(0, 180)}</p>
      <div class="blog-meta-row"><span>${fmtDate(post.date)}</span><span>${post.category || 'Journal'}</span></div>
    </div>
  </div>`;
}

function rBlog() {
  const posts = gB().filter(p => p.status === 'published');
  const el = document.getElementById('blog-list');
  const em = document.getElementById('blog-empty');
  if (posts.length) { el.innerHTML = posts.map(blogRow).join(''); em.style.display = 'none'; }
  else { el.innerHTML = ''; em.style.display = 'block'; }
}

function openPost(id) {
  const post = gB().find(p => p.id === id);
  if (!post) return;
  document.getElementById('post-eyebrow').textContent = post.category || 'Journal';
  document.getElementById('post-h1').textContent = post.title;
  document.getElementById('post-byline').innerHTML = `<span>${fmtDate(post.date)}</span><span>${post.category}</span>`;
  const bg = document.getElementById('post-hero-bg');
  bg.innerHTML = post.coverImage
    ? `<img src="${post.coverImage}" alt="${post.title}"><div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(8,8,8,0.97) 0%,rgba(8,8,8,0.3) 70%,transparent)"></div>`
    : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#12100e,#080808)"></div>`;
  document.getElementById('post-body').innerHTML = post.content;
  document.querySelectorAll('.pg').forEach(p => p.classList.remove('on'));
  document.getElementById('pg-post').classList.add('on');
  window.scrollTo(0, 0);
}


// ── ABOUT ────────────────────────────────────────────
function rAbout() {
  const s = gS();
  document.getElementById('about-name-full').textContent = s.name || 'Your Name';
  document.getElementById('about-bio-full').textContent = s.bio || '';
  document.getElementById('about-email').textContent = s.email || '';
  const tags = (s.skills || '').split(',').map(x => x.trim()).filter(Boolean);
  document.getElementById('about-tags-full').innerHTML = tags.map(t => `<span class="tag">${t}</span>`).join('');
  const img = document.getElementById('about-img-full');
  img.innerHTML = s.avatar
    ? `<img src="${s.avatar}" alt="${s.name}" style="width:100%;height:100%;object-fit:cover">`
    : `<div class="about-img-ph">📷</div>`;
}


// ── CONTACT ──────────────────────────────────────────
function sendMsg() {
  const name = document.getElementById('cf-name').value.trim();
  const email = document.getElementById('cf-email').value.trim();
  const msg = document.getElementById('cf-msg').value.trim();
  if (!name || !email || !msg) { alert('Please fill all fields.'); return; }
  const msgs = gM();
  msgs.push({ id: uid(), name, email, message: msg, date: new Date().toISOString() });
  DB.s('s_msgs', msgs);
  document.getElementById('cf-name').value = '';
  document.getElementById('cf-email').value = '';
  document.getElementById('cf-msg').value = '';
  const ok = document.getElementById('cf-ok');
  ok.style.display = 'block';
  setTimeout(() => ok.style.display = 'none', 5000);
}


// ── ADMIN ────────────────────────────────────────────
let loggedIn = false;
let mmView = 'grid'; // 'grid' or 'table'
let mmFilterCat = 'All';
let mmSearch = '';

function doLogin() {
  const pw = document.getElementById('adm-pw').value;
  const s = gS();
  if (pw === (s.password || 'admin123')) {
    loggedIn = true;
    document.getElementById('adm-login').style.display = 'none';
    document.getElementById('adm-panel').style.display = 'grid';
    rDash();
  } else {
    document.getElementById('adm-err').style.display = 'block';
  }
}

function doLogout() {
  loggedIn = false;
  document.getElementById('adm-login').style.display = 'flex';
  document.getElementById('adm-panel').style.display = 'none';
  document.getElementById('adm-pw').value = '';
  document.getElementById('adm-err').style.display = 'none';
}

function rAdmin() {
  if (loggedIn) {
    document.getElementById('adm-login').style.display = 'none';
    document.getElementById('adm-panel').style.display = 'grid';
    rDash();
  } else {
    document.getElementById('adm-login').style.display = 'flex';
    document.getElementById('adm-panel').style.display = 'none';
  }
}

function aSection(id) {
  document.querySelectorAll('.as').forEach(a => a.classList.remove('on'));
  document.querySelectorAll('.adm-sb-btn').forEach(b => b.classList.remove('on'));
  document.getElementById('as-' + id).classList.add('on');
  const sb = document.getElementById('asb-' + id);
  if (sb) sb.classList.add('on');
  if (id === 'dash') rDash();
  if (id === 'photos') {
    rAdmPhotos();
    initDropZone();
  }
  if (id === 'posts') rAdmPosts();
  if (id === 'settings') loadSettings();
  if (id === 'messages') rMsgs();
  if (id === 'new-post') {
    document.getElementById('ed-id').value = '';
    document.getElementById('ed-title').textContent = 'New Post';
    clearEditor();
  }
}


// ── ADMIN: DASHBOARD ─────────────────────────────────
function rDash() {
  const photos = gP();
  const cats = getUsedCategories(photos);
  document.getElementById('st-ph').textContent = photos.length;
  document.getElementById('st-po').textContent = gB().length;
  document.getElementById('st-ms').textContent = gM().length;
  document.getElementById('st-cat').textContent = cats.length;
  const recent = gB().slice(-3).reverse();
  document.getElementById('dash-recent').innerHTML = recent.length
    ? `<table class="adm-tbl"><thead><tr><th>Title</th><th>Status</th><th>Date</th></tr></thead><tbody>${recent.map(p => `<tr><td>${p.title}</td><td class="${p.status === 'published' ? 'pub' : 'dft'}">${p.status}</td><td>${fmtDate(p.date)}</td></tr>`).join('')}</tbody></table>`
    : `<p style="color:var(--muted);font-size:0.85rem">No posts yet.</p>`;
}


// ── ADMIN: MEDIA MANAGER ─────────────────────────────
function rAdmPhotos() {
  const photos = gP();
  const cats = gC();
  const usedCats = getUsedCategories(photos);

  // Category manager
  renderCatManager(cats, photos);

  // Populate upload category dropdown
  const phCatSel = document.getElementById('ph-cat');
  if (phCatSel) {
    let phOpts = '<option value="">— None —</option>';
    cats.forEach(c => { phOpts += `<option value="${esc(c)}">${c}</option>`; });
    phCatSel.innerHTML = phOpts;
  }

  // Toolbar: category filter dropdown
  const filterSel = document.getElementById('mm-filter-cat');
  let filterOpts = '<option value="All">All Categories</option>';
  cats.forEach(c => {
    filterOpts += `<option value="${esc(c)}" ${mmFilterCat === c ? 'selected' : ''}>${c}</option>`;
  });
  // Also add any used categories not in the managed list
  usedCats.forEach(c => {
    if (!cats.includes(c)) filterOpts += `<option value="${esc(c)}" ${mmFilterCat === c ? 'selected' : ''}>${c} ⚠</option>`;
  });
  filterSel.innerHTML = filterOpts;

  // Search
  document.getElementById('mm-search').value = mmSearch;

  // View toggle
  document.querySelectorAll('.mm-view-btn').forEach(b => {
    b.classList.toggle('on', b.dataset.view === mmView);
  });

  // Filter & search photos
  let filtered = photos;
  if (mmFilterCat !== 'All') filtered = filtered.filter(p => p.category === mmFilterCat);
  if (mmSearch) {
    const q = mmSearch.toLowerCase();
    filtered = filtered.filter(p => (p.caption || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q));
  }

  // Stats
  const featured = photos.filter(p => p.featured).length;
  const uncategorized = photos.filter(p => !p.category).length;
  document.getElementById('mm-stats').innerHTML = `
    <span class="mm-stat"><strong>${photos.length}</strong> Total</span>
    <span class="mm-stat"><strong>${featured}</strong> Featured</span>
    <span class="mm-stat"><strong>${usedCats.length}</strong> Categories</span>
    ${uncategorized ? `<span class="mm-stat"><strong>${uncategorized}</strong> Uncategorized</span>` : ''}
  `;

  // Render grid or table
  const container = document.getElementById('mm-content');
  const emptyEl = document.getElementById('photos-empty');

  if (!filtered.length) {
    container.innerHTML = '';
    emptyEl.style.display = 'block';
    return;
  }
  emptyEl.style.display = 'none';

  if (mmView === 'grid') {
    container.innerHTML = `<div class="mm-grid">${filtered.map((ph, i) => {
      const realIdx = photos.indexOf(ph);
      return mmCardHtml(ph, realIdx);
    }).join('')}</div>`;
  } else {
    container.innerHTML = `<table class="adm-tbl">
      <thead><tr><th></th><th>Caption</th><th>Category</th><th>Featured</th><th>Date</th><th>Actions</th></tr></thead>
      <tbody>${filtered.map(ph => {
        const realIdx = photos.indexOf(ph);
        return `<tr>
          <td><img class="tbl-thumb" src="${ph.url}" onerror="this.style.display='none'" alt=""></td>
          <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${ph.caption || '<span style="color:var(--muted);font-style:italic">No caption</span>'}</td>
          <td>${ph.category ? `<span class="mm-cat-label">${ph.category}</span>` : '<span style="color:var(--muted)">—</span>'}</td>
          <td>${ph.featured ? '<span class="mm-featured-badge">★ Yes</span>' : '<span style="color:var(--muted)">—</span>'}</td>
          <td style="color:var(--muted);white-space:nowrap">${fmtDate(ph.date)}</td>
          <td style="white-space:nowrap">
            <button class="btn-ed" onclick="openPhotoEdit(${realIdx})">Edit</button>
            <button class="btn-del" onclick="delPhoto(${realIdx})">Del</button>
          </td>
        </tr>`;
      }).join('')}</tbody>
    </table>`;
  }
}

function mmCardHtml(ph, idx) {
  const captionClass = ph.caption ? '' : ' empty';
  const captionText = ph.caption || 'No caption — click edit to add';
  return `<div class="mm-card">
    <div class="mm-card-img" onclick="lbPhotos=gP();lbIdx=${idx};lbShow()">
      <img src="${ph.url}" alt="${ph.caption || ''}" loading="lazy" onerror="this.style.display='none'">
    </div>
    <div class="mm-card-body">
      <div class="mm-card-caption${captionClass}">${captionText}</div>
      ${ph.category ? `<div class="mm-card-cat"><span class="mm-cat-label">${ph.category}</span></div>` : ''}
      <div class="mm-card-meta">
        <span class="mm-card-date">${ph.featured ? '★ ' : ''}${fmtDate(ph.date)}</span>
        <div class="mm-card-actions">
          <button onclick="openPhotoEdit(${idx})" title="Edit">✎</button>
          <button class="mm-act-del" onclick="delPhoto(${idx})" title="Delete">✕</button>
        </div>
      </div>
    </div>
  </div>`;
}

function setMMView(view) {
  mmView = view;
  rAdmPhotos();
}

function setMMFilter() {
  mmFilterCat = document.getElementById('mm-filter-cat').value;
  rAdmPhotos();
}

function setMMSearch() {
  mmSearch = document.getElementById('mm-search').value;
  rAdmPhotos();
}


// ── CATEGORY MANAGER ─────────────────────────────────
function renderCatManager(cats, photos) {
  const el = document.getElementById('cat-manager-list');
  el.innerHTML = cats.map(c => {
    const count = photos.filter(p => p.category === c).length;
    return `<span class="cat-pill">
      ${c} <span class="cat-count">(${count})</span>
      <button class="cat-pill-del" onclick="removeCat('${esc(c)}')" title="Remove category">✕</button>
    </span>`;
  }).join('');
}

function addCat() {
  const inp = document.getElementById('cat-new-name');
  const name = inp.value.trim();
  if (!name) return;
  const cats = gC();
  if (cats.some(c => c.toLowerCase() === name.toLowerCase())) {
    toast('Category already exists.');
    return;
  }
  cats.push(name);
  DB.s('s_photo_cats', cats);
  inp.value = '';
  rAdmPhotos();
  toast('Category added!');
}

function removeCat(name) {
  const photos = gP();
  const count = photos.filter(p => p.category === name).length;
  const msg = count > 0
    ? `Remove "${name}"? ${count} photo(s) will become uncategorized.`
    : `Remove category "${name}"?`;
  if (!confirm(msg)) return;
  // Remove from categories list
  const cats = gC().filter(c => c !== name);
  DB.s('s_photo_cats', cats);
  // Remove category from photos
  if (count > 0) {
    const updated = photos.map(p => p.category === name ? { ...p, category: '' } : p);
    DB.s('s_photos', updated);
  }
  rAdmPhotos();
  toast('Category removed.');
}


// ── PHOTO ADD / UPLOAD ───────────────────────────────
function addPhotoURL() {
  const url = document.getElementById('ph-url').value.trim();
  if (!url) { alert('Enter a URL.'); return; }
  const cap = document.getElementById('ph-cap').value.trim();
  const cat = document.getElementById('ph-cat').value;
  const p = gP();
  p.push({ id: uid(), url, caption: cap, category: cat, featured: false, date: new Date().toISOString() });
  DB.s('s_photos', p);
  document.getElementById('ph-url').value = '';
  document.getElementById('ph-cap').value = '';
  rAdmPhotos();
  toast('Photo added!');
}

function handleFiles(inp) {
  const files = inp instanceof Event ? inp.target.files : inp;
  if (!files || !files.length) return;
  const p = gP();
  const cat = document.getElementById('ph-cat').value;
  let c = 0;
  let total = files.length;
  
  Array.from(files).forEach(f => {
    if (!f.type.startsWith('image/')) {
        total--;
        if (total === 0) return;
        return;
    }
    const r = new FileReader();
    r.onload = ev => {
      p.push({
        id: uid(),
        url: ev.target.result,
        caption: f.name.replace(/\.[^.]+$/, ''),
        category: cat,
        featured: false,
        date: new Date().toISOString()
      });
      try {
        DB.s('s_photos', p);
        c++;
      } catch (err) {
        toast('Error saving: storage may be full.');
        return;
      }
      if (c === total) {
        rAdmPhotos();
        toast(`${c} photo(s) uploaded!`);
      }
    };
    r.readAsDataURL(f);
  });
  
  if (inp instanceof Event) inp.target.value = '';
}

function initDropZone() {
  const dz = document.getElementById('drop-zone');
  if (!dz || dz.dataset.init) return;
  dz.dataset.init = 'true';

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(e => {
    dz.addEventListener(e, ev => {
      ev.preventDefault();
      ev.stopPropagation();
    });
  });

  ['dragenter', 'dragover'].forEach(e => {
    dz.addEventListener(e, () => dz.classList.add('drag'));
  });

  ['dragleave', 'drop'].forEach(e => {
    dz.addEventListener(e, () => dz.classList.remove('drag'));
  });

  dz.addEventListener('drop', ev => {
    handleFiles(ev.dataTransfer.files);
  });
}

function delPhoto(i) {
  if (!confirm('Remove photo?')) return;
  const p = gP();
  p.splice(i, 1);
  DB.s('s_photos', p);
  rAdmPhotos();
  toast('Removed.');
}


// ── PHOTO EDIT MODAL ─────────────────────────────────
let editingPhotoIdx = -1;

function openPhotoEdit(idx) {
  editingPhotoIdx = idx;
  const photos = gP();
  const ph = photos[idx];
  if (!ph) return;

  document.getElementById('pe-preview').innerHTML = `<img src="${ph.url}" alt="">`;
  document.getElementById('pe-caption').value = ph.caption || '';
  document.getElementById('pe-featured').checked = !!ph.featured;

  // Populate category dropdown
  const cats = gC();
  const sel = document.getElementById('pe-category');
  let opts = '<option value="">— None —</option>';
  cats.forEach(c => {
    opts += `<option value="${esc(c)}" ${ph.category === c ? 'selected' : ''}>${c}</option>`;
  });
  // If current category isn't in the list, still show it
  if (ph.category && !cats.includes(ph.category)) {
    opts += `<option value="${esc(ph.category)}" selected>${ph.category}</option>`;
  }
  sel.innerHTML = opts;

  document.getElementById('pe-date').textContent = fmtDate(ph.date);
  document.getElementById('pe-size').textContent = ph.url.startsWith('data:')
    ? formatBytes(ph.url.length * 0.75)
    : 'External URL';

  document.getElementById('photo-edit-modal').classList.add('on');
}

function closePhotoEdit() {
  document.getElementById('photo-edit-modal').classList.remove('on');
  editingPhotoIdx = -1;
}

function savePhotoEdit() {
  if (editingPhotoIdx < 0) return;
  const photos = gP();
  const ph = photos[editingPhotoIdx];
  ph.caption = document.getElementById('pe-caption').value.trim();
  ph.category = document.getElementById('pe-category').value;
  ph.featured = document.getElementById('pe-featured').checked;
  DB.s('s_photos', photos);
  closePhotoEdit();
  rAdmPhotos();
  toast('Photo updated!');
}

// Close modal on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.getElementById('photo-edit-modal').classList.contains('on')) {
    closePhotoEdit();
  }
});


// ── ADMIN: POSTS ─────────────────────────────────────
function rAdmPosts() {
  const posts = gB();
  const tb = document.getElementById('posts-tbl');
  const em = document.getElementById('posts-empty');
  if (!posts.length) { tb.innerHTML = ''; em.style.display = 'block'; return; }
  em.style.display = 'none';
  tb.innerHTML = posts.slice().reverse().map(p => `<tr>
    <td>${p.coverImage ? `<img class="tbl-thumb" src="${p.coverImage}" onerror="this.style.display='none'">` : '<div class="tbl-thumb" style="display:flex;align-items:center;justify-content:center;color:var(--muted)">✍️</div>'}</td>
    <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.title}</td>
    <td style="color:var(--muted)">${p.category}</td>
    <td style="color:var(--muted)">${fmtDate(p.date)}</td>
    <td class="${p.status === 'published' ? 'pub' : 'dft'}">${p.status}</td>
    <td style="white-space:nowrap"><button class="btn-ed" onclick="editPost('${p.id}')">Edit</button><button class="btn-del" onclick="delPost('${p.id}')">Del</button></td>
  </tr>`).join('');
}

function clearEditor() {
  ['ed-ttl', 'ed-img', 'ed-exc', 'ed-body'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('ed-cat').value = 'Behind the Lens';
  document.getElementById('ed-status').value = 'published';
}

function editPost(id) {
  const p = gB().find(x => x.id === id);
  if (!p) return;
  document.getElementById('ed-id').value = id;
  document.getElementById('ed-title').textContent = 'Edit Post';
  document.getElementById('ed-ttl').value = p.title;
  document.getElementById('ed-cat').value = p.category;
  document.getElementById('ed-status').value = p.status;
  document.getElementById('ed-img').value = p.coverImage || '';
  document.getElementById('ed-exc').value = p.excerpt || '';
  document.getElementById('ed-body').value = p.content;
  aSection('new-post');
  document.getElementById('as-new-post').classList.add('on');
}

function savePost() {
  const title = document.getElementById('ed-ttl').value.trim();
  if (!title) { alert('Enter a title.'); return; }
  const eid = document.getElementById('ed-id').value;
  const posts = gB();
  const data = {
    id: eid || uid(),
    title,
    category: document.getElementById('ed-cat').value,
    status: document.getElementById('ed-status').value,
    coverImage: document.getElementById('ed-img').value.trim(),
    excerpt: document.getElementById('ed-exc').value.trim(),
    content: document.getElementById('ed-body').value,
    date: eid ? posts.find(p => p.id === eid)?.date : new Date().toISOString()
  };
  if (eid) {
    const i = posts.findIndex(p => p.id === eid);
    posts[i] = data;
  } else {
    posts.push(data);
  }
  DB.s('s_posts', posts);
  toast('Post saved!');
  aSection('posts');
}

function delPost(id) {
  if (!confirm('Delete this post?')) return;
  DB.s('s_posts', gB().filter(p => p.id !== id));
  rAdmPosts();
  rDash();
  toast('Deleted.');
}


// ── ADMIN: SETTINGS ──────────────────────────────────
function loadSettings() {
  const s = gS();
  document.getElementById('s-name').value = s.name || '';
  document.getElementById('s-tag').value = s.tagline || '';
  document.getElementById('s-bio').value = s.bio || '';
  document.getElementById('s-skills').value = s.skills || '';
  document.getElementById('s-email').value = s.email || '';
  document.getElementById('s-avatar').value = s.avatar || '';
  document.getElementById('s-hero').value = s.heroH || '';
  document.getElementById('s-hsub').value = s.heroSub || '';
  document.getElementById('s-pw').value = '';
  const av = document.getElementById('s-av-prev');
  av.innerHTML = s.avatar
    ? `<img src="${s.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
    : `<span>📷</span>`;
  document.getElementById('av-file-name').textContent = '';
}

let cropper = null;

function updateAvatarPrev() {
  const url = document.getElementById('s-avatar').value.trim();
  const av = document.getElementById('s-av-prev');
  if (url) {
    av.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" onerror="this.parentElement.innerHTML='<span>📷</span>'">`;
  } else {
    av.innerHTML = `<span>📷</span>`;
  }
}

function editAvatar() {
  const url = document.getElementById('s-avatar').value.trim();
  if (!url) {
    toast('Choose a photo first!');
    return;
  }
  openCrop(url);
}

function cropUrlAvatar() {
  const url = document.getElementById('s-avatar').value.trim();
  if (!url) {
    toast('Enter an image URL first.');
    return;
  }
  openCrop(url);
}

function openCrop(src) {
  console.log('openCrop triggered with src:', src ? src.slice(0, 50) + '...' : 'empty');
  const modal = document.getElementById('crop-modal');
  const img = document.getElementById('crop-img');
  
  if (!modal || !img) {
    console.error('Crop modal or image element NOT found!');
    return;
  }

  // Set crossOrigin if it's an external URL to avoid tainted canvas issues
  if (typeof src === 'string' && src.startsWith('http')) {
    img.crossOrigin = 'anonymous';
  } else {
    img.removeAttribute('crossOrigin');
  }
  
  // Assign handlers BEFORE setting src
  img.onload = () => {
    console.log('Image loaded, initializing cropper.');
    if (cropper) cropper.destroy();
    cropper = new Cropper(img, {
      aspectRatio: 1,
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 0.8,
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
    });
  };
  
  img.onerror = () => {
    console.error('Error loading image into cropper.');
    toast('Error loading image. Is the URL valid?');
    closeCrop();
  };

  img.src = src;
  modal.classList.add('on');
}

function handleAvatarFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (ev) {
    openCrop(ev.target.result);
  };
  reader.readAsDataURL(file);
}

function closeCrop() {
  document.getElementById('crop-modal').classList.remove('on');
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
}

function applyCrop() {
  if (!cropper) return;
  const canvas = cropper.getCroppedCanvas({
    maxWidth: 1600,
    maxHeight: 1600,
    // Keep aspect ratio 1:1 for avatar
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high'
  });
  const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
  document.getElementById('s-avatar').value = dataUrl;
  const av = document.getElementById('s-av-prev');
  av.innerHTML = `<img src="${dataUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
  document.getElementById('av-file-name').textContent = '✦ (Cropped image ready)';
  closeCrop();
  toast('Photo cropped! Click "Save All Changes" below to finish.');
}

function saveSettings() {
  const s = gS();
  const np = document.getElementById('s-pw').value;
  const avatarVal = document.getElementById('s-avatar').value.trim();
  const u = {
    ...s,
    name: document.getElementById('s-name').value.trim(),
    tagline: document.getElementById('s-tag').value.trim(),
    bio: document.getElementById('s-bio').value.trim(),
    skills: document.getElementById('s-skills').value.trim(),
    email: document.getElementById('s-email').value.trim(),
    avatar: avatarVal,
    heroH: document.getElementById('s-hero').value.trim(),
    heroSub: document.getElementById('s-hsub').value.trim(),
    password: np || s.password
  };
  DB.s('s_cfg', u);
  toast('Settings saved!');
}


// ── ADMIN: MESSAGES ──────────────────────────────────
function rMsgs() {
  const msgs = gM();
  const tb = document.getElementById('msgs-tbl');
  const em = document.getElementById('msgs-empty');
  if (!msgs.length) { tb.innerHTML = ''; em.style.display = 'block'; return; }
  em.style.display = 'none';
  tb.innerHTML = msgs.slice().reverse().map(m => `<tr class="msg-row">
    <td>${m.name}</td><td style="color:var(--gold)">${m.email}</td>
    <td class="msg-txt">${m.message}</td><td style="white-space:nowrap">${fmtDate(m.date)}</td>
    <td><button class="btn-del" onclick="delMsg('${m.id}')">Del</button></td>
  </tr>`).join('');
}

function delMsg(id) {
  if (!confirm('Delete?')) return;
  DB.s('s_msgs', gM().filter(m => m.id !== id));
  rMsgs();
}


// ── UTILITIES ────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
}

function strip(h) {
  return h ? (h.replace ? h.replace(/<[^>]*>/g, '') : '') : '';
}

function esc(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = '✦ ' + msg;
  t.classList.add('on');
  setTimeout(() => t.classList.remove('on'), 3000);
}


// ── INIT ─────────────────────────────────────────────
rHome();
