// --- Core UI Controller --- //
const UI = {
    init() {
        this.bindEvents();
        
        // Initial check - default to Auth view
        this.switchView('auth-view');
        
        // Setup Toast container styles or rely on styles
    },

    bindEvents() {
        // --- Auth Switching ---
        document.getElementById('to-register').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('login-form').classList.remove('active-form');
            document.getElementById('register-form').classList.add('active-form');
        });

        document.getElementById('to-login').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('register-form').classList.remove('active-form');
            document.getElementById('login-form').classList.add('active-form');
        });

        // --- Auth Forms --- //
        document.getElementById('login-form').addEventListener('submit', this.handleLogin.bind(this));
        document.getElementById('register-form').addEventListener('submit', this.handleRegister.bind(this));
        document.getElementById('logout-btn').addEventListener('click', this.handleLogout.bind(this));

        // --- Navigation --- //
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Active state
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                // Show section
                const targetId = e.currentTarget.getAttribute('data-target');
                this.switchSection(targetId);
                
                // Load data based on section
                this.loadSectionData(targetId);
            });
        });

        // --- Search --- //
        document.getElementById('book-search').addEventListener('input', this.debounce(this.handleSearch.bind(this), 500));

        // --- Modals --- //
        document.getElementById('add-book-btn').addEventListener('click', () => this.openModal('add-book-modal'));
        document.getElementById('add-cat-btn').addEventListener('click', () => this.openModal('add-category-modal'));
        
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });
        document.getElementById('modal-overlay').addEventListener('click', () => this.closeAllModals());

        // --- Forms in Modals --- //
        document.getElementById('add-book-form').addEventListener('submit', this.handleAddBook.bind(this));
        document.getElementById('add-category-form').addEventListener('submit', this.handleAddCategory.bind(this));
        
        // Category Filters
        const filtersContainer = document.querySelector('.filters');
        if (filtersContainer) {
            filtersContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-btn')) {
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    this.filterBooks(e.target.getAttribute('data-category'));
                }
            });
        }

        // Profile Photo Setup
        const avatarContainer = document.getElementById('sidebar-avatar');
        const photoInput = document.getElementById('profile-photo-input');
        if (avatarContainer && photoInput) {
            avatarContainer.addEventListener('click', () => photoInput.click());
            photoInput.addEventListener('change', this.handlePhotoUpload.bind(this));
        }
    },

    // --- View/Section Switching --- //
    switchView(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
    },

    switchSection(sectionId) {
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        document.getElementById(sectionId).classList.add('active');
    },

    // --- Modal Management --- //
    openModal(modalId) {
        document.getElementById('modal-overlay').classList.add('show');
        document.getElementById(modalId).classList.add('show');
    },

    closeAllModals() {
        document.getElementById('modal-overlay').classList.remove('show');
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
    },

    // --- Loading Data Flow --- //
    async loadSectionData(targetId) {
        try {
            if (targetId === 'books-section') {
                await this.fetchBooks();
            } else if (targetId === 'my-books-section') {
                await this.fetchMyBooks();
            } else if (targetId === 'admin-dashboard-section') {
                await this.fetchAdminStats();
            } else if (targetId === 'manage-books-section') {
                await this.fetchBooks(true); // render admin table
            }
        } catch(e) {
            Toast.show('Failed to load data', 'error');
        }
    },

    async fetchInitialData() {
        try {
            // Get categories required for mapping IDs to names
            const catResponse = await API.categories.getAll();
            appState.categories = catResponse;
            Components.renderCategoryFilters();
            Components.renderCategorySelect();
            
            // Load initial books
            await this.fetchBooks();
        } catch (e) {
            console.warn("Failed to fetch initial categories. Is user logged in?", e);
        }
    },


    // --- Actions (Handlers) --- //

    async handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        
        const btn = document.getElementById('reg-btn');
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Loading...`;
        
        try {
            await API.auth.register({ username, email, password });
            Toast.show('Registration successful! Please login.', 'success');
            document.getElementById('to-login').click();
        } catch (error) {
            Toast.show(error.message, 'error');
        } finally {
            btn.innerHTML = `<span>Register</span> <i class="fa-solid fa-user-plus"></i>`;
        }
    },

    async handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        const btn = document.getElementById('login-btn');
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Loading...`;

        try {
            await API.auth.login({ username, password });
            Toast.show('Welcome to Lumina!', 'success');
            
            appState.isLoggedIn = true;
            appState.user = { username };
            
            // Fetch user profile to get photo
            try {
                const userProfile = await API.auth.getMe();
                if (userProfile.profile_photo) {
                    this.updateProfilePhotoUI(userProfile.profile_photo);
                }
            } catch (err) {
                console.warn("Could not fetch user profile details after login.");
            }
            
            // Setup dashboard
            document.getElementById('current-username').innerText = username;
            
            // Wait for initial data (Categories mapping) before showing dashboard
            await this.fetchInitialData();
            
            // Reset admin UI before checking
            appState.isAdmin = false;
            document.getElementById('admin-menu').classList.add('hidden');
            document.getElementById('user-role').classList.remove('role-admin');
            document.getElementById('user-role').classList.add('role-user');
            document.getElementById('user-role').innerText = 'Reader';
            
            // Check admin status (hacky way without direct user role JWT decoding)
            try {
                // If it succeeds, they have admin perms
                await API.admin.getStats();
                appState.isAdmin = true;
                document.getElementById('admin-menu').classList.remove('hidden');
                document.getElementById('user-role').classList.replace('role-user', 'role-admin');
                document.getElementById('user-role').innerText = 'Admin';
            } catch(admE) {
                // Not an admin, silently ignore
                appState.isAdmin = false;
                document.getElementById('admin-menu').classList.add('hidden');
            }

            this.switchView('dashboard-view');
            
        } catch (error) {
            Toast.show('Login failed. Check credentials.', 'error');
        } finally {
            btn.innerHTML = `<span>Sign In</span> <i class="fa-solid fa-arrow-right"></i>`;
        }
    },

    handleLogout() {
        // Since it's cookie based, we just clear auth state and hide dashboard.
        // A real API logout endpoint would be ideal, but we handle client side.
        appState.isLoggedIn = false;
        appState.user = null;
        
        // Clear search input to prevent persistence across active toggles
        const searchInput = document.getElementById('book-search');
        if (searchInput) searchInput.value = '';
        
        this.switchView('auth-view');
        Toast.show('Logged out successfully', 'info');
    },

    async fetchBooks(isAdminTable = false) {
        try {
            const books = await API.books.getAll();
            appState.books = books;
            this.renderBooks(books, isAdminTable);
        } catch (e) {
            Toast.show(e.message, 'error');
        }
    },
    
    async fetchMyBooks() {
        try {
            const issues = await API.issue.getMyBooks();
            const grid = document.getElementById('issued-books-grid');
            const emptyState = document.getElementById('no-issued-books');
            
            // Filter out returned books
            const activeIssues = (issues || []).filter(issue => !issue.returned);
            
            if (activeIssues.length === 0) {
                grid.innerHTML = '';
                emptyState.classList.remove('hidden');
            } else {
                emptyState.classList.add('hidden');
                
                // Map issue records to book objects using appState.books
                const myBooks = activeIssues.map(issue => {
                    const bookData = appState.books.find(b => b.id === issue.book_id) || { title: 'Unknown', author: 'Unknown', description: 'Book details not found.' };
                    return {
                        ...bookData,
                        issue_id: issue.id
                    };
                });
                
                grid.innerHTML = myBooks.map(b => Components.createBookCard(b, true, true)).join('');
            }
        } catch (e) {
            Toast.show(e.message, 'error');
        }
    },
    
    async fetchAdminStats() {
        try {
            const stats = await API.admin.getStats();
            // Animate counting
            this.animateValue('stat-users', 0, stats.total_users || 0, 1000);
            this.animateValue('stat-books', 0, stats.total_books || 0, 1000);
            this.animateValue('stat-issued', 0, stats.issued_books || 0, 1000);
        } catch(e) {
             Toast.show("Failed fetching stats", 'error');
        }
    },

    renderBooks(booksArray, isAdminTable) {
        if(isAdminTable) {
             const tbody = document.getElementById('admin-books-table');
             tbody.innerHTML = booksArray.map(b => Components.createAdminBookRow(b)).join('');
        } else {
             const grid = document.getElementById('books-grid');
             grid.innerHTML = booksArray.map(b => Components.createBookCard(b)).join('');
        }
    },

    async handleSearch(e) {
        const query = e.target.value;
        if (query.trim() === '') {
            this.renderBooks(appState.books);
            return;
        }

        try {
            const results = await API.books.search(query);
            this.renderBooks(results);
        } catch (error) {
            // ignore empty search results
        }
    },

    filterBooks(categoryId) {
        if (categoryId === 'all') {
            this.renderBooks(appState.books);
            return;
        }
        
        const filtered = appState.books.filter(b => b.category_id == categoryId);
        this.renderBooks(filtered);
    },

    async handleAddCategory(e) {
        e.preventDefault();
        const name = document.getElementById('new-category-name').value;
        
        try {
            await API.categories.add({ name });
            Toast.show('Category created!', 'success');
            this.closeAllModals();
            document.getElementById('add-category-form').reset();
            
            // refresh mapping
            const cats = await API.categories.getAll();
            appState.categories = cats;
            Components.renderCategoryFilters();
            Components.renderCategorySelect();
        } catch (e) {
            Toast.show(e.message, 'error');
        }
    },

    async handleAddBook(e) {
        e.preventDefault();
        
        const bookData = {
            title: document.getElementById('new-book-title').value,
            author: document.getElementById('new-book-author').value,
            category_id: parseInt(document.getElementById('new-book-category').value),
            total_books: parseInt(document.getElementById('new-book-total').value),
            description: document.getElementById('new-book-desc').value
        };

        try {
            await API.books.add(bookData);
            Toast.show('Book added successfully!', 'success');
            this.closeAllModals();
            document.getElementById('add-book-form').reset();
            
            // Refresh tables
            this.fetchBooks(true); 
            
        } catch (e) {
            Toast.show(e.message, 'error');
        }
    },

    async handleDeleteBook(id) {
        if(!confirm('Are you sure you want to delete this book?')) return;
        
        try {
            await API.books.delete(id);
            Toast.show('Book deleted!', 'success');
            this.fetchBooks(true);
        } catch (e) {
            Toast.show(e.message, 'error');
        }
    },

    async handleIssueBook(bookId) {
        try {
            await API.issue.issueBook(bookId);
            Toast.show('Book borrowed successfully!', 'success');
            this.fetchBooks(); // Refresh availability
        } catch(e) {
            Toast.show(e.message, 'error');
        }
    },

    async handleReturn(issueId) {
        try {
            await API.issue.returnBook(issueId);
            Toast.show('Book returned!', 'success');
            this.fetchMyBooks(); // Refresh list
        } catch (e) {
            Toast.show(e.message, 'error');
        }
    },

    async handlePhotoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            Toast.show('Please select an image file', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            Toast.show('Uploading photo...', 'info');
            const data = await API.auth.uploadPhoto(formData);
            Toast.show('Photo uploaded successfully!', 'success');
            
            this.updateProfilePhotoUI(data.profile_photo);
        } catch (error) {
            Toast.show('Failed to upload photo: ' + error.message, 'error');
        } finally {
            // Reset input
            e.target.value = '';
        }
    },

    updateProfilePhotoUI(photoUrl) {
        const img = document.getElementById('profile-img');
        const icon = document.getElementById('profile-icon');
        if (img && icon) {
            // Append timestamp to bust cache if reloading same filename
            img.src = `http://127.0.0.1:8000${photoUrl}?t=${new Date().getTime()}`;
            img.style.display = 'block';
            icon.style.display = 'none';
        }
    },

    // Utilities
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    animateValue(id, start, end, duration) {
        if (start === end) return;
        var range = end - start;
        var current = start;
        var increment = end > start? 1 : -1;
        var stepTime = Math.abs(Math.floor(duration / range));
        var obj = document.getElementById(id);
        if(!obj) return;
        
        var timer = setInterval(function() {
            current += increment;
            obj.innerHTML = current;
            if (current == end) {
                clearInterval(timer);
            }
        }, stepTime);
    }
};

// Make UI global for inline onclick handlers from components.js
window.UI = UI;

// Initialize when ready
document.addEventListener('DOMContentLoaded', () => {
    // Add toast structure inside app.js for fallback, but it's already in index.html
    const toastCheck = document.getElementById('toast-container');
    if(!toastCheck) {
        Toast.container = document.createElement('div');
        Toast.container.id = 'toast-container';
        Toast.container.className = 'toast-container';
        document.body.appendChild(Toast.container);
    } else {
        Toast.container = toastCheck;
    }

    // Replace JS Toast with better html structure support
    Toast.show = function(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let iconClass = 'fa-info-circle';
        if(type === 'success') iconClass = 'fa-check-circle';
        if(type === 'error') iconClass = 'fa-exclamation-circle';

        toast.innerHTML = `
            <i class="fa-solid ${iconClass}"></i>
            <p>${message}</p>
        `;
        
        this.container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, 3000);
    };

    UI.init();
});
