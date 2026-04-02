// ════════════════════════════════════════════════════
//  LENS — Photography Portfolio
//  Main Application Script
// ════════════════════════════════════════════════════

// ── DATA LAYER ───────────────────────────────────────
const DB = {
  g: k => { try { return JSON.parse(localStorage.getItem(k)) } catch { return null } },
  s: (k, v) => localStorage.setItem(k, JSON.stringify(v))
};

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

  // Featured grid
  const photos = gP().slice(0, 3);
  const feat = document.getElementById('home-feat');
  if (!photos.length) {
    feat.innerHTML = `<div class="feat-main"><div class="feat-placeholder">📷</div></div><div class="feat-side"><div class="feat-placeholder">📷</div></div><div class="feat-side"><div class="feat-placeholder">📷</div></div>`;
    return;
  }

  let html = '';
  const heroP = photos[0];
  html += `<div class="feat-main" onclick="lbOpen(${0})"><img class="feat-img" src="${heroP.url}" alt="${heroP.caption || ''}" onerror="this.parentElement.innerHTML='<div class=\\'feat-placeholder\\'>📷</div>'"><div class="feat-overlay"></div><div class="feat-label"><div class="feat-label-cat">Featured</div><div class="feat-label-title">${heroP.caption || 'Untitled'}</div></div></div>`;

  [1, 2].forEach(i => {
    const ph = photos[i];
    if (ph) html += `<div class="feat-side" onclick="lbOpen(${i})"><img class="feat-img" src="${ph.url}" alt="${ph.caption || ''}" onerror="this.parentElement.innerHTML='<div class=\\'feat-placeholder\\'>📷</div>'"><div class="feat-overlay"></div><div class="feat-label"><div class="feat-label-cat">Gallery</div><div class="feat-label-title">${ph.caption || ''}</div></div></div>`;
    else html += `<div class="feat-side"><div class="feat-placeholder">📷</div></div>`;
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

function rGallery() {
  const photos = gP();
  lbPhotos = photos;
  const el = document.getElementById('gallery-masonry');
  const em = document.getElementById('gallery-empty');
  if (!photos.length) { el.innerHTML = ''; em.style.display = 'block'; return; }
  em.style.display = 'none';
  el.innerHTML = photos.map((ph, i) => `<div class="m-item" onclick="lbOpen(${i})">
    <img src="${ph.url}" alt="${ph.caption || ''}" loading="lazy" onerror="this.parentElement.style.display='none'">
    <div class="m-overlay"><div class="m-zoom">+</div></div>
    ${ph.caption ? `<div class="m-caption">${ph.caption}</div>` : ''}
  </div>`).join('');
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
  if (id === 'photos') rAdmPhotos();
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
  document.getElementById('st-ph').textContent = gP().length;
  document.getElementById('st-po').textContent = gB().length;
  document.getElementById('st-ms').textContent = gM().length;
  const recent = gB().slice(-3).reverse();
  document.getElementById('dash-recent').innerHTML = recent.length
    ? `<table class="adm-tbl"><thead><tr><th>Title</th><th>Status</th><th>Date</th></tr></thead><tbody>${recent.map(p => `<tr><td>${p.title}</td><td class="${p.status === 'published' ? 'pub' : 'dft'}">${p.status}</td><td>${fmtDate(p.date)}</td></tr>`).join('')}</tbody></table>`
    : `<p style="color:var(--muted);font-size:0.85rem">No posts yet.</p>`;
}


// ── ADMIN: PHOTOS ────────────────────────────────────
function rAdmPhotos() {
  const photos = gP();
  document.getElementById('adm-ph-grid').innerHTML = photos.map((ph, i) => `
    <div class="ph-th">
      <img src="${ph.url}" alt="${ph.caption || ''}" loading="lazy" onerror="this.parentElement.style.display='none'">
      <button class="ph-del" onclick="delPhoto(${i})" title="Remove">✕</button>
    </div>`).join('');
}

function addPhotoURL() {
  const url = document.getElementById('ph-url').value.trim();
  if (!url) { alert('Enter a URL.'); return; }
  const cap = document.getElementById('ph-cap').value.trim();
  const p = gP();
  p.push({ url, caption: cap, date: new Date().toISOString() });
  DB.s('s_photos', p);
  document.getElementById('ph-url').value = '';
  document.getElementById('ph-cap').value = '';
  rAdmPhotos();
  toast('Photo added!');
}

function handleFiles(e) {
  const p = gP();
  let c = 0;
  Array.from(e.target.files).forEach(f => {
    const r = new FileReader();
    r.onload = ev => {
      p.push({ url: ev.target.result, caption: f.name.replace(/\.[^.]+$/, ''), date: new Date().toISOString() });
      DB.s('s_photos', p);
      c++;
      if (c === e.target.files.length) {
        rAdmPhotos();
        toast(`${c} photo(s) uploaded!`);
      }
    };
    r.readAsDataURL(f);
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

function handleAvatarFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (ev) {
    const dataUrl = ev.target.result;
    document.getElementById('s-avatar').value = dataUrl;
    const av = document.getElementById('s-av-prev');
    av.innerHTML = `<img src="${dataUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
    document.getElementById('av-file-name').textContent = '✦ ' + file.name;
    toast('Photo loaded — click Save All Changes to apply.');
  };
  reader.readAsDataURL(file);
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

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = '✦ ' + msg;
  t.classList.add('on');
  setTimeout(() => t.classList.remove('on'), 3000);
}


// ── INIT ─────────────────────────────────────────────
rHome();
