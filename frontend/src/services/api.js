import axios from 'axios';

// Create Axios instance with base URL
const API = axios.create({
  baseURL: '/api'
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
  // If formData is FormData instance (with file upload), axios handles multipart/form-data
  return API.post('/posts', formData);
};

export const toggleLike = (postId) => API.post(`/posts/${postId}/like`);

export const addComment = (postId, text) =>
  API.post(`/posts/${postId}/comment`, { text });

export default API;
