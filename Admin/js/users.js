const apiUrl = "https://blackwave-api.vercel.app/api/v2/admin/users";
const usersGrid = document.getElementById("usersGrid");
const userModal = document.getElementById("userModal");
const closeModal = document.getElementById("closeModal");
const saveUserBtn = document.getElementById("saveUserBtn");
const cancelUserBtn = document.getElementById("cancelUserBtn");
const addUserBtn = document.getElementById("addUserBtn");
const backToHome = document.getElementById("backToHome");
const modalTitle = document.getElementById("modalTitle");
const searchInput = document.getElementById("searchInput");
const roleFilter = document.getElementById("roleFilter");
const sortSelect = document.getElementById("sortSelect");

const modalUsername = document.getElementById("modalUsername");
const modalEmail = document.getElementById("modalEmail");
const modalPhone = document.getElementById("modalPhone");
const modalRole = document.getElementById("modalRole");

// Stats elements
const totalUsers = document.getElementById("totalUsers");
const activeUsers = document.getElementById("activeUsers");
const adminCount = document.getElementById("adminCount");
const userCount = document.getElementById("userCount");

const loaderOverlay = document.getElementById("loaderOverlay");

let users = [];
let currentUserId = null;
let isEditing = false;

// Format phone number with country code
function formatPhoneNumber(phone) {
  if (!phone) return 'Not provided';
  
  // Remove any existing country code and non-digit characters
  let cleanPhone = phone.replace(/\D/g, '');
  
  // If phone starts with 20 (Egypt country code without +), remove it
  if (cleanPhone.startsWith('20')) {
    cleanPhone = cleanPhone.substring(2);
  }
  
  // Format as Egyptian number: (+20) XXX XXX XXXX
  if (cleanPhone.length === 10) {
    return `(+20) ${cleanPhone.substring(0, 3)} ${cleanPhone.substring(3, 6)} ${cleanPhone.substring(6)}`;
  } else if (cleanPhone.length === 9) {
    return `(+20) ${cleanPhone.substring(0, 2)} ${cleanPhone.substring(2, 5)} ${cleanPhone.substring(5)}`;
  }
  
  // Return as is if not standard length
  return `(+20) ${cleanPhone}`;
}

// Get initials from username
function getInitials(username) {
  return username
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

// Get role icon
function getRoleIcon(role) {
  switch(role) {
    case 'admin': return 'fas fa-shield-alt';
    case 'owner': return 'fas fa-crown';
    case 'developer': return 'fas fa-code';
    default: return 'fas fa-user';
  }
}

// Create user card HTML
function createUserCard(user, index) {
  const formattedPhone = formatPhoneNumber(user.phone);
  
  return `
    <div class="user-card" data-id="${user.id}" style="animation-delay: ${index * 0.1}s">
      <div class="user-header">
        <div class="user-avatar">
          ${getInitials(user.username)}
        </div>
        <div class="user-info">
          <div class="user-name">${user.username}</div>
          <div class="user-role">
            <i class="${getRoleIcon(user.role)}"></i>
            ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </div>
        </div>
      </div>
      
      <div class="user-details">
        <div class="detail-item">
          <div class="detail-icon">
            <i class="fas fa-envelope"></i>
          </div>
          <div class="detail-content">
            <div class="detail-label">Email</div>
            <div class="detail-value">${user.email}</div>
          </div>
        </div>
        
        <div class="detail-item">
          <div class="detail-icon">
            <i class="fas fa-phone"></i>
          </div>
          <div class="detail-content">
            <div class="detail-label">Phone</div>
            <div class="detail-value">
              <span class="phone-number">${formattedPhone}</span>
            </div>
          </div>
        </div>
        
        <div class="detail-item">
          <div class="detail-icon">
            <i class="fas fa-id-card"></i>
          </div>
          <div class="detail-content">
            <div class="detail-label">User ID</div>
            <div class="detail-value">${user.id.substring(0, 8)}...</div>
          </div>
        </div>
      </div>
      
      <div class="user-actions">
        <button class="action-btn edit-btn" onclick="editUser('${user.id}')">
          <i class="fas fa-edit"></i>
          Edit
        </button>
        <button class="action-btn delete-btn" onclick="deleteUser('${user.id}', '${user.username}')">
          <i class="fas fa-trash"></i>
          Delete
        </button>
      </div>
    </div>
  `;
}

// Update statistics
function updateStatistics() {
  totalUsers.textContent = users.length;
  
  const admins = users.filter(u => u.role === 'admin').length;
  const regularUsers = users.filter(u => u.role === 'user').length;
  
  adminCount.textContent = admins;
  userCount.textContent = regularUsers;
  
  // Simulate active users (random between 1 and total users)
  const activeCount = Math.min(users.length, Math.floor(Math.random() * users.length) + 1);
  activeUsers.textContent = activeCount;
}

// Filter and sort users
function filterAndSortUsers() {
  const searchTerm = searchInput.value.toLowerCase();
  const roleFilterValue = roleFilter.value;
  const sortValue = sortSelect.value;
  
  let filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      (user.phone && user.phone.includes(searchTerm)) ||
      user.role.toLowerCase().includes(searchTerm);
    
    const matchesRole = roleFilterValue === 'all' || user.role === roleFilterValue;
    
    return matchesSearch && matchesRole;
  });
  
  // Sort users
  filteredUsers.sort((a, b) => {
    switch(sortValue) {
      case 'name_asc':
        return a.username.localeCompare(b.username);
      case 'name_desc':
        return b.username.localeCompare(a.username);
      case 'role':
        return a.role.localeCompare(b.role);
      case 'newest':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case 'oldest':
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      default:
        return 0;
    }
  });
  
  // Display users
  if (filteredUsers.length === 0) {
    usersGrid.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">
          <i class="fas fa-user-slash"></i>
        </div>
        <h3>No Users Found</h3>
        <p>No users match your search criteria. Try adjusting your filters or search term.</p>
      </div>
    `;
  } else {
    usersGrid.innerHTML = filteredUsers.map((user, index) => createUserCard(user, index)).join('');
  }
  
  updateStatistics();
}

// Load users from API
async function loadUsers() {
  try {
    loaderOverlay.style.display = 'flex';
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    users = data.users || [];
    
    // Add timestamps for sorting if not present
    users.forEach((user, index) => {
      if (!user.createdAt) {
        user.createdAt = new Date(Date.now() - index * 86400000).toISOString();
      }
    });
    
    // Simulate loading delay
    setTimeout(() => {
      filterAndSortUsers();
      loaderOverlay.style.display = 'none';
    }, 1500);
    
  } catch (error) {
    console.error('Error loading users:', error);
    loaderOverlay.style.display = 'none';
    
    usersGrid.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3>Connection Error</h3>
        <p>Unable to load users. Please check your connection and try again.</p>
        <button onclick="loadUsers()" class="add-user-btn" style="margin-top: 20px;">
          <i class="fas fa-redo"></i>
          Retry
        </button>
      </div>
    `;
  }
}

