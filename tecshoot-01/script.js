// State
let isLoggedIn = false;

// Nav scroll
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
});

// FAQ toggle
function toggleFaq(el) {
  const item = el.parentElement;
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!wasOpen) item.classList.add('open');
}

// Modal
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => {
    if (e.target === m) { m.classList.remove('open'); document.body.style.overflow = ''; }
  });
});

// Gallery grid (Landing Page)
const gallery = document.getElementById('galleryGrid');
if (gallery) {
  const emojis = ['🌸','🌿','🌅','💫','🎋','🌊','🌙','🏔️','🌺','🦋','🌼','🌙','🎑','🌸','🌿','🌅','💫','🎋'];
  const selected = new Set([2,5,8,11]);
  for (let i = 0; i < 18; i++) {
    const thumb = document.createElement('div');
    thumb.className = 'gallery-thumb' + (selected.has(i) ? ' selected' : '');
    thumb.innerHTML = `
      <div class="gallery-thumb-bg">${emojis[i % emojis.length]}</div>
      <div class="watermark-overlay">TECSHOOT</div>
      <button class="heart-btn">${selected.has(i) ? '♥' : '♡'}</button>
    `;
    thumb.addEventListener('click', function() {
      this.classList.toggle('selected');
      const hb = this.querySelector('.heart-btn');
      hb.textContent = this.classList.contains('selected') ? '♥' : '♡';
      if (this.classList.contains('selected')) hb.style.color = '#e06060';
      else hb.style.color = '';
    });
    gallery.appendChild(thumb);
  }
}

// Request chips interactive
document.querySelectorAll('.request-chip').forEach(chip => {
  chip.addEventListener('click', function() {
    this.classList.toggle('active');
  });
});

// Vote buttons
document.querySelectorAll('.vote-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    this.classList.toggle('voted');
  });
});

// Login simulation
function handleLogin() {
  const btn = document.querySelector('#loginModal .btn-primary');
  const originalText = btn.textContent;
  btn.textContent = 'Đang đăng nhập...';
  btn.style.opacity = '0.7';
  btn.style.pointerEvents = 'none';
  
  setTimeout(() => {
    closeModal('loginModal');
    document.getElementById('navCtaGuest').style.display = 'none';
    document.getElementById('navCtaUser').style.display = 'flex';
    
    isLoggedIn = true;
    updateAuthUI(true);
    
    btn.textContent = originalText;
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';

    // Init flow components (optional, can be done when clicking booking)
    initCalendar();
    initGallery();
  }, 1200);
}

function handleLogout() {
  if (confirm('Bạn có chắc muốn đăng xuất?')) {
    isLoggedIn = false;
    updateAuthUI(false);
    
    const landing = document.getElementById('landingContent');
    const flow = document.getElementById('customerFlowContainer');
    if (landing) landing.style.display = 'block';
    if (flow) flow.style.display = 'none';
    window.scrollTo(0, 0);
  }
}

function updateAuthUI(loggedIn) {
  const bookingLink = document.getElementById('bookingNavLink');
  const ctaGuest = document.getElementById('navCtaGuest');
  const ctaUser = document.getElementById('navCtaUser');

  if (loggedIn) {
    if (bookingLink) bookingLink.textContent = 'Đặt lịch';
    if (ctaGuest) ctaGuest.style.display = 'none';
    if (ctaUser) ctaUser.style.display = 'flex';
  } else {
    if (bookingLink) bookingLink.textContent = 'Đặt lịch (Vui lòng đăng nhập)';
    if (ctaGuest) ctaGuest.style.display = 'flex';
    if (ctaUser) ctaUser.style.display = 'none';
  }
}

function handleBookingClick(pName, pPrice) {
  if (!isLoggedIn) {
    openModal('loginModal');
  } else {
    const landing = document.getElementById('landingContent');
    const flow = document.getElementById('customerFlowContainer');
    
    if (landing) landing.style.display = 'none';
    if (flow) {
      flow.style.display = 'block';
      if (pName && pPrice) {
        goToStep(2, pName, pPrice); // Chuyển thẳng sang bước 2 nếu đã chọn thợ
      } else {
        goToStep(1); // Chuyển sang bước 1 nếu click chung chung
      }
      window.scrollTo(0, 0);
    }
  }
}

