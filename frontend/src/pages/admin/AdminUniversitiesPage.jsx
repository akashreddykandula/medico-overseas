import React, { useState, useRef } from "react";
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

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB client-side limit
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// ------------------------------------------------------------
// SECURITY HELPER
// ------------------------------------------------------------
const isSafeImageUrl = (value) => {
  if (!value || typeof value !== "string") return true;

  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const AdminUniversitiesPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [imageInputType, setImageInputType] = useState("url");

  const [createLogoFile, setCreateLogoFile] = useState(null);
  const [editLogoFile, setEditLogoFile] = useState(null);

  const [createLogoPreview, setCreateLogoPreview] = useState("");
  const [editLogoPreview, setEditLogoPreview] = useState("");

  // Ref to scroll up when editing
  const topRef = useRef(null);

  const queryClient = useQueryClient();

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    watch: watchCreate,
  } = useForm();

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    watch: watchEdit,
  } = useForm();

  const createLogoUrl = watchCreate("logo.url");
  const editLogoUrl = watchEdit("logo.url");

  // ------------------------------------------------------------
  // FETCH UNIVERSITIES & COUNTRIES
  // ------------------------------------------------------------
  const { data: universities = [], isLoading } = useQuery({
    queryKey: ["admin-universities"],
    queryFn: async () => {
      const { data } = await api.get("/universities");
      return data.data.universities;
    },
  });

  const { data: countries = [] } = useQuery({
    queryKey: ["admin-countries"],
    queryFn: async () => {
      const { data } = await api.get("/countries");
      return data.data.countries;
    },
  });

  // ------------------------------------------------------------
  // FILE VALIDATION / PREVIEW
  // ------------------------------------------------------------
  const handleFileUpload = (event, mode) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Only JPG, PNG, and WEBP images are allowed.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image size should be less than 5MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    if (mode === "create") {
      if (createLogoPreview) URL.revokeObjectURL(createLogoPreview);
      setCreateLogoFile(file);
      setCreateLogoPreview(previewUrl);
    } else {
      if (editLogoPreview) URL.revokeObjectURL(editLogoPreview);
      setEditLogoFile(file);
      setEditLogoPreview(previewUrl);
    }

    toast.success("Logo selected.");
  };

  // ------------------------------------------------------------
  // MUTATIONS
  // ------------------------------------------------------------
  const createMutation = useMutation({
    mutationFn: (payload) => {
      if (payload instanceof FormData) {
        return api.post("/universities", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      return api.post("/universities", payload);
    },
    onSuccess: () => {
      toast.success("University created");
      queryClient.invalidateQueries({ queryKey: ["admin-universities"] });
      resetCreate();
      setCreateLogoFile(null);
      if (createLogoPreview) URL.revokeObjectURL(createLogoPreview);
      setCreateLogoPreview("");
      setShowForm(false);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to create university"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => {
      if (payload instanceof FormData) {
        return api.put(`/universities/${id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      return api.put(`/universities/${id}`, payload);
    },
    onSuccess: () => {
      toast.success("University updated");
      queryClient.invalidateQueries({ queryKey: ["admin-universities"] });
      setEditingUniversity(null);
      resetEdit();
      setEditLogoFile(null);
      if (editLogoPreview) URL.revokeObjectURL(editLogoPreview);
      setEditLogoPreview("");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to update university"),
  });

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

  const getSafeLogoUrl = (value) => {
    if (!value || typeof value !== "string") return "";
    return isSafeImageUrl(value.trim()) ? value.trim() : "";
  };

  // ------------------------------------------------------------
  // CREATE SUBMIT
  // ------------------------------------------------------------
  const onSubmitCreate = (formData) => {
    const logoUrl = getSafeLogoUrl(formData.logo?.url);

    if (imageInputType === "url" && formData.logo?.url && !logoUrl) {
      toast.error("Please provide a valid HTTP/HTTPS image URL.");
      return;
    }

    if (imageInputType === "file" && createLogoFile) {
      const data = new FormData();
      data.append(
        "name",
        typeof formData.name === "string" ? formData.name.trim() : "",
      );
      data.append("country", formData.country);
      data.append("logo", createLogoFile);
      if (formData.establishedYear) {
        data.append(
          "establishedYear",
          String(Number(formData.establishedYear)),
        );
      }
      data.append("durationYears", String(Number(formData.durationYears) || 6));
      data.append(
        "mediumOfInstruction",
        typeof formData.mediumOfInstruction === "string"
          ? formData.mediumOfInstruction.trim()
          : "English",
      );
      data.append("nmcApproved", String(formData.nmcApproved === "true"));
      data.append("whoRecognized", String(formData.whoRecognized === "true"));
      data.append(
        "hostelAvailable",
        String(formData.hostelAvailable === "true"),
      );
      data.append("isPartner", String(formData.isPartner === "true"));
      data.append("isPublished", String(formData.isPublished === "true"));
      data.append(
        "fees",
        JSON.stringify({
          tuitionPerYear: Number(formData.tuitionPerYear) || 0,
          hostelPerYear: Number(formData.hostelPerYear) || 0,
          messPerYear: Number(formData.messPerYear) || 0,
          oneTimeCosts: Number(formData.oneTimeCosts) || 0,
          currency:
            typeof formData.feeCurrency === "string"
              ? formData.feeCurrency.trim().toUpperCase()
              : "USD",
        }),
      );
      data.append(
        "description",
        typeof formData.description === "string"
          ? formData.description.trim()
          : "",
      );
      data.append(
        "highlights",
        JSON.stringify(
          formData.highlights
            ? formData.highlights
                .split("\n")
                .map((h) => h.trim())
                .filter(Boolean)
            : [],
        ),
      );
      data.append(
        "metaTitle",
        typeof formData.metaTitle === "string" ? formData.metaTitle.trim() : "",
      );
      data.append(
        "metaDescription",
        typeof formData.metaDescription === "string"
          ? formData.metaDescription.trim()
          : "",
      );

      createMutation.mutate(data);
      return;
    }

    createMutation.mutate({
      name: typeof formData.name === "string" ? formData.name.trim() : "",
      country: formData.country,
      logo: { url: logoUrl },
      establishedYear: formData.establishedYear
        ? Number(formData.establishedYear)
        : undefined,
      durationYears: Number(formData.durationYears) || 6,
      mediumOfInstruction:
        typeof formData.mediumOfInstruction === "string"
          ? formData.mediumOfInstruction.trim()
          : "English",
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
        currency:
          typeof formData.feeCurrency === "string"
            ? formData.feeCurrency.trim().toUpperCase()
            : "USD",
      },
      description:
        typeof formData.description === "string"
          ? formData.description.trim()
          : "",
      highlights: formData.highlights
        ? formData.highlights
            .split("\n")
            .map((h) => h.trim())
            .filter(Boolean)
        : [],
      metaTitle:
        typeof formData.metaTitle === "string" ? formData.metaTitle.trim() : "",
      metaDescription:
        typeof formData.metaDescription === "string"
          ? formData.metaDescription.trim()
          : "",
    });
  };

  // ------------------------------------------------------------
  // EDIT SUBMIT (FIXED)
  // ------------------------------------------------------------
  const onSubmitEdit = (formData) => {
    if (!editingUniversity?._id) {
      toast.error("Invalid university.");
      return;
    }

    const logoUrl = getSafeLogoUrl(formData.logo?.url);

    if (imageInputType === "url" && formData.logo?.url && !logoUrl) {
      toast.error("Please provide a valid HTTP/HTTPS image URL.");
      return;
    }

    // 1. File Upload Mode - Send Multipart FormData
    if (imageInputType === "file" && editLogoFile) {
      const data = new FormData();
      data.append(
        "name",
        typeof formData.name === "string" ? formData.name.trim() : "",
      );
      data.append("country", formData.country);
      data.append("logo", editLogoFile);
      if (formData.establishedYear) {
        data.append(
          "establishedYear",
          String(Number(formData.establishedYear)),
        );
      }
      data.append("durationYears", String(Number(formData.durationYears) || 6));
      data.append(
        "mediumOfInstruction",
        typeof formData.mediumOfInstruction === "string"
          ? formData.mediumOfInstruction.trim()
          : "English",
      );
      data.append("nmcApproved", String(formData.nmcApproved === "true"));
      data.append("whoRecognized", String(formData.whoRecognized === "true"));
      data.append(
        "hostelAvailable",
        String(formData.hostelAvailable === "true"),
      );
      data.append("isPartner", String(formData.isPartner === "true"));
      data.append("isPublished", String(formData.isPublished === "true"));
      data.append(
        "fees",
        JSON.stringify({
          tuitionPerYear: Number(formData.tuitionPerYear) || 0,
          hostelPerYear: Number(formData.hostelPerYear) || 0,
          messPerYear: Number(formData.messPerYear) || 0,
          oneTimeCosts: Number(formData.oneTimeCosts) || 0,
          currency:
            typeof formData.feeCurrency === "string"
              ? formData.feeCurrency.trim().toUpperCase()
              : "USD",
        }),
      );
      data.append(
        "description",
        typeof formData.description === "string"
          ? formData.description.trim()
          : "",
      );
      data.append(
        "highlights",
        JSON.stringify(
          formData.highlights
            ? formData.highlights
                .split("\n")
                .map((h) => h.trim())
                .filter(Boolean)
            : [],
        ),
      );
      data.append(
        "metaTitle",
        typeof formData.metaTitle === "string" ? formData.metaTitle.trim() : "",
      );
      data.append(
        "metaDescription",
        typeof formData.metaDescription === "string"
          ? formData.metaDescription.trim()
          : "",
      );

      updateMutation.mutate({
        id: editingUniversity._id,
        payload: data,
      });
      return;
    }

    // 2. URL Mode - Send JSON Payload
    updateMutation.mutate({
      id: editingUniversity._id,
      payload: {
        name: typeof formData.name === "string" ? formData.name.trim() : "",
        country: formData.country,
        logo: { url: logoUrl },
        establishedYear: formData.establishedYear
          ? Number(formData.establishedYear)
          : undefined,
        durationYears: Number(formData.durationYears) || 6,
        mediumOfInstruction:
          typeof formData.mediumOfInstruction === "string"
            ? formData.mediumOfInstruction.trim()
            : "English",
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
          currency:
            typeof formData.feeCurrency === "string"
              ? formData.feeCurrency.trim().toUpperCase()
              : "USD",
        },
        description:
          typeof formData.description === "string"
            ? formData.description.trim()
            : "",
        highlights: formData.highlights
          ? formData.highlights
              .split("\n")
              .map((h) => h.trim())
              .filter(Boolean)
          : [],
        metaTitle:
          typeof formData.metaTitle === "string"
            ? formData.metaTitle.trim()
            : "",
        metaDescription:
          typeof formData.metaDescription === "string"
            ? formData.metaDescription.trim()
            : "",
      },
    });
  };

  // ------------------------------------------------------------
  // START EDIT & FORM CLOSING
  // ------------------------------------------------------------
  const handleStartEdit = (uni) => {
    setEditingUniversity(uni);
    setShowForm(false);
    setEditLogoFile(null);

    if (editLogoPreview) URL.revokeObjectURL(editLogoPreview);
    setEditLogoPreview("");

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

    // Smooth scroll upwards to the top form container
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const closeCreateForm = () => {
    resetCreate();
    setCreateLogoFile(null);
    if (createLogoPreview) URL.revokeObjectURL(createLogoPreview);
    setCreateLogoPreview("");
    setShowForm(false);
  };

  const closeEditForm = () => {
    resetEdit();
    setEditLogoFile(null);
    if (editLogoPreview) URL.revokeObjectURL(editLogoPreview);
    setEditLogoPreview("");
    setEditingUniversity(null);
  };

  return (
    <div className="space-y-4" ref={topRef}>
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold text-navy-600">
          Universities
        </h2>
        <button
          type="button"
          onClick={() => {
            setShowForm((s) => !s);
            setEditingUniversity(null);
          }}
          className="flex items-center gap-2 rounded-lg bg-coral px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
        >
          <HiOutlinePlus />
          Add University
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
              onClick={closeCreateForm}
              className="text-navy-400 hover:text-navy-600"
            >
              <HiOutlineX size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              placeholder="University name"
              maxLength={200}
              autoComplete="off"
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

          {/* LOGO INPUT */}
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
                  maxLength={2048}
                  placeholder="Paste logo URL (https://...)"
                  className="w-full rounded-lg border border-navy-100 bg-white py-2 pl-10 pr-3 text-sm focus:border-coral focus:outline-none"
                  {...registerCreate("logo.url")}
                />
              </div>
            ) : (
              <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-navy-200 bg-white p-3 text-xs font-semibold text-navy-500 hover:border-coral">
                <HiOutlineUpload size={18} className="text-coral" />
                <span>Choose logo file (PNG, JPG, WEBP — max 5MB)</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "create")}
                />
              </label>
            )}

            {(createLogoUrl || createLogoPreview) && (
              <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-navy-50 bg-white p-2">
                <img
                  src={createLogoPreview || createLogoUrl}
                  alt="University logo preview"
                  className="h-full w-full object-contain"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* ACADEMIC DETAILS */}
          <div className="space-y-3 rounded-xl border border-navy-50 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-navy-600">
              Academic Details
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                type="number"
                min="0"
                max="3000"
                placeholder="Established Year"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerCreate("establishedYear")}
              />
              <input
                type="number"
                min="1"
                max="20"
                placeholder="Duration Years"
                defaultValue={6}
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerCreate("durationYears")}
              />
              <input
                placeholder="Medium of Instruction"
                maxLength={100}
                defaultValue="English"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerCreate("mediumOfInstruction")}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                ["nmcApproved", "NMC Approved", "Not NMC Approved"],
                ["whoRecognized", "WHO Recognized", "Not WHO Recognized"],
                ["hostelAvailable", "Hostel Available", "No Hostel"],
                ["isPartner", "Partner University", "Standard Listing"],
                ["isPublished", "Published", "Draft"],
              ].map(([field, trueLabel, falseLabel]) => (
                <select
                  key={field}
                  className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                  {...registerCreate(field)}
                  defaultValue="true"
                >
                  <option value="true">{trueLabel}</option>
                  <option value="false">{falseLabel}</option>
                </select>
              ))}
            </div>
          </div>

          {/* FEE STRUCTURE */}
          <div className="space-y-3 rounded-xl border border-navy-50 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-navy-600">
              Fee Structure
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                ["tuitionPerYear", "Tuition Fee / Year"],
                ["hostelPerYear", "Hostel Fee / Year"],
                ["messPerYear", "Mess Fee / Year"],
                ["oneTimeCosts", "One-Time Costs"],
              ].map(([field, placeholder]) => (
                <input
                  key={field}
                  type="number"
                  min="0"
                  max="1000000000"
                  placeholder={placeholder}
                  className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                  {...registerCreate(field)}
                />
              ))}
              <input
                placeholder="Currency (e.g. USD)"
                maxLength={10}
                defaultValue="USD"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none sm:col-span-2"
                {...registerCreate("feeCurrency")}
              />
            </div>
          </div>

          {/* CONTENT & SEO */}
          <div className="space-y-3 rounded-xl border border-navy-50 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-navy-600">
              Content & SEO
            </h4>
            <textarea
              placeholder="University Description"
              rows={3}
              maxLength={20000}
              className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
              {...registerCreate("description")}
            />
            <textarea
              placeholder="Highlights (Enter one per line)"
              rows={3}
              maxLength={10000}
              className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
              {...registerCreate("highlights")}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                placeholder="Meta Title"
                maxLength={160}
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerCreate("metaTitle")}
              />
              <input
                placeholder="Meta Description"
                maxLength={320}
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
              onClick={closeCreateForm}
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
              onClick={closeEditForm}
              className="text-navy-400 hover:text-navy-600"
            >
              <HiOutlineX size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              placeholder="University name"
              maxLength={200}
              autoComplete="off"
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

          {/* EDIT LOGO */}
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
                  maxLength={2048}
                  placeholder="Paste logo URL"
                  className="w-full rounded-lg border border-navy-100 bg-white py-2 pl-10 pr-3 text-sm focus:border-coral focus:outline-none"
                  {...registerEdit("logo.url")}
                />
              </div>
            ) : (
              <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-navy-200 bg-white p-3 text-xs font-semibold text-navy-500 hover:border-coral">
                <HiOutlineUpload size={18} className="text-coral" />
                <span>Choose logo file (PNG, JPG, WEBP — max 5MB)</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "edit")}
                />
              </label>
            )}

            {(editLogoUrl || editLogoPreview) && (
              <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-navy-50 bg-white p-2">
                <img
                  src={editLogoPreview || editLogoUrl}
                  alt="University logo preview"
                  className="h-full w-full object-contain"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* EDIT ACADEMIC DETAILS */}
          <div className="space-y-3 rounded-xl border border-navy-50 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-navy-600">
              Academic Details
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                type="number"
                min="0"
                max="3000"
                placeholder="Established Year"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerEdit("establishedYear")}
              />
              <input
                type="number"
                min="1"
                max="20"
                placeholder="Duration Years"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerEdit("durationYears")}
              />
              <input
                placeholder="Medium of Instruction"
                maxLength={100}
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerEdit("mediumOfInstruction")}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                ["nmcApproved", "NMC Approved", "Not NMC Approved"],
                ["whoRecognized", "WHO Recognized", "Not WHO Recognized"],
                ["hostelAvailable", "Hostel Available", "No Hostel"],
                ["isPartner", "Partner University", "Standard Listing"],
                ["isPublished", "Published", "Draft"],
              ].map(([field, trueLabel, falseLabel]) => (
                <select
                  key={field}
                  className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                  {...registerEdit(field)}
                >
                  <option value="true">{trueLabel}</option>
                  <option value="false">{falseLabel}</option>
                </select>
              ))}
            </div>
          </div>

          {/* EDIT FEE STRUCTURE */}
          <div className="space-y-3 rounded-xl border border-navy-50 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-navy-600">
              Fee Structure
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                ["tuitionPerYear", "Tuition Fee / Year"],
                ["hostelPerYear", "Hostel Fee / Year"],
                ["messPerYear", "Mess Fee / Year"],
                ["oneTimeCosts", "One-Time Costs"],
              ].map(([field, placeholder]) => (
                <input
                  key={field}
                  type="number"
                  min="0"
                  max="1000000000"
                  placeholder={placeholder}
                  className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                  {...registerEdit(field)}
                />
              ))}
              <input
                placeholder="Currency (e.g. USD)"
                maxLength={10}
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none sm:col-span-2"
                {...registerEdit("feeCurrency")}
              />
            </div>
          </div>

          {/* EDIT CONTENT & SEO */}
          <div className="space-y-3 rounded-xl border border-navy-50 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-navy-600">
              Content & SEO
            </h4>
            <textarea
              placeholder="University Description"
              rows={3}
              maxLength={20000}
              className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
              {...registerEdit("description")}
            />
            <textarea
              placeholder="Highlights (Enter one per line)"
              rows={3}
              maxLength={10000}
              className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
              {...registerEdit("highlights")}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                placeholder="Meta Title"
                maxLength={160}
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerEdit("metaTitle")}
              />
              <input
                placeholder="Meta Description"
                maxLength={320}
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
              onClick={closeEditForm}
              className="rounded-lg border border-navy-100 px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-navy-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* UNIVERSITIES TABLE */}
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
              <>
                {[1, 2, 3, 4, 5].map((item) => (
                  <tr
                    key={item}
                    className="animate-pulse border-b border-navy-50"
                  >
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
                      <div className="h-5 w-20 rounded-full bg-navy-50" />
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
            {!isLoading && universities.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-navy-400">
                  No universities found.
                </td>
              </tr>
            )}

            {universities.map((u) => {
              const logoUrl = isSafeImageUrl(u.logo?.url) ? u.logo?.url : "";

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
                          alt={`${u.name} logo`}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
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
                        type="button"
                        onClick={() => handleStartEdit(u)}
                        className="rounded-md p-1.5 text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-600"
                        title="Edit University"
                      >
                        <HiOutlinePencil size={16} />
                      </button>
                      <button
                        type="button"
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
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-lg border border-navy-100 px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-navy-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteConfirmId)}
                className="rounded-lg bg-coral px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUniversitiesPage;
