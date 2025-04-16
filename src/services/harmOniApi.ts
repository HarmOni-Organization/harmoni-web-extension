import axios from 'axios';
import browser from 'webextension-polyfill';
import { logger } from '../utils/logger';
// Set up the base API instance
const harmOniApi = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:5050',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
harmOniApi.interceptors.request.use(async (config) => {
  // Get token from storage
  try {
    const result = await browser.storage.local.get('authToken');
    const token = result.authToken;
    logger.log('token', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    logger.error('Error getting auth token:', error);
  }

  return config;
});

// Add response interceptor to handle errors
harmOniApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      // Could implement token refresh here
      try {
        await browser.storage.local.remove('authToken');
      } catch (error) {
        logger.error('Error removing auth token:', error);
      }
      // Redirect to login
    }

    return Promise.reject(error);
  }
);

export default harmOniApi;
