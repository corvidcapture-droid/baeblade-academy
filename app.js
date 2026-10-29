/* BAEBLADE ACADEMY — app logic.
   You don't need to edit this file to run the party: everything is managed in the Admin panel. */
(() => {
'use strict';

const CFG = window.BAEBLADE_CONFIG || {};
const DEF = window.BAEBLADE_DEFAULTS || { roster: [], questions: [] };
const SUPABASE_LIB = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/dist/umd/supabase.js';
const LS = 'baeblade:';

const STATS = [
  { k: 'atk', name: 'Attack',  short: 'ATK' },
  { k: 'def', name: 'Defense', short: 'DEF' },
  { k: 'sta', name: 'Stamina', short: 'STA' },
  { k: 'bal', name: 'Balance', short: 'BAL' },
];
const EXP = ['Beginner', 'Intermediate', 'Expert'];
const EXP_W = { Beginner: 1, Intermediate: 2, Expert: 3 };

const LOGO = `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="28" fill="none" stroke="#eef1f8" stroke-width="3" stroke-dasharray="34 10"/><circle cx="32" cy="32" r="20" fill="none" stroke="#272d43" stroke-width="2"/><path d="M13 13h10l9 12 9-12h10L37 32l14 19H41l-9-12-9 12H13l14-19z" fill="#ff2d4a"/></svg>`;

/* ---------- small helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 10);
const pad = (n, l = 2) => String(n).padStart(l, '0');
const mem = {};
const local = {
  get(k) { try { const v = localStorage.getItem('bbu:' + k); return v === null ? mem[k] ?? null : v; } catch { return mem[k] ?? null; } },
  set(k, v) { mem[k] = v; try { v === null ? localStorage.removeItem('bbu:' + k) : localStorage.setItem('bbu:' + k, v); } catch {} },
};

function toast(msg, kind = 'ok') {
  const el = document.createElement('div');
  el.className = 'toast' + (kind === 'bad' ? ' bad' : '');
  el.textContent = msg;
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), 3800);
}

function loadScript(src) {
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = () => rej(new Error('Could not load the live-sync library'));
    document.head.appendChild(s);
  });
}

function download(filename, text, type = 'text/plain') {
  try {
    const blob = new Blob([text], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast('Downloaded ' + filename);
  } catch (e) { toast('Download blocked by this browser.', 'bad'); }
}

/* ---------- data store: local browser storage, or Supabase when configured ---------- */
const Store = {
  mode: 'local', error: '',
  state: { settings: null, questions: null, charq: null, teams: null, arena: null, liveq: null, live: null, bladers: {}, answers: {}, joins: {} },

  apply(key, value) {
    const pre = key.split(':')[0];
    const map = { blader: 'bladers', ans: 'answers', join: 'joins' }[pre];
    if (map) {
      const id = key.slice(pre.length + 1);
      if (value == null) delete this.state[map][id]; else this.state[map][id] = value;
    } else this.state[key] = value;
  },

  async init() {
    if (CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY) {
      try { await this.initRemote(); this.mode = 'live'; }
      catch (e) { console.warn(e); this.error = e.message || String(e); this.mode = 'local'; this.initLocal(); }
    } else this.initLocal();
    await this.seed();
  },

  initLocal() {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(LS)) this.apply(k.slice(LS.length), JSON.parse(localStorage.getItem(k)));
      }
    } catch {}
    window.addEventListener('storage', e => {
      if (!e.key || !e.key.startsWith(LS)) return;
      this.apply(e.key.slice(LS.length), e.newValue ? JSON.parse(e.newValue) : null);
      changed();
    });
  },

  async initRemote() {
    await loadScript(SUPABASE_LIB);
    this.sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
    const { data, error } = await this.sb.from('kv').select('key,value');
    if (error) throw new Error(error.message + ' — did you run supabase-setup.sql?');
    data.forEach(r => this.apply(r.key, r.value));
    this.sb.channel('kv-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kv' }, p => {
        if (p.eventType === 'DELETE') { if (p.old && p.old.key) this.apply(p.old.key, null); }
        else this.apply(p.new.key, p.new.value);
        changed();
      })
      .subscribe();
  },

  async set(key, value) {
    this.apply(key, value); changed();
    if (this.mode === 'live') {
      const { error } = await this.sb.from('kv').upsert({ key, value, updated_at: new Date().toISOString() });
      if (error) toast('Not saved: ' + error.message, 'bad');
    } else {
      try { localStorage.setItem(LS + key, JSON.stringify(value)); }
      catch { toast('This browser is full or blocking storage. Changes last until you close the tab.', 'bad'); }
    }
  },

  async del(key) {
    this.apply(key, null); changed();
    if (this.mode === 'live') {
      const { error } = await this.sb.from('kv').delete().eq('key', key);
      if (error) toast('Not deleted: ' + error.message, 'bad');
    } else { try { localStorage.removeItem(LS + key); } catch {} }
  },

  async seed() {
    const s = this.state;
    if (!s.questions) await this.set('questions', defaultQuestions());
    if (!s.teams) await this.set('teams', []);
    if (!s.arena) await this.set('arena', defaultArena());
    if (!s.liveq) await this.set('liveq', defaultLiveQ());
    if (!s.charq) await this.set('charq', defaultCharQ());
    if (!s.live) await this.set('live', { status: 'idle', qIndex: 0, stamp: '' });
    if (!s.settings) {
      await this.set('settings', { eventName: DEF.eventName || 'Baeblade Academy', tagline: DEF.tagline || 'Blader Assessment Day', adminPin: '1234', teamSize: 3, showTeams: false, siteUrl: '', requirePin: true, selfJoin: true });
      if (!Object.keys(s.bladers).length) {
        for (const r of DEF.roster || []) await addBlader(r.name, r.exp);
      }
    }
  },
};

const defaultQuestions = () => (DEF.questions || []).map(q => ({ id: uid(), text: q.text, options: q.options.map(o => ({ text: o.text, fx: { ...o.fx } })) }));
const defaultArena = () => ({ screen: 'lobby', revealed: 0, battle: { label: 'Battle 01', a: '', b: '', note: 'Bladers — prepare to launch' }, message: { big: 'Let it rip', small: '' } });
const defaultCharQ = () => (DEF.charQuiz || []).map(q => ({ id: 'c' + uid(), text: q.text, options: q.options.map(o => ({ text: o.text, look: o.look || o.text })) }));
const defaultLiveQ = () => (DEF.teamQuiz || []).map(q => ({ id: uid(), text: q.text, options: q.options.slice(), correct: q.correct || 0, seconds: q.seconds || 20, checkMe: !!q.checkMe }));

/* ---------- domain helpers ---------- */
const S = () => Store.state.settings || {};
const bladers = () => Object.values(Store.state.bladers).sort((a, b) => a.id.localeCompare(b.id));
const questions = () => Store.state.questions || [];
const charQs = () => Store.state.charq || [];
const quizQs = () => questions().concat(charQs().map(q => ({ ...q, char: true })));
const TYPE_LOOK = { atk: 'aggressive, sharp angular armour details', def: 'sturdy, heavily shielded silhouette', sta: 'sleek, streamlined and agile build', bal: 'versatile, well-balanced design' };
function lookOf(b) {
  const a = b.answers || {};
  return charQs().map(q => { const o = q.options[a[q.id]]; return o ? { q: q.text, pick: o.text, look: o.look } : null; }).filter(Boolean);
}
function briefOf(b) {
  const looks = lookOf(b).map(x => x.look);
  const bits = [
    'Turn the person in the reference photo into an original anime-style spinning-top battle character, in the style of a modern Japanese battling-tops anime (inspired by Beyblade, but not a copy of any existing character).',
    'Keep their face, skin tone, hairstyle and hair colour clearly recognisable.',
    b.type ? `They are a ${typeName(b.type)}-type Blader: ${TYPE_LOOK[b.type]}.` : '',
    looks.length ? 'Character details: ' + looks.join('; ') + '.' : '',
    'Holding their own glowing spinning top. Bold clean line art, cel shading, dramatic rim lighting, dynamic stadium arena background.',
    'Square 1:1 head-and-torso portrait, face centred. No text, no logos.'
  ];
  return bits.filter(Boolean).join(' ');
}
const teams = () => Store.state.teams || [];
const teamOf = id => teams().find(t => t.members.includes(id));

function nextId() {
  const nums = bladers().map(b => parseInt(String(b.id).replace(/\D/g, ''), 10)).filter(n => !isNaN(n));
  return 'BB-' + pad((nums.length ? Math.max(...nums) : 0) + 1, 3);
}
function newPin() {
  const used = new Set(bladers().map(b => b.pin));
  let p; do { p = pad(Math.floor(Math.random() * 10000), 4); } while (used.has(p));
  return p;
}
async function addBlader(name, exp = 'Beginner', pin) {
  const b = { id: nextId(), name: String(name).trim(), exp: EXP.includes(exp) ? exp : 'Beginner', pin: /^\d{4}$/.test(pin || '') ? pin : newPin(), img: '', answers: {}, stats: null, type: '', done: false };
  await Store.set('blader:' + b.id, b);
  return b;
}

function computeStats(answers) {
  const raw = { atk: 0, def: 0, sta: 0, bal: 0 }, max = { atk: 0, def: 0, sta: 0, bal: 0 };
  for (const q of questions()) {
    for (const s of STATS) max[s.k] += Math.max(0, ...q.options.map(o => +(o.fx?.[s.k]) || 0));
    const o = q.options[answers[q.id]];
    if (o) for (const s of STATS) raw[s.k] += +(o.fx?.[s.k]) || 0;
  }
  const stats = {};
  for (const s of STATS) stats[s.k] = max[s.k] ? Math.min(99, Math.round(20 + 79 * raw[s.k] / max[s.k])) : 20;
  let type = 'bal';
  for (const s of STATS) if (stats[s.k] > stats[type]) type = s.k;
  return { stats, type };
}
const typeName = t => (STATS.find(s => s.k === t) || {}).name || '';

/* ---------- links, QR codes, copying ---------- */
const siteBase = () => (S().siteUrl || '').trim() || location.href.split('#')[0];
const linkTo = h => siteBase() + '#' + h;
const inviteLink = b => linkTo('invite.' + b.id + '.' + b.pin);
function qrSvg(text) {
  if (typeof window.qrcode !== 'function') return `<p class="muted">${esc(text)}</p>`;
  const q = window.qrcode(0, 'M'); q.addData(text); q.make();
  return q.createSvgTag({ cellSize: 4, margin: 4, scalable: true, alt: 'QR code for ' + text });
}
async function copyText(text, label = 'Copied') {
  try { await navigator.clipboard.writeText(text); toast(label); }
  catch { openModal({ type: 'copy', text }); }
}
function handleInvite() {
  const h = location.hash.replace('#', '');
  if (!h.startsWith('invite.')) return false;
  const [, id, pin] = h.split('.');
  const b = Store.state.bladers[id];
  if (b && b.pin === pin) { local.set('me', b.id); ui.draft = JSON.parse(local.get('draft:' + b.id) || '{}'); ui.qIndex = 0; }
  else toast("That invite link doesn't match anyone. Pick your name instead.", 'bad');
  history.replaceState(null, '', '#play');
  return true;
}
const initials = n => String(n || '?').trim().slice(0, 2).toUpperCase();
const avatar = (b, cls = '') => `<div class="avatar ${cls} ${b.type ? 't-' + b.type : ''}">${b.img ? `<img src="${esc(b.img)}" alt="">` : esc(initials(b.name))}</div>`;

