// Admin Panel with Firebase Real-Time Sync - SRIDEVI HOME FOODS

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
let firebaseManager = null;
let isFirebaseAvailable = false;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Content Loaded - Admin Firebase starting...');
    initializeAdmin();
});

// Immediate test
console.log('📝 admin-firebase.js loaded successfully!');
alert('Admin Firebase JavaScript loaded!');

async function initializeAdmin() {
    console.log('🚀 Initializing Admin Panel with Firebase...');
    
    // Initialize Firebase
    firebaseManager = initializeFirebase();
    isFirebaseAvailable = firebaseManager !== null;
    
    if (isFirebaseAvailable) {
        console.log('✅ Firebase available - Using real-time sync');
        await initializeFirebaseData();
    } else {
        console.log('⚠️ Firebase not available - Using localStorage fallback');
        initializeLocalStorageData();
    }
    
    // Setup UI
    setupEventListeners();
    updateUI();
    setupRealtimeListeners();
    
    // Auto-login for simplicity (no Firebase auth)
    isLoggedIn = true;
    showSection('dashboard');
}

// Firebase Data Initialization
async function initializeFirebaseData() {
    try {
        // Initialize default data if collections are empty
        await initializeDefaultData();
        
        // Load all data
        await loadAllData();
        
        console.log('✅ Firebase data initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing Firebase data:', error);
        fallbackToLocalStorage();
    }
}

async function initializeDefaultData() {
    try {
        // Check if categories exist
        const existingCategories = await firebaseManager.getAllDocuments('categories');
        if (existingCategories.length === 0) {
            console.log('📝 Initializing default categories...');
            for (const category of defaultCategories) {
                await firebaseManager.createDocument('categories', category);
            }
        }
        
        // Check if products exist
        const existingProducts = await firebaseManager.getAllDocuments('products');
        if (existingProducts.length === 0) {
            console.log('📝 Initializing default products...');
            for (const [categoryId, categoryRecipes] of Object.entries(defaultRecipes)) {
                for (const recipe of categoryRecipes) {
                    await firebaseManager.createDocument('products', {
                        ...recipe,
                        categoryId: parseInt(categoryId)
                    });
                }
            }
        }
        
        // Check if payment methods exist
        const existingPaymentMethods = await firebaseManager.getAllDocuments('paymentMethods');
        if (existingPaymentMethods.length === 0) {
            console.log('📝 Initializing default payment methods...');
            for (const method of defaultPaymentMethods) {
                await firebaseManager.createDocument('paymentMethods', method);
            }
        }
        
    } catch (error) {
        console.error('❌ Error initializing default data:', error);
    }
}

async function loadAllData() {
    try {
        // Load categories
        categories = await firebaseManager.getAllDocuments('categories');
        
        // Load products
        const products = await firebaseManager.getAllDocuments('products');
        recipes = {};
        products.forEach(product => {
            if (!recipes[product.categoryId]) {
                recipes[product.categoryId] = [];
            }
            recipes[product.categoryId].push(product);
        });
        
        // Load orders
        orders = await firebaseManager.getAllDocuments('orders');
        
        // Load payment methods
        paymentMethods = await firebaseManager.getAllDocuments('paymentMethods');
        
        console.log('✅ All data loaded from Firebase');
    } catch (error) {
        console.error('❌ Error loading data from Firebase:', error);
        throw error;
    }
}

// LocalStorage Fallback
function initializeLocalStorageData() {
    categories = JSON.parse(localStorage.getItem('pindiCategories')) || defaultCategories;
    recipes = JSON.parse(localStorage.getItem('pindiRecipes')) || defaultRecipes;
    orders = JSON.parse(localStorage.getItem('pindiOrders')) || [];
    paymentMethods = JSON.parse(localStorage.getItem('pindiPaymentMethods')) || defaultPaymentMethods;
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
            recipes = {};
            data.forEach(product => {
                if (!recipes[product.categoryId]) {
                    recipes[product.categoryId] = [];
                }
                recipes[product.categoryId].push(product);
            });
            updateProductsUI();
            console.log('📱 Products updated in real-time');
        });
        
        // Listen for orders changes
        firebaseManager.onCollectionChange('orders', (data) => {
            orders = data;
            updateOrdersUI();
            console.log('📱 Orders updated in real-time');
        });
        
        // Listen for payment methods changes
        firebaseManager.onCollectionChange('paymentMethods', (data) => {
            paymentMethods = data;
            updatePaymentMethodsUI();
            console.log('📱 Payment methods updated in real-time');
        });
        
        console.log('✅ Real-time listeners setup complete');
    } catch (error) {
        console.error('❌ Error setting up real-time listeners:', error);
    }
}

