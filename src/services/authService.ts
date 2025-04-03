
// Simple authentication service with localStorage
// In a real app, this would use JWT tokens, HTTP-only cookies, etc.

export interface User {
  email: string;
  role: 'admin' | 'member';
}

export const authService = {
  login: (email: string, role: 'admin' | 'member'): void => {
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);
  },

  logout: (): void => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
  },

  getCurrentUser: (): User | null => {
    const email = localStorage.getItem('userEmail');
    const role = localStorage.getItem('userRole') as 'admin' | 'member' | null;

    if (email && role) {
      return { email, role };
    }

    return null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('userEmail');
  },

  isAdmin: (): boolean => {
    return localStorage.getItem('userRole') === 'admin';
  },

  isMember: (): boolean => {
    return localStorage.getItem('userRole') === 'member';
  }
};
