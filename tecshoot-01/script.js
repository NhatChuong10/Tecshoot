// State
let isLoggedIn = false;

// ===== SESSION PERSISTENCE =====
// Restore login state from sessionStorage (survives soft navigation, cleared when tab closes)
(function restoreSession() {
  if (sessionStorage.getItem('ts_logged_in') === '1') {
    isLoggedIn = true;
    // UI will be updated once DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
      updateAuthUI(true);
      initCalendar();
      initGallery();
    });
  }
})();

// Go home without losing login state
function goHome() {
  const landing = document.getElementById('landingContent');
  const flow = document.getElementById('customerFlowContainer');
  if (landing) landing.style.display = 'block';
  if (flow) flow.style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Nav scroll
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
});

// Smooth anchor navigation from anywhere
document.addEventListener('DOMContentLoaded', () => {
  const anchors = document.querySelectorAll('a[href^="#"]');
  anchors.forEach(a => {
    a.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href').substring(1);
      if (!targetId) return;
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        
        // Ensure landing page is visible
        const landing = document.getElementById('landingContent');
        const flow = document.getElementById('customerFlowContainer');
        if (landing && landing.style.display === 'none') {
          landing.style.display = 'block';
          if (flow) flow.style.display = 'none';
        }
        
        // Smooth scroll with fixed header offset
        const y = targetEl.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });
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
    sessionStorage.setItem('ts_logged_in', '1'); // persist session
    updateAuthUI(true);
    
    btn.textContent = originalText;
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';

    // Init flow components
    initCalendar();
    initGallery();
  }, 1200);
}

function handleLogout() {
  if (confirm('Bạn có chắc muốn đăng xuất?')) {
    isLoggedIn = false;
    sessionStorage.removeItem('ts_logged_in'); // clear session
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
  const photographerLink = document.getElementById('photographerNavLink');
  const ctaGuest = document.getElementById('navCtaGuest');
  const ctaUser = document.getElementById('navCtaUser');

  if (loggedIn) {
    if (bookingLink) bookingLink.textContent = 'Đặt lịch';
    if (photographerLink) photographerLink.textContent = 'Dành cho thợ chụp';
    if (ctaGuest) ctaGuest.style.display = 'none';
    if (ctaUser) ctaUser.style.display = 'flex';
  } else {
    if (bookingLink) bookingLink.textContent = 'Đặt lịch (Vui lòng đăng nhập)';
    if (photographerLink) photographerLink.textContent = 'Dành cho thợ chụp (Cần đăng nhập)';
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
      scrollToFlow();
    }
  }
}

function scrollToFlow() {
  const indicator = document.querySelector('.step-indicator');
  if (indicator) {
    const y = indicator.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: 'smooth' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function handlePhotographerClick() {
  if (!isLoggedIn) {
    openModal('loginModal');
  } else {
    window.location.href = 'photographer-dashboard.html';
  }
}

// ===== FILTER LOGIC =====
function applyFilters() {
  const style = (document.getElementById('styleFilter') || {}).value || 'all';
  const area  = (document.getElementById('areaFilter')  || {}).value || 'all';
  const price = (document.getElementById('priceFilter') || {}).value || 'all';
  const type  = (document.getElementById('typeFilter')  || {}).value || 'all';

  // Filter Step 1 p-cards
  const pCards = document.querySelectorAll('#photographerList .p-card');
  pCards.forEach(card => {
    const cs = card.dataset.style || '';
    const ca = card.dataset.area  || '';
    const cp = card.dataset.price || '';
    const ct = card.dataset.type  || '';
    const matchStyle = style === 'all' || cs === style;
    const matchArea  = area  === 'all' || ca === area;
    const matchPrice = price === 'all' || cp === price;
    const matchType  = type  === 'all' || ct === type;
    card.style.display = (matchStyle && matchArea && matchPrice && matchType) ? '' : 'none';
  });

  // Filter homepage photographer-cards
  const hCards = document.querySelectorAll('.photographers-grid .photographer-card');
  hCards.forEach(card => {
    const cs = card.dataset.style || '';
    const ca = card.dataset.area  || '';
    const cp = card.dataset.price || '';
    const ct = card.dataset.type  || '';
    const matchStyle = style === 'all' || cs === style;
    const matchArea  = area  === 'all' || ca === area;
    const matchPrice = price === 'all' || cp === price;
    const matchType  = type  === 'all' || ct === type;
    card.style.display = (matchStyle && matchArea && matchPrice && matchType) ? '' : 'none';
  });
}

// Wire homepage search button
document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.querySelector('.search-btn');
  if (searchBtn) searchBtn.addEventListener('click', applyFilters);
});

