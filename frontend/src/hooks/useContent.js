import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export const useTestimonials = (params = {}) =>
  useQuery({
    queryKey: ['testimonials', params],
    queryFn: async () => {
      const { data } = await api.get('/testimonials', { params });
      return data.data.items;
    },
  });

export const useBlogs = (params = {}) =>
  useQuery({
    queryKey: ['blogs', params],
    queryFn: async () => {
      const { data } = await api.get('/blogs', { params });
      return data.data;
    },
  });

export const useBlogPost = (slug) =>
  useQuery({
    queryKey: ['blog', slug],
    queryFn: async () => {
      const { data } = await api.get(`/blogs/${slug}`);
      return data.data;
    },
    enabled: !!slug,
  });

export const useFaqs = (params = {}) =>
  useQuery({
    queryKey: ['faqs', params],
    queryFn: async () => {
      const { data } = await api.get('/faqs', { params });
      return data.data.items;
    },
  });
