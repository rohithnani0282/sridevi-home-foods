// Cart Management System
class CartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('pindiCart')) || [];
        this.init();
    }

    init() {
        this.updateCartCount();
        this.setupCartEventListeners();
    }

    setupCartEventListeners() {
        // Add event listeners to "Add to Cart" buttons
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const recipeCard = button.closest('.recipe-card');
                const quantityInput = recipeCard.querySelector('.quantity-input');
                const quantity = parseInt(quantityInput.value);
                const recipeName = button.getAttribute('data-recipe');
                const price = parseInt(button.getAttribute('data-price'));
                
                // Add multiple items based on quantity
                for (let i = 0; i < quantity; i++) {
                    this.addToCart(recipeName, price, false);
                }
                
                // Show notification with total quantity
                this.showNotification(`${quantity} × ${recipeName} added to cart!`, 'success');
                
                // Reset quantity to 1 after adding
                quantityInput.value = 1;
            });
        });
    }

    addToCart(recipeName, price, showNotif = true) {
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
        
        if (showNotif) {
            this.showNotification(`${recipeName} added to cart!`, 'success');
        }
        
        // Animate button
        if (event && event.target) {
            event.target.classList.add('added');
            setTimeout(() => {
                event.target.classList.remove('added');
            }, 500);
        }
    }

    saveCart() {
        localStorage.setItem('pindiCart', JSON.stringify(this.cart));
    }

    updateCartCount() {
        const count = this.cart.reduce((total, item) => total + item.quantity, 0);
        const cartCountElement = document.getElementById('cartCount');
        if (cartCountElement) {
            cartCountElement.textContent = count;
        }
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

// Quantity update function for recipe cards
function updateQuantity(button, change) {
    const quantityInput = button.parentElement.querySelector('.quantity-input');
    let currentValue = parseInt(quantityInput.value);
    let newValue = currentValue + change;
    
    // Ensure quantity is between 1 and 10
    if (newValue < 1) newValue = 1;
    if (newValue > 10) newValue = 10;
    
    quantityInput.value = newValue;
}

// Initialize cart manager
const cartManager = new CartManager();

// Recipe Data
const recipes = {
    'Gongura Pappu': {
        ingredients: [
            '1 cup Toor Dal (Kandi Pappu)',
            '2 cups Gongura leaves (sorrel leaves), chopped',
            '1 Onion, finely chopped',
            '2 Green chilies, slit',
            '1 tsp Turmeric powder',
            '2 tbsp Tamarind paste',
            '3 tbsp Oil',
            '1 tsp Mustard seeds',
            '1 tsp Cumin seeds',
            '4-5 Garlic cloves, crushed',
            '2 Dry red chilies',
            'Salt to taste',
            'Fresh coriander leaves for garnish'
        ],
        time: '30 mins',
        difficulty: 'Easy',
        price: 120,
        serving: '4 persons',
        description: 'Tangy sorrel leaves dal with authentic Andhra flavors',
        instructions: [
            'Wash toor dal and pressure cook with 2 cups water and turmeric powder for 3-4 whistles.',
            'Meanwhile, wash gongura leaves thoroughly and chop them finely.',
            'Heat oil in a pan, add mustard seeds and cumin seeds. Let them splutter.',
            'Add crushed garlic, dry red chilies, and green chilies. Sauté for a minute.',
            'Add chopped onions and sauté until translucent.',
            'Add chopped gongura leaves and cook until they become soft and change color.',
            'Mash the cooked dal and add it to the pan along with tamarind paste.',
            'Add salt and mix well. Cook for 5-10 minutes on medium heat.',
            'Adjust consistency by adding water if needed.',
            'Garnish with fresh coriander leaves and serve hot with rice.'
        ]
    },
    'Ulava Charu': {
        ingredients: [
            '1 cup Horse gram (Ulava)',
            '4 cups Water',
            '2 tbsp Tamarind paste',
            '1 tsp Turmeric powder',
            '1 tsp Red chili powder',
            '1 tsp Cumin powder',
            '1 tsp Coriander powder',
            '2 tbsp Oil',
            '1 tsp Mustard seeds',
            '1 tsp Cumin seeds',
            '4-5 Garlic cloves, crushed',
            '2 Dry red chilies',
            '1 Onion, finely chopped',
            'Salt to taste',
            'Fresh coriander leaves'
        ],
        instructions: [
            'Soak horse gram overnight or for at least 6 hours.',
            'Pressure cook the soaked horse gram with 4 cups water for 6-7 whistles until soft.',
            'Heat oil in a pan, add mustard seeds and cumin seeds. Let them splutter.',
            'Add crushed garlic and dry red chilies. Sauté for a minute.',
            'Add chopped onions and sauté until golden brown.',
            'Add all the spice powders (turmeric, red chili, cumin, coriander) and sauté for 2 minutes.',
            'Add tamarind paste and salt. Mix well.',
            'Add the cooked horse gram along with its water. Mix everything together.',
            'Bring to a boil and then simmer for 15-20 minutes until the soup thickens slightly.',
            'Garnish with fresh coriander leaves and serve hot with rice.'
        ]
    },
    'Pootharekulu': {
        ingredients: [
            '2 cups Rice flour',
            '1 cup Powdered jaggery',
            '1/2 cup Ghee',
            '1/4 cup Cardamom powder',
            'Water as needed',
            'Banana leaves for spreading'
        ],
        instructions: [
            'Make a thin batter with rice flour and water. The consistency should be like buttermilk.',
            'Clean banana leaves and wipe them dry.',
            'Heat a griddle and place a banana leaf on it.',
            'Pour a small amount of rice batter on the leaf and spread it into a very thin layer using the back of a spoon.',
            'Cook until the layer becomes translucent and can be peeled off easily.',
            'Carefully peel off the thin rice sheet and place it on a clean cloth.',
            'Repeat the process to make multiple sheets.',
            'Mix powdered jaggery, ghee, and cardamom powder to make the filling.',
            'Place a rice sheet on a flat surface, spread a thin layer of the jaggery mixture.',
            'Roll it tightly and fold the edges. Repeat with remaining sheets.',
            'Store in an airtight container. These delicate sweets stay fresh for several days.'
        ]
    },
    'Andhra Chicken Curry': {
        ingredients: [
            '1 kg Chicken, cut into pieces',
            '2 Onions, finely chopped',
            '2 tbsp Ginger-garlic paste',
            '2 Tomatoes, chopped',
            '1 cup Yogurt',
            '3 tbsp Oil',
            '1 tsp Mustard seeds',
            '1 tsp Cumin seeds',
            '4-5 Curry leaves',
            '2 Bay leaves',
            '1 tbsp Red chili powder',
            '1 tsp Turmeric powder',
            '2 tsp Coriander powder',
            '1 tsp Cumin powder',
            '1 tsp Garam masala',
            'Salt to taste',
            'Fresh coriander leaves'
        ],
        instructions: [
            'Marinate chicken with yogurt, ginger-garlic paste, turmeric powder, and salt for 30 minutes.',
            'Heat oil in a heavy-bottomed pan, add mustard seeds and cumin seeds. Let them splutter.',
            'Add curry leaves, bay leaves, and chopped onions. Sauté until golden brown.',
            'Add ginger-garlic paste and sauté for 2 minutes until raw smell disappears.',
            'Add chopped tomatoes and cook until they become soft and mushy.',
            'Add all the spice powders (red chili, coriander, cumin, garam masala) and sauté for 2 minutes.',
            'Add the marinated chicken and mix well. Cook on high heat for 5 minutes.',
            'Reduce heat, cover the pan and cook for 20-25 minutes until chicken is tender.',
            'Add hot water if needed to adjust consistency.',
            'Garnish with fresh coriander leaves and serve hot with rice or roti.'
        ]
    },
    'Bobbatlu': {
        ingredients: [
            '2 cups All-purpose flour',
            '1 cup Chana dal, soaked',
            '1 cup Jaggery, grated',
            '1/2 cup Grated coconut',
            '1 tsp Cardamom powder',
            '2 tbsp Oil',
            'Salt to taste',
            'Ghee for cooking'
        ],
        instructions: [
            'Soak chana dal for 2 hours, then drain and grind to a coarse paste.',
            'Cook the dal paste with grated jaggery until thick and the mixture leaves the sides.',
            'Add grated coconut and cardamom powder. Mix well and let it cool. This is the filling.',
            'Knead all-purpose flour with oil, salt, and enough water to make a soft dough.',
            'Divide the dough into small lemon-sized balls.',
            'Take one dough ball, flatten it with your fingers, and place a spoonful of filling in the center.',
            'Seal the edges and gently roll it into a flatbread using a rolling pin.',
            'Heat a griddle, place the bobbatlu and cook on both sides using ghee until golden brown.',
            'Serve hot with ghee or as a sweet treat.'
        ]
    },
    'Avakaya Pickle': {
        ingredients: [
            '10 Raw mangoes, firm and sour',
            '2 cups Salt',
            '1 cup Red chili powder',
            '1/2 cup Mustard powder',
            '1/4 cup Fenugreek powder',
            '1/2 cup Garlic cloves',
            '1/4 cup Sesame oil',
            '1/4 cup Mustard seeds',
            '2 tbsp Turmeric powder'
        ],
        instructions: [
            'Wash and wipe the mangoes completely dry. Cut them into small pieces with the seed.',
            'In a large bowl, mix salt, red chili powder, mustard powder, fenugreek powder, and turmeric powder.',
            'Add the mango pieces to the spice mixture and mix well until all pieces are coated.',
            'Crush garlic cloves and add them to the mixture.',
            'Heat sesame oil and add mustard seeds. Let them splutter and cool completely.',
            'Pour the cooled oil over the mango mixture and mix thoroughly.',
            'Transfer the pickle to a clean, dry ceramic jar.',
            'Cover the jar with a clean cloth and keep it in sunlight for 2-3 days.',
            'Stir the pickle daily with a dry spoon for the first week.',
            'The pickle will be ready to eat after 2 weeks. Store in airtight containers.'
        ]
    }
};

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const modal = document.getElementById('recipeModal');
const modalTitle = document.getElementById('modalRecipeTitle');
const modalIngredients = document.getElementById('modalIngredients');
const modalInstructions = document.getElementById('modalInstructions');
const closeModal = document.querySelector('.close');
const viewRecipeButtons = document.querySelectorAll('.view-recipe');
const contactForm = document.querySelector('.contact-form');

// Mobile Navigation Toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Recipe Modal Functions
function openModal(recipeName) {
    const recipe = recipes[recipeName];
    if (recipe) {
        modalTitle.textContent = recipeName;
        
        // Clear existing content
        modalIngredients.innerHTML = '';
        modalInstructions.innerHTML = '';
        
        // Add ingredients
        recipe.ingredients.forEach(ingredient => {
            const li = document.createElement('li');
            li.textContent = ingredient;
            modalIngredients.appendChild(li);
        });
        
        // Add instructions
        recipe.instructions.forEach(instruction => {
            const li = document.createElement('li');
            li.textContent = instruction;
            modalInstructions.appendChild(li);
        });
        
        // Update recipe info
        document.getElementById('modalTime').textContent = recipe.time;
        document.getElementById('modalDifficulty').textContent = recipe.difficulty;
        document.getElementById('modalPrice').textContent = recipe.price;
        document.getElementById('modalServing').textContent = recipe.serving;
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModalFunc() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Event Listeners for Recipe Modal
viewRecipeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const recipeCard = e.target.closest('.recipe-card');
        const recipeName = recipeCard.querySelector('h3').textContent;
        openModal(recipeName);
    });
});