// CRUD Operations with Firebase
async function saveCategory(category) {
    try {
        if (isFirebaseAvailable) {
            if (category.id) {
                await firebaseManager.updateDocument('categories', category.id.toString(), category);
            } else {
                await firebaseManager.createDocument('categories', category);
            }
        } else {
            // LocalStorage fallback
            if (category.id) {
                const index = categories.findIndex(c => c.id === category.id);
                if (index !== -1) {
                    categories[index] = category;
                }
            } else {
                category.id = Date.now();
                categories.push(category);
            }
            localStorage.setItem('pindiCategories', JSON.stringify(categories));
        }
        
        showNotification('Category saved successfully!', 'success');
    } catch (error) {
        console.error('❌ Error saving category:', error);
        showNotification('Error saving category', 'error');
    }
}

async function saveProduct(product) {
    try {
        if (isFirebaseAvailable) {
            if (product.id) {
                await firebaseManager.updateDocument('products', product.id.toString(), product);
            } else {
                await firebaseManager.createDocument('products', product);
            }
        } else {
            // LocalStorage fallback
            if (!recipes[product.categoryId]) {
                recipes[product.categoryId] = [];
            }
            
            if (product.id) {
                const index = recipes[product.categoryId].findIndex(p => p.id === product.id);
                if (index !== -1) {
                    recipes[product.categoryId][index] = product;
                }
            } else {
                product.id = Date.now();
                recipes[product.categoryId].push(product);
            }
            localStorage.setItem('pindiRecipes', JSON.stringify(recipes));
        }
        
        showNotification('Product saved successfully!', 'success');
    } catch (error) {
        console.error('❌ Error saving product:', error);
        showNotification('Error saving product', 'error');
    }
}

async function deleteCategory(categoryId) {
    try {
        if (isFirebaseAvailable) {
            await firebaseManager.deleteDocument('categories', categoryId.toString());
        } else {
            // LocalStorage fallback
            categories = categories.filter(c => c.id !== categoryId);
            localStorage.setItem('pindiCategories', JSON.stringify(categories));
        }
        
        showNotification('Category deleted successfully!', 'success');
    } catch (error) {
        console.error('❌ Error deleting category:', error);
        showNotification('Error deleting category', 'error');
    }
}

async function deleteProduct(productId, categoryId) {
    try {
        if (isFirebaseAvailable) {
            await firebaseManager.deleteDocument('products', productId.toString());
        } else {
            // LocalStorage fallback
            if (recipes[categoryId]) {
                recipes[categoryId] = recipes[categoryId].filter(p => p.id !== productId);
                localStorage.setItem('pindiRecipes', JSON.stringify(recipes));
            }
        }
        
        showNotification('Product deleted successfully!', 'success');
    } catch (error) {
        console.error('❌ Error deleting product:', error);
        showNotification('Error deleting product', 'error');
    }
}

// UI Update Functions
function updateUI() {
    updateCategoriesUI();
    updateProductsUI();
    updateOrdersUI();
    updatePaymentMethodsUI();
}

function updateCategoriesUI() {
    const tbody = document.getElementById('categoriesTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    categories.forEach(category => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${category.id}</td>
            <td>${category.name}</td>
            <td>${category.description}</td>
            <td>
                <button class="btn btn-small btn-primary" onclick="editCategory(${category.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-small btn-danger" onclick="deleteCategoryConfirm(${category.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
    });
}

function updateProductsUI() {
    const tbody = document.getElementById('productsTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    Object.keys(recipes).forEach(categoryId => {
        recipes[categoryId].forEach(product => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>₹${product.price}</td>
                <td>
                    <button class="btn btn-small btn-primary" onclick="editProduct(${product.id}, ${categoryId})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-small btn-danger" onclick="deleteProductConfirm(${product.id}, ${categoryId})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
        });
    });
}