function statBars(b) {
  return `<div class="stats">${STATS.map(s => `<div class="stat t-${s.k}"><span class="k">${s.short}</span><div class="track"><div class="fill" style="width:${b.stats ? b.stats[s.k] : 0}%"></div></div><b>${b.stats ? b.stats[s.k] : '—'}</b></div>`).join('')}</div>`;
}

/* ---------- render loop ---------- */
const ui = { pickQuery: '', pinFor: null, pin: '', qIndex: 0, draft: {}, justFinished: false, adminTab: 'setup', modal: null, showPins: false };
let pending = false;

function busy() {
  const a = document.activeElement;
  return !!ui.modal || (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && a.type !== 'checkbox' && a.type !== 'file');
}
function changed() { if (busy()) pending = true; else render(); }
document.addEventListener('focusout', () => setTimeout(() => { if (pending && !busy()) render(); }, 0));

const route = () => (location.hash.replace('#', '') || 'home').split(/[/?]/)[0];
window.addEventListener('hashchange', () => { if (route() === 'home') { ui.pinFor = null; ui.pin = ''; ui.pickQuery = ''; } closeModal(true); render(); window.scrollTo(0, 0); });

function render() {
  pending = false;
  handleInvite();
  const r = route();
  document.body.dataset.view = r;
  const views = { play: viewPlay, admin: viewAdmin, arena: viewArena, live: viewLive };
  $('#app').innerHTML = (views[r] || viewHome)();
  if (r === 'arena') keepAwake();
  if (r === 'live' && me()) markJoined();
}

function topbar(current) {
  const pill = Store.mode === 'live' ? '<span class="pill live"><i></i>Live</span>' : Store.error ? '<span class="pill err" title="' + esc(Store.error) + '"><i></i>Offline</span>' : '<span class="pill"><i></i>This device</span>';
  const link = (h, t) => `<a class="navlink" href="#${h}" ${current === h ? 'aria-current="page"' : ''}>${t}</a>`;
  return `<header class="bar"><a class="brand" href="#" aria-label="Home">${LOGO}<b>${esc(S().eventName)}</b></a>${link('play', 'Bladers')}${link('arena', 'Arena')}${link('admin', 'Admin')}${pill}</header>`;
}

/* ---------- HOME ---------- */
function viewHome() {
  const all = bladers(), done = all.filter(b => b.done).length;
  const words = esc(S().eventName).split(' ');
  const title = words.length > 1 ? words.slice(0, -1).join(' ') + ' <span>' + words.slice(-1) + '</span>' : words[0];
  return `${topbar('home')}<main class="wrap"><section class="hero">
    <div class="hero-mark">${LOGO}</div>
    <p class="eyebrow">${esc(S().tagline)}</p>
    <h1>${title}</h1>
    <p class="lede">Log in with your Blader PIN, take the assessment and find out whether you're Attack, Defense, Stamina or Balance.</p>
    <div class="doors">
      <a class="door door-main" href="#play"><span class="k">Bladers</span><strong>Enter the Academy</strong><span>Log in and take your assessment</span></a>
      <a class="door" href="#arena"><span class="k">TV</span><strong>Arena screen</strong><span>Put this on the big screen</span></a>
      <a class="door" href="#admin"><span class="k">Host</span><strong>Admin</strong><span>Roster, questions, teams, arena</span></a>
    </div>
    <div class="ticker"><div><span class="k">Registered</span><b>${all.length}</b></div><div><span class="k">Assessed</span><b>${done}</b></div><div><span class="k">Teams</span><b>${teams().length}</b></div></div>
  </section></main>`;
}

/* ---------- PLAYER ---------- */
function me() { const id = local.get('me'); return id ? Store.state.bladers[id] : null; }
function signIn(id) {
  local.set('me', id); ui.qIndex = 0; ui.pickQuery = '';
  ui.draft = JSON.parse(local.get('draft:' + id) || '{}');
  render(); window.scrollTo(0, 0);
}

function viewPlay() {
  const b = me();
  let body;
  if (!b) body = ui.pinFor ? viewPin() : viewPick();
  else if (!b.done) body = viewQuiz(b);
  else body = viewProfile(b);
  return `${topbar('play')}<main class="wrap narrow">${body}</main>`;
}

function viewPick(mode = 'play') {
  const q = ui.pickQuery.toLowerCase();
  const list = bladers().filter(b => !q || b.name.toLowerCase().includes(q) || b.id.toLowerCase().includes(q));
  const title = mode === 'live' ? 'Tap your name to join' : 'Who are you?';
  return `<div class="screen-head"><p class="eyebrow">${mode === 'live' ? 'Team quiz' : 'Blader login'}</p><h1>${title}</h1></div>
    <input class="search" id="pick-search" type="text" placeholder="Search your name" value="${esc(ui.pickQuery)}" autocomplete="off">
    <div class="names">${list.map(b => `<button class="name-btn" data-act="pick" data-mode="${mode}" data-id="${esc(b.id)}">${avatar(b)}<span style="min-width:0"><b>${esc(b.name)}</b><small>${esc(b.id)}${b.done ? ' · done' : ''}</small></span></button>`).join('') || '<p class="muted">No Bladers match that search.</p>'}</div>
    ${S().selfJoin !== false ? `<form class="plate form" data-form="selfjoin" style="margin-top:20px"><div class="field"><label for="f-selfname">Not on the list? Type your name</label><input id="f-selfname" type="text" autocomplete="given-name" maxlength="24" required></div><button class="btn primary small" type="submit">Join as a new Blader</button></form>` : ''}`;
}

function viewPin() {
  const b = Store.state.bladers[ui.pinFor];
  if (!b) { ui.pinFor = null; return viewPick(); }
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'back', '0', 'clear'];
  return `<div class="pinpad">
    ${avatar(b, 'lg')}
    <div style="text-align:center"><p class="eyebrow">${esc(b.id)}</p><h1 style="font-size:48px">${esc(b.name)}</h1></div>
    <p class="muted" style="margin:0">Enter your 4-digit Blader PIN</p>
    <div class="pin-dots" id="pin-dots">${[0, 1, 2, 3].map(i => `<i class="${i < ui.pin.length ? 'on' : ''}"></i>`).join('')}</div>
    <div class="keys">${keys.map(k => `<button class="key ${k.length > 1 ? 'fn' : ''}" data-act="pin-key" data-k="${k}">${k === 'back' ? 'Back' : k === 'clear' ? 'Clear' : k}</button>`).join('')}</div>
    <button class="btn ghost small" data-act="pin-cancel">Not you? Go back</button>
  </div>`;
}

function pinKey(k) {
  if (k === 'back') { ui.pin = ui.pin.slice(0, -1); }
  else if (k === 'clear') { ui.pin = ''; }
  else if (ui.pin.length < 4) ui.pin += k;
  if (ui.pin.length === 4) {
    const b = Store.state.bladers[ui.pinFor];
    if (b && b.pin === ui.pin) { ui.pinFor = null; ui.pin = ''; signIn(b.id); return; }
    ui.pin = ''; render();
    const d = $('#pin-dots'); if (d) d.classList.add('shake');
    toast("That PIN doesn't match. Ask the host if you've forgotten it.", 'bad');
    return;
  }
  render();
}

function viewQuiz(b) {
  const qs = quizQs();
  if (!qs.length) return `<div class="screen-head"><p class="eyebrow">${esc(b.id)}</p><h1>Hang tight, ${esc(b.name)}</h1><p class="muted">The host hasn't added any assessment questions yet.</p></div><button class="btn ghost" data-act="logout">Log out</button>`;
  ui.qIndex = Math.min(ui.qIndex, qs.length - 1);
  const q = qs[ui.qIndex];
  const picked = ui.draft[q.id];
  return `<div class="progress"><span style="width:${(ui.qIndex) / qs.length * 100}%"></span></div>
    <p class="q-count">Question ${pad(ui.qIndex + 1)} / ${pad(qs.length)}${q.char ? ' · Your character' : ''}</p>
    <h1 class="q-text">${esc(q.text)}</h1>
    <div class="options">${q.options.map((o, i) => `<button class="opt ${picked === i ? 'picked' : ''}" data-act="answer" data-i="${i}"><b>${String.fromCharCode(65 + i)}</b><span>${esc(o.text)}</span></button>`).join('')}</div>
    <div class="row spread" style="margin-top:22px"><button class="btn ghost small" data-act="q-back" ${ui.qIndex === 0 ? 'disabled' : ''}>Previous</button><button class="btn ghost small" data-act="logout">Log out</button></div>`;
}

async function answer(i) {
  const b = me(); const qs = quizQs(); const q = qs[ui.qIndex];
  if (!b || !q) return;
  ui.draft[q.id] = i;
  local.set('draft:' + b.id, JSON.stringify(ui.draft));
  if (ui.qIndex < qs.length - 1) { ui.qIndex++; render(); window.scrollTo(0, 0); return; }
  const { stats, type } = computeStats(ui.draft);
  ui.justFinished = true;
  await Store.set('blader:' + b.id, { ...b, answers: { ...ui.draft }, stats, type, done: true, doneAt: new Date().toISOString() });
  local.set('draft:' + b.id, null);
  window.scrollTo(0, 0);
}

function viewProfile(b) {
  const t = teamOf(b.id), picks = lookOf(b);
  const anim = ui.justFinished ? 'reveal' : ''; ui.justFinished = false;
  return `<div class="screen-head"><p class="eyebrow">Assessment complete</p></div>
  <article class="plate bcard ${anim} t-${esc(b.type)}">
    ${avatar(b, 'lg')}
    <div style="min-width:0">
      <span class="bcard-id">${esc(b.id)} · ${esc(b.exp)}</span>
      <h1>${esc(b.name)}</h1>
      <span class="type-badge">${esc(typeName(b.type))} type</span>
      ${statBars(b)}
    </div>
  </article>
  ${picks.length ? `<div class="plate" style="margin-top:14px"><p class="eyebrow">Your character</p><div class="pick-list">${picks.map(x => `<div><span class="lbl">${esc(x.q)}</span><b>${esc(x.pick)}</b></div>`).join('')}</div>${b.img ? '' : '<p class="muted" style="margin:12px 0 0">Your character art is being forged. It will appear here before the party.</p>'}</div>` : ''}
  ${S().showTeams && t ? `<div class="plate" style="margin-top:14px"><p class="eyebrow">Your team</p><h2 style="font-size:40px;margin:6px 0 12px">${esc(t.name)}</h2><div class="row">${t.members.filter(id => id !== b.id).map(id => Store.state.bladers[id]).filter(Boolean).map(m => `<div class="who">${avatar(m)}<b>${esc(m.name)}</b></div>`).join('')}</div></div>` : `<p class="muted" style="margin-top:18px">Teams are revealed on the arena screen. Keep this page open.</p>`}
  <div class="row" style="margin-top:18px"><button class="btn ghost small" data-act="logout">Log out</button><span class="muted" style="font-size:14px">Your PIN is <b class="num">${esc(b.pin)}</b> if you need to log in on another phone.</span></div>`;
}

