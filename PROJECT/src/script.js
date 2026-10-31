/* HEMS frontend. Patient status is NEVER computed here: it is only displayed
   as returned by the C backend (via the gateway). See README for the API contract. */
const CONFIG = {
  API_BASE: '/cgi-bin',        // C gateway that talks to the FIFOs / alerts.log
  POLL_MS: 10000,
  DEMO_USER: 'admin', DEMO_PASS: 'admin123'  // demo-mode sign-in only; not real security
};
const STAGES = [
  ['Patient input', 'form'], ['Monitoring process', 'fork()'], ['Pipe communication', 'pipe() / mkfifo()'],
  ['Emergency processor', 'read() / write()'], ['Status detection', 'wait()'], ['Doctor alert', 'alert'], ['Alert history', 'alerts.log']
];
const $ = (s, r = document) => r.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const state = { live: false, records: [], page: 'dashboard' };
const fmt = t => new Date(t).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
const pill = s => `<span class="pill ${esc(s)}">${esc(s)}</span>`;

/* ---------- sample data (DEMO ONLY, status labels are fixed sample values) ---------- */
function sampleData() {
  const m = 60000, now = Date.now();
  const r = (ago, id, name, age, hr, bp, temp, spo2, status) =>
    ({ time: now - ago * m, id, name, age, hr, bp, temp, spo2, status, demo: true });
  return [
    r(4, 'P-1042', 'Meera Nair', 67, 142, '88/54', 38.9, 86, 'EMERGENCY'),
    r(11, 'P-1038', 'Arjun Rao', 54, 108, '146/92', 37.8, 93, 'WARNING'),
    r(19, 'P-1031', 'Sana Khan', 32, 76, '118/76', 36.8, 98, 'NORMAL'),
    r(33, 'P-1027', 'Daniel Joseph', 71, 154, '84/50', 39.4, 84, 'EMERGENCY'),
    r(47, 'P-1019', 'Lakshmi Devi', 45, 72, '122/80', 36.6, 99, 'NORMAL'),
    r(65, 'P-1012', 'Imran Ali', 29, 101, '132/86', 37.6, 94, 'WARNING'),
    r(90, 'P-1007', 'Kavya Reddy', 38, 80, '116/74', 36.9, 97, 'NORMAL'),
    r(130, 'P-1002', 'Ravi Teja', 60, 70, '124/82', 36.7, 98, 'NORMAL')
  ];
}

/* ---------- backend adapter ---------- */
async function api(path, opts = {}, timeout = 4000) {
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), timeout);
  try {
    const res = await fetch(CONFIG.API_BASE + path, { ...opts, signal: ctl.signal, headers: { 'Content-Type': 'application/json' } });
    return res;
  } finally { clearTimeout(t); }
}
async function detectBackend() {
  try { const r = await api('/health', {}, 2500); const j = r.ok ? await r.json() : null; state.live = !!(j && j.ok); }
  catch { state.live = false; }
  renderMode();
}
async function loadRecords() {
  if (state.live) {
    try {
      const r = await api('/alerts'); const j = await r.json();
      state.records = (j.entries || []).map(e => ({ ...e, time: new Date(e.time).getTime(), demo: false }))
        .sort((a, b) => b.time - a.time);
    } catch { state.live = false; renderMode(); }
  }
  if (!state.live && !state.records.length) state.records = sampleData();
  renderAll();
}

/* ---------- login ---------- */
$('#loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const u = $('#user').value.trim(), p = $('#pass').value, err = $('#loginErr');
  let ok = false;
  if (state.live) {
    try { const r = await api('/login', { method: 'POST', body: JSON.stringify({ username: u, password: p }) });
      ok = r.status === 404 ? (u === CONFIG.DEMO_USER && p === CONFIG.DEMO_PASS) : r.ok; } catch { ok = false; }
  } else ok = u === CONFIG.DEMO_USER && p === CONFIG.DEMO_PASS;
  if (!ok) { err.textContent = 'Username or password is incorrect.'; err.hidden = false; return; }
  err.hidden = true; $('#login').hidden = true; $('#app').hidden = false;
  go('dashboard'); await detectBackend(); await loadRecords();
  setInterval(async () => { if (state.live) await loadRecords(); }, CONFIG.POLL_MS);
});
$('#logout').onclick = () => { $('#app').hidden = true; $('#login').hidden = false; $('#pass').value = ''; };

