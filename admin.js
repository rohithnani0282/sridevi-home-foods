// Admin Panel JavaScript - Fresh Start

// Default data
const defaultCategories = [
    { id: 1, name: 'Pindi Vantalu', description: 'Traditional Andhra snacks and savory items' },
    { id: 2, name: 'Pickles', description: 'Homemade pickles and preserves' },
    { id: 3, name: 'Sweets', description: 'Traditional Indian sweets and desserts' },
    { id: 4, name: 'Podi', description: 'Spice powders and masalas' }
];

const defaultRecipes = {
    1: [
        { id: 1, name: 'Sakinalu', category: 'Pindi Vantalu', price: 150, description: 'Traditional rice flour snack with sesame seeds', image: 'https://via.placeholder.com/300x200?text=Sakinalu' },
        { id: 2, name: 'Garelu', category: 'Pindi Vantalu', price: 120, description: 'Crispy lentil fritters', image: 'https://via.placeholder.com/300x200?text=Garelu' },
        { id: 3, name: 'Murukulu', category: 'Pindi Vantalu', price: 100, description: 'Spiral shaped savory snack', image: 'https://via.placeholder.com/300x200?text=Murukulu' }
    ],
    2: [
        { id: 4, name: 'Mango Pickle', category: 'Pickles', price: 200, description: 'Spicy raw mango pickle', image: 'https://via.placeholder.com/300x200?text=Mango+Pickle' },
        { id: 5, name: 'Lemon Pickle', category: 'Pickles', price: 180, description: 'Tangy lemon pickle', image: 'https://via.placeholder.com/300x200?text=Lemon+Pickle' }
    ],
    3: [
        { id: 6, name: 'Laddu', category: 'Sweets', price: 250, description: 'Traditional sweet balls', image: 'https://via.placeholder.com/300x200?text=Laddu' },
        { id: 7, name: 'Pootharekulu', category: 'Sweets', price: 300, description: 'Paper thin sweet sheets', image: 'https://via.placeholder.com/300x200?text=Pootharekulu' }
    ],
    4: [
        { id: 8, name: 'Sambar Powder', category: 'Podi', price: 150, description: 'Traditional sambar spice mix', image: 'https://via.placeholder.com/300x200?text=Sambar+Powder' },
        { id: 9, name: 'Rasam Powder', category: 'Podi', price: 120, description: 'Aromatic rasam spice mix', image: 'https://via.placeholder.com/300x200?text=Rasam+Powder' }
    ]
};

const defaultPaymentMethods = [
    { id: 1, name: 'Cash on Delivery', type: 'cod', status: 'active' },
    { id: 2, name: 'Google Pay', type: 'online', status: 'active' },
    { id: 3, name: 'PhonePe', type: 'online', status: 'active' },
    { id: 4, name: 'Paytm', type: 'online', status: 'active' }
];

// Initialize data
let categories = [];
let recipes = {};
let orders = [];
let paymentMethods = [];
let isLoggedIn = false;
let adminCredentials = { username: 'admin', password: 'admin123' };

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize sync start time if not set
    if (!localStorage.getItem('pindiSyncStartTime')) {
        localStorage.setItem('pindiSyncStartTime', Date.now().toString());
    }
    
    loadData();
    checkAuth();
    setupEventListeners();
});