// ===== CUSTOMER EXPERIENCE FLOW LOGIC =====
let currentStep = 1;
let selectedPhotographer = { name: '', basePrice: 0, currentPrice: 0, package: 'Tiêu chuẩn' };
let selectedAddons = [];

function goToStep(step, pName, pPrice) {
  if (pName) {
    selectedPhotographer.name = pName;
    selectedPhotographer.basePrice = pPrice;
    selectedPhotographer.currentPrice = pPrice; // Mặc định là gói Tiêu chuẩn
    selectedPhotographer.package = 'Tiêu chuẩn';
    
    document.getElementById('selectedPName').textContent = pName;
    document.getElementById('selectedPPrice').textContent = `Phí chụp: ${formatPrice(pPrice)}`;
    document.getElementById('sumPPrice').textContent = formatPrice(pPrice);
    
    // Cập nhật giá các gói
    document.getElementById('pkgPriceBasic').textContent = formatPrice(pPrice * 0.6);
    document.getElementById('pkgPriceStandard').textContent = formatPrice(pPrice);
    document.getElementById('pkgPricePremium').textContent = formatPrice(pPrice * 2.5);
    
    // Reset active class
    document.querySelectorAll('.package-card').forEach(c => c.classList.remove('active'));
    document.querySelector('.package-card[data-package="Tiêu chuẩn"]').classList.add('active');
    
    const imgMap = {
      'Nguyễn Minh Khoa': 'url("images/DN/Hieuthuhai/avatar_1.jpg")',
      'Trần Anh Tú': 'url("images/HN/tu_ca_nhan/avatar_8.jpg")',
      'Lê Thu Hà': 'url("images/HN/Misthy/avatar_7.jpg")'
    };
    document.getElementById('selectedPImg').style.backgroundImage = imgMap[pName] || '';
    updateTotalPrice();
  }

  document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
  document.getElementById(`step${step}`).classList.add('active');

  document.querySelectorAll('.step').forEach(el => {
    const s = parseInt(el.getAttribute('data-step'));
    el.classList.remove('active', 'done');
    if (s === step) el.classList.add('active');
    if (s < step) el.classList.add('done');
  });

  if (step === 4) {
    initPostProd();
  }

  currentStep = step;
  window.scrollTo(0, 0);
}

// ... existing functions ...

// ===== POST-PRODUCTION LOGIC (FROM TECSHOOT_HAU_KY) =====
const EMOJIS_PP = ['📸','🌿','💫','🎞','✨','🌅','🦋','🌸','🏔','🌊','🎨','🌙','🍃','⭐','🌺','🎭','🌻','🦚','🌾','🍂','🌴','🌈','🦜','🌸'];
const BGS_PP = ['linear-gradient(145deg,#f5e8dc,#ecd4bc)','linear-gradient(145deg,#dce8f5,#bcd0ec)','linear-gradient(145deg,#f5eedc,#ecd8a8)','linear-gradient(145deg,#ddf5e8,#bcecd0)','linear-gradient(145deg,#f5dcea,#ecbcd4)','linear-gradient(145deg,#e8dcf5,#d0bced)','linear-gradient(145deg,#f5f0dc,#ece0a8)','linear-gradient(145deg,#dcf5f0,#bcecea)'];
const VAGUE_PP = ['đẹp hơn','đẹp lên','chỉnh đẹp','làm đẹp','tốt hơn','ngon hơn','ok hơn','nét hơn','đẹp','tổng thể','chỉnh ảnh'];
const MAX_SELECT_PP = 15;
let TOTAL_REVISIONS_PP = 2;
let photos_PP = EMOJIS_PP.map((e, i) => ({ id: `DSC_${String(i + 1).padStart(4, '0')}.jpg`, emoji: e, bg: BGS_PP[i % BGS_PP.length], selected: false, notes: [] }));
let lbIdx_PP = 0;
let approvedSet_PP = new Set();
let currentFilter_PP = 'all';
let largeGrid_PP = false;

function initPostProd() {
  renderGrid_PP('all');
  updateCounters_PP();
}

