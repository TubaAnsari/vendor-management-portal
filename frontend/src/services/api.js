import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error('❌ VITE_API_URL is not set in environment variables!');
  console.log('Current env:', import.meta.env);
}

console.log('API Base URL:', API_URL);

// Determine if we're in production
const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: isProduction ? 30000 : 10000,
  withCredentials: true, // Important for CORS with credentials
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const authAPI = {
    register: (formData) => {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        };
        return api.post('/auth/register', formData, config);
    },
    
    login: (credentials) => api.post('/auth/login', credentials),
    
    getProfile: () => api.get('/auth/profile'),
    
    updateProfile: (formData) => {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        };
        return api.put('/auth/profile', formData, config);
    },
    
    deleteProfile: (data) => api.delete('/auth/profile', { data }),
};

export const vendorAPI = {
    getAll: (params) => {
        console.log('Fetching vendors with params:', params);
        return api.get('/vendors', { params });
    },
    
    getById: (id) => api.get(`/vendors/${id}`),
    
    getProducts: (vendorId) => api.get(`/vendors/${vendorId}/products`),
};

export const productAPI = {
    create: (formData) => {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        };
        return api.post('/products', formData, config);
    },
    
    update: (id, formData) => {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        };
        return api.put(`/products/${id}`, formData, config);
    },
    
    getByVendor: () => {
        const vendor = JSON.parse(localStorage.getItem('vendor'));
        return api.get(`/vendors/${vendor.id}/products`);
    },
    
    delete: (id) => api.delete(`/products/${id}`),
};

export const reviewAPI = {
    create: (vendorId, data) => api.post(`/reviews/${vendorId}`, data),
    
    getByVendor: (vendorId) => api.get(`/reviews/${vendorId}`),
};

export const adminAPI = {
    getAllVendors: () => api.get('/admin/vendors'),
    
    getVendorDetails: (id) => api.get(`/admin/vendors/${id}`),
};

export default api;