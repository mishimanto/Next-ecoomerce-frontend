import React from "react";
import BlogGridWithSidebar from "@/components/BlogGridWithSidebar";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Blog",
  description: "Read articles, updates, and buying guides.",
};

const BlogPage = () => {
  return <BlogGridWithSidebar />;
};

export default BlogPage;
