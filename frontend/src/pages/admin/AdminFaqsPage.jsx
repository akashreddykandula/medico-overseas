import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineQuestionMarkCircle,
} from "react-icons/hi";
import api from "../../lib/api";

const CATEGORIES = [
  "general",
  "admission",
  "fees",
  "visa",
  "fmge",
  "nmat",
  "country_specific",
];

const CATEGORY_LABELS = {
  general: "General",
  admission: "Admission",
  fees: "Fees",
  visa: "Visa",
  fmge: "FMGE",
  nmat: "NMAT",
  country_specific: "Country-Specific",
};

const AdminFaqsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      category: "general",
      displayOrder: 0,
      isPublished: true,
    },
  });

  // Fetch FAQs
  const { data, isLoading } = useQuery({
    queryKey: ["admin-faqs"],
    queryFn: async () => {
      const { data } = await api.get("/faqs", {
        params: { limit: 100 },
      });

      return data.data.items;
    },
  });

  // Create FAQ
  const createMutation = useMutation({
    mutationFn: (payload) => api.post("/faqs", payload),

    onSuccess: () => {
      toast.success("FAQ created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });

      reset({
        question: "",
        answer: "",
        category: "general",
        displayOrder: 0,
        isPublished: true,
      });

      setShowForm(false);
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create FAQ");
    },
  });

  // Update FAQ
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => api.put(`/faqs/${id}`, payload),

    onSuccess: () => {
      toast.success("FAQ updated successfully");

      queryClient.invalidateQueries({
        queryKey: ["admin-faqs"],
      });

      setEditingFaq(null);

      reset({
        question: "",
        answer: "",
        category: "general",
        displayOrder: 0,
        isPublished: true,
      });
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update FAQ");
    },
  });

  // Delete FAQ
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/faqs/${id}`),

    onSuccess: () => {
      toast.success("FAQ deleted");

      queryClient.invalidateQueries({
        queryKey: ["admin-faqs"],
      });
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete FAQ");
    },
  });

  // Start editing
  const handleStartEdit = (faq) => {
    setEditingFaq(faq);
    setShowForm(false);

    reset({
      question: faq.question || "",
      answer: faq.answer || "",
      category: faq.category || "general",
      relatedCountry: faq.relatedCountry?._id || faq.relatedCountry || "",
      displayOrder: faq.displayOrder ?? 0,
      isPublished: faq.isPublished ?? true,
    });
  };

  // Cancel form
  const handleCancel = () => {
    setShowForm(false);
    setEditingFaq(null);

    reset({
      question: "",
      answer: "",
      category: "general",
      relatedCountry: "",
      displayOrder: 0,
      isPublished: true,
    });
  };

  const faqs = data || [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-navy-600">
            Frequently Asked Questions
          </h2>

          <p className="mt-1 text-xs text-navy-400">
            Manage questions and answers displayed on the public FAQ page.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm((s) => !s);
            setEditingFaq(null);

            reset({
              question: "",
              answer: "",
              category: "general",
              relatedCountry: "",
              displayOrder: 0,
              isPublished: true,
            });
          }}
          className="flex items-center gap-2 rounded-lg bg-coral px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
        >
          <HiOutlinePlus size={16} />
          New FAQ
        </button>
      </div>

      {/* CREATE / EDIT FORM */}
      {(showForm || editingFaq) && (
        <form
          onSubmit={handleSubmit((formData) => {
            const payload = {
              question: formData.question,
              answer: formData.answer,
              category: formData.category,
              displayOrder: Number(formData.displayOrder || 0),
              isPublished: Boolean(formData.isPublished),
            };

            // Only send relatedCountry if a real ID was selected
            if (formData.relatedCountry?.trim()) {
              payload.relatedCountry = formData.relatedCountry.trim();
            }

            if (editingFaq) {
              updateMutation.mutate({
                id: editingFaq._id,
                payload,
              });
            } else {
              createMutation.mutate(payload);
            }
          })}
          className="mt-4 space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
        >
          {/* Form Header */}
          <div className="flex items-center justify-between border-b border-navy-50 pb-3">
            <div className="flex items-center gap-2">
              <HiOutlineQuestionMarkCircle size={20} className="text-coral" />

              <h3 className="text-sm font-bold text-navy-600">
                {editingFaq ? "Edit FAQ" : "Create New FAQ"}
              </h3>
            </div>

            <button
              type="button"
              onClick={handleCancel}
              className="text-navy-400 hover:text-navy-600"
            >
              <HiOutlineX size={18} />
            </button>
          </div>

          {/* Question */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-navy-600">
              Question
            </label>

            <input
              placeholder="e.g. Is NEET required for MBBS abroad?"
              className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm focus:border-coral focus:outline-none"
              {...register("question", {
                required: "Question is required",
              })}
            />

            {errors.question && (
              <p className="mt-1 text-xs text-red-500">
                {errors.question.message}
              </p>
            )}
          </div>

          {/* Answer */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-navy-600">
              Answer
            </label>

            <textarea
              rows={6}
              placeholder="Write the answer here..."
              className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm leading-relaxed focus:border-coral focus:outline-none"
              {...register("answer", {
                required: "Answer is required",
              })}
            />

            {errors.answer && (
              <p className="mt-1 text-xs text-red-500">
                {errors.answer.message}
              </p>
            )}
          </div>

          {/* Category + Display Order */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-navy-600">
                Category
              </label>

              <select
                className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm capitalize focus:border-coral focus:outline-none"
                {...register("category")}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-navy-600">
                Display Order
              </label>

              <input
                type="number"
                min="0"
                placeholder="0"
                className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm focus:border-coral focus:outline-none"
                {...register("displayOrder")}
              />

              <p className="mt-1 text-[11px] text-navy-400">
                Lower numbers appear first.
              </p>
            </div>
          </div>

          {/* Related Country */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-navy-600">
              Related Country
            </label>

            <input
              placeholder="Optional Country ID"
              className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm focus:border-coral focus:outline-none"
              {...register("relatedCountry")}
            />

            <p className="mt-1 text-[11px] text-navy-400">
              Leave empty for general FAQs.
            </p>
          </div>

          {/* Published */}
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-navy-50 bg-navy-50/40 p-3">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-navy-200 text-coral focus:ring-coral"
              {...register("isPublished")}
            />

            <div>
              <p className="text-xs font-semibold text-navy-600">Publish FAQ</p>

              <p className="text-[11px] text-navy-400">
                Published FAQs are visible on the public FAQ page.
              </p>
            </div>
          </label>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="rounded-lg bg-coral px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : editingFaq
                  ? "Update FAQ"
                  : "Create FAQ"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-navy-100 px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-navy-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* FAQ TABLE */}
      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-navy-50 text-left text-xs uppercase text-navy-400">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Question</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3">Answer</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y divide-navy-50">
            {isLoading && (
              <tr>
                <td colSpan={6} className="p-0">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between border-b border-navy-50 px-4 py-3.5 animate-pulse"
                    >
                      <div className="flex items-center gap-3 w-1/3">
                        <div className="h-4 w-4 rounded bg-coral/20 shrink-0" />
                        <div className="h-3.5 w-full rounded bg-navy-100" />
                      </div>
                      <div className="h-3.5 w-1/4 rounded bg-navy-50 hidden sm:block" />
                      <div className="h-5 w-20 rounded-full bg-navy-100 hidden md:block" />
                      <div className="h-3.5 w-12 rounded bg-navy-50 hidden lg:block" />
                      <div className="h-5 w-16 rounded-full bg-emerald-50" />
                      <div className="h-6 w-14 rounded-md bg-navy-100" />
                    </div>
                  ))}
                </td>
              </tr>
            )}

            {!isLoading && faqs.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-navy-400"
                >
                  No FAQs created yet.
                </td>
              </tr>
            )}

            {faqs.map((faq) => (
              <tr
                key={faq._id}
                className="transition-colors hover:bg-slate-50/50"
              >
                {/* Order */}
                <td className="px-4 py-3">
                  <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-navy-50 px-2 text-xs font-bold text-navy-600">
                    {faq.displayOrder ?? 0}
                  </span>
                </td>

                {/* Question */}
                <td className="max-w-sm px-4 py-3">
                  <p className="font-semibold text-navy-600">{faq.question}</p>
                </td>

                {/* Category */}
                <td className="px-4 py-3">
                  <span className="rounded-full bg-coral/10 px-2.5 py-1 text-xs font-semibold text-coral">
                    {CATEGORY_LABELS[faq.category] || faq.category}
                  </span>
                </td>

                {/* Published */}
                <td className="px-4 py-3">
                  {faq.isPublished ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                      <HiOutlineCheck size={14} />
                      Published
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                      Draft
                    </span>
                  )}
                </td>

                {/* Answer */}
                <td className="max-w-md px-4 py-3">
                  <p className="line-clamp-2 text-xs leading-relaxed text-navy-400">
                    {faq.answer}
                  </p>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleStartEdit(faq)}
                      className="rounded-md p-1.5 text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-600"
                      title="Edit FAQ"
                    >
                      <HiOutlinePencil size={16} />
                    </button>

                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this FAQ?",
                          )
                        ) {
                          deleteMutation.mutate(faq._id);
                        }
                      }}
                      className="rounded-md p-1.5 text-coral transition-colors hover:bg-coral-50 hover:text-coral-700"
                      title="Delete FAQ"
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

export default AdminFaqsPage;