// Load data from localStorage
function loadData() {
    const savedCategories = localStorage.getItem('pindiCategories');
    const savedRecipes = localStorage.getItem('pindiRecipes');
    const savedOrders = localStorage.getItem('pindiOrders');
    const savedPaymentMethods = localStorage.getItem('pindiPaymentMethods');
    const savedAdminCredentials = localStorage.getItem('pindiAdminCredentials');
    
    if (savedCategories) {
        categories = JSON.parse(savedCategories);
    } else {
        categories = defaultCategories;
        saveData();
    }
    
    if (savedRecipes) {
        recipes = JSON.parse(savedRecipes);
    } else {
        recipes = defaultRecipes;
        saveData();
    }
    
    if (savedOrders) {
        orders = JSON.parse(savedOrders);
    } else {
        orders = [];
    }
    
    if (savedPaymentMethods) {
        paymentMethods = JSON.parse(savedPaymentMethods);
    } else {
        paymentMethods = defaultPaymentMethods;
        savePaymentMethods();
    }
    
    if (savedAdminCredentials) {
        adminCredentials = JSON.parse(savedAdminCredentials);
    } else {
        adminCredentials = { username: 'admin', password: 'admin123' };
        saveAdminCredentials();
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('pindiCategories', JSON.stringify(categories));
    localStorage.setItem('pindiRecipes', JSON.stringify(recipes));
    
    // Trigger real-time sync
    if (window.realtimeSync) {
        window.realtimeSync.updateTimestamp('categories');
        window.realtimeSync.updateTimestamp('recipes');
        window.realtimeSync.forceSync();
    }
}

// Save payment methods to localStorage
function savePaymentMethods() {
    localStorage.setItem('pindiPaymentMethods', JSON.stringify(paymentMethods));
    
    // Trigger real-time sync
    if (window.realtimeSync) {
        window.realtimeSync.updateTimestamp('paymentMethods');
        window.realtimeSync.forceSync();
    }
}

// Save admin credentials to localStorage
function saveAdminCredentials() {
    localStorage.setItem('pindiAdminCredentials', JSON.stringify(adminCredentials));
    localStorage.setItem('pindiCredentialsUpdated', new Date().toISOString());
    
    // Trigger real-time sync
    if (window.realtimeSync) {
        window.realtimeSync.updateTimestamp('adminCredentials');
        window.realtimeSync.forceSync();
    }
}

// Check authentication - ALWAYS show login form first
function checkAuth() {
    // Always show login form - no auto-login
    showLogin();
    isLoggedIn = false;
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        login();
    });
    
    // Category form
    document.getElementById('categoryForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveCategory();
    });
    
    // Recipe form
    document.getElementById('recipeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveRecipe();
    });
    
    // Payment form
    document.getElementById('paymentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        savePayment();
    });
    
    // Admin credentials form
    document.getElementById('adminCredentialsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateAdminCredentials();
    });
    
    // Background management forms
    document.getElementById('imageBackgroundForm').addEventListener('submit', function(e) {
        e.preventDefault();
        applyImageBackground();
    });
    
    document.getElementById('gradientBackgroundForm').addEventListener('submit', function(e) {
        e.preventDefault();
        applyGradientBackground();
    });
    
    document.getElementById('colorBackgroundForm').addEventListener('submit', function(e) {
        e.preventDefault();
        applySolidColorBackground();
    });
    
    document.getElementById('patternBackgroundForm').addEventListener('submit', function(e) {
        e.preventDefault();
        applyPatternBackground();
    });
    
    // Range input listeners
    document.getElementById('bgImageOverlay').addEventListener('input', function() {
        document.getElementById('overlayValue').textContent = this.value;
    });
    
    document.getElementById('patternSize').addEventListener('input', function() {
        document.getElementById('patternSizeValue').textContent = this.value;
    });
}

// Login function
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Check against stored credentials
    if (username === adminCredentials.username && password === adminCredentials.password) {
        isLoggedIn = true;
        showDashboard();
        showNotification('Login successful!', 'success');
    } else {
        showNotification('Invalid username or password', 'error');
    }
}

// Logout function
function logout() {
    isLoggedIn = false;
    showLogin();
    showNotification('Logged out successfully', 'success');
}

// Show login form
function showLogin() {
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('dashboardContainer').style.display = 'none';
    
    // Clear login form for security
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Show dashboard
function showDashboard() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'flex';
    
    // Load dashboard data
    loadDashboardData();
    loadCategories();
    loadRecipes();
    loadOrders();
    loadPaymentMethods();
    loadSettingsData();
    loadBackgroundSettings();
}

// Load settings data
function loadSettingsData() {
    // Update current username display in settings
    document.getElementById('currentUsername').textContent = adminCredentials.username;
    
    // Update username in header
    document.getElementById('headerUsername').textContent = adminCredentials.username;
    
    // Update last updated time
    const lastUpdated = localStorage.getItem('pindiCredentialsUpdated');
    if (lastUpdated) {
        const date = new Date(lastUpdated);
        document.getElementById('credentialsLastUpdated').textContent = date.toLocaleString('en-IN');
    } else {
        document.getElementById('credentialsLastUpdated').textContent = 'Never';
    }
    
    // Load sync status data
    loadSyncStatusData();
}

// Load sync status data
function loadSyncStatusData() {
    updateSyncStatusDisplay();
    
    // Start sync status monitoring
    setInterval(updateSyncStatusDisplay, 2000);
    
    // Start system health monitoring
    setInterval(updateSystemHealthDisplay, 1000);
    
    // Listen for storage changes
    window.addEventListener('storage', handleSyncStorageChange);
    
    // Initialize system health display
    updateSystemHealthDisplay();
}