function updateOrdersUI() {
    const tbody = document.getElementById('ordersTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    if (orders.length === 0) {
        const row = tbody.insertRow();
        row.innerHTML = '<td colspan="8" style="text-align: center;">No orders found</td>';
        return;
    }
    
    orders.forEach(order => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${order.customer?.name || 'N/A'}</td>
            <td>${order.customer?.phone || 'N/A'}</td>
            <td>₹${order.total || order.pricing?.total || '0'}</td>
            <td>${order.payment?.method || 'N/A'}</td>
            <td><span class="status-badge status-${order.status || 'pending'}">${order.status || 'pending'}</span></td>
            <td>${new Date(order.createdAt || order.date).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-small btn-primary" onclick="viewOrderDetails('${order.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn btn-small btn-success" onclick="updateOrderStatus('${order.id}', 'confirmed')">
                    <i class="fas fa-check"></i> Confirm
                </button>
            </td>
        `;
    });
}

function updatePaymentMethodsUI() {
    const tbody = document.getElementById('paymentMethodsTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    paymentMethods.forEach(method => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${method.id}</td>
            <td>${method.name}</td>
            <td>${method.type}</td>
            <td><span class="status-badge status-${method.status}">${method.status}</span></td>
            <td>
                <button class="btn btn-small btn-primary" onclick="editPaymentMethod(${method.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-small btn-${method.status === 'active' ? 'warning' : 'success'}" 
                        onclick="togglePaymentMethod(${method.id})">
                    <i class="fas fa-${method.status === 'active' ? 'pause' : 'play'}"></i> 
                    ${method.status === 'active' ? 'Disable' : 'Enable'}
                </button>
            </td>
        `;
    });
}

// Event Listeners
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Category form
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', handleCategorySubmit);
    }
    
    // Product form
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
    
    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            showSection(section);
        });
    });
}

// Form Handlers
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === adminCredentials.username && password === adminCredentials.password) {
        isLoggedIn = true;
        showSection('dashboard');
        showNotification('Login successful!', 'success');
    } else {
        showNotification('Invalid credentials', 'error');
    }
}

function handleCategorySubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const category = {
        name: formData.get('name'),
        description: formData.get('description')
    };
    
    const categoryId = document.getElementById('categoryId').value;
    if (categoryId) {
        category.id = parseInt(categoryId);
    }
    
    saveCategory(category);
    e.target.reset();
    document.getElementById('categoryId').value = '';
}

function handleProductSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const product = {
        name: formData.get('name'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        description: formData.get('description'),
        image: formData.get('image'),
        categoryId: parseInt(formData.get('categoryId'))
    };
    
    const productId = document.getElementById('productId').value;
    if (productId) {
        product.id = parseInt(productId);
    }
    
    saveProduct(product);
    e.target.reset();
    document.getElementById('productId').value = '';
}

// UI Functions
function showSection(sectionId) {
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    // Update navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });
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

// Edit/Delete Functions
function editCategory(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
        document.getElementById('categoryId').value = category.id;
        document.getElementById('name').value = category.name;
        document.getElementById('description').value = category.description;
        showSection('categories');
    }
}

function editProduct(productId, categoryId) {
    const product = recipes[categoryId].find(p => p.id === productId);
    if (product) {
        document.getElementById('productId').value = product.id;
        document.getElementById('name').value = product.name;
        document.getElementById('category').value = product.category;
        document.getElementById('price').value = product.price;
        document.getElementById('description').value = product.description;
        document.getElementById('image').value = product.image;
        document.getElementById('categoryId').value = product.categoryId;
        showSection('products');
    }
}

function deleteCategoryConfirm(categoryId) {
    if (confirm('Are you sure you want to delete this category?')) {
        deleteCategory(categoryId);
    }
}

function deleteProductConfirm(productId, categoryId) {
    if (confirm('Are you sure you want to delete this product?')) {
        deleteProduct(productId, categoryId);
    }
}

function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        alert(`Order Details:\n\nCustomer: ${order.customer?.name || 'N/A'}\nPhone: ${order.customer?.phone || 'N/A'}\nTotal: ₹${order.total || order.pricing?.total || '0'}\nStatus: ${order.status || 'pending'}`);
    }
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        if (isFirebaseAvailable) {
            await firebaseManager.updateDocument('orders', orderId, { status: newStatus });
        } else {
            // LocalStorage fallback
            const orderIndex = orders.findIndex(o => o.id === orderId);
            if (orderIndex !== -1) {
                orders[orderIndex].status = newStatus;
                localStorage.setItem('pindiOrders', JSON.stringify(orders));
            }
        }
        
        showNotification('Order status updated!', 'success');
    } catch (error) {
        console.error('❌ Error updating order status:', error);
        showNotification('Error updating order status', 'error');
    }
}

