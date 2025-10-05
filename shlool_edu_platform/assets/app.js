// تبويبات
window.selectTab = function(id){
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  document.querySelector(`.tab[data-panel="${id}"]`)?.classList.add('active');
  if(location.hash !== `#${id}`) history.replaceState(null,'',`#${id}`);
};

// Toast
const toastEl = (() => {
  const el = document.createElement('div');
  el.className = 'toast';
  document.body.appendChild(el);
  return el;
})();
function toast(msg){ toastEl.textContent = msg; toastEl.classList.add('show'); setTimeout(()=>toastEl.classList.remove('show'), 2200); }

// Modal
const modalBackdrop = (() => {
  const b = document.createElement('div'); b.className='modal-backdrop';
  b.innerHTML = `<div class="modal"><div class="modal-header"><strong>ملف</strong><button class="btn" onclick="closeModal()">إغلاق</button></div><div class="modal-body" id="modal-body"></div></div>`;
  document.body.appendChild(b);
  return b;
})();
window.openModal = function(html){ document.getElementById('modal-body').innerHTML = html; modalBackdrop.classList.add('open'); }
window.closeModal = function(){ modalBackdrop.classList.remove('open'); }
window.showPdf = function(url){
  openModal(`<div style="position:relative;padding-top:70vh"><iframe src="${url}" style="position:absolute;inset:0;width:100%;height:100%;border:0" title="ملف PDF"></iframe></div>`);
};

// أكواد الفتح
const CODES = { 'financial-u2':'FIN-2025', 'digital-u2':'DIG-2025' };
window.unlock = function(key){
  const input = prompt('أدخل الكود لفتح الوحدة:'); if(!input) return;
  if(input.trim().toUpperCase() === (CODES[key]||'').toUpperCase()){
    localStorage.setItem(`unlock:${key}`,'1'); toast('تم الفتح! ✅');
    document.querySelectorAll(`[data-lock="${key}"] [data-locked-link]`).forEach(a=>{
      a.removeAttribute('data-locked-link'); a.removeAttribute('aria-disabled'); a.classList.add('primary');
    });
  }else{ toast('الكود غير صحيح ❌'); }
};
function initLocks(){
  document.querySelectorAll('[data-lock]').forEach(row=>{
    const key=row.getAttribute('data-lock');
    const opened=localStorage.getItem(`unlock:${key}`)==='1';
    row.querySelectorAll('[data-locked-link]').forEach(a=>{
      if(opened){ a.removeAttribute('data-locked-link'); a.classList.add('primary'); }
      else{ a.setAttribute('aria-disabled','true'); a.addEventListener('click',e=>{e.preventDefault(); toast('هذه الوحدة مغلقة — أدخل الكود لفتحها');}); }
    });
  });
}
document.addEventListener('DOMContentLoaded', initLocks);
