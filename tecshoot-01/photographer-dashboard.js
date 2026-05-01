// ===== TAB NAVIGATION =====
document.querySelectorAll('.menu-item').forEach(item => {
  item.addEventListener('click', function() {
    const tabName = this.getAttribute('data-tab');
    
    // Remove active class from all menu items
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    this.classList.add('active');
    
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.remove('active');
    });
    
    // Show selected tab
    const tabId = tabName + '-tab';
    document.getElementById(tabId).classList.add('active');
  });
});

// ===== ORDER MANAGEMENT =====
function acceptOrder(orderId) {
  const card = event.target.closest('.order-card');
  const badgeEl = card.querySelector('.order-status');
  const footerButtons = card.querySelector('.order-footer');
  
  // Change status to accepted
  badgeEl.innerHTML = '✓ Đã Chấp Nhận';
  badgeEl.classList.remove('new');
  badgeEl.classList.add('accepted');
  
  // Update buttons
  footerButtons.innerHTML = `
    <button class="btn-secondary" onclick="viewOrderDetails(${orderId})">Xem Chi Tiết</button>
    <button class="btn-secondary" disabled>✓ Đã Chấp Nhận</button>
    <button class="btn-danger" onclick="rejectOrder(${orderId})">Hủy</button>
  `;
  
  showNotification('✓ Đơn hàng #' + orderId + ' đã được chấp nhận!', 'success');
}

function rejectOrder(orderId) {
  if (confirm('Bạn có chắc muốn từ chối đơn hàng này?')) {
    const card = event.target.closest('.order-card');
    const badgeEl = card.querySelector('.order-status');
    const footerButtons = card.querySelector('.order-footer');
    
    // Change status to rejected
    badgeEl.innerHTML = '✕ Từ Chối';
    badgeEl.classList.remove('new', 'accepted');
    badgeEl.classList.add('rejected');
    
    // Update buttons
    footerButtons.innerHTML = `
      <button class="btn-secondary" onclick="viewOrderDetails(${orderId})">Xem Chi Tiết</button>
      <button class="btn-primary" onclick="acceptOrder(${orderId})">✓ Chấp Nhận</button>
      <button class="btn-secondary" disabled>✕ Đã Từ Chối</button>
    `;
    
    showNotification('✕ Đơn hàng #' + orderId + ' đã bị từ chối', 'warning');
  }
}

