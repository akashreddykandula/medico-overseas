import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export const useAdminApplications = (params) =>
  useQuery({
    queryKey: ['admin-applications', params],
    queryFn: async () => {
      const { data } = await api.get('/applications', { params });
      return data.data;
    },
    keepPreviousData: true,
  });

export const useUpdateApplicationStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, stage, counsellorRemark, estimatedCompletionDate }) => {
      const { data } = await api.patch(`/applications/${id}/stage`, { stage, counsellorRemark, estimatedCompletionDate });
      return data.data.application;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-applications'] }),
  });
};
