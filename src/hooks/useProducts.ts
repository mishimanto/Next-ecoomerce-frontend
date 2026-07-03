"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/services/api";

export function useProducts() {
  const { data = [] } = useQuery({
    queryKey: ["products", "featured-list"],
    queryFn: () => fetchProducts({ perPage: 24 }),
  });

  return data;
}