function viewOrderDetails(orderId) {
  const modal = document.getElementById('orderModal');
  const modalBody = document.getElementById('orderModalBody');
  
  // Sample data - in real app, fetch from server
  const orderDetails = {
    1: {
      title: 'Ảnh Cá Nhân - Bộ Sưu Tập Mùa Hè',
      customer: 'Nguyễn Bảo Linh',
      phone: '0901234567',
      email: 'baolinhstudio@gmail.com',
      date: '15/05/2026',
      time: '14:00 - 16:00',
      location: 'Bờ hồ Hoan Kiếm, Hà Nội',
      services: ['Chụp 2 giờ', '100+ ảnh RAW', 'Retouching đầy đủ', 'Album in'],
      price: '5,000,000 VND',
      requirements: 'Mình muốn chụp close-up khuôn mặt nhiều nhất có thể. Nếu có thể, chụp khi nắng chiều vàng ấm cúng. Mình thích phong cách tự nhiên, không quá staged.'
    },
    2: {
      title: 'Ảnh Gia Đình',
      customer: 'Trần Minh Tuấn',
      phone: '0909876543',
      email: 'truanfamily@gmail.com',
      date: '18/05/2026',
      time: '10:00 - 13:00',
      location: 'Công viên Thống Nhất, Hà Nội',
      services: ['Chụp 3 giờ', '150+ ảnh', 'Retouching cơ bản'],
      price: '3,500,000 VND',
      requirements: 'Con bé 4 tuổi rất nghịch ngợm, mình muốn chụp những khoảnh khắc tự nhiên của gia đình. Có thể chụp nhiều cảnh ăn cơm, chơi với con?'
    },
    3: {
      title: 'Ảnh Sự Kiện - Tiệc Cưới',
      customer: 'Phạm Thanh Bình & Ngô Quỳnh Chi',
      phone: '0912345678',
      email: 'phambinh.wedding@gmail.com',
      date: '22/05/2026',
      time: '16:00 - 00:00 (8 giờ)',
      location: 'Nhà Hàng Lakeside, Hà Nội',
      services: ['Chụp toàn ngày (8h)', '500+ ảnh', 'Retouching đầy đủ', 'Album in cao cấp', 'Video highlight'],
      price: '20,000,000 VND',
      requirements: 'Chúng mình muốn chụp tất cả các khoảnh khắc quan trọng: lễ ăn hỏi, cô dâu chuẩn bị, lễ cưới, tiệc cưới, điệu nhảy đầu tiên. Có thể chuẩn bị drone để chụp toàn cảnh nhà hàng?'
    }
  };
  
  const order = orderDetails[orderId];
  
  modalBody.innerHTML = `
    <h3 style="margin-bottom: 16px; font-size: 16px; font-weight: 600;">${order.title}</h3>
    
    <div style="background: var(--bg3); padding: 16px; border-radius: 6px; margin-bottom: 16px;">
      <div style="display: grid; gap: 12px;">
        <div>
          <strong style="font-size: 12px; color: var(--muted);">KHÁCH HÀNG</strong>
          <div style="font-size: 15px; margin-top: 4px;">${order.customer}</div>
        </div>
        <div>
          <strong style="font-size: 12px; color: var(--muted);">LIÊN HỆ</strong>
          <div style="font-size: 14px; margin-top: 4px;">📞 ${order.phone}</div>
          <div style="font-size: 14px;">📧 ${order.email}</div>
        </div>
      </div>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
      <div style="background: rgba(243, 89, 0, 0.08); padding: 12px; border-radius: 6px;">
        <strong style="font-size: 12px; color: var(--muted);">NGÀY CHỤP</strong>
        <div style="font-size: 14px; margin-top: 4px; font-weight: 500;">${order.date}</div>
      </div>
      <div style="background: rgba(243, 89, 0, 0.08); padding: 12px; border-radius: 6px;">
        <strong style="font-size: 12px; color: var(--muted);">GIỜ CHỤP</strong>
        <div style="font-size: 14px; margin-top: 4px; font-weight: 500;">${order.time}</div>
      </div>
    </div>
    
    <div style="background: rgba(109, 118, 54, 0.08); padding: 12px; border-radius: 6px; margin-bottom: 16px;">
      <strong style="font-size: 12px; color: var(--muted);">ĐỊA ĐIỂM</strong>
      <div style="font-size: 14px; margin-top: 4px;">📍 ${order.location}</div>
    </div>
    
    <div style="margin-bottom: 16px;">
      <strong style="font-size: 12px; color: var(--muted);">GÓI DỊCH VỤ</strong>
      <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
        ${order.services.map(s => `<span style="background: var(--bg3); padding: 6px 12px; border-radius: 4px; font-size: 13px;">✓ ${s}</span>`).join('')}
      </div>
    </div>

    <div style="background: rgba(243, 89, 0, 0.1); border-left: 3px solid var(--persimmon); padding: 12px; border-radius: 4px; margin-bottom: 16px;">
      <strong style="font-size: 12px; color: var(--muted); display: block; margin-bottom: 8px;">📝 YÊU CẦU TỪ KHÁCH HÀNG</strong>
      <div style="font-size: 14px; line-height: 1.6; color: var(--text);">"${order.requirements}"</div>
    </div>
    
    <div style="background: rgba(76, 175, 80, 0.12); padding: 12px; border-radius: 6px; border-left: 3px solid var(--success);">
      <strong style="font-size: 12px; color: var(--muted);">GIÁ DỊCH VỤ</strong>
      <div style="font-size: 16px; margin-top: 4px; font-weight: 600; color: var(--success);">${order.price}</div>
    </div>
  `;
  
  modal.classList.add('open');
}

