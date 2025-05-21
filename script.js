document.addEventListener('DOMContentLoaded', function() {
  // Cart functionality
  let cart = [];
  const cartCount = document.querySelector('.cart-count');
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  
  // Add to cart button event listeners
  addToCartButtons.forEach(button => {
    button.addEventListener('click', function() {
      const productCard = this.closest('.product-card');
      const productName = productCard.querySelector('.product-title').textContent;
      const productPrice = productCard.querySelector('.product-price').textContent;
      
      // Add product to cart
      const existingItem = cart.find(item => item.name === productName);
      
      if (existingItem) {
        existingItem.quantity++;
      } else {
        cart.push({
          name: productName,
          price: productPrice,
          quantity: 1
        });
      }
      
      // Update cart count
      updateCartCount();
      
      // Show feedback
      showFeedback(`${productName} added to cart`);
    });
  });
  
  // Update cart count
  function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
  }
  
  // Show feedback message
  function showFeedback(message) {
    const feedback = document.createElement('div');
    feedback.className = 'feedback-message';
    feedback.textContent = message;
    document.body.appendChild(feedback);
    
    // Show feedback
    setTimeout(() => {
      feedback.classList.add('show');
    }, 10);
    
    // Hide feedback after 2 seconds
    setTimeout(() => {
      feedback.classList.remove('show');
      
      // Remove from DOM after animation
      setTimeout(() => {
        document.body.removeChild(feedback);
      }, 300);
    }, 2000);
  }
  
  // Add feedback styles dynamically
  const style = document.createElement('style');
  style.textContent = `
    .feedback-message {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: var(--primary);
      color: white;
      padding: 12px 24px;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow);
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 1000;
    }
    
    .feedback-message.show {
      opacity: 1;
    }
  `;
  document.head.appendChild(style);
  
  // Mobile menu toggle (for smaller screens)
  const mobileMenuToggle = document.createElement('div');
  mobileMenuToggle.className = 'mobile-menu-toggle';
  mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
  
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelector('.nav-links');
  
  // Check if mobile menu toggle needed
  function checkMobileMenu() {
    if (window.innerWidth <= 768) {
      if (!document.querySelector('.mobile-menu-toggle')) {
        navbar.insertBefore(mobileMenuToggle, navLinks);
        navLinks.classList.add('mobile-hidden');
      }
    } else {
      if (document.querySelector('.mobile-menu-toggle')) {
        navbar.removeChild(mobileMenuToggle);
        navLinks.classList.remove('mobile-hidden');
      }
    }
  }
  
  // Initial check
  checkMobileMenu();
  
  // Toggle mobile menu
  document.addEventListener('click', function(e) {
    if (e.target.closest('.mobile-menu-toggle')) {
      navLinks.classList.toggle('mobile-hidden');
    }
  });
  
  // Check on resize
  window.addEventListener('resize', checkMobileMenu);
});
document.addEventListener('DOMContentLoaded', function() {
    // Filter products by category
    const categoryFilter = document.getElementById('category');
    const productCards = document.querySelectorAll('.product-card');
    
    categoryFilter.addEventListener('change', function() {
        const selectedCategory = this.value;
        
        productCards.forEach(card => {
            if (selectedCategory === 'all' || card.dataset.category === selectedCategory) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
    
    // Sort products
    const sortFilter = document.getElementById('sort');
    
    sortFilter.addEventListener('change', function() {
        const productsGrid = document.querySelector('.products-grid');
        const products = Array.from(document.querySelectorAll('.product-card'));
        
        products.sort((a, b) => {
            const priceA = parseFloat(a.querySelector('.current-price').textContent.replace('$', '').replace(',', ''));
            const priceB = parseFloat(b.querySelector('.current-price').textContent.replace('$', '').replace(',', ''));
            
            switch(this.value) {
                case 'price-low':
                    return priceA - priceB;
                case 'price-high':
                    return priceB - priceA;
                case 'newest':
                    // For demo purposes, we'll sort by rating count (higher first)
                    const ratingA = parseInt(a.querySelector('.product-rating span').textContent.replace(/[^\d]/g, ''));
                    const ratingB = parseInt(b.querySelector('.product-rating span').textContent.replace(/[^\d]/g, ''));
                    return ratingB - ratingA;
                default: // 'featured'
                    return 0; // Keep original order
            }
        });
        
        // Re-append sorted products
        products.forEach(product => {
            productsGrid.appendChild(product);
        });
    });
    
    // Search functionality
    const searchInput = document.querySelector('.search-box input');
    const searchButton = document.querySelector('.search-box button');
    
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        
        productCards.forEach(card => {
            const title = card.querySelector('.product-title').textContent.toLowerCase();
            if (title.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    searchButton.addEventListener('click', performSearch);
    
    // Pagination
    const itemsPerPage = 12;
    let currentPage = 1;
    const pageButtons = document.querySelectorAll('.page-btn');
    
    function updatePagination() {
        const totalItems = document.querySelectorAll('.product-card[style="display: block"]').length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        // Hide all products
        document.querySelectorAll('.product-card').forEach(card => {
            card.style.display = 'none';
        });
        
        // Show products for current page
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        const visibleProducts = Array.from(document.querySelectorAll('.product-card[style="display: none"]'))
            .filter(card => window.getComputedStyle(card).display !== 'none');
            
        visibleProducts.slice(startIndex, endIndex).forEach(card => {
            card.style.display = 'block';
        });
        
        // Update pagination buttons
        pageButtons.forEach(button => {
            button.classList.remove('active');
            if (button.textContent.trim() === currentPage.toString()) {
                button.classList.add('active');
            }
        });
    }
    
    pageButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (this.textContent.includes('Next')) {
                currentPage++;
            } else {
                currentPage = parseInt(this.textContent);
            }
            
            updatePagination();
        });
    });
    
    // Initialize
    updatePagination();
});