// Modal Functions
function openProductModal(productId = null, categoryId = null) {
    console.log('🔧 openProductModal called with:', { productId, categoryId });
    
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const modalTitle = document.getElementById('modalTitle');
    
    if (!modal) {
        console.error('❌ Product modal not found!');
        alert('Error: Product modal not found!');
        return;
    }
    
    console.log('✅ Product modal found:', modal);
    
    // Reset form
    form.reset();
    document.getElementById('productId').value = '';
    document.getElementById('categoryId').value = '';
    
    if (productId) {
        // Edit existing product
        modalTitle.textContent = 'Edit Product';
        
        // Find product
        let product = null;
        for (const [catId, catProducts] of Object.entries(recipes)) {
            const found = catProducts.find(p => p.id === productId);
            if (found) {
                product = found;
                document.getElementById('categoryId').value = catId;
                break;
            }
        }
        
        if (product) {
            document.getElementById('productId').value = product.id;
            document.getElementById('name').value = product.name;
            document.getElementById('category').value = product.category;
            document.getElementById('price').value = product.price;
            document.getElementById('description').value = product.description;
            document.getElementById('image').value = product.image || '';
        }
    } else {
        // Add new product
        modalTitle.textContent = 'Add Product';
        if (categoryId) {
            document.getElementById('categoryId').value = categoryId;
        }
    }
    
    modal.classList.add('show');
    console.log('✅ Modal should be visible now');
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('show');
}

// Show section function
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update navigation items
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick') === `showSection('${sectionId}')`) {
            link.classList.add('active');
        }
    });
}

// Save product function
function saveProduct() {
    const form = document.getElementById('productForm');
    const formData = new FormData(form);
    
    const product = {
        name: formData.get('name'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        description: formData.get('description'),
        image: formData.get('image'),
        categoryId: parseInt(document.getElementById('categoryId').value) || 1
    };
    
    const productId = document.getElementById('productId').value;
    if (productId) {
        product.id = parseInt(productId);
    }
    
    // Save product using Firebase
    if (typeof adminFirebase !== 'undefined' && adminFirebase.isFirebaseAvailable()) {
        adminFirebase.saveProduct(product);
    } else {
        // Fallback to localStorage
        console.log('Using localStorage fallback');
        // Add localStorage logic here
    }
    
    closeProductModal();
}

// Send payment receipt function
function sendPaymentReceipt() {
    const name = document.getElementById('receiptName').value;
    const phone = document.getElementById('receiptPhone').value;
    const details = document.getElementById('receiptDetails').value;
    const total = document.getElementById('receiptTotal').value;
    
    if (!name || !phone || !total) {
        alert('Please fill in all required fields');
        return;
    }
    
    const message = `Payment Receipt\n\nCustomer: ${name}\nPhone: ${phone}\nOrder Details: ${details}\nTotal: ₹${total}\n\nThank you for your order!`;
    
    const whatsappUrl = `https://wa.me/919866406807?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Clear form
    document.getElementById('receiptName').value = '';
    document.getElementById('receiptPhone').value = '';
    document.getElementById('receiptDetails').value = '';
    document.getElementById('receiptTotal').value = '';
}

// Test function for debugging
function testAddProduct() {
    console.log('🧪 Test Add Product button clicked!');
    alert('Test function called! Now trying to open modal...');
    openProductModal();
}

// Test function for debugging
function testOrderSave() {
    const testOrder = {
        id: 'TEST' + Date.now(),
        customer: {
            name: 'Test Customer',
            phone: '+91 98664 06807',
            email: 'test@example.com',
            address: '123 Test Street, Hyderabad, Pincode: 500001'
        },
        items: [
            { name: 'Sakinalu', quantity: 2, price: 150 },
            { name: 'Garelu', quantity: 1, price: 120 }
        ],
        total: 420,
        payment: { method: 'COD', status: 'pending' },
        status: 'pending',
        date: new Date().toISOString()
    };
    
    orders.push(testOrder);
    
    if (isFirebaseAvailable) {
        firebaseManager.createDocument('orders', testOrder);
    } else {
        localStorage.setItem('pindiOrders', JSON.stringify(orders));
    }
    
    updateOrdersUI();
    showNotification('Test order added successfully!', 'success');
}

// Cleanup
window.addEventListener('beforeunload', () => {
    if (firebaseManager) {
        firebaseManager.cleanup();
    }
});

// Export for global access
window.adminFirebase = {
    saveCategory,
    saveProduct,
    deleteCategory,
    deleteProduct,
    testOrderSave,
    updateOrderStatus,
    isFirebaseAvailable: () => isFirebaseAvailable
};