// ===== CALENDAR NAVIGATION =====
document.querySelectorAll('.btn-nav').forEach(btn => {
  btn.addEventListener('click', function() {
    const direction = this.textContent.includes('Sau') ? 1 : -1;
    showNotification('💡 Lưu ý: Lịch chụp phải nằm trong giờ hành chính (8:00 - 18:00).');
  });
});

// ===== CALENDAR VALIDATION =====
function validateCalendarSlot(date, time) {
  // Parse time (format: HH:00)
  const [hours, minutes] = time.split(':').map(Number);
  
  // Check working hours (8:00 - 18:00)
  if (hours < 8 || hours >= 18) {
    showNotification('⚠️ Giờ chụp phải nằm trong giờ hành chính (8:00 - 18:00)', 'warning');
    return false;
  }
  
  
  return true;
}

// ===== CHECKLIST INTERACTION =====
document.querySelectorAll('.checklist-item input[type="checkbox"]').forEach(checkbox => {
  checkbox.addEventListener('change', function() {
    updateChecklistProgress(this.closest('.checklist-card'));
  });
});

function updateChecklistProgress(card) {
  const total = card.querySelectorAll('.checklist-item').length;
  const completed = card.querySelectorAll('.checklist-item input[type="checkbox"]:checked').length;
  const percentage = Math.round((completed / total) * 100);
  
  card.querySelector('.progress-fill').style.width = percentage + '%';
  card.querySelector('.progress-text').textContent = completed + '/' + total + ' hoàn thành';
}

// ===== FILE UPLOAD =====
function triggerUpload() {
  document.getElementById('fileInput').click();
}

document.getElementById('fileInput').addEventListener('change', function(e) {
  const files = e.target.files;
  const fileCount = files.length;
  showNotification(`Đã chọn ${fileCount} file. Hệ thống sẽ tải lên...`);
  
  // Simulate upload
  setTimeout(() => {
    showNotification('Upload thành công! Hệ thống đang thêm watermark...', 'success');
  }, 2000);
});

// ===== POST-PRODUCTION ACTIONS =====
function viewSelectedPhotos() {
  showNotification('Đang tải danh sách ảnh được chọn...');
  setTimeout(() => {
    alert('Danh sách 45 ảnh được chọn:\n\n1. IMG_0001.RAW\n2. IMG_0003.RAW\n3. IMG_0007.RAW\n...\n45. IMG_0145.RAW\n\nNhấp vào mỗi ảnh để xem chi tiết và bắt đầu retouching.');
  }, 1000);
}

function sendReminderToCustomer() {
  showNotification('Gửi nhắc nhở tới khách hàng...', 'info');
  setTimeout(() => {
    showNotification('Đã gửi email nhắc nhở! Khách sẽ nhận được thông báo.', 'success');
  }, 1500);
}

function uploadFinalPhotos() {
  showNotification('Đang chuẩn bị upload ảnh cuối...');
  
  // Simulate upload process
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 20;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      showNotification('Upload ảnh cuối thành công! Khách hàng sẽ nhận được thông báo.', 'success');
    }
  }, 800);
}

function downloadLink() {
  showNotification('Đang tạo link tải về...', 'info');
  setTimeout(() => {
    const link = 'https://tecshoot.com/download/ORD-2026-001-final';
    alert('Link tải về ảnh:\n\n' + link + '\n\nHạn tải: 30 ngày');
  }, 1000);
}

// ===== STORAGE MANAGEMENT =====
function deleteProject() {
  if (confirm('Bạn có chắc muốn xóa bộ ảnh này? Hành động không thể hoàn tác.')) {
    showNotification('Đang xóa bộ ảnh...', 'warning');
    setTimeout(() => {
      event.target.closest('.project-item').style.opacity = '0.5';
      showNotification('Bộ ảnh đã được xóa thành công!', 'success');
    }, 1500);
  }
}

