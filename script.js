document.addEventListener('DOMContentLoaded', function () {
    // =========================
    // Mobile Menu Toggle
    // =========================
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navbar = document.getElementById('navbar');
    const dropdowns = document.querySelectorAll('.dropdown > a');

    if (mobileMenuToggle && navbar) {
        // Toggle navbar active class
        mobileMenuToggle.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            navbar.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (e) {
            if (
                navbar.classList.contains('active') &&
                !navbar.contains(e.target) &&
                !mobileMenuToggle.contains(e.target)
            ) {
                navbar.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        });

        // Close menu on resize to desktop
        window.addEventListener('resize', function () {
            if (window.innerWidth > 768) {
                navbar.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        });

        // Handle dropdown menus on mobile
        dropdowns.forEach(dropdown => {
            dropdown.addEventListener('click', function (e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    const menu = this.nextElementSibling;
                    if (menu) {
                        menu.classList.toggle('active');
                    }
                }
            });
        });
    }

    // =========================
    // Video Fallback for Mobile
    // =========================
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        // Check if mobile or if video can't autoplay
        const isMobile =
            window.innerWidth <= 768 ||
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile) {
            heroVideo.style.display = 'none';
            const fallback = document.querySelector('.hero-fallback');
            if (fallback) fallback.style.display = 'block';
        } else {
            // Attempt to play video (may be blocked by browser policies)
            const playPromise = heroVideo.play();

            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('Video autoplay prevented:', error);
                    heroVideo.style.display = 'none';
                    const fallback = document.querySelector('.hero-fallback');
                    if (fallback) fallback.style.display = 'block';
                });
            }
        }
    }

    // =========================
    // Cart Functionality
    // =========================
    function getCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    function setCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    const cartCount = document.querySelector('.cart-count');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartOverlay = document.querySelector('.cart-overlay');
    const closeCart = document.querySelector('.close-cart');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotal = document.querySelector('.total-price');
    const cartIcon = document.querySelector('.cart-icon');

    function updateCartCount() {
        const cart = getCart();
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        if (cartCount) cartCount.textContent = totalItems;
    }

    function updateCartSidebar() {
        const cart = getCart();
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                </div>
            `;
            if (cartTotal) cartTotal.textContent = '$0.00';
            return;
        }

        let total = 0;

        cart.forEach(item => {
            const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
            total += price * item.quantity;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-img" loading="lazy">
                <div class="cart-item-details">
                    <h3 class="cart-item-title">${item.name}</h3>
                    <p class="cart-item-price">${item.price}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn plus">+</button>
                    </div>
                    <button class="remove-item">Remove</button>
                </div>
            `;

            cartItemsContainer.appendChild(cartItem);

            // Add event listeners for quantity buttons
            const minusBtn = cartItem.querySelector('.minus');
            const plusBtn = cartItem.querySelector('.plus');
            const removeBtn = cartItem.querySelector('.remove-item');

            minusBtn.addEventListener('click', () => {
                if (item.quantity > 1) {
                    item.quantity--;
                } else {
                    cart.splice(cart.indexOf(item), 1);
                }
                setCart(cart);
                updateCartSidebar();
                updateCartCount();
            });

            plusBtn.addEventListener('click', () => {
                item.quantity++;
                setCart(cart);
                updateCartSidebar();
                updateCartCount();
            });

            removeBtn.addEventListener('click', () => {
                cart.splice(cart.indexOf(item), 1);
                setCart(cart);
                updateCartSidebar();
                updateCartCount();
                showFeedback(`${item.name} removed from cart`);
            });
        });

        if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
    }

    // Add to cart functionality
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function () {
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('.product-title').textContent;
            const productPrice = productCard.querySelector('.current-price').textContent;

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
            updateCartSidebar();
            showFeedback(`${productName} added to cart`);
        });
    });

    // Toggle cart sidebar
    if (cartIcon && cartSidebar && cartOverlay && closeCart) {
        cartIcon.addEventListener('click', function (e) {
            e.preventDefault();
            cartSidebar.classList.add('open');
            cartOverlay.classList.add('active');
            document.body.classList.add('no-scroll');
            updateCartSidebar();
        });

        closeCart.addEventListener('click', function () {
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });

        cartOverlay.addEventListener('click', function () {
            cartSidebar.classList.remove('open');
            this.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    }

    // =========================
    // Wishlist Functionality
    // =========================
    const wishlistButtons = document.querySelectorAll('.wishlist-btn');

    wishlistButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            this.classList.toggle('active');
            const productName = this.closest('.product-card').querySelector('.product-title').textContent;
            showFeedback(this.classList.contains('active') ?
                `${productName} added to wishlist` :
                `${productName} removed from wishlist`);
        });
    });

    // =========================
    // Product Filtering & Sorting
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

    // Filter products by category and search term
    function filterProducts() {
        const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

        productCards.forEach(card => {
            const matchesCategory = selectedCategory === 'all' || card.dataset.category === selectedCategory;
            const title = card.querySelector('.product-title') ?
                card.querySelector('.product-title').textContent.toLowerCase() : '';
            const matchesSearch = title.includes(searchTerm);

            if (matchesCategory && matchesSearch) {
                card.classList.add('filtered-in');
            } else {
                card.classList.remove('filtered-in');
            }

            card.style.display = 'none';
        });

        currentPage = 1;
        updatePagination();
    }

    // Sort products
    function sortProducts() {
        const productsGrid = document.querySelector('.products-grid');
        const products = Array.from(document.querySelectorAll('.product-card.filtered-in'));

        products.sort((a, b) => {
            const priceA = a.querySelector('.current-price') ?
                parseFloat(a.querySelector('.current-price').textContent.replace(/[^\d.]/g, '')) : 0;
            const priceB = b.querySelector('.current-price') ?
                parseFloat(b.querySelector('.current-price').textContent.replace(/[^\d.]/g, '')) : 0;

            switch (sortFilter.value) {
                case 'price-low':
                    return priceA - priceB;
                case 'price-high':
                    return priceB - priceA;
                case 'newest':
                    const ratingA = a.querySelector('.product-rating span') ?
                        parseInt(a.querySelector('.product-rating span').textContent.replace(/[^\d]/g, '')) : 0;
                    const ratingB = b.querySelector('.product-rating span') ?
                        parseInt(b.querySelector('.product-rating span').textContent.replace(/[^\d]/g, '')) : 0;
                    return ratingB - ratingA;
                default:
                    return 0;
            }
        });

        products.forEach(product => {
            productsGrid.appendChild(product);
        });

        updatePagination();
    }

    // Update pagination
    function updatePagination() {
        const filteredProducts = Array.from(productCards).filter(card => card.classList.contains('filtered-in'));
        const totalItems = filteredProducts.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

        currentPage = Math.min(currentPage, totalPages);
        currentPage = Math.max(currentPage, 1);

        filteredProducts.forEach(card => {
            card.style.display = 'none';
        });

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        filteredProducts.slice(startIndex, endIndex).forEach(card => {
            card.style.display = 'block';
        });

        // Update pagination buttons
        pageButtons.forEach(button => {
            button.classList.remove('active', 'disabled');

            if (button.textContent.trim() === currentPage.toString()) {
                button.classList.add('active');
            }

            if (button.textContent.includes('Next') && currentPage >= totalPages) {
                button.classList.add('disabled');
            }
        });
    }

    // Event listeners for filtering and sorting
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }

    if (sortFilter) {
        sortFilter.addEventListener('change', sortProducts);
    }

    if (searchInput && searchButton) {
        searchInput.addEventListener('keyup', function (e) {
            if (e.key === 'Enter') {
                filterProducts();
            }
        });

        searchButton.addEventListener('click', filterProducts);
    }

    // Pagination button events
    pageButtons.forEach(button => {
        button.addEventListener('click', function (e) {
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

    // =========================
    // Feedback Messages
    // =========================
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

    // Initialize
    updateCartCount();
    filterProducts();

    // Add no-scroll class to body when modal is open
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && cartSidebar && cartSidebar.classList.contains('open')) {
            cartSidebar.classList.remove('open');
            if (cartOverlay) cartOverlay.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    });
});