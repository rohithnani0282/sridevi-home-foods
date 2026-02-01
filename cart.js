// Cart Management System
class CartManager {
    constructor() {
        console.log('🛒 CartManager constructor called');
        const savedCart = localStorage.getItem('srideviCart');
        console.log('📦 Raw cart data from localStorage:', savedCart);
        
        if (savedCart) {
            try {
                this.cart = JSON.parse(savedCart);
                console.log('✅ Cart loaded successfully:', this.cart);
            } catch (e) {
                console.error('❌ Error parsing cart data:', e);
                this.cart = [];
            }
        } else {
            console.log('📦 No cart data found in localStorage');
            this.cart = [];
        }
        this.init();
    }

    init() {
        this.updateCartCount();
        this.setupEventListeners();
        this.renderCart();
    }

    setupEventListeners() {
        // Mobile menu toggle
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        if (hamburger) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger?.classList.remove('active');
                navMenu?.classList.remove('active');
            });
        });
    }

    addToCart(recipeName, price) {
        const existingItem = this.cart.find(item => item.name === recipeName);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: Date.now(),
                name: recipeName,
                price: price,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateCartCount();
        this.showNotification(`${recipeName} added to cart!`, 'success');
        
        // Animate button
        event.target.classList.add('added');
        setTimeout(() => {
            event.target.classList.remove('added');
        }, 500);
    }

    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateCartCount();
        this.renderCart();
        this.showNotification('Item removed from cart', 'success');
    }

    updateQuantity(itemId, newQuantity) {
        const item = this.cart.find(item => item.id === itemId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeFromCart(itemId);
            } else {
                // Update both qty and quantity for compatibility
                item.qty = newQuantity;
                item.quantity = newQuantity;
                this.saveCart();
                this.renderCart();
            }
        }
    }

    calculateTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    calculateSubtotal() {
        return this.cart.reduce((total, item) => {
            const price = item.type === 'home' ? item.unitPrice : item.unitPrice;
            const quantity = item.qty || item.quantity;
            return total + (price * quantity);
        }, 0);
    }

    calculateDelivery() {
        return this.calculateSubtotal() > 500 ? 0 : 40;
    }

    calculateGrandTotal() {
        return this.calculateSubtotal() + this.calculateDelivery();
    }

    saveCart() {
        localStorage.setItem('srideviCart', JSON.stringify(this.cart));
    }

    updateCartCount() {
        const count = this.cart.reduce((total, item) => total + (item.qty || item.quantity), 0);
        const cartCountElements = document.querySelectorAll('#cartCount');
        cartCountElements.forEach(element => {
            element.textContent = count;
        });
    }

    renderCart() {
        const cartContent = document.getElementById('cartContent');
        
        if (this.cart.length === 0) {
            cartContent.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h2>Your cart is empty</h2>
                    <p>Looks like you haven't added any delicious items yet!</p>
                    <a href="index.html#menu" class="back-to-shop">
                        <i class="fas fa-arrow-left"></i> Continue Shopping
                    </a>
                </div>
            `;
            return;
        }

        const cartItemsHTML = this.cart.map(item => {
            // Handle both old and new data structures
            const price = item.type === 'home' ? item.unitPrice : item.unitPrice;
            const quantity = item.qty || item.quantity;
            const itemTotal = price * quantity;
            
            return `
            <div class="cart-item">
                <div class="item-image">
                    <i class="fas fa-utensils"></i>
                </div>
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">₹${price} ${item.type === 'home' ? '/kg' : '/jar'}</div>
                    <div class="item-quantity">
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="cartManager.updateQuantity('${item.id}', ${quantity - 1})">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity-value">${quantity}</span>
                            <button class="quantity-btn" onclick="cartManager.updateQuantity('${item.id}', ${quantity + 1})">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="item-total">₹${itemTotal}</div>
                    </div>
                </div>
                <button class="remove-item" onclick="cartManager.removeFromCart('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        }).join('');

        const subtotal = this.calculateSubtotal();
        const delivery = this.calculateDelivery();
        const total = this.calculateGrandTotal();
        
        const summaryHTML = `
            <div class="cart-summary">
                <h3 class="summary-title">Order Summary</h3>
                <div class="summary-row">
                    <span>Subtotal (${this.cart.length} items)</span>
                    <span>₹${subtotal}</span>
                </div>
                <div class="summary-row">
                    <span>Delivery Fee</span>
                    <span>${delivery === 0 ? 'FREE' : '₹' + delivery}</span>
                </div>
                <div class="summary-row total">
                    <span>Total</span>
                    <span>₹${total}</span>
                </div>
                <button class="checkout-btn" onclick="proceedToCheckout()">
                    <i class="fas fa-credit-card"></i> Proceed to Checkout
                </button>
                <a href="index.html#menu" class="continue-shopping">
                    <i class="fas fa-arrow-left"></i> Continue Shopping
                </a>
            </div>
        `;

        cartContent.innerHTML = `
            <div class="cart-items">
                ${cartItemsHTML}
            </div>
            ${summaryHTML}
        `;
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 3000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;
        
        if (type === 'success') {
            notification.style.background = '#27ae60';
        } else if (type === 'error') {
            notification.style.background = '#e74c3c';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartCount();
        this.renderCart();
    }
}

// Initialize cart manager
const cartManager = new CartManager();

// Add to cart functionality for main website
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners to "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const recipeName = this.getAttribute('data-recipe');
            const price = parseInt(this.getAttribute('data-price'));
            cartManager.addToCart(recipeName, price);
        });
    });
});

