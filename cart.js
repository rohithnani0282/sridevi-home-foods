// Cart Management System
class CartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('pindiCart')) || [];
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
        return this.calculateTotal();
    }

    calculateDelivery() {
        return this.calculateSubtotal() > 500 ? 0 : 40;
    }

    calculateGrandTotal() {
        return this.calculateSubtotal() + this.calculateDelivery();
    }

    saveCart() {
        localStorage.setItem('pindiCart', JSON.stringify(this.cart));
    }

    updateCartCount() {
        const count = this.cart.reduce((total, item) => total + item.quantity, 0);
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
                    <a href="index.html#recipes" class="back-to-shop">
                        <i class="fas fa-arrow-left"></i> Continue Shopping
                    </a>
                </div>
            `;
            return;
        }

        const cartItemsHTML = this.cart.map(item => `
            <div class="cart-item">
                <div class="item-image">
                    <i class="fas fa-utensils"></i>
                </div>
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">₹${item.price}</div>
                    <div class="item-quantity">
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="cartManager.updateQuantity(${item.id}, ${item.quantity - 1})">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity-value">${item.quantity}</span>
                            <button class="quantity-btn" onclick="cartManager.updateQuantity(${item.id}, ${item.quantity + 1})">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="item-total">₹${item.price * item.quantity}</div>
                    </div>
                </div>
                <button class="remove-item" onclick="cartManager.removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        const summaryHTML = `
            <div class="cart-summary">
                <h3 class="summary-title">Order Summary</h3>
                <div class="summary-row">
                    <span>Subtotal (${this.cart.length} items)</span>
                    <span>₹${this.calculateSubtotal()}</span>
                </div>
                <div class="summary-row">
                    <span>Delivery Fee</span>
                    <span>${this.calculateDelivery() === 0 ? 'FREE' : '₹' + this.calculateDelivery()}</span>
                </div>
                <div class="summary-row total">
                    <span>Total</span>
                    <span>₹${this.calculateGrandTotal()}</span>
                </div>
                <button class="checkout-btn" onclick="proceedToCheckout()">
                    <i class="fas fa-credit-card"></i> Proceed to Checkout
                </button>
                <a href="index.html#recipes" class="continue-shopping">
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
