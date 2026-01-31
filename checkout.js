// Checkout Management System
class CheckoutManager {
    constructor() {
        this.checkoutData = JSON.parse(localStorage.getItem('checkoutData')) || null;
        this.orders = JSON.parse(localStorage.getItem('pindiOrders')) || [];
        this.init();
    }

    init() {
        if (!this.checkoutData || this.checkoutData.items.length === 0) {
            window.location.href = 'cart.html';
            return;
        }

        this.setupEventListeners();
        this.renderOrderSummary();
        this.setupPaymentOptions();
        this.updateCartCount();
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

        // Payment option selection
        document.querySelectorAll('.payment-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.payment-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
                document.getElementById('paymentMethod').value = option.getAttribute('data-payment');
            });
        });

        // Form submission
        document.getElementById('checkoutForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.placeOrder();
        });
    }

    setupPaymentOptions() {
        // Select Cash on Delivery by default
        const codOption = document.querySelector('[data-payment="cod"]');
        if (codOption) {
            codOption.click();
        }
    }

    renderOrderSummary() {
        const orderItemsContainer = document.getElementById('orderItems');
        const itemsHTML = this.checkoutData.items.map(item => `
            <div class="order-item">
                <div>
                    <div class="item-name">${item.name}</div>
                    <div class="item-quantity">Qty: ${item.quantity}</div>
                </div>
                <div class="item-price">₹${item.price * item.quantity}</div>
            </div>
        `).join('');

        orderItemsContainer.innerHTML = itemsHTML;

        // Update totals
        document.getElementById('subtotal').textContent = `₹${this.checkoutData.subtotal}`;
        document.getElementById('deliveryFee').textContent = this.checkoutData.delivery === 0 ? 'FREE' : `₹${this.checkoutData.delivery}`;
        document.getElementById('total').textContent = `₹${this.checkoutData.total}`;
    }

    updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('pindiCart')) || [];
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        const cartCountElement = document.getElementById('cartCount');
        if (cartCountElement) {
            cartCountElement.textContent = count;
        }
    }

    validateForm() {
        const form = document.getElementById('checkoutForm');
        const formData = new FormData(form);
        
        // Check if all required fields are filled
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'pincode', 'paymentMethod'];
        
        for (const field of requiredFields) {
            if (!formData.get(field)) {
                this.showNotification(`Please fill in all required fields`, 'error');
                return false;
            }
        }

        // Validate email
        const email = formData.get('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return false;
        }

        // Validate phone
        const phone = formData.get('phone');
        const phoneRegex = /^[+]?[\d\s\-()]+$/;
        if (!phoneRegex.test(phone) || phone.length < 10) {
            this.showNotification('Please enter a valid phone number', 'error');
            return false;
        }

        // Validate pincode
        const pincode = formData.get('pincode');
        if (!/^\d{6}$/.test(pincode)) {
            this.showNotification('Please enter a valid 6-digit pincode', 'error');
            return false;
        }

        return true;
    }

    async placeOrder() {
        if (!this.validateForm()) {
            return;
        }

        const placeOrderBtn = document.getElementById('placeOrderBtn');
        placeOrderBtn.disabled = true;
        placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        const formData = new FormData(document.getElementById('checkoutForm'));
        
        const order = {
            id: 'ORD' + Date.now(),
            orderNumber: this.generateOrderNumber(),
            items: this.checkoutData.items,
            customer: {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                city: formData.get('city'),
                pincode: formData.get('pincode')
            },
            delivery: {
                time: formData.get('deliveryTime'),
                instructions: formData.get('orderNotes')
            },
            payment: {
                method: formData.get('paymentMethod'),
                status: formData.get('paymentMethod') === 'cod' ? 'pending' : 'paid'
            },
            pricing: {
                subtotal: this.checkoutData.subtotal,
                delivery: this.checkoutData.delivery,
                total: this.checkoutData.total
            },
            status: 'confirmed',
            createdAt: new Date().toISOString(),
            estimatedDelivery: this.calculateEstimatedDelivery(formData.get('deliveryTime'))
        };

        // Simulate order processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Save order
        this.orders.push(order);
        localStorage.setItem('pindiOrders', JSON.stringify(this.orders));

        // Clear cart
        localStorage.removeItem('pindiCart');
        localStorage.removeItem('checkoutData');

        // Show success message
        this.showNotification('Order placed successfully!', 'success');

        // Redirect to order confirmation
        setTimeout(() => {
            window.location.href = `order-confirmation.html?orderId=${order.id}`;
        }, 1000);
    }

    generateOrderNumber() {
        const date = new Date();
        const year = date.getFullYear().toString().slice(2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `PV${year}${month}${day}${random}`;
    }

    calculateEstimatedDelivery(deliveryTime) {
        const now = new Date();
        let estimatedTime = new Date(now);

        switch (deliveryTime) {
            case '30min':
                estimatedTime.setMinutes(estimatedTime.getMinutes() + 30);
                break;
            case '45min':
                estimatedTime.setMinutes(estimatedTime.getMinutes() + 45);
                break;
            case '1hour':
                estimatedTime.setHours(estimatedTime.getHours() + 1);
                break;
            case '2hour':
                estimatedTime.setHours(estimatedTime.getHours() + 2);
                break;
            default:
                estimatedTime.setMinutes(estimatedTime.getMinutes() + 45);
        }

        return estimatedTime;
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
}

// Initialize checkout manager
const checkoutManager = new CheckoutManager();

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