// Edit user
async function editUser(userId) {
  const user = users.find(u => u.id === userId);
  if (!user) return;
  
  currentUserId = userId;
  isEditing = true;
  modalTitle.innerHTML = `<i class="fas fa-user-edit"></i> Edit User`;
  
  modalUsername.value = user.username;
  modalEmail.value = user.email;
  
  // Extract phone number without country code
  let phoneValue = user.phone || '';
  if (phoneValue.includes('+20')) {
    phoneValue = phoneValue.replace('+20', '').replace(/\D/g, '');
  }
  modalPhone.value = phoneValue;
  
  modalRole.value = user.role;
  
  userModal.classList.add('active');
}

// Delete user
async function deleteUser(userId, username) {
  if (!confirm(`Are you sure you want to delete "${username}"?\nThis action cannot be undone.`)) {
    return;
  }
  
  try {
    const response = await fetch(`${apiUrl}/${userId}`, {
      method: 'DELETE',
    });
    
    if (response.ok) {
      showNotification('User deleted successfully!', 'success');
      loadUsers();
    } else {
      throw new Error('Delete failed');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    showNotification('Error deleting user', 'error');
  }
}

// Add new user
addUserBtn.onclick = () => {
  currentUserId = null;
  isEditing = false;
  modalTitle.innerHTML = `<i class="fas fa-user-plus"></i> Add New User`;
  
  modalUsername.value = '';
  modalEmail.value = '';
  modalPhone.value = '';
  modalRole.value = 'user';
  
  userModal.classList.add('active');
};

// Close modal
closeModal.onclick = cancelUserBtn.onclick = () => {
  userModal.classList.remove('active');
};

// Save user
saveUserBtn.onclick = async () => {
  const username = modalUsername.value.trim();
  const email = modalEmail.value.trim();
  const phone = modalPhone.value.trim();
  const role = modalRole.value;
  
  // Validation
  if (!username || !email) {
    showNotification('Username and email are required!', 'error');
    return;
  }
  
  // Format phone with country code
  const formattedPhone = phone ? `+20${phone.replace(/\D/g, '')}` : '';
  
  const userData = {
    username,
    email,
    phone: formattedPhone,
    role
  };
  
  try {
    if (isEditing && currentUserId) {
      // Update existing user
      await fetch(`${apiUrl}/${currentUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      showNotification('User updated successfully!', 'success');
    } else {
      // Create new user
      userData.password = 'DefaultPassword123!';
      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      showNotification('User created successfully!', 'success');
    }
    
    userModal.classList.remove('active');
    loadUsers();
  } catch (error) {
    console.error('Error saving user:', error);
    showNotification('Error saving user', 'error');
  }
};

// Back to home
backToHome.onclick = () => {
  // Change this to your actual home page URL
  window.location.href = '/index.html';
};

// Notification system
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    <span>${message}</span>
  `;
  
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 30px;
    background: ${type === 'success' ? 'var(--success)' : 'var(--danger)'};
    color: white;
    padding: 15px 25px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 10000;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
  
  // Add keyframes for animation
  if (!document.querySelector('#notificationStyles')) {
    const style = document.createElement('style');
    style.id = 'notificationStyles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

// Event listeners
searchInput.addEventListener('input', filterAndSortUsers);
roleFilter.addEventListener('change', filterAndSortUsers);
sortSelect.addEventListener('change', filterAndSortUsers);

// Close modal on ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && userModal.classList.contains('active')) {
    userModal.classList.remove('active');
  }
});

// Prevent modal close on background click
userModal.addEventListener('click', (e) => {
  if (e.target === userModal) {
    userModal.classList.remove('active');
  }
});

// Initial load
loadUsers();

// Add phone input validation
modalPhone.addEventListener('input', function(e) {
  // Remove non-numeric characters
  this.value = this.value.replace(/\D/g, '');
  
  // Limit to 10 digits
  if (this.value.length > 10) {
    this.value = this.value.substring(0, 10);
  }
});