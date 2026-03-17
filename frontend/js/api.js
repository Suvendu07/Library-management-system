// API Configuration & Helpers
const API_BASE_URL = 'http://127.0.0.1:8000';

const API = {
    
    // Core Fetch Wrapper
    async request(endpoint, options = {}) {
        // We MUST include credentials so the FastAPI backend reads/sets the HttpOnly (or standard) token cookie
        options.credentials = 'include';
        options.headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            
            // Check for unauthorized to force logout
            if (response.status === 401) {
                // Ignore if it's the login route itself returning 401 for bad pw
                if(endpoint !== '/auth/login') {
                    appState.isLoggedIn = false;
                    appState.user = null;
                    document.dispatchEvent(new Event('authChange'));
                }
            }
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.detail || data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    },

    // --- Authentication --- //
    
    auth: {
        async register(userData) {
            return API.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
        },
        async login(credentials) {
            return API.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials)
            });
        },
        async getMe() {
            return API.request('/auth/me');
        },
        async uploadPhoto(formData) {
            // Need to drop standard Content-Type so browser sets multipart form boundary
            const options = {
                method: 'POST',
                body: formData,
                credentials: 'include',
                headers: {} // Let browser set Content-Type correctly
            };
            try {
                const response = await fetch(`${API_BASE_URL}/auth/upload-photo`, options);
                const data = await response.json();
                if (!response.ok) throw new Error(data.detail || data.message || 'Upload failed');
                return data;
            } catch (error) {
                console.error('API Error (/auth/upload-photo):', error);
                throw error;
            }
        }
    },

    // --- Books --- //
    
    books: {
        async getAll(skip = 0, limit = 50) {
            return API.request(`/books/?skip=${skip}&limit=${limit}`);
        },
        async search(query) {
            // Note: encodeURIComponent is important for query params
            return API.request(`/books/search?query=${encodeURIComponent(query)}`);
        },
        async add(bookData) {
            return API.request('/books/', {
                method: 'POST',
                body: JSON.stringify(bookData)
            });
        },
        async delete(id) {
            return API.request(`/books/${id}`, {
                method: 'DELETE'
            });
        }
    },

    // --- Categories --- //
    
    categories: {
        async getAll() {
            return API.request('/categories/');
        },
        async add(categoryData) {
            return API.request('/categories/', {
                method: 'POST',
                body: JSON.stringify(categoryData)
            });
        },
        async delete(id) {
            return API.request(`/categories/${id}`, {
                method: 'DELETE'
            });
        }
    },

    // --- Issuing --- //
    
    issue: {
        async issueBook(bookId) {
            return API.request('/issue/book', {
                method: 'POST',
                body: JSON.stringify({ book_id: Number(bookId) })
            });
        },
        async returnBook(issueId) {
            return API.request(`/issue/return-book?issue_id=${issueId}`, {
                method: 'POST',
            });
        },
        async getMyBooks() {
            return API.request('/issue/my-books');
        },
        async getAllIssuedBooks() {
            return API.request('/issue/issued-books');
        }
    },

    // --- Admin --- //
    
    admin: {
        async getStats() {
            return API.request('/admin/stats');
        }
    }
};
