
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';

export const useAuth = () => {
  const { 
    login: storeLogin, 
    logout: storeLogout, 
    fetchMe,
    updateDeviceToken,
    user, 
    isAuthenticated, 
    token 
  } = useAuthStore();

  const login = async (identifier: string, password: string) => {
    await storeLogin(identifier, password);
  };

  const register = async (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    password: string;
    confirm_password: string;
  }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  };

  const logout = () => {
    storeLogout();
  };

  return {
    user,
    isAuthenticated,
    token,
    login,
    register,
    logout,
    fetchMe,
    updateDeviceToken
  };
};