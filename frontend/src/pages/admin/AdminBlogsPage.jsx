import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlinePhotograph,
  HiOutlinePencil,
  HiOutlineX,
  HiOutlineUpload,
  HiOutlineCode,
  HiOutlineEye,
  HiOutlineTemplate,
} from "react-icons/hi";
import api from "../../lib/api";

// Preset snippets with embedded inline styles so frontend renders formatted text directly
const BODY_TEMPLATES = {
  standard: `<h2 style="font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-top: 1.5rem; margin-bottom: 0.75rem;">Introduction</h2>
<p style="margin-bottom: 1rem; line-height: 1.7; color: #475569;">Write your intro paragraph here...</p>

<h2 style="font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-top: 1.5rem; margin-bottom: 0.75rem;">Key Takeaways</h2>
<ul style="list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; color: #475569;">
  <li style="margin-bottom: 0.5rem;">Point number one</li>
  <li style="margin-bottom: 0.5rem;">Point number two</li>
  <li style="margin-bottom: 0.5rem;">Point number three</li>
</ul>

<h2 style="font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-top: 1.5rem; margin-bottom: 0.75rem;">Conclusion</h2>
<p style="margin-bottom: 1rem; line-height: 1.7; color: #475569;">Final summary thoughts go here.</p>`,

  callout: `<div style="background-color: #fff1f0; border-left: 4px solid #ff6b6b; padding: 1.25rem; border-radius: 0.75rem; margin: 1.5rem 0; color: #991b1b;">
  <strong style="font-weight: 700;">Important Note:</strong> Highlight critical information here for students and parents.
</div>`,

  bulletList: `<h3 style="font-size: 1.25rem; font-weight: 700; color: #1e293b; margin-top: 1.25rem; margin-bottom: 0.75rem;">Requirements & Documents</h3>
<ul style="list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; color: #475569;">
  <li style="margin-bottom: 0.5rem;"><strong style="color: #0f172a;">Passport:</strong> Valid for at least 18 months</li>
  <li style="margin-bottom: 0.5rem;"><strong style="color: #0f172a;">Academic Transcripts:</strong> 10th & 12th certificates</li>
  <li style="margin-bottom: 0.5rem;"><strong style="color: #0f172a;">NEET Scorecard:</strong> Mandatory qualifying marks</li>
</ul>`,

  quote: `<blockquote style="border-left: 4px solid #1e293b; padding-left: 1.25rem; font-style: italic; color: #334155; margin: 1.5rem 0; background-color: #f8fafc; padding-top: 0.75rem; padding-bottom: 0.75rem; border-radius: 0 0.5rem 0.5rem 0;">
  "Studying MBBS abroad opens up global clinical exposure and world-class medical training."
</blockquote>`,
};

const AdminBlogsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [imageInputType, setImageInputType] = useState("url"); // 'url' | 'file'
  const [previewHtml, setPreviewHtml] = useState(false);
  const [isRawHtmlMode, setIsRawHtmlMode] = useState(true);
  const queryClient = useQueryClient();

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    watch: watchCreate,
    setValue: setValueCreate,
  } = useForm();

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    watch: watchEdit,
    setValue: setValueEdit,
  } = useForm();

  const createCoverImageUrl = watchCreate("featuredImage.url");
  const createBodyText = watchCreate("body");
  const editCoverImageUrl = watchEdit("featuredImage.url");
  const editBodyText = watchEdit("body");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-blogs"],
    queryFn: async () => {
      const { data } = await api.get("/blogs", { params: { limit: 50 } });
      return data.data.blogs;
    },
  });

  const handleFileUpload = async (e, setValue) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await api.post("/blogs/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setValue("featuredImage.url", data.data.url);
      toast.success("Image uploaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Image upload failed");
    }
  };

  const applyTemplate = (templateKey, getValue, setValue) => {
    const currentContent = getValue("body") || "";
    const templateSnippet = BODY_TEMPLATES[templateKey];
    const updatedContent = currentContent
      ? `${currentContent}\n\n${templateSnippet}`
      : templateSnippet;
    setValue("body", updatedContent);
    toast.success("Template inserted into body!");
  };

  const processPayload = (payload) => {
    let cleanTitle = (payload.title || "").replace(/<[^>]*>?/gm, "").trim();
    let cleanExcerpt = (payload.excerpt || "").replace(/<[^>]*>?/gm, "").trim();
    let formattedBody = payload.body || "";

    // In plain text mode, convert newlines into clean inline-styled paragraphs
    if (!isRawHtmlMode && !formattedBody.trim().startsWith("<")) {
      formattedBody = formattedBody
        .split("\n\n")
        .map(
          (paragraph) =>
            `<p style="margin-bottom: 1rem; line-height: 1.7; color: #475569;">${paragraph.trim()}</p>`,
        )
        .join("\n");
    }

    return {
      ...payload,
      title: cleanTitle,
      excerpt: cleanExcerpt,
      body: formattedBody,
    };
  };

  const createMutation = useMutation({
    mutationFn: async (payload) => api.post("/blogs", processPayload(payload)),
    onSuccess: () => {
      toast.success("BLOG created as draft");
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
      resetCreate();
      setShowForm(false);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to create post"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      api.put(`/blogs/${id}`, processPayload(payload)),
    onSuccess: () => {
      toast.success("BLOG updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
      setEditingBlog(null);
      resetEdit();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to update post"),
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/blogs/${id}`, { status }),
    onSuccess: () => {
      toast.success("BLOG status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/blogs/${id}`),
    onSuccess: () => {
      toast.success("BLOG deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
    },
  });

  const handleStartEdit = (blog) => {
    setEditingBlog(blog);
    setShowForm(false);
    resetEdit({
      title: blog.title,
      category: blog.category,
      excerpt: blog.excerpt,
      body: blog.body,
      featuredImage: {
        url: blog.featuredImage?.url || "",
      },
    });
  };

  const blogs = data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-navy-700">
            Blog CMS
          </h2>
          <p className="text-xs text-slate-500">
            Manage, edit, and format website articles
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm((s) => !s);
            setEditingBlog(null);
          }}
          className="flex items-center gap-2 rounded-xl bg-coral px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 hover:shadow-md"
        >
          <HiOutlinePlus size={16} /> New Post
        </button>
      </div>

      {/* CREATE FORM */}
      {showForm && (
        <form
          onSubmit={handleSubmitCreate((d) => createMutation.mutate(d))}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-navy-700">Create New Post</h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <HiOutlineX size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Post Title
              </label>
              <input
                placeholder="Enter title..."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 transition-colors focus:border-coral focus:outline-none"
                {...registerCreate("title", { required: true })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Category
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 capitalize transition-colors focus:border-coral focus:outline-none"
                {...registerCreate("category")}
              >
                {["general", "country", "exam", "visa", "scholarship"].map(
                  (c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          {/* IMAGE UPLOADER */}
          <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-navy-700">
                Featured Cover Image
              </label>
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setImageInputType("url")}
                  className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                    imageInputType === "url"
                      ? "bg-coral text-white"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Unsplash / URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputType("file")}
                  className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                    imageInputType === "file"
                      ? "bg-coral text-white"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Upload File
                </button>
              </div>
            </div>

            {imageInputType === "url" ? (
              <div className="relative flex items-center">
                <HiOutlinePhotograph
                  className="absolute left-3.5 text-slate-400"
                  size={18}
                />
                <input
                  type="url"
                  placeholder="Paste Unsplash or Image URL (https://...)"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3.5 text-sm focus:border-coral focus:outline-none"
                  {...registerCreate("featuredImage.url")}
                />
              </div>
            ) : (
              <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-xs font-semibold text-slate-600 hover:border-coral hover:bg-slate-50/50">
                <HiOutlineUpload size={20} className="text-coral" />
                <span>Choose local image file (PNG, JPG, WEBP - Max 5MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, setValueCreate)}
                />
              </label>
            )}

            {createCoverImageUrl && (
              <div className="relative h-40 w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
                <img
                  src={createCoverImageUrl}
                  alt="Cover Preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Excerpt (Short Summary)
            </label>
            <input
              placeholder="Excerpt (max 300 chars)"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 transition-colors focus:border-coral focus:outline-none"
              {...registerCreate("excerpt", { required: true })}
            />
          </div>

          {/* PRESETS TOOLBAR & BODY EDITOR */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="flex items-center gap-1 text-xs font-bold text-navy-700">
                  <HiOutlineTemplate className="text-coral" size={16} /> Insert
                  Format Preset:
                </span>
                {[
                  ["standard", "Heading + Intro"],
                  ["bulletList", "Bullet Points"],
                  ["callout", "Callout Box"],
                  ["quote", "Quote"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      applyTemplate(key, watchCreate, setValueCreate)
                    }
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:border-coral hover:text-coral"
                  >
                    + {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRawHtmlMode(!isRawHtmlMode)}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                    isRawHtmlMode
                      ? "bg-navy-700 text-white"
                      : "border border-slate-200 bg-white text-navy-700"
                  }`}
                >
                  <HiOutlineCode size={14} />{" "}
                  {isRawHtmlMode ? "HTML Mode" : "Normal Text"}
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewHtml(!previewHtml)}
                  className="flex items-center gap-1 rounded-lg border border-coral/30 bg-coral/10 px-2.5 py-1 text-[11px] font-semibold text-coral hover:bg-coral/20"
                >
                  <HiOutlineEye size={14} /> {previewHtml ? "Hide" : "Preview"}
                </button>
              </div>
            </div>

            <textarea
              placeholder={
                isRawHtmlMode
                  ? "Write or paste HTML markup..."
                  : "Type standard article paragraphs. Double spacing automatically breaks paragraphs."
              }
              rows={8}
              className="w-full rounded-xl border border-slate-200 p-3.5 font-mono text-xs text-slate-800 leading-relaxed focus:border-coral focus:outline-none"
              {...registerCreate("body", { required: true })}
            />

            {/* LIVE PREVIEW BOX */}
            {previewHtml && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-inner">
                <p className="mb-3 border-b border-slate-100 pb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Article Live Formatting Preview
                </p>
                <div
                  className="prose prose-slate max-w-none text-slate-700 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: createBodyText || "<i>Nothing to preview yet.</i>",
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-xl bg-coral px-5 py-2.5 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {createMutation.isPending ? "Saving..." : "Save as Draft"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* EDIT FORM */}
      {editingBlog && (
        <form
          onSubmit={handleSubmitEdit((d) =>
            updateMutation.mutate({ id: editingBlog._id, payload: d }),
          )}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-navy-700">
              Edit Post:{" "}
              <span className="font-normal text-slate-500">
                {editingBlog.title}
              </span>
            </h3>
            <button
              type="button"
              onClick={() => setEditingBlog(null)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <HiOutlineX size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Post Title
              </label>
              <input
                placeholder="Title"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 transition-colors focus:border-coral focus:outline-none"
                {...registerEdit("title", { required: true })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Category
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 capitalize transition-colors focus:border-coral focus:outline-none"
                {...registerEdit("category")}
              >
                {["general", "country", "exam", "visa", "scholarship"].map(
                  (c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          {/* EDIT IMAGE SECTION */}
          <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-navy-700">
                Featured Cover Image
              </label>
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setImageInputType("url")}
                  className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                    imageInputType === "url"
                      ? "bg-coral text-white"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Unsplash / URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputType("file")}
                  className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                    imageInputType === "file"
                      ? "bg-coral text-white"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Upload File
                </button>
              </div>
            </div>

            {imageInputType === "url" ? (
              <div className="relative flex items-center">
                <HiOutlinePhotograph
                  className="absolute left-3.5 text-slate-400"
                  size={18}
                />
                <input
                  type="url"
                  placeholder="Paste Unsplash or Image URL"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3.5 text-sm focus:border-coral focus:outline-none"
                  {...registerEdit("featuredImage.url")}
                />
              </div>
            ) : (
              <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-xs font-semibold text-slate-600 hover:border-coral hover:bg-slate-50/50">
                <HiOutlineUpload size={20} className="text-coral" />
                <span>Choose local image file (PNG, JPG, WEBP - Max 5MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, setValueEdit)}
                />
              </label>
            )}

            {editCoverImageUrl && (
              <div className="relative h-40 w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
                <img
                  src={editCoverImageUrl}
                  alt="Cover Preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Excerpt (Short Summary)
            </label>
            <input
              placeholder="Excerpt (max 300 chars)"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 transition-colors focus:border-coral focus:outline-none"
              {...registerEdit("excerpt", { required: true })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="flex items-center gap-1 text-xs font-bold text-navy-700">
                  <HiOutlineTemplate className="text-coral" size={16} /> Insert
                  Format Preset:
                </span>
                {[
                  ["standard", "Heading + Intro"],
                  ["bulletList", "Bullet Points"],
                  ["callout", "Callout Box"],
                  ["quote", "Quote"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyTemplate(key, watchEdit, setValueEdit)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:border-coral hover:text-coral"
                  >
                    + {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRawHtmlMode(!isRawHtmlMode)}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                    isRawHtmlMode
                      ? "bg-navy-700 text-white"
                      : "border border-slate-200 bg-white text-navy-700"
                  }`}
                >
                  <HiOutlineCode size={14} />{" "}
                  {isRawHtmlMode ? "HTML Mode" : "Normal Text"}
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewHtml(!previewHtml)}
                  className="flex items-center gap-1 rounded-lg border border-coral/30 bg-coral/10 px-2.5 py-1 text-[11px] font-semibold text-coral hover:bg-coral/20"
                >
                  <HiOutlineEye size={14} /> {previewHtml ? "Hide" : "Preview"}
                </button>
              </div>
            </div>

            <textarea
              placeholder="Body (rich text HTML)"
              rows={8}
              className="w-full rounded-xl border border-slate-200 p-3.5 font-mono text-xs text-slate-800 leading-relaxed focus:border-coral focus:outline-none"
              {...registerEdit("body", { required: true })}
            />

            {previewHtml && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-inner">
                <p className="mb-3 border-b border-slate-100 pb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Article Live Formatting Preview
                </p>
                <div
                  className="prose prose-slate max-w-none text-slate-700 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: editBodyText || "<i>Nothing to preview yet.</i>",
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="rounded-xl bg-coral px-5 py-2.5 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {updateMutation.isPending ? "Updating..." : "Update Post"}
            </button>
            <button
              type="button"
              onClick={() => setEditingBlog(null)}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3.5">Image</th>
              <th className="px-5 py-3.5">Title</th>
              <th className="px-5 py-3.5">Category</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Views</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <>
                {[1, 2, 3, 4, 5].map((item) => (
                  <tr key={item} className="animate-pulse">
                    <td className="px-5 py-3.5">
                      <div className="h-10 w-12 rounded-lg bg-slate-200" />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="h-4 w-48 rounded bg-slate-200" />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="h-4 w-20 rounded bg-slate-100" />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="h-5 w-20 rounded-full bg-slate-200" />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="h-4 w-12 rounded bg-slate-100" />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="ml-auto h-6 w-14 rounded-md bg-slate-200" />
                    </td>
                  </tr>
                ))}
              </>
            )}
            {blogs.map((b) => (
              <tr
                key={b._id}
                className="transition-colors hover:bg-slate-50/60"
              >
                <td className="px-5 py-3.5">
                  <div className="h-10 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                    {b.featuredImage?.url ? (
                      <img
                        src={b.featuredImage.url}
                        alt={b.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <HiOutlinePhotograph size={18} />
                      </div>
                    )}
                  </div>
                </td>
                <td className="max-w-xs truncate px-5 py-3.5 font-medium text-navy-700">
                  {b.title}
                </td>
                <td className="px-5 py-3.5 capitalize text-slate-600">
                  {b.category}
                </td>
                <td className="px-5 py-3.5">
                  <select
                    value={b.status}
                    onChange={(e) =>
                      publishMutation.mutate({
                        id: b._id,
                        status: e.target.value,
                      })
                    }
                    className={`rounded-full border-0 px-3 py-1 text-xs font-bold transition-colors focus:ring-2 focus:ring-coral/40 ${
                      b.status === "published"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {["draft", "published"].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3.5 font-medium text-slate-600">
                  {b.views ?? 0}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleStartEdit(b)}
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy-700"
                      title="Edit Post"
                    >
                      <HiOutlinePencil size={18} />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(b._id)}
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      title="Delete Post"
                    >
                      <HiOutlineTrash size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBlogsPage;
