// ════════════════════════════════════════════════════
//  LENS — Photography Portfolio
//  Main Application Script (Supabase Backend)
// ════════════════════════════════════════════════════

// ── SUPABASE CONFIGURATION ───────────────────────────
const SUPABASE_URL = 'https://opfsancaxyqrkkixjrse.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wZnNhbmNheHlxcmtraXhqcnNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4ODcwNzYsImV4cCI6MjA2MDQ2MzA3Nn0.dMqJGCp81cfY5s8Q0gZFsJoS8LEgLw0BeSFn2-zyb1Q';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── DATA CACHE ───────────────────────────────────────
let dataCache = {
  settings: null,
  photos: [],
  posts: [],
  messages: [],
  categories: []
};

// ── DATA LAYER (Supabase) ────────────────────────────
async function loadAllData() {
  try {
    const [settingsRes, photosRes, postsRes, messagesRes, categoriesRes] = await Promise.all([
      supabase.from('settings').select('*').limit(1).single(),
      supabase.from('photos').select('*').order('created_at', { ascending: false }),
      supabase.from('posts').select('*').order('created_at', { ascending: false }),
      supabase.from('messages').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('sort_order', { ascending: true })
    ]);

    dataCache.settings = settingsRes.data || getDefaultSettings();
    dataCache.photos = photosRes.data || [];
    dataCache.posts = postsRes.data || [];
    dataCache.messages = messagesRes.data || [];
    dataCache.categories = categoriesRes.data || [];

    return true;
  } catch (err) {
    console.error('Error loading data:', err);
    return false;
  }
}

function getDefaultSettings() {
  return {
    name: 'Your Name',
    tagline: 'Portrait · Landscape · Documentary',
    bio: 'Update your bio in Admin → Settings.',
    skills: 'Portraits,Landscape,Travel',
    email: 'you@email.com',
    avatar: '',
    password: 'admin123',
    hero_heading: 'Capturing<br><em>Light &</em><br>Stillness',
    hero_subheading: 'Visual stories told through the lens — portraits, landscapes, and the quiet in-between moments.'
  };
}

// Getters (from cache)
const gS = () => dataCache.settings || getDefaultSettings();
const gP = () => dataCache.photos || [];
const gB = () => dataCache.posts || [];
const gM = () => dataCache.messages || [];
const gC = () => dataCache.categories.map(c => c.name) || [];


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
  document.getElementById('hero-h1').innerHTML = s.hero_heading || 'Capturing<br><em>Light &</em><br>Stillness';
  document.getElementById('hero-sub').textContent = s.hero_subheading || '';
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
  lbPhotos = allPhotos;
  const feat = document.getElementById('home-feat');
  if (!photos.length) {
    feat.innerHTML = `<div class="feat-main"><div class="feat-placeholder">📷</div></div><div class="feat-side"><div class="feat-placeholder">📷</div></div><div class="feat-side"><div class="feat-placeholder">📷</div></div>`;
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

  const filterWrap = document.getElementById('gallery-filters');
  const allCount = photos.length;
  let filterHtml = `<button class="gal-filter${galFilter === 'All' ? ' on' : ''}" onclick="setGalFilter('All')">All <span class="filter-count">${allCount}</span></button>`;
  cats.forEach(cat => {
    const count = photos.filter(p => p.category === cat).length;
    filterHtml += `<button class="gal-filter${galFilter === cat ? ' on' : ''}" onclick="setGalFilter('${esc(cat)}')">${cat} <span class="filter-count">${count}</span></button>`;
  });
  filterWrap.innerHTML = filterHtml;

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
  const imgHtml = post.cover_image
    ? `<img src="${post.cover_image}" alt="${post.title}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.innerHTML='<div class=\\'blog-thumb-ph\\'>✍️</div>'">`
    : `<div class="blog-thumb-ph">✍️</div>`;
  return `<div class="blog-item" onclick="openPost('${post.id}')">
    <div class="blog-thumb">${imgHtml}</div>
    <div class="blog-info">
      <div class="blog-cat">${post.category || 'Journal'}</div>
      <h3 class="blog-title">${post.title}</h3>
      <p class="blog-excerpt">${post.excerpt || strip(post.content).slice(0, 180)}</p>
      <div class="blog-meta-row"><span>${fmtDate(post.created_at)}</span><span>${post.category || 'Journal'}</span></div>
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
  document.getElementById('post-byline').innerHTML = `<span>${fmtDate(post.created_at)}</span><span>${post.category}</span>`;
  const bg = document.getElementById('post-hero-bg');
  bg.innerHTML = post.cover_image
    ? `<img src="${post.cover_image}" alt="${post.title}"><div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(8,8,8,0.97) 0%,rgba(8,8,8,0.3) 70%,transparent)"></div>`
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
async function sendMsg() {
  const name = document.getElementById('cf-name').value.trim();
  const email = document.getElementById('cf-email').value.trim();
  const message = document.getElementById('cf-msg').value.trim();
  if (!name || !email || !message) { alert('Please fill all fields.'); return; }

  try {
    const { error } = await supabase.from('messages').insert({ name, email, message });
    if (error) throw error;

    document.getElementById('cf-name').value = '';
    document.getElementById('cf-email').value = '';
    document.getElementById('cf-msg').value = '';
    const ok = document.getElementById('cf-ok');
    ok.style.display = 'block';
    setTimeout(() => ok.style.display = 'none', 5000);

    // Refresh messages cache
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    dataCache.messages = data || [];
  } catch (err) {
    console.error('Error sending message:', err);
    toast('Error sending message. Please try again.');
  }
}