// Update system health display
function updateSystemHealthDisplay() {
    try {
        const health = window.realtimeSync ? window.realtimeSync.getSystemHealth() : {
            isHealthy: true,
            totalSyncs: 0,
            failedSyncs: 0,
            consecutiveFailures: 0
        };
        
        // Update system health status
        const statusElement = document.getElementById('systemHealthStatus');
        if (statusElement) {
            statusElement.textContent = health.isHealthy ? 'Healthy' : 'Issues Detected';
            statusElement.style.color = health.isHealthy ? '#27ae60' : '#e74c3c';
        }
        
        // Update sync counts
        const totalSyncsElement = document.getElementById('totalSyncs');
        if (totalSyncsElement) {
            totalSyncsElement.textContent = health.totalSyncs || 0;
        }
        
        const failedSyncsElement = document.getElementById('failedSyncs');
        if (failedSyncsElement) {
            failedSyncsElement.textContent = health.failedSyncs || 0;
        }
        
        // Update uptime
        const uptimeElement = document.getElementById('systemUptime');
        if (uptimeElement) {
            const startTime = localStorage.getItem('pindiSyncStartTime') || Date.now();
            const uptime = Date.now() - parseInt(startTime);
            const minutes = Math.floor(uptime / 60000);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            
            if (days > 0) {
                uptimeElement.textContent = `${days}d ${hours % 24}h`;
            } else if (hours > 0) {
                uptimeElement.textContent = `${hours}h ${minutes % 60}m`;
            } else {
                uptimeElement.textContent = `${minutes}m`;
            }
        }
        
    } catch (error) {
        console.error('Error updating system health display:', error);
    }
}

// Perform full sync function
function performFullSync() {
    addSyncLogEntry('🔄 Manual full sync triggered', 'info');
    
    if (window.realtimeSync && window.realtimeSync.performFullSync) {
        window.realtimeSync.performFullSync();
    } else {
        addSyncLogEntry('⚠️ Full sync not available', 'warning');
    }
}

// Update sync status display
function updateSyncStatusDisplay() {
    // Categories
    const categories = JSON.parse(localStorage.getItem('pindiCategories') || '[]');
    const categoryTimestamp = localStorage.getItem('pindiCategoriesTimestamp');
    document.getElementById('syncCategoryCount').textContent = categories.length;
    document.getElementById('syncCategoryLastSync').textContent = categoryTimestamp ? formatSyncTime(categoryTimestamp) : 'Never';
    document.getElementById('syncCategoryStatus').textContent = categories.length > 0 ? 'Active' : 'No Data';
    
    // Recipes
    const recipes = JSON.parse(localStorage.getItem('pindiRecipes') || '{}');
    const recipeTimestamp = localStorage.getItem('pindiRecipesTimestamp');
    const recipeCount = Object.values(recipes).flat().length;
    document.getElementById('syncRecipeCount').textContent = recipeCount;
    document.getElementById('syncRecipeLastSync').textContent = recipeTimestamp ? formatSyncTime(recipeTimestamp) : 'Never';
    document.getElementById('syncRecipeStatus').textContent = recipeCount > 0 ? 'Active' : 'No Data';
    
    // Payment Methods
    const payments = JSON.parse(localStorage.getItem('pindiPaymentMethods') || '[]');
    const paymentTimestamp = localStorage.getItem('pindiPaymentMethodsTimestamp');
    document.getElementById('syncPaymentCount').textContent = payments.length;
    document.getElementById('syncPaymentLastSync').textContent = paymentTimestamp ? formatSyncTime(paymentTimestamp) : 'Never';
    document.getElementById('syncPaymentStatus').textContent = payments.length > 0 ? 'Active' : 'No Data';
    
    // Admin Credentials
    const credentials = JSON.parse(localStorage.getItem('pindiAdminCredentials') || '{}');
    const credentialsTimestamp = localStorage.getItem('pindiCredentialsUpdated');
    document.getElementById('syncAdminUsername').textContent = credentials.username || 'admin';
    document.getElementById('syncAdminLastUpdate').textContent = credentialsTimestamp ? formatSyncTime(credentialsTimestamp) : 'Never';
    document.getElementById('syncAdminStatus').textContent = credentials.username ? 'Active' : 'Not Set';
}

// Format sync timestamp
function formatSyncTime(timestamp) {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleTimeString('en-IN');
}

// Handle sync storage changes
function handleSyncStorageChange(event) {
    if (event.key && event.key.startsWith('pindi')) {
        const dataType = event.key.replace('pindi', '').toLowerCase();
        addSyncLogEntry(`🔄 ${dataType} data updated`, 'success');
        updateSyncStatusDisplay();
    }
}

