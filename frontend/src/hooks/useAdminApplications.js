import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import api from "../lib/api";

export const useAdminApplications = (params) =>
  useQuery({
    queryKey: ["admin-applications", params],
    queryFn: async () => {
      const { data } = await api.get("/applications", { params });
      return data.data;
    },
    placeholderData: keepPreviousData,
  });

export const useUpdateApplicationStage = () => {
  return useMutation({
    mutationFn: async ({
      id,
      stage,
      counsellorRemark,
      estimatedCompletionDate,
      requiredDocuments,
    }) => {
      const response = await api.patch(`/applications/${id}/stage`, {
        stage,
        counsellorRemark,
        estimatedCompletionDate,
        requiredDocuments,
      });

      return response.data;
    },
  });
};
