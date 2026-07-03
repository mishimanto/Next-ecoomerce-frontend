"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchBlogs } from "@/services/api";

export function useBlogs() {
  const { data = [] } = useQuery({
    queryKey: ["blogs"],
    queryFn: fetchBlogs,
  });

  return data;
}
