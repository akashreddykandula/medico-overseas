import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiArrowRight, HiSparkles } from "react-icons/hi";
import { useBlogs } from "../../hooks/useContent";

const BlogHighlights = () => {
  const { data, isLoading } = useBlogs({ limit: 3 });
  const blogs = Array.isArray(data?.blogs) ? data.blogs : [];

  if (!isLoading && blogs.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-[#071A38] py-16 sm:py-24 text-white">
      {/* Background Decorative Ambient Glows */}
      <div className="pointer-events-none absolute -left-32 top-1/4 h-80 w-80 sm:h-96 sm:w-96 rounded-full bg-coral/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 h-80 w-80 sm:h-96 sm:w-96 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="section-container relative z-10 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 sm:px-4 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-coral backdrop-blur-md">
              <HiSparkles size={14} aria-hidden="true" />
              Latest Updates
            </span>
            <h2 className="mt-3 sm:mt-4 font-heading text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              From Our Blog
            </h2>
            <p className="mt-2.5 sm:mt-3 text-xs sm:text-base leading-relaxed text-slate-300">
              Guidance and insights on MBBS abroad, written by our counselling
              team.
            </p>
          </div>

          <Link
            to="/blog"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 sm:px-5 py-2.5 text-xs font-bold text-white backdrop-blur-md transition-colors duration-200 hover:bg-coral hover:border-coral self-start sm:self-auto"
          >
            View All Posts
            <HiArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 sm:mt-16 grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((post, index) => {
            const imageUrl =
              typeof post?.featuredImage?.url === "string"
                ? post.featuredImage.url
                : "";

            return (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group overflow-hidden rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl transition-transform transition-colors duration-300 ease-out hover:border-coral/50 hover:shadow-coral/20 hover:-translate-y-2 flex flex-col justify-between"
              >
                <Link
                  to={`/blog/${encodeURIComponent(post.slug || "")}`}
                  aria-label={`Read ${post.title || "blog post"}`}
                  className="flex flex-col h-full"
                >
                  <div className="relative h-40 sm:h-48 w-full overflow-hidden bg-white/5">
                    <div
                      className="h-full w-full bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-105"
                      style={
                        imageUrl
                          ? { backgroundImage: `url("${imageUrl}")` }
                          : undefined
                      }
                      role={imageUrl ? "img" : undefined}
                      aria-label={
                        imageUrl ? post.title || "Blog image" : undefined
                      }
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#071A38] via-transparent to-transparent opacity-60 pointer-events-none" />
                  </div>

                  <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
                    <div>
                      <span className="inline-flex rounded-full bg-coral/20 px-2.5 sm:px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-coral">
                        {post.category || "general"}
                      </span>

                      <h3 className="mt-2.5 sm:mt-3 line-clamp-2 font-heading text-base sm:text-lg font-bold text-white transition-colors duration-200 group-hover:text-coral">
                        {post.title || "Untitled blog post"}
                      </h3>

                      <p className="mt-1.5 sm:mt-2 line-clamp-2 text-xs leading-relaxed text-slate-300">
                        {post.excerpt || ""}
                      </p>
                    </div>

                    <div className="mt-5 sm:mt-6 pt-3.5 sm:pt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-coral transition-all duration-200 group-hover:gap-2.5 group-hover:text-white">
                        Read More <HiArrowRight aria-hidden="true" />
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                        Article
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BlogHighlights;