closeModal.addEventListener('click', closeModalFunc);

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModalFunc();
    }
});

// Contact Form Handler
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(contactForm);
    const name = contactForm.querySelector('input[type="text"]').value;
    const email = contactForm.querySelector('input[type="email"]').value;
    const message = contactForm.querySelector('textarea').value;
    
    // Simple validation
    if (!name || !email || !message) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Simulate form submission
    showNotification('Thank you for your message! We will get back to you soon.', 'success');
    contactForm.reset();
});

// Notification Function
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
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
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
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

// Scroll Reveal Animation
function reveal() {
    const reveals = document.querySelectorAll('.reveal');
    
    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('active');
        }
    });
}

// Add reveal class to elements
document.addEventListener('DOMContentLoaded', () => {
    const elementsToReveal = document.querySelectorAll('.category-card, .recipe-card, .about-text, .contact-info, .contact-form');
    elementsToReveal.forEach(element => {
        element.classList.add('reveal');
    });
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = '#fff';
        header.style.backdropFilter = 'none';
    }
    
    reveal();
});

// Category card interactions
const categoryCards = document.querySelectorAll('.category-card');
categoryCards.forEach(card => {
    card.addEventListener('click', () => {
        const categoryName = card.querySelector('h3').textContent;
        showNotification(`Exploring ${categoryName} recipes...`, 'success');
        
        // Scroll to recipes section
        document.getElementById('recipes').scrollIntoView({ behavior: 'smooth' });
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Search functionality (bonus feature)
function addSearchFeature() {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
        <div class="search-box">
            <input type="text" id="searchInput" placeholder="Search recipes...">
            <button id="searchBtn"><i class="fas fa-search"></i></button>
        </div>
    `;
    
    // Insert search box after navigation
    const navbar = document.querySelector('.nav-container');
    navbar.appendChild(searchContainer);
    
    // Style the search container
    const searchStyle = document.createElement('style');
    searchStyle.textContent = `
        .search-container {
            display: flex;
            align-items: center;
        }
        
        .search-box {
            display: flex;
            align-items: center;
            background: #f8f9fa;
            border-radius: 25px;
            padding: 5px 15px;
            border: 2px solid transparent;
            transition: all 0.3s ease;
        }
        
        .search-box:focus-within {
            border-color: #ff6b35;
            background: white;
        }
        
        #searchInput {
            border: none;
            background: none;
            padding: 8px;
            outline: none;
            width: 200px;
            font-family: 'Poppins', sans-serif;
        }
        
        #searchBtn {
            border: none;
            background: none;
            cursor: pointer;
            color: #ff6b35;
            padding: 5px;
        }
        
        @media (max-width: 768px) {
            .search-container {
                display: none;
            }
        }
    `;
    document.head.appendChild(searchStyle);
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const recipeCards = document.querySelectorAll('.recipe-card');
        
        recipeCards.forEach(card => {
            const recipeName = card.querySelector('h3').textContent.toLowerCase();
            const recipeDescription = card.querySelector('p').textContent.toLowerCase();
            
            if (recipeName.includes(searchTerm) || recipeDescription.includes(searchTerm)) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.5s ease';
            } else {
                card.style.display = 'none';
            }
        });
        
        if (searchTerm === '') {
            recipeCards.forEach(card => {
                card.style.display = 'block';
            });
        }
    }
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// Initialize search feature
addSearchFeature();

// Print recipe functionality
function addPrintButton() {
    const printBtn = document.createElement('button');
    printBtn.className = 'btn btn-primary print-btn';
    printBtn.innerHTML = '<i class="fas fa-print"></i> Print Recipe';
    printBtn.style.cssText = 'margin-top: 1rem;';
    
    const modalContent = document.querySelector('.modal-content');
    modalContent.appendChild(printBtn);
    
    printBtn.addEventListener('click', () => {
        window.print();
    });
}

// Add print button when modal opens
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            if (modal.style.display === 'block') {
                if (!document.querySelector('.print-btn')) {
                    addPrintButton();
                }
            }
        }
    });
});

observer.observe(modal, { attributes: true });

// Print styles
const printStyles = document.createElement('style');
printStyles.textContent = `
    @media print {
        body * {
            visibility: hidden;
        }
        
        .modal-content, .modal-content * {
            visibility: visible;
        }
        
        .modal-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
        }
        
        .close, .print-btn {
            display: none !important;
        }
    }
`;
document.head.appendChild(printStyles);