/* ---------- navigation ---------- */
const TITLES = {
  dashboard: ['Dashboard', 'Patient status overview'], monitor: ['Monitor patient', 'Send readings to the C monitoring process'],
  alerts: ['Doctor alerts', 'Warning and emergency alerts from alerts.log'], history: ['Patient history', 'Previous records and monitoring results']
};
function go(p) {
  state.page = p;
  document.querySelectorAll('.page').forEach(s => s.hidden = s.id !== 'p-' + p);
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.page === p));
  $('#pageTitle').textContent = TITLES[p][0]; $('#pageSub').textContent = TITLES[p][1];
  window.scrollTo(0, 0);
}
$('#nav').onclick = e => { const b = e.target.closest('button'); if (b) go(b.dataset.page); };
$('#refresh').onclick = async () => { await detectBackend(); await loadRecords(); };

/* ---------- rendering ---------- */
function renderMode() {
  const m = $('#mode'), b = $('#banner');
  m.className = 'mode ' + (state.live ? 'live' : 'demo');
  m.textContent = state.live ? 'Connected to C backend' : 'Demo data: backend not connected';
  b.hidden = state.live;
  b.innerHTML = '<b>Sample data only.</b> The records shown are fictional examples, not live readings. Patient status cannot be determined until the C backend is running and reachable through the gateway.';
}
const person = r => `<b>${esc(r.name)}</b>${r.demo ? '<span class="tag">SAMPLE</span>' : ''}<small>${esc(r.id)} · ${fmt(r.time)}</small>`;
function renderAll() {
  const R = state.records, n = s => R.filter(r => r.status === s).length;
  const src = state.live ? 'from alerts.log' : 'sample data';
  $('#stats').innerHTML = [['Patients monitored', R.length, ''], ['Normal', n('NORMAL'), 'NORMAL'], ['Warning', n('WARNING'), 'WARNING'], ['Emergency', n('EMERGENCY'), 'EMERGENCY']]
    .map(([l, v, c]) => `<div class="stat ${c}"><b>${v}</b><span>${l} (${src})</span></div>`).join('');
  const em = R.filter(r => r.status === 'EMERGENCY');
  $('#dashAlerts').innerHTML = em.length ? em.slice(0, 4).map(r => `<div class="row EMERGENCY"><div>${person(r)}<small>HR ${esc(r.hr)} · BP ${esc(r.bp)} · SpO₂ ${esc(r.spo2)}%</small></div>${pill(r.status)}</div>`).join('') : '<p class="empty">No emergency alerts.</p>';
  $('#dashRecent').innerHTML = R.length ? R.slice(0, 6).map(r => `<div class="row"><div>${person(r)}</div>${pill(r.status)}</div>`).join('') : '<p class="empty">No activity yet.</p>';
  const al = R.filter(r => r.status !== 'NORMAL'), bd = $('#alertBadge');
  bd.hidden = !em.length; bd.textContent = em.length;
  $('#alertCards').innerHTML = em.length ? em.map(r => `<div class="acard"><div>${pill(r.status)}</div><h4>${esc(r.name)}${r.demo ? '<span class="tag">SAMPLE</span>' : ''}</h4>
    <small>${esc(r.id)} · Alert time ${fmt(r.time)}</small><div>HR ${esc(r.hr)} BPM · BP ${esc(r.bp)} · ${esc(r.temp)} °C · SpO₂ ${esc(r.spo2)}%</div><b>Immediate medical attention required</b></div>`).join('')
    : '<div class="card"><p class="empty">No active emergency alerts.</p></div>';
  $('#alertTbl').innerHTML = table(al);
  renderHistory();
}
function table(rows) {
  if (!rows.length) return '<p class="empty">No records.</p>';
  return `<table><thead><tr><th>Date and time</th><th>Patient</th><th>Age</th><th>HR</th><th>BP</th><th>Temp °C</th><th>SpO₂</th><th>Status</th></tr></thead><tbody>` +
    rows.map(r => `<tr class="${esc(r.status)}"><td>${fmt(r.time)}</td><td><b>${esc(r.name)}</b>${r.demo ? '<span class="tag">SAMPLE</span>' : ''}<br><small>${esc(r.id)}</small></td><td>${esc(r.age ?? '')}</td><td>${esc(r.hr)}</td><td>${esc(r.bp)}</td><td>${esc(r.temp)}</td><td>${esc(r.spo2)}%</td><td>${pill(r.status)}</td></tr>`).join('') + '</tbody></table>';
}
function renderHistory() {
  const q = $('#q').value.toLowerCase(), s = $('#fs').value;
  $('#histTbl').innerHTML = table(state.records.filter(r => (!s || r.status === s) && (`${r.id} ${r.name}`.toLowerCase().includes(q))));
}
$('#q').oninput = renderHistory; $('#fs').onchange = renderHistory;

