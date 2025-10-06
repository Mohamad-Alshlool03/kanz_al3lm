/* Kanz Al3lm — Core frontend helpers (tabs + modal PDF + unlock + filters + dropdown) */
(() => {
  'use strict';

  /* =========================
     Tabs (لو عندك تبويبات)
  ==========================*/
  window.selectTab = (id) => {
    // أخفِ كل اللوحات
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    // ألغِ تفعيل كل الألسنة
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

    // فعّل اللوحة المطلوبة
    const panel = document.getElementById(id);
    if (panel) panel.classList.add('active');

    // فعّل التبويب الموافق لها
    const tab = document.querySelector(`.tab[data-panel="${id}"]`);
    if (tab) tab.classList.add('active');

    // حدّث العنوان (hash) بدون تمرير الصفحة
    const hash = `#${id}`;
    if (location.hash !== hash) history.replaceState(null, '', hash);
  };

  /* =========================
     Toast (رسالة خفيفة)
  ==========================*/
  const toastEl = (() => {
    const d = document.createElement('div');
    d.className = 'toast';
    document.body.appendChild(d);
    return d;
  })();

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  /* =========================
     Modal PDF Viewer
  ==========================*/
  let _modalBackdrop;

  function ensureModal() {
    if (_modalBackdrop) return _modalBackdrop;

    const b = document.createElement('div');
    b.className = 'modal-backdrop';
    b.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-header">
          <div class="modal-title" id="modal-title">ملف</div>
          <div class="modal-actions">
            <a id="btn-download" class="btn" download>تحميل</a>
            <a id="btn-newtab" class="btn" target="_blank" rel="noopener">فتح تبويب</a>
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

    const close = () => b.classList.remove('open');

    b.addEventListener('click', (e) => {
      if (e.target === b) close(); // الضغط على الخلفية
    });
    b.querySelector('#btn-close').addEventListener('click', close);
    b.querySelector('#btn-full').addEventListener('click', () => {
      const box = b.querySelector('.modal');
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        box.requestFullscreen?.();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && b.classList.contains('open')) close();
    });

    _modalBackdrop = b;
    return b;
  }

  // استدعِ showPdf من صفحاتك: showPdf('assets/slides/..pdf','عنوان')
  window.showPdf = (url, title = 'ملف PDF') => {
    try {
      const b = ensureModal();
      b.querySelector('#modal-title').textContent = title;
      b.querySelector('#viewer').src = url;
      b.querySelector('#btn-download').href = url;
      b.querySelector('#btn-newtab').href = url;
      b.classList.add('open');
    } catch (e) {
      // في حال منع التضمين، افتح تبويب جديد
      window.open(url, '_blank', 'noopener');
    }
  };

  /* =========================
     Unlock units (بالكود)
  ==========================*/
  // عدّل القيم كما تريد
  const CODES = {
    'financial-u2': 'KARAM-2025',
    'digital-u2'  : 'ADAM-2025'
  };

  // طبّق فتح الوحدة على العناصر في الصفحة
  function applyUnlock(key) {
    // إزالة قفل الروابط وتبديل الشارة
    document.querySelectorAll(`[data-lock="${key}"] [data-locked-link]`).forEach(a => {
      a.removeAttribute('data-locked-link');
      a.classList.add('primary');
    });
    const unit = document.querySelector(`[data-lock="${key}"]`);
    if (unit) {
      const badge = unit.querySelector('.badge.locked');
      if (badge) { badge.textContent = 'مفتوحة'; badge.classList.remove('locked'); }
    }
  }

  window.unlock = (key) => {
    const expected = (CODES[key] || '').trim().toUpperCase();
    if (!expected) {
      alert('لم يتم إعداد كود لهذه الوحدة بعد.');
      return;
    }
    const input = prompt('أدخل الكود لفتح الوحدة:');
    if (!input) return;
    if (input.trim().toUpperCase() === expected) {
      try { localStorage.setItem('unlock:' + key, '1'); } catch (e) {}
      applyUnlock(key);
      toast('تم الفتح! ✅');
    } else {
      toast('الكود غير صحيح ❌');
    }
  };

  function initLocks() {
    document.querySelectorAll('[data-lock]').forEach(e => {
      const key = e.getAttribute('data-lock');
      const open = (localStorage.getItem('unlock:' + key) === '1');
      e.querySelectorAll('[data-locked-link]').forEach(a => {
        if (open) {
          a.removeAttribute('data-locked-link');
          a.classList.add('primary');
        } else {
          a.addEventListener('click', ev => {
            ev.preventDefault();
            toast('هذه الوحدة مغلقة — أدخل الكود لفتحها');
          });
        }
      });
      if (open) applyUnlock(key);
    });
  }

  /* =========================
     Reveal on scroll (أنيميشن)
  ==========================*/
  function reveal() {
    document.querySelectorAll('.fade-in, .lift').forEach(el => {
      if (el.getBoundingClientRect().top < innerHeight - 60) el.classList.add('in');
    });
  }
  document.addEventListener('scroll', reveal, { passive: true });

  /* =========================
     Course filters (Gold-like)
  ==========================*/
  window.initCourseFilters = () => {
    const selects = Array.from(document.querySelectorAll('.filters select'));
    if (!selects.length) return;
    const filterCards = () => {
      const [stage, grade, subject, term] = selects.map(s => s.value);
      document.querySelectorAll('.course-card').forEach(card => {
        const ok = (!stage   || card.dataset.stage   === stage)
                && (!grade   || card.dataset.grade   === grade)
                && (!subject || card.dataset.subject === subject)
                && (!term    || card.dataset.term    === term);
        card.style.display = ok ? '' : 'none';
      });
    };
    selects.forEach(sel => sel.addEventListener('change', filterCards));
    filterCards();
  };

  /* =========================
     Dropdown (mobile tap)
  ==========================*/
  document.querySelectorAll('.nav .dropdown .dropbtn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const dd = btn.closest('.dropdown');
      // أغلق غيره
      document.querySelectorAll('.nav .dropdown.open').forEach(d => { if (d !== dd) d.classList.remove('open'); });
      dd.classList.toggle('open');
      e.stopPropagation();
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.nav .dropdown.open').forEach(d => d.classList.remove('open'));
  });

  /* =========================
     Init on DOM ready
  ==========================*/
  document.addEventListener('DOMContentLoaded', () => {
    initLocks();
    reveal();

    // لو الصفحة مفتوحة على تبويب بعينه بالهاش
    if (location.hash && location.hash.length > 1) {
      const id = location.hash.slice(1);
      if (document.getElementById(id)) selectTab(id);
    }
  });

})();
