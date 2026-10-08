import { useQuery } from "@tanstack/react-query";
import { parseCsv } from "./data";

export const DATASET_URL = "/construction_data.csv";

export function useDataset() {
  return useQuery({
    queryKey: ["dataset"],
    queryFn: async () => {
      const res = await fetch(DATASET_URL);
      if (!res.ok) throw new Error("Could not load dataset");
      return parseCsv(await res.text());
    },
    staleTime: Infinity,
  });
}
