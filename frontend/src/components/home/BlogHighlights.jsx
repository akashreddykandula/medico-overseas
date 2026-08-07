import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowRight } from 'react-icons/hi';
import { useBlogs } from '../../hooks/useContent';

const BlogHighlights = () => {
  const { data, isLoading } = useBlogs({ limit: 3 });
  const blogs = data?.blogs || [];

  if (!isLoading && blogs.length === 0) return null;

  return (
    <section className="bg-navy-50 py-24">
      <div className="section-container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="section-heading">From Our Blog</h2>
            <p className="mt-3 text-navy-400">Guidance and insights on MBBS abroad, written by our counselling team.</p>
          </div>
          <Link to="/blog" className="btn-outline">
            View All Posts
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((post, i) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-glow"
            >
              <Link to={`/blog/${post.slug}`}>
                <div
                  className="h-44 w-full bg-navy-100 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${post.featuredImage?.url || ''})` }}
                />
                <div className="p-5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-coral">{post.category}</span>
                  <h3 className="mt-2 font-heading font-semibold text-navy-600 line-clamp-2">{post.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-navy-400">{post.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-coral">
                    Read More <HiArrowRight />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogHighlights;