/* ---------- ADMIN ---------- */
const adminOk = () => local.get('admin') === S().adminPin;

function viewAdmin() {
  if (!adminOk()) return `${topbar('admin')}<main class="wrap narrow"><div class="screen-head"><p class="eyebrow">Host only</p><h1>Admin login</h1></div>
    <form class="plate form" data-form="admin-login"><div class="field"><label for="f-adminpin">Admin PIN</label><input id="f-adminpin" type="password" inputmode="numeric" autocomplete="off" required></div>
    <button class="btn primary" type="submit">Unlock</button><p class="muted" style="margin:0;font-size:14px">First time? The PIN is 1234. Change it in Admin → Settings.</p></form></main>`;
  const tabs = [['setup', 'Setup'], ['bladers', 'Bladers'], ['questions', 'Profile quiz'], ['teams', 'Teams'], ['live', 'Team quiz'], ['arena', 'Arena control'], ['settings', 'Settings']];
  const views = { setup: adminSetup, bladers: adminBladers, questions: adminQuestions, teams: adminTeams, live: adminLive, arena: adminArena, settings: adminSettings };
  return `${topbar('admin')}<main class="wrap"><nav class="tabs" role="tablist">${tabs.map(([k, l]) => `<button class="tab" role="tab" aria-selected="${ui.adminTab === k}" data-act="tab" data-tab="${k}">${l}</button>`).join('')}</nav>${views[ui.adminTab]()}</main>`;
}

function adminSetup() {
  const all = bladers(), n = all.length;
  const done = all.filter(b => b.done).length, art = all.filter(b => b.img).length;
  const ts = teams(), placed = ts.reduce((a, t) => a + t.members.length, 0);
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
  const step = (num, ok, title, text, meter, action) => `<div class="step ${ok ? 'done' : ''}"><span class="step-n">${pad(num)}</span><div><h3>${title}</h3><p>${text}</p>${meter != null ? `<div class="meter"><span style="width:${meter}%"></span></div>` : ''}</div>${action}</div>`;
  return `<div class="section-head"><div><p class="eyebrow">Party setup</p><h2>Event status</h2></div>${connBadge()}</div>
  <div class="steps">
    ${step(1, n > 0, 'Bladers', `${n} registered`, null, `<button class="btn small" data-act="tab" data-tab="bladers">Manage Bladers</button>`)}
    ${step(2, n > 0 && done === n, 'Assessments', `${done} of ${n} completed`, pct(done, n), `<button class="btn small" data-act="tab" data-tab="questions">Edit questions</button>`)}
    ${step(3, n > 0 && art === n, 'Character art', `${art} of ${n} uploaded`, pct(art, n), `<button class="btn small" data-act="tab" data-tab="bladers">Upload art</button>`)}
    ${step(4, ts.length > 0 && placed === n, 'Teams', ts.length ? `${ts.length} teams · ${placed} of ${n} Bladers placed` : 'Not generated yet', ts.length ? pct(placed, n) : null, `<button class="btn small" data-act="tab" data-tab="teams">${ts.length ? 'Adjust teams' : 'Generate teams'}</button>`)}
    ${step(5, false, 'Arena', `TV is showing: ${esc((Store.state.arena || {}).screen || 'lobby')}`, null, `<a class="btn small primary" href="#arena" target="_blank" rel="noopener">Open arena screen</a>`)}
    ${step(6, liveQs().length > 0 && !liveQs().some(x => x.checkMe), 'Team quiz', `${liveQs().length} questions${liveQs().some(x => x.checkMe) ? ` · ${liveQs().filter(x => x.checkMe).length} answers to check` : ''}`, null, `<button class="btn small" data-act="tab" data-tab="live">Set up team quiz</button>`)}
  </div>`;
}
function connBadge() {
  return Store.mode === 'live' ? `<span class="pill live"><i></i>Live sync on · every phone shares this data</span>`
    : `<span class="pill ${Store.error ? 'err' : ''}"><i></i>${Store.error ? 'Live sync failed · saving on this device' : 'Saving on this device only'}</span>`;
}

function adminBladers() {
  const all = bladers();
  return `<div class="section-head"><div><p class="eyebrow">${all.length} Bladers</p><h2>Roster</h2></div>
    <div class="row"><button class="btn primary small" data-act="blader-new">Add Blader</button><button class="btn small" data-act="invite-all">Copy all invite links</button><button class="btn small" data-act="import-open">Import CSV</button><button class="btn small" data-act="export-csv">Export CSV</button><button class="btn ghost small" data-act="toggle-pins">${ui.showPins ? 'Hide PINs' : 'Show PINs'}</button></div></div>
  <div class="note" style="margin-bottom:14px"><p>Send each guest their invite link (WhatsApp works well). Tapping it opens their own profile quiz, no name or PIN needed.</p></div>
  <div class="tablewrap"><table><thead><tr><th>Blader</th><th>ID</th><th>PIN</th><th>Experience</th><th>Assessment</th><th>Type</th><th>Team</th><th></th></tr></thead><tbody>
  ${all.map(b => { const t = teamOf(b.id); return `<tr>
    <td><div class="who">${avatar(b)}<b>${esc(b.name)}</b></div></td>
    <td class="num">${esc(b.id)}</td>
    <td class="num">${ui.showPins ? esc(b.pin) : '••••'}</td>
    <td>${esc(b.exp)}</td>
    <td>${b.done ? '<span class="chip ok">Done</span>' : '<span class="chip">Waiting</span>'}</td>
    <td>${b.type ? `<span class="chip t t-${b.type}">${typeName(b.type)}</span>` : '—'}</td>
    <td>${t ? esc(t.name) : '—'}</td>
    <td><div class="row" style="flex-wrap:nowrap;gap:6px"><button class="btn small ghost" data-act="invite-copy" data-id="${esc(b.id)}">Copy invite</button>${b.done ? `<button class="btn small ghost" data-act="brief-copy" data-id="${esc(b.id)}">Copy art description</button>` : ''}<button class="btn small ghost" data-act="blader-edit" data-id="${esc(b.id)}">Edit</button></div></td></tr>`; }).join('') || '<tr><td colspan="8" class="muted">No Bladers yet. Add one or import a CSV.</td></tr>'}
  </tbody></table></div>`;
}

function adminQuestions() {
  const qs = questions();
  return `<div class="section-head"><div><p class="eyebrow">${qs.length} questions · each answer adds stat points</p><h2>Assessment</h2></div>
    <div class="row"><button class="btn primary small" data-act="q-new">Add question</button><button class="btn danger small" data-act="q-restore" data-confirm="Replace all questions?">Restore defaults</button></div></div>
  <div class="note warn" style="margin-bottom:14px"><p>Bladers who already finished keep their stats. To re-score someone after editing questions, open them in Bladers and reset their assessment.</p></div>
  <div class="qlist">${qs.map((q, i) => `<div class="qitem"><span class="n">${pad(i + 1)}</span><div style="min-width:0"><p>${esc(q.text)}</p><div class="qopts">${q.options.map(o => `<span>${esc(o.text)} <b class="num">${STATS.filter(s => +o.fx?.[s.k]).map(s => `${s.short}+${o.fx[s.k]}`).join(' ')}</b></span>`).join('')}</div></div>
    <div class="qactions"><button class="btn ghost small" data-act="q-move" data-i="${i}" data-d="-1" ${i === 0 ? 'disabled' : ''} aria-label="Move up">↑</button><button class="btn ghost small" data-act="q-move" data-i="${i}" data-d="1" ${i === qs.length - 1 ? 'disabled' : ''} aria-label="Move down">↓</button><button class="btn small" data-act="q-edit" data-i="${i}">Edit</button><button class="btn danger small" data-act="q-del" data-i="${i}" data-confirm="Delete?">Delete</button></div></div>`).join('') || '<p class="muted">No questions yet.</p>'}</div>
  ${adminCharQs()}`;
}

function adminCharQs() {
  const cs = charQs();
  return `<div class="section-head" style="margin-top:40px"><div><p class="eyebrow">${cs.length} questions · asked after the assessment · shape each Blader's character art</p><h2>Character</h2></div>
    <div class="row"><button class="btn primary small" data-act="cq-new">Add question</button><button class="btn danger small" data-act="cq-restore" data-confirm="Replace all character questions?">Restore defaults</button></div></div>
  <div class="note" style="margin-bottom:14px"><p>Each answer adds a phrase to that Blader's character description. Copy it from Admin → Bladers and paste it into Artlist with their photo.</p></div>
  <div class="qlist">${cs.map((q, i) => `<div class="qitem"><span class="n">C${i + 1}</span><div style="min-width:0"><p>${esc(q.text)}</p><div class="qopts">${q.options.map(o => `<span title="${esc(o.look)}">${esc(o.text)}</span>`).join('')}</div></div>
    <div class="qactions"><button class="btn ghost small" data-act="cq-move" data-i="${i}" data-d="-1" ${i === 0 ? 'disabled' : ''} aria-label="Move up">↑</button><button class="btn ghost small" data-act="cq-move" data-i="${i}" data-d="1" ${i === cs.length - 1 ? 'disabled' : ''} aria-label="Move down">↓</button><button class="btn small" data-act="cq-edit" data-i="${i}">Edit</button><button class="btn danger small" data-act="cq-del" data-i="${i}" data-confirm="Delete?">Delete</button></div></div>`).join('') || '<p class="muted">No character questions.</p>'}</div>`;
}

function modalCharQ(m) {
  const d = m.draft;
  return `<h2>${m.index == null ? 'New character question' : 'Character question C' + (m.index + 1)}</h2>
  <div class="field"><label for="f-cqtext">Question</label><textarea id="f-cqtext" rows="2">${esc(d.text)}</textarea></div>
  <p class="muted" style="margin:0;font-size:14px">The answer is what guests tap. The description phrase is what goes into the art prompt.</p>
  ${d.options.map((o, i) => `<div class="optrow"><div class="row spread"><span class="lbl">Answer ${String.fromCharCode(65 + i)}</span>${d.options.length > 2 ? `<button class="btn danger small" data-act="cqopt-del" data-i="${i}">Remove</button>` : ''}</div>
    <input id="cq-t-${i}" type="text" value="${esc(o.text)}" aria-label="Answer ${i + 1}" placeholder="What guests see">
    <input id="cq-l-${i}" type="text" value="${esc(o.look)}" aria-label="Description phrase ${i + 1}" placeholder="Phrase added to the art description"></div>`).join('')}
  ${d.options.length < 8 ? '<button class="btn ghost small" data-act="cqopt-add">Add answer</button>' : ''}
  <div class="modal-foot"><span></span><div class="row"><button class="btn ghost" data-act="modal-close">Cancel</button><button class="btn primary" data-act="cq-save">Save question</button></div></div>`;
}
function readCQForm() {
  const d = ui.modal.draft;
  d.text = $('#f-cqtext').value;
  d.options = d.options.map((_, i) => ({ text: $('#cq-t-' + i).value, look: $('#cq-l-' + i).value }));
}

