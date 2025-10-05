/* ===== تبويبات ===== */
window.selectTab = function(id){
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  document.querySelector(`.tab[data-panel="${id}"]`)?.classList.add('active');
  if(location.hash !== `#${id}`) history.replaceState(null,'',`#${id}`);
};

/* ===== Toast ===== */
const toastEl = (() => {
  const el = document.createElement('div');
  el.className = 'toast';
  document.body.appendChild(el);
  return el;
})();
function toast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(()=>toastEl.classList.remove('show'), 2200);
}

/* ===== Modal / PDF Viewer (محسّن) ===== */
let _modalBackdrop;
function ensureModal(){
  if(_modalBackdrop) return _modalBackdrop;
  const b = document.createElement('div');
  b.className='modal-backdrop';
  b.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="عارض الملفات">
      <div class="modal-header">
        <div class="modal-title" id="modal-title">ملف</div>
        <div class="modal-actions">
          <a id="btn-download" class="btn" download>تحميل</a>
          <a id="btn-newtab" class="btn" target="_blank" rel="noopener">فتح في تبويب</a>
          <button id="btn-full" class="btn">ملء الشاشة</button>
          <button id="btn-close" class="btn">إغلاق</button>
        </div>
      </div>
      <div class="modal-body">
        <div class="viewer-frame">
          <iframe id="viewer" title="عارض PDF"></iframe>
        </div>
      </div>
    </div>`;
  document.body.appendChild(b);

  // أزرار التحكم
  b.querySelector('#btn-close').onclick = ()=> b.classList.remove('open');
  b.querySelector('#btn-full').onclick = ()=>{
    const box = b.querySelector('.modal');
    if (document.fullscreenElement) { document.exitFullscreen(); }
    else { box.requestFullscreen?.(); }
  };

  _modalBackdrop = b;
  return b;
}

/**
 * عرض PDF داخل مودال أنيق.
 * @param {string} url - رابط ملف الـ PDF (محلي assets/... أو Google Drive preview).
 * @param {string} [title="ملف PDF"] - عنوان اختياري يظهر في شريط العنوان.
 */
window.showPdf = function(url, title='ملف PDF'){
  const b = ensureModal();
  const titleEl   = b.querySelector('#modal-title');
  const iframe    = b.querySelector('#viewer');
  const btnDown   = b.querySelector('#btn-download');
  const btnTab    = b.querySelector('#btn-newtab');

  titleEl.textContent = title;

  // لو كان رابط Google Drive preview اتركو كما هو، غير هيك المتصفح يعرض PDF داخليًا
  iframe.src = url;

  // أزرار تحميل وفتح
  btnDown.href = url;
  btnTab.href  = url;

  b.classList.add('open');
};

/* ===== أكواد فتح الوحدات ===== */
const CODES = { 'financial-u2':'FIN-2025', 'digital-u2':'DIG-2025' };

window.unlock = function(key){
  const input = prompt('أدخل الكود لفتح الوحدة:'); if(!input) return;
  if(input.trim().toUpperCase() === (CODES[key]||'').toUpperCase()){
    localStorage.setItem(`unlock:${key}`,'1');
    toast('تم الفتح! ✅');
    document.querySelectorAll(`[data-lock="${key}"] [data-locked-link]`).forEach(a=>{
      a.removeAttribute('data-locked-link');
      a.removeAttribute('aria-disabled');
      a.classList.add('primary');
    });
  }else{
    toast('الكود غير صحيح ❌');
  }
};

function initLocks(){
  document.querySelectorAll('[data-lock]').forEach(row=>{
    const key=row.getAttribute('data-lock');
    const opened=localStorage.getItem(`unlock:${key}`)==='1';
    row.querySelectorAll('[data-locked-link]').forEach(a=>{
      if(opened){
        a.removeAttribute('data-locked-link');
        a.classList.add('primary');
      }else{
        a.setAttribute('aria-disabled','true');
        a.addEventListener('click',e=>{
          e.preventDefault();
          toast('هذه الوحدة مغلقة — أدخل الكود لفتحها');
        });
      }
    });
  });
}
document.addEventListener('DOMContentLoaded', initLocks);
