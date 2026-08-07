import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export const useCountries = () =>
  useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const { data } = await api.get('/countries');
      return data.data.countries;
    },
  });

export const useCountry = (slug) =>
  useQuery({
    queryKey: ['country', slug],
    queryFn: async () => {
      const { data } = await api.get(`/countries/${slug}`);
      return data.data;
    },
    enabled: !!slug,
  });
