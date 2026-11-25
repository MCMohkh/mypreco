
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
function toast(m) { const t = $('#toast'); t.textContent = m; t.style.display = 'block'; clearTimeout(toastT); toastT = setTimeout(() => t.style.display = 'none', 4000); }
async function api(action, d = {}) {
  if (API.startsWith('PASTE')) { toast('Set the API URL in index.html first'); throw new Error('no api'); }
  try {
    const r = await fetch(API, { method: 'POST', body: JSON.stringify({ action, ...d }) });
    const j = await r.json(); if (j.error) throw new Error(j.error); return j;
  } catch (e) { toast(e.message); throw e; }
}
const areas = () => csv(CFG.launch_areas);
async function loadCfg() { if (API.startsWith('PASTE')) return; try { CFG = { ...CFG, ...(await api('publicConfig')) }; } catch (e) {} }

const avatar = id => 'img/avatar-' + ([...String(id)].reduce((a, c) => a + c.charCodeAt(0), 0) % 5 + 1) + '.svg';
