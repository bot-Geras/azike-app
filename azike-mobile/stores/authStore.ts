
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { api, setUnauthorizedHandler } from '../services/api';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: any | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setHydrated: () => void;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  fetchMe: () => Promise<void>;
  updateDeviceToken: (fcmToken: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isHydrated: false,

      setHydrated: () => set({ isHydrated: true }),

      login: async (identifier: string, password: string) => {
        const response = await api.post('/auth/login', {
          identifier,
          password,
        });
        
        const { access_token, refresh_token, user } = response.data.data;
        
        await SecureStore.setItemAsync('access_token', access_token);
        await SecureStore.setItemAsync('refresh_token', refresh_token);
        
        set({
          token: access_token,
          refreshToken: refresh_token,
          user,
          isAuthenticated: true,
        });
      },

      logout: async () => {
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        
        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        });
      },

      refreshAccessToken: async () => {
        const refreshToken = get().refreshToken;
        if (!refreshToken) throw new Error('No refresh token');
        
        const response = await api.post('/auth/refresh', {
          refresh_token: refreshToken,
        });
        
        const { access_token } = response.data.data;
        await SecureStore.setItemAsync('access_token', access_token);
        
        set({ token: access_token });
      },

      fetchMe: async () => {
        try {
          const response = await api.get('/auth/me');
          set({ user: response.data.data });
        } catch (error) {
          console.error('Fetch me error:', error);
        }
      },

      updateDeviceToken: async (fcmToken: string) => {
        try {
          await api.post('/auth/device-token', { fcm_token: fcmToken });
        } catch (error) {
          console.error('Update device token error:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

// Initialize the API unauthorized handler
setUnauthorizedHandler(() => {
  useAuthStore.getState().logout();
});