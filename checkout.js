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

        // Save order
        this.orders.push(order);
        localStorage.setItem('pindiOrders', JSON.stringify(this.orders));

        // Clear cart
        localStorage.removeItem('pindiCart');
        localStorage.removeItem('checkoutData');

        // Create WhatsApp message with order details
        const fullName = `${order.customer.firstName} ${order.customer.lastName}`;
        const fullAddress = `${order.customer.address}, ${order.customer.city}, Pincode: ${order.customer.pincode}`;
        
        // Create order items list
        const orderItemsList = order.items.map(item => 
            `${item.name} x ${item.quantity} = ₹${item.price * item.quantity}`
        ).join('\n');
        
        const whatsappMessage = `🍽️ NEW ORDER - SRIDEVI HOME FOODS

📋 ORDER NUMBER: ${order.orderNumber}

👤 CUSTOMER DETAILS:
Name: ${fullName}
Phone: ${order.customer.phone}
Email: ${order.customer.email}
Address: ${fullAddress}

📦 ORDER ITEMS:
${orderItemsList}

💳 PAYMENT METHOD:
${order.payment.method.toUpperCase()}

💰 ORDER TOTAL:
Subtotal: ₹${order.pricing.subtotal}
Delivery: ₹${order.pricing.delivery}
Total: ₹${order.pricing.total}

🚚 DELIVERY:
Time: ${order.delivery.time}
Instructions: ${order.delivery.instructions || 'None'}

📅 Order Date: ${new Date().toLocaleString('en-IN')}
📅 Estimated Delivery: ${order.estimatedDelivery.toLocaleString('en-IN')}

Please confirm this order! 🙏
Call us at +91 98664 06807 for any queries.`;

        // Create WhatsApp URL
        const yourPhoneNumber = '+91 98664 06807';
        const cleanPhone = yourPhoneNumber.replace(/[^\d]/g, '');
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;

        console.log('📱 WhatsApp Order Details:');
        console.log('Order Number:', order.orderNumber);
        console.log('Customer:', fullName);
        console.log('Phone:', order.customer.phone);
        console.log('Total:', order.pricing.total);
        console.log('WhatsApp URL:', whatsappUrl);

        // Show success message
        this.showNotification('Redirecting to WhatsApp...', 'success');

        // Redirect to WhatsApp
        setTimeout(() => {
            this.openWhatsApp(whatsappUrl);
        }, 1000);
    }

    openWhatsApp(whatsappUrl) {
        // Use multiple methods for WhatsApp redirect
        try {
            console.log('📱 Method 1: Direct location redirect');
            window.location.href = whatsappUrl;
            
            // Fallback if direct redirect doesn't work
            setTimeout(() => {
                console.log('📱 Method 2: Link element click');
                const link = document.createElement('a');
                link.href = whatsappUrl;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
            }, 1000);
            
        } catch (error) {
            console.log('❌ Method 1 failed, trying window.open:', error.message);
            
            // Fallback to window.open
            try {
                console.log('📱 Method 3: window.open');
                window.open(whatsappUrl, '_blank');
                
            } catch (error2) {
                console.log('❌ All methods failed:', error2.message);
                
                // Final fallback - show URL for manual copy
                alert('Unable to open WhatsApp automatically. Please copy this URL and paste in your browser:\n\n' + whatsappUrl + '\n\nOr contact us directly at +91 98664 06807');
                
                // Also show the URL on screen
                const urlDiv = document.createElement('div');
                urlDiv.innerHTML = `
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #25d366;">
                        <h3 style="color: #25d366; margin-bottom: 10px;">📱 WhatsApp Order Link</h3>
                        <p style="margin-bottom: 10px;">Click this link to send your order via WhatsApp:</p>
                        <a href="${whatsappUrl}" target="_blank" style="color: #25d366; text-decoration: underline; font-weight: bold;">Click here to open WhatsApp</a>
                        <p style="margin-top: 10px; font-size: 12px; color: #666;">Or copy this URL: ${whatsappUrl}</p>
                    </div>
                `;
                document.querySelector('.checkout-container').appendChild(urlDiv);
            }
        }
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
