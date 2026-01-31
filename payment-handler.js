// Payment Handler - Integrates with WhatsApp Order System
// Handles payment completion and triggers WhatsApp message

(function() {
    'use strict';
    
    // Initialize payment handler
    function initPaymentHandler() {
        console.log('💳 Payment Handler initialized');
        
        // Add payment buttons to cart
        addPaymentButtons();
        
        // Setup payment form handling
        setupPaymentForms();
    }
    
    // Add payment buttons to cart
    function addPaymentButtons() {
        const cartContainer = document.querySelector('.cart-container, .cart-content');
        if (cartContainer) {
            // Create payment section
            const paymentSection = document.createElement('div');
            paymentSection.className = 'payment-section';
            paymentSection.innerHTML = `
                <h3>Payment Options</h3>
                <div class="payment-methods">
                    <button class="btn btn-payment" onclick="initiatePayment('cod')">
                        <i class="fas fa-money-bill-wave"></i>
                        Cash on Delivery
                    </button>
                    <button class="btn btn-payment" onclick="initiatePayment('upi')">
                        <i class="fas fa-qrcode"></i>
                        UPI Payment
                    </button>
                    <button class="btn btn-payment" onclick="initiatePayment('card')">
                        <i class="fas fa-credit-card"></i>
                        Card Payment
                    </button>
                </div>
            `;
            
            // Insert before existing buttons
            const existingButtons = cartContainer.querySelector('.checkout-btn, .btn-checkout, .whatsapp-order-btn');
            if (existingButtons) {
                existingButtons.parentNode.insertBefore(paymentSection, existingButtons);
            } else {
                cartContainer.appendChild(paymentSection);
            }
        }
    }
    
    // Setup payment forms
    function setupPaymentForms() {
        // Create payment modal
        const paymentModal = document.createElement('div');
        paymentModal.className = 'payment-modal';
        paymentModal.innerHTML = `
            <div class="payment-modal-content">
                <span class="close-payment" onclick="closePaymentModal()">&times;</span>
                <h2>Complete Your Order</h2>
                <div class="payment-form">
                    <div class="order-summary">
                        <h3>Order Summary</h3>
                        <div id="paymentOrderSummary"></div>
                    </div>
                    <div class="customer-details">
                        <h3>Your Details</h3>
                        <form id="paymentForm">
                            <div class="form-group">
                                <label for="customerName">Full Name</label>
                                <input type="text" id="customerName" required placeholder="Enter your full name">
                            </div>
                            <div class="form-group">
                                <label for="customerPhone">Phone Number</label>
                                <input type="tel" id="customerPhone" required placeholder="Enter your phone number">
                            </div>
                            <div class="form-group">
                                <label for="customerEmail">Email Address</label>
                                <input type="email" id="customerEmail" required placeholder="Enter your email address">
                            </div>
                            <div class="form-group">
                                <label for="customerAddress">Delivery Address</label>
                                <textarea id="customerAddress" required placeholder="Enter your complete delivery address"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="paymentMethod">Payment Method</label>
                                <select id="paymentMethod" required>
                                    <option value="">Select Payment Method</option>
                                    <option value="cod">Cash on Delivery</option>
                                    <option value="upi">UPI (Google Pay, PhonePe, Paytm)</option>
                                    <option value="card">Credit/Debit Card</option>
                                </select>
                            </div>
                            <div class="form-group" id="transactionGroup" style="display: none;">
                                <label for="transactionId">Transaction ID</label>
                                <input type="text" id="transactionId" placeholder="Enter transaction ID">
                            </div>
                            <button type="submit" class="btn btn-primary">Complete Payment</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(paymentModal);
        
        // Add form submit handler
        document.getElementById('paymentForm').addEventListener('submit', handlePaymentSubmit);
        
        // Add payment method change handler
        document.getElementById('paymentMethod').addEventListener('change', function() {
            const transactionGroup = document.getElementById('transactionGroup');
            if (this.value === 'upi' || this.value === 'card') {
                transactionGroup.style.display = 'block';
            } else {
                transactionGroup.style.display = 'none';
            }
        });
    }
    
    // Initiate payment
    window.initiatePayment = function(method) {
        const cart = getCartItems();
        if (cart.length === 0) {
            showNotification('Your cart is empty!', 'error');
            return;
        }
        
        // Set payment method
        document.getElementById('paymentMethod').value = method;
        
        // Show transaction ID field for non-COD
        const transactionGroup = document.getElementById('transactionGroup');
        if (method === 'upi' || method === 'card') {
            transactionGroup.style.display = 'block';
        } else {
            transactionGroup.style.display = 'none';
        }
        
        // Update order summary
        updatePaymentOrderSummary();
        
        // Show payment modal
        document.querySelector('.payment-modal').style.display = 'flex';
    };
    
    // Update payment order summary
    function updatePaymentOrderSummary() {
        const cart = getCartItems();
        const summaryDiv = document.getElementById('paymentOrderSummary');
        
        if (cart.length === 0) {
            summaryDiv.innerHTML = '<p>Your cart is empty</p>';
            return;
        }
        
        let summaryHTML = '<div class="summary-items">';
        let total = 0;
        
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            summaryHTML += `
                <div class="summary-item">
                    <span>${item.name} x ${item.quantity}</span>
                    <span>₹${itemTotal}</span>
                </div>
            `;
        });
        
        summaryHTML += '</div>';
        summaryHTML += `
            <div class="summary-total">
                <strong>Total Amount: ₹${total}</strong>
            </div>
        `;
        
        summaryDiv.innerHTML = summaryHTML;
    }
    
    // Handle payment form submission
    function handlePaymentSubmit(e) {
        e.preventDefault();
        
        const cart = getCartItems();
        if (cart.length === 0) {
            showNotification('Your cart is empty!', 'error');
            return;
        }
        
        const paymentDetails = {
            name: document.getElementById('customerName').value,
            phone: document.getElementById('customerPhone').value,
            email: document.getElementById('customerEmail').value,
            address: document.getElementById('customerAddress').value,
            method: document.getElementById('paymentMethod').value,
            transactionId: document.getElementById('transactionId').value,
            amount: calculateCartTotal(cart)
        };
        
        // Validate payment details
        if (!validatePaymentDetails(paymentDetails)) {
            return;
        }
        
        // Process payment and send WhatsApp
        if (window.sendWhatsAppAfterPayment) {
            window.sendWhatsAppAfterPayment(paymentDetails);
        }
        
        // Close payment modal
        closePaymentModal();
    }
    
    // Validate payment details
    function validatePaymentDetails(details) {
        if (!details.name || details.name.trim() === '') {
            showNotification('Please enter your name', 'error');
            return false;
        }
        
        if (!details.phone || details.phone.trim() === '') {
            showNotification('Please enter your phone number', 'error');
            return false;
        }
        
        if (!details.email || details.email.trim() === '') {
            showNotification('Please enter your email address', 'error');
            return false;
        }
        
        if (!details.address || details.address.trim() === '') {
            showNotification('Please enter your delivery address', 'error');
            return false;
        }
        
        if (!details.method) {
            showNotification('Please select a payment method', 'error');
            return false;
        }
        
        if ((details.method === 'upi' || details.method === 'card') && 
            (!details.transactionId || details.transactionId.trim() === '')) {
            showNotification('Please enter transaction ID for online payment', 'error');
            return false;
        }
        
        return true;
    }
    
    // Close payment modal
    window.closePaymentModal = function() {
        const modal = document.querySelector('.payment-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    };
    
    // Get cart items (reuse from whatsapp-order.js)
    function getCartItems() {
        const cart = localStorage.getItem('pindiCart');
        return cart ? JSON.parse(cart) : [];
    }
    
    // Calculate cart total (reuse from whatsapp-order.js)
    function calculateCartTotal(items) {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    // Show notification (reuse from whatsapp-order.js)
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
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPaymentHandler);
    } else {
        initPaymentHandler();
    }
    
})();