// ── ADMIN ────────────────────────────────────────────
let loggedIn = false;
let mmView = 'grid';
let mmFilterCat = 'All';
let mmSearch = '';

async function doLogin() {
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
  const recent = gB().slice(0, 3);
  document.getElementById('dash-recent').innerHTML = recent.length
    ? `<table class="adm-tbl"><thead><tr><th>Title</th><th>Status</th><th>Date</th></tr></thead><tbody>${recent.map(p => `<tr><td>${p.title}</td><td class="${p.status === 'published' ? 'pub' : 'dft'}">${p.status}</td><td>${fmtDate(p.created_at)}</td></tr>`).join('')}</tbody></table>`
    : `<p style="color:var(--muted);font-size:0.85rem">No posts yet.</p>`;
}


// ── ADMIN: MEDIA MANAGER ─────────────────────────────
function rAdmPhotos() {
  const photos = gP();
  const cats = gC();
  const usedCats = getUsedCategories(photos);

  renderCatManager(cats, photos);

  const phCatSel = document.getElementById('ph-cat');
  if (phCatSel) {
    let phOpts = '<option value="">— None —</option>';
    cats.forEach(c => { phOpts += `<option value="${esc(c)}">${c}</option>`; });
    phCatSel.innerHTML = phOpts;
  }

  const filterSel = document.getElementById('mm-filter-cat');
  let filterOpts = '<option value="All">All Categories</option>';
  cats.forEach(c => {
    filterOpts += `<option value="${esc(c)}" ${mmFilterCat === c ? 'selected' : ''}>${c}</option>`;
  });
  usedCats.forEach(c => {
    if (!cats.includes(c)) filterOpts += `<option value="${esc(c)}" ${mmFilterCat === c ? 'selected' : ''}>${c} ⚠</option>`;
  });
  filterSel.innerHTML = filterOpts;

  document.getElementById('mm-search').value = mmSearch;

  document.querySelectorAll('.mm-view-btn').forEach(b => {
    b.classList.toggle('on', b.dataset.view === mmView);
  });

  let filtered = photos;
  if (mmFilterCat !== 'All') filtered = filtered.filter(p => p.category === mmFilterCat);
  if (mmSearch) {
    const q = mmSearch.toLowerCase();
    filtered = filtered.filter(p => (p.caption || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q));
  }

  const featured = photos.filter(p => p.featured).length;
  const uncategorized = photos.filter(p => !p.category).length;
  document.getElementById('mm-stats').innerHTML = `
    <span class="mm-stat"><strong>${photos.length}</strong> Total</span>
    <span class="mm-stat"><strong>${featured}</strong> Featured</span>
    <span class="mm-stat"><strong>${usedCats.length}</strong> Categories</span>
    ${uncategorized ? `<span class="mm-stat"><strong>${uncategorized}</strong> Uncategorized</span>` : ''}
  `;

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
          <td style="color:var(--muted);white-space:nowrap">${fmtDate(ph.created_at)}</td>
          <td style="white-space:nowrap">
            <button class="btn-ed" onclick="openPhotoEdit('${ph.id}')">Edit</button>
            <button class="btn-del" onclick="delPhoto('${ph.id}')">Del</button>
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
        <span class="mm-card-date">${ph.featured ? '★ ' : ''}${fmtDate(ph.created_at)}</span>
        <div class="mm-card-actions">
          <button onclick="openPhotoEdit('${ph.id}')" title="Edit">✎</button>
          <button class="mm-act-del" onclick="delPhoto('${ph.id}')" title="Delete">✕</button>
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

async function addCat() {
  const inp = document.getElementById('cat-new-name');
  const name = inp.value.trim();
  if (!name) return;
  const cats = gC();
  if (cats.some(c => c.toLowerCase() === name.toLowerCase())) {
    toast('Category already exists.');
    return;
  }

  try {
    const { error } = await supabase.from('categories').insert({ name, sort_order: cats.length });
    if (error) throw error;

    // Refresh categories
    const { data } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
    dataCache.categories = data || [];
    inp.value = '';
    rAdmPhotos();
    toast('Category added!');
  } catch (err) {
    console.error('Error adding category:', err);
    toast('Error adding category.');
  }
}

async function removeCat(name) {
  const photos = gP();
  const count = photos.filter(p => p.category === name).length;
  const msg = count > 0
    ? `Remove "${name}"? ${count} photo(s) will become uncategorized.`
    : `Remove category "${name}"?`;
  if (!confirm(msg)) return;

  try {
    // Remove category from photos first
    if (count > 0) {
      await supabase.from('photos').update({ category: '' }).eq('category', name);
    }

    // Remove category
    const { error } = await supabase.from('categories').delete().eq('name', name);
    if (error) throw error;

    // Refresh data
    const [photosRes, catsRes] = await Promise.all([
      supabase.from('photos').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('sort_order', { ascending: true })
    ]);
    dataCache.photos = photosRes.data || [];
    dataCache.categories = catsRes.data || [];

    rAdmPhotos();
    toast('Category removed.');
  } catch (err) {
    console.error('Error removing category:', err);
    toast('Error removing category.');
  }
}


// ── PHOTO ADD / UPLOAD ───────────────────────────────
async function addPhotoURL() {
  let url = document.getElementById('ph-url').value.trim();
  if (!url) { alert('Enter a URL.'); return; }

  const cap = document.getElementById('ph-cap').value.trim();
  const cat = document.getElementById('ph-cat').value;

  try {
    const { error } = await supabase.from('photos').insert({
      url,
      caption: cap,
      category: cat,
      featured: false
    });
    if (error) throw error;

    // Refresh photos
    const { data } = await supabase.from('photos').select('*').order('created_at', { ascending: false });
    dataCache.photos = data || [];

    document.getElementById('ph-url').value = '';
    document.getElementById('ph-cap').value = '';
    rAdmPhotos();
    toast('Photo added!');
  } catch (err) {
    console.error('Error adding photo:', err);
    toast('Error adding photo.');
  }
}

async function handleFiles(inp) {
  const files = inp instanceof Event ? inp.target.files : inp;
  if (!files || !files.length) return;
  const cat = document.getElementById('ph-cat').value;
  let c = 0;
  let total = files.length;

  toast(`Processing ${total} photo(s)...`);

  for (const f of Array.from(files)) {
    if (!f.type.startsWith('image/')) {
      total--; continue;
    }

    // For uploaded files, we need to convert to data URL
    // Note: For production, you'd want to upload to Supabase Storage
    await new Promise((resolve) => {
      const r = new FileReader();
      r.onload = async (ev) => {
        try {
          const { error } = await supabase.from('photos').insert({
            url: ev.target.result,
            caption: f.name.replace(/\.[^.]+$/, ''),
            category: cat,
            featured: false
          });
          if (!error) c++;
        } catch (err) {
          console.error(err);
        }
        resolve();
      };
      r.readAsDataURL(f);
    });
  }

  // Refresh photos
  const { data } = await supabase.from('photos').select('*').order('created_at', { ascending: false });
  dataCache.photos = data || [];

  if (c > 0) {
    rAdmPhotos();
    toast(`${c} photo(s) uploaded!`);
  }
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

async function delPhoto(id) {
  if (!confirm('Remove photo?')) return;

  try {
    const { error } = await supabase.from('photos').delete().eq('id', id);
    if (error) throw error;

    // Refresh photos
    const { data } = await supabase.from('photos').select('*').order('created_at', { ascending: false });
    dataCache.photos = data || [];

    rAdmPhotos();
    toast('Removed.');
  } catch (err) {
    console.error('Error deleting photo:', err);
    toast('Error deleting photo.');
  }
}


// ── PHOTO EDIT MODAL ─────────────────────────────────
let editingPhotoId = null;

function openPhotoEdit(id) {
  editingPhotoId = id;
  const photos = gP();
  const ph = photos.find(p => p.id === id);
  if (!ph) return;

  document.getElementById('pe-preview').innerHTML = `<img src="${ph.url}" alt="">`;
  document.getElementById('pe-caption').value = ph.caption || '';
  document.getElementById('pe-featured').checked = !!ph.featured;

  const cats = gC();
  const sel = document.getElementById('pe-category');
  let opts = '<option value="">— None —</option>';
  cats.forEach(c => {
    opts += `<option value="${esc(c)}" ${ph.category === c ? 'selected' : ''}>${c}</option>`;
  });
  if (ph.category && !cats.includes(ph.category)) {
    opts += `<option value="${esc(ph.category)}" selected>${ph.category}</option>`;
  }
  sel.innerHTML = opts;

  document.getElementById('pe-date').textContent = fmtDate(ph.created_at);
  document.getElementById('pe-size').textContent = ph.url.startsWith('data:')
    ? formatBytes(ph.url.length * 0.75)
    : 'External URL';

  document.getElementById('photo-edit-modal').classList.add('on');
}

function closePhotoEdit() {
  document.getElementById('photo-edit-modal').classList.remove('on');
  editingPhotoId = null;
}

async function savePhotoEdit() {
  if (!editingPhotoId) return;

  const caption = document.getElementById('pe-caption').value.trim();
  const category = document.getElementById('pe-category').value;
  const featured = document.getElementById('pe-featured').checked;

  try {
    const { error } = await supabase.from('photos').update({
      caption,
      category,
      featured,
      updated_at: new Date().toISOString()
    }).eq('id', editingPhotoId);

    if (error) throw error;

    // Refresh photos
    const { data } = await supabase.from('photos').select('*').order('created_at', { ascending: false });
    dataCache.photos = data || [];

    closePhotoEdit();
    rAdmPhotos();
    toast('Photo updated!');
  } catch (err) {
    console.error('Error updating photo:', err);
    toast('Error updating photo.');
  }
}

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
  tb.innerHTML = posts.map(p => `<tr>
    <td>${p.cover_image ? `<img class="tbl-thumb" src="${p.cover_image}" onerror="this.style.display='none'">` : '<div class="tbl-thumb" style="display:flex;align-items:center;justify-content:center;color:var(--muted)">✍️</div>'}</td>
    <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.title}</td>
    <td style="color:var(--muted)">${p.category}</td>
    <td style="color:var(--muted)">${fmtDate(p.created_at)}</td>
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
  document.getElementById('ed-img').value = p.cover_image || '';
  document.getElementById('ed-exc').value = p.excerpt || '';
  document.getElementById('ed-body').value = p.content;
  aSection('new-post');
  document.getElementById('as-new-post').classList.add('on');
}

async function savePost() {
  const title = document.getElementById('ed-ttl').value.trim();
  if (!title) { alert('Enter a title.'); return; }
  const eid = document.getElementById('ed-id').value;

  const data = {
    title,
    category: document.getElementById('ed-cat').value,
    status: document.getElementById('ed-status').value,
    cover_image: document.getElementById('ed-img').value.trim(),
    excerpt: document.getElementById('ed-exc').value.trim(),
    content: document.getElementById('ed-body').value,
    updated_at: new Date().toISOString()
  };

  try {
    if (eid) {
      const { error } = await supabase.from('posts').update(data).eq('id', eid);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('posts').insert(data);
      if (error) throw error;
    }

    // Refresh posts
    const { data: postsData } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    dataCache.posts = postsData || [];

    toast('Post saved!');
    aSection('posts');
  } catch (err) {
    console.error('Error saving post:', err);
    toast('Error saving post.');
  }
}

async function delPost(id) {
  if (!confirm('Delete this post?')) return;

  try {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;

    // Refresh posts
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    dataCache.posts = data || [];

    rAdmPosts();
    rDash();
    toast('Deleted.');
  } catch (err) {
    console.error('Error deleting post:', err);
    toast('Error deleting post.');
  }
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
  document.getElementById('s-hero').value = s.hero_heading || '';
  document.getElementById('s-hsub').value = s.hero_subheading || '';
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
  const modal = document.getElementById('crop-modal');
  const img = document.getElementById('crop-img');

  if (!modal || !img) return;

  if (typeof src === 'string' && src.startsWith('http')) {
    img.crossOrigin = 'anonymous';
  } else {
    img.removeAttribute('crossOrigin');
  }

  img.onload = () => {
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

async function applyCrop() {
  if (!cropper) return;
  const canvas = cropper.getCroppedCanvas({
    maxWidth: 800,
    maxHeight: 800,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high'
  });
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  document.getElementById('s-avatar').value = dataUrl;
  const av = document.getElementById('s-av-prev');
  av.innerHTML = `<img src="${dataUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
  document.getElementById('av-file-name').textContent = '✦ (Cropped image ready)';
  closeCrop();
  toast('Photo cropped!');
}

async function saveSettings() {
  const s = gS();
  const np = document.getElementById('s-pw').value;

  const updatedSettings = {
    name: document.getElementById('s-name').value.trim(),
    tagline: document.getElementById('s-tag').value.trim(),
    bio: document.getElementById('s-bio').value.trim(),
    skills: document.getElementById('s-skills').value.trim(),
    email: document.getElementById('s-email').value.trim(),
    avatar: document.getElementById('s-avatar').value.trim(),
    hero_heading: document.getElementById('s-hero').value.trim(),
    hero_subheading: document.getElementById('s-hsub').value.trim(),
    password: np || s.password,
    updated_at: new Date().toISOString()
  };

  try {
    const { error } = await supabase.from('settings').update(updatedSettings).eq('id', s.id);
    if (error) throw error;

    // Refresh settings
    const { data } = await supabase.from('settings').select('*').limit(1).single();
    dataCache.settings = data || getDefaultSettings();

    toast('Settings saved!');
  } catch (err) {
    console.error('Error saving settings:', err);
    toast('Error saving settings.');
  }
}


// ── ADMIN: MESSAGES ──────────────────────────────────
function rMsgs() {
  const msgs = gM();
  const tb = document.getElementById('msgs-tbl');
  const em = document.getElementById('msgs-empty');
  if (!msgs.length) { tb.innerHTML = ''; em.style.display = 'block'; return; }
  em.style.display = 'none';
  tb.innerHTML = msgs.map(m => `<tr class="msg-row">
    <td>${m.name}</td><td style="color:var(--gold)">${m.email}</td>
    <td class="msg-txt">${m.message}</td><td style="white-space:nowrap">${fmtDate(m.created_at)}</td>
    <td><button class="btn-del" onclick="delMsg('${m.id}')">Del</button></td>
  </tr>`).join('');
}

async function delMsg(id) {
  if (!confirm('Delete?')) return;

  try {
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) throw error;

    // Refresh messages
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    dataCache.messages = data || [];

    rMsgs();
  } catch (err) {
    console.error('Error deleting message:', err);
    toast('Error deleting message.');
  }
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
async function init() {
  // Show loading state
  document.getElementById('hero-h1').innerHTML = 'Loading...';
  
  // Load all data from Supabase
  await loadAllData();
  
  // Render home page
  rHome();
}

// Start the app
init();