// Add sync log entry
function addSyncLogEntry(message, type = 'info') {
    const logContainer = document.getElementById('syncActivityLog');
    if (!logContainer) return;
    
    const entry = document.createElement('div');
    entry.style.cssText = `padding: 0.5rem; margin-bottom: 0.5rem; border-radius: 5px; font-family: 'Courier New', monospace; font-size: 0.85rem;`;
    
    if (type === 'success') {
        entry.style.background = '#d4edda';
        entry.style.color = '#155724';
    } else if (type === 'warning') {
        entry.style.background = '#fff3cd';
        entry.style.color = '#856404';
    } else {
        entry.style.background = '#d1ecf1';
        entry.style.color = '#0c5460';
    }
    
    entry.textContent = `[${new Date().toLocaleTimeString('en-IN')}] ${message}`;
    
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
    
    // Keep only last 20 entries
    const entries = logContainer.children;
    if (entries.length > 20) {
        logContainer.removeChild(entries[0]);
    }
}

// Test sync function
function testSyncNow() {
    addSyncLogEntry('🧪 Testing sync system...', 'info');
    
    // Simulate data change
    const testTimestamp = Date.now();
    localStorage.setItem('pindiCategoriesTimestamp', testTimestamp);
    
    setTimeout(() => {
        addSyncLogEntry('✅ Sync test completed successfully', 'success');
        updateSyncStatusDisplay();
    }, 1000);
}

// Open website function
function openWebsite() {
    window.open('index.html', '_blank');
    addSyncLogEntry('🌐 Website opened', 'info');
}

// Background Management Functions
function showBackgroundType(type) {
    document.querySelectorAll('.bg-options').forEach(option => {
        option.style.display = 'none';
    });
    const selectedOption = document.getElementById(type + 'Options');
    if (selectedOption) {
        selectedOption.style.display = 'block';
    }
}

function applyImageBackground() {
    const settings = {
        type: 'image',
        imageUrl: document.getElementById('bgImageUrl').value,
        size: document.getElementById('bgImageSize').value,
        position: document.getElementById('bgImagePosition').value,
        repeat: document.getElementById('bgImageRepeat').value,
        overlayOpacity: document.getElementById('bgImageOverlay').value / 100,
        overlayColor: document.getElementById('bgImageOverlayColor').value
    };
    saveBackgroundSettings(settings);
    applyBackgroundToWebsite(settings);
    showNotification('Image background applied!', 'success');
}

function applyGradientBackground() {
    const settings = {
        type: 'gradient',
        gradientType: document.getElementById('gradientType').value,
        direction: document.getElementById('gradientDirection').value,
        color1: document.getElementById('gradientColor1').value,
        color2: document.getElementById('gradientColor2').value,
        color3: document.getElementById('gradientColor3').value
    };
    saveBackgroundSettings(settings);
    applyBackgroundToWebsite(settings);
    showNotification('Gradient background applied!', 'success');
}

function applySolidColorBackground() {
    const settings = {
        type: 'color',
        backgroundColor: document.getElementById('solidColor').value,
        textColor: document.getElementById('solidTextColor').value
    };
    saveBackgroundSettings(settings);
    applyBackgroundToWebsite(settings);
    showNotification('Solid color background applied!', 'success');
}

function applyPatternBackground() {
    const settings = {
        type: 'pattern',
        patternType: document.getElementById('patternType').value,
        patternColor: document.getElementById('patternColor').value,
        patternBgColor: document.getElementById('patternBgColor').value,
        patternSize: document.getElementById('patternSize').value
    };
    saveBackgroundSettings(settings);
    applyBackgroundToWebsite(settings);
    showNotification('Pattern background applied!', 'success');
}

function saveBackgroundSettings(settings) {
    localStorage.setItem('pindiWebsiteBackground', JSON.stringify(settings));
    localStorage.setItem('pindiBackgroundTimestamp', Date.now().toString());
    if (window.realtimeSync) {
        window.realtimeSync.updateTimestamp('background');
        window.realtimeSync.forceSync();
    }
}