function adminTeams() {
  const ts = teams(), all = bladers();
  const placed = new Set(ts.flatMap(t => t.members));
  const free = all.filter(b => !placed.has(b.id));
  const opts = cur => `<option value="">Unassigned</option>` + ts.map(t => `<option value="${esc(t.id)}" ${t.id === cur ? 'selected' : ''}>${esc(t.name)}</option>`).join('');
  const member = (b, tid) => `<div class="member">${avatar(b)}<span style="min-width:0"><b>${esc(b.name)}</b><br><span class="team-meta">${esc(b.exp)}${b.type ? ' · ' + typeName(b.type) : ''}</span></span><select aria-label="Move ${esc(b.name)}" data-change="move" data-id="${esc(b.id)}">${opts(tid)}</select></div>`;
  return `<div class="section-head"><div><p class="eyebrow">Balanced by experience and stats</p><h2>Teams</h2></div>
    <div class="row"><div class="field" style="width:110px"><label for="f-teamsize">Team size</label><input id="f-teamsize" type="number" min="2" max="8" value="${S().teamSize || 3}" data-change="teamsize"></div>
    <button class="btn primary" data-act="teams-gen" ${ts.length ? 'data-confirm="Replace current teams?"' : ''}>${ts.length ? 'Regenerate teams' : 'Generate teams'}</button><button class="btn ghost small" data-act="team-add">Add empty team</button></div></div>
  <label class="check" style="margin-bottom:18px"><input type="checkbox" id="f-showteams" data-change="showteams" ${S().showTeams ? 'checked' : ''}> Show each Blader their team on their phone</label>
  ${free.length ? `<div class="team" style="margin-bottom:14px"><p class="eyebrow">Unassigned · ${free.length}</p>${free.map(b => member(b, '')).join('')}</div>` : ''}
  <div class="teams">${ts.map(t => `<div class="team"><input class="team-name" aria-label="Team name" value="${esc(t.name)}" data-change="team-name" data-id="${esc(t.id)}">
    <span class="team-meta">${t.members.length} Bladers · power ${teamPower(t)}</span>
    ${t.members.map(id => Store.state.bladers[id]).filter(Boolean).map(b => member(b, t.id)).join('') || '<p class="muted" style="margin:0">Empty</p>'}
    <button class="btn danger small" data-act="team-del" data-id="${esc(t.id)}" data-confirm="Delete team?">Delete team</button></div>`).join('')}</div>`;
}
const bladerPower = b => EXP_W[b.exp] * 60 + (b.stats ? STATS.reduce((a, s) => a + b.stats[s.k], 0) / 4 : 50);
const teamPower = t => Math.round(t.members.map(id => Store.state.bladers[id]).filter(Boolean).reduce((a, b) => a + bladerPower(b), 0));

async function generateTeams() {
  const size = Math.max(2, +S().teamSize || 3);
  const list = bladers().map(b => ({ b, p: bladerPower(b) + Math.random() * 8 })).sort((x, y) => y.p - x.p);
  const n = Math.max(1, Math.round(list.length / size));
  const ts = Array.from({ length: n }, (_, i) => ({ id: uid(), name: 'Team ' + pad(i + 1), members: [], p: 0 }));
  // strongest Blader first, always into the smallest team with the lowest total power
  for (const { b, p } of list) {
    const t = ts.slice().sort((x, y) => x.members.length - y.members.length || x.p - y.p)[0];
    t.members.push(b.id); t.p += p;
  }
  ts.forEach(t => delete t.p);
  await Store.set('teams', ts);
  await Store.set('arena', { ...Store.state.arena, revealed: 0 });
  toast(`${n} teams generated`);
}

