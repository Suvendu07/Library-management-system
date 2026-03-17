// --- State Management --- //
const appState = {
    isLoggedIn: false,
    user: null, // { username: '', email: '' }
    isAdmin: false, 
    categories: [],
    books: [],
    issuedBooks: [],
    currentView: 'dashboard-view',
};

// --- Toast Notifications --- //
const Toast = {
    container: document.getElementById('toast-container'),
    
    show(message, type = 'info') {
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

        // Auto remove
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                if (this.container.contains(toast)) {
                    this.container.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
};

// --- UI Components --- //
const Components = {
    
    // Render a single book card
    createBookCard(book, isIssued = false, isMyBookView = false) {
        
        // Find category name
        const category = appState.categories.find(c => c.id === book.category_id);
        const catName = category ? category.name : 'Unknown';
        
        // Handle availability logic
        // Use available_books instead of total_books
        const copiesAvailable = book.available_books > 0;
        let availabilityHTML = '';
        let buttonHTML = '';

        if (isMyBookView) {
            // View structure for "My Books" (Return logic needed here or handled by issue ID)
            // But API returns whole objects for /my-books or just issues? Assuming `/my-books` returns book list or list of issues.
            // Let's assume the API returns a list of book objects mixed with issue_id.
            buttonHTML = `<button class="btn return-btn issue-btn" onclick="UI.handleReturn(${book.issue_id || book.id})">Return Book</button>`;
        } else {
            // Regular Browse View
            availabilityHTML = copiesAvailable 
                ? `<span class="copies-info available"><i class="fa-solid fa-check"></i> ${book.available_books} Available</span>`
                : `<span class="copies-info unavailable"><i class="fa-solid fa-times"></i> Out of Stock</span>`;
                
            buttonHTML = `<button class="btn issue-btn" 
                            ${!copiesAvailable ? 'disabled' : ''} 
                            onclick="UI.handleIssueBook(${book.id})">
                            Borrow
                          </button>`;
        }

        return `
            <div class="book-card glass-panel group">
                <span class="book-category">${catName}</span>
                <h3>${book.title}</h3>
                <p class="author"><i class="fa-solid fa-pen-nib"></i> ${book.author}</p>
                <p class="book-desc">${book.description}</p>
                <div class="book-footer">
                    ${availabilityHTML}
                    ${buttonHTML}
                </div>
            </div>
        `;
    },

    // Render Admin Book Row
    createAdminBookRow(book) {
        const category = appState.categories.find(c => c.id === book.category_id);
        const catName = category ? category.name : 'Unknown';

        return `
            <tr>
                <td>#${book.id}</td>
                <td><strong>${book.title}</strong></td>
                <td>${book.author}</td>
                <td><span class="badge" style="background: rgba(255,255,255,0.1)">${catName}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon" title="Delete" onclick="UI.handleDeleteBook(${book.id})">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    },

    // Render category filtering buttons
    renderCategoryFilters() {
        const container = document.getElementById('category-filters');
        container.innerHTML = appState.categories.map(cat => `
            <button class="filter-btn" data-category="${cat.id}">${cat.name}</button>
        `).join('');
    },
    
    // Render category options in <select> dropdown
    renderCategorySelect() {
        const select = document.getElementById('new-book-category');
        select.innerHTML = `<option value="" disabled selected>Select Category</option>` + 
            appState.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
    }
};