// ===== CUSTOMER EXPERIENCE FLOW LOGIC =====
let currentStep = 1;
let selectedPhotographer = { name: '', basePrice: 0, currentPrice: 0, package: 'Tiêu chuẩn', rating: 4.98, reviewCount: 127 };
let selectedAddons = [];

const photographerReviews = {
  'Misthy': {
    rating: 4.95,
    count: 156,
    reviews: [
      {
        user: "Khách hàng thân thiết",
        stars: 5,
        text: "Lần đầu đi chụp mà cứ ngỡ là đi cafe với bà chị thân thiết không. Chị thợ siêu tâm lý, hiểu ý đồ “sống ảo” của mình trong một nốt nhạc mà không cần phải nói nhiều. Chụp với nữ đúng là thoải mái hơn hẳn, tạo dáng không thấy ngại xíu nào."
      },
      {
        user: "Thảo Vy",
        stars: 5,
        text: "Đúng là con gái chụp có khác, tỉ mỉ đến từng sợi tóc nếp áo luôn á mấy bà. Chị thợ còn kiêm luôn stylist chỉnh sửa trang phục cho tui cực kỳ có tâm. Ảnh về tay là chỉ có cảm thán vì quá chỉnh chu."
      },
      {
        user: "Minh Anh",
        stars: 4.5,
        text: "Màu ảnh bộ này nhìn thơ thực sự, cơ mà có mấy tấm chị chỉnh hơi rực rỡ quá so với style tối giản của em. Lần sau mình hạ tone xuống một xíu cho nó dịu hơn là chuẩn bài luôn chị ưi"
      },
      {
        user: "Hồng Hạnh",
        stars: 5,
        text: "Chị bắt được mấy góc nghiêng thần thánh mà chính mình còn ko biết mình xin đến thế (cảm ơn chị đã khai phá được nét đẹp tiềm ẩn của con bé này). Đúng là chỉ có phụ nữ mới hiểu được góc nào của phụ nữ là đẹp nhất."
      },
      {
        user: "Quỳnh Như",
        stars: 4,
        text: "Chị thợ siêu nhiệt tình với dễ thương luôn, nhưng mà hình như chị hơi bị quen quá với việc lấy góc nghiêng bên trái hơi nhiều. Hy vọng lần sau chị em mình khai phá thêm được nhiều góc mới lạ hơn để bộ ảnh đa dạng hơn nha."
      },
      {
        user: "Đại diện thương hiệu",
        stars: 5,
        text: "Nhiếp ảnh gia có tư duy thẩm mỹ tốt, khả năng xử lý ánh sáng và bố cục chuyên nghiệp, tạo nên những khung hình có chiều sâu và đúng tinh thần thương hiệu. Hình ảnh có độ sắc nét cao, nhưng nhiếp ảnh gia có thể nghiên cứu thêm nhiều góc máy khai thác bối cảnh đa dạng hơn để bộ ảnh có thêm nhiều lựa chọn phong phú."
      }
    ]
  },
  'Hiếu Thứ Hai': {
    rating: 4.98,
    count: 127,
    reviews: [
      { user: "Trợ lý Harper’s Bazaar", stars: 5, text: "Mình là một trong các trợ lý của người mẫu Hiều Minh Trấn trong bộ ảnh của Harper’s Bazaar Việt Nam được anh photo chụp..." },
      { user: "Mẹ em bé", stars: 5, text: "Em bé nhà mình hơi nhát người nên lúc bảo chụp ảnh với bố mẹ ở studio, mình hơi lo là em sẽ không được tươi..." }
    ]
  }
};

