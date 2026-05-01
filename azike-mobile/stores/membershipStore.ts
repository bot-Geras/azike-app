
import { create } from 'zustand';
import { api } from '../services/api';

interface MembershipState {
  membership: any | null;
  loading: boolean;
  error: string | null;
  fetchMembership: () => Promise<void>;
  clearMembership: () => void;
}

export const useMembershipStore = create<MembershipState>((set) => ({
  membership: null,
  loading: false,
  error: null,

  fetchMembership: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/membership/status');
      set({ membership: response.data.data, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch membership',
        loading: false 
      });
    }
  },

  clearMembership: () => {
    set({ membership: null, error: null });
  }
}));