function goStage(stage) {
  document.querySelectorAll('.stage-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.stage-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('stage-' + stage).classList.add('active');
  document.getElementById('tab-' + stage).classList.add('active');
  if (stage === 'select') {
    renderGrid_PP();
    document.getElementById('tabnum-approve').textContent = '2';
    document.getElementById('tab-approve').classList.remove('done');
  }
  if (stage === 'approve') {
    document.getElementById('tab-select').classList.add('done');
    document.getElementById('tabnum-select').textContent = '✓';
    renderApproveGrid_PP();
  }
}

function renderGrid_PP(filter) {
  if (filter !== undefined) currentFilter_PP = filter;
  const grid = document.getElementById('photo-grid');
  if (!grid) return;
  grid.innerHTML = '';
  grid.className = 'photo-grid' + (largeGrid_PP ? ' grid-large' : '');
  let list = photos_PP;
  if (currentFilter_PP === 'selected') list = photos_PP.filter(p => p.selected);
  if (currentFilter_PP === 'noted') list = photos_PP.filter(p => p.notes.length > 0);
  list.forEach(p => {
    const realIdx = photos_PP.indexOf(p);
    const card = document.createElement('div');
    card.className = 'photo-card' + (p.selected ? ' selected' : '') + (p.notes.length > 0 ? ' has-note' : '');
    card.innerHTML = `
      <div class="pc-img" style="background:${p.bg}">
        <span style="font-size:${largeGrid_PP ? '72px' : '52px'};position:relative;z-index:1">${p.emoji}</span>
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
    card.querySelector('.pc-check').addEventListener('click', e => { e.stopPropagation(); toggleSelect_PP(realIdx); });
    card.addEventListener('click', () => openLB_PP(null, realIdx));
    grid.appendChild(card);
  });
  updateCounters_PP();
}

function filterGrid(type, btn) {
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('on'));
  btn.classList.add('on');
  renderGrid_PP(type);
}

function toggleGridSize() {
  largeGrid_PP = !largeGrid_PP;
  document.getElementById('grid-toggle-btn').textContent = largeGrid_PP ? '🔳 Lưới lớn' : '🔲 Lưới nhỏ';
  renderGrid_PP();
}

function toggleSelect_PP(idx) {
  const p = photos_PP[idx];
  const sel = photos_PP.filter(x => x.selected).length;
  if (!p.selected && sel >= MAX_SELECT_PP) {
    toast_PP(`⚠ Đã đủ ${MAX_SELECT_PP} ảnh!`, 'Bỏ chọn ảnh khác nếu muốn thêm.', 'warn');
    return;
  }
  p.selected = !p.selected;
  renderGrid_PP();
  updateLBSelectBtn_PP();
}

function updateCounters_PP() {
  const sel = photos_PP.filter(p => p.selected).length;
  const noted = photos_PP.filter(p => p.notes.length > 0).length;
  document.getElementById('stat-selected').textContent = sel;
  document.getElementById('footer-count').textContent = sel;
  document.getElementById('footer-b').textContent = sel;
  document.getElementById('chip-all').textContent = photos_PP.length;
  document.getElementById('chip-selected').textContent = sel;
  document.getElementById('chip-noted').textContent = noted;
  document.getElementById('s1-footer').classList.toggle('visible', sel > 0);
  document.getElementById('btn-submit-sel').disabled = sel === 0;
}

function submitSelection() {
  const sel = photos_PP.filter(p => p.selected).length;
  if (sel === 0) { toast_PP('⚠ Chưa chọn ảnh!', 'Vui lòng chọn ít nhất 1 ảnh.', 'warn'); return; }
  toast_PP(`✅ Đã gửi ${sel} ảnh!`, 'Thợ đã nhận danh sách và bắt đầu retouch.', 'success');
  setTimeout(() => goStage('approve'), 900);
}

function openLB_PP(e, idx) {
  if (e) e.stopPropagation();
  lbIdx_PP = idx;
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderLB_PP();
}

function closeLB() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function navLB(dir) {
  lbIdx_PP = (lbIdx_PP + dir + photos_PP.length) % photos_PP.length;
  renderLB_PP();
}

function renderLB_PP() {
  const p = photos_PP[lbIdx_PP];
  const disp = document.getElementById('lb-display');
  disp.style.background = p.bg;
  disp.innerHTML = `<span style="font-size:130px;position:relative;z-index:1">${p.emoji}</span>`;
  document.getElementById('lb-num').textContent = String(lbIdx_PP + 1).padStart(2, '0');
  document.getElementById('lb-tot').textContent = `/ ${photos_PP.length}`;
  document.getElementById('lb-id').textContent = p.id;
  renderLBNotes_PP();
  updateLBSelectBtn_PP();
  resetChips_PP();
}

function renderLBNotes_PP() {
  const p = photos_PP[lbIdx_PP];
  const list = document.getElementById('lb-note-list');
  if (p.notes.length === 0) {
    list.innerHTML = '<p class="note-no-content">Chưa có ghi chú. Thêm ghi chú bên dưới.</p>';
    return;
  }
  list.innerHTML = p.notes.map((n, i) => `
    <div class="note-item">
      <span class="note-bullet">›</span>
      <span class="note-text">${n}</span>
      <button class="note-del" onclick="delNote_PP(${i})">✕</button>
    </div>`).join('');
}

function delNote_PP(ni) {
  photos_PP[lbIdx_PP].notes.splice(ni, 1);
  renderLBNotes_PP();
  renderGrid_PP();
}

function updateLBSelectBtn_PP() {
  const p = photos_PP[lbIdx_PP];
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

function toggleLBSelect() {
  toggleSelect_PP(lbIdx_PP);
  updateLBSelectBtn_PP();
}

function addChip(btn, text) {
  btn.classList.toggle('on');
  if (btn.classList.contains('on')) pushNote_PP(text);
}

function resetChips_PP() {
  document.querySelectorAll('.qchip.on').forEach(c => c.classList.remove('on'));
  const ta = document.getElementById('note-ta');
  ta.value = '';
  document.getElementById('note-chars').textContent = '0/200';
  document.getElementById('note-warn').classList.remove('show');
  document.getElementById('btn-add-note').disabled = true;
}

function validateNote(ta) {
  const v = ta.value;
  const isVague = VAGUE_PP.some(w => v.toLowerCase().includes(w));
  const tooShort = v.trim().length < 5;
  document.getElementById('note-chars').textContent = `${v.length}/200`;
  document.getElementById('note-warn').classList.toggle('show', isVague && v.length > 0);
  document.getElementById('btn-add-note').disabled = isVague || tooShort;
}

function addNote() {
  const ta = document.getElementById('note-ta');
  const v = ta.value.trim();
  if (!v || v.length < 5) return;
  pushNote_PP(v);
  ta.value = '';
  document.getElementById('note-chars').textContent = '0/200';
  document.getElementById('btn-add-note').disabled = true;
}

function pushNote_PP(txt) {
  const p = photos_PP[lbIdx_PP];
  if (!p.selected) toggleSelect_PP(lbIdx_PP);
  p.notes.push(txt);
  renderLBNotes_PP();
  renderGrid_PP();
  toast_PP('📌 Ghi chú đã lưu!', `"${txt}"`, 'success');
}

function renderApproveGrid_PP() {
  const grid = document.getElementById('approve-grid');
  grid.innerHTML = '';
  approvedSet_PP.clear();
  let list = photos_PP.filter(p => p.selected);
  if (list.length === 0) list = photos_PP.slice(0, 6);
  list.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'approve-card';
    card.id = `ac-${i}`;
    const noteTagsHTML = p.notes.map(n => `<span class="ac-note-tag">${n}</span>`).join('');
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
          <button class="btn-ac-approve" id="ac-app-${i}" onclick="approveOne_PP(${i})">✓ Duyệt</button>
          <button class="btn-ac-reject"  id="ac-rej-${i}" onclick="openRevisionModal()">↩ Sửa</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
  updateApproveProgress_PP();
}

function approveOne_PP(i) {
  const card = document.getElementById(`ac-${i}`);
  const appBtn = document.getElementById(`ac-app-${i}`);
  const rejBtn = document.getElementById(`ac-rej-${i}`);
  const wm = document.getElementById(`ac-wm-${i}`);
  card.classList.add('ac-approved');
  if (wm) wm.style.opacity = '0';
  if (appBtn) { appBtn.classList.add('done-state'); appBtn.textContent = '✓ Đã duyệt'; appBtn.disabled = true; }
  if (rejBtn) rejBtn.disabled = true;
  approvedSet_PP.add(i);
  updateApproveProgress_PP();
  updateApprovedCount_PP();
  toast_PP('✓ Đã duyệt ảnh!', 'Watermark đã gỡ — sẵn sàng tải về.', 'success');
  const total = document.querySelectorAll('.approve-card').length;
  if (approvedSet_PP.size >= total) {
    document.getElementById('btn-dl').classList.add('visible');
    toast_PP('🎉 Đã duyệt toàn bộ!', 'Nhấn "Tải về tất cả" để nhận ảnh gốc.', 'success');
  }
}

function approveAll() {
  document.querySelectorAll('.approve-card').forEach((_, i) => approveOne_PP(i));
}

function updateApproveProgress_PP() {
  const gridItems = document.querySelectorAll('.approve-card');
  const total = gridItems.length || photos_PP.filter(p => p.selected).length || 6;
  const done = approvedSet_PP.size;
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById('apb-fill').style.width = pct + '%';
  document.getElementById('apb-count').textContent = `${done} / ${total} ảnh`;
}

function updateApprovedCount_PP() {
  document.getElementById('approved-count').textContent = approvedSet_PP.size;
}

function openRevisionModal() {
  if (TOTAL_REVISIONS_PP <= 0) { toast_PP('⚠ Hết lượt!', 'Gói dịch vụ đã dùng hết lượt chỉnh sửa.', 'error'); return; }
  document.getElementById('rev-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeRevisionModal() {
  document.getElementById('rev-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function confirmRevision() {
  const notes = document.getElementById('rev-notes').value.trim();
  if (!notes) { toast_PP('⚠ Chưa nhập ghi chú!', 'Vui lòng mô tả chi tiết yêu cầu.', 'warn'); return; }
  TOTAL_REVISIONS_PP--;
  document.getElementById('revisions-left').textContent = TOTAL_REVISIONS_PP;
  document.getElementById('stat-revisions').textContent = TOTAL_REVISIONS_PP;
  if (TOTAL_REVISIONS_PP <= 0) { document.getElementById('btn-rev').disabled = true; document.getElementById('revision-badge').classList.add('warning'); }
  closeRevisionModal();
  document.getElementById('rev-notes').value = '';
  toast_PP(`↩ Đã gửi yêu cầu!`, `Còn ${TOTAL_REVISIONS_PP} lượt chỉnh lại.`, 'info');
}

function openDownloadModal() {
  document.getElementById('dl-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDLModal() {
  document.getElementById('dl-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function doDownload() {
  toast_PP('⬇ Bắt đầu tải!', 'File ZIP đang được tạo — ảnh không watermark.', 'success');
  closeDLModal();
}

function toast_PP(title, body, type = 'info') {
  const stack = document.getElementById('toast-stack');
  const el = document.createElement('div');
  const icons = { success: '✅', warn: '⚠️', error: '❌', info: 'ℹ️' };
  el.className = `toast t-${type}`;
  el.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><div><div class="toast-title">${title}</div><div class="toast-body">${body}</div></div>`;
  stack.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(20px)'; setTimeout(() => el.remove(), 300); }, 3800);
}


function toggleAddon(btn) {
  const card = btn.closest('.addon-card');
  const name = card.querySelector('h4').textContent;
  const price = parseInt(card.getAttribute('data-price'));

  if (card.classList.contains('selected')) {
    card.classList.remove('selected');
    btn.textContent = 'Thêm';
    selectedAddons = selectedAddons.filter(a => a.name !== name);
  } else {
    card.classList.add('selected');
    btn.textContent = 'Đã thêm';
    selectedAddons.push({ name, price });
  }
  updateAddonList();
  updateTotalPrice();
}

function selectPackage(card) {
  document.querySelectorAll('.package-card').forEach(c => c.classList.remove('active'));
  card.classList.add('active');
  
  const mult = parseFloat(card.dataset.priceMult);
  selectedPhotographer.package = card.dataset.package;
  selectedPhotographer.currentPrice = selectedPhotographer.basePrice * mult;
  
  document.getElementById('selectedPPrice').textContent = `Phí chụp (${selectedPhotographer.package}): ${formatPrice(selectedPhotographer.currentPrice)}`;
  document.getElementById('sumPPrice').textContent = formatPrice(selectedPhotographer.currentPrice);
  
  updateTotalPrice();
}

function updateAddonList() {
  const container = document.getElementById('addonItems');
  if (!container) return;
  container.innerHTML = '';
  selectedAddons.forEach(addon => {
    const div = document.createElement('div');
    div.className = 'summary-item';
    div.innerHTML = `<span>+ ${addon.name}</span><span>${formatPrice(addon.price)}</span>`;
    container.appendChild(div);
  });
}

function updateTotalPrice() {
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const total = selectedPhotographer.currentPrice + addonsTotal;
  const priceEl = document.getElementById('totalPrice');
  const depositEl = document.getElementById('depositAmount');
  if (priceEl) priceEl.textContent = formatPrice(total);
  if (depositEl) depositEl.textContent = formatPrice(total / 2);
}

function formatPrice(num) {
  return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
}

function openChat() {
  document.getElementById('chatPName').textContent = selectedPhotographer.name;
  const imgMap = {
    'Nguyễn Minh Khoa': 'url("images/DN/Hieuthuhai/avatar_1.jpg")',
    'Trần Anh Tú': 'url("images/HN/tu_ca_nhan/avatar_8.jpg")',
    'Lê Thu Hà': 'url("images/HN/Misthy/avatar_7.jpg")'
  };
  document.getElementById('chatPImg').style.backgroundImage = imgMap[selectedPhotographer.name] || '';
  openModal('chatModal');
}

function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;
  
  const container = document.getElementById('chatMessages');
  
  // User message
  const userMsg = document.createElement('div');
  userMsg.style.cssText = 'align-self: flex-end; background: var(--accent); color: white; padding: 8px 12px; border-radius: 12px 12px 0 12px; font-size: 13px; max-width: 80%;';
  userMsg.textContent = text;
  container.appendChild(userMsg);
  
  input.value = '';
  container.scrollTop = container.scrollHeight;
  
  // Mock reply
  setTimeout(() => {
    const reply = document.createElement('div');
    reply.style.cssText = 'align-self: flex-start; background: var(--bg3); padding: 8px 12px; border-radius: 12px 12px 12px 0; font-size: 13px; max-width: 80%;';
    reply.textContent = 'Chào bạn! Cảm ơn bạn đã quan tâm. Mình sẽ phản hồi chi tiết yêu cầu của bạn sớm nhé.';
    container.appendChild(reply);
    container.scrollTop = container.scrollHeight;
  }, 1000);
}

function initCalendar() {
  const grid = document.getElementById('calendarGrid');
  if (!grid || grid.children.length > 0) return;
  for (let i = 1; i <= 31; i++) {
    const dot = document.createElement('div');
    dot.className = 'cal-dot';
    if (i === 15) dot.className += ' today';
    if ([2, 5, 12, 19, 26].includes(i)) dot.className += ' booked';
    dot.textContent = i;
    dot.onclick = function() {
      if (this.classList.contains('booked')) return;
      document.querySelectorAll('.cal-dot').forEach(d => d.classList.remove('selected'));
      this.classList.add('selected');
    };
    grid.appendChild(dot);
  }
}

function initGallery() {
  const gallery = document.getElementById('clientGallery');
  if (!gallery || gallery.children.length > 0) return;
  const icons = ['🌸', '🌿', '🌅', '💫', '🎋', '🌊', '🌙', '🏔️', '🌺', '🦋'];
  for (let i = 0; i < 15; i++) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML = `
      <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:40px; background:#f0f0f0">
        ${icons[i % icons.length]}
      </div>
      <div class="watermark">TECSHOOT</div>
      <div class="heart-badge">♥</div>
    `;
    item.onclick = function() { this.classList.toggle('selected'); };
    gallery.appendChild(item);
  }
}

function simulatePayment() {
  const btn = event.target;
  const original = btn.textContent;
  btn.textContent = 'Đang xử lý thanh toán...';
  btn.disabled = true;
  setTimeout(() => {
    alert('Thanh toán thành công! Chào mừng bạn đến với Tecshoot.');
    goToStep(4);
    btn.disabled = false;
    btn.textContent = original;
  }, 2000);
}

// Scroll reveal
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
reveals.forEach(r => observer.observe(r));

// Animate storage bars on scroll
const storageObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.storage-bar-fill').forEach(bar => {
        const w = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => { bar.style.width = w; }, 100);
      });
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.storage-bar-wrap, .dash-sidebar').forEach(el => storageObserver.observe(el));