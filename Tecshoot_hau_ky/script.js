/* ============================================================
   TECSHOOT — script.js
   Flow khách hàng 2 giai đoạn:
     Stage 1 — Chọn ảnh  (photo grid + lightbox + notes)
     Stage 2 — Duyệt & Nhận (approve + revision + download)
   ============================================================ */

'use strict';

/* ────────────────────────────────────────────
   DATA — ảnh demo (emoji placeholder)
──────────────────────────────────────────── */
const EMOJIS = [
  '📸','🌿','💫','🎞','✨','🌅','🦋','🌸',
  '🏔','🌊','🎨','🌙','🍃','⭐','🌺','🎭',
  '🌻','🦚','🌾','🍂','🌴','🌈','🦜','🌸',
];

const BGS = [
  'linear-gradient(145deg,#f5e8dc,#ecd4bc)',
  'linear-gradient(145deg,#dce8f5,#bcd0ec)',
  'linear-gradient(145deg,#f5eedc,#ecd8a8)',
  'linear-gradient(145deg,#ddf5e8,#bcecd0)',
  'linear-gradient(145deg,#f5dcea,#ecbcd4)',
  'linear-gradient(145deg,#e8dcf5,#d0bced)',
  'linear-gradient(145deg,#f5f0dc,#ece0a8)',
  'linear-gradient(145deg,#dcf5f0,#bcecea)',
];

/* Danh sách từ khoá "ghi chú chung chung" bị từ chối */
const VAGUE = [
  'đẹp hơn','đẹp lên','chỉnh đẹp','làm đẹp',
  'tốt hơn','ngon hơn','ok hơn','nét hơn',
  'đẹp','tổng thể','chỉnh ảnh',
];

const MAX_SELECT      = 15;   // số ảnh tối đa khách được chọn
let   TOTAL_REVISIONS = 2;    // số lần chỉnh sửa còn lại

/* Tạo mảng ảnh */
const photos = EMOJIS.map((e, i) => ({
  id      : `DSC_${String(i + 1).padStart(4, '0')}.jpg`,
  emoji   : e,
  bg      : BGS[i % BGS.length],
  selected: false,
  notes   : [],
}));

/* ────────────────────────────────────────────
   TRẠNG THÁI ứng dụng
──────────────────────────────────────────── */
let lbIdx         = 0;          // ảnh đang mở trong lightbox
let approvedSet   = new Set();  // chỉ số ảnh đã duyệt (stage 2)
let currentFilter = 'all';      // filter đang áp dụng (stage 1)
let largeGrid     = false;      // chế độ lưới lớn / nhỏ

/* ────────────────────────────────────────────
   KHỞI TẠO
──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderGrid('all');
  updateCounters();

  /* Đóng modal khi click ra ngoài */
  document.getElementById('rev-modal').addEventListener('click', function (e) {
    if (e.target === this) closeRevisionModal();
  });
  document.getElementById('dl-modal').addEventListener('click', function (e) {
    if (e.target === this) closeDLModal();
  });

  /* Phím tắt cho lightbox */
  document.addEventListener('keydown', e => {
    const lb = document.getElementById('lightbox');
    if (!lb.classList.contains('open')) return;
    if (e.key === 'ArrowRight') navLB(1);
    if (e.key === 'ArrowLeft')  navLB(-1);
    if (e.key === 'Escape')     closeLB();
    if (e.key === ' ')          { e.preventDefault(); toggleLBSelect(); }
  });
});

