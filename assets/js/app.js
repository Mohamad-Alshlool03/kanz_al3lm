window.selectTab = id => {
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  document.querySelector(.tab[data-panel='\'])?.classList.add('active');
  if(location.hash!==#\) history.replaceState(null,'',#\);
};
const toastEl = (()=>{const d=document.createElement('div');d.className='toast';document.body.appendChild(d);return d})();
function toast(m){toastEl.textContent=m;toastEl.classList.add('show');setTimeout(()=>toastEl.classList.remove('show'),2200)}
let _mb;
function ensureModal(){
  if(_mb) return _mb;
  const b=document.createElement('div');
  b.className='modal-backdrop';
  b.innerHTML=<div class="modal" role="dialog" aria-modal="true"><div class="modal-header"><div class="modal-title" id="modal-title">ملف</div><div class="modal-actions"><a id="btn-download" class="btn" download>تحميل</a><a id="btn-newtab" class="btn" target="_blank" rel="noopener">فتح تبويب</a><button id="btn-full" class="btn">ملء الشاشة</button><button id="btn-close" class="btn">إغلاق</button></div></div><div class="modal-body"><div class="viewer-frame"><iframe id="viewer" title="عارض PDF"></iframe></div></div></div>;
  document.body.appendChild(b);
  b.querySelector('#btn-close').onclick=()=>b.classList.remove('open');
  b.querySelector('#btn-full').onclick = ()=>{const box=b.querySelector('.modal'); if(document.fullscreenElement){document.exitFullscreen()} else {box.requestFullscreen?.();}};
  _mb=b; return b;
}
window.showPdf = (url,title='ملف PDF')=>{
  const b=ensureModal(); b.querySelector('#modal-title').textContent=title;
  b.querySelector('#viewer').src=url; b.querySelector('#btn-download').href=url; b.querySelector('#btn-newtab').href=url;
  b.classList.add('open');
};
const CODES={'financial-u2':'FIN-2025','digital-u2':'DIG-2025'};
window.unlock = key=>{
  const input=prompt('أدخل الكود لفتح الوحدة:'); if(!input) return;
  if(input.trim().toUpperCase()===(CODES[key]||'').toUpperCase()){
    localStorage.setItem('unlock:'+key,'1'); toast('تم الفتح! ✅');
    document.querySelectorAll(\[data-lock="\"] [data-locked-link]\).forEach(a=>{a.removeAttribute('data-locked-link');a.classList.add('primary')});
  }else toast('الكود غير صحيح ❌');
};
function initLocks(){
  document.querySelectorAll('[data-lock]').forEach(e=>{
    const key=e.getAttribute('data-lock'); const open=localStorage.getItem('unlock:'+key)==='1';
    e.querySelectorAll('[data-locked-link]').forEach(a=>{
      if(open){a.removeAttribute('data-locked-link');a.classList.add('primary')}
      else{a.addEventListener('click',ev=>{ev.preventDefault();toast('هذه الوحدة مغلقة — أدخل الكود لفتحها')})}
    });
  });
}
function reveal(){document.querySelectorAll('.fade-in,.lift').forEach(el=>{if(el.getBoundingClientRect().top < innerHeight-60) el.classList.add('in')})}
document.addEventListener('scroll',reveal,{passive:true});
document.addEventListener('DOMContentLoaded',()=>{initLocks();reveal()});

/* فلاتر صفحة المواد بأسلوب Gold */
window.initCourseFilters = ()=>{
  const selects=[...document.querySelectorAll('.filters .select')];
  selects.forEach(sel=>sel.addEventListener('change',()=>filterCards()));
  function filterCards(){
    const [stage,grade,subject,term]=selects.map(s=>s.value);
    document.querySelectorAll('.course-card').forEach(card=>{
      const ok = (!stage || card.dataset.stage===stage)
              && (!grade || card.dataset.grade===grade)
              && (!subject || card.dataset.subject===subject)
              && (!term || card.dataset.term===term);
      card.style.display = ok ? '' : 'none';
    });
  }
};
// Open dropdown on tap (mobile)
document.querySelectorAll('.nav .dropdown .dropbtn').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    const dd = btn.closest('.dropdown');
    // close others
    document.querySelectorAll('.nav .dropdown.open').forEach(d=>{ if(d!==dd) d.classList.remove('open'); });
    dd.classList.toggle('open');
    e.stopPropagation();
  });
});
document.addEventListener('click', ()=> {
  document.querySelectorAll('.nav .dropdown.open').forEach(d=>d.classList.remove('open'));
});