// Proceed to checkout function
function proceedToCheckout() {
    if (cartManager.cart.length === 0) {
        cartManager.showNotification('Your cart is empty!', 'error');
        return;
    }
    
    // Save cart data for checkout page
    localStorage.setItem('checkoutData', JSON.stringify({
        items: cartManager.cart,
        subtotal: cartManager.calculateSubtotal(),
        delivery: cartManager.calculateDelivery(),
        total: cartManager.calculateGrandTotal()
    }));
    
    // Redirect to checkout page
    window.location.href = 'checkout.html';
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Checkout functionality
document.addEventListener('DOMContentLoaded', function() {
    // Handle checkout form submission
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get cart data
            const cartData = JSON.parse(localStorage.getItem('srideviCart')) || [];
            if (cartData.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            
            // Get form data
            const formData = {
                customerName: document.getElementById('customerName').value,
                customerPhone: document.getElementById('customerPhone').value,
                customerAddress: document.getElementById('customerAddress').value,
                paymentMethod: document.getElementById('paymentMethod').value,
                orderNotes: document.getElementById('orderNotes').value,
                items: cartData,
                total: cartData.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0),
                date: new Date().toISOString().split('T')[0],
                status: 'pending'
            };
            
            // Get existing orders from localStorage
            const existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
            
            // Create new order
            const newOrder = {
                id: existingOrders.length > 0 ? Math.max(...existingOrders.map(o => o.id)) + 1 : 1,
                ...formData
            };
            
            // Add to orders
            existingOrders.push(newOrder);
            
            // Save to localStorage
            localStorage.setItem('orders', JSON.stringify(existingOrders));
            
            // Clear cart
            localStorage.removeItem('srideviCart');
            cartManager.cart = [];
            cartManager.updateCartCount();
            cartManager.renderCart();
            
            // Show success message
            alert('Order placed successfully! Your order ID is #' + newOrder.id + '. We will contact you soon.');
            
            // Redirect to thank you page or back to main site
            window.location.href = 'index.html';
        });
    }
    
    // Add event listeners to "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const recipeName = this.getAttribute('data-recipe');
            const price = parseInt(this.getAttribute('data-price'));
            cartManager.addToCart(recipeName, price);
        });
    });
});
