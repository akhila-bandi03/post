import axios from 'axios';

// Get base URL from Vite environment or default to '/api'
let rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
rawBaseUrl = rawBaseUrl.trim().replace(/\/+$/, '');

// If it is a full HTTP(S) URL and does not end with /api, append /api automatically
if (rawBaseUrl.startsWith('http') && !rawBaseUrl.endsWith('/api')) {
  rawBaseUrl = `${rawBaseUrl}/api`;
}

const API = axios.create({
  baseURL: rawBaseUrl
});

// Attach JWT token to Authorization header for every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication APIs
export const signupUser = (userData) => API.post('/auth/signup', userData);
export const loginUser = (credentials) => API.post('/auth/login', credentials);

// Post APIs
export const getPosts = (page = 1, limit = 10) =>
  API.get(`/posts?page=${page}&limit=${limit}`);

export const createPost = (formData) => {
  return API.post('/posts', formData);
};

export const toggleLike = (postId) => API.post(`/posts/${postId}/like`);

export const addComment = (postId, text) =>
  API.post(`/posts/${postId}/comment`, { text });

export default API;
