import axios from 'axios';

// Function to determine the best baseURL
const determineBestBaseUrl = () => {
  // Priority list of potential server URLs
  const serverUrls = [
    `${window.location.protocol}//${window.location.hostname}:5003`,
    `${window.location.protocol}//${window.location.hostname}:5002`,
    'http://localhost:5003',
    'http://localhost:5002'
  ];
  
  // When in development, set logging
  if (process.env.NODE_ENV === 'development') {
    console.log('Potential server URLs:', serverUrls);
    console.log('Selected base URL:', serverUrls[0]);
  }
  
  return serverUrls[0]; // Default to first option
};

// Create an axios instance with default config
const api = axios.create({
  baseURL: determineBestBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  // Longer timeout for slow connections
  timeout: 10000
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('API Request to:', config.baseURL + config.url);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response from:', response.config.url, 'Status:', response.status);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response ? error.response.status : error.message);
    
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Show an alert for debugging purposes in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Authentication error - redirecting to login');
      }
    }
    
    return Promise.reject(error);
  }
);

// Utility function to fetch data with fallbacks
api.fetchWithFallback = async (endpoint, options = {}) => {
  // Priority list of server URLs to try
  const serverUrls = [
    `${window.location.protocol}//${window.location.hostname}:5003`,
    `${window.location.protocol}//${window.location.hostname}:5002`,
    'http://localhost:5003',
    'http://localhost:5002'
  ];
  
  let lastError = null;
  
  // Try each URL until one works
  for (const baseURL of serverUrls) {
    try {
      console.log(`Attempting to fetch from: ${baseURL}${endpoint}`);
      const axiosInstance = axios.create({
        baseURL,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(options.headers || {})
        },
        timeout: options.timeout || 5000
      });
      
      // If token exists, add it to headers
      const token = localStorage.getItem('token');
      if (token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await axiosInstance.request({
        url: endpoint,
        method: options.method || 'GET',
        data: options.data,
        params: options.params
      });
      
      console.log(`Success! Response from ${baseURL}:`, response.status);
      return response.data;
    } catch (err) {
      console.error(`Error fetching from ${baseURL}:`, err.message);
      lastError = err;
    }
  }
  
  throw lastError || new Error('Failed to fetch from all possible server URLs');
};

export default api; 