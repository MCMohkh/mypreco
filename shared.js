
const API = 'https://script.google.com/macros/s/AKfycbyyxrxbHCw-kHcgkMjLbMLDlMgAc5qbR7RKBf9VMolOk8AdKsEeUH7ihxDIvwvagM8O/exec';
const FORMATS = ['1-on-1', 'Group'], LOCS = ['Gym/Studio', 'Home/Park', 'Online'];
let CFG = { launch_areas: 'Banjara Hills,Jubilee Hills,Shaikpet,Manikonda,Kokapet', monthly_sessions: 22, package_days: 30, carry_forward_days: 15, cancel_hours: 72, cancel_fee_pct: 20, upi_id: '', support_phone: '', waiver_version: 'v1-draft' };
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inr = n => n ? '₹' + Number(n).toLocaleString('en-IN') : '—';
const wa = (p, t) => 'https://wa.me/91' + String(p).replace(/\D/g, '').slice(-10) + '?text=' + encodeURIComponent(t);
const csv = s => String(s || '').split(',').map(x => x.trim()).filter(Boolean);
const val = id => $('#' + id).value.trim();
const picks = n => [...document.querySelectorAll(`input[name="${n}"]:checked`)].map(i => i.value);
const checks = (n, opts) => `<div class="chk">${opts.map(o => `<label><input type="checkbox" name="${n}" value="${esc(o)}">${esc(o)}</label>`).join('')}</div>`;
const dt = s => s ? new Date(s).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
const d0 = s => s ? new Date(s).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—';
const planName = b => b.type === 'single' ? 'Single session' : 'Monthly';
const policy = () => `Cancel at least ${CFG.cancel_hours} hours before your first session and get a refund minus ${CFG.cancel_fee_pct}% (covers payment and admin costs). Later than that, no refund.`;
let toastT;
function toast(m) {
  const t = $('#toast'); t.textContent = m; t.style.display = 'block'; clearTimeout(toastT); toastT = setTimeout(() => t.style.display = 'none', 4000);
  const d = $('#dlg');  // an open dialog sits above the toast, so show the message inside it too
  if (d && d.open) { let e = d.querySelector('.err'); if (!e) { e = document.createElement('p'); e.className = 'err'; e.setAttribute('role', 'alert'); d.appendChild(e); } e.textContent = m; e.scrollIntoView({ block: 'nearest' }); }
}
async function api(action, d = {}) {
  if (API.startsWith('PASTE')) { toast('Set the API URL in index.html first'); throw new Error('no api'); }
  try {
    const r = await fetch(API, { method: 'POST', body: JSON.stringify({ action, ...d }) });
    const j = await r.json(); if (j.error) throw new Error(j.error); return j;
  } catch (e) { toast(e.message === 'Please accept the waiver' ? 'The backend is out of date. Paste the latest Code.gs into Apps Script and deploy a new version.' : e.message); throw e; }
}
const areas = () => csv(CFG.launch_areas);
async function loadCfg() { if (API.startsWith('PASTE')) return; try { CFG = { ...CFG, ...(await api('publicConfig')) }; } catch (e) {} }

const avatar = id => 'img/avatar-' + ([...String(id)].reduce((a, c) => a + c.charCodeAt(0), 0) % 5 + 1) + '.svg';

const COND = ['Heart disease or cardiovascular conditions', 'Diabetes', 'Asthma or respiratory conditions', 'Hypertension (high blood pressure)', 'Hypotension (low blood pressure)', 'Joint problems or orthopedic issues'];
function healthHtml(w) {
  if (!w || !w.signed_name) return '<p class="hl">No health declaration on file.</p>';
  const conds = (w.conditions || []).concat(w.other_conditions ? [w.other_conditions] : []);
  const flag = conds.length || w.meds || w.injuries;
  return `<details class="${flag ? 'flag' : 'hl'}"><summary>${flag ? '<b>Health flags – review before training</b>' : 'Health declaration (no flags)'}</summary>
    <p>${conds.length ? '<b>Conditions:</b> ' + esc(conds.join(', ')) + '<br>' : ''}${w.meds ? '<b>Medications:</b> ' + esc(w.meds) + '<br>' : ''}${w.injuries ? '<b>Injuries/surgeries:</b> ' + esc(w.injuries) + '<br>' : ''}
    Age: ${w.dob ? Math.floor((Date.now() - new Date(w.dob)) / 31557600000) : '—'} · Gender: ${esc(w.gender || '—')} · Fitness ${esc(w.fitness || '—')}/10 · Active ${esc(w.freq || '0')} days/week · Sleep: ${esc(w.sleep || '—')}<br>
    Experience: ${esc(w.experience || '—')}<br>Diet: ${esc(w.diet || '—')}<br><b>Emergency contact:</b> ${esc(w.emergency)}<br>Signed by ${esc(w.signed_name)} on ${d0(w.signed_at)}</p></details>`;
}
