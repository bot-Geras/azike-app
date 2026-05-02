
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';

/* 
  ------------------------------------------------------------------
  TEST DATA: Dummy membership status for Global Use (Commented out)
  ------------------------------------------------------------------
const DUMMY_MEMBERSHIP = {
  is_active: true,
  membership_tier: 'Premium Member',
  tier: 'Premium',
  current_period: {
    end_date: '2025-05-02T00:00:00Z',
    days_remaining: 365,
  },
  digital_card: {
    member_id: 'AZ-8829-102',
    member_name: 'John Doe',
    member_since: '2023-01-15T00:00:00Z',
    expiry_date: '2025-05-02T00:00:00Z',
    barcode_data: 'AZIKE-MEMBER-8829-102-JD',
  },
  entitlements: {
    free_events_remaining: 3,
    free_events_limit: 5,
  },
  auto_renew_enabled: true,
};
*/

export const useMembership = () => {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['membership'],
    queryFn: async () => {
      const response = await api.get('/membership/status');
      return response.data.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const { data: cardData, isLoading: isLoadingCard, refetch: refetchCard } = useQuery({
    queryKey: ['membership-card'],
    queryFn: async () => {
      const response = await api.get('/membership/card');
      return response.data.data;
    },
    enabled: isAuthenticated && !!data?.is_active,
    staleTime: 5 * 60 * 1000,
  });

  const renewMutation = useMutation({
    mutationFn: async ({ package_id, phone_number }: { package_id: string; phone_number?: string }) => {
      const response = await api.post('/membership/renew', { package_id, phone_number });
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate and refetch membership after successful renewal
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['membership'] });
      }, 5000); // Wait for payment to process
    }
  });

  return {
    membership: data,
    card: cardData,
    isLoading: isLoading || (isLoadingCard && data?.is_active),
    error,
    refetch: () => {
      refetch();
      if (data?.is_active) refetchCard();
    },
    renew: renewMutation.mutateAsync,
    isRenewing: renewMutation.isPending
  };
};