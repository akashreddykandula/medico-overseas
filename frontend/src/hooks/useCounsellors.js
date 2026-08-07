import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";

export const useCounsellors = () =>
  useQuery({
    queryKey: ["counsellors"],
    queryFn: async () => {
      const { data } = await api.get("/admin/counsellors");
      return data.data.counsellors;
    },
  });