// ===== MODAL MANAGEMENT =====
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('open');
}

// Close modal when clicking overlay
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', e => {
    if (e.target === modal) {
      modal.classList.remove('open');
    }
  });
});

// Close modal with Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.open').forEach(m => {
      m.classList.remove('open');
    });
  }
});

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : 'var(--persimmon)'};
    color: white;
    padding: 16px 24px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-size: 14px;
    z-index: 9999;
    animation: slideInRight 0.3s ease-out;
    max-width: 400px;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideOutRight {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100px);
    }
  }
`;
document.head.appendChild(style);

// ===== PAGE LOAD =====
document.addEventListener('DOMContentLoaded', () => {
  console.log('✓ Photographer Dashboard loaded successfully!');
  
  // Initialize all checklists
  document.querySelectorAll('.checklist-card').forEach(card => {
    updateChecklistProgress(card);
  });
  
  // Initialize messaging
  initializeMessaging();
  
  // Show welcome notification
  showNotification('👋 Chào mừng trở lại, Hiếu Thu Hải!', 'success');
});

// ===== MESSAGING =====
// Store conversations data
const conversationsData = {
  1: {
    name: 'Nguyễn Bảo Linh',
    order: '#ORD-2026-001',
    avatar: 'NB',
    messages: [
      { type: 'sent', text: 'Xin chào Bảo Linh! 👋 Mình đã nhận được yêu cầu của bạn', time: '10:30' },
      { type: 'received', text: 'Chào bạn! Rất hứng hứng cho buổi chụp', time: '10:45' },
      { type: 'received', text: 'Bạn có thể chụp gần hơn chút không, để focus vào khuôn mặt', time: '10:47' },
      { type: 'sent', text: 'Chắc chắn rồi! Mình sẽ chú ý vấn đề đó 📸', time: '11:00' },
      { type: 'received', text: 'Cảm ơn bạn! Tôi rất hài lòng với dịch vụ của bạn 😊', time: '11:15' }
    ]
  },
  2: {
    name: 'Trần Minh Tuấn',
    order: '#ORD-2026-002',
    avatar: 'TM',
    messages: [
      { type: 'received', text: 'Chào bạn! Mình là Trần Minh Tuấn', time: '09:00' },
      { type: 'received', text: 'Còn chỗ nào để chỉnh lại không?', time: '09:15' },
      { type: 'sent', text: 'Chắc chắn rồi! Bạn có thể ghi chi tiết cần sửa cho mình', time: '09:30' },
      { type: 'received', text: 'Cảm ơn bạn rất nhiều!', time: '09:45' }
    ]
  },
  3: {
    name: 'Phạm Thanh Bình',
    order: '#ORD-2026-003',
    avatar: 'PT',
    messages: [
      { type: 'received', text: 'Xin chào! Mình là Phạm Thanh Bình và vợ mình Quỳnh Chi', time: '08:00' },
      { type: 'received', text: 'Khi nào có ảnh thử?', time: '08:30' },
      { type: 'sent', text: 'Dạ! Mình đang retouching, sẽ gửi preview trong 2-3 ngày', time: '08:45' }
    ]
  }
};

let currentCustomerId = 1;

function initializeMessaging() {
  document.querySelectorAll('.conversation-item').forEach(item => {
    item.addEventListener('click', function() {
      const customerId = parseInt(this.getAttribute('data-customer'));
      switchConversation(customerId);
    });
  });
}

function switchConversation(customerId) {
  currentCustomerId = customerId;
  const data = conversationsData[customerId];
  
  // Update active state
  document.querySelectorAll('.conversation-item').forEach(item => {
    if (parseInt(item.getAttribute('data-customer')) === customerId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  // Update chat header
  const chatHeader = document.querySelector('.chat-header');
  chatHeader.innerHTML = `
    <div>
      <h3>${data.name}</h3>
      <p>Ảnh ${data.name === 'Nguyễn Bảo Linh' ? 'Cá Nhân' : data.name === 'Trần Minh Tuấn' ? 'Gia Đình' : 'Sự Kiện Cưới'} - ${data.order}</p>
    </div>
    <button class="btn-secondary" onclick="openOrderDetails(${customerId})">Xem Đơn</button>
  `;
  
  // Update messages
  const chatMessages = document.getElementById('chatMessages');
  chatMessages.innerHTML = '';
  
  data.messages.forEach(msg => {
    const messageGroup = document.createElement('div');
    messageGroup.className = `message-group ${msg.type}`;
    
    if (msg.type === 'received') {
      messageGroup.innerHTML = `
        <div class="message-avatar">${data.avatar}</div>
        <div class="message">
          <div class="message-text">${msg.text}</div>
          <div class="message-time">${msg.time}</div>
        </div>
      `;
    } else {
      messageGroup.innerHTML = `
        <div class="message">
          <div class="message-text">${msg.text}</div>
          <div class="message-time">${msg.time}</div>
        </div>
      `;
    }
    
    chatMessages.appendChild(messageGroup);
  });
  
  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage(messageType = 'sent') {
  const input = document.getElementById('messageInput');
  const message = input.value.trim();
  
  if (!message) {
    showNotification('⚠️ Vui lòng nhập tin nhắn', 'warning');
    return;
  }
  
  const chatMessages = document.getElementById('chatMessages');
  
  // Get current time
  const now = new Date();
  const time = (now.getHours() < 10 ? '0' : '') + now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
  
  // Add to data storage
  conversationsData[currentCustomerId].messages.push({
    type: messageType,
    text: message,
    time: time
  });
  
  // Add message to UI
  const messageGroup = document.createElement('div');
  messageGroup.className = `message-group ${messageType}`;
  
  if (messageType === 'received') {
    const data = conversationsData[currentCustomerId];
    messageGroup.innerHTML = `
      <div class="message-avatar">${data.avatar}</div>
      <div class="message">
        <div class="message-text">${escapeHtml(message)}</div>
        <div class="message-time">${time}</div>
      </div>
    `;
    showNotification('✓ Tin nhắn từ khách hàng đã được thêm', 'success');
  } else {
    messageGroup.innerHTML = `
      <div class="message">
        <div class="message-text">${escapeHtml(message)}</div>
        <div class="message-time">${time}</div>
      </div>
    `;
    showNotification('✓ Tin nhắn của bạn đã được gửi', 'success');
  }
  
  chatMessages.appendChild(messageGroup);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  input.value = '';
  input.focus();
  
  // Update conversation preview
  updateConversationPreviews();
}

// Allow sending message with Enter key
document.addEventListener('keydown', function(e) {
  const messageInput = document.getElementById('messageInput');
  
  if (e.key === 'Enter') {
    if (document.activeElement === messageInput) {
      e.preventDefault();
      sendMessage('sent');
    }
  }
});

function updateConversationPreviews() {
  document.querySelectorAll('.conversation-item').forEach(item => {
    const customerId = parseInt(item.getAttribute('data-customer'));
    const data = conversationsData[customerId];
    const lastMessage = data.messages[data.messages.length - 1];
    const preview = item.querySelector('.conversation-preview');
    
    if (lastMessage) {
      const previewText = lastMessage.text.length > 40 ? lastMessage.text.substring(0, 40) + '...' : lastMessage.text;
      preview.textContent = previewText;
    }
  });
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function openOrderDetails(orderId) {
  viewOrderDetails(orderId);
}

// ===== LOGOUT =====
document.querySelector('.btn-logout').addEventListener('click', () => {
  if (confirm('Bạn có chắc muốn đăng xuất?')) {
    showNotification('Đang đăng xuất...', 'warning');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  }
});
