
import { User, AuthResponse } from '../types';
import { mockBackend } from './mockBackend';

export const authService = {
  register: async (user: Omit<User, 'id'>): Promise<AuthResponse> => {
    try {
      return await mockBackend.register(user);
    } catch (error) {
      console.error("Registration error:", error);
      return { user: null, error: "An unexpected error occurred." };
    }
  },

  login: async (email: string, password?: string): Promise<AuthResponse> => {
    try {
      return await mockBackend.login(email, password);
    } catch (error) {
      console.error("Login error:", error);
      return { user: null, error: "An unexpected error occurred." };
    }
  },

  socialLogin: async (provider: string): Promise<AuthResponse> => {
      try {
          return await mockBackend.socialLogin(provider);
      } catch (error) {
           console.error("Social login error:", error);
           return { user: null, error: "Social login failed." };
      }
  },

  logout: async () => {
    await mockBackend.logout();
  },

  getCurrentUser: async (): Promise<User | null> => {
    return await mockBackend.getCurrentUser();
  },

  updateProfile: async (userId: string, data: Partial<User>): Promise<AuthResponse> => {
      try {
          return await mockBackend.updateUser(userId, data);
      } catch (error) {
          console.error("Update profile error:", error);
          return { user: null, error: "An unexpected error occurred." };
      }
  }
};
