import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineX,
  HiOutlinePhotograph,
  HiOutlineUpload,
} from "react-icons/hi";
import api from "../../lib/api";

const AdminCountriesPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [imageInputType, setImageInputType] = useState("url"); // 'url' | 'file'

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

  // Watch hero image URLs for live form previews
  const createHeroImageUrl = watchCreate("heroImage.url");
  const editHeroImageUrl = watchEdit("heroImage.url");

  const { data: countries = [], isLoading } = useQuery({
    queryKey: ["admin-countries"],
    queryFn: async () => {
      const { data } = await api.get("/countries");
      return data.data.countries;
    },
  });

  // Convert uploaded local image file to Data URL
  const handleFileUpload = (e, setValue) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setValue("heroImage.url", reader.result);
      toast.success("Image selected!");
    };
    reader.readAsDataURL(file);
  };

  const createMutation = useMutation({
    mutationFn: (payload) => api.post("/countries", payload),
    onSuccess: () => {
      toast.success("Destination created");
      queryClient.invalidateQueries({ queryKey: ["admin-countries"] });
      resetCreate();
      setShowForm(false);
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.message || "Failed to create destination",
      ),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => api.put(`/countries/${id}`, payload),
    onSuccess: () => {
      toast.success("Destination updated");
      queryClient.invalidateQueries({ queryKey: ["admin-countries"] });
      setEditingCountry(null);
      resetEdit();
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.message || "Failed to update destination",
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/countries/${id}`),
    onSuccess: () => {
      toast.success("Destination deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-countries"] });
      setDeleteConfirmId(null);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Delete failed"),
  });

  const onSubmitCreate = (formData) => {
    createMutation.mutate({
      name: formData.name,
      shortDescription: formData.shortDescription,
      overview: formData.overview,
      heroImage: {
        url: formData.heroImage?.url || "",
      },
      eligibility: { minAge: 17, neetRequired: true, minAcademicPercent: 50 },
    });
  };

  const onSubmitEdit = (formData) => {
    updateMutation.mutate({
      id: editingCountry._id,
      payload: {
        name: formData.name,
        shortDescription: formData.shortDescription,
        overview: formData.overview,
        isPublished: formData.isPublished,
        heroImage: {
          url: formData.heroImage?.url || "",
        },
      },
    });
  };

  const handleStartEdit = (country) => {
    setEditingCountry(country);
    setShowForm(false);
    resetEdit({
      name: country.name || "",
      shortDescription: country.shortDescription || "",
      overview: country.overview || "",
      isPublished: country.isPublished ?? true,
      heroImage: {
        url: country.heroImage?.url || country.heroImage || "",
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold text-navy-600">
          Destinations
        </h2>
        <button
          onClick={() => {
            setShowForm((s) => !s);
            setEditingCountry(null);
          }}
          className="flex items-center gap-2 rounded-lg bg-coral px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
        >
          <HiOutlinePlus /> Add Destination
        </button>
      </div>

      {/* CREATE FORM */}
      {showForm && (
        <form
          onSubmit={handleSubmitCreate(onSubmitCreate)}
          className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-navy-50 pb-2">
            <h3 className="text-sm font-bold text-navy-600">
              Add New Destination
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-navy-400 hover:text-navy-600"
            >
              <HiOutlineX size={18} />
            </button>
          </div>

          <input
            placeholder="Country name (e.g. Kazakhstan 🇰🇿)"
            className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-coral focus:outline-none"
            {...registerCreate("name", { required: true })}
          />

          {/* IMAGE URL OR UPLOAD TOGGLE */}
          <div className="space-y-2 rounded-xl border border-navy-50 bg-slate-50/50 p-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wide text-navy-600">
                Country Hero Card Image
              </label>
              <div className="flex gap-1 rounded-lg border border-navy-100 bg-white p-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setImageInputType("url")}
                  className={`rounded px-2 py-0.5 font-semibold transition-colors ${
                    imageInputType === "url"
                      ? "bg-coral text-white"
                      : "text-navy-400 hover:text-navy-600"
                  }`}
                >
                  Image URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputType("file")}
                  className={`rounded px-2 py-0.5 font-semibold transition-colors ${
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
                  placeholder="Paste image URL (e.g., https://images.unsplash.com/...)"
                  className="w-full rounded-lg border border-navy-100 bg-white pl-10 pr-3 py-2 text-sm focus:border-coral focus:outline-none"
                  {...registerCreate("heroImage.url")}
                />
              </div>
            ) : (
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
            )}

            {createHeroImageUrl && (
              <div className="relative h-28 w-full overflow-hidden rounded-lg border border-navy-50 bg-white">
                <img
                  src={createHeroImageUrl}
                  alt="Country Preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          <input
            placeholder="Short description (max 300 chars)"
            className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-coral focus:outline-none"
            {...registerCreate("shortDescription", { required: true })}
          />
          <textarea
            placeholder="Overview"
            rows={3}
            className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-coral focus:outline-none"
            {...registerCreate("overview", { required: true })}
          />

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-lg bg-coral px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {createMutation.isPending ? "Saving..." : "Save Destination"}
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
      {editingCountry && (
        <form
          onSubmit={handleSubmitEdit(onSubmitEdit)}
          className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-navy-50 pb-2">
            <h3 className="text-sm font-bold text-navy-600">
              Edit Destination:{" "}
              <span className="font-normal text-navy-400">
                {editingCountry.name}
              </span>
            </h3>
            <button
              type="button"
              onClick={() => setEditingCountry(null)}
              className="text-navy-400 hover:text-navy-600"
            >
              <HiOutlineX size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              placeholder="Country name"
              className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-coral focus:outline-none"
              {...registerEdit("name", { required: true })}
            />
            <select
              className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-coral focus:outline-none"
              {...registerEdit("isPublished")}
            >
              <option value={true}>Published</option>
              <option value={false}>Draft</option>
            </select>
          </div>

          {/* EDIT IMAGE SECTION */}
          <div className="space-y-2 rounded-xl border border-navy-50 bg-slate-50/50 p-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wide text-navy-600">
                Country Hero Card Image
              </label>
              <div className="flex gap-1 rounded-lg border border-navy-100 bg-white p-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setImageInputType("url")}
                  className={`rounded px-2 py-0.5 font-semibold transition-colors ${
                    imageInputType === "url"
                      ? "bg-coral text-white"
                      : "text-navy-400 hover:text-navy-600"
                  }`}
                >
                  Image URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputType("file")}
                  className={`rounded px-2 py-0.5 font-semibold transition-colors ${
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
                  placeholder="Paste image URL (e.g., https://images.unsplash.com/...)"
                  className="w-full rounded-lg border border-navy-100 bg-white pl-10 pr-3 py-2 text-sm focus:border-coral focus:outline-none"
                  {...registerEdit("heroImage.url")}
                />
              </div>
            ) : (
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
            )}

            {editHeroImageUrl && (
              <div className="relative h-28 w-full overflow-hidden rounded-lg border border-navy-50 bg-white">
                <img
                  src={editHeroImageUrl}
                  alt="Country Preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          <input
            placeholder="Short description"
            className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-coral focus:outline-none"
            {...registerEdit("shortDescription", { required: true })}
          />

          <textarea
            placeholder="Overview"
            rows={3}
            className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-coral focus:outline-none"
            {...registerEdit("overview", { required: true })}
          />

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="rounded-lg bg-coral px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {updateMutation.isPending ? "Updating..." : "Update Destination"}
            </button>
            <button
              type="button"
              onClick={() => setEditingCountry(null)}
              className="rounded-lg border border-navy-100 px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-navy-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* TABLE DISPLAY */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-navy-50 text-left text-xs uppercase text-navy-400">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Universities</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-50">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-navy-400">
                  Loading...
                </td>
              </tr>
            )}
            {!isLoading && countries.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-navy-400">
                  No destinations found.
                </td>
              </tr>
            )}
            {countries.map((c) => {
              const imageUrl = c.heroImage?.url || c.heroImage || c.coverImage;
              return (
                <tr
                  key={c._id}
                  className="transition-colors hover:bg-slate-50/50"
                >
                  <td className="px-4 py-3">
                    <div className="h-10 w-14 overflow-hidden rounded-lg border border-slate-100 bg-navy-50">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={c.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-navy-300">
                          <HiOutlinePhotograph size={16} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-navy-600">
                    {c.name}
                  </td>
                  <td className="px-4 py-3 text-navy-400">{c.slug}</td>
                  <td className="px-4 py-3">{c.universityCount || 0}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        c.isPublished
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-navy-50 text-navy-400"
                      }`}
                    >
                      {c.isPublished ? "Yes" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleStartEdit(c)}
                        className="rounded-md p-1.5 text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-600"
                        title="Edit Destination"
                      >
                        <HiOutlinePencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(c._id)}
                        className="rounded-md p-1.5 text-coral transition-colors hover:bg-coral-50 hover:text-coral-700"
                        title="Delete Destination"
                      >
                        <HiOutlineTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-heading text-base font-bold text-navy-600">
              Delete Destination?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Are you sure you want to delete this destination? This action
              cannot be undone.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-lg border border-navy-100 px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-navy-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirmId)}
                className="rounded-lg bg-coral px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCountriesPage;
