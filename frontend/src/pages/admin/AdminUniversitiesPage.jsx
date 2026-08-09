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

const AdminUniversitiesPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState(null);
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

  const createLogoUrl = watchCreate("logo.url");
  const editLogoUrl = watchEdit("logo.url");

  // Fetch Universities
  const { data: universities = [], isLoading } = useQuery({
    queryKey: ["admin-universities"],
    queryFn: async () => {
      const { data } = await api.get("/universities");
      return data.data.universities;
    },
  });

  // Fetch Countries
  const { data: countries = [] } = useQuery({
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
      setValue("logo.url", reader.result);
      toast.success("Logo selected!");
    };
    reader.readAsDataURL(file);
  };

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (payload) => api.post("/universities", payload),
    onSuccess: () => {
      toast.success("University created");
      queryClient.invalidateQueries({ queryKey: ["admin-universities"] });
      resetCreate();
      setShowForm(false);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to create university"),
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => api.put(`/universities/${id}`, payload),
    onSuccess: () => {
      toast.success("University updated");
      queryClient.invalidateQueries({ queryKey: ["admin-universities"] });
      setEditingUniversity(null);
      resetEdit();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to update university"),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/universities/${id}`),
    onSuccess: () => {
      toast.success("University deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-universities"] });
      setDeleteConfirmId(null);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Delete failed"),
  });

  const onSubmitCreate = (formData) => {
    createMutation.mutate({
      name: formData.name,
      country: formData.country,
      logo: { url: formData.logo?.url || "" },
      establishedYear: formData.establishedYear
        ? Number(formData.establishedYear)
        : undefined,
      durationYears: Number(formData.durationYears) || 6,
      mediumOfInstruction: formData.mediumOfInstruction || "English",
      nmcApproved: formData.nmcApproved === "true",
      whoRecognized: formData.whoRecognized === "true",
      hostelAvailable: formData.hostelAvailable === "true",
      isPartner: formData.isPartner === "true",
      isPublished: formData.isPublished === "true",
      fees: {
        tuitionPerYear: Number(formData.tuitionPerYear) || 0,
        hostelPerYear: Number(formData.hostelPerYear) || 0,
        messPerYear: Number(formData.messPerYear) || 0,
        oneTimeCosts: Number(formData.oneTimeCosts) || 0,
        currency: formData.feeCurrency || "USD",
      },
      description: formData.description || "",
      highlights: formData.highlights
        ? formData.highlights
            .split("\n")
            .map((h) => h.trim())
            .filter(Boolean)
        : [],
      metaTitle: formData.metaTitle || "",
      metaDescription: formData.metaDescription || "",
    });
  };

  const onSubmitEdit = (formData) => {
    updateMutation.mutate({
      id: editingUniversity._id,
      payload: {
        name: formData.name,
        country: formData.country,
        logo: { url: formData.logo?.url || "" },
        establishedYear: formData.establishedYear
          ? Number(formData.establishedYear)
          : undefined,
        durationYears: Number(formData.durationYears) || 6,
        mediumOfInstruction: formData.mediumOfInstruction || "English",
        nmcApproved: formData.nmcApproved === "true",
        whoRecognized: formData.whoRecognized === "true",
        hostelAvailable: formData.hostelAvailable === "true",
        isPartner: formData.isPartner === "true",
        isPublished: formData.isPublished === "true",
        fees: {
          tuitionPerYear: Number(formData.tuitionPerYear) || 0,
          hostelPerYear: Number(formData.hostelPerYear) || 0,
          messPerYear: Number(formData.messPerYear) || 0,
          oneTimeCosts: Number(formData.oneTimeCosts) || 0,
          currency: formData.feeCurrency || "USD",
        },
        description: formData.description || "",
        highlights: formData.highlights
          ? formData.highlights
              .split("\n")
              .map((h) => h.trim())
              .filter(Boolean)
          : [],
        metaTitle: formData.metaTitle || "",
        metaDescription: formData.metaDescription || "",
      },
    });
  };

  const handleStartEdit = (uni) => {
    setEditingUniversity(uni);
    setShowForm(false);

    resetEdit({
      name: uni.name || "",
      country: uni.country?._id || uni.country || "",
      logo: { url: uni.logo?.url || "" },
      establishedYear: uni.establishedYear || "",
      durationYears: uni.durationYears ?? 6,
      mediumOfInstruction: uni.mediumOfInstruction || "English",
      nmcApproved: String(uni.nmcApproved ?? true),
      whoRecognized: String(uni.whoRecognized ?? true),
      hostelAvailable: String(uni.hostelAvailable ?? true),
      isPartner: String(uni.isPartner ?? true),
      isPublished: String(uni.isPublished ?? true),
      tuitionPerYear: uni.fees?.tuitionPerYear ?? 0,
      hostelPerYear: uni.fees?.hostelPerYear ?? 0,
      messPerYear: uni.fees?.messPerYear ?? 0,
      oneTimeCosts: uni.fees?.oneTimeCosts ?? 0,
      feeCurrency: uni.fees?.currency || "USD",
      description: uni.description || "",
      highlights: (uni.highlights || []).join("\n"),
      metaTitle: uni.metaTitle || "",
      metaDescription: uni.metaDescription || "",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold text-navy-600">
          Universities
        </h2>
        <button
          onClick={() => {
            setShowForm((s) => !s);
            setEditingUniversity(null);
          }}
          className="flex items-center gap-2 rounded-lg bg-coral px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
        >
          <HiOutlinePlus /> Add University
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
              Add New University
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-navy-400 hover:text-navy-600"
            >
              <HiOutlineX size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              placeholder="University name"
              className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-coral focus:outline-none"
              {...registerCreate("name", { required: true })}
            />
            <select
              className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-coral focus:outline-none"
              {...registerCreate("country", { required: true })}
            >
              <option value="">Select country</option>
              {countries.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* LOGO UPLOAD OR URL */}
          <div className="space-y-2 rounded-xl border border-navy-50 bg-slate-50/50 p-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wide text-navy-600">
                University Logo
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
                  placeholder="Paste logo URL (e.g., https://...)"
                  className="w-full rounded-lg border border-navy-100 bg-white pl-10 pr-3 py-2 text-sm focus:border-coral focus:outline-none"
                  {...registerCreate("logo.url")}
                />
              </div>
            ) : (
              <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-navy-200 bg-white p-3 text-xs font-semibold text-navy-500 hover:border-coral">
                <HiOutlineUpload size={18} className="text-coral" />
                <span>Choose logo file (PNG, JPG, WEBP)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, setValueCreate)}
                />
              </label>
            )}

            {createLogoUrl && (
              <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-navy-50 bg-white p-2">
                <img
                  src={createLogoUrl}
                  alt="Logo Preview"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* ACADEMIC INFO */}
          <div className="space-y-3 rounded-xl border border-navy-50 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-navy-600">
              Academic Details
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                type="number"
                placeholder="Established Year (e.g. 1950)"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerCreate("establishedYear")}
              />
              <input
                type="number"
                placeholder="Duration Years"
                defaultValue={6}
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerCreate("durationYears")}
              />
              <input
                placeholder="Medium of Instruction"
                defaultValue="English"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerCreate("mediumOfInstruction")}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <select
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerCreate("nmcApproved")}
                defaultValue="true"
              >
                <option value="true">NMC Approved</option>
                <option value="false">Not NMC Approved</option>
              </select>

              <select
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerCreate("whoRecognized")}
                defaultValue="true"
              >
                <option value="true">WHO Recognized</option>
                <option value="false">Not WHO Recognized</option>
              </select>

              <select
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerCreate("hostelAvailable")}
                defaultValue="true"
              >
                <option value="true">Hostel Available</option>
                <option value="false">No Hostel</option>
              </select>

              <select
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerCreate("isPartner")}
                defaultValue="true"
              >
                <option value="true">Partner University</option>
                <option value="false">Standard Listing</option>
              </select>

              <select
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerCreate("isPublished")}
                defaultValue="true"
              >
                <option value="true">Published</option>
                <option value="false">Draft</option>
              </select>
            </div>
          </div>

          {/* FEE STRUCTURE */}
          <div className="space-y-3 rounded-xl border border-navy-50 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-navy-600">
              Fee Structure
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="number"
                min="0"
                placeholder="Tuition Fee / Year"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerCreate("tuitionPerYear", { required: true })}
              />
              <input
                type="number"
                min="0"
                placeholder="Hostel Fee / Year"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerCreate("hostelPerYear")}
              />
              <input
                type="number"
                min="0"
                placeholder="Mess Fee / Year"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerCreate("messPerYear")}
              />
              <input
                type="number"
                min="0"
                placeholder="One-Time Costs"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerCreate("oneTimeCosts")}
              />
              <input
                placeholder="Currency (e.g. USD)"
                defaultValue="USD"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none sm:col-span-2"
                {...registerCreate("feeCurrency")}
              />
            </div>
          </div>

          {/* DESCRIPTION & HIGHLIGHTS */}
          <div className="space-y-3 rounded-xl border border-navy-50 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-navy-600">
              Content & SEO
            </h4>
            <textarea
              placeholder="University Description"
              rows={3}
              className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
              {...registerCreate("description")}
            />
            <textarea
              placeholder="Highlights (Enter one per line)"
              rows={3}
              className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
              {...registerCreate("highlights")}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                placeholder="Meta Title"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerCreate("metaTitle")}
              />
              <input
                placeholder="Meta Description"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerCreate("metaDescription")}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-lg bg-coral px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {createMutation.isPending ? "Saving..." : "Save University"}
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
      {editingUniversity && (
        <form
          onSubmit={handleSubmitEdit(onSubmitEdit)}
          className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-navy-50 pb-2">
            <h3 className="text-sm font-bold text-navy-600">
              Edit University:{" "}
              <span className="font-normal text-navy-400">
                {editingUniversity.name}
              </span>
            </h3>
            <button
              type="button"
              onClick={() => setEditingUniversity(null)}
              className="text-navy-400 hover:text-navy-600"
            >
              <HiOutlineX size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              placeholder="University name"
              className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-coral focus:outline-none"
              {...registerEdit("name", { required: true })}
            />
            <select
              className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-coral focus:outline-none"
              {...registerEdit("country", { required: true })}
            >
              <option value="">Select country</option>
              {countries.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* LOGO EDIT */}
          <div className="space-y-2 rounded-xl border border-navy-50 bg-slate-50/50 p-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wide text-navy-600">
                University Logo
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
                  placeholder="Paste logo URL"
                  className="w-full rounded-lg border border-navy-100 bg-white pl-10 pr-3 py-2 text-sm focus:border-coral focus:outline-none"
                  {...registerEdit("logo.url")}
                />
              </div>
            ) : (
              <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-navy-200 bg-white p-3 text-xs font-semibold text-navy-500 hover:border-coral">
                <HiOutlineUpload size={18} className="text-coral" />
                <span>Choose logo file (PNG, JPG, WEBP)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, setValueEdit)}
                />
              </label>
            )}

            {editLogoUrl && (
              <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-navy-50 bg-white p-2">
                <img
                  src={editLogoUrl}
                  alt="Logo Preview"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* ACADEMIC INFO EDIT */}
          <div className="space-y-3 rounded-xl border border-navy-50 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-navy-600">
              Academic Details
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                type="number"
                placeholder="Established Year"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerEdit("establishedYear")}
              />
              <input
                type="number"
                placeholder="Duration Years"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerEdit("durationYears")}
              />
              <input
                placeholder="Medium of Instruction"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerEdit("mediumOfInstruction")}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <select
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerEdit("nmcApproved")}
              >
                <option value="true">NMC Approved</option>
                <option value="false">Not NMC Approved</option>
              </select>

              <select
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerEdit("whoRecognized")}
              >
                <option value="true">WHO Recognized</option>
                <option value="false">Not WHO Recognized</option>
              </select>

              <select
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerEdit("hostelAvailable")}
              >
                <option value="true">Hostel Available</option>
                <option value="false">No Hostel</option>
              </select>

              <select
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerEdit("isPartner")}
              >
                <option value="true">Partner University</option>
                <option value="false">Standard Listing</option>
              </select>

              <select
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerEdit("isPublished")}
              >
                <option value="true">Published</option>
                <option value="false">Draft</option>
              </select>
            </div>
          </div>

          {/* FEE STRUCTURE EDIT */}
          <div className="space-y-3 rounded-xl border border-navy-50 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-navy-600">
              Fee Structure
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="number"
                min="0"
                placeholder="Tuition Fee / Year"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerEdit("tuitionPerYear", { required: true })}
              />
              <input
                type="number"
                min="0"
                placeholder="Hostel Fee / Year"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerEdit("hostelPerYear")}
              />
              <input
                type="number"
                min="0"
                placeholder="Mess Fee / Year"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerEdit("messPerYear")}
              />
              <input
                type="number"
                min="0"
                placeholder="One-Time Costs"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerEdit("oneTimeCosts")}
              />
              <input
                placeholder="Currency (e.g. USD)"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none sm:col-span-2"
                {...registerEdit("feeCurrency")}
              />
            </div>
          </div>

          {/* CONTENT EDIT */}
          <div className="space-y-3 rounded-xl border border-navy-50 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-navy-600">
              Content & SEO
            </h4>
            <textarea
              placeholder="University Description"
              rows={3}
              className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
              {...registerEdit("description")}
            />
            <textarea
              placeholder="Highlights (Enter one per line)"
              rows={3}
              className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
              {...registerEdit("highlights")}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                placeholder="Meta Title"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerEdit("metaTitle")}
              />
              <input
                placeholder="Meta Description"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerEdit("metaDescription")}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="rounded-lg bg-coral px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {updateMutation.isPending ? "Updating..." : "Update University"}
            </button>
            <button
              type="button"
              onClick={() => setEditingUniversity(null)}
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
              <th className="px-4 py-3">Logo</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Tuition / yr</th>
              <th className="px-4 py-3">Approvals</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-50">
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-navy-400">
                  Loading...
                </td>
              </tr>
            )}
            {!isLoading && universities.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-navy-400">
                  No universities found.
                </td>
              </tr>
            )}
            {universities.map((u) => {
              const logoUrl = u.logo?.url;
              return (
                <tr
                  key={u._id}
                  className="transition-colors hover:bg-slate-50/50"
                >
                  <td className="px-4 py-3">
                    <div className="h-10 w-10 overflow-hidden rounded-lg border border-slate-100 bg-navy-50 p-1">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={u.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-navy-300">
                          <HiOutlinePhotograph size={16} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-navy-600">
                    {u.name}
                  </td>
                  <td className="px-4 py-3 text-navy-500">
                    {u.country?.name || "Unassigned"}
                  </td>
                  <td className="px-4 py-3 font-bold text-coral">
                    {u.fees?.currency || "USD"}{" "}
                    {(u.fees?.tuitionPerYear || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 text-[10px]">
                      <span
                        className={`rounded px-1.5 py-0.5 font-semibold ${
                          u.nmcApproved
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {u.nmcApproved ? "NMC" : "Non-NMC"}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 font-semibold ${
                          u.whoRecognized
                            ? "bg-sky-50 text-sky-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {u.whoRecognized ? "WHO" : "Non-WHO"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        u.isPublished
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-navy-50 text-navy-400"
                      }`}
                    >
                      {u.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleStartEdit(u)}
                        className="rounded-md p-1.5 text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-600"
                        title="Edit University"
                      >
                        <HiOutlinePencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(u._id)}
                        className="rounded-md p-1.5 text-coral transition-colors hover:bg-coral-50 hover:text-coral-700"
                        title="Delete University"
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
              Delete University?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Are you sure you want to delete this university? This action
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

export default AdminUniversitiesPage;
