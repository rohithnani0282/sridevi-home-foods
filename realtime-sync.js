// Real-time Synchronization System - Enhanced for Persistent Operation
// Syncs admin panel changes to main website instantly, works reliably even after months

(function() {
    'use strict';
    
    // Sync interval in milliseconds (check for changes every 500ms for faster response)
    const SYNC_INTERVAL = 500;
    const HEALTH_CHECK_INTERVAL = 30000; // Health check every 30 seconds
    const PERSISTENCE_CHECK_INTERVAL = 60000; // Check persistence every minute
    
    // Last known data timestamps and checksums
    let lastSyncTimestamps = {
        categories: { timestamp: 0, checksum: '' },
        recipes: { timestamp: 0, checksum: '' },
        paymentMethods: { timestamp: 0, checksum: '' },
        adminCredentials: { timestamp: 0, checksum: '' }
    };
    
    // System health monitoring
    let systemHealth = {
        isHealthy: true,
        lastHealthCheck: Date.now(),
        totalSyncs: 0,
        failedSyncs: 0,
        consecutiveFailures: 0
    };
    
    // Initialize sync system
    function initRealtimeSync() {
        console.log('🔄 Enhanced Real-time sync system initialized');
        
        // Load initial timestamps and checksums
        updateTimestamps();
        calculateChecksums();
        
        // Start continuous sync
        startSyncLoop();
        
        // Start health monitoring
        startHealthMonitoring();
        
        // Start persistence monitoring
        startPersistenceMonitoring();
        
        // Listen for storage changes (cross-tab sync)
        window.addEventListener('storage', handleStorageChange);
        
        // Listen for page visibility changes
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Listen for online/offline status
        window.addEventListener('online', handleOnlineStatusChange);
        window.addEventListener('offline', handleOnlineStatusChange);
        
        // Periodic full sync to ensure consistency
        setInterval(performFullSync, 300000); // Full sync every 5 minutes
        
        // Initialize system status
        updateSystemStatus();
        
        // Log initialization
        logSyncEvent('🚀 Enhanced sync system initialized with persistent monitoring', 'success');
    }
    
    // Calculate checksums for data integrity
    function calculateChecksums() {
        try {
            // Categories checksum
            const categories = JSON.parse(localStorage.getItem('pindiCategories') || '[]');
            lastSyncTimestamps.categories.checksum = simpleHash(JSON.stringify(categories));
            
            // Recipes checksum
            const recipes = JSON.parse(localStorage.getItem('pindiRecipes') || '{}');
            lastSyncTimestamps.recipes.checksum = simpleHash(JSON.stringify(recipes));
            
            // Payment methods checksum
            const paymentMethods = JSON.parse(localStorage.getItem('pindiPaymentMethods') || '[]');
            lastSyncTimestamps.paymentMethods.checksum = simpleHash(JSON.stringify(paymentMethods));
            
            // Admin credentials checksum
            const credentials = JSON.parse(localStorage.getItem('pindiAdminCredentials') || '{}');
            lastSyncTimestamps.adminCredentials.checksum = simpleHash(JSON.stringify(credentials));
            
        } catch (error) {
            console.error('Error calculating checksums:', error);
            logSyncEvent('❌ Checksum calculation failed', 'error');
        }
    }
    
    // Simple hash function for data integrity
    function simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }
    
    // Update timestamps from localStorage
    function updateTimestamps() {
        lastSyncTimestamps.categories.timestamp = parseInt(localStorage.getItem('pindiCategoriesTimestamp') || '0');
        lastSyncTimestamps.recipes.timestamp = parseInt(localStorage.getItem('pindiRecipesTimestamp') || '0');
        lastSyncTimestamps.paymentMethods.timestamp = parseInt(localStorage.getItem('pindiPaymentMethodsTimestamp') || '0');
        lastSyncTimestamps.adminCredentials.timestamp = parseInt(localStorage.getItem('pindiCredentialsUpdated') || '0');
    }
    
    // Start the sync loop
    function startSyncLoop() {
        setInterval(() => {
            checkForUpdates();
        }, SYNC_INTERVAL);
    }
    
    // Start health monitoring
    function startHealthMonitoring() {
        setInterval(() => {
            performHealthCheck();
        }, HEALTH_CHECK_INTERVAL);
    }
    
    // Start persistence monitoring
    function startPersistenceMonitoring() {
        setInterval(() => {
            checkDataPersistence();
        }, PERSISTENCE_CHECK_INTERVAL);
    }
    
    // Check for updates in admin data
    function checkForUpdates() {
        try {
            let hasUpdates = false;
            
            // Check categories
            if (checkDataUpdate('categories')) {
                syncCategories();
                hasUpdates = true;
            }
            
            // Check recipes
            if (checkDataUpdate('recipes')) {
                syncRecipes();
                hasUpdates = true;
            }
            
            // Check payment methods
            if (checkDataUpdate('paymentMethods')) {
                syncPaymentMethods();
                hasUpdates = true;
            }
            
            // Check admin credentials
            if (checkDataUpdate('adminCredentials')) {
                syncAdminCredentials();
                hasUpdates = true;
            }
            
            if (hasUpdates) {
                systemHealth.totalSyncs++;
                systemHealth.consecutiveFailures = 0;
                updateSystemStatus();
            }
            
        } catch (error) {
            handleSyncError(error);
        }
    }
    
    // Check if specific data type has updates
    function checkDataUpdate(dataType) {
        const currentTimestamp = parseInt(localStorage.getItem(`pindi${dataType.charAt(0).toUpperCase() + dataType.slice(1)}Timestamp`) || '0');
        const currentData = getCurrentData(dataType);
        const currentChecksum = simpleHash(JSON.stringify(currentData));
        
        // Check if timestamp changed or checksum changed
        const timestampChanged = currentTimestamp !== lastSyncTimestamps[dataType].timestamp;
        const checksumChanged = currentChecksum !== lastSyncTimestamps[dataType].checksum;
        
        if (timestampChanged || checksumChanged) {
            lastSyncTimestamps[dataType].timestamp = currentTimestamp;
            lastSyncTimestamps[dataType].checksum = currentChecksum;
            return true;
        }
        
        return false;
    }
    
    // Get current data for a type
    function getCurrentData(dataType) {
        switch (dataType) {
            case 'categories':
                return JSON.parse(localStorage.getItem('pindiCategories') || '[]');
            case 'recipes':
                return JSON.parse(localStorage.getItem('pindiRecipes') || '{}');
            case 'paymentMethods':
                return JSON.parse(localStorage.getItem('pindiPaymentMethods') || '[]');
            case 'adminCredentials':
                return JSON.parse(localStorage.getItem('pindiAdminCredentials') || '{}');
            default:
                return null;
        }
    }
    
    // Sync categories to website
    function syncCategories() {
        try {
            const categories = JSON.parse(localStorage.getItem('pindiCategories') || '[]');
            
            // Update category navigation if it exists
            const categoryNav = document.querySelector('.category-nav');
            if (categoryNav) {
                updateCategoryNavigation(categories);
            }
            
            // Update category filters if they exist
            const categoryFilters = document.querySelector('.category-filters');
            if (categoryFilters) {
                updateCategoryFilters(categories);
            }
            
            // Update category sections if they exist
            updateCategorySections(categories);
            
            // Update any category displays
            updateAllCategoryDisplays(categories);
            
            console.log('📦 Categories synced to website');
            logSyncEvent('📦 Categories updated and synced', 'success');
            showSyncNotification('Categories updated', 'success');
            
        } catch (error) {
            handleSyncError(error, 'Categories sync failed');
        }
    }
    
    // Sync recipes to website
    function syncRecipes() {
        try {
            const recipes = JSON.parse(localStorage.getItem('pindiRecipes') || '{}');
            
            // Update recipe cards if they exist
            updateRecipeCards(recipes);
            
            // Update recipe grid if it exists
            updateRecipeGrid(recipes);
            
            // Update menu items if they exist
            updateMenuItems(recipes);
            
            // Update search results if they exist
            updateSearchResults(recipes);
            
            // Update price displays
            updateAllPriceDisplays(recipes);
            
            console.log('🍽️ Recipes synced to website');
            logSyncEvent('🍽️ Menu items updated and synced', 'success');
            showSyncNotification('Menu items updated', 'success');
            
        } catch (error) {
            handleSyncError(error, 'Recipes sync failed');
        }
    }
    
    // Sync payment methods to website
    function syncPaymentMethods() {
        try {
            const paymentMethods = JSON.parse(localStorage.getItem('pindiPaymentMethods') || '[]');
            
            // Update payment options in checkout if it exists
            const paymentOptions = document.querySelector('.payment-options');
            if (paymentOptions) {
                updatePaymentOptions(paymentMethods);
            }
            
            // Update payment methods in cart if they exist
            const cartPayment = document.querySelector('.cart-payment-methods');
            if (cartPayment) {
                updateCartPaymentMethods(paymentMethods);
            }
            
            // Update all payment displays
            updateAllPaymentDisplays(paymentMethods);
            
            console.log('💳 Payment methods synced to website');
            logSyncEvent('💳 Payment methods updated and synced', 'success');
            showSyncNotification('Payment methods updated', 'success');
            
        } catch (error) {
            handleSyncError(error, 'Payment methods sync failed');
        }
    }
    
    // Sync admin credentials (mainly for login hints if needed)
    function syncAdminCredentials() {
        try {
            const credentials = JSON.parse(localStorage.getItem('pindiAdminCredentials') || '{}');
            
            // Update any admin login hints on main site
            const adminLoginHint = document.querySelector('.admin-login-hint');
            if (adminLoginHint) {
                adminLoginHint.textContent = `Current login: ${credentials.username}`;
            }
            
            console.log('🔐 Admin credentials synced');
            logSyncEvent('🔐 Admin credentials updated', 'success');
            
        } catch (error) {
            handleSyncError(error, 'Admin credentials sync failed');
        }
    }
    
    // Perform full sync to ensure consistency
    function performFullSync() {
        logSyncEvent('🔄 Performing full sync check', 'info');
        
        try {
            // Recalculate checksums
            calculateChecksums();
            
            // Force sync all data types
            syncCategories();
            syncRecipes();
            syncPaymentMethods();
            syncAdminCredentials();
            
            logSyncEvent('✅ Full sync completed successfully', 'success');
            
        } catch (error) {
            handleSyncError(error, 'Full sync failed');
        }
    }
    
    // Perform health check
    function performHealthCheck() {
        try {
            const now = Date.now();
            const timeSinceLastSync = now - systemHealth.lastHealthCheck;
            
            // Check if sync is working (should have synced recently if data changed)
            if (timeSinceLastSync > HEALTH_CHECK_INTERVAL * 2) {
                logSyncEvent('⚠️ Health check: Sync may be stalled', 'warning');
            }
            
            // Check localStorage accessibility
            const testKey = 'pindiHealthCheck';
            localStorage.setItem(testKey, Date.now().toString());
            const testValue = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            
            if (!testValue) {
                throw new Error('localStorage not accessible');
            }
            
            systemHealth.lastHealthCheck = now;
            systemHealth.isHealthy = true;
            
            logSyncEvent('✅ Health check passed', 'success');
            
        } catch (error) {
            systemHealth.isHealthy = false;
            handleSyncError(error, 'Health check failed');
        }
    }
    
    // Check data persistence
    function checkDataPersistence() {
        try {
            const dataTypes = ['categories', 'recipes', 'paymentMethods', 'adminCredentials'];
            let allDataPresent = true;
            
            dataTypes.forEach(dataType => {
                const key = `pindi${dataType.charAt(0).toUpperCase() + dataType.slice(1)}`;
                const data = localStorage.getItem(key);
                
                if (!data) {
                    allDataPresent = false;
                    logSyncEvent(`⚠️ Missing data: ${dataType}`, 'warning');
                }
            });
            
            if (allDataPresent) {
                logSyncEvent('✅ Data persistence check passed', 'success');
            }
            
        } catch (error) {
            handleSyncError(error, 'Data persistence check failed');
        }
    }
    
    // Handle sync errors
    function handleSyncError(error, context = 'Sync error') {
        console.error(`${context}:`, error);
        systemHealth.failedSyncs++;
        systemHealth.consecutiveFailures++;
        
        logSyncEvent(`❌ ${context}: ${error.message}`, 'error');
        
        // If too many consecutive failures, try to recover
        if (systemHealth.consecutiveFailures >= 5) {
            attemptRecovery();
        }
    }
    
    // Attempt to recover from sync failures
    function attemptRecovery() {
        logSyncEvent('🔧 Attempting sync recovery', 'warning');
        
        try {
            // Reset timestamps and checksums
            updateTimestamps();
            calculateChecksums();
            
            // Perform full sync
            performFullSync();
            
            // Reset failure counter
            systemHealth.consecutiveFailures = 0;
            systemHealth.isHealthy = true;
            
            logSyncEvent('✅ Sync recovery successful', 'success');
            
        } catch (error) {
            logSyncEvent('❌ Sync recovery failed', 'error');
        }
    }
    
    // Update system status
    function updateSystemStatus() {
        try {
            // Update any system status displays
            const statusElement = document.querySelector('.sync-system-status');
            if (statusElement) {
                statusElement.textContent = systemHealth.isHealthy ? 'Healthy' : 'Issues Detected';
                statusElement.className = `sync-system-status ${systemHealth.isHealthy ? 'healthy' : 'unhealthy'}`;
            }
        } catch (error) {
            console.error('Error updating system status:', error);
        }
    }
    
    // Log sync events
    function logSyncEvent(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            message,
            type,
            health: systemHealth.isHealthy
        };
        
        // Store in localStorage for persistence
        const logs = JSON.parse(localStorage.getItem('pindiSyncLogs') || '[]');
        logs.push(logEntry);
        
        // Keep only last 100 entries
        if (logs.length > 100) {
            logs.splice(0, logs.length - 100);
        }
        
        localStorage.setItem('pindiSyncLogs', JSON.stringify(logs));
        
        // Also log to console
        console.log(`[Sync] ${message}`);
    }
    
    // Handle storage changes (cross-tab synchronization)
    function handleStorageChange(event) {
        if (event.key && event.key.startsWith('pindi')) {
            console.log('🔄 Storage change detected, syncing...');
            checkForUpdates();
            logSyncEvent(`🔄 Storage change: ${event.key}`, 'info');
        }
    }
    
    // Handle page visibility changes
    function handleVisibilityChange() {
        if (!document.hidden) {
            console.log('🔄 Page became visible, checking for updates...');
            checkForUpdates();
            performHealthCheck();
            logSyncEvent('🔄 Page visibility changed, sync triggered', 'info');
        }
    }
    
    // Handle online/offline status changes
    function handleOnlineStatusChange() {
        if (navigator.onLine) {
            logSyncEvent('🌐 Back online, checking for updates', 'info');
            checkForUpdates();
        } else {
            logSyncEvent('📴 Offline, sync paused', 'warning');
        }
    }
    
    // Show sync notification
    function showSyncNotification(message, type) {
        // Create notification element if it doesn't exist
        let notification = document.querySelector('.sync-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'sync-notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 9999;
                opacity: 0;
                transform: translateY(-20px);
                transition: all 0.3s ease;
                font-size: 14px;
                max-width: 300px;
            `;
            document.body.appendChild(notification);
        }
        
        // Set message and style
        notification.textContent = message;
        notification.style.background = type === 'success' ? '#27ae60' : 
                                      type === 'error' ? '#e74c3c' : 
                                      type === 'warning' ? '#f39c12' : '#3498db';
        
        // Show notification
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
        }, 3000);
    }
    
    // Update all category displays
    function updateAllCategoryDisplays(categories) {
        // Update any element with category data
        document.querySelectorAll('[data-category]').forEach(element => {
            const categoryId = element.getAttribute('data-category');
            const category = categories.find(c => c.id == categoryId);
            if (category) {
                element.textContent = category.name;
            }
        });
        
        // Update category lists
        document.querySelectorAll('.category-list').forEach(list => {
            list.innerHTML = '';
            categories.forEach(category => {
                const li = document.createElement('li');
                li.textContent = category.name;
                li.setAttribute('data-category-id', category.id);
                list.appendChild(li);
            });
        });
        
        // Update category dropdowns
        document.querySelectorAll('.category-dropdown').forEach(dropdown => {
            dropdown.innerHTML = '<option value="">Select Category</option>';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                dropdown.appendChild(option);
            });
        });
    }
    
    // Update all price displays
    function updateAllPriceDisplays(recipes) {
        // Update any element with price data
        document.querySelectorAll('[data-recipe-id]').forEach(element => {
            const recipeId = element.getAttribute('data-recipe-id');
            const recipe = Object.values(recipes).flat().find(r => r.id == recipeId);
            if (recipe) {
                const priceElement = element.querySelector('.price, .recipe-price, [data-price]');
                if (priceElement) {
                    priceElement.textContent = `₹${recipe.price}`;
                }
            }
        });
        
        // Update price displays by recipe name
        Object.values(recipes).flat().forEach(recipe => {
            document.querySelectorAll(`[data-recipe-name="${recipe.name}"]`).forEach(element => {
                const priceElement = element.querySelector('.price, .recipe-price, [data-price]');
                if (priceElement) {
                    priceElement.textContent = `₹${recipe.price}`;
                }
            });
        });
    }
    
    // Update all payment displays
    function updateAllPaymentDisplays(paymentMethods) {
        // Update payment method lists
        document.querySelectorAll('.payment-method-list').forEach(list => {
            list.innerHTML = '';
            paymentMethods.filter(method => method.status === 'active').forEach(method => {
                const li = document.createElement('li');
                li.textContent = `${method.name} (${method.type})`;
                li.setAttribute('data-payment-id', method.id);
                list.appendChild(li);
            });
        });
        
        // Update payment displays
        document.querySelectorAll('[data-payment-method]').forEach(element => {
            const paymentId = element.getAttribute('data-payment-method');
            const method = paymentMethods.find(m => m.id == paymentId);
            if (method) {
                element.textContent = method.name;
            }
        });
    }
    
    // Update timestamps when data changes
    function updateTimestamp(dataType) {
        const timestamp = Date.now();
        localStorage.setItem(`pindi${dataType.charAt(0).toUpperCase() + dataType.slice(1)}Timestamp`, timestamp);
        lastSyncTimestamps[dataType].timestamp = timestamp;
        logSyncEvent(`⏰ Timestamp updated for ${dataType}`, 'info');
    }
    
    // Make update functions available globally
    window.realtimeSync = {
        updateTimestamp: updateTimestamp,
        forceSync: checkForUpdates,
        performFullSync: performFullSync,
        getSystemHealth: () => systemHealth,
        getSyncLogs: () => JSON.parse(localStorage.getItem('pindiSyncLogs') || '[]'),
        init: initRealtimeSync
    };
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRealtimeSync);
    } else {
        initRealtimeSync();
    }
    
})();