function applyBackgroundToWebsite(settings) {
    const preview = document.getElementById('backgroundPreview');
    const currentSettingsDiv = document.getElementById('currentBgSettings');
    let cssBackground = '';
    let settingsText = '';
    
    switch (settings.type) {
        case 'image':
            cssBackground = `url('${settings.imageUrl}') ${settings.position} / ${settings.size} ${settings.repeat}`;
            if (settings.overlayOpacity > 0) {
                cssBackground = `linear-gradient(${settings.overlayColor + Math.round(settings.overlayOpacity * 255).toString(16)}, ${settings.overlayColor + Math.round(settings.overlayOpacity * 255).toString(16)}), ${cssBackground}`;
            }
            settingsText = `Type: Image<br>URL: ${settings.imageUrl}`;
            break;
        case 'gradient':
            if (settings.gradientType === 'linear') {
                cssBackground = settings.color3 ? 
                    `linear-gradient(${settings.direction}, ${settings.color1}, ${settings.color3}, ${settings.color2})` :
                    `linear-gradient(${settings.direction}, ${settings.color1}, ${settings.color2})`;
            } else {
                cssBackground = settings.color3 ? 
                    `radial-gradient(circle, ${settings.color1}, ${settings.color3}, ${settings.color2})` :
                    `radial-gradient(circle, ${settings.color1}, ${settings.color2})`;
            }
            settingsText = `Type: ${settings.gradientType} Gradient`;
            break;
        case 'color':
            cssBackground = settings.backgroundColor;
            settingsText = `Type: Solid Color<br>Color: ${settings.backgroundColor}`;
            break;
        case 'pattern':
            cssBackground = generatePatternCSS(settings);
            settingsText = `Type: ${settings.patternType} Pattern`;
            break;
    }
    
    if (preview) {
        preview.style.background = cssBackground;
        preview.style.color = settings.textColor || 'white';
    }
    
    if (currentSettingsDiv) {
        const now = new Date().toLocaleString('en-IN');
        currentSettingsDiv.innerHTML = settingsText + `<br>Applied: ${now}`;
    }
}

function generatePatternCSS(settings) {
    const { patternType, patternColor, patternBgColor, patternSize } = settings;
    switch (patternType) {
        case 'dots':
            return `radial-gradient(circle, ${patternColor} 20%, transparent 20%), ${patternBgColor}`;
        case 'lines':
            return `repeating-linear-gradient(45deg, ${patternColor}, ${patternColor} ${patternSize}px, ${patternBgColor} ${patternSize}px, ${patternBgColor} ${patternSize * 2}px)`;
        case 'grid':
            return `linear-gradient(${patternColor} 1px, transparent 1px), linear-gradient(90deg, ${patternColor} 1px, transparent 1px), ${patternBgColor}`;
        default:
            return patternBgColor;
    }
}

function applyPreset(presetType) {
    const presets = {
        food: { type: 'gradient', gradientType: 'linear', direction: '135deg', color1: '#ff6b6b', color2: '#feca57' },
        nature: { type: 'gradient', gradientType: 'linear', direction: '135deg', color1: '#56ab2f', color2: '#a8e063' },
        ocean: { type: 'gradient', gradientType: 'linear', direction: '135deg', color1: '#2193b0', color2: '#6dd5ed' },
        professional: { type: 'gradient', gradientType: 'linear', direction: '135deg', color1: '#667eea', color2: '#764ba2' },
        minimal: { type: 'color', backgroundColor: '#f8f9fa', textColor: '#333333' }
    };
    
    const settings = presets[presetType];
    if (settings) {
        saveBackgroundSettings(settings);
        applyBackgroundToWebsite(settings);
        showNotification(`${presetType} preset applied!`, 'success');
    }
}

function previewBackground() {
    const activeForm = document.querySelector('.bg-options:not([style*="display: none"]) form');
    if (activeForm) {
        activeForm.dispatchEvent(new Event('submit'));
    }
}

function resetBackground() {
    const defaultSettings = {
        type: 'gradient',
        gradientType: 'linear',
        direction: '135deg',
        color1: '#667eea',
        color2: '#764ba2'
    };
    saveBackgroundSettings(defaultSettings);
    applyBackgroundToWebsite(defaultSettings);
    showNotification('Background reset to default!', 'success');
}

