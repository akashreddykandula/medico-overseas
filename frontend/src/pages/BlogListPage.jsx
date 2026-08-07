import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { HiSearch } from "react-icons/hi";
import PageHero from "../components/common/PageHero";
import { useBlogs } from "../hooks/useContent";

const CATEGORIES = ["all", "country", "exam", "general", "visa", "scholarship"];

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1562774053-701939374585?w=1200";

// Helper to strip HTML tags from plain text fields (Title, Excerpt)
const stripHtml = (htmlString) => {
  if (!htmlString) return "";
  return htmlString
    .replace(/<[^>]*>?/gm, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ") // Remove non-breaking spaces
    .replace(/&amp;/g, "&") // Decode ampersands
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
};

const BlogListPage = () => {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useBlogs({
    ...(category !== "all" && { category }),
    ...(search && { search }),
    page,
    limit: 9,
  });

  const blogs = data?.blogs || [];
  const featuredBlog = blogs[0];
  const otherBlogs = blogs.slice(1);
  const pagination = data?.pagination;

  const getImageUrl = (post) =>
    post?.coverImage || post?.featuredImage?.url || DEFAULT_IMAGE;

  return (
    <>
      <Helmet>
        <title>Blog | Medico Overseas</title>
        <meta
          name="description"
          content="Guidance, tips, and news on studying MBBS abroad from the Medico Overseas team."
        />
      </Helmet>

      <PageHero
        eyebrow="RESOURCES"
        title="MBBS Abroad Blog"
        subtitle="Practical guidance for students and parents navigating the MBBS-abroad journey."
      />

      <div className="section-container py-16">
        {/* Filters & Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCategory(c);
                  setPage(1);
                }}
                className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                  category === c
                    ? "bg-coral text-white"
                    : "bg-navy-50 text-navy-500 hover:bg-navy-100"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search articles..."
              className="w-full rounded-full border border-navy-100 py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-coral sm:w-auto"
            />
          </div>
        </div>

        {/* Featured Article Hero */}
        {featuredBlog && (
          <Link
            to={`/blog/${featuredBlog.slug}`}
            className="group mt-10 grid overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl lg:grid-cols-2"
          >
            <div className="relative h-72 overflow-hidden bg-slate-100 lg:h-full">
              <img
                src={getImageUrl(featuredBlog)}
                alt={stripHtml(featuredBlog.title)}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.target.src = DEFAULT_IMAGE;
                }}
              />
            </div>

            <div className="flex flex-col justify-center p-8 sm:p-10">
              <span className="text-xs font-bold uppercase tracking-widest text-coral">
                Featured Article
              </span>

              <h2 className="mt-3 font-heading text-2xl font-bold text-navy-700 transition-colors group-hover:text-coral sm:text-3xl">
                {stripHtml(featuredBlog.title)}
              </h2>

              <p className="mt-4 line-clamp-3 text-base leading-relaxed text-slate-600 sm:text-lg">
                {stripHtml(featuredBlog.excerpt)}
              </p>

              <span className="mt-8 inline-flex items-center font-semibold text-coral transition-transform duration-300 group-hover:translate-x-1">
                Read Full Article →
              </span>
            </div>
          </Link>
        )}

        {/* Main Content Layout */}
        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-4">
          {/* Left Grid Section */}
          <div className="lg:col-span-3">
            {isLoading && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-80 animate-pulse rounded-3xl bg-slate-100"
                  />
                ))}
              </div>
            )}

            {!isLoading && otherBlogs.length === 0 && (
              <div className="rounded-2xl border border-slate-100 bg-white py-12 text-center shadow-sm">
                <p className="text-navy-400">No articles found.</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {otherBlogs.map((post) => (
                <Link
                  key={post._id}
                  to={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                >
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <img
                      src={getImageUrl(post)}
                      alt={stripHtml(post.title)}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = DEFAULT_IMAGE;
                      }}
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <span className="inline-block rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-coral">
                        {post.category}
                      </span>

                      <h3 className="mt-4 line-clamp-2 font-heading text-xl font-bold text-navy-700 transition-colors group-hover:text-coral">
                        {stripHtml(post.title)}
                      </h3>

                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">
                        {stripHtml(post.excerpt)}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                      <span className="text-sm font-semibold text-coral transition-transform duration-300 group-hover:translate-x-1">
                        Read Article →
                      </span>

                      <span className="text-xs text-slate-400">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-28 self-start">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg">
              <h3 className="mb-6 font-heading text-xl font-bold text-navy-700">
                Trending Articles
              </h3>

              <div className="divide-y divide-slate-100">
                {blogs.slice(0, 5).map((post, index) => (
                  <Link
                    key={post._id}
                    to={`/blog/${post.slug}`}
                    className="group flex gap-4 py-4 transition-colors first:pt-0 last:pb-0"
                  >
                    <div className="text-3xl font-bold text-coral/40">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div>
                      <h4 className="line-clamp-2 text-sm font-semibold text-navy-700 transition-colors group-hover:text-coral">
                        {stripHtml(post.title)}
                      </h4>

                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            {Array.from({ length: pagination.pages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`h-9 w-9 rounded-full text-sm font-medium transition-colors ${
                  page === i + 1
                    ? "bg-navy-600 text-white shadow-sm"
                    : "bg-navy-50 text-navy-500 hover:bg-navy-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default BlogListPage;
