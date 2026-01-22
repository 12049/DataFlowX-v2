
let apiData = {};
let currentCategory = 'all';
let requestsCount = 0;

// Load API data
async function loadAPI() {
  try {
    const res = await fetch('https://blackwave-api.vercel.app/api/v2/auth/add-api/get-api');
    apiData = await res.json();
    
    updateStats();
    populateSections();
    displayAPIs();
    
    // Hide loading overlay with delay for better UX
    setTimeout(() => {
      document.getElementById('loadingOverlay').style.display = 'none';
      showNotification('API data loaded successfully!', 'success');
    }, 500);
    
  } catch (error) {
    console.error('Failed to load API:', error);
    document.getElementById('loadingOverlay').style.display = 'none';
    showNotification('Failed to load API data', 'error');
  }
}

// Update statistics
function updateStats() {
  let totalApis = 0;
  let activeApis = 0;
  let categories = Object.keys(apiData).length;
  
  for (const category in apiData) {
    totalApis += apiData[category].length;
    activeApis += apiData[category].filter(api => api.status === 'active').length;
  }
  
  document.getElementById('totalApis').textContent = totalApis;
  document.getElementById('activeApis').textContent = activeApis;
  document.getElementById('totalCategories').textContent = categories;
  document.getElementById('requestsCount').textContent = requestsCount;
}

// Populate sections dropdown
function populateSections() {
  const menu = document.getElementById('sectionsMenu');
  menu.innerHTML = '';
  
  // Add "All" section
  const allItem = document.createElement('div');
  allItem.className = `section-item ${currentCategory === 'all' ? 'active' : ''}`;
  allItem.textContent = '📁 All Sections';
  allItem.onclick = () => {
    filterAPIs('all');
    menu.classList.remove('active');
  };
  menu.appendChild(allItem);
  
  // Add category sections
  for (const category in apiData) {
    const item = document.createElement('div');
    item.className = `section-item ${currentCategory === category ? 'active' : ''}`;
    item.textContent = `📂 ${category.charAt(0).toUpperCase() + category.slice(1)}`;
    item.onclick = () => {
      filterAPIs(category);
      menu.classList.remove('active');
    };
    menu.appendChild(item);
  }
  
  // Toggle sections menu
  const toggle = document.getElementById('sectionsToggle');
  toggle.onclick = (e) => {
    e.stopPropagation();
    menu.classList.toggle('active');
  };
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !toggle.contains(e.target)) {
      menu.classList.remove('active');
    }
  });
}

// Display APIs based on current category
function displayAPIs() {
  const grid = document.getElementById('apiGrid');
  grid.innerHTML = '';
  
  let apisToShow = [];
  
  if (currentCategory === 'all') {
    for (const category in apiData) {
      apisToShow.push(...apiData[category].map(api => ({...api, category})));
    }
  } else if (apiData[currentCategory]) {
    apisToShow = apiData[currentCategory].map(api => ({...api, category: currentCategory}));
  }
  
  apisToShow.forEach((api, index) => {
    const card = createAPICard(api, index);
    grid.appendChild(card);
  });
  
  if (apisToShow.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
        <div style="font-size: 2rem; color: var(--muted); margin-bottom: 0.8rem;">
          <i class="fas fa-inbox"></i>
        </div>
        <div style="color: var(--muted); font-size: 0.9rem;">
          No APIs found in this category
        </div>
      </div>
    `;
  }
}

// Create API card
function createAPICard(api, index) {
  const card = document.createElement('div');
  card.className = 'api-card';
  card.innerHTML = `
    <div class="api-header">
      <div>
        <div class="api-title">
          <i class="fas fa-api" style="color: var(--accent);"></i>
          ${api.name}
          <span class="api-category">${api.category}</span>
        </div>
        <div style="font-size: 0.75rem; color: var(--muted); margin-top: 0.2rem;">
          ${api.endpoint}
        </div>
      </div>
      <div class="api-method">GET</div>
    </div>
    
    <div class="api-endpoint">${api.full}</div>
    
    <div class="api-details" id="details-${index}">
      <div class="query-info">
        <i class="fas fa-key" style="color: var(--accent);"></i>
        Query Parameter: <strong>${api.query}</strong>
      </div>
      
      <div class="query-input-container">
        <input type="text" 
               class="query-input" 
               id="query-${index}"
               placeholder="Enter ${api.query} value"
               oninput="updateFullAPI(${index})">
      </div>
      
      <div class="full-api-container">
        <div class="full-api" id="full-api-${index}">
          ${api.full}?${api.query}=
        </div>
        <button class="copy-btn" onclick="copyToClipboard('full-api-${index}', 'API URL')">
          <i class="fas fa-copy"></i>
        </button>
      </div>
      
      <div class="api-actions">
        <button class="action-btn run-btn" onclick="runAPI(${index})" id="run-btn-${index}">
          <i class="fas fa-play"></i> RUN API
        </button>
        <button class="action-btn copy-btn" onclick="copyToClipboard('full-api-${index}', 'API URL')">
          <i class="fas fa-copy"></i> COPY
        </button>
      </div>
      
      <div class="response-section">
        <div class="response-header">
          <div class="response-label">
            <i class="fas fa-terminal"></i>
            API Response
          </div>
          <div class="response-actions">
            <button class="response-action-btn" onclick="copyResponse(${index})">
              <i class="fas fa-copy"></i>
            </button>
            <button class="response-action-btn" onclick="viewInModal(${index})">
              <i class="fas fa-expand"></i>
            </button>
          </div>
        </div>
        <div class="response-terminal" id="response-${index}">
          <div style="color: var(--muted); font-style: italic;">
            // Response will appear here...
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add click handler to toggle details
  card.querySelector('.api-header').addEventListener('click', () => {
    const details = card.querySelector('.api-details');
    details.classList.toggle('expanded');
  });
  
  return card;
}

// Update full API URL when query input changes
function updateFullAPI(index) {
  const queryInput = document.getElementById(`query-${index}`);
  const fullApi = document.getElementById(`full-api-${index}`);
  const api = getApiByIndex(index);
  
  if (queryInput.value.trim()) {
    fullApi.textContent = `${api.full}?${api.query}=${encodeURIComponent(queryInput.value.trim())}`;
  } else {
    fullApi.textContent = `${api.full}?${api.query}=`;
  }
}

// Get API by index
function getApiByIndex(index) {
  let currentIndex = 0;
  for (const category in apiData) {
    const apis = currentCategory === 'all' ? apiData[category] : 
                 currentCategory === category ? apiData[category] : [];
    
    for (const api of apis) {
      if (currentIndex === index) {
        return {...api, category};
      }
      currentIndex++;
    }
  }
  return null;
}

// Run API
async function runAPI(index) {
  const api = getApiByIndex(index);
  const queryInput = document.getElementById(`query-${index}`);
  const responseDiv = document.getElementById(`response-${index}`);
  const runBtn = document.getElementById(`run-btn-${index}`);
  
  if (!queryInput.value.trim()) {
    showNotification('Please enter a query value', 'error');
    return;
  }
  
  const url = `${api.full}?${api.query}=${encodeURIComponent(queryInput.value.trim())}`;
  
  // Show loading
  runBtn.disabled = true;
  runBtn.innerHTML = '<div class="loader"></div> Running...';
  responseDiv.innerHTML = `
    <div style="color: var(--accent);">
      <i class="fas fa-spinner fa-spin"></i> Fetching API response...
    </div>
  `;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    requestsCount++;
    document.getElementById('requestsCount').textContent = requestsCount;
    
    // Format JSON with syntax highlighting
    const formattedJson = formatJSON(data);
    responseDiv.innerHTML = formattedJson;
    
    showNotification('API request successful!', 'success');
  } catch (error) {
    console.error('API Error:', error);
    responseDiv.innerHTML = `
      <div style="color: var(--danger);">
        <div style="margin-bottom: 5px;">
          <i class="fas fa-exclamation-triangle"></i> Error fetching API
        </div>
        <div style="color: var(--muted); font-size: 0.7em; margin-top: 5px;">
          ${error.message}
        </div>
      </div>
    `;
    showNotification('API request failed', 'error');
  } finally {
    runBtn.disabled = false;
    runBtn.innerHTML = '<i class="fas fa-play"></i> RUN API';
  }
}