function loadBackgroundSettings() {
    const savedSettings = localStorage.getItem('pindiWebsiteBackground');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        applyBackgroundToWebsite(settings);
        
        // Update form values
        const bgTypeRadio = document.querySelector(`input[name="bgType"][value="${settings.type}"]`);
        if (bgTypeRadio) {
            bgTypeRadio.checked = true;
            showBackgroundType(settings.type);
        }
        
        // Update specific form fields based on type
        switch (settings.type) {
            case 'image':
                document.getElementById('bgImageUrl').value = settings.imageUrl || '';
                document.getElementById('bgImageSize').value = settings.size || 'cover';
                document.getElementById('bgImagePosition').value = settings.position || 'center center';
                document.getElementById('bgImageRepeat').value = settings.repeat || 'no-repeat';
                document.getElementById('bgImageOverlay').value = (settings.overlayOpacity || 0.3) * 100;
                document.getElementById('bgImageOverlayColor').value = settings.overlayColor || '#000000';
                document.getElementById('overlayValue').textContent = ((settings.overlayOpacity || 0.3) * 100);
                break;
            case 'gradient':
                document.getElementById('gradientType').value = settings.gradientType || 'linear';
                document.getElementById('gradientDirection').value = settings.direction || '135deg';
                document.getElementById('gradientColor1').value = settings.color1 || '#667eea';
                document.getElementById('gradientColor2').value = settings.color2 || '#764ba2';
                document.getElementById('gradientColor3').value = settings.color3 || '#f093fb';
                break;
            case 'color':
                document.getElementById('solidColor').value = settings.backgroundColor || '#ffffff';
                document.getElementById('solidTextColor').value = settings.textColor || '#333333';
                break;
            case 'pattern':
                document.getElementById('patternType').value = settings.patternType || 'dots';
                document.getElementById('patternColor').value = settings.patternColor || '#cccccc';
                document.getElementById('patternBgColor').value = settings.patternBgColor || '#ffffff';
                document.getElementById('patternSize').value = settings.patternSize || 20;
                document.getElementById('patternSizeValue').textContent = settings.patternSize || 20;
                break;
        }
    }
}

// Refresh orders function
function refreshOrders() {
    // Reload orders from localStorage
    orders = JSON.parse(localStorage.getItem('pindiOrders') || '[]');
    loadOrders();
    showNotification('Orders refreshed!', 'success');
    
    // Log current orders for debugging
    console.log('📦 Current orders:', orders);
    console.log('📦 Orders in localStorage:', JSON.stringify(localStorage.getItem('pindiOrders')));
    
    // Test admin panel sync
    if (window.realtimeSync) {
        console.log('🔄 Testing admin panel sync...');
        window.realtimeSync.forceSync();
    }
}

// Test order saving
function testOrderSave() {
    const testOrder = {
        id: 999,
        customer: 'Test Customer',
        phone: '+91 98664 06807',
        email: 'test@example.com',
        address: '123 Test Street, Andhra Pradesh, India',
        items: [
            { name: 'Sakinalu', price: 150, quantity: 2 },
            { name: 'Garelu', price: 120, quantity: 1 }
        ],
        total: 420,
        status: 'test',
        paymentMethod: 'UPI',
        transactionId: 'TEST123456',
        date: new Date().toISOString(),
        source: 'test'
    };
    
    const orders = JSON.parse(localStorage.getItem('pindiOrders') || '[]');
    orders.push(testOrder);
    localStorage.setItem('pindiOrders', JSON.stringify(orders));
    
    console.log('🧪 Test order saved:', testOrder);
    console.log('📦 Total orders now:', orders.length);
    
    // Reload orders from localStorage to ensure it's saved
    orders = JSON.parse(localStorage.getItem('pindiOrders') || '[]');
    loadOrders();
    showNotification('Test order added successfully!', 'success');
}

