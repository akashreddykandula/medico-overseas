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
      <div className="section-container min-h-[60vh] py-12 sm:py-20">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Category Badge & Date Skeleton */}
          <div className="flex items-center gap-3">
            <div className="h-5 w-24 animate-pulse rounded-full bg-coral/20" />
            <div className="h-4 w-28 animate-pulse rounded bg-navy-100" />
          </div>

          {/* Title Skeleton */}
          <div className="space-y-2">
            <div className="h-8 w-11/12 animate-pulse rounded-lg bg-navy-100 sm:h-10" />
            <div className="h-8 w-3/4 animate-pulse rounded-lg bg-navy-100 sm:h-10" />
          </div>

          {/* Featured Image Skeleton */}
          <div className="h-64 sm:h-80 w-full animate-pulse rounded-2xl bg-navy-100" />

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
      <div className="section-container min-h-[60vh] py-40 text-center">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          <h3 className="font-heading text-lg font-bold text-navy-700">
            Article Not Found
          </h3>
          <p className="mt-2 text-xs text-navy-400">
            The blog post you are looking for may have been removed or renamed.
          </p>
          <Link
            to="/blog"
            className="mt-6 inline-block rounded-xl bg-coral px-5 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-90"
          >
            ← Return to All Articles
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
        <link rel="canonical" href={window.location.href} />
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

      <article className="pt-28 pb-20 bg-slate-50/50">
        <div className="section-container max-w-4xl">
          {/* Category Tag & Title Header */}
          <div className="text-center">
            <span className="inline-flex items-center gap-1 rounded-full bg-coral/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-coral">
              <HiOutlineFolder size={14} /> {blog.category || "General"}
            </span>

            <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-navy-700 sm:text-4xl lg:text-5xl lg:leading-tight">
              {cleanTitle}
            </h1>

            {/* Author & Published Date */}
            <div className="mt-6 flex items-center justify-center gap-6 text-xs font-semibold text-navy-400">
              <div className="flex items-center gap-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-100 text-navy-600">
                  <HiOutlineUser size={14} />
                </div>
                <span>{blog.author?.name || "Medico Overseas Team"}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <HiOutlineCalendar size={15} className="text-coral" />
                <span>
                  {new Date(
                    blog.publishedAt || blog.createdAt,
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Featured Cover Image */}
          <div className="mt-10 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl">
            <img
              src={imageUrl}
              alt={cleanTitle}
              className="h-[320px] sm:h-[450px] w-full object-cover transition-transform duration-700 hover:scale-102"
              onError={(e) => {
                e.target.src = DEFAULT_IMAGE;
              }}
            />
          </div>

          {/* Article Main Body HTML Render */}
          <div className="mt-12 rounded-3xl border border-slate-100 bg-white p-6 sm:p-10 lg:p-12 shadow-sm">
            <div
              className="
                prose
                prose-slate
                prose-lg
                max-w-none
                prose-headings:font-heading
                prose-headings:font-bold
                prose-headings:text-navy-700
                prose-h2:text-2xl
                prose-h2:mt-8
                prose-h2:mb-4
                prose-h3:text-xl
                prose-p:text-slate-600
                prose-p:leading-relaxed
                prose-li:text-slate-600
                prose-li:leading-relaxed
                prose-strong:text-navy-800
                prose-a:font-semibold
                prose-a:text-coral
                prose-a:no-underline
                hover:prose-a:underline
                prose-img:rounded-2xl
                prose-img:shadow-md
                prose-blockquote:border-l-4
                prose-blockquote:border-coral
                prose-blockquote:bg-coral-50/40
                prose-blockquote:p-4
                prose-blockquote:rounded-r-xl
                prose-blockquote:not-italic
                prose-blockquote:text-navy-700
              "
              dangerouslySetInnerHTML={{ __html: sanitizedBody }}
            />

            {/* Social Share Footer */}
            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-navy-500">
                <HiOutlineShare size={16} className="text-coral" /> Share
                Article:
              </span>
              <div className="flex items-center gap-2">
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
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-navy-600 transition-all duration-300 hover:-translate-y-1 hover:bg-coral hover:text-white hover:shadow-md"
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
          <div className="mt-16 border-t border-slate-200/60 bg-white py-16">
            <div className="section-container max-w-4xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="font-heading text-xl font-bold text-navy-700">
                  Related Articles
                </h2>
                <Link
                  to="/blog"
                  className="text-xs font-bold text-coral hover:underline"
                >
                  View All Posts →
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {related.map((r) => (
                  <Link
                    key={r._id}
                    to={`/blog/${r.slug}`}
                    className="group rounded-2xl border border-slate-100 bg-slate-50/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-coral/30 hover:bg-white hover:shadow-md"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-coral">
                      {r.category || "MBBS Abroad"}
                    </span>
                    <h3 className="mt-2 line-clamp-2 font-heading text-sm font-bold text-navy-700 transition-colors group-hover:text-coral">
                      {stripHtml(r.title)}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Counselling Enquiry Section */}
        <div className="section-container max-w-4xl pt-16">
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 sm:p-10 shadow-xl">
            <EnquiryForm
              source="blog_post"
              title="Have Questions About Studying MBBS Abroad?"
            />
          </div>
        </div>
      </article>
    </>
  );
};

export default BlogPostPage;
