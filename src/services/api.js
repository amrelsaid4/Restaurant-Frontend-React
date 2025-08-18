import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://restaurant-backend-django-jak1.vercel.app';

// Validate the URL format
if (!API_BASE_URL.startsWith('http')) {
  console.error('❌ Invalid API_BASE_URL:', API_BASE_URL);
}

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Debug: Log the base URL
console.log('🔗 API Base URL:', API_BASE_URL);

// Add response interceptor to handle session cookies
api.interceptors.response.use(
  (response) => {
    // Check if response is HTML instead of JSON
    if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
      console.error('❌ Received HTML instead of JSON from:', response.config.url);
      return Promise.reject(new Error('Server returned HTML instead of JSON. Check if backend is running correctly.'));
    }
    
    // Store session key if provided
    if (response.data && response.data.session_key) {
      localStorage.setItem('session_key', response.data.session_key);
    }
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Add request interceptor to include session key
api.interceptors.request.use(
  (config) => {
    console.log('🌐 Making request to:', config.baseURL + config.url);
    const sessionKey = localStorage.getItem('session_key');
    if (sessionKey) {
      config.headers['X-Session-Key'] = sessionKey;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// CSRF Token Management
let csrfToken = null;

const fetchCSRFToken = async () => {
  try {
    const response = await api.get('/api/csrf-token/');
    csrfToken = response.data.csrf_token;
    return csrfToken;
    } catch (error) {
        return null;
    }
};

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (method, url, data = null, options = {}) => {
  try {
    // Ensure we have a CSRF token for non-GET requests
    if (method !== 'GET' && !csrfToken) {
      await fetchCSRFToken();
    }

    const config = {
            method,
      url,
      withCredentials: true,
      ...options
    };

    // Add session key if available
    const sessionKey = localStorage.getItem('session_key');
    if (sessionKey) {
      config.headers = {
        ...config.headers,
        'X-Session-Key': sessionKey
      };
      console.log('🔑 Adding session key to request:', sessionKey.substring(0, 10) + '...');
    }

    // Add CSRF token for non-GET requests
    if (method !== 'GET' && csrfToken) {
      config.headers = {
        ...config.headers,
        'X-CSRFToken': csrfToken
      };
    }

    if (data) {
      config.data = data;
    }

    if (data instanceof FormData) {
      if (config.headers) {
        config.headers['Content-Type'] = undefined;
      }
    }

    console.log('📡 Making authenticated request to:', url, 'with headers:', config.headers);
    const response = await api(config);
    return response.data;
  } catch (error) {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      // Session expired, forbidden, or invalid.
      // The backend returns 403 for invalid session keys.
      // Clearing local storage will force a re-login via the AuthContext.
      console.log(`❌ Auth error (${status}). Session invalid, clearing localStorage.`);
      localStorage.removeItem('session_key');
      localStorage.removeItem('user_data');
    }
    throw error; // Always re-throw so the calling function knows about the error.
  }
};

// Auth API
export const authAPI = {
  // Test endpoint to check if backend is reachable
  testConnection: async () => {
    try {
      console.log('🔍 Testing backend connection...');
      const response = await api.get('/api/health-check/');
      console.log('✅ Backend connection successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Backend connection failed:', error.message);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      console.log('📡 Customer login API call:', { identity: credentials.identity });
      
      // Fetch CSRF token first
      await fetchCSRFToken();
      console.log('🔑 CSRF token ready for customer login');
      
      const response = await api.post('/api/login/', credentials, {
        withCredentials: true,
        headers: {
          'X-CSRFToken': csrfToken,
          'Content-Type': 'application/json',
        }
      });
      
      console.log('✅ Customer login API response:', response.data);
      
      // Save session key to localStorage
      if (response.data.session_key) {
        localStorage.setItem('session_key', response.data.session_key);
        console.log('💾 Session key saved to localStorage:', response.data.session_key.substring(0, 10) + '...');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Customer login API error:', error.response?.data || error.message);
      const errorData = error.response?.data || { error: 'Login failed' };
      throw new Error(errorData.error || 'Authentication failed');
    }
  },

  register: async (userData) => {
    console.log('📡 Register API call');
    return makeAuthenticatedRequest('POST', '/api/register/', userData);
  },

  resendVerificationEmail: async (email) => {
    console.log('📡 Resend verification email API call');
    return makeAuthenticatedRequest('POST', '/api/resend-verification-email/', { email });
  },

  logout: async () => {
    try {
      console.log('📡 Logout API call');
      await makeAuthenticatedRequest('POST', '/api/logout/');
      console.log('✅ Logout API successful');
    } catch (error) {
      // Ignore logout errors - even if backend fails, we clear local session
      console.warn('⚠️ Logout request failed, but clearing local session:', error.message);
    } finally {
      // Always clear local session data
      localStorage.removeItem('session_key');
    }
  },

  checkUserType: async () => {
    console.log('📡 Check user type API call');
    const result = await makeAuthenticatedRequest('GET', '/api/check-user-type/');
    console.log('✅ Check user type response:', result);
    return result;
  },

  getUserProfile: async () => {
    console.log('📡 Get user profile API call');
    return makeAuthenticatedRequest('GET', '/api/profile/');
  }
};

// Menu API
export const menuAPI = {
  getCategories: () => makeAuthenticatedRequest('GET', '/api/categories/'),
  getDishes: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return makeAuthenticatedRequest('GET', `/api/dishes/${queryString ? '?' + queryString : ''}`);
  },
  getMostOrderedDishes: () => makeAuthenticatedRequest('GET', '/api/dishes/most_ordered/'),
  getDish: (id) => makeAuthenticatedRequest('GET', `/api/dishes/${id}/`),
  getDishRatings: (dishId) => makeAuthenticatedRequest('GET', `/api/dishes/${dishId}/ratings/`)
};

// Orders API
export const ordersAPI = {
  getOrders: () => makeAuthenticatedRequest('GET', '/api/orders/'),
  createOrder: (orderData) => makeAuthenticatedRequest('POST', '/api/orders/', orderData)
};

// Ratings API
export const ratingsAPI = {
  submitRating: async (ratingData) => {
    try {
      const result = await makeAuthenticatedRequest('POST', '/api/add-rating/', ratingData);
      
      return result;
    } catch (error) {
      throw error;
    }
  },

  updateRating: async (ratingId, ratingData) => {
    try {
      const result = await makeAuthenticatedRequest('PUT', `/api/update-rating/${ratingId}/`, ratingData);

        return result;
    } catch (error) {
        throw error;
    }
  }
};

// Restaurant API
export const restaurantAPI = {
  getInfo: () => makeAuthenticatedRequest('GET', '/api/restaurant-info/'),
  getMenuOverview: () => makeAuthenticatedRequest('GET', '/api/menu-overview/'),
  getHomepageStats: () => makeAuthenticatedRequest('GET', '/api/homepage-stats/')
};

// Contact API
export const contactAPI = {
  sendMessage: (messageData) => makeAuthenticatedRequest('POST', '/api/contact/', messageData),
};

// Checkout API
export const checkoutAPI = {
  createCheckoutSession: (checkoutData) => makeAuthenticatedRequest('POST', '/api/stripe/create-checkout-session/', checkoutData),
  verifyPayment: (sessionId) => makeAuthenticatedRequest('GET', `/api/stripe/success/?session_id=${sessionId}`),
  getStripeConfig: () => makeAuthenticatedRequest('GET', '/api/stripe/config/')
};

// Admin API
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => makeAuthenticatedRequest('GET', '/api/admin/dashboard/'),
  
  // Orders
  getOrders: () => makeAuthenticatedRequest('GET', '/api/admin/orders/'),
  updateOrderStatus: (orderId, status) => makeAuthenticatedRequest('PATCH', `/api/admin/orders/${orderId}/update_status/`, { status }),
  
  // Dishes
  getDishes: () => makeAuthenticatedRequest('GET', '/api/admin/dishes/'),
  createDish: async (dishData) => {
    const formData = new FormData();
    for (const key in dishData) {
      if (key === 'image' && dishData.image instanceof File) {
        formData.append('image', dishData.image, dishData.image.name);
      } else if (dishData[key] !== null && dishData[key] !== undefined) {
        formData.append(key, dishData[key]);
      }
    }
    
    // Log the data before sending, as you suggested.
    console.log("--- Sending FormData for CREATE ---");
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    return makeAuthenticatedRequest('POST', '/api/admin/dishes/', formData);
  },
  
  updateDish: async (dishId, dishData) => {
    const formData = new FormData();
    for (const key in dishData) {
      // For updates, only append the image if a new one is provided.
      if (key === 'image' && dishData.image instanceof File) {
        formData.append('image', dishData.image, dishData.image.name);
      } else if (key !== 'image' && dishData[key] !== null && dishData[key] !== undefined) {
        formData.append(key, dishData[key]);
      }
    }
    
    console.log(`--- Sending FormData for UPDATE (Dish ID: ${dishId}) ---`);
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }
    
    return makeAuthenticatedRequest('PATCH', `/api/admin/dishes/${dishId}/`, formData);
  },
  
  setDishAvailability: (dishId, isAvailable) => makeAuthenticatedRequest('PATCH', `/api/admin/dishes/${dishId}/set-availability/`, { is_available: isAvailable }),
  deleteDish: (dishId) => makeAuthenticatedRequest('DELETE', `/api/admin/dishes/${dishId}/`),
  
  // Categories
  getCategories: () => makeAuthenticatedRequest('GET', '/api/admin/categories/'),
  createCategory: (categoryData) => makeAuthenticatedRequest('POST', '/api/admin/categories/', categoryData),
  updateCategory: (categoryId, categoryData) => makeAuthenticatedRequest('PUT', `/api/admin/categories/${categoryId}/`, categoryData),
  deleteCategory: (categoryId) => makeAuthenticatedRequest('DELETE', `/api/admin/categories/${categoryId}/`),
  
  // Customers
  getCustomers: () => makeAuthenticatedRequest('GET', '/api/admin/customers/'),

  // Contact Messages
  getMessages: () => makeAuthenticatedRequest('GET', '/api/admin/messages/'),
};

export default api;

// Generic API service function for backward compatibility
export const apiService = async (endpoint, method = 'GET', data = null) => {
  try {
    const config = {
      method,
      url: `/api/${endpoint}`,
      withCredentials: true,
    };

    // Add CSRF token for non-GET requests
    if (method !== 'GET' && !csrfToken) {
      await fetchCSRFToken();
    }

    if (method !== 'GET' && csrfToken) {
      config.headers = {
        ...config.headers,
        'X-CSRFToken': csrfToken
      };
    }

    if (data) {
      config.data = data;
    }

    const response = await api(config);
    return response.data;
    } catch (error) {
    if (error.response?.status === 403) {
      // CSRF token might be expired, try to refresh it
      await fetchCSRFToken();
      throw error;
    }
        throw error;
    }
};

// Rating functions for backward compatibility
export const submitRating = ratingsAPI.submitRating;
export const updateRating = ratingsAPI.updateRating;

// Profile functions for backward compatibility
export const getUserProfile = authAPI.getUserProfile;

// Admin functions for backward compatibility
export const getDashboardStats = adminAPI.getDashboardStats;
export const getOrders = adminAPI.getOrders;
export const updateOrderStatus = adminAPI.updateOrderStatus;
export const getDishes = adminAPI.getDishes;
export const createDish = adminAPI.createDish;
export const updateDish = adminAPI.updateDish;
export const patchDish = adminAPI.updateDish; // Use updateDish for patch as well, as it handles FormData correctly
export const setDishAvailability = adminAPI.setDishAvailability;
export const deleteDish = adminAPI.deleteDish;
export const getCategories = adminAPI.getCategories;
export const createCategory = adminAPI.createCategory;
export const updateCategory = adminAPI.updateCategory;
export const patchCategory = adminAPI.updateCategory; // alias for updateCategory
export const deleteCategory = adminAPI.deleteCategory;
export const getCustomers = adminAPI.getCustomers;
export const getMessages = adminAPI.getMessages; // Added for backward compatibility

// Named exports for backward compatibility
export const checkUserType = authAPI.checkUserType;
export const loginUser = authAPI.login;
export const loginAdmin = async (credentials) => {
  try {
    console.log('📡 Admin login API call:', { email: credentials.email });
    
    // Fetch CSRF token first
    await fetchCSRFToken();
    console.log('🔑 CSRF token ready for admin login');
    
    const response = await api.post('/api/admin/login/', credentials, { // Reverted to the correct admin-specific endpoint
      withCredentials: true,
            headers: {
        'X-CSRFToken': csrfToken,
                'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ Admin login API response:', response.data);
    
    // Save session key to localStorage
    if (response.data.session_key) {
      localStorage.setItem('session_key', response.data.session_key);
      console.log('💾 Admin session key saved to localStorage:', response.data.session_key.substring(0, 10) + '...');
    }
    
    return response.data;
    } catch (error) {
    console.error('❌ Admin login API error:', error.response?.data || error.message);
    const errorData = error.response?.data || { error: 'Admin login failed' };
    throw new Error(errorData.error || 'Admin authentication failed');
    }
};
export const logoutUser = authAPI.logout;
export { fetchCSRFToken };

export const getDishById = async (dishId) => {
    return makeAuthenticatedRequest('GET', `/api/dishes/${dishId}/`);
};

export const createReview = async (dishId, reviewData) => {
    return makeAuthenticatedRequest('POST', `/api/dishes/${dishId}/reviews/`, reviewData);
};

 