/* ════════════════════════════════════════════
   ĐIỀU HƯỚNG GIAI ĐOẠN
════════════════════════════════════════════ */
function goStage(stage) {
  /* Ẩn tất cả panel, bỏ active tất cả tab */
  document.querySelectorAll('.stage-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.stage-tab').forEach(t => t.classList.remove('active'));

  /* Hiện panel & kích hoạt tab tương ứng */
  document.getElementById('stage-' + stage).classList.add('active');
  document.getElementById('tab-'   + stage).classList.add('active');

  if (stage === 'select') {
    renderGrid();
    /* Nếu quay lại stage 1: đặt lại tab 2 về trạng thái chưa xong */
    document.getElementById('tabnum-approve').textContent = '2';
    document.getElementById('tab-approve').classList.remove('done');
  }

  if (stage === 'approve') {
    /* Đánh dấu stage 1 đã hoàn thành */
    document.getElementById('tab-select').classList.add('done');
    document.getElementById('tab-select').classList.remove('active');
    document.getElementById('tabnum-select').textContent = '✓';
    renderApproveGrid();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/* ════════════════════════════════════════════
   STAGE 1 — PHOTO GRID
════════════════════════════════════════════ */

/** Render lưới ảnh theo filter hiện tại */
function renderGrid(filter) {
  if (filter !== undefined) currentFilter = filter;

  const grid = document.getElementById('photo-grid');
  grid.innerHTML = '';
  grid.className  = 'photo-grid' + (largeGrid ? ' grid-large' : '');

  let list = photos;
  if (currentFilter === 'selected') list = photos.filter(p => p.selected);
  if (currentFilter === 'noted')    list = photos.filter(p => p.notes.length > 0);

  list.forEach(p => {
    const realIdx = photos.indexOf(p);
    const card    = document.createElement('div');

    card.className =
      'photo-card' +
      (p.selected        ? ' selected'  : '') +
      (p.notes.length > 0 ? ' has-note' : '');

    card.innerHTML = `
      <div class="pc-img" style="background:${p.bg}">
        <span style="font-size:${largeGrid ? '72px' : '52px'};position:relative;z-index:1">${p.emoji}</span>
        <div class="pc-wm">TECSHOOT · PREVIEW ONLY</div>
        <div class="pc-check">${p.selected ? '✓' : ''}</div>
        <div class="pc-hover-overlay">
          <button class="pc-quick-note" onclick="openLB(event,${realIdx})">📝 Ghi chú</button>
        </div>
      </div>
      <div class="pc-foot">
        <span class="pc-id">${p.id}</span>
        <span class="pc-note-indicator">${p.notes.length} ghi chú</span>
      </div>`;

    /* Click checkbox → toggle chọn; click vùng khác → mở lightbox */
    card.querySelector('.pc-check').addEventListener('click', e => {
      e.stopPropagation();
      toggleSelect(realIdx);
    });
    card.addEventListener('click', () => openLB(null, realIdx));

    grid.appendChild(card);
  });

  updateCounters();
}

/** Lọc ảnh theo loại */
function filterGrid(type, btn) {
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('on'));
  btn.classList.add('on');
  renderGrid(type);
}

/** Chuyển đổi lưới nhỏ / lớn */
function toggleGridSize() {
  largeGrid = !largeGrid;
  const btn = document.getElementById('grid-toggle-btn');
  btn.textContent = largeGrid ? '🔳 Lưới lớn' : '🔲 Lưới nhỏ';
  renderGrid();
}

/** Chọn / bỏ chọn ảnh */
function toggleSelect(idx) {
  const p   = photos[idx];
  const sel = photos.filter(x => x.selected).length;

  if (!p.selected && sel >= MAX_SELECT) {
    toast(`⚠ Đã đủ ${MAX_SELECT} ảnh!`, 'Bỏ chọn ảnh khác nếu muốn thêm.', 'warn');
    return;
  }
  p.selected = !p.selected;
  renderGrid();
  updateLBSelectBtn();  // cập nhật nút trong lightbox nếu đang mở
}

/** Cập nhật tất cả bộ đếm trên UI */
function updateCounters() {
  const sel   = photos.filter(p => p.selected).length;
  const noted = photos.filter(p => p.notes.length > 0).length;

  /* Stat strip trên thanh tab */
  document.getElementById('stat-selected').textContent = sel;

  /* Pill bên phải toolbar */
  document.getElementById('footer-count').textContent  = sel;

  /* Footer bar */
  document.getElementById('footer-b').textContent = sel;

  /* Chip badges */
  document.getElementById('chip-all').textContent      = photos.length;
  document.getElementById('chip-selected').textContent = sel;
  document.getElementById('chip-noted').textContent    = noted;

  /* Hiện / ẩn footer bar sticky */
  const footer    = document.getElementById('s1-footer');
  const submitBtn = document.getElementById('btn-submit-sel');
  footer.classList.toggle('visible', sel > 0);
  submitBtn.disabled = sel === 0;
}

/** Gửi danh sách chọn → chuyển sang stage 2 */
function submitSelection() {
  const sel = photos.filter(p => p.selected).length;
  if (sel === 0) {
    toast('⚠ Chưa chọn ảnh!', 'Vui lòng chọn ít nhất 1 ảnh.', 'warn');
    return;
  }
  toast(`✅ Đã gửi ${sel} ảnh!`, 'Thợ đã nhận danh sách và bắt đầu retouch.', 'success');
  setTimeout(() => goStage('approve'), 900);
}

/* ════════════════════════════════════════════
   LIGHTBOX
════════════════════════════════════════════ */
function openLB(e, idx) {
  if (e) e.stopPropagation();
  lbIdx = idx;
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderLB();
}

function closeLB() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

/** Điều hướng trái / phải */
function navLB(dir) {
  lbIdx = (lbIdx + dir + photos.length) % photos.length;
  renderLB();
}

/** Render toàn bộ nội dung lightbox */
function renderLB() {
  const p    = photos[lbIdx];
  const disp = document.getElementById('lb-display');

  /* Hiển thị ảnh (emoji placeholder) */
  disp.style.background = p.bg;
  disp.innerHTML = `<span style="font-size:130px;position:relative;z-index:1">${p.emoji}</span>`;

  /* Metadata */
  document.getElementById('lb-num').textContent = String(lbIdx + 1).padStart(2, '0');
  document.getElementById('lb-tot').textContent = `/ ${photos.length}`;
  document.getElementById('lb-id').textContent  = p.id;

  renderLBNotes();
  updateLBSelectBtn();
  resetChips();
}

/** Render danh sách ghi chú trong panel lightbox */
function renderLBNotes() {
  const p    = photos[lbIdx];
  const list = document.getElementById('lb-note-list');

  if (p.notes.length === 0) {
    list.innerHTML = '<p class="note-no-content">Chưa có ghi chú. Thêm ghi chú bên dưới.</p>';
    return;
  }

  list.innerHTML = p.notes.map((n, i) => `
    <div class="note-item">
      <span class="note-bullet">›</span>
      <span class="note-text">${n}</span>
      <button class="note-del" onclick="delNote(${i})">✕</button>
    </div>`).join('');
}

/** Xoá 1 ghi chú */
function delNote(ni) {
  photos[lbIdx].notes.splice(ni, 1);
  renderLBNotes();
  renderGrid();
  updateCounters();
}

/** Cập nhật nút "Chọn / Đã chọn" trong lightbox */
function updateLBSelectBtn() {
  const p   = photos[lbIdx];
  const btn = document.getElementById('lb-sel-btn');
  if (!btn || !p) return;

  if (p.selected) {
    btn.textContent = '✓ Đã chọn (bỏ chọn)';
    btn.classList.add('selected-state');
  } else {
    btn.textContent = '✓ Chọn ảnh này';
    btn.classList.remove('selected-state');
  }
}

/** Toggle chọn từ nút trong lightbox */
function toggleLBSelect() {
  toggleSelect(lbIdx);
  updateLBSelectBtn();
}

/* ── Quick-pick chips ── */
function addChip(btn, text) {
  btn.classList.toggle('on');
  if (btn.classList.contains('on')) pushNote(text);
}

/** Reset các chip và textarea về trạng thái ban đầu */
function resetChips() {
  document.querySelectorAll('.qchip.on').forEach(c => c.classList.remove('on'));
  const ta = document.getElementById('note-ta');
  ta.value = '';
  ta.classList.remove('err');
  document.getElementById('note-chars').textContent = '0/200';
  document.getElementById('note-warn').classList.remove('show');
  document.getElementById('btn-add-note').disabled = true;
}

/* ── Textarea validation ── */
function validateNote(ta) {
  const v       = ta.value;
  const isVague = VAGUE.some(w => v.toLowerCase().includes(w));
  const tooShort = v.trim().length < 5;

  document.getElementById('note-chars').textContent = `${v.length}/200`;
  ta.classList.toggle('err', isVague && v.length > 0);
  document.getElementById('note-warn').classList.toggle('show', isVague && v.length > 0);
  document.getElementById('btn-add-note').disabled = isVague || tooShort;
}

/** Thêm ghi chú từ textarea */
function addNote() {
  const ta = document.getElementById('note-ta');
  const v  = ta.value.trim();
  if (!v || v.length < 5) return;

  if (VAGUE.some(w => v.toLowerCase().includes(w))) {
    toast('⚠ Bị từ chối!', 'Ghi chú quá chung. Hãy mô tả cụ thể hơn.', 'warn');
    return;
  }
  pushNote(v);
  ta.value = '';
  document.getElementById('note-chars').textContent = '0/200';
  document.getElementById('btn-add-note').disabled = true;
}

/** Đẩy ghi chú vào ảnh hiện tại */
function pushNote(txt) {
  const p = photos[lbIdx];

  /* Tự động chọn ảnh nếu chưa chọn */
  if (!p.selected) toggleSelect(lbIdx);

  p.notes.push(txt);
  renderLBNotes();
  renderGrid();
  updateCounters();
  toast('📌 Ghi chú đã lưu!', `"${txt}"`, 'success');
}

/* ════════════════════════════════════════════
   STAGE 2 — DUYỆT & NHẬN
════════════════════════════════════════════ */

/** Render lưới ảnh cần duyệt */
function renderApproveGrid() {
  const grid = document.getElementById('approve-grid');
  grid.innerHTML = '';
  approvedSet.clear();
  updateApproveProgress();

  /* Dùng ảnh đã chọn; fallback 6 ảnh demo nếu chưa chọn */
  let list = photos.filter(p => p.selected);
  if (list.length === 0) list = photos.slice(0, 6);

  list.forEach((p, i) => {
    const card         = document.createElement('div');
    card.className     = 'approve-card';
    card.id            = `ac-${i}`;

    const noteTagsHTML = p.notes
      .map(n => `<span class="ac-note-tag">${n}</span>`)
      .join('');

    card.innerHTML = `
      <div class="ac-img" style="background:${p.bg}">
        <span style="font-size:62px;position:relative;z-index:1">${p.emoji}</span>
        <div class="ac-wm" id="ac-wm-${i}">TECSHOOT · PREVIEW ONLY</div>
        <div class="ac-approved-overlay">✓</div>
      </div>
      ${noteTagsHTML ? `<div class="ac-notes-preview">${noteTagsHTML}</div>` : ''}
      <div class="ac-foot">
        <div class="ac-id">${p.id}</div>
        <div class="ac-btns">
          <button class="btn-ac-approve" id="ac-app-${i}" onclick="approveOne(${i})">✓ Duyệt</button>
          <button class="btn-ac-reject"  id="ac-rej-${i}" onclick="openRevisionModal()">↩ Sửa</button>
        </div>
      </div>`;

    grid.appendChild(card);
  });

  updateApproveProgress();
}

/** Duyệt 1 ảnh → gỡ watermark */
function approveOne(i) {
  const card   = document.getElementById(`ac-${i}`);
  const appBtn = document.getElementById(`ac-app-${i}`);
  const rejBtn = document.getElementById(`ac-rej-${i}`);
  const wm     = document.getElementById(`ac-wm-${i}`);

  card.classList.add('ac-approved');
  if (wm)     wm.style.opacity = '0';
  if (appBtn) { appBtn.classList.add('done-state'); appBtn.textContent = '✓ Đã duyệt'; appBtn.disabled = true; }
  if (rejBtn) rejBtn.disabled = true;

  approvedSet.add(i);
  updateApproveProgress();
  updateApprovedCount();
  toast('✓ Đã duyệt ảnh!', 'Watermark đã gỡ — sẵn sàng tải về khi duyệt hết.', 'success');

  /* Kiểm tra xem đã duyệt hết chưa */
  const total = document.querySelectorAll('.approve-card').length;
  if (approvedSet.size >= total) {
    document.getElementById('btn-dl').classList.add('visible');
    toast('🎉 Đã duyệt toàn bộ!', 'Nhấn "Tải về tất cả" để nhận ảnh gốc.', 'success');
  }
}

/** Duyệt tất cả cùng lúc */
function approveAll() {
  document.querySelectorAll('.approve-card').forEach((_, i) => approveOne(i));
}

/** Cập nhật thanh tiến độ duyệt */
function updateApproveProgress() {
  const total = document.querySelectorAll('.approve-card').length
    || photos.filter(p => p.selected).length
    || 6;
  const done  = approvedSet.size;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  document.getElementById('apb-fill').style.width  = pct + '%';
  document.getElementById('apb-count').textContent  = `${done} / ${total} ảnh`;
}

/** Cập nhật số ảnh đã duyệt trong action bar */
function updateApprovedCount() {
  document.getElementById('approved-count').textContent = approvedSet.size;
}

/* ── Revision Modal ── */
function openRevisionModal() {
  if (TOTAL_REVISIONS <= 0) {
    toast('⚠ Hết lượt!', 'Gói dịch vụ đã dùng hết lượt chỉnh sửa.', 'error');
    return;
  }
  document.getElementById('rev-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeRevisionModal() {
  document.getElementById('rev-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function confirmRevision() {
  const notes = document.getElementById('rev-notes').value.trim();
  if (!notes) {
    toast('⚠ Chưa nhập ghi chú!', 'Vui lòng mô tả chi tiết yêu cầu.', 'warn');
    return;
  }

  TOTAL_REVISIONS--;
  document.getElementById('revisions-left').textContent  = TOTAL_REVISIONS;
  document.getElementById('stat-revisions').textContent  = TOTAL_REVISIONS;

  if (TOTAL_REVISIONS <= 0) {
    document.getElementById('btn-rev').disabled = true;
    document.getElementById('revision-badge').classList.add('warning');
  }

  closeRevisionModal();
  document.getElementById('rev-notes').value = '';
  toast(`↩ Đã gửi yêu cầu!`, `Còn ${TOTAL_REVISIONS} lượt chỉnh lại.`, 'info');
}

/* ── Download Modal ── */
function openDownloadModal() {
  document.getElementById('dl-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDLModal() {
  document.getElementById('dl-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function doDownload() {
  toast('⬇ Bắt đầu tải!', 'File ZIP đang được tạo — ảnh không watermark.', 'success');
  closeDLModal();
}

/* ════════════════════════════════════════════
   TOAST NOTIFICATIONS
════════════════════════════════════════════ */
function toast(title, body, type = 'info') {
  const stack = document.getElementById('toast-stack');
  const el    = document.createElement('div');
  const icons = { success: '✅', warn: '⚠️', error: '❌', info: 'ℹ️' };

  el.className = `toast t-${type}`;
  el.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <div>
      <div class="toast-title">${title}</div>
      <div class="toast-body">${body}</div>
    </div>`;

  stack.appendChild(el);

  /* Tự xoá sau 3.8 giây */
  setTimeout(() => {
    el.style.opacity   = '0';
    el.style.transform = 'translateX(20px)';
    setTimeout(() => el.remove(), 300);
  }, 3800);
}
