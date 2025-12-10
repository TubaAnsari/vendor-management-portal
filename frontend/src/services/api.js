import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('API Base URL:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging
    console.log(`${config.method?.toUpperCase()} ${config.url}`, config.params || '');
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => {
    console.log(`${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('vendor');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (data) => api.post('/auth/register', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteProfile: (data) => api.delete('/auth/profile', { data }),
};

// Vendor API calls
export const vendorAPI = {
  getAll: (params = {}) => {
    console.log('Fetching vendors with params:', params);
    return api.get('/vendors', { params });
  },
  getById: (id) => api.get(`/vendors/${id}`),
  getProducts: (id) => api.get(`/vendors/${id}/products`),
};

// Product API calls
export const productAPI = {
  create: (data) => api.post('/products', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getByVendor: () => api.get('/products'),
  update: (id, data) => api.put(`/products/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  delete: (id) => api.delete(`/products/${id}`),
};

// Review API calls
export const reviewAPI = {
  create: (vendorId, data) => api.post(`/reviews/${vendorId}`, data),
  getByVendor: (vendorId) => api.get(`/reviews/${vendorId}`),
};

// Admin API calls
export const adminAPI = {
  getAllVendors: () => api.get('/admin/vendors'),
  getVendorDetails: (id) => api.get(`/admin/vendors/${id}`),
};

// Test endpoints
export const testAPI = {
  corsTest: () => api.get('/debug'),
  dbTest: () => api.get('/db-test'),
  health: () => api.get('/health'),
};

export default api;