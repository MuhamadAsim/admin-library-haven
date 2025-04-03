
import api from './api';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'member';
}

export const authService = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/login', { email, password });
    const { user, token } = response.data;
    
    // Store auth data in localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('userId', user.id);
    
    return { user, token };
  },

  logout: (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
  },

  getCurrentUser: (): User | null => {
    const id = localStorage.getItem('userId');
    const email = localStorage.getItem('userEmail');
    const role = localStorage.getItem('userRole') as 'admin' | 'member' | null;

    if (id && email && role) {
      return { id, email, role };
    }

    return null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },

  isAdmin: (): boolean => {
    return localStorage.getItem('userRole') === 'admin';
  },

  isMember: (): boolean => {
    return localStorage.getItem('userRole') === 'member';
  },
  
  // Get auth token for API requests
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  }
};

// Add auth token to all API requests
api.interceptors.request.use(
  config => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);