// Format JSON with syntax highlighting
function formatJSON(obj) {
  const jsonString = JSON.stringify(obj, null, 2);
  return jsonString
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?)/g, (match) => {
      if (match.endsWith(':')) {
        return `<span class="json-key">${match}</span>`;
      } else if (match.startsWith('"')) {
        return `<span class="json-string">${match}</span>`;
      }
      return match;
    })
    .replace(/\b(true|false)\b/g, '<span class="json-boolean">$1</span>')
    .replace(/\b(null)\b/g, '<span class="json-null">$1</span>')
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="json-number">$1</span>');
}

// Copy to clipboard
function copyToClipboard(elementId, type = 'Text') {
  const element = document.getElementById(elementId);
  const text = element.textContent || element.innerText;
  
  navigator.clipboard.writeText(text).then(() => {
    showNotification(`${type} copied to clipboard!`, 'success');
  }).catch(err => {
    console.error('Failed to copy:', err);
    showNotification('Failed to copy to clipboard', 'error');
  });
}

// Copy response
function copyResponse(index) {
  const responseDiv = document.getElementById(`response-${index}`);
  const text = responseDiv.textContent;
  
  navigator.clipboard.writeText(text).then(() => {
    showNotification('Response copied to clipboard!', 'success');
  }).catch(err => {
    console.error('Failed to copy:', err);
    showNotification('Failed to copy response', 'error');
  });
}

// View in modal
function viewInModal(index) {
  const responseDiv = document.getElementById(`response-${index}`);
  const modal = document.getElementById('responseModal');
  const modalResponse = document.getElementById('modalResponse');
  
  modalResponse.innerHTML = responseDiv.innerHTML;
  modal.style.display = 'flex';
}

// Filter APIs by category
function filterAPIs(category) {
  currentCategory = category;
  displayAPIs();
  populateSections();
  
  showNotification(`Showing ${category === 'all' ? 'all' : category} APIs`, 'info');
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Logout
document.getElementById('logoutBtn').onclick = () => {
  window.location.href = 'https://blackwave-api.vercel.app/';
};

// Close modal
document.getElementById('closeModal').onclick = () => {
  document.getElementById('responseModal').style.display = 'none';
};

// Close modal on outside click
document.getElementById('responseModal').onclick = (e) => {
  if (e.target === document.getElementById('responseModal')) {
    document.getElementById('responseModal').style.display = 'none';
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Show loading overlay immediately
  document.getElementById('loadingOverlay').style.display = 'flex';
  
  // Load API data after a short delay for better UX
  setTimeout(() => {
    loadAPI();
  }, 800);
});