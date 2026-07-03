import React from "react";
import BlogGridWithSidebar from "@/components/BlogGridWithSidebar";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Blogs",
  description: "Read the latest store news, updates, and buying guides.",
};

const BlogsPage = () => {
  return <BlogGridWithSidebar />;
};

export default BlogsPage;