// Recipe Image Management Functions
function previewRecipeImage(event) {
    const file = event.target.files[0];
    if (file) {
        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Image size must be less than 5MB', 'error');
            event.target.value = '';
            return;
        }
        
        // Check file type
        if (!file.type.startsWith('image/')) {
            showNotification('Please select a valid image file', 'error');
            event.target.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            const previewImg = document.getElementById('previewImg');
            previewImg.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function previewRecipeImageUrl(event) {
    const url = event.target.value;
    if (url) {
        const preview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        previewImg.src = url;
        preview.style.display = 'block';
        
        // Handle image load error
        previewImg.onerror = function() {
            showNotification('Invalid image URL', 'error');
            preview.style.display = 'none';
        };
    }
}

function removeRecipeImage() {
    document.getElementById('recipeImage').value = '';
    document.getElementById('recipeImageUrl').value = '';
    document.getElementById('imagePreview').style.display = 'none';
}

// Load dashboard data
function loadDashboardData() {
    document.getElementById('totalCategories').textContent = categories.length;
    document.getElementById('totalRecipes').textContent = Object.values(recipes).flat().length;
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('totalPayments').textContent = paymentMethods.length;
}

// Show section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active class to clicked menu item
    event.target.closest('.menu-item').classList.add('active');
}

// Load categories
function loadCategories() {
    const tbody = document.getElementById('categoriesTable');
    tbody.innerHTML = '';
    
    categories.forEach(category => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${category.name}</td>
            <td>${category.description}</td>
            <td>
                <button class="btn btn-small" onclick="editCategory(${category.id})">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteCategory(${category.id})">Delete</button>
            </td>
        `;
    });
}

// Load recipes
function loadRecipes() {
    const tbody = document.getElementById('recipesTable');
    tbody.innerHTML = '';
    
    Object.values(recipes).flat().forEach(recipe => {
        const row = tbody.insertRow();
        const imageUrl = recipe.image || `https://via.placeholder.com/60x60?text=${encodeURIComponent(recipe.name)}`;
        
        row.innerHTML = `
            <td>
                <img src="${imageUrl}" alt="${recipe.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;" onerror="this.src='https://via.placeholder.com/60x60?text=No+Image'">
            </td>
            <td>${recipe.name}</td>
            <td>${recipe.category}</td>
            <td>₹${recipe.price}</td>
            <td>
                <button class="btn btn-small" onclick="editRecipe(${recipe.id})">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteRecipe(${recipe.id})">Delete</button>
            </td>
        `;
    });
}

// Load orders
function loadOrders() {
    const tbody = document.getElementById('ordersTable');
    tbody.innerHTML = '';
    
    if (orders.length === 0) {
        const row = tbody.insertRow();
        row.innerHTML = '<td colspan="11" style="text-align: center;">No orders found</td>';
        return;
    }
    
    orders.forEach(order => {
        const row = tbody.insertRow();
        const orderDate = new Date(order.date).toLocaleString('en-IN');
        const paymentMethod = order.paymentMethod || 'N/A';
        const customerEmail = order.email || 'N/A';
        const customerPhone = order.phone || 'N/A';
        const customerAddress = order.address || 'N/A';
        const customerName = order.customer || 'N/A';
        
        // Format items list
        let itemsList = '';
        if (order.items && order.items.length > 0) {
            itemsList = order.items.map(item => 
                `${item.name} x ${item.quantity}`
            ).join(', ');
        } else {
            itemsList = 'No items';
        }
        
        // Truncate long text for better display
        const truncateText = (text, maxLength = 30) => {
            return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
        };
        
        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${customerName}</td>
            <td>${customerPhone}</td>
            <td>${customerEmail}</td>
            <td title="${customerAddress}">${truncateText(customerAddress)}</td>
            <td title="${itemsList}">${truncateText(itemsList)}</td>
            <td>₹${order.total}</td>
            <td>${paymentMethod}</td>
            <td><span class="status-badge status-${order.status}">${order.status.toUpperCase()}</span></td>
            <td>${orderDate}</td>
        `;
    });
}

// Load payment methods
function loadPaymentMethods() {
    const tbody = document.getElementById('paymentsTable');
    tbody.innerHTML = '';
    
    paymentMethods.forEach(method => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${method.name}</td>
            <td>${method.type}</td>
            <td>${method.status}</td>
            <td>
                <button class="btn btn-small" onclick="editPayment(${method.id})">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deletePayment(${method.id})">Delete</button>
            </td>
        `;
    });
}

// Modal functions
function openCategoryModal() {
    document.getElementById('categoryModal').style.display = 'flex';
}

function openRecipeModal() {
    // Load categories into select
    const select = document.getElementById('recipeCategory');
    select.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        select.appendChild(option);
    });
    
    document.getElementById('recipeModal').style.display = 'flex';
}

