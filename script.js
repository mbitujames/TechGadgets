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