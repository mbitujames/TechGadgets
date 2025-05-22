document.addEventListener('DOMContentLoaded', function() {
  // =========================
  // Cart functionality (with localStorage)
  // =========================
  function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
  }

  function setCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  const cartCount = document.querySelector('.cart-count');
  const addToCartButtons = document.querySelectorAll('.add-to-cart');

  function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalItems;
  }

  addToCartButtons.forEach(button => {
    button.addEventListener('click', function() {
      const productCard = this.closest('.product-card');
      const productName = productCard.querySelector('.product-title').textContent;
      const productPrice = productCard.querySelector('.product-price').textContent;

      let cart = getCart();
      const existingItem = cart.find(item => item.name === productName);

      if (existingItem) {
        existingItem.quantity++;
      } else {
        const productImage = productCard.querySelector('.product-image')?.getAttribute('src') || '';
        cart.push({
          name: productName,
          price: productPrice,
          quantity: 1,
          image: productImage
        });
      }
      setCart(cart);
      updateCartCount();
      showFeedback(`${productName} added to cart`);
    });
  });

  // On page load, update cart count
  updateCartCount();

  function showFeedback(message) {
    const feedback = document.createElement('div');
    feedback.className = 'feedback-message';
    feedback.textContent = message;
    document.body.appendChild(feedback);

    setTimeout(() => {
      feedback.classList.add('show');
    }, 10);

    setTimeout(() => {
      feedback.classList.remove('show');
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
    .wishlist-btn.active i {
      color: #e74c3c;
    }
    .page-btn.disabled {
      pointer-events: none;
      opacity: 0.5;
    }
  `;
  document.head.appendChild(style);

  // =========================
  // Mobile menu toggle
  // =========================
  const mobileMenuToggle = document.createElement('div');
  mobileMenuToggle.className = 'mobile-menu-toggle';
  mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';

  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelector('.nav-links');

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

  checkMobileMenu();

  document.addEventListener('click', function(e) {
    if (e.target.closest('.mobile-menu-toggle')) {
      navLinks.classList.toggle('mobile-hidden');
    }
  });

  window.addEventListener('resize', checkMobileMenu);

  // =========================
  // Product Filtering, Sorting, Search, Pagination
  // =========================
  const categoryFilter = document.getElementById('category');
  const productCards = document.querySelectorAll('.product-card');
  const sortFilter = document.getElementById('sort');
  const searchInput = document.querySelector('.search-box input');
  const searchButton = document.querySelector('.search-box button');
  const itemsPerPage = 12;
  let currentPage = 1;
  const pageButtons = document.querySelectorAll('.page-btn');

  // Auto-select category from URL if present
  const params = new URLSearchParams(window.location.search);
  const urlCategory = params.get('category');
  if (categoryFilter) {
    if (urlCategory) {
      categoryFilter.value = urlCategory;
    } else {
      categoryFilter.value = 'all';
    }
  }

  // Filtering
  function filterProducts() {
    const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    productCards.forEach(card => {
      const matchesCategory = (selectedCategory === 'all' || card.dataset.category === selectedCategory);
      const title = card.querySelector('.product-title') ? card.querySelector('.product-title').textContent.toLowerCase() : '';
      const matchesSearch = title.includes(searchTerm);
      if (matchesCategory && matchesSearch) {
        card.classList.add('filtered-in');
      } else {
        card.classList.remove('filtered-in');
      }
      // Hide all by default; pagination will show the right ones
      card.style.display = 'none';
    });
    currentPage = 1;
    updatePagination();
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', filterProducts);
  }

  // Sorting
  if (sortFilter) {
    sortFilter.addEventListener('change', function() {
      const productsGrid = document.querySelector('.products-grid');
      const products = Array.from(document.querySelectorAll('.product-card'));

      products.sort((a, b) => {
        const priceA = a.querySelector('.current-price') ? parseFloat(a.querySelector('.current-price').textContent.replace('$', '').replace(',', '')) : 0;
        const priceB = b.querySelector('.current-price') ? parseFloat(b.querySelector('.current-price').textContent.replace('$', '').replace(',', '')) : 0;
        switch(this.value) {
          case 'price-low':
            return priceA - priceB;
          case 'price-high':
            return priceB - priceA;
          case 'newest':
            // For demo purposes, we'll sort by rating count (higher first)
            const ratingA = a.querySelector('.product-rating span') ? parseInt(a.querySelector('.product-rating span').textContent.replace(/[^\d]/g, '')) : 0;
            const ratingB = b.querySelector('.product-rating span') ? parseInt(b.querySelector('.product-rating span').textContent.replace(/[^\d]/g, '')) : 0;
            return ratingB - ratingA;
          default: // 'featured'
            return 0; // Keep original order
        }
      });

      // Re-append sorted products
      products.forEach(product => {
        productsGrid.appendChild(product);
      });
      filterProducts();
    });
  }

  // Search functionality
  function performSearch() {
    filterProducts();
  }

  if (searchInput && searchButton) {
    searchInput.addEventListener('keyup', function(e) {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
    searchButton.addEventListener('click', performSearch);
  }

  // Pagination
  function updatePagination() {
    const filteredProducts = Array.from(productCards).filter(card => card.classList.contains('filtered-in'));
    const totalItems = filteredProducts.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    // Clamp currentPage to valid range
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    // Hide all filtered products
    filteredProducts.forEach(card => {
      card.style.display = 'none';
    });

    // Show products for current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    filteredProducts.slice(startIndex, endIndex).forEach(card => {
      card.style.display = 'block';
    });

    // Update pagination buttons
    pageButtons.forEach((button) => {
      button.classList.remove('active', 'disabled');
      if (button.textContent.trim() === currentPage.toString()) {
        button.classList.add('active');
      }
      if (button.textContent.includes('Next')) {
        if (currentPage >= totalPages) {
          button.classList.add('disabled');
        }
      }
    });
  }

  pageButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      if (this.textContent.includes('Next')) {
        if (!this.classList.contains('disabled')) {
          currentPage++;
        }
      } else {
        const pageNum = parseInt(this.textContent);
        if (!isNaN(pageNum)) {
          currentPage = pageNum;
        }
      }
      updatePagination();
    });
  });

  // Whitelist functionality
  const wishlistButtons = document.querySelectorAll('.wishlist-btn');
  wishlistButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      this.classList.toggle('active');
      showFeedback('Added to wishlist!');
    });
  });

  

  // Initialize
  filterProducts();
});