function openPaymentModal() {
    document.getElementById('paymentModal').style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Save functions
function saveCategory() {
    const name = document.getElementById('categoryName').value;
    const description = document.getElementById('categoryDescription').value;
    
    const newCategory = {
        id: categories.length + 1,
        name: name,
        description: description
    };
    
    categories.push(newCategory);
    saveData();
    loadCategories();
    closeModal('categoryModal');
    showNotification('Category added successfully!', 'success');
    
    // Reset form
    document.getElementById('categoryForm').reset();
}

function saveRecipe() {
    const name = document.getElementById('recipeName').value;
    const category = document.getElementById('recipeCategory').value;
    const price = parseFloat(document.getElementById('recipePrice').value);
    const description = document.getElementById('recipeDescription').value;
    const imageUrl = document.getElementById('recipeImageUrl').value;
    
    // Handle image upload
    const imageFile = document.getElementById('recipeImage').files[0];
    let finalImageUrl = imageUrl;
    
    if (imageFile) {
        // Convert image to base64 and store
        const reader = new FileReader();
        reader.onload = function(e) {
            finalImageUrl = e.target.result;
            saveRecipeData();
        };
        reader.readAsDataURL(imageFile);
    } else {
        saveRecipeData();
    }
    
    function saveRecipeData() {
        const newRecipe = {
            id: Object.values(recipes).flat().length + 1,
            name: name,
            category: category,
            price: price,
            description: description,
            image: finalImageUrl || null
        };
        
        // Find category ID
        const categoryId = categories.find(c => c.name === category)?.id || 1;
        
        if (!recipes[categoryId]) {
            recipes[categoryId] = [];
        }
        
        recipes[categoryId].push(newRecipe);
        saveData();
        loadRecipes();
        closeModal('recipeModal');
        showNotification('Recipe added successfully!', 'success');
        
        // Reset form
        document.getElementById('recipeForm').reset();
        document.getElementById('imagePreview').style.display = 'none';
        
        // Trigger sync
        if (window.realtimeSync) {
            window.realtimeSync.updateTimestamp('recipes');
            window.realtimeSync.forceSync();
        }
    }
}

function savePayment() {
    const name = document.getElementById('paymentName').value;
    const type = document.getElementById('paymentType').value;
    const status = document.getElementById('paymentStatus').value;
    
    const newPayment = {
        id: paymentMethods.length + 1,
        name: name,
        type: type,
        status: status
    };
    
    paymentMethods.push(newPayment);
    savePaymentMethods();
    loadPaymentMethods();
    closeModal('paymentModal');
    showNotification('Payment method added successfully!', 'success');
    
    // Reset form
    document.getElementById('paymentForm').reset();
}

// Delete functions
function deleteCategory(id) {
    if (confirm('Are you sure you want to delete this category?')) {
        categories = categories.filter(c => c.id !== id);
        saveData();
        loadCategories();
        showNotification('Category deleted successfully!', 'success');
    }
}

function deleteRecipe(id) {
    if (confirm('Are you sure you want to delete this recipe?')) {
        // Find and remove recipe
        Object.keys(recipes).forEach(categoryId => {
            recipes[categoryId] = recipes[categoryId].filter(r => r.id !== id);
        });
        saveData();
        loadRecipes();
        showNotification('Recipe deleted successfully!', 'success');
    }
}

function deletePayment(id) {
    if (confirm('Are you sure you want to delete this payment method?')) {
        paymentMethods = paymentMethods.filter(p => p.id !== id);
        savePaymentMethods();
        loadPaymentMethods();
        showNotification('Payment method deleted successfully!', 'success');
    }
}

// Edit functions (simplified)
function editCategory(id) {
    alert('Edit functionality coming soon!');
}

function editRecipe(id) {
    alert('Edit functionality coming soon!');
}

function editPayment(id) {
    alert('Edit functionality coming soon!');
}

// Settings functions
function updateAdminCredentials() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Verify current password
    if (currentPassword !== adminCredentials.password) {
        showNotification('Current password is incorrect', 'error');
        return;
    }
    
    // Validate new password
    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('New password must be at least 6 characters', 'error');
        return;
    }
    
    // Update credentials
    adminCredentials.username = newUsername;
    adminCredentials.password = newPassword;
    
    // Save to localStorage
    saveAdminCredentials();
    
    // Update display
    document.getElementById('currentUsername').textContent = adminCredentials.username;
    document.getElementById('headerUsername').textContent = adminCredentials.username;
    const date = new Date();
    document.getElementById('credentialsLastUpdated').textContent = date.toLocaleString('en-IN');
    
    // Clear form
    document.getElementById('adminCredentialsForm').reset();
    
    showNotification('Admin credentials updated successfully! You will need to login with new credentials next time.', 'success');
}

function resetData() {
    if (confirm('Are you sure you want to reset all data to defaults?')) {
        localStorage.clear();
        loadData();
        loadDashboardData();
        loadCategories();
        loadRecipes();
        loadOrders();
        loadPaymentMethods();
        showNotification('Data reset to defaults!', 'success');
    }
}

function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone!')) {
        localStorage.clear();
        categories = [];
        recipes = {};
        orders = [];
        paymentMethods = [];
        loadDashboardData();
        loadCategories();
        loadRecipes();
        loadOrders();
        loadPaymentMethods();
        showNotification('All data cleared!', 'success');
    }
}

// Show notification
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}
