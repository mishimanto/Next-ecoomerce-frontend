"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchBrands } from "@/services/api";

export function useBrands() {
  const { data = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: fetchBrands,
  });

  return data;
}
