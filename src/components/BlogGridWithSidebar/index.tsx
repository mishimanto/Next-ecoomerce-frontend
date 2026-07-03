"use client";

import React, { useMemo, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import BlogItem from "../Blog/BlogItem";
import SearchForm from "../Blog/SearchForm";
import LatestPosts from "../Blog/LatestPosts";
import LatestProducts from "../Blog/LatestProducts";
import Categories from "../Blog/Categories";
import Tags from "../Blog/Tags";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useBlogs } from "@/hooks/useBlogs";
import { getBlogTags } from "@/lib/blog";

const BlogGridWithSidebar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const shopData = useProducts();
  const categories = useCategories();
  const blogs = useBlogs();
  const tags = useMemo(() => getBlogTags(blogs), [blogs]);
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesSearch =
        !normalizedSearch ||
        [blog.title, blog.excerpt, blog.category, ...(blog.tags || [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesTag = !activeTag || blog.tags?.includes(activeTag);

      return matchesSearch && matchesTag;
    });
  }, [activeTag, blogs, normalizedSearch]);

  return (
    <>
      <Breadcrumb title={"Blogs"} pages={["blogs"]} />

      <section className="overflow-hidden py-10 bg-gray-2">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col lg:flex-row gap-7.5">
            <div className="lg:max-w-[770px] w-full">
              {filteredBlogs.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-7.5">
                  {filteredBlogs.map((blog) => (
                    <BlogItem blog={blog} key={blog.slug} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-white shadow-1 p-8 text-center text-dark">
                  No blogs found.
                </div>
              )}
            </div>

            <div className="lg:max-w-[370px] w-full">
              <SearchForm value={searchQuery} onChange={setSearchQuery} />
              <LatestPosts blogs={blogs} />
              <LatestProducts products={shopData} />
              <Categories categories={categories} />
              <Tags tags={tags} activeTag={activeTag} onSelect={setActiveTag} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogGridWithSidebar;
