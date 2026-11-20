import './style.css'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
const PASS = 'oriolp@7'
const $ = (s) => document.querySelector(s)
const root = $('#root')
const P = {
  plus: '<path d="M12 5v14M5 12h14"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>', check: '<path d="M20 6 9 17l-5-5"/>', play: '<path d="m6 3 14 9-14 9V3Z"/>',
  mark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>', pause: '<circle cx="12" cy="12" r="10"/><path d="M10 15V9M14 15V9"/>',
  pad: '<path d="M6 12h4M8 10v4M15 13h.01M18 11h.01"/><path d="M17.3 5H6.7a4 4 0 0 0-4 3.4l-1.1 6.5A3 3 0 0 0 7 16.5L8 15h8l1 1.5a3 3 0 0 0 5.4-1.6l-1.1-6.5a4 4 0 0 0-4-3.4Z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
}
const ico = (n) => `<svg class="i" viewBox="0 0 24 24">${P[n]}</svg>`
const STAR = '<svg viewBox="0 0 24 24"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2Z"/></svg>'
const ST = {
  playing: ['Jugando', 'play', 'var(--pl)'], done: ['Pasado', 'check', 'var(--ok)'],
  backlog: ['Pendiente', 'mark', 'var(--mu)'], dropped: ['Abandonado', 'pause', 'var(--dr)'],
}
const FILTERS = [['all', 'Todos'], ['playing', 'Jugando'], ['done', 'Pasados'], ['backlog', 'Pendientes'], ['dropped', 'Abandonados']]
const HUES = [8, 24, 38, 150, 170, 0]
let lib = [], tab = 'lib', flt = 'all'

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const hue = (s) => HUES[[...String(s)].reduce((a, c) => a + c.charCodeAt(0), 0) % HUES.length]
const crop = (u, w, h) => (u ? u.replace('/media/', `/media/crop/${w}/${h}/`) : '')
const cover = (c, st) =>
  `<div class="cover" style="--h:${hue(c.t)}">${c.img ? `<img loading="lazy" src="${crop(c.img, 400, 533)}" alt="">` : `<div class="ct">${esc(c.t)}</div>`}${st ? `<div class="st">${ico(ST[st][1])}</div>` : ''}</div>`

function save(g) {
  clearTimeout(g._t)
  g._t = setTimeout(() => sb.from('games').upsert({ id: g.id, st: g.st, r: g.r, h: g.h, n: g.n, c: g.c }).then(({ error }) => error && console.error(error)), 300)
}

// ---------- theme ----------
const isDark = () => { const t = document.documentElement.dataset.theme; return t ? t === 'dark' : matchMedia('(prefers-color-scheme:dark)').matches }
const paintTh = () => { $('#th').innerHTML = ico(isDark() ? 'sun' : 'moon') }
function toggleTheme() {
  const t = isDark() ? 'light' : 'dark'
  document.documentElement.dataset.theme = t
  try { localStorage.setItem('glt', t) } catch {}
  paintTh()
}

// ---------- views ----------
function render() {
  const B = lib.filter((g) => g.st === 'backlog'), pl = lib.filter((g) => g.st === 'playing')
  $('#tabs').className = 'tabs' + (tab === 'next' ? ' n' : '')
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.t === tab))
  let h = ''
  if (tab === 'lib') {
    if (pl.length) h += `<div class="feats">${pl.map((g) => `<button class="feat" data-o="${g.id}" style="--h:${hue(g.c.t)}">${g.c.img ? `<img src="${crop(g.c.img, 1000, 460)}" alt="">` : ''}<div><em>Jugando</em><h3>${esc(g.c.t)}</h3><p>${esc([g.c.s, g.c.g].filter(Boolean).join(' · '))}</p></div></button>`).join('')}</div>`
    h += '<div class="chips">' + FILTERS.map(([k, l]) => `<button class="chip${flt === k ? ' on' : ''}" data-f="${k}">${l}<span>${k === 'all' ? lib.length : lib.filter((g) => g.st === k).length}</span></button>`).join('') + '</div>'
    const L = lib.filter((g) => flt === 'all' || g.st === flt)
    h += L.length
      ? `<div class="grid">${L.map((g, i) => `<button class="card" style="--i:${i}" data-o="${g.id}">${cover(g.c, g.st)}<div class="meta"><b>${esc(g.c.t)}</b><small><span class="dot" style="background:${ST[g.st][2]}"></span>${ST[g.st][0]}${g.r ? ` · ${g.r}/5` : ''}</small></div></button>`).join('')}</div>`
      : '<div class="empty">Nada por aquí todavía.</div>'
  } else {
    h += `<h2>Próximos · ${B.length}</h2>` + (B.length
      ? B.map((g, i) => `<button class="row" style="--i:${i}" data-o="${g.id}"><span class="num">${i + 1}</span>${cover(g.c)}<div class="info"><b>${esc(g.c.t)}</b><small>${esc([g.c.s, g.c.g].filter(Boolean).join(' · '))}</small></div>${ico('arrow')}</button>`).join('')
      : '<div class="empty">Sin pendientes. Añade alguno.</div>')
  }
  $('#app').innerHTML = h
}

