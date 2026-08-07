import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export const useAdminAnalytics = () =>
  useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/admin/analytics');
      return data.data;
    },
  });