/* ---------- monitoring ---------- */
function drawPipe(mode) {  // mode: 'idle' | 'done' | 'input' | 'fail'
  $('#pipe').innerHTML = STAGES.map(([t, c], i) => {
    const cls = mode === 'done' || (mode === 'input' && i === 0) ? 'done' : (mode === 'fail' && i === 0 ? 'done' : (mode === 'fail' && i === 1 ? 'fail' : ''));
    return `<li class="${cls}"><b>${t}</b><code>${c}</code></li>`;
  }).join('');
}
drawPipe('idle');

$('#monForm').addEventListener('submit', async e => {
  e.preventDefault();
  const f = Object.fromEntries(new FormData(e.target)), btn = $('#monBtn'), box = $('#result');
  const rec = { id: f.id.trim(), name: f.name.trim(), age: +f.age, hr: +f.hr, bp: f.bp.trim(), temp: +f.temp, spo2: +f.spo2 };
  const reads = `<div class="reads"><div><small>Heart rate</small><b>${esc(rec.hr)} BPM</b></div><div><small>Blood pressure</small><b>${esc(rec.bp)}</b></div><div><small>Temperature</small><b>${esc(rec.temp)} °C</b></div><div><small>SpO₂</small><b>${esc(rec.spo2)}%</b></div></div>`;
  const head = `<p><b>${esc(rec.name)}</b> · ${esc(rec.id)} · ${esc(rec.age)} yrs</p>`;
  if (!state.live) {
    box.innerHTML = `<h3>Monitoring result</h3><div class="res PENDING"><h4>Status unavailable</h4><p>The C backend is not connected, so no status was produced. Readings were not saved.</p></div>${head}${reads}`;
    drawPipe('input'); return;
  }
  btn.disabled = true; btn.textContent = 'Monitoring…';
  try {
    const r = await api('/monitor', { method: 'POST', body: JSON.stringify(rec) }, 10000);
    const j = await r.json();
    if (!r.ok || !['NORMAL', 'WARNING', 'EMERGENCY'].includes(j.status)) throw new Error(j.error || 'Unexpected backend response');
    const msg = { NORMAL: 'Patient condition is within configured limits.', WARNING: 'Patient readings require attention.', EMERGENCY: 'Immediate medical attention is required.' }[j.status];
    box.innerHTML = `<h3>Monitoring result</h3><div class="res ${j.status}"><h4>${j.status}</h4><p>${msg}</p>${j.detail ? `<small>Backend: ${esc(j.detail)}</small>` : ''}</div>${head}${reads}`;
    drawPipe('done'); await loadRecords();
  } catch (err) {
    box.innerHTML = `<h3>Monitoring result</h3><div class="res PENDING"><h4>Backend error</h4><p>${esc(err.message)}. Check that the monitoring process is running and the FIFO exists.</p></div>`;
    drawPipe('fail');
  } finally { btn.disabled = false; btn.textContent = 'Monitor patient'; }
});

/* ---------- init ---------- */
$('#loginHint').textContent = 'Checking backend…';
detectBackend().then(() => {
  $('#loginHint').textContent = state.live ? 'Backend detected. Sign in with your staff account.'
    : `Backend not detected: demo mode. Demo sign-in: ${CONFIG.DEMO_USER} / ${CONFIG.DEMO_PASS}`;
});