const closeM = () => {
  const ov = $('#modal').firstChild
  if (!ov) return
  ov.classList.add('out')
  setTimeout(() => { $('#modal').innerHTML = ''; render() }, 180)
}

function openDetail(id) {
  const g = lib.find((x) => x.id === id), c = g.c, m = $('#modal')
  m.innerHTML = `<div class="ov"><div class="sheet"><div class="hero" style="--h:${hue(c.t)}">${c.img ? `<img src="${crop(c.img, 900, 500)}" alt="">` : ''}<button class="ib" data-x aria-label="Cerrar">${ico('x')}</button><div><h3>${esc(c.t)}</h3><p>${esc([c.s, c.y, c.g].filter(Boolean).join(' · '))}</p></div></div><div class="body">
${c.shots?.length ? `<div class="shots">${c.shots.map((s) => `<img loading="lazy" src="${s}" alt="">`).join('')}</div>` : ''}
<div><span class="lbl">Estado</span><div class="seg">${Object.keys(ST).map((k) => `<button data-s="${k}" style="--sc:${ST[k][2]}" class="${g.st === k ? 'on' : ''}">${ico(ST[k][1])}${ST[k][0]}</button>`).join('')}</div></div>
<div><span class="lbl">Tu nota</span><div class="stars">${[1, 2, 3, 4, 5].map((n) => `<button data-r="${n}" class="${g.r >= n ? 'on' : ''}" aria-label="${n} de 5">${STAR}</button>`).join('')}</div></div>
<div><span class="lbl">Notas</span><textarea id="nn" placeholder="Progreso, logros, impresiones…">${esc(g.n)}</textarea></div>
<details${g.h ? ' open' : ''}><summary>Horas jugadas (opcional)</summary><input type="number" min="0" id="hh" value="${g.h || ''}" placeholder="0"></details>
<div class="foot"><button class="btn g" data-del>${ico('trash')}Quitar</button><button class="btn" data-x>Listo</button></div></div></div></div>`
  const ov = m.firstChild
  ov.onclick = (e) => {
    const t = e.target.closest('[data-s],[data-r],[data-del],[data-x]')
    if (e.target === ov || t?.hasAttribute('data-x')) return closeM()
    if (!t) return
    if (t.dataset.s) {
      g.st = t.dataset.s
      ov.querySelectorAll('[data-s]').forEach((b) => b.classList.toggle('on', b.dataset.s === g.st))
    } else if (t.dataset.r) {
      const r = +t.dataset.r
      g.r = g.r === r ? 0 : r
      ov.querySelectorAll('[data-r]').forEach((b) => b.classList.toggle('on', +b.dataset.r <= g.r))
    } else if (t.hasAttribute('data-del')) {
      lib = lib.filter((x) => x !== g)
      sb.from('games').delete().eq('id', g.id).then(() => {})
      return closeM()
    }
    save(g)
  }
  ov.oninput = (e) => {
    if (e.target.id === 'hh') g.h = +e.target.value || 0
    if (e.target.id === 'nn') g.n = e.target.value
    save(g)
  }
}

