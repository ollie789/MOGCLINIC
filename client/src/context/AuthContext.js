import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

// Create auth context
export const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [doctor, setDoctor] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Update localStorage and axios headers when token changes
  useEffect(() => {
    console.log('Token changed in AuthContext:', token ? `${token.substring(0, 15)}...` : 'null');
    
    if (token) {
      localStorage.setItem('token', token);
      console.log('Token saved to localStorage');
      
      // Set the default header for all requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Default Authorization header set for API');
    } else {
      localStorage.removeItem('token');
      console.log('Token removed from localStorage');
      
      delete api.defaults.headers.common['Authorization'];
      console.log('Default Authorization header removed from API');
      
      // Also clear the doctor state
      setDoctor(null);
    }
    
    setInitialized(true);
  }, [token]);

  // Get current doctor on mount if token exists
  useEffect(() => {
    const loadDoctor = async () => {
      if (!token || !initialized) {
        setLoading(false);
        return;
      }

      try {
        console.log('Loading doctor data with token');
        const res = await api.get('/api/auth/me');
        console.log('Doctor data loaded successfully');
        setDoctor(res.data);
        setError(null);
      } catch (err) {
        console.error('Error loading doctor:', err);
        console.log('Clearing token due to authentication error');
        setToken(null);
        setDoctor(null);
        setError('Session expired. Please login again.');
      } finally {
        setLoading(false);
      }
    };

    loadDoctor();
  }, [token, initialized]);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Sending login request');
      const res = await api.post('/api/auth/login', { email, password });
      console.log('Login response received:', res.data.token ? 'Token received' : 'No token in response');
      
      if (!res.data.token) {
        throw new Error('No token received from server');
      }
      
      setToken(res.data.token);
      setDoctor(res.data.doctor);
      
      return res.data;
    } catch (err) {
      console.error('Login error in AuthContext:', err);
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name, email, password, specialty) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Sending registration request');
      const res = await api.post('/api/auth/register', {
        name,
        email,
        password,
        specialty
      });
      console.log('Registration response received:', res.data.token ? 'Token received' : 'No token in response');
      
      if (!res.data.token) {
        throw new Error('No token received from server');
      }
      
      setToken(res.data.token);
      setDoctor(res.data.doctor);
      
      return res.data;
    } catch (err) {
      console.error('Registration error in AuthContext:', err);
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    console.log('Logging out');
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        doctor,
        token,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!doctor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 