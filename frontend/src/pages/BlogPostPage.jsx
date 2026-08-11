import React from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DOMPurify from "dompurify";
import {
  FaFacebookF,
  FaTwitter,
  FaWhatsapp,
  FaLinkedinIn,
} from "react-icons/fa";
import {
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineShare,
  HiOutlineFolder,
  HiOutlineArrowLeft,
} from "react-icons/hi";
import EnquiryForm from "../components/home/forms/EnquiryForm";
import { useBlogPost } from "../hooks/useContent";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1562774053-701939374585?w=1200";

// Helper to sanitize title / text strings from unwanted raw HTML tags
const stripHtml = (htmlString) => {
  if (!htmlString) return "";
  return htmlString
    .replace(/<[^>]*>?/gm, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
};

const BlogPostPage = () => {
  const { slug } = useParams();
  const { data, isLoading, isError } = useBlogPost(slug);

  if (isLoading)
    return (
      <div className="section-container min-h-[60vh] py-12 sm:py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Category Badge & Date Skeleton */}
          <div className="flex items-center gap-3">
            <div className="h-6 w-24 animate-pulse rounded-full bg-coral/20" />
            <div className="h-4 w-28 animate-pulse rounded bg-navy-100" />
          </div>

          {/* Title Skeleton */}
          <div className="space-y-3">
            <div className="h-8 w-11/12 animate-pulse rounded-lg bg-navy-100 sm:h-10 lg:h-12" />
            <div className="h-8 w-3/4 animate-pulse rounded-lg bg-navy-100 sm:h-10 lg:h-12" />
          </div>

          {/* Featured Image Skeleton */}
          <div className="aspect-[16/9] w-full animate-pulse rounded-2xl sm:rounded-3xl bg-navy-100" />

          {/* Text Paragraphs Skeleton */}
          <div className="space-y-3 pt-4">
            <div className="h-4 w-full animate-pulse rounded bg-navy-50" />
            <div className="h-4 w-11/12 animate-pulse rounded bg-navy-50" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-navy-50" />
            <div className="h-4 w-full animate-pulse rounded bg-navy-50" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-navy-50" />
          </div>
        </div>
      </div>
    );

  if (isError || !data)
    return (
      <div className="section-container min-h-[60vh] py-24 sm:py-32 px-4 text-center">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-navy-700">
            Article Not Found
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-navy-400">
            The blog post you are looking for may have been removed or renamed.
          </p>
          <Link
            to="/blog"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-coral px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all duration-300 hover:opacity-90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-coral/50"
          >
            <HiOutlineArrowLeft size={16} /> Return to All Articles
          </Link>
        </div>
      </div>
    );

  const { blog, related } = data;

  const sanitizedBody = DOMPurify.sanitize(blog.body || "", {
    USE_PROFILES: {
      html: true,
    },
  });

  const cleanTitle = stripHtml(blog.title);
  const cleanExcerpt = stripHtml(blog.excerpt);
  const imageUrl = blog.coverImage || blog.featuredImage?.url || DEFAULT_IMAGE;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <>
      <Helmet>
        <title>
          {stripHtml(blog.metaTitle) || cleanTitle} | Medico Overseas Blog
        </title>
        <meta
          name="description"
          content={stripHtml(blog.metaDescription) || cleanExcerpt}
        />
        <link rel="canonical" href={shareUrl} />
        <meta
          property="og:title"
          content={`${cleanTitle} | Medico Overseas Blog`}
        />
        <meta
          property="og:description"
          content={stripHtml(blog.metaDescription) || cleanExcerpt}
        />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Medico Overseas" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${cleanTitle} | Medico Overseas Blog`}
        />
        <meta
          name="twitter:description"
          content={stripHtml(blog.metaDescription) || cleanExcerpt}
        />
        <meta name="twitter:image" content={imageUrl} />
      </Helmet>

      <article className="pt-20 sm:pt-28 pb-16 sm:pb-24 bg-slate-50/50">
        <div className="section-container max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <header className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-coral/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-coral">
              <HiOutlineFolder size={14} className="shrink-0" />
              <span>{blog.category || "General"}</span>
            </span>

            <h1 className="mt-4 font-heading text-2xl font-extrabold tracking-tight text-navy-700 sm:text-4xl lg:text-5xl lg:leading-tight">
              {cleanTitle}
            </h1>

            {/* Author & Date Meta Bar */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold text-navy-400">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-100 text-navy-600 shadow-sm">
                  <HiOutlineUser size={14} />
                </div>
                <span>{blog.author?.name || "Medico Overseas Team"}</span>
              </div>
              <span className="hidden sm:inline text-slate-300">•</span>
              <div className="flex items-center gap-2">
                <HiOutlineCalendar size={16} className="text-coral shrink-0" />
                <time
                  dateTime={new Date(
                    blog.publishedAt || blog.createdAt,
                  ).toISOString()}
                >
                  {new Date(
                    blog.publishedAt || blog.createdAt,
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
            </div>
          </header>

          {/* Featured Cover Image */}
          <div className="mt-8 sm:mt-10 mx-auto w-full max-w-2xl overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-100 bg-white shadow-lg">
            <img
              src={imageUrl}
              alt={cleanTitle}
              className="h-auto max-h-[420px] w-full object-cover transition-transform duration-700 hover:scale-[1.01]"
              onError={(e) => {
                e.target.src = DEFAULT_IMAGE;
              }}
            />
          </div>

          {/* Article Main Body HTML Render */}
          <div className="mt-8 sm:mt-12 rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-5 sm:p-10 lg:p-12 shadow-sm">
            <div
              className="blog-content max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizedBody }}
            />

            {/* Social Share Footer */}
            <div className="mt-10 sm:mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy-500">
                <HiOutlineShare size={16} className="text-coral" /> Share
                Article:
              </span>
              <div className="flex items-center gap-2.5">
                {[
                  [
                    FaFacebookF,
                    `https://facebook.com/sharer/sharer.php?u=${shareUrl}`,
                    "Share on Facebook",
                  ],
                  [
                    FaTwitter,
                    `https://twitter.com/intent/tweet?url=${shareUrl}`,
                    "Share on Twitter",
                  ],
                  [
                    FaWhatsapp,
                    `https://wa.me/?text=${encodeURIComponent(cleanTitle + " " + shareUrl)}`,
                    "Share on WhatsApp",
                  ],
                  [
                    FaLinkedinIn,
                    `https://linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
                    "Share on LinkedIn",
                  ],
                ].map(([Icon, href, label], i) => (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-navy-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-coral hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-coral/40"
                  >
                    <Icon size={14} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Articles Section */}
        {related?.length > 0 && (
          <section className="mt-12 sm:mt-16 border-t border-slate-200/60 bg-white py-12 sm:py-16">
            <div className="section-container max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="font-heading text-lg sm:text-xl font-bold text-navy-700">
                  Related Articles
                </h2>
                <Link
                  to="/blog"
                  className="text-xs sm:text-sm font-bold text-coral transition-colors hover:underline"
                >
                  View All Posts →
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {related.map((r) => (
                  <Link
                    key={r._id}
                    to={`/blog/${r.slug}`}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-coral/30 hover:bg-white hover:shadow-md"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-coral">
                        {r.category || "MBBS Abroad"}
                      </span>
                      <h3 className="mt-2 line-clamp-2 font-heading text-sm font-bold text-navy-700 transition-colors group-hover:text-coral">
                        {stripHtml(r.title)}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Counselling Enquiry Section */}
        <section className="section-container max-w-4xl pt-12 sm:pt-16 px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-5 sm:p-10 shadow-lg sm:shadow-xl">
            <EnquiryForm
              source="blog_post"
              title="Have Questions About Studying MBBS Abroad?"
            />
          </div>
        </section>
      </article>
    </>
  );
};

export default BlogPostPage;
