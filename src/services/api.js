import axios from 'axios';

// Determine the API URL based on environment variables
// Checks for Vite convention first, then Create React App convention, then a fallback
// Default to empty string to allow Vite proxy to handle requests in development
// FORCING RELATIVE PATH TO DEBUG PROXY/ENV ISSUES
const BASE_URL = ''; 
// const BASE_URL = import.meta.env?.VITE_API_BASE_URL || 
//                  process.env.REACT_APP_API_BASE_URL || 
//                  '';

/**
 * Axios instance for interacting with the DPP Backend
 */
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // timeout: 10000, // Optional: 10 seconds timeout
});

// Request interceptor (useful for adding auth tokens later)
api.interceptors.request.use(
  (config) => {
    // Example: const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (useful for global error handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default api;