// Background Manager - Apply background changes to main website
(function() {
    // Load background settings from localStorage
    function loadBackgroundSettings() {
        const savedBackground = localStorage.getItem('pindiWebsiteBackground');
        if (savedBackground) {
            const background = JSON.parse(savedBackground);
            applyBackground(background);
        }
    }
    
    // Apply background to hero section
    function applyBackground(background) {
        const heroElement = document.querySelector('.hero');
        if (heroElement) {
            if (background.type === 'image') {
                heroElement.style.background = `linear-gradient(rgba(0, 0, 0, ${background.overlayOpacity}), rgba(0, 0, 0, ${background.overlayOpacity})), url('${background.url}') center/cover`;
            } else if (background.type === 'color') {
                heroElement.style.background = `linear-gradient(135deg, ${background.color1} 0%, ${background.color2} 100%)`;
            }
        }
    }
    
    // Listen for background changes
    function listenForChanges() {
        setInterval(() => {
            const savedBackground = localStorage.getItem('pindiWebsiteBackground');
            if (savedBackground) {
                const background = JSON.parse(savedBackground);
                applyBackground(background);
            }
        }, 1000); // Check every second
    }
    
    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
        loadBackgroundSettings();
        listenForChanges();
    });
    
    // Also apply immediately if DOM is already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadBackgroundSettings);
    } else {
        loadBackgroundSettings();
    }
})();
