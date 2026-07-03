"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/services/api";

export function useCategories() {
  const { data = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  return data;
}