const photographerCollections = {
  'Misthy': [
    {
      label: 'Gia đình',
      images: [
        'images/HN/Misthy/gia đình/615076108_122346421028002998_355826095400704352_n.jpg',
        'images/HN/Misthy/gia đình/615123372_122346421364002998_2965139986042804379_n.jpg',
        'images/HN/Misthy/gia đình/615529538_122346421316002998_4473792759960898770_n.jpg',
        'images/HN/Misthy/gia đình/615557640_122346421280002998_6469520660445503397_n.jpg',
        'images/HN/Misthy/gia đình/616461078_122346421148002998_1388174925290769975_n.jpg'
      ]
    },
    {
      label: 'HSSV',
      images: [
        'images/HN/Misthy/HSSV/650024172_3677919805683407_8308034760028430685_n.jpg',
        'images/HN/Misthy/HSSV/650037621_3677918985683489_4776437654826154091_n.jpg',
        'images/HN/Misthy/HSSV/650118882_3677919042350150_1407582935648105214_n.jpg',
        'images/HN/Misthy/HSSV/651158459_3677919062350148_6985406803757383608_n.jpg',
        'images/HN/Misthy/HSSV/651236012_3677919022350152_6716227070775046206_n.jpg'
      ]
    },
    {
      label: 'Wedding',
      images: [
        'images/TPHCM/DoMixi_canhan/495571790_2809170262602403_5772652689163025486_n.jpg',
        'images/TPHCM/DoMixi_canhan/495573055_2809170635935699_6902849571944374440_n.jpg',
        'images/TPHCM/DoMixi_canhan/495877768_2809170315935731_3767403523268273910_n.jpg',
        'images/TPHCM/DoMixi_canhan/495964045_2809170272602402_5658662874208620121_n.jpg',
        'images/TPHCM/DoMixi_canhan/496448822_2809170649269031_4813408265236551829_n.jpg'
      ]
    }
  ],
  'Hiếu Thứ Hai': [
    {
      label: 'Couple',
      images: [
        'images/DN/Hieuthuhai/couple/651234024_3682096508599070_183148188158637926_n.jpg',
        'images/DN/Hieuthuhai/couple/651882421_3682103888598332_51168709371514710_n.jpg',
        'images/DN/Hieuthuhai/couple/652130618_3682108795264508_3110070249642041366_n.jpg',
        'images/DN/Hieuthuhai/couple/653700875_3682106728598048_10903848581001558_n.jpg',
        'images/DN/Hieuthuhai/couple/653878620_3682104761931578_5486745388127094980_n.jpg'
      ]
    },
    {
      label: 'Gia đình',
      images: [
        'images/DN/Hieuthuhai/Gia đình/669599717_1457777446364010_1820617379218644258_n.jpg',
        'images/DN/Hieuthuhai/Gia đình/669728946_1457777449697343_3144116148353572539_n.jpg',
        'images/DN/Hieuthuhai/Gia đình/669993863_1457777683030653_5342777321597746330_n.jpg',
        'images/DN/Hieuthuhai/Gia đình/670459075_1457777716363983_9105126668116088688_n.jpg',
        'images/DN/Hieuthuhai/Gia đình/670899766_1457777699697318_6700517593564885477_n.jpg'
      ]
    },
    {
      label: 'HSSV',
      images: [
        'images/DN/Hieuthuhai/HSSV/656332849_3692719480870106_8585219180328203534_n.jpg',
        'images/DN/Hieuthuhai/HSSV/656360055_3692720697536651_584905270007893022_n.jpg',
        'images/DN/Hieuthuhai/HSSV/657281266_3692724567536264_5118002395050181197_n.jpg',
        'images/DN/Hieuthuhai/HSSV/657313591_3692719734203414_468943187710169326_n.jpg',
        'images/DN/Hieuthuhai/HSSV/657400595_3692726277536093_50263061636671548_n.jpg'
      ]
    }
  ]
};

