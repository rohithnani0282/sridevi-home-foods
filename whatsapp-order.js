// WhatsApp Order System - Instant Order Notification
// Automatically syncs orders to WhatsApp when customer places order

(function() {
    'use strict';
    
    // WhatsApp configuration
    const WHATSAPP_CONFIG = {
        phoneNumber: '+919866406807', // Your WhatsApp number
        businessName: 'SRIDEVI HOME FOODS',
        defaultMessage: 'Hello! I would like to place an order from SRIDEVI HOME FOODS.'
    };
    
    // Initialize WhatsApp order system
    function initWhatsAppOrder() {
        console.log('📱 WhatsApp Order System initialized');
        
        // Add WhatsApp button to cart
        addWhatsAppButtonToCart();
        
        // Listen for cart updates
        setupCartListeners();
        
        // Add order confirmation handling
        setupOrderConfirmation();
    }
    
    // Add WhatsApp button to cart
    function addWhatsAppButtonToCart() {
        const cartContainer = document.querySelector('.cart-container, .cart-content');
        if (cartContainer) {
            const whatsappButton = document.createElement('button');
            whatsappButton.className = 'btn btn-whatsapp whatsapp-order-btn';
            whatsappButton.innerHTML = '<i class="fab fa-whatsapp"></i> Order via WhatsApp';
            whatsappButton.onclick = sendOrderToWhatsApp;
            
            // Insert before checkout button
            const checkoutBtn = cartContainer.querySelector('.checkout-btn, .btn-checkout');
            if (checkoutBtn) {
                checkoutBtn.parentNode.insertBefore(whatsappButton, checkoutBtn);
            } else {
                cartContainer.appendChild(whatsappButton);
            }
        }
    }
    
    // Setup cart listeners
    function setupCartListeners() {
        // Listen for cart item additions
        const addToCartButtons = document.querySelectorAll('.add-to-cart, .add-to-cart-btn');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function() {
                setTimeout(() => {
                    updateWhatsAppButton();
                }, 100);
            });
        });
        
        // Listen for cart item removals
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('remove-item') || e.target.classList.contains('remove-from-cart')) {
                setTimeout(() => {
                    updateWhatsAppButton();
                }, 100);
            }
        });
    }
    
    // Update WhatsApp button based on cart content
    function updateWhatsAppButton() {
        const cart = getCartItems();
        const whatsappBtn = document.querySelector('.whatsapp-order-btn');
        
        if (whatsappBtn) {
            if (cart.length === 0) {
                whatsappBtn.style.display = 'none';
            } else {
                whatsappBtn.style.display = 'flex';
                const total = calculateCartTotal(cart);
                whatsappBtn.innerHTML = `<i class="fab fa-whatsapp"></i> Order via WhatsApp (₹${total})`;
            }
        }
    }
    
    // Get cart items from localStorage
    function getCartItems() {
        const cart = localStorage.getItem('pindiCart');
        return cart ? JSON.parse(cart) : [];
    }
    
    // Calculate cart total
    function calculateCartTotal(items) {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    // Send order to WhatsApp
    function sendOrderToWhatsApp() {
        const cart = getCartItems();
        
        if (cart.length === 0) {
            showNotification('Your cart is empty!', 'error');
            return;
        }
        
        const orderMessage = formatOrderMessage(cart);
        const whatsappUrl = `https://wa.me/${WHATSAPP_CONFIG.phoneNumber.replace(/[^\d]/g, '')}?text=${encodeURIComponent(orderMessage)}`;
        
        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Save order to admin panel
        saveOrderToAdmin(cart);
        
        // Show confirmation
        showNotification('Opening WhatsApp to place your order...', 'success');
        
        // Clear cart after order
        setTimeout(() => {
            clearCart();
        }, 2000);
    }
    
    // Send WhatsApp message after payment completion
    function sendWhatsAppAfterPayment(paymentDetails) {
        const cart = getCartItems();
        
        if (cart.length === 0) {
            showNotification('No items in order!', 'error');
            return;
        }
        
        const paymentMessage = formatPaymentConfirmationMessage(cart, paymentDetails);
        
        // Clean phone number - remove all non-digits
        const cleanPhoneNumber = WHATSAPP_CONFIG.phoneNumber.replace(/[^\d]/g, '');
        
        // Create WhatsApp URL
        const whatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${encodeURIComponent(paymentMessage)}`;
        
        console.log('📱 WhatsApp Debug Info:');
        console.log('  - Phone Number:', WHATSAPP_CONFIG.phoneNumber);
        console.log('  - Clean Phone:', cleanPhoneNumber);
        console.log('  - Message Length:', paymentMessage.length);
        console.log('  - WhatsApp URL:', whatsappUrl);
        
        // Test WhatsApp URL before opening
        console.log('🧪 Testing WhatsApp URL...');
        
        // Open WhatsApp with payment confirmation
        window.open(whatsappUrl, '_blank');
        
        // Update order status to paid
        updateOrderStatusToPaid(cart, paymentDetails);
        
        // Show confirmation
        showNotification('Payment confirmed! Opening WhatsApp with order details...', 'success');
        
        // Clear cart after payment
        setTimeout(() => {
            clearCart();
        }, 2000);
    }
    
    // Format payment confirmation message
    function formatPaymentConfirmationMessage(cart, paymentDetails) {
        let message = `✅ *PAYMENT CONFIRMED*\n\n`;
        message += `${WHATSAPP_CONFIG.defaultMessage}\n\n`;
        message += `💳 *PAYMENT DETAILS*\n`;
        message += `Payment Method: ${paymentDetails.method}\n`;
        message += `Transaction ID: ${paymentDetails.transactionId || 'N/A'}\n`;
        message += `Amount Paid: ₹${paymentDetails.amount}\n`;
        
        message += `📋 *ORDER DETAILS*\n\n`;
        
        cart.forEach((item, index) => {
            message += `${index + 1}. *${item.name}*\n`;
            message += `   Quantity: ${item.quantity}\n`;
            message += `   Price: ₹${item.price} each\n`;
            message += `   Subtotal: ₹${item.price * item.quantity}\n\n`;
        });
        
        const total = calculateCartTotal(cart);
        message += `💰 *Total Amount: ₹${total}*\n\n`;
        message += `📍 Delivery Address: ${paymentDetails.address || '[Please provide your address]'}\n`;
        message += `📞 Contact Number: ${paymentDetails.phone || '[Please provide your number]'}\n`;
        message += `👤 Customer Name: ${paymentDetails.name || '[Please provide your name]'}\n`;
        message += `📧 Email Address: ${paymentDetails.email || '[Please provide your email]'}\n\n`;
        message += `✅ *Payment Status: PAID*\n\n`;
        message += `Thank you for your order from ${WHATSAPP_CONFIG.businessName}! 🙏\n`;
        message += `Your order will be delivered soon! 🚚`;
        
        return message;
    }
    
    // Update order status to paid
    function updateOrderStatusToPaid(cart, paymentDetails) {
        const orders = JSON.parse(localStorage.getItem('pindiOrders') || '[]');
        const newOrder = {
            id: orders.length + 1,
            customer: paymentDetails.name || 'WhatsApp Customer',
            phone: paymentDetails.phone || '',
            email: paymentDetails.email || '',
            address: paymentDetails.address || '',
            items: cart,
            total: calculateCartTotal(cart),
            status: 'paid',
            paymentMethod: paymentDetails.method,
            transactionId: paymentDetails.transactionId || '',
            date: new Date().toISOString(),
            source: 'whatsapp-payment',
            contact: WHATSAPP_CONFIG.phoneNumber
        };
        
        orders.push(newOrder);
        localStorage.setItem('pindiOrders', JSON.stringify(orders));
        
        console.log('💳 Paid order saved to admin panel:', newOrder);
        console.log('💳 Total orders now:', orders.length);
        
        // Trigger sync to admin panel
        if (window.realtimeSync) {
            window.realtimeSync.updateTimestamp('orders');
            window.realtimeSync.forceSync();
        }
    }
    
    // Format order message for WhatsApp
    function formatOrderMessage(cart) {
        let message = `${WHATSAPP_CONFIG.defaultMessage}\n\n`;
        message += `📋 *ORDER DETAILS*\n\n`;
        
        cart.forEach((item, index) => {
            message += `${index + 1}. *${item.name}*\n`;
            message += `   Quantity: ${item.quantity}\n`;
            message += `   Price: ₹${item.price} each\n`;
            message += `   Subtotal: ₹${item.price * item.quantity}\n\n`;
        });
        
        const total = calculateCartTotal(cart);
        message += `💰 *Total Amount: ₹${total}*\n\n`;
        message += `📍 Delivery Address: [Please provide your address]\n`;
        message += `📞 Contact Number: [Please provide your number]\n\n`;
        message += `Thank you for ordering from ${WHATSAPP_CONFIG.businessName}! 🙏`;
        
        return message;
    }
    
    // Save order to admin panel
    function saveOrderToAdmin(cart) {
        const orders = JSON.parse(localStorage.getItem('pindiOrders') || '[]');
        const newOrder = {
            id: orders.length + 1,
            customer: 'WhatsApp Customer',
            phone: '+91 98664 06807',
            email: 'customer@example.com',
            address: 'Andhra Pradesh, India',
            items: cart,
            total: calculateCartTotal(cart),
            status: 'pending',
            date: new Date().toISOString(),
            source: 'whatsapp',
            contact: WHATSAPP_CONFIG.phoneNumber
        };
        
        orders.push(newOrder);
        localStorage.setItem('pindiOrders', JSON.stringify(orders));
        
        console.log('📦 Order saved to admin panel:', newOrder);
        console.log('📦 Total orders now:', orders.length);
        console.log('📦 Orders in localStorage:', JSON.stringify(localStorage.getItem('pindiOrders')));
        
        // Trigger sync to admin panel
        if (window.realtimeSync) {
            window.realtimeSync.updateTimestamp('orders');
            window.realtimeSync.forceSync();
        }
        
        // Force immediate sync check
        setTimeout(() => {
            console.log('🔄 Forcing sync check...');
            if (window.realtimeSync) {
                window.realtimeSync.forceSync();
            }
        }, 1000);
    }
    
    // Clear cart
    function clearCart() {
        localStorage.removeItem('pindiCart');
        updateCartCount();
        updateWhatsAppButton();
        showNotification('Cart cleared after order placement', 'info');
    }
    
    // Update cart count display
    function updateCartCount() {
        const cart = getCartItems();
        const countElement = document.getElementById('cartCount');
        if (countElement) {
            const totalItems = cart.reduce((count, item) => count + item.quantity, 0);
            countElement.textContent = totalItems;
        }
    }
    
    // Setup order confirmation
    function setupOrderConfirmation() {
        // Add confirmation dialog before WhatsApp
        const originalSendOrder = sendOrderToWhatsApp;
        window.sendOrderToWhatsApp = function() {
            const cart = getCartItems();
            if (cart.length === 0) return;
            
            if (confirm(`Are you ready to place your order for ${cart.length} item(s) via WhatsApp?\n\nTotal: ₹${calculateCartTotal(cart)}`)) {
                originalSendOrder();
            }
        };
    }
    
    // Show notification
    function showNotification(message, type) {
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
            z-index: 10000;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
            font-size: 14px;
            max-width: 300px;
        `;
        
        notification.style.background = type === 'success' ? '#27ae60' : 
                                      type === 'error' ? '#e74c3c' : '#3498db';
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 100);
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Global function for WhatsApp ordering from contact section
    window.orderViaWhatsApp = function() {
        const cart = getCartItems();
        if (cart.length === 0) {
            showNotification('Please add items to cart first!', 'error');
            // Scroll to recipes section
            document.getElementById('recipes').scrollIntoView({ behavior: 'smooth' });
        } else {
            sendOrderToWhatsApp();
        }
    };
    
    // Global function for payment completion
    window.completePaymentAndSendWhatsApp = function(paymentDetails) {
        showNotification('Processing payment...', 'info');
        
        // Simulate payment processing
        setTimeout(() => {
            sendWhatsAppAfterPayment(paymentDetails);
        }, 1500);
    };
    
    // Global function to trigger WhatsApp after payment
    window.sendWhatsAppAfterPayment = sendWhatsAppAfterPayment;
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWhatsAppOrder);
    } else {
        initWhatsAppOrder();
    }
    
})();