function openAdd() {
  const m = $('#modal')
  m.innerHTML = `<div class="ov"><div class="sheet"><div class="body"><div style="display:flex;align-items:center;justify-content:space-between"><b style="font-size:17px;font-weight:700;letter-spacing:-.02em">Añadir juego</b><button class="ib" data-x aria-label="Cerrar">${ico('x')}</button></div><input type="text" id="q" placeholder="Busca un juego…" autocomplete="off"><div id="res"></div></div></div></div>`
  const q = $('#q'), res = $('#res'), ov = m.firstChild
  let list = [], tm, seq = 0
  async function search() {
    const v = q.value.trim()
    if (v.length < 2) { res.innerHTML = ''; return }
    const n = ++seq
    res.innerHTML = '<div class="empty">Buscando…</div>'
    let d = {}
    try { d = await (await fetch('/api/rawg?q=' + encodeURIComponent(v))).json() } catch {}
    if (n !== seq) return
    list = (d.results || []).filter((r) => !lib.some((g) => g.id === String(r.id)))
    res.innerHTML = list.map((r, i) => `<button class="sr" data-a="${i}">${cover({ t: r.name, img: r.background_image })}<div><b>${esc(r.name)}</b><small>${(r.released || '').slice(0, 4)} · ${esc(r.genres?.[0]?.name || '')}</small></div><span class="go">${ico('plus')}</span></button>`).join('')
      + `<button class="sr" data-a="new"><div class="cover" style="width:44px;display:grid;place-items:center;--h:0">${ico('plus')}</div><div><b>Añadir “${esc(v)}”</b><small>Sin buscar, a mano</small></div></button>`
  }
  q.oninput = () => { clearTimeout(tm); tm = setTimeout(search, 300) }
  ov.onclick = (e) => {
    if (e.target === ov || e.target.closest('[data-x]')) return closeM()
    const a = e.target.closest('[data-a]')
    if (!a) return
    let g
    if (a.dataset.a === 'new') {
      g = { id: 'c' + Date.now(), st: 'backlog', r: 0, h: 0, n: '', c: { t: q.value.trim() } }
    } else {
      const r = list[+a.dataset.a]
      g = { id: String(r.id), st: 'backlog', r: 0, h: 0, n: '', c: { t: r.name, s: '', y: (r.released || '').slice(0, 4), g: r.genres?.[0]?.name || '', img: r.background_image, shots: (r.short_screenshots || []).slice(1, 7).map((s) => s.image) } }
      fetch('/api/rawg?id=' + r.id).then((x) => x.json()).then((d) => { g.c.s = d.developers?.[0]?.name || ''; save(g) }).catch(() => {})
    }
    lib.unshift(g)
    save(g)
    render()
    openDetail(g.id)
  }
  q.focus()
}

// ---------- boot ----------
async function boot() {
  root.innerHTML = `<header><div class="wrap"><div class="logo"><b>${ico('pad')}</b><span>Biblioteca</span></div><div class="tabs" id="tabs"><i></i><button data-t="lib">Juegos</button><button data-t="next">Próximos</button></div><div class="sp"></div><button class="ib" id="th" aria-label="Cambiar tema"></button><button class="add hd" id="add2"></button></div></header><main class="wrap" id="app"><div class="empty">Cargando…</div></main><footer class="wrap att">Datos de <a href="https://rawg.io" target="_blank" rel="noopener">RAWG</a></footer><button class="add fab" id="add"></button><div id="modal"></div>`
  paintTh()
  for (const id of ['add', 'add2']) { const b = $('#' + id); b.innerHTML = ico('plus') + 'Añadir juego'; b.onclick = openAdd }
  $('#th').onclick = toggleTheme
  $('#tabs').onclick = (e) => { const t = e.target.closest('[data-t]'); if (t) { tab = t.dataset.t; render() } }
  $('#app').onclick = (e) => {
    const f = e.target.closest('[data-f]'), o = e.target.closest('[data-o]')
    if (f) { flt = f.dataset.f; render() } else if (o) openDetail(o.dataset.o)
  }
  const { data, error } = await sb.from('games').select('*').order('created_at', { ascending: false })
  if (error) { $('#app').innerHTML = '<div class="empty">No se pudo conectar con Supabase. Revisa las variables de entorno y el SQL.</div>'; return }
  lib = data
  render()
}

function login() {
  root.innerHTML = `<form class="login" id="lf"><div class="logo"><b>${ico('pad')}</b></div><h1>Biblioteca</h1><input type="password" id="pw" placeholder="Contraseña" autocomplete="current-password"><button class="btn">Entrar</button><p id="er"></p></form>`
  $('#pw').focus()
  $('#lf').onsubmit = (e) => {
    e.preventDefault()
    if ($('#pw').value === PASS) { localStorage.setItem('auth', '1'); boot(); return }
    const f = $('#lf')
    $('#er').textContent = 'Acceso no permitido'
    f.classList.remove('sh'); void f.offsetWidth; f.classList.add('sh')
  }
}

localStorage.getItem('auth') ? boot() : login()