function adminArena() {
  const a = Store.state.arena || defaultArena(), ts = teams();
  const scr = (k, l) => `<button class="btn small" aria-pressed="${a.screen === k}" data-act="arena-screen" data-s="${k}">${l}</button>`;
  const tsel = (id, cur) => `<select id="${id}"><option value="">Choose team</option>${ts.map(t => `<option value="${esc(t.id)}" ${t.id === cur ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select>`;
  return `<div class="section-head"><div><p class="eyebrow">Controls what the TV shows</p><h2>Arena control</h2></div><a class="btn primary small" href="#arena" target="_blank" rel="noopener">Open arena screen</a></div>
  <div class="screen-pick" style="margin-bottom:18px">${scr('lobby', 'Lobby')}${scr('teams', 'Team reveal')}${scr('live', 'Team quiz')}${scr('battle', 'Battle')}${scr('message', 'Message')}</div>
  <div class="cards2">
    <div class="plate form"><h3 style="font-size:28px">Team reveal</h3><p class="muted" style="margin:0">${ts.length ? `${Math.min(a.revealed, ts.length)} of ${ts.length} teams revealed` : 'Generate teams first.'}</p>
      <div class="row"><button class="btn primary small" data-act="reveal-next" ${!ts.length || a.revealed >= ts.length ? 'disabled' : ''}>Reveal next team</button><button class="btn small" data-act="reveal-all" ${!ts.length ? 'disabled' : ''}>Reveal all</button><button class="btn ghost small" data-act="reveal-reset">Hide all</button></div></div>
    <div class="plate form"><h3 style="font-size:28px">Battle</h3>
      <div class="field"><label for="f-blabel">Label</label><input id="f-blabel" type="text" value="${esc(a.battle.label)}"></div>
      <div class="grid2"><div class="field"><label for="f-ba">Left</label>${tsel('f-ba', a.battle.a)}</div><div class="field"><label for="f-bb">Right</label>${tsel('f-bb', a.battle.b)}</div></div>
      <div class="field"><label for="f-bnote">Call-out</label><input id="f-bnote" type="text" value="${esc(a.battle.note)}"></div>
      <button class="btn primary small" data-act="battle-show">Show battle on TV</button></div>
    <div class="plate form"><h3 style="font-size:28px">Message</h3>
      <div class="field"><label for="f-mbig">Big text</label><input id="f-mbig" type="text" value="${esc(a.message.big)}"></div>
      <div class="field"><label for="f-msmall">Small text</label><input id="f-msmall" type="text" value="${esc(a.message.small)}"></div>
      <button class="btn primary small" data-act="message-show">Show message on TV</button></div>
  </div>`;
}

function adminSettings() {
  const s = S();
  return `<div class="section-head"><div><p class="eyebrow">Event</p><h2>Settings</h2></div></div>
  <div class="cards2">
    <form class="plate form" data-form="settings">
      <div class="field"><label for="f-ename">Event name</label><input id="f-ename" type="text" value="${esc(s.eventName)}" required></div>
      <div class="field"><label for="f-tag">Tagline</label><input id="f-tag" type="text" value="${esc(s.tagline)}"></div>
      <div class="field"><label for="f-apin">Admin PIN</label><input id="f-apin" type="text" inputmode="numeric" value="${esc(s.adminPin)}" required minlength="4"></div>
      <div class="field"><label for="f-site">Website address</label><input id="f-site" type="text" inputmode="url" placeholder="${esc(location.href.split('#')[0])}" value="${esc(s.siteUrl || '')}"><span class="muted" style="font-size:13px">Used in invite links and QR codes. Leave blank to use the address you're on now.</span></div>
      <label class="check"><input type="checkbox" id="f-reqpin" ${s.requirePin !== false ? 'checked' : ''}> Ask for a PIN when a guest picks their name (invite links never ask)</label>
      <label class="check"><input type="checkbox" id="f-selfjoin" ${s.selfJoin !== false ? 'checked' : ''}> Let guests who aren't on the roster add themselves</label>
      <button class="btn primary" type="submit">Save settings</button>
    </form>
    <div class="plate form"><h3 style="font-size:28px">Sync</h3>${connBadge()}
      ${Store.mode === 'live' ? '<p class="muted" style="margin:0">Phones, the TV and this admin all read and write the same database.</p>'
        : `<div class="note"><p>Right now everything is saved in this browser only. That's fine for testing, or for running the party from one laptop with the arena open in a second window.</p><p>For guests to log in from their own phones, turn on live sync: see README.md, section "Turn on live sync".</p></div>`}
      ${Store.error ? `<div class="note warn"><p>Live sync error: ${esc(Store.error)}</p></div>` : ''}
    </div>
    <div class="plate form"><h3 style="font-size:28px">Backup</h3><p class="muted" style="margin:0">Everything: settings, Bladers, art, questions, teams.</p>
      <div class="row"><button class="btn small" data-act="backup">Download backup</button><label class="btn small ghost" for="f-restore">Restore backup</label><input id="f-restore" type="file" accept=".json,application/json" hidden data-change="restore"></div>
      <button class="btn danger small" data-act="wipe" data-confirm="Tap again to erase roster and teams">Clear roster and teams</button>
      <button class="btn ghost small" data-act="admin-logout">Lock admin</button></div>
  </div>`;
}

/* ---------- modals ---------- */
function openModal(m) { ui.modal = m; drawModal(); }
function closeModal(silent) { ui.modal = null; $('#modal-root').innerHTML = ''; if (!silent) render(); }
function drawModal() {
  const m = ui.modal; if (!m) { $('#modal-root').innerHTML = ''; return; }
  const inner = m.type === 'blader' ? modalBlader(m) : m.type === 'import' ? modalImport() : m.type === 'copy' ? modalCopy(m) : m.type === 'lq' ? modalLiveQ(m) : m.type === 'cq' ? modalCharQ(m) : modalQuestion(m);
  $('#modal-root').innerHTML = `<div class="modal-bg" data-act="modal-bg"><div class="modal" role="dialog" aria-modal="true">${inner}</div></div>`;
  const f = $('#modal-root input[type="text"], #modal-root textarea'); if (f && !m.focused) { f.focus(); m.focused = true; }
}

function modalBlader(m) {
  const b = m.id ? Store.state.bladers[m.id] : null;
  const d = m.draft;
  return `<h2>${b ? 'Edit ' + esc(b.name) : 'New Blader'}</h2>
  <div class="row" style="align-items:center">${avatar({ name: d.name, img: d.img, type: d.type }, 'lg')}
    <div class="form" style="gap:8px"><label class="btn small" for="f-img">${d.img ? 'Replace art' : 'Upload character art'}</label><input id="f-img" type="file" accept="image/*" hidden data-change="img">${d.img ? '<button class="btn ghost small" data-act="img-clear">Remove art</button>' : ''}</div></div>
  <div class="grid2"><div class="field"><label for="f-name">Name</label><input id="f-name" type="text" value="${esc(d.name)}"></div>
    <div class="field"><label for="f-exp">Experience</label><select id="f-exp">${EXP.map(e => `<option ${e === d.exp ? 'selected' : ''}>${e}</option>`).join('')}</select></div></div>
  <div class="grid2"><div class="field"><label for="f-pin">PIN (4 digits)</label><input id="f-pin" type="text" inputmode="numeric" maxlength="4" value="${esc(d.pin)}"></div>
    <div class="field"><label>Blader ID</label><input type="text" value="${esc(b ? b.id : nextId())}" disabled></div></div>
  ${b ? `<div class="field"><span class="lbl">Stats ${b.done ? '' : '(fill in to override, or let the assessment set them)'}</span><div class="grid4">${STATS.map(s => `<div class="field t-${s.k}"><label for="f-${s.k}" style="color:var(--tc)">${s.short}</label><input id="f-${s.k}" type="number" min="0" max="99" value="${d.stats ? d.stats[s.k] : ''}"></div>`).join('')}</div></div>
  <div class="field"><label for="f-type">Type</label><select id="f-type"><option value="">Auto (highest stat)</option>${STATS.map(s => `<option value="${s.k}" ${d.type === s.k ? 'selected' : ''}>${s.name}</option>`).join('')}</select></div>` : ''}
  ${b && b.done ? `<div class="field"><span class="lbl">Character art description · paste into Artlist with their photo</span><textarea id="f-brief" rows="6" readonly>${esc(briefOf(b))}</textarea><div class="row"><button class="btn small" data-act="brief-copy" data-id="${esc(b.id)}">Copy description</button></div></div>` : ''}
  <div class="modal-foot"><div class="row">${b ? `<button class="btn danger small" data-act="blader-reset" data-confirm="Reset assessment?">Reset assessment</button><button class="btn danger small" data-act="blader-del" data-confirm="Delete ${esc(b.name)}?">Delete</button>` : ''}</div>
    <div class="row"><button class="btn ghost" data-act="modal-close">Cancel</button><button class="btn primary" data-act="blader-save">Save</button></div></div>`;
}

function modalCopy(m) {
  return `<h2>Copy this</h2><p class="muted" style="margin:0">This browser blocked automatic copying. Select the text and copy it.</p>
  <div class="field"><label for="f-copy">Text</label><textarea id="f-copy" rows="8" readonly onfocus="this.select()">${esc(m.text)}</textarea></div>
  <div class="modal-foot"><span></span><button class="btn primary" data-act="modal-close">Done</button></div>`;
}

function modalImport() {
  return `<h2>Import Bladers</h2>
  <p class="muted" style="margin:0">One Blader per line. Columns: <b>Name, Experience</b>, optional <b>PIN</b>. Experience is Beginner, Intermediate or Expert. IDs and missing PINs are generated. A header row is fine.</p>
  <div class="field"><label for="f-csv">Paste rows</label><textarea id="f-csv" rows="8" placeholder="Name,Experience&#10;Mig,Expert&#10;Cuthy,Beginner"></textarea></div>
  <div class="row"><label class="btn small ghost" for="f-csvfile">Or choose a .csv file</label><input id="f-csvfile" type="file" accept=".csv,text/csv,text/plain" hidden data-change="csvfile"></div>
  <label class="check"><input type="checkbox" id="f-skipdup" checked> Skip names already on the roster</label>
  <div class="modal-foot"><span></span><div class="row"><button class="btn ghost" data-act="modal-close">Cancel</button><button class="btn primary" data-act="import-run">Import</button></div></div>`;
}

function modalQuestion(m) {
  const d = m.draft;
  return `<h2>${m.index == null ? 'New question' : 'Question ' + pad(m.index + 1)}</h2>
  <div class="field"><label for="f-qtext">Question</label><textarea id="f-qtext" rows="2">${esc(d.text)}</textarea></div>
  <p class="muted" style="margin:0;font-size:14px">For each answer, set how many points it adds to each stat (0–5).</p>
  ${d.options.map((o, i) => `<div class="optrow"><div class="row spread"><span class="lbl">Answer ${String.fromCharCode(65 + i)}</span>${d.options.length > 2 ? `<button class="btn danger small" data-act="opt-del" data-i="${i}">Remove</button>` : ''}</div>
    <input id="o-text-${i}" type="text" value="${esc(o.text)}" aria-label="Answer ${i + 1} text">
    <div class="grid4">${STATS.map(s => `<div class="field t-${s.k}"><label for="o-${s.k}-${i}">${s.short}</label><input id="o-${s.k}-${i}" type="number" min="0" max="5" value="${+o.fx?.[s.k] || 0}"></div>`).join('')}</div></div>`).join('')}
  ${d.options.length < 6 ? '<button class="btn ghost small" data-act="opt-add">Add answer</button>' : ''}
  <div class="modal-foot"><span></span><div class="row"><button class="btn ghost" data-act="modal-close">Cancel</button><button class="btn primary" data-act="q-save">Save question</button></div></div>`;
}
function readQForm() {
  const d = ui.modal.draft;
  d.text = $('#f-qtext').value;
  d.options = d.options.map((o, i) => ({ text: $('#o-text-' + i).value, fx: Object.fromEntries(STATS.map(s => [s.k, Math.max(0, Math.min(5, +$('#o-' + s.k + '-' + i).value || 0))])) }));
}
function readBladerForm() {
  const d = ui.modal.draft;
  d.name = $('#f-name').value; d.exp = $('#f-exp').value; d.pin = $('#f-pin').value.trim();
  if ($('#f-type')) {
    d.type = $('#f-type').value;
    const vals = STATS.map(s => $('#f-' + s.k).value);
    d.stats = vals.every(v => v === '') ? null : Object.fromEntries(STATS.map((s, i) => [s.k, Math.max(0, Math.min(99, +vals[i] || 0))]));
  }
}

function resizeImage(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onerror = () => rej(new Error('Could not read that file'));
    r.onload = () => {
      const img = new Image();
      img.onerror = () => rej(new Error('That file is not an image this browser can open'));
      img.onload = () => {
        const size = 360, c = document.createElement('canvas'); c.width = c.height = size;
        const s = Math.min(img.width, img.height);
        c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
        res(c.toDataURL('image/jpeg', 0.82));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  });
}

function parseCSV(text) {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; }
    else if (c === '"') q = true;
    else if (c === ',' || c === ';' || c === '\t') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  row.push(cell); rows.push(row);
  return rows.map(r => r.map(x => x.trim())).filter(r => r.some(Boolean));
}
const csvCell = v => /[",\n]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : String(v);

async function runImport() {
  const rows = parseCSV($('#f-csv').value);
  if (!rows.length) { toast('Paste some rows or choose a file first.', 'bad'); return; }
  let ni = 0, ei = 1, pi = -1;
  const h = rows[0].map(x => x.toLowerCase());
  if (h.some(x => x === 'name')) {
    ni = h.indexOf('name'); ei = h.findIndex(x => /exp|level/.test(x)); pi = h.findIndex(x => /pin/.test(x)); rows.shift();
  }
  const skip = $('#f-skipdup').checked;
  const names = new Set(bladers().map(b => b.name.toLowerCase()));
  let added = 0, skipped = 0;
  for (const r of rows) {
    const name = r[ni]; if (!name) continue;
    if (skip && names.has(name.toLowerCase())) { skipped++; continue; }
    const expRaw = (r[ei] || '').toLowerCase();
    const exp = EXP.find(e => e.toLowerCase().startsWith(expRaw.slice(0, 3))) || 'Beginner';
    await addBlader(name, expRaw ? exp : 'Beginner', pi >= 0 ? r[pi] : '');
    names.add(name.toLowerCase()); added++;
  }
  closeModal();
  toast(`Imported ${added} Bladers${skipped ? `, skipped ${skipped} already on the roster` : ''}`);
}

function exportCSV() {
  const head = ['Name', 'Blader ID', 'PIN', 'Experience', 'Assessed', 'Type', 'ATK', 'DEF', 'STA', 'BAL', 'Team', 'Invite link'];
  const lines = [head.join(',')].concat(bladers().map(b => [b.name, b.id, b.pin, b.exp, b.done ? 'Yes' : 'No', typeName(b.type), ...STATS.map(s => b.stats ? b.stats[s.k] : ''), (teamOf(b.id) || {}).name || '', inviteLink(b)].map(csvCell).join(',')));
  download('Baeblade_Blader_Data.csv', lines.join('\n'), 'text/csv');
}

async function restoreBackup(file) {
  try {
    const data = JSON.parse(await file.text());
    if (!data || !Array.isArray(data.bladers)) throw new Error('This is not a Baeblade backup file.');
    for (const k of ['settings', 'questions', 'charq', 'liveq', 'teams', 'arena']) if (data[k]) await Store.set(k, data[k]);
    const keep = new Set(data.bladers.map(b => b.id));
    for (const b of bladers()) if (!keep.has(b.id)) await Store.del('blader:' + b.id);
    for (const b of data.bladers) await Store.set('blader:' + b.id, b);
    toast(`Restored ${data.bladers.length} Bladers`);
  } catch (e) { toast(e.message || 'Could not read that file.', 'bad'); }
}

/* ---------- LIVE TEAM QUIZ ---------- */
const liveQs = () => Store.state.liveq || [];
const live = () => Store.state.live || { status: 'idle', qIndex: 0, stamp: '' };
const curQ = () => liveQs()[live().qIndex];
const LETTERS = 'ABCDEF';
const seen = {};
function seenAt(stamp) { if (stamp && !seen[stamp]) seen[stamp] = Date.now(); return seen[stamp] || Date.now(); }
function timeLeft() { const l = live(), q = curQ(); if (l.status !== 'question' || !q) return 0; return Math.max(0, q.seconds - (Date.now() - seenAt(l.stamp)) / 1000); }
const answerOf = (qid, bid) => Store.state.answers[qid + ':' + bid];
const answersFor = qid => Object.entries(Store.state.answers).filter(([k]) => k.startsWith(qid + ':')).map(([k, v]) => ({ bid: k.slice(qid.length + 1), ...v }));
const pointsFor = (q, a) => (!a || a.o !== q.correct) ? 0 : Math.round(1000 - 500 * Math.min(1, a.ms / (q.seconds * 1000)));
const joinedIds = () => Object.keys(Store.state.joins).filter(id => Store.state.bladers[id]);
function scoreboard() {
  const byId = Object.fromEntries(liveQs().map(q => [q.id, q]));
  const map = {};
  for (const [k, a] of Object.entries(Store.state.answers)) {
    const i = k.indexOf(':'), q = byId[k.slice(0, i)]; if (!q) continue;
    const bid = k.slice(i + 1); map[bid] = (map[bid] || 0) + pointsFor(q, a);
  }
  const ts = teams().map(t => { const total = t.members.reduce((s, id) => s + (map[id] || 0), 0); return { ...t, total, avg: t.members.length ? Math.round(total / t.members.length) : 0 }; }).sort((a, b) => b.avg - a.avg);
  const players = Object.entries(map).map(([id, p]) => ({ b: Store.state.bladers[id], p })).filter(x => x.b).sort((a, b) => b.p - a.p);
  return { teams: ts, players, map };
}
const joinSent = {};
function markJoined() { const b = me(); if (b && !Store.state.joins[b.id] && !joinSent[b.id]) { joinSent[b.id] = 1; Store.set('join:' + b.id, { at: Date.now() }); } }

function viewLive() {
  const b = me();
  return `${topbar('live')}<main class="wrap narrow">${b ? livePhone(b) : viewPick('live')}</main>`;
}

function livePhone(b) {
  const l = live(), q = curQ(), t = teamOf(b.id), sb = scoreboard();
  const head = `<div class="live-me">${avatar(b)}<div style="min-width:0"><b>${esc(b.name)}</b><span class="team-meta">${t ? esc(t.name) : 'Team not set yet'}</span></div><span class="live-pts num">${sb.map[b.id] || 0}<small>pts</small></span></div>`;
  let body;
  if (l.status === 'idle' || l.status === 'lobby') {
    body = `<div class="verdict"><p class="eyebrow">${l.status === 'lobby' ? "You're in" : 'Team quiz'}</p><h1>${l.status === 'lobby' ? 'Watch the TV' : 'Starting soon'}</h1><p class="muted">Questions appear here when the host starts. Keep this page open.</p></div>
      ${!b.done ? `<a class="btn ghost small" href="#play">Do your Blader profile while you wait</a>` : ''}`;
  } else if (!q) {
    body = `<div class="verdict"><h1>Hang tight</h1></div>`;
  } else if (l.status === 'question') {
    const a = answerOf(q.id, b.id), left = timeLeft();
    if (a) body = `<div class="verdict"><p class="eyebrow">Locked in</p><h1>${LETTERS[a.o]}. ${esc(q.options[a.o])}</h1><p class="muted">Wait for the reveal on the TV.</p></div>`;
    else if (left <= 0) body = `<div class="verdict"><p class="eyebrow">Question ${pad(l.qIndex + 1)}</p><h1>Time's up</h1><p class="muted">No answer this round. Get ready for the next one.</p></div>`;
    else body = `<div class="row spread" style="margin-bottom:8px"><p class="q-count">Question ${pad(l.qIndex + 1)} / ${pad(liveQs().length)}</p><span class="cd-chip num" data-cd>${Math.ceil(left)}</span></div>
      <div class="progress"><span data-cdbar style="width:${left / q.seconds * 100}%"></span></div>
      <h1 class="q-text" style="font-size:clamp(28px,7vw,44px)">${esc(q.text)}</h1>
      <div class="options">${q.options.map((o, i) => `<button class="opt" data-act="live-answer" data-i="${i}"><b>${LETTERS[i]}</b><span>${esc(o)}</span></button>`).join('')}</div>`;
  } else if (l.status === 'reveal') {
    const a = answerOf(q.id, b.id), pts = pointsFor(q, a);
    body = `<div class="verdict ${pts ? 'win' : 'lose'}"><p class="eyebrow">Question ${pad(l.qIndex + 1)}</p><h1>${pts ? 'Correct! +' + pts : a ? 'Not this time' : 'No answer'}</h1><p class="muted">Answer: <b>${LETTERS[q.correct]}. ${esc(q.options[q.correct])}</b></p></div>`;
  } else {
    const rank = t ? sb.teams.findIndex(x => x.id === t.id) + 1 : 0;
    const prank = sb.players.findIndex(x => x.b.id === b.id) + 1;
    body = `<div class="verdict"><p class="eyebrow">${l.status === 'end' ? 'Final results' : 'Leaderboard'}</p><h1>${rank ? `${esc(t.name)} is ${ordinal(rank)} of ${sb.teams.length}` : `You're ${ordinal(prank || sb.players.length + 1)}`}</h1><p class="muted">You've scored ${sb.map[b.id] || 0} points${prank ? `, ${ordinal(prank)} overall` : ''}.</p></div>`;
  }
  return head + body + `<div class="row" style="margin-top:28px"><button class="btn ghost small" data-act="logout">Not ${esc(b.name)}? Switch</button></div>`;
}
const ordinal = n => n + (['th', 'st', 'nd', 'rd'][(n % 100 > 10 && n % 100 < 14) ? 0 : n % 10] || 'th');

function liveTV() {
  const l = live(), q = curQ(), qs = liveQs(), all = bladers();
  const joined = new Set(joinedIds());
  if (l.status === 'idle' || l.status === 'lobby' || !q) {
    const url = linkTo('live');
    return `<div class="join-wrap"><div class="qr-box">${qrSvg(url)}</div>
      <div class="join-copy"><p class="sub">Team quiz</p><div class="big">Scan to <em>join</em></div><p class="join-url">${esc(url.replace(/^https?:\/\//, ''))}</p>
      <p class="sub">${joined.size} of ${all.length} Bladers in</p>
      <div class="lobby-grid compact">${all.map(b => `<div class="tile ${joined.has(b.id) ? 'done' : ''}">${avatar(b)}<span>${esc(b.name)}</span></div>`).join('')}</div></div></div>`;
  }
  const n = `Question ${pad(l.qIndex + 1)} / ${pad(qs.length)}`;
  if (l.status === 'question') {
    const answered = answersFor(q.id).length, left = timeLeft();
    return `<div class="tvq"><div class="tvq-top"><span class="sub">${n}</span><span class="cd num" data-cd>${Math.ceil(left)}</span></div>
      <div class="cd-bar"><span data-cdbar style="width:${left / q.seconds * 100}%"></span></div>
      <h2 class="tvq-text">${esc(q.text)}</h2>
      <div class="tv-opts">${q.options.map((o, i) => `<div class="tv-opt"><b>${LETTERS[i]}</b><span>${esc(o)}</span></div>`).join('')}</div>
      <p class="sub">${answered} of ${joined.size || all.length} answered</p></div>`;
  }
  if (l.status === 'reveal') {
    const ans = answersFor(q.id), counts = q.options.map((_, i) => ans.filter(a => a.o === i).length), max = Math.max(1, ...counts);
    const fastest = ans.filter(a => a.o === q.correct).sort((x, y) => x.ms - y.ms)[0];
    const fb = fastest && Store.state.bladers[fastest.bid];
    return `<div class="tvq"><div class="tvq-top"><span class="sub">${n} · Answer</span></div><h2 class="tvq-text">${esc(q.text)}</h2>
      <div class="tv-opts">${q.options.map((o, i) => `<div class="tv-opt ${i === q.correct ? 'ok' : 'dim'}"><b>${LETTERS[i]}</b><span>${esc(o)}</span><i class="tv-count num">${counts[i]}</i><em class="tv-bar" style="width:${counts[i] / max * 100}%"></em></div>`).join('')}</div>
      <p class="sub">${fb ? `Fastest correct: ${esc(fb.name)} · ${(fastest.ms / 1000).toFixed(1)}s` : 'Nobody got that one'}</p></div>`;
  }
  const sb = scoreboard();
  const rows = sb.teams.length ? sb.teams.map(t => ({ name: t.name, v: t.avg, sub: t.members.map(id => (Store.state.bladers[id] || {}).name).filter(Boolean).join(' · ') }))
    : sb.players.map(x => ({ name: x.b.name, v: x.p, sub: x.b.exp }));
  const top = Math.max(1, ...rows.map(r => r.v));
  const board = `<div class="board">${rows.slice(0, 8).map((r, i) => `<div class="brow ${i === 0 ? 'lead' : ''}"><span class="brank num">${pad(i + 1)}</span><div class="bname"><b>${esc(r.name)}</b><small>${esc(r.sub)}</small><div class="bbar"><span style="width:${r.v / top * 100}%"></span></div></div><span class="bpts num">${r.v}</span></div>`).join('')}</div>`;
  if (l.status === 'end' && rows.length) {
    return `<div class="stage-inner"><p class="sub">Team quiz champions</p><div class="big"><em>${esc(rows[0].name)}</em></div><p class="sub">${esc(rows[0].sub)}</p>${board}</div>`;
  }
  return `<div class="stage-inner"><p class="sub">Leaderboard · after question ${pad(l.qIndex + 1)}${sb.teams.length ? ' · team average' : ''}</p>${board}</div>`;
}

function adminLive() {
  const l = live(), qs = liveQs(), q = curQ(), n = l.qIndex, last = n >= qs.length - 1;
  const joined = joinedIds().length, answered = q ? answersFor(q.id).length : 0;
  const next = last ? `<button class="btn" data-act="live-end">Final results</button>` : `<button class="btn" data-act="live-start" data-i="${n + 1}">Next question</button>`;
  const states = {
    idle: ['Not running', `<button class="btn primary" data-act="live-lobby" ${qs.length ? '' : 'disabled'}>Open quiz lobby on TV</button>`],
    lobby: [`Lobby open · ${joined} joined`, `<button class="btn primary" data-act="live-start" data-i="0">Start question 1</button>`],
    question: [`Question ${n + 1} of ${qs.length} · ${answered} of ${joined} answered`, `<button class="btn primary" data-act="live-reveal">Reveal answer</button>`],
    reveal: [`Question ${n + 1} answer showing`, `<button class="btn primary" data-act="live-board">Show leaderboard</button>${next}`],
    board: [`Leaderboard after question ${n + 1}`, next.replace('class="btn"', 'class="btn primary"')],
    end: ['Finished · champions on the TV', `<button class="btn" data-act="live-close">Close quiz</button>`],
  };
  const [label, ctl] = states[l.status] || states.idle;
  const checks = qs.filter(x => x.checkMe).length;
  return `<div class="section-head"><div><p class="eyebrow">Played live on the TV · guests scan to join</p><h2>Team quiz</h2></div><a class="btn ghost small" href="#arena" target="_blank" rel="noopener">Open arena screen</a></div>
  <div class="cards2" style="margin-bottom:22px">
    <div class="plate form"><span class="pill ${l.status !== 'idle' ? 'live' : ''}"><i></i>${esc(label)}</span><div class="row">${ctl}</div>
      ${l.status !== 'idle' ? `<div class="row"><button class="btn ghost small" data-act="live-close" data-confirm="Stop the quiz?">Stop quiz</button><button class="btn danger small" data-act="live-reset" data-confirm="Erase all quiz scores?">Reset scores</button></div>` : `<button class="btn danger small" data-act="live-reset" data-confirm="Erase all quiz scores?">Reset scores</button>`}
      <p class="muted" style="margin:0;font-size:14px">Run this from your phone: open Admin on it and use these buttons while the TV shows the arena screen.</p></div>
    <div class="plate form" style="grid-template-columns:110px 1fr;align-items:center"><div class="qr-mini">${qrSvg(linkTo('live'))}</div><div class="form" style="gap:8px"><span class="lbl">Join link</span><span class="num" style="word-break:break-all;font-size:14px">${esc(linkTo('live'))}</span><button class="btn small" data-act="copy-join">Copy link</button></div></div>
  </div>
  ${checks ? `<div class="note warn" style="margin-bottom:14px"><p>${checks} question${checks > 1 ? 's need' : ' needs'} the right answer set (marked "Check answer"). Open each one, pick the correct answer and save.</p></div>` : ''}
  <div class="section-head"><div><p class="eyebrow">${qs.length} questions · faster correct answers score more (500–1000)</p><h3 style="font-size:30px">Questions</h3></div>
    <div class="row"><button class="btn primary small" data-act="lq-new">Add question</button><button class="btn danger small" data-act="lq-restore" data-confirm="Replace all quiz questions?">Restore defaults</button></div></div>
  <div class="qlist">${qs.map((x, i) => `<div class="qitem"><span class="n">${pad(i + 1)}</span><div style="min-width:0"><p>${esc(x.text)} ${x.checkMe ? '<span class="chip warnchip">Check answer</span>' : ''}</p><div class="qopts">${x.options.map((o, j) => `<span class="${j === x.correct ? 'right' : ''}">${LETTERS[j]}. ${esc(o)}${j === x.correct ? ' ✓' : ''}</span>`).join('')}<span>${x.seconds}s</span></div></div>
    <div class="qactions"><button class="btn ghost small" data-act="lq-move" data-i="${i}" data-d="-1" ${i === 0 ? 'disabled' : ''} aria-label="Move up">↑</button><button class="btn ghost small" data-act="lq-move" data-i="${i}" data-d="1" ${i === qs.length - 1 ? 'disabled' : ''} aria-label="Move down">↓</button><button class="btn small" data-act="lq-edit" data-i="${i}">Edit</button><button class="btn danger small" data-act="lq-del" data-i="${i}" data-confirm="Delete?">Delete</button></div></div>`).join('') || '<p class="muted">No questions yet.</p>'}</div>`;
}

function modalLiveQ(m) {
  const d = m.draft;
  return `<h2>${m.index == null ? 'New quiz question' : 'Quiz question ' + pad(m.index + 1)}</h2>
  <div class="field"><label for="f-lqtext">Question</label><textarea id="f-lqtext" rows="2">${esc(d.text)}</textarea></div>
  <div class="field" style="max-width:160px"><label for="f-lqsec">Seconds to answer</label><input id="f-lqsec" type="number" min="5" max="120" value="${d.seconds}"></div>
  <span class="lbl">Answers · tick the correct one</span>
  ${d.options.map((o, i) => `<div class="optrow" style="grid-template-columns:auto 1fr auto;align-items:center"><label class="check" title="Correct answer"><input type="radio" name="lq-correct" id="lq-c-${i}" value="${i}" ${d.correct === i ? 'checked' : ''}> ${LETTERS[i]}</label><input id="lq-o-${i}" type="text" value="${esc(o)}" aria-label="Answer ${LETTERS[i]}">${d.options.length > 2 ? `<button class="btn danger small" data-act="lqopt-del" data-i="${i}">Remove</button>` : '<span></span>'}</div>`).join('')}
  ${d.options.length < 6 ? '<button class="btn ghost small" data-act="lqopt-add">Add answer</button>' : ''}
  <div class="modal-foot"><span></span><div class="row"><button class="btn ghost" data-act="modal-close">Cancel</button><button class="btn primary" data-act="lq-save">Save question</button></div></div>`;
}
function readLQForm() {
  const d = ui.modal.draft;
  d.text = $('#f-lqtext').value;
  d.seconds = Math.max(5, Math.min(120, +$('#f-lqsec').value || 20));
  d.options = d.options.map((_, i) => $('#lq-o-' + i).value);
  const c = document.querySelector('input[name="lq-correct"]:checked'); d.correct = c ? +c.value : 0;
}

setInterval(() => {
  const cds = document.querySelectorAll('[data-cd]'), bars = document.querySelectorAll('[data-cdbar]');
  const q = curQ(), l = live();
  if (!q || l.status !== 'question' || (!cds.length && !bars.length)) return;
  const left = timeLeft();
  cds.forEach(e => { e.textContent = Math.ceil(left); });
  bars.forEach(e => { e.style.width = (left / q.seconds * 100) + '%'; });
  if (left <= 0 && ui.timeUp !== l.stamp) { ui.timeUp = l.stamp; changed(); }
}, 200);

/* ---------- ARENA (TV) ---------- */
function viewArena() {
  const a = Store.state.arena || defaultArena();
  const all = bladers(), done = all.filter(b => b.done).length, ts = teams();
  let stage;
  if (a.screen === 'live') {
    stage = liveTV();
  } else if (a.screen === 'teams') {
    const shown = ts.slice(0, a.revealed);
    stage = shown.length ? `<div class="reveal-grid">${shown.map((t, i) => `<div class="rteam ${i === shown.length - 1 ? 'fresh' : ''}"><h3>${esc(t.name)}</h3>${t.members.map(id => Store.state.bladers[id]).filter(Boolean).map(b => `<div class="m">${avatar(b)}<div><b>${esc(b.name)}</b><small class="t-${b.type}">${b.type ? typeName(b.type) + ' type' : esc(b.exp)}</small></div></div>`).join('')}</div>`).join('')}</div>`
      : `<div class="stage-inner"><p class="sub">Team reveal</p><div class="big">Teams <em>incoming</em></div></div>`;
  } else if (a.screen === 'battle') {
    const side = id => { const t = ts.find(x => x.id === id); return `<div class="side"><h3>${esc(t ? t.name : 'TBC')}</h3><div class="names-row">${t ? t.members.map(m => Store.state.bladers[m]).filter(Boolean).map(b => `<span>${esc(b.name)}</span>`).join('') : ''}</div></div>`; };
    stage = `<div class="stage-inner"><p class="sub">${esc(a.battle.label)}</p><div class="versus">${side(a.battle.a)}<div class="vs">VS</div>${side(a.battle.b)}</div>${a.battle.note ? `<div class="launch">${esc(a.battle.note)}</div>` : ''}</div>`;
  } else if (a.screen === 'message') {
    stage = `<div class="stage-inner"><div class="big">${esc(a.message.big)}</div>${a.message.small ? `<p class="sub">${esc(a.message.small)}</p>` : ''}</div>`;
  } else {
    stage = `<div class="stage-inner"><p class="sub">${esc(S().tagline)}</p><div class="counters"><div><span class="k">Registered</span><b>${all.length}</b></div><div><span class="k">Assessed</span><b style="color:var(--x)">${done}</b></div></div>
      <div class="lobby-grid">${all.map(b => `<div class="tile ${b.done ? 'done' : ''}">${avatar(b)}<span>${esc(b.name)}</span></div>`).join('')}</div></div>
      <div class="corner-qr"><div class="qr-mini">${qrSvg(linkTo('play'))}</div><span class="k">Scan to do<br>your Blader profile</span></div>`;
  }
  return `<div class="arena"><div class="arena-top"><a class="brand" href="#" aria-label="Home">${LOGO}<b>${esc(S().eventName)}</b></a><span class="k">${Store.mode === 'live' ? 'Live' : 'This device'}</span></div><div class="stage">${stage}</div>
    <div class="arena-tools"><button class="btn small ghost" data-act="fullscreen">Full screen</button><a class="btn small ghost" href="#admin">Admin</a></div></div>`;
}
let wake = null;
async function keepAwake() { try { if (!wake && navigator.wakeLock) { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); } } catch {} }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && route() === 'arena') keepAwake(); });

/* ---------- confirm-by-second-tap ---------- */
function needsConfirm(el) {
  if (!el.dataset.confirm || el.classList.contains('armed')) return false;
  el.dataset.label = el.textContent; el.textContent = el.dataset.confirm; el.classList.add('armed');
  setTimeout(() => { if (el.isConnected && el.classList.contains('armed')) { el.classList.remove('armed'); el.textContent = el.dataset.label; } }, 4000);
  return true;
}

/* ---------- events ---------- */
const arena = () => Store.state.arena || defaultArena();
const actions = {
  'pick': el => {
    if (el.dataset.mode === 'live' || S().requirePin === false) { signIn(el.dataset.id); return; }
    ui.pinFor = el.dataset.id; ui.pin = ''; render();
  },
  'pin-key': el => pinKey(el.dataset.k),
  'pin-cancel': () => { ui.pinFor = null; ui.pin = ''; render(); },
  'answer': el => answer(+el.dataset.i),
  'q-back': () => { ui.qIndex = Math.max(0, ui.qIndex - 1); render(); },
  'logout': () => { local.set('me', null); ui.draft = {}; ui.qIndex = 0; render(); },

  'tab': el => { ui.adminTab = el.dataset.tab; render(); window.scrollTo(0, 0); },
  'admin-logout': () => { local.set('admin', null); render(); },
  'toggle-pins': () => { ui.showPins = !ui.showPins; render(); },
  'blader-new': () => openModal({ type: 'blader', id: null, draft: { name: '', exp: 'Beginner', pin: newPin(), img: '', type: '', stats: null } }),
  'blader-edit': el => { const b = Store.state.bladers[el.dataset.id]; openModal({ type: 'blader', id: b.id, draft: { name: b.name, exp: b.exp, pin: b.pin, img: b.img || '', type: b.type || '', stats: b.stats ? { ...b.stats } : null } }); },
  'img-clear': () => { readBladerForm(); ui.modal.draft.img = ''; drawModal(); },
  'blader-save': async () => {
    readBladerForm(); const d = ui.modal.draft;
    if (!d.name.trim()) { toast('Give the Blader a name.', 'bad'); return; }
    if (!/^\d{4}$/.test(d.pin)) { toast('The PIN must be exactly 4 digits.', 'bad'); return; }
    const clash = bladers().find(b => b.pin === d.pin && b.id !== ui.modal.id);
    if (clash) { toast(`${clash.name} already uses that PIN.`, 'bad'); return; }
    if (!ui.modal.id) { const b = await addBlader(d.name, d.exp, d.pin); if (d.img) await Store.set('blader:' + b.id, { ...b, img: d.img }); closeModal(); toast(`Added ${d.name} as ${b.id}`); return; }
    const b = Store.state.bladers[ui.modal.id];
    let type = d.type, stats = d.stats;
    if (stats && !type) { type = 'bal'; for (const s of STATS) if (stats[s.k] > stats[type]) type = s.k; }
    if (!stats && b.done) stats = b.stats;
    await Store.set('blader:' + b.id, { ...b, name: d.name.trim(), exp: d.exp, pin: d.pin, img: d.img, stats, type: stats ? (type || b.type) : '' });
    closeModal(); toast('Saved');
  },
  'blader-reset': async () => { const b = Store.state.bladers[ui.modal.id]; await Store.set('blader:' + b.id, { ...b, answers: {}, stats: null, type: '', done: false }); closeModal(); toast(`${b.name} can retake the assessment`); },
  'blader-del': async () => {
    const id = ui.modal.id, name = Store.state.bladers[id].name;
    const ts = teams(); if (ts.some(t => t.members.includes(id))) await Store.set('teams', ts.map(t => ({ ...t, members: t.members.filter(m => m !== id) })));
    await Store.del('blader:' + id); closeModal(); toast(`Deleted ${name}`);
  },
  'import-open': () => openModal({ type: 'import' }),
  'import-run': runImport,
  'export-csv': exportCSV,
  'invite-copy': el => { const b = Store.state.bladers[el.dataset.id]; copyText(`Hi ${b.name}! Do your Blader profile before the party: ${inviteLink(b)}`, `Invite for ${b.name} copied`); },
  'invite-all': () => copyText(bladers().map(b => `${b.name}: ${inviteLink(b)}`).join('\n'), 'All invite links copied'),

  'q-new': () => openModal({ type: 'q', index: null, draft: { text: '', options: STATS.map(s => ({ text: '', fx: { [s.k]: 3 } })) } }),
  'q-edit': el => { const i = +el.dataset.i, q = questions()[i]; openModal({ type: 'q', index: i, draft: JSON.parse(JSON.stringify(q)) }); },
  'opt-add': () => { readQForm(); ui.modal.draft.options.push({ text: '', fx: {} }); drawModal(); },
  'opt-del': el => { readQForm(); ui.modal.draft.options.splice(+el.dataset.i, 1); drawModal(); },
  'q-save': async () => {
    readQForm(); const d = ui.modal.draft;
    if (!d.text.trim()) { toast('Write the question first.', 'bad'); return; }
    if (d.options.some(o => !o.text.trim())) { toast('Every answer needs text.', 'bad'); return; }
    const qs = questions().slice();
    if (ui.modal.index == null) qs.push({ id: uid(), ...d }); else qs[ui.modal.index] = d;
    await Store.set('questions', qs); closeModal(); toast('Question saved');
  },
  'q-move': async el => { const i = +el.dataset.i, j = i + +el.dataset.d, qs = questions().slice(); [qs[i], qs[j]] = [qs[j], qs[i]]; await Store.set('questions', qs); },
  'q-del': async el => { const qs = questions().slice(); qs.splice(+el.dataset.i, 1); await Store.set('questions', qs); toast('Question deleted'); },
  'cq-new': () => openModal({ type: 'cq', index: null, draft: { text: '', options: [{ text: '', look: '' }, { text: '', look: '' }, { text: '', look: '' }] } }),
  'cq-edit': el => { const i = +el.dataset.i; openModal({ type: 'cq', index: i, draft: JSON.parse(JSON.stringify(charQs()[i])) }); },
  'cqopt-add': () => { readCQForm(); ui.modal.draft.options.push({ text: '', look: '' }); drawModal(); },
  'cqopt-del': el => { readCQForm(); ui.modal.draft.options.splice(+el.dataset.i, 1); drawModal(); },
  'cq-save': async () => {
    readCQForm(); const d = ui.modal.draft;
    if (!d.text.trim()) { toast('Write the question first.', 'bad'); return; }
    if (d.options.some(o => !o.text.trim())) { toast('Every answer needs text.', 'bad'); return; }
    d.options = d.options.map(o => ({ text: o.text.trim(), look: o.look.trim() || o.text.trim() }));
    const cs = charQs().slice(), item = { id: d.id || 'c' + uid(), text: d.text.trim(), options: d.options };
    if (ui.modal.index == null) cs.push(item); else cs[ui.modal.index] = item;
    await Store.set('charq', cs); closeModal(); toast('Character question saved');
  },
  'cq-move': async el => { const i = +el.dataset.i, j = i + +el.dataset.d, cs = charQs().slice(); [cs[i], cs[j]] = [cs[j], cs[i]]; await Store.set('charq', cs); },
  'cq-del': async el => { const cs = charQs().slice(); cs.splice(+el.dataset.i, 1); await Store.set('charq', cs); toast('Question deleted'); },
  'cq-restore': async () => { await Store.set('charq', defaultCharQ()); toast('Default character questions restored'); },
  'brief-copy': el => { const b = Store.state.bladers[el.dataset.id]; copyText(briefOf(b), `${b.name}'s character description copied`); },
  'q-restore': async () => { await Store.set('questions', defaultQuestions()); toast('Default questions restored'); },

  'teams-gen': generateTeams,

  'live-answer': async el => {
    const b = me(), l = live(), q = curQ();
    if (!b || !q || l.status !== 'question' || answerOf(q.id, b.id) || timeLeft() <= 0) return;
    await Store.set(`ans:${q.id}:${b.id}`, { o: +el.dataset.i, ms: Date.now() - seenAt(l.stamp) });
  },
  'live-lobby': async () => { await Store.set('live', { status: 'lobby', qIndex: 0, stamp: '' }); await Store.set('arena', { ...arena(), screen: 'live' }); toast('Quiz lobby is on the TV'); },
  'live-start': async el => { await Store.set('live', { status: 'question', qIndex: +el.dataset.i, stamp: uid() }); if (arena().screen !== 'live') await Store.set('arena', { ...arena(), screen: 'live' }); },
  'live-reveal': () => Store.set('live', { ...live(), status: 'reveal' }),
  'live-board': () => Store.set('live', { ...live(), status: 'board' }),
  'live-end': () => Store.set('live', { ...live(), status: 'end' }),
  'live-close': async () => { await Store.set('live', { status: 'idle', qIndex: 0, stamp: '' }); await Store.set('arena', { ...arena(), screen: 'lobby' }); },
  'live-reset': async () => { for (const k of Object.keys(Store.state.answers)) await Store.del('ans:' + k); if (live().status !== 'idle') await Store.set('live', { status: 'lobby', qIndex: 0, stamp: '' }); toast('Quiz scores cleared'); },
  'copy-join': () => copyText(linkTo('live'), 'Join link copied'),
  'lq-new': () => openModal({ type: 'lq', index: null, draft: { text: '', options: ['', '', '', ''], correct: 0, seconds: 20 } }),
  'lq-edit': el => { const i = +el.dataset.i; openModal({ type: 'lq', index: i, draft: JSON.parse(JSON.stringify(liveQs()[i])) }); },
  'lqopt-add': () => { readLQForm(); ui.modal.draft.options.push(''); drawModal(); },
  'lqopt-del': el => { readLQForm(); const d = ui.modal.draft, i = +el.dataset.i; d.options.splice(i, 1); if (d.correct === i) d.correct = 0; else if (d.correct > i) d.correct--; drawModal(); },
  'lq-save': async () => {
    readLQForm(); const d = ui.modal.draft;
    if (!d.text.trim()) { toast('Write the question first.', 'bad'); return; }
    if (d.options.some(o => !o.trim())) { toast('Every answer needs text.', 'bad'); return; }
    const qs = liveQs().slice(), item = { id: d.id || uid(), text: d.text.trim(), options: d.options.map(o => o.trim()), correct: d.correct, seconds: d.seconds, checkMe: false };
    if (ui.modal.index == null) qs.push(item); else qs[ui.modal.index] = item;
    await Store.set('liveq', qs); closeModal(); toast('Quiz question saved');
  },
  'lq-move': async el => { const i = +el.dataset.i, j = i + +el.dataset.d, qs = liveQs().slice(); [qs[i], qs[j]] = [qs[j], qs[i]]; await Store.set('liveq', qs); },
  'lq-del': async el => { const qs = liveQs().slice(); qs.splice(+el.dataset.i, 1); await Store.set('liveq', qs); toast('Question deleted'); },
  'lq-restore': async () => { await Store.set('liveq', defaultLiveQ()); toast('Default quiz questions restored'); },
  'team-add': async () => { const ts = teams(); await Store.set('teams', ts.concat({ id: uid(), name: 'Team ' + pad(ts.length + 1), members: [] })); },
  'team-del': async el => { await Store.set('teams', teams().filter(t => t.id !== el.dataset.id)); },

  'arena-screen': el => Store.set('arena', { ...arena(), screen: el.dataset.s }),
  'reveal-next': () => Store.set('arena', { ...arena(), screen: 'teams', revealed: Math.min(teams().length, (arena().revealed || 0) + 1) }),
  'reveal-all': () => Store.set('arena', { ...arena(), screen: 'teams', revealed: teams().length }),
  'reveal-reset': () => Store.set('arena', { ...arena(), revealed: 0 }),
  'battle-show': () => { Store.set('arena', { ...arena(), screen: 'battle', battle: { label: $('#f-blabel').value, a: $('#f-ba').value, b: $('#f-bb').value, note: $('#f-bnote').value } }); toast('Battle is on the TV'); },
  'message-show': () => { Store.set('arena', { ...arena(), screen: 'message', message: { big: $('#f-mbig').value, small: $('#f-msmall').value } }); toast('Message is on the TV'); },
  'fullscreen': () => { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}); } catch {} },

  'backup': () => download('Baeblade_Backup_' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify({ app: 'baeblade-academy', savedAt: new Date().toISOString(), settings: S(), questions: questions(), charq: charQs(), liveq: liveQs(), teams: teams(), arena: arena(), bladers: bladers() }, null, 2), 'application/json'),
  'wipe': async () => { for (const b of bladers()) await Store.del('blader:' + b.id); for (const k of Object.keys(Store.state.answers)) await Store.del('ans:' + k); for (const k of Object.keys(Store.state.joins)) await Store.del('join:' + k); await Store.set('teams', []); await Store.set('arena', defaultArena()); toast('Roster and teams cleared'); },

  'modal-close': () => closeModal(),
  'modal-bg': (el, e) => { if (e.target === el) closeModal(); },
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  if (el.dataset.act === 'modal-bg' && e.target !== el) return;
  if (el.disabled) return;
  if (needsConfirm(el)) return;
  const fn = actions[el.dataset.act]; if (fn) { e.preventDefault(); fn(el, e); }
});

