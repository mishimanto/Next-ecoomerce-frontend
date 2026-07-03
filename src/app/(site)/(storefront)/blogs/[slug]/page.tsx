import React from "react";
import BlogDetailsWithSidebar from "@/components/BlogDetailsWithSidebar";
import { Metadata } from "next";
import { fetchBlog } from "@/services/api";

type BlogDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: BlogDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const blog = await fetchBlog(slug);

    return {
      title: blog.title,
      description: blog.excerpt || `Read ${blog.title}.`,
      openGraph: {
        title: blog.title,
        description: blog.excerpt || `Read ${blog.title}.`,
        images: blog.img ? [blog.img] : undefined,
      },
    };
  } catch {
    return {
      title: "Blog Details",
      description: "Read the latest store news and updates.",
    };
  }
}

const BlogDetailsPage = async ({ params }: BlogDetailsPageProps) => {
  const { slug } = await params;

  return <BlogDetailsWithSidebar slug={slug} />;
};

export default BlogDetailsPage;
