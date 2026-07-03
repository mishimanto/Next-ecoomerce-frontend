"use client";

import React, { useEffect, useMemo, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import SearchForm from "../Blog/SearchForm";
import LatestPosts from "../Blog/LatestPosts";
import LatestProducts from "../Blog/LatestProducts";
import Image from "next/image";
import { useProducts } from "@/hooks/useProducts";
import Categories from "../Blog/Categories";
import { useCategories } from "@/hooks/useCategories";
import { BlogItem } from "@/types/blogItem";
import { fetchBlog } from "@/services/api";
import { useBlogs } from "@/hooks/useBlogs";
import { getBlogTags } from "@/lib/blog";
import Tags from "../Blog/Tags";

type BlogDetailsWithSidebarProps = {
  slug?: string;
};

const BlogDetailsWithSidebar = ({ slug }: BlogDetailsWithSidebarProps) => {
  const [blog, setBlog] = useState<BlogItem | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(slug));
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const shopData = useProducts();
  const categories = useCategories();
  const blogs = useBlogs();
  const tags = useMemo(() => getBlogTags(blogs), [blogs]);

  useEffect(() => {
    if (!slug) {
      setBlog(blogs[0] || null);
      setIsLoading(false);
      return;
    }

    const cachedBlog = blogs.find((item) => item.slug === slug);

    if (cachedBlog) {
      setBlog(cachedBlog);
      setIsLoading(false);
    }

    let isMounted = true;
    setIsLoading(true);
    setError("");

    fetchBlog(slug)
      .then((data) => {
        if (isMounted) {
          setBlog(data);
        }
      })
      .catch(() => {
        if (isMounted && !cachedBlog) {
          setError("Blog not found.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [blogs, slug]);

  return (
    <>
      <Breadcrumb title={blog?.title || "Blog Details"} pages={[blog?.title || "blog details"]} />

      <section className="overflow-hidden py-10 bg-gray-2">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-12.5">
            <div className="lg:max-w-[750px] w-full">
              {isLoading ? (
                <div className="rounded-xl bg-white shadow-1 p-8 text-center text-dark">
                  Loading blog...
                </div>
              ) : error || !blog ? (
                <div className="rounded-xl bg-white shadow-1 p-8 text-center text-red">
                  {error || "Blog not found."}
                </div>
              ) : (
                <article>
                  <div className="rounded-[10px] overflow-hidden mb-7.5">
                    <Image
                      className="rounded-[10px] w-full"
                      src={blog.img}
                      alt={blog.title}
                      width={750}
                      height={477}
                      unoptimized
                    />
                  </div>

                  <span className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="ease-out duration-200 hover:text-blue">
                      {blog.date}
                    </span>
                    <span className="block w-px h-4 bg-gray-4"></span>
                    <span className="ease-out duration-200 hover:text-blue">
                      {blog.views.toLocaleString()} Views
                    </span>
                    {blog.category && (
                      <>
                        <span className="block w-px h-4 bg-gray-4"></span>
                        <span className="ease-out duration-200 hover:text-blue">
                          {blog.category}
                        </span>
                      </>
                    )}
                  </span>

                  <h1 className="font-medium text-dark text-xl lg:text-2xl xl:text-custom-4xl mb-4">
                    {blog.title}
                  </h1>

                  {(blog.content || [blog.excerpt]).filter(Boolean).map((paragraph) => (
                    <p className="mb-6" key={paragraph}>
                      {paragraph}
                    </p>
                  ))}

                  {blog.quote && (
                    <div className="rounded-xl bg-white pt-7.5 pb-6 px-4 sm:px-7.5 my-7.5">
                      <p className="italic text-dark text-center">{blog.quote}</p>
                      {blog.author && (
                        <div className="flex items-center justify-center gap-3 mt-5.5">
                          {blog.author.avatar && (
                            <div className="flex w-12 h-12 rounded-full overflow-hidden">
                              <Image
                                src={blog.author.avatar}
                                alt={blog.author.name}
                                width={48}
                                height={48}
                                unoptimized
                              />
                            </div>
                          )}
                          <div>
                            <h4 className="text-dark text-custom-sm">{blog.author.name}</h4>
                            <p className="text-custom-xs">{blog.author.role}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!!blog.tags?.length && (
                    <div className="flex flex-wrap items-center gap-5 mt-10">
                      <p>Popular Tags :</p>
                      <ul className="flex flex-wrap items-center gap-3.5">
                        {blog.tags.map((tag) => (
                          <li key={tag}>
                            <span className="inline-flex border border-gray-3 bg-white py-2 px-4 rounded-md">
                              {tag}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              )}
            </div>

            <div className="lg:max-w-[370px] w-full">
              <SearchForm value={searchQuery} onChange={setSearchQuery} />
              <LatestPosts
                blogs={blogs.filter((item) =>
                  searchQuery
                    ? item.title.toLowerCase().includes(searchQuery.toLowerCase())
                    : true
                )}
              />
              <LatestProducts products={shopData} />
              <Categories categories={categories} />
              <Tags tags={tags} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogDetailsWithSidebar;
