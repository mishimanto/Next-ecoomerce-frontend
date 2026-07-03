import { BlogItem } from "@/types/blogItem";

export function getBlogUrl(blog: Pick<BlogItem, "slug">) {
  return `/blogs/${encodeURIComponent(blog.slug)}`;
}

export function getBlogTags(blogs: BlogItem[]) {
  return Array.from(new Set(blogs.flatMap((blog) => blog.tags || []))).sort();
}