document.addEventListener('input', e => {
  if (e.target.id === 'pick-search') {
    ui.pickQuery = e.target.value;
    const pos = e.target.selectionStart; render();
    const s = $('#pick-search'); if (s) { s.focus(); s.setSelectionRange(pos, pos); }
  }
});

document.addEventListener('change', async e => {
  const el = e.target, k = el.dataset.change; if (!k) return;
  if (k === 'move') {
    const id = el.dataset.id, to = el.value;
    await Store.set('teams', teams().map(t => ({ ...t, members: t.id === to ? t.members.filter(m => m !== id).concat(id) : t.members.filter(m => m !== id) })));
  } else if (k === 'team-name') {
    await Store.set('teams', teams().map(t => t.id === el.dataset.id ? { ...t, name: el.value.trim() || t.name } : t));
  } else if (k === 'teamsize') {
    await Store.set('settings', { ...S(), teamSize: Math.max(2, Math.min(8, +el.value || 3)) });
  } else if (k === 'showteams') {
    await Store.set('settings', { ...S(), showTeams: el.checked });
  } else if (k === 'img') {
    const f = el.files[0]; if (!f) return;
    try { readBladerForm(); ui.modal.draft.img = await resizeImage(f); drawModal(); } catch (err) { toast(err.message, 'bad'); }
  } else if (k === 'csvfile') {
    const f = el.files[0]; if (f) $('#f-csv').value = await f.text();
  } else if (k === 'restore') {
    const f = el.files[0]; if (f) await restoreBackup(f); el.value = '';
  }
});

