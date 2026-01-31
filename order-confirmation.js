// Order Confirmation Management
class OrderConfirmationManager {
    constructor() {
        this.orderId = this.getOrderIdFromUrl();
        this.orders = JSON.parse(localStorage.getItem('pindiOrders')) || [];
        this.init();
    }

    init() {
        if (!this.orderId) {
            window.location.href = 'index.html';
            return;
        }

        this.loadOrderDetails();
        this.updateCartCount();
        this.setupEventListeners();
    }

    getOrderIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('orderId');
    }

    loadOrderDetails() {
        const order = this.orders.find(o => o.id === this.orderId);
        
        if (!order) {
            this.showNotification('Order not found', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }

        this.displayOrderDetails(order);
    }

    displayOrderDetails(order) {
        // Update order number
        document.getElementById('orderNumber').textContent = `Order #${order.orderNumber}`;
        
        // Update customer details
        document.getElementById('customerName').textContent = `${order.customer.firstName} ${order.customer.lastName}`;
        document.getElementById('customerPhone').textContent = order.customer.phone;
        
        // Update payment method
        const paymentText = order.payment.method === 'cod' ? 'Cash on Delivery' : 'Online Payment';
        document.getElementById('paymentMethod').textContent = paymentText;
        
        // Update total amount
        document.getElementById('totalAmount').textContent = `₹${order.pricing.total}`;
        
        // Update order items
        const orderItemsContainer = document.getElementById('orderItems');
        const itemsHTML = order.items.map(item => `
            <div class="order-item">
                <div>
                    <div class="item-name">${item.name}</div>
                    <div class="item-quantity">Qty: ${item.quantity}</div>
                </div>
                <div class="item-price">₹${item.price * item.quantity}</div>
            </div>
        `).join('');
        orderItemsContainer.innerHTML = itemsHTML;
        
        // Update estimated delivery
        const deliveryDate = new Date(order.estimatedDelivery);
        const deliveryOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        document.getElementById('estimatedDelivery').textContent = deliveryDate.toLocaleDateString('en-IN', deliveryOptions);
    }

    updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('pindiCart')) || [];
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        const cartCountElement = document.getElementById('cartCount');
        if (cartCountElement) {
            cartCountElement.textContent = count;
        }
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

// Initialize order confirmation manager
const orderConfirmationManager = new OrderConfirmationManager();

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
