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

const BODY_TEMPLATES = {
  standard: `<h2>Introduction</h2>
<p>Write your intro paragraph here...</p>

<h2>Key Takeaways</h2>
<ul>
  <li>Point number one</li>
  <li>Point number two</li>
  <li>Point number three</li>
</ul>

<h2>Conclusion</h2>
<p>Final summary thoughts go here.</p>`,

  callout: `<div style="background-color: #fff1f0; border-left: 4px solid #ff6b6b; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
  <strong>Important Note:</strong> Highlight critical information here for students and parents.
</div>`,

  bulletList: `<h3>Requirements & Documents</h3>
<ul>
  <li><strong>Passport:</strong> Valid for at least 18 months</li>
  <li><strong>Academic Transcripts:</strong> 10th & 12th certificates</li>
  <li><strong>NEET Scorecard:</strong> Mandatory qualifying marks</li>
</ul>`,

  quote: `<blockquote style="border-left: 4px solid #1e293b; padding-left: 1rem; font-style: italic; color: #475569; margin: 1.5rem 0;">
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
  // Watch coverImage inputs & body for live previews
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
  // Helper: Convert uploaded local image file to Base64
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
  // Helper: Append HTML Template into Body
  const applyTemplate = (templateKey, getValue, setValue) => {
    const currentContent = getValue("body") || "";
    const templateSnippet = BODY_TEMPLATES[templateKey];
    const updatedContent = currentContent
      ? `${currentContent}\n\n${templateSnippet}`
      : templateSnippet;
    setValue("body", updatedContent);
    toast.success("Template inserted into body!");
  };
  // Helper: Sanitize title and excerpt to avoid HTML string contamination
  const processPayload = (payload) => {
    let cleanTitle = (payload.title || "").replace(/<[^>]*>?/gm, "").trim();
    let cleanExcerpt = (payload.excerpt || "").replace(/<[^>]*>?/gm, "").trim();
    let formattedBody = payload.body || "";
    if (!isRawHtmlMode && !formattedBody.trim().startsWith("<")) {
      formattedBody = formattedBody
        .split("\n\n")
        .map((paragraph) => `<p>${paragraph.trim()}</p>`)
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
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold text-navy-600">
          Blog CMS
        </h2>
        <button
          onClick={() => {
            setShowForm((s) => !s);
            setEditingBlog(null);
          }}
          className="flex items-center gap-2 rounded-lg bg-coral px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
        >
          <HiOutlinePlus /> New Post
        </button>
      </div>
      {/* CREATE FORM */}
      {showForm && (
        <form
          onSubmit={handleSubmitCreate((d) => createMutation.mutate(d))}
          className="mt-4 space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-navy-50 pb-2">
            <h3 className="text-sm font-bold text-navy-600">Create New Post</h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-navy-400 hover:text-navy-600"
            >
              <HiOutlineX size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              placeholder="Title"
              className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-coral focus:outline-none"
              {...registerCreate("title", { required: true })}
            />
            <select
              className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-coral focus:outline-none"
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
          {/* IMAGE SECTION (URL or LOCAL FILE UPLOAD) */}
          <div className="space-y-3 rounded-xl border border-navy-50 bg-slate-50/50 p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-navy-600 uppercase tracking-wide">
                Featured Cover Image
              </label>
              <div className="flex items-center gap-1 rounded-lg bg-white p-1 border border-navy-100 text-xs">
                <button
                  type="button"
                  onClick={() => setImageInputType("url")}
                  className={`rounded px-2 py-0.5 font-medium transition-colors ${
                    imageInputType === "url"
                      ? "bg-coral text-white"
                      : "text-navy-400 hover:text-navy-600"
                  }`}
                >
                  Unsplash / URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputType("file")}
                  className={`rounded px-2 py-0.5 font-medium transition-colors ${
                    imageInputType === "file"
                      ? "bg-coral text-white"
                      : "text-navy-400 hover:text-navy-600"
                  }`}
                >
                  Upload File
                </button>
              </div>
            </div>
            {imageInputType === "url" ? (
              <div className="relative flex items-center">
                <HiOutlinePhotograph
                  className="absolute left-3 text-navy-400"
                  size={18}
                />
                <input
                  type="url"
                  placeholder="Paste Unsplash or Image URL (e.g., https://images.unsplash.com/...)"
                  className="w-full rounded-lg border border-navy-100 bg-white pl-10 pr-3 py-2 text-sm focus:border-coral focus:outline-none"
                  {...registerCreate("featuredImage.url")}
                />
              </div>
            ) : (
              <div className="relative flex items-center">
                <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-navy-200 bg-white p-3 text-xs font-semibold text-navy-500 hover:border-coral">
                  <HiOutlineUpload size={18} className="text-coral" />
                  <span>Choose local image file (PNG, JPG, WEBP)</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, setValueCreate)}
                  />
                </label>
              </div>
            )}
            {createCoverImageUrl && (
              <div className="relative h-32 w-full overflow-hidden rounded-lg border border-navy-50 bg-white">
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
          <input
            placeholder="Excerpt (max 300 chars)"
            className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-coral focus:outline-none"
            {...registerCreate("excerpt", { required: true })}
          />
          {/* BODY WITH HTML FORMAT PRESETS & DUAL MODE */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-navy-50/50 p-2 border border-navy-50">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-navy-600 px-1 flex items-center gap-1">
                  <HiOutlineTemplate className="text-coral" size={16} /> Insert
                  Format Preset:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    applyTemplate("standard", watchCreate, setValueCreate)
                  }
                  className="rounded bg-white px-2 py-1 text-[11px] font-medium text-navy-600 border border-navy-100 hover:border-coral"
                >
                  Heading + Intro
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyTemplate("bulletList", watchCreate, setValueCreate)
                  }
                  className="rounded bg-white px-2 py-1 text-[11px] font-medium text-navy-600 border border-navy-100 hover:border-coral"
                >
                  Bullet Points
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyTemplate("callout", watchCreate, setValueCreate)
                  }
                  className="rounded bg-white px-2 py-1 text-[11px] font-medium text-navy-600 border border-navy-100 hover:border-coral"
                >
                  Callout Box
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyTemplate("quote", watchCreate, setValueCreate)
                  }
                  className="rounded bg-white px-2 py-1 text-[11px] font-medium text-navy-600 border border-navy-100 hover:border-coral"
                >
                  Quote
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRawHtmlMode(!isRawHtmlMode)}
                  className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-bold ${
                    isRawHtmlMode
                      ? "bg-navy-600 text-white"
                      : "bg-white text-navy-600 border border-navy-100"
                  }`}
                >
                  <HiOutlineCode size={14} />{" "}
                  {isRawHtmlMode ? "HTML Mode" : "Normal Text Mode"}
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewHtml(!previewHtml)}
                  className="flex items-center gap-1 rounded bg-white px-2 py-1 text-[11px] font-semibold text-coral border border-coral-100 hover:bg-coral-50"
                >
                  <HiOutlineEye size={14} /> {previewHtml ? "Hide" : "Preview"}
                </button>
              </div>
            </div>
            <textarea
              placeholder={
                isRawHtmlMode
                  ? "Write or paste HTML markup (e.g., <h2>Title</h2> <p>Text...</p>)"
                  : "Type standard article paragraphs. Double spacing will automatically create formatted paragraphs."
              }
              rows={6}
              className="w-full rounded-lg border border-navy-100 font-mono text-xs p-3 focus:border-coral focus:outline-none leading-relaxed"
              {...registerCreate("body", { required: true })}
            />
            {/* LIVE HTML PREVIEW BOX */}
            {previewHtml && (
              <div className="rounded-xl border border-navy-100 bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-navy-400 mb-2 border-b pb-1">
                  Article Live Formatting Preview
                </p>
                <div
                  className="prose prose-sm max-w-none text-navy-700 leading-relaxed"
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
              className="rounded-lg bg-coral px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {createMutation.isPending ? "Saving..." : "Save as Draft"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-navy-100 px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-navy-50"
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
          className="mt-4 space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-navy-50 pb-2">
            <h3 className="text-sm font-bold text-navy-600">
              Edit Post:{" "}
              <span className="font-normal text-navy-400">
                {editingBlog.title}
              </span>
            </h3>
            <button
              type="button"
              onClick={() => setEditingBlog(null)}
              className="text-navy-400 hover:text-navy-600"
            >
              <HiOutlineX size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              placeholder="Title"
              className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-coral focus:outline-none"
              {...registerEdit("title", { required: true })}
            />
            <select
              className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-coral focus:outline-none"
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
          {/* EDIT IMAGE SECTION */}
          <div className="space-y-3 rounded-xl border border-navy-50 bg-slate-50/50 p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-navy-600 uppercase tracking-wide">
                Featured Cover Image
              </label>
              <div className="flex items-center gap-1 rounded-lg bg-white p-1 border border-navy-100 text-xs">
                <button
                  type="button"
                  onClick={() => setImageInputType("url")}
                  className={`rounded px-2 py-0.5 font-medium transition-colors ${
                    imageInputType === "url"
                      ? "bg-coral text-white"
                      : "text-navy-400 hover:text-navy-600"
                  }`}
                >
                  Unsplash / URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputType("file")}
                  className={`rounded px-2 py-0.5 font-medium transition-colors ${
                    imageInputType === "file"
                      ? "bg-coral text-white"
                      : "text-navy-400 hover:text-navy-600"
                  }`}
                >
                  Upload File
                </button>
              </div>
            </div>
            {imageInputType === "url" ? (
              <div className="relative flex items-center">
                <HiOutlinePhotograph
                  className="absolute left-3 text-navy-400"
                  size={18}
                />
                <input
                  type="url"
                  placeholder="Paste Unsplash or Image URL"
                  className="w-full rounded-lg border border-navy-100 bg-white pl-10 pr-3 py-2 text-sm focus:border-coral focus:outline-none"
                  {...registerEdit("featuredImage.url")}
                />
              </div>
            ) : (
              <div className="relative flex items-center">
                <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-navy-200 bg-white p-3 text-xs font-semibold text-navy-500 hover:border-coral">
                  <HiOutlineUpload size={18} className="text-coral" />
                  <span>Choose local image file (PNG, JPG, WEBP)</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, setValueEdit)}
                  />
                </label>
              </div>
            )}
            {editCoverImageUrl && (
              <div className="relative h-32 w-full overflow-hidden rounded-lg border border-navy-50 bg-white">
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
          <input
            placeholder="Excerpt (max 300 chars)"
            className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-coral focus:outline-none"
            {...registerEdit("excerpt", { required: true })}
          />
          {/* EDIT BODY FORMAT PRESETS */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-navy-50/50 p-2 border border-navy-50">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-navy-600 px-1 flex items-center gap-1">
                  <HiOutlineTemplate className="text-coral" size={16} /> Insert
                  Format Preset:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    applyTemplate("standard", watchEdit, setValueEdit)
                  }
                  className="rounded bg-white px-2 py-1 text-[11px] font-medium text-navy-600 border border-navy-100 hover:border-coral"
                >
                  Heading + Intro
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyTemplate("bulletList", watchEdit, setValueEdit)
                  }
                  className="rounded bg-white px-2 py-1 text-[11px] font-medium text-navy-600 border border-navy-100 hover:border-coral"
                >
                  Bullet Points
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyTemplate("callout", watchEdit, setValueEdit)
                  }
                  className="rounded bg-white px-2 py-1 text-[11px] font-medium text-navy-600 border border-navy-100 hover:border-coral"
                >
                  Callout Box
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyTemplate("quote", watchEdit, setValueEdit)
                  }
                  className="rounded bg-white px-2 py-1 text-[11px] font-medium text-navy-600 border border-navy-100 hover:border-coral"
                >
                  Quote
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRawHtmlMode(!isRawHtmlMode)}
                  className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-bold ${
                    isRawHtmlMode
                      ? "bg-navy-600 text-white"
                      : "bg-white text-navy-600 border border-navy-100"
                  }`}
                >
                  <HiOutlineCode size={14} />{" "}
                  {isRawHtmlMode ? "HTML Mode" : "Normal Text Mode"}
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewHtml(!previewHtml)}
                  className="flex items-center gap-1 rounded bg-white px-2 py-1 text-[11px] font-semibold text-coral border border-coral-100 hover:bg-coral-50"
                >
                  <HiOutlineEye size={14} /> {previewHtml ? "Hide" : "Preview"}
                </button>
              </div>
            </div>
            <textarea
              placeholder="Body (rich text HTML)"
              rows={6}
              className="w-full rounded-lg border border-navy-100 font-mono text-xs p-3 focus:border-coral focus:outline-none leading-relaxed"
              {...registerEdit("body", { required: true })}
            />
            {previewHtml && (
              <div className="rounded-xl border border-navy-100 bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-navy-400 mb-2 border-b pb-1">
                  Article Live Formatting Preview
                </p>
                <div
                  className="prose prose-sm max-w-none text-navy-700 leading-relaxed"
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
              className="rounded-lg bg-coral px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {updateMutation.isPending ? "Updating..." : "Update Post"}
            </button>
            <button
              type="button"
              onClick={() => setEditingBlog(null)}
              className="rounded-lg border border-navy-100 px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-navy-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {/* TABLE DISPLAYING BLOGS */}
      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-navy-50 text-left text-xs uppercase text-navy-400">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Views</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-50">
            {isLoading && (
              <>
                {[1, 2, 3, 4, 5].map((item) => (
                  <tr key={item} className="animate-pulse">
                    <td className="px-4 py-3.5">
                      <div className="h-8 w-8 rounded-lg bg-navy-100" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-4 w-32 rounded bg-navy-100" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-4 w-24 rounded bg-navy-50" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-4 w-20 rounded bg-navy-50" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-5 w-16 rounded-full bg-coral/15" />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="ml-auto h-6 w-14 rounded-md bg-navy-100" />
                    </td>
                  </tr>
                ))}
              </>
            )}
            {blogs.map((b) => (
              <tr
                key={b._id}
                className="transition-colors hover:bg-slate-50/50"
              >
                <td className="px-4 py-3">
                  <div className="h-10 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-navy-50">
                    {b.featuredImage?.url ? (
                      <img
                        src={b.featuredImage.url}
                        alt={b.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-navy-300">
                        <HiOutlinePhotograph size={16} />
                      </div>
                    )}
                  </div>
                </td>
                <td className="max-w-xs truncate px-4 py-3 font-medium text-navy-600">
                  {b.title}
                </td>
                <td className="px-4 py-3 capitalize">{b.category}</td>
                <td className="px-4 py-3">
                  <select
                    value={b.status}
                    onChange={(e) =>
                      publishMutation.mutate({
                        id: b._id,
                        status: e.target.value,
                      })
                    }
                    className="rounded-full border-0 bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-600 focus:ring-1 focus:ring-coral"
                  >
                    {["draft", "published"].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">{b.views ?? 0}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleStartEdit(b)}
                      className="rounded-md p-1 text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-600"
                      title="Edit Post"
                    >
                      <HiOutlinePencil size={16} />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(b._id)}
                      className="rounded-md p-1 text-coral transition-colors hover:bg-coral-50 hover:text-coral-700"
                      title="Delete Post"
                    >
                      <HiOutlineTrash size={16} />
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
