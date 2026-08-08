import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";

export const useStudents = () =>
  useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data } = await api.get("/admin/students");
      return data.data.students;
    },
  });