function updateCollectionsForPhotographer(pName) {
  const grid = document.getElementById('collectionsGrid');
  if (!grid) return;
  const cols = photographerCollections[pName] || photographerCollections['Hiếu Thứ Hai'];
  grid.innerHTML = '';
  cols.forEach(col => {
    const item = document.createElement('div');
    item.className = 'collection-item';
    item.style.cssText = 'cursor: pointer; text-align: center;';
    item.onclick = () => openDynamicCollection(col.images);
    const stack = document.createElement('div');
    stack.className = 'collection-stack';
    col.images.slice(0, 3).forEach((src, i) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = col.label + ' ' + (i + 1);
      img.className = 'stack-img';
      stack.appendChild(img);
    });
    const label = document.createElement('div');
    label.className = 'collection-label';
    label.style.cssText = 'margin-top: 15px; font-weight: 500; font-family: "Playfair Display", serif;';
    label.textContent = col.label;
    item.appendChild(stack);
    item.appendChild(label);
    grid.appendChild(item);
  });
}

function openDynamicCollection(images) {
  currentCollection = images;
  currentColIdx = 0;
  updateCollectionImg();
  openModal('collectionLightbox');
}

function goToStep(step, pName, pPrice) {
  if (pName) {
    selectedPhotographer.name = pName;
    selectedPhotographer.basePrice = pPrice;
    selectedPhotographer.currentPrice = pPrice; // Mặc định là gói Tiêu chuẩn
    selectedPhotographer.package = 'Tiêu chuẩn';
    
    document.getElementById('selectedPName').textContent = pName;
    document.getElementById('selectedPPrice').textContent = `Phí chụp: ${formatPrice(pPrice)}`;
    document.getElementById('sumPPrice').textContent = formatPrice(pPrice);
    
    // Update Rating Display in Step 2
    const pData = photographerReviews[pName] || { rating: 4.98, count: 127 };
    selectedPhotographer.rating = pData.rating;
    selectedPhotographer.reviewCount = pData.count;
    
    const ratingValEl = document.getElementById('ratingValue');
    if (ratingValEl) ratingValEl.textContent = pData.rating;
    
    // Cập nhật giá các gói
    document.getElementById('pkgPriceBasic').textContent = formatPrice(pPrice * 0.6);
    document.getElementById('pkgPriceStandard').textContent = formatPrice(pPrice);
    document.getElementById('pkgPricePremium').textContent = formatPrice(pPrice * 2.5);
    
    // Reset active class
    document.querySelectorAll('.package-card').forEach(c => c.classList.remove('active'));
    document.querySelector('.package-card[data-package="Tiêu chuẩn"]').classList.add('active');
    
    const imgMap = {
      'Hiếu Thứ Hai': 'url("images/DN/Hieuthuhai/avatar_1.jpg")',
      'Misthy': 'url("images/HN/Misthy/avatar_7.jpg")',
      'Tư Cute': 'url("images/HN/tu_ca_nhan/avatar_8.jpg")'
    };
    document.getElementById('selectedPImg').style.backgroundImage = imgMap[pName] || '';
    updateCollectionsForPhotographer(pName);
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
  } else if (step === 3) {
    document.querySelectorAll('.cal-dot').forEach(d => d.classList.remove('selected'));
  }

  currentStep = step;
  scrollToFlow();
}

// ... existing functions ...