document.addEventListener('submit', async e => {
  const f = e.target.dataset.form; if (!f) return;
  e.preventDefault();
  if (f === 'admin-login') {
    const v = $('#f-adminpin').value.trim();
    if (v === S().adminPin) { local.set('admin', v); render(); } else { toast('Wrong admin PIN.', 'bad'); $('#f-adminpin').value = ''; }
  } else if (f === 'selfjoin') {
    const name = $('#f-selfname').value.trim(); if (!name) return;
    const dup = bladers().find(b => b.name.toLowerCase() === name.toLowerCase());
    if (dup) { toast(`${dup.name} is already on the list. Tap the name above.`, 'bad'); return; }
    const b = await addBlader(name, 'Beginner');
    document.activeElement.blur(); signIn(b.id); toast(`Welcome, ${b.name}. You're ${b.id}.`);
  } else if (f === 'settings') {
    const pin = $('#f-apin').value.trim();
    if (pin.length < 4) { toast('Use at least 4 characters for the admin PIN.', 'bad'); return; }
    await Store.set('settings', { ...S(), eventName: $('#f-ename').value.trim() || 'Baeblade Academy', tagline: $('#f-tag').value.trim(), adminPin: pin, siteUrl: $('#f-site').value.trim(), requirePin: $('#f-reqpin').checked, selfJoin: $('#f-selfjoin').checked });
    local.set('admin', pin); document.activeElement.blur(); render(); toast('Settings saved');
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && ui.modal) closeModal();
  if (route() === 'play' && ui.pinFor && !e.target.closest('input,textarea')) {
    if (/^\d$/.test(e.key)) pinKey(e.key); else if (e.key === 'Backspace') pinKey('back');
  }
});

/* ---------- start ---------- */
Store.init().then(() => {
  const b = me(); if (b) ui.draft = JSON.parse(local.get('draft:' + b.id) || '{}');
  render();
}).catch(e => { $('#app').innerHTML = `<p class="boot">Couldn't start: ${esc(e.message)}</p>`; });
})();
