import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";

export const useLeads = (params) =>
  useQuery({
    queryKey: ["leads", params],
    queryFn: async () => {
      const { data } = await api.get("/leads", { params });
      return data.data;
    },
    keepPreviousData: true,
  });

export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data } = await api.patch(`/leads/${id}`, updates);
      return data.data.lead;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["leads"],
      });
    },
  });
};