// ===== POST-PRODUCTION LOGIC (FROM TECSHOOT_HAU_KY) =====
const IMAGES_PP = [
  'images/DN/Hieuthuhai/HSSV/656360055_3692720697536651_584905270007893022_n.jpg',
  'images/DN/Hieuthuhai/HSSV/657281266_3692724567536264_5118002395050181197_n.jpg',
  'images/DN/Hieuthuhai/HSSV/657400595_3692726277536093_50263061636671548_n.jpg',
  'images/DN/Jenny/680003645_1313407220896400_6649788017600774555_n.jpg',
  'images/DN/Jenny/681391044_1313407274229728_2713865009988940750_n.jpg',
  'images/DN/Jenny/681752225_1313407207563068_3407257115300855987_n.jpg',
  'images/DN/Noémie_ca_nhan/bộ 1/641528190_1742574733371190_8150084820197431913_n - Copy.jpg',
  'images/DN/Noémie_ca_nhan/bộ 1/642217922_1742574116704585_3299776619422430799_n - Copy.jpg',
  'images/DN/Noémie_ca_nhan/bộ 1/643899284_1742574613371202_5448261641451750940_n - Copy.jpg',
  'images/DN/Noémie_ca_nhan/bộ 1/644524062_1742574366704560_1019398120020961433_n.jpg',
  'images/DN/Noémie_ca_nhan/bộ 2/678620452_1790364861925510_3840363142686033725_n.jpg',
  'images/DN/Noémie_ca_nhan/bộ 2/679210033_1790364771925519_4515075321712403817_n.jpg',
  'images/HN/Nhat_Truong_ca_nhan/canhan_lookbook2/647150036_122170390352620843_5865149787227928376_n.jpg',
  'images/HN/Nhat_Truong_ca_nhan/canhan_lookbook2/646890583_122170390466620843_8580670954766453201_n.jpg',
  'images/HN/Nhat_Truong_ca_nhan/canhan_lookbook2/648836885_122170390202620843_6965736051833112145_n.jpg',
  'images/HN/Nhat_Truong_ca_nhan/canhan_lookbook2/649225814_122170390208620843_7742544322737152599_n.jpg',
  'images/HN/Tu_(tucutehehe)_ca_nhan/Copy of 581729521_122111206485034842_7843669407523151303_n.jpg',
  'images/HN/Tu_(tucutehehe)_ca_nhan/Copy of 581715036_122111206449034842_4004044854796880415_n.jpg',
  'images/HN/Tu_(tucutehehe)_ca_nhan/Copy of 581364994_122111206497034842_7796475245694407595_n.jpg',
  'images/TPHCM/35MM_couple/couple_lookbook/678291065_122158671704958141_3111751562391658804_n.jpg',
  'images/TPHCM/35MM_couple/couple_lookbook/675316614_122158667408958141_4695220955720388896_n.jpg',
  'images/TPHCM/35MM_couple/couple_lookbook/674586520_122158667444958141_5765600095187021453_n.jpg',
  'images/TPHCM/35MM_couple/couple_lookbook/674484626_122158667768958141_2336855824386821557_n - Copy.jpg',
  'images/TPHCM/35MM_couple/couple_lookbook/675316614_122158667408958141_4695220955720388896_n.jpg'
];
const VAGUE_PP = ['đẹp hơn','đẹp lên','chỉnh đẹp','làm đẹp','tốt hơn','ngon hơn','ok hơn','nét hơn','đẹp','tổng thể','chỉnh ảnh'];
const MAX_SELECT_PP = 15;
let TOTAL_REVISIONS_PP = 2;
let photos_PP = IMAGES_PP.map((src, i) => ({ id: `DSC_${String(i + 1).padStart(4, '0')}.jpg`, src: src, selected: false, notes: [] }));
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
      <div class="pc-img" style="background-image:url('${p.src}'); background-size:cover; background-position:center; position:relative;">
        <div class="watermark-overlay"></div>
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
  disp.style.backgroundImage = `url('${p.src}')`;
  disp.style.backgroundSize = 'contain';
  disp.style.backgroundPosition = 'center';
  disp.style.backgroundRepeat = 'no-repeat';
  disp.style.position = 'relative';
  disp.innerHTML = '<div class="watermark-overlay"></div>';
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
      <div class="ac-img" style="background-image:url('${p.src}'); background-size:cover; background-position:center; position:relative;">
        <div class="watermark-overlay" id="ac-wm-${i}"></div>
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


