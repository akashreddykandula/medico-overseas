import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";

export const useMyApplication = () =>
  useQuery({
    queryKey: ["my-application"],
    queryFn: async () => {
      const { data } = await api.get("/applications/me");
      return data.data.application;
    },
  });

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, type, documentName, description }) => {
      const form = new FormData();

      form.append("file", file);
      form.append("type", type);

      if (type === "other") {
        form.append("documentName", documentName.trim());
        form.append("description", description?.trim() || "");
      }

      const { data } = await api.post("/applications/me/documents", form);

      return data.data.application;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["my-application"],
      });
    },
  });
};
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (documentId) => {
      const { data } = await api.delete(
        `/applications/me/documents/${documentId}`,
      );
      return data.data.application;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["my-application"] }),
  });
};
