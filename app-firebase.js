// Customer-Facing App with Firebase Real-Time Sync - SRIDEVI HOME FOODS

// Initialize Firebase
let firebaseManager = null;
let isFirebaseAvailable = false;
let categories = [];
let products = [];
let cart = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    console.log('🚀 Initializing Customer App with Firebase...');
    
    // Initialize Firebase
    firebaseManager = initializeFirebase();
    isFirebaseAvailable = firebaseManager !== null;
    
    if (isFirebaseAvailable) {
        console.log('✅ Firebase available - Using real-time data');
        await initializeFirebaseData();
    } else {
        console.log('⚠️ Firebase not available - Using localStorage fallback');
        initializeLocalStorageData();
    }
    
    // Setup UI
    setupEventListeners();
    updateUI();
    setupRealtimeListeners();
}

// Firebase Data Initialization
async function initializeFirebaseData() {
    try {
        // Load all data
        await loadAllData();
        console.log('✅ Firebase data loaded successfully');
    } catch (error) {
        console.error('❌ Error loading Firebase data:', error);
        fallbackToLocalStorage();
    }
}

async function loadAllData() {
    try {
        // Load categories
        categories = await firebaseManager.getAllDocuments('categories');
        
        // Load products
        products = await firebaseManager.getAllDocuments('products');
        
        // Load cart from localStorage (cart is still local for now)
        cart = JSON.parse(localStorage.getItem('pindiCart')) || [];
        
        console.log('✅ All data loaded from Firebase');
    } catch (error) {
        console.error('❌ Error loading data from Firebase:', error);
        throw error;
    }
}

// LocalStorage Fallback
function initializeLocalStorageData() {
    categories = JSON.parse(localStorage.getItem('pindiCategories')) || [
        { id: 1, name: 'Pindi Vantalu', description: 'Traditional Andhra snacks' },
        { id: 2, name: 'Pickles', description: 'Homemade pickles' },
        { id: 3, name: 'Sweets', description: 'Traditional sweets' },
        { id: 4, name: 'Podi', description: 'Spice powders' }
    ];
    
    products = JSON.parse(localStorage.getItem('pindiProducts')) || [
        { id: 1, name: 'Sakinalu', category: 'Pindi Vantalu', price: 150, description: 'Traditional rice flour snack', categoryId: 1 },
        { id: 2, name: 'Garelu', category: 'Pindi Vantalu', price: 120, description: 'Crispy lentil fritters', categoryId: 1 },
        { id: 3, name: 'Mango Pickle', category: 'Pickles', price: 200, description: 'Spicy raw mango pickle', categoryId: 2 },
        { id: 4, name: 'Laddu', category: 'Sweets', price: 250, description: 'Traditional sweet balls', categoryId: 3 }
    ];
    
    cart = JSON.parse(localStorage.getItem('pindiCart')) || [];
    console.log('✅ LocalStorage data initialized');
}

function fallbackToLocalStorage() {
    console.log('⚠️ Falling back to LocalStorage');
    isFirebaseAvailable = false;
    initializeLocalStorageData();
}

// Real-time Listeners
function setupRealtimeListeners() {
    if (!isFirebaseAvailable) return;
    
    try {
        // Listen for categories changes
        firebaseManager.onCollectionChange('categories', (data) => {
            categories = data;
            updateCategoriesUI();
            console.log('📱 Categories updated in real-time');
        });
        
        // Listen for products changes
        firebaseManager.onCollectionChange('products', (data) => {
            products = data;
            updateProductsUI();
            console.log('📱 Products updated in real-time');
        });
        
        console.log('✅ Real-time listeners setup complete');
    } catch (error) {
        console.error('❌ Error setting up real-time listeners:', error);
    }
}

// UI Update Functions
function updateUI() {
    updateCategoriesUI();
    updateProductsUI();
    updateCartUI();
}

function updateCategoriesUI() {
    const categoriesContainer = document.getElementById('categories');
    if (!categoriesContainer) return;
    
    categoriesContainer.innerHTML = '';
    categories.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.innerHTML = `
            <div class="category-icon">
                <i class="fas fa-${getCategoryIcon(category.name)}"></i>
            </div>
            <h3>${category.name}</h3>
            <p>${category.description}</p>
            <button class="btn btn-primary" onclick="showCategoryProducts(${category.id})">
                View Products
            </button>
        `;
        categoriesContainer.appendChild(categoryCard);
    });
}

function updateProductsUI() {
    const productsContainer = document.getElementById('products');
    if (!productsContainer) return;
    
    productsContainer.innerHTML = '';
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image || 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(product.name)}" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-price">₹${product.price}</div>
                <button class="btn btn-primary" onclick="addToCart(${product.id})">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        `;
        productsContainer.appendChild(productCard);
    });
}

function updateCartUI() {
    const cartContainer = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartContainer) return;
    
    cartContainer.innerHTML = '';
    let total = 0;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Your cart is empty</p>';
    } else {
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>₹${item.price} x ${item.quantity}</p>
                </div>
                <div class="cart-item-actions">
                    <button class="btn btn-sm" onclick="updateCartItemQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button class="btn btn-sm" onclick="updateCartItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    <button class="btn btn-sm btn-danger" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            cartContainer.appendChild(cartItem);
            total += item.price * item.quantity;
        });
    }
    
    if (cartCount) cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartTotal) cartTotal.textContent = `₹${total}`;
}

// Cart Functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartUI();
    showNotification(`${product.name} added to cart!`, 'success');
}

function updateCartItemQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        saveCart();
        updateCartUI();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    showNotification('Item removed from cart', 'info');
}

function saveCart() {
    localStorage.setItem('pindiCart', JSON.stringify(cart));
}

// Utility Functions
function getCategoryIcon(categoryName) {
    const icons = {
        'Pindi Vantalu': 'utensils',
        'Pickles': 'lemon',
        'Sweets': 'cookie-bite',
        'Podi': 'mortar-pestle'
    };
    return icons[categoryName] || 'food';
}

function showCategoryProducts(categoryId) {
    const categoryProducts = products.filter(p => p.categoryId === categoryId);
    const productsContainer = document.getElementById('products');
    
    if (productsContainer) {
        productsContainer.innerHTML = '';
        categoryProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image || 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(product.name)}" alt="${product.name}">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="product-price">₹${product.price}</div>
                    <button class="btn btn-primary" onclick="addToCart(${product.id})">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            `;
            productsContainer.appendChild(productCard);
        });
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Event Listeners
function setupEventListeners() {
    // Cart toggle
    const cartToggle = document.getElementById('cartToggle');
    const cartSidebar = document.getElementById('cartSidebar');
    
    if (cartToggle && cartSidebar) {
        cartToggle.addEventListener('click', () => {
            cartSidebar.classList.toggle('open');
        });
    }
    
    // Close cart
    const closeCart = document.getElementById('closeCart');
    if (closeCart) {
        closeCart.addEventListener('click', () => {
            cartSidebar.classList.remove('open');
        });
    }
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showNotification('Your cart is empty!', 'error');
                return;
            }
            
            // Save cart data for checkout
            const checkoutData = {
                items: cart,
                subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                delivery: 50,
                total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 50
            };
            
            localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
            window.location.href = 'checkout.html';
        });
    }
}

// Export for global access
window.appFirebase = {
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    showCategoryProducts,
    isFirebaseAvailable: () => isFirebaseAvailable
};