function toggleAddonExpand(header) {
  const card = header.closest('.addon-category-card');
  card.classList.toggle('expanded');
}

function calcAddons() {
  selectedAddons = [];
  const checkboxes = document.querySelectorAll('.addons-grid.detailed input[type="checkbox"]:checked');
  checkboxes.forEach(cb => {
    const name = cb.getAttribute('data-name');
    const price = parseInt(cb.value) || 0;
    selectedAddons.push({ name, price });
  });
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
    'Hiếu Thứ Hai': 'url("images/DN/Hieuthuhai/avatar_1.jpg")',
    'Misthy': 'url("images/HN/Misthy/avatar_7.jpg")',
    'Tư Cute': 'url("images/HN/tu_ca_nhan/avatar_8.jpg")'
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
  
  // Tháng 5/2026 bắt đầu vào thứ Sáu (tương đương 5 ô trống nếu tính từ Chủ Nhật)
  for (let e = 0; e < 5; e++) {
    const empty = document.createElement('div');
    empty.className = 'cal-dot';
    empty.style.visibility = 'hidden';
    grid.appendChild(empty);
  }

  for (let i = 1; i <= 31; i++) {
    const dot = document.createElement('div');
    dot.className = 'cal-dot';
    // Chỉ rảnh hết, trừ ngày 4 và 19
    if ([4, 19].includes(i)) dot.className += ' booked';
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

/* ===== HERO PANELS SLIDER ===== */
(function () {
  const slides = document.querySelectorAll('#heroPanels .panel-slide');
  if (slides.length === 0) return;

  let current = 0;

  function showSlide(index) {
    slides[current].classList.remove('active');
    current = index % slides.length;
    slides[current].classList.add('active');
  }

  // Tự chuyển mỗi 5 giây
  setInterval(function () {
    showSlide(current + 1);
  }, 5000);
})();

// ===== COLLECTIONS LIGHTBOX LOGIC =====
const collectionsData = {
  couple: [
    'images/DN/Hieuthuhai/couple/651234024_3682096508599070_183148188158637926_n.jpg',
    'images/DN/Hieuthuhai/couple/651882421_3682103888598332_51168709371514710_n.jpg',
    'images/DN/Hieuthuhai/couple/652130618_3682108795264508_3110070249642041366_n.jpg',
    'images/DN/Hieuthuhai/couple/653700875_3682106728598048_10903848581001558_n.jpg',
    'images/DN/Hieuthuhai/couple/653878620_3682104761931578_5486745388127094980_n.jpg',
    'images/DN/Hieuthuhai/couple/653905252_3682096578599063_4621600746743318700_n.jpg'
  ],
  family: [
    'images/DN/Hieuthuhai/Gia đình/669599717_1457777446364010_1820617379218644258_n.jpg',
    'images/DN/Hieuthuhai/Gia đình/669728946_1457777449697343_3144116148353572539_n.jpg',
    'images/DN/Hieuthuhai/Gia đình/669993863_1457777683030653_5342777321597746330_n.jpg',
    'images/DN/Hieuthuhai/Gia đình/670459075_1457777716363983_9105126668116088688_n.jpg',
    'images/DN/Hieuthuhai/Gia đình/670899766_1457777699697318_6700517593564885477_n.jpg'
  ],
  hssv: [
    'images/DN/Hieuthuhai/HSSV/656332849_3692719480870106_8585219180328203534_n.jpg',
    'images/DN/Hieuthuhai/HSSV/656360055_3692720697536651_584905270007893022_n.jpg',
    'images/DN/Hieuthuhai/HSSV/657281266_3692724567536264_5118002395050181197_n.jpg',
    'images/DN/Hieuthuhai/HSSV/657313591_3692719734203414_468943187710169326_n.jpg',
    'images/DN/Hieuthuhai/HSSV/657400595_3692726277536093_50263061636671548_n.jpg'
  ]
};

let currentCollection = [];
let currentColIdx = 0;

function openCollection(id) {
  currentCollection = collectionsData[id];
  currentColIdx = 0;
  if (!currentCollection) return;
  
  updateCollectionImg();
  openModal('collectionLightbox');
}

function updateCollectionImg() {
  const img = document.getElementById('collectionLargeImg');
  if (img) img.src = currentCollection[currentColIdx];
}

function changeCollectionImg(dir) {
  currentColIdx = (currentColIdx + dir + currentCollection.length) % currentCollection.length;
  updateCollectionImg();
}

// ===== AI CHAT ASSISTANT LOGIC =====
function toggleAIChat() {
  const chatBox = document.getElementById('aiChatBox');
  chatBox.classList.toggle('open');
}

function sendAIMessage() {
  const input = document.getElementById('aiInput');
  const text = input.value.trim();
  if (!text) return;

  const container = document.getElementById('aiChatMessages');
  
  // User message
  const userMsg = document.createElement('div');
  userMsg.className = 'ai-msg user';
  userMsg.textContent = text;
  container.appendChild(userMsg);
  
  input.value = '';
  container.scrollTop = container.scrollHeight;

  // Bot response simulation
  setTimeout(() => {
    const botMsg = document.createElement('div');
    botMsg.className = 'ai-msg bot';
    botMsg.textContent = getAIResponse(text);
    container.appendChild(botMsg);
    container.scrollTop = container.scrollHeight;
  }, 1000);
}

function getAIResponse(text) {
  const input = text.toLowerCase();
  if (input.includes('giá') || input.includes('chi phí')) return 'Giá dịch vụ tùy thuộc vào từng nhiếp ảnh gia và gói chụp (Cơ bản, Tiêu chuẩn, Cao cấp). Bạn có thể xem chi tiết ở phần "Cấu hình dịch vụ" nhé!';
  if (input.includes('đặt lịch') || input.includes('booking')) return 'Để đặt lịch, bạn chỉ cần chọn nhiếp ảnh gia ưng ý trên trang chủ, sau đó nhấn "Đặt lịch" và làm theo các bước hướng dẫn.';
  if (input.includes('retouch') || input.includes('hậu kỳ')) return 'Tecshoot hỗ trợ quy trình hậu kỳ chuyên nghiệp, bạn có thể chọn ảnh và gửi yêu cầu chỉnh sửa trực tiếp cho thợ.';
  if (input.includes('chào') || input.includes('hi') || input.includes('hello')) return 'Chào bạn! Mình có thể giúp gì cho bạn trong việc tìm kiếm nhiếp ảnh gia hôm nay?';
  return 'Cảm ơn câu hỏi của bạn! Mình là AI giả lập nên kiến thức có hạn, bạn có thể liên hệ hotline hoặc nhắn tin trực tiếp cho nhiếp ảnh gia để được hỗ trợ tốt nhất nhé.';
}

// DRAGGABLE LOGIC FOR AI CHAT
(function() {
  const wrapper = document.getElementById('aiChatWrapper');
  const toggle = document.getElementById('aiChatToggle');
  const header = document.getElementById('aiChatHeader');
  
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;

  function dragStart(e) {
    if (e.type === "touchstart") {
      initialX = e.touches[0].clientX - xOffset;
      initialY = e.touches[0].clientY - yOffset;
    } else {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
    }

    if (e.target === toggle || e.target === header || header.contains(e.target)) {
      isDragging = true;
    }
  }

  function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
  }

  function drag(e) {
    if (isDragging) {
      e.preventDefault();
      if (e.type === "touchmove") {
        currentX = e.touches[0].clientX - initialX;
        currentY = e.touches[0].clientY - initialY;
      } else {
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
      }

      xOffset = currentX;
      yOffset = currentY;

      setTranslate(currentX, currentY, wrapper);
    }
  }

  function setTranslate(xPos, yPos, el) {
    el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
  }

  document.addEventListener("touchstart", dragStart, false);
  document.addEventListener("touchend", dragEnd, false);
  document.addEventListener("touchmove", drag, false);

  document.addEventListener("mousedown", dragStart, false);
  document.addEventListener("mouseup", dragEnd, false);
  document.addEventListener("mousemove", drag, false);

  // Separate toggle click from drag
  let dragThreshold = 5;
  let startX, startY;

  toggle.addEventListener('mousedown', e => {
    startX = e.clientX;
    startY = e.clientY;
  });

  toggle.addEventListener('mouseup', e => {
    const diffX = Math.abs(e.clientX - startX);
    const diffY = Math.abs(e.clientY - startY);
    if (diffX < dragThreshold && diffY < dragThreshold) {
      toggleAIChat();
    }
  });
})();

function openReviewsModal() {
  const pName = selectedPhotographer.name;
  const pData = photographerReviews[pName] || photographerReviews['Nguyễn Minh Khoa'];
  
  // Update Overall Stats
  const overallRating = document.getElementById('modalOverallRating');
  const overallStars = document.getElementById('modalOverallStars');
  const reviewCount = document.getElementById('modalReviewCount');
  const container = document.getElementById('modalReviewList');
  
  if (overallRating) overallRating.textContent = pData.rating;
  if (overallStars) {
    let starsStr = '⭐'.repeat(Math.floor(pData.rating));
    if (pData.rating % 1 !== 0) starsStr += '⭐'; // Simplified for now
    overallStars.textContent = starsStr;
  }
  if (reviewCount) reviewCount.textContent = `Dựa trên ${pData.count} đánh giá`;
  
  // Update Review List
  if (container) {
    container.innerHTML = '';
    pData.reviews.forEach(r => {
      const reviewEl = document.createElement('div');
      reviewEl.className = 'review-item';
      reviewEl.style.cssText = 'padding: 15px; background: var(--bg3); border-radius: 8px;';
      
      let starsStr = '⭐'.repeat(Math.floor(r.stars));
      if (r.stars % 1 !== 0) starsStr += '⭐ (4.5)'; // Specific for 4.5
      
      reviewEl.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <strong style="font-size: 14px;">${r.user}</strong>
          <span style="color: #ffcc33;">${starsStr}</span>
        </div>
        <p style="margin: 0; font-size: 13px; line-height: 1.6; color: var(--text);">${r.text}</p>
      `;
      container.appendChild(reviewEl);
    });
  }
  
  openModal('reviewsModal');
}

let userRatingValue = 0;

function setRating(val) {
  userRatingValue = val;
  const stars = document.querySelectorAll('.star-input');
  stars.forEach((star, index) => {
    if (index < val) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
}

function submitUserReview() {
  const text = document.getElementById('userReviewText').value.trim();
  if (userRatingValue === 0) {
    alert('Vui lòng chọn số sao đánh giá!');
    return;
  }
  if (!text) {
    alert('Vui lòng nhập nội dung đánh giá!');
    return;
  }

  // Create review element
  const container = document.querySelector('#reviewsModal .modal-body > div:nth-child(2)'); // The review list container
  const reviewEl = document.createElement('div');
  reviewEl.className = 'review-item';
  reviewEl.style.cssText = 'padding: 15px; background: var(--bg3); border-radius: 8px; animation: slideDown 0.4s ease;';
  
  const starsStr = '⭐'.repeat(userRatingValue);
  
  reviewEl.innerHTML = `
    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
      <strong style="font-size: 14px;">Bạn (Khách hàng)</strong>
      <span style="color: #ffcc33;">${starsStr}</span>
    </div>
    <p style="margin: 0; font-size: 13px; line-height: 1.6; color: var(--text);">${text}</p>
  `;

  // Prepend to list
  container.prepend(reviewEl);

  // Success feedback
  toast_PP('✅ Đã gửi đánh giá!', 'Cảm ơn bạn đã chia sẻ trải nghiệm.', 'success');

  // Reset form
  document.getElementById('userReviewText').value = '';
  userRatingValue = 0;
  document.querySelectorAll('.star-input').forEach(s => s.classList.remove('active'));
}

// Add slideDown animation
const style = document.createElement('style');
style.innerHTML = `
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(style);
