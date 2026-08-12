import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineX,
  HiOutlineCheckCircle,
  HiOutlinePhotograph,
  HiOutlineUpload,
  HiOutlineExclamation,
} from "react-icons/hi";
import api from "../../lib/api";

const AdminTestimonialsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [deletingTestimonial, setDeletingTestimonial] = useState(null);
  const [imageInputType, setImageInputType] = useState("url");
  const [isUploading, setIsUploading] = useState(false);

  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      studentName: "",
      quote: "",
      videoUrl: "",
      rating: 5,
      country: "",
      university: "",
      displayOrder: 0,
      isPublished: true,
      isFeaturedOnHomepage: false,
      photo: {
        url: "",
      },
    },
  });

  const photoUrl = watch("photo.url");
  const selectedCountry = watch("country");

  // ------------------------------------------------------------
  // FETCH TESTIMONIALS
  // ------------------------------------------------------------

  const { data, isLoading } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => {
      const { data } = await api.get("/testimonials", {
        params: {
          limit: 100,
        },
      });
      return data.data.items;
    },
  });

  // ------------------------------------------------------------
  // FETCH COUNTRIES & UNIVERSITIES FOR DROPDOWNS
  // ------------------------------------------------------------

  const { data: countriesData, isLoading: isLoadingCountries } = useQuery({
    queryKey: ["admin-countries"],
    queryFn: async () => {
      const response = await api.get("/countries");
      return response.data?.data?.countries || [];
    },
  });

  const countries = countriesData || [];

  const selectedCountryObject = countries.find(
    (country) => country._id === selectedCountry,
  );

  const selectedCountrySlug = selectedCountryObject?.slug || "";

  // Reset university when country selection changes manually
  useEffect(() => {
    if (!editingTestimonial) {
      setValue("university", "");
    }
  }, [selectedCountry, setValue, editingTestimonial]);

  const { data: universitiesData, isLoading: isLoadingUniversities } = useQuery(
    {
      queryKey: ["admin-universities", selectedCountrySlug],
      enabled: !!selectedCountrySlug,
      queryFn: async () => {
        const { data } = await api.get("/universities", {
          params: {
            country: selectedCountrySlug,
          },
        });

        return Array.isArray(data?.data?.universities)
          ? data.data.universities
          : [];
      },
    },
  );

  const universities = universitiesData || [];

  // ------------------------------------------------------------
  // CREATE
  // ------------------------------------------------------------

  const createMutation = useMutation({
    mutationFn: (payload) => api.post("/testimonials", payload),
    onSuccess: () => {
      toast.success("Testimonial created successfully");

      queryClient.invalidateQueries({
        queryKey: ["admin-testimonials"],
      });

      queryClient.invalidateQueries({
        queryKey: ["testimonials"],
      });

      handleCancel();
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || "Failed to create testimonial",
      );
    },
  });

  // ------------------------------------------------------------
  // UPDATE
  // ------------------------------------------------------------

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => api.put(`/testimonials/${id}`, payload),
    onSuccess: () => {
      toast.success("Testimonial updated successfully");

      queryClient.invalidateQueries({
        queryKey: ["admin-testimonials"],
      });

      queryClient.invalidateQueries({
        queryKey: ["testimonials"],
      });

      handleCancel();
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || "Failed to update testimonial",
      );
    },
  });

  // ------------------------------------------------------------
  // DELETE
  // ------------------------------------------------------------

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/testimonials/${id}`),
    onSuccess: () => {
      toast.success("Testimonial deleted");

      queryClient.invalidateQueries({
        queryKey: ["admin-testimonials"],
      });

      queryClient.invalidateQueries({
        queryKey: ["testimonials"],
      });

      setDeletingTestimonial(null);
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || "Failed to delete testimonial",
      );
    },
  });

  // ------------------------------------------------------------
  // FILE UPLOAD
  // ------------------------------------------------------------

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();

      formData.append("file", file);

      const { data } = await api.post(
        "/uploads/image?folder=medico-overseas/testimonials",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      console.log("UPLOAD RESPONSE:", data);
      console.log("UPLOADED URL:", data?.data?.url);
      const uploadedUrl = data?.data?.url;

      if (!uploadedUrl) {
        throw new Error("Upload response did not contain an image URL");
      }

      reset({
        ...watch(),
        photo: {
          url: uploadedUrl,
        },
      });

      toast.success("Photo uploaded successfully");
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Photo upload failed");
    } finally {
      setIsUploading(false);
      event.target.value = ""; // Reset input value
    }
  };

  // ------------------------------------------------------------
  // START EDIT
  // ------------------------------------------------------------

  const handleStartEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    setShowForm(false);

    reset({
      studentName: testimonial.studentName || "",
      quote: testimonial.quote || "",
      videoUrl: testimonial.videoUrl || "",
      rating: testimonial.rating ?? 5,
      country: testimonial.country?._id || testimonial.country || "",
      university: testimonial.university?._id || testimonial.university || "",
      displayOrder: testimonial.displayOrder ?? 0,
      isPublished: testimonial.isPublished ?? true,
      isFeaturedOnHomepage: testimonial.isFeaturedOnHomepage ?? false,
      photo: {
        url: testimonial.photo?.url || "",
      },
    });
  };

  // ------------------------------------------------------------
  // CANCEL
  // ------------------------------------------------------------

  function handleCancel() {
    setShowForm(false);
    setEditingTestimonial(null);

    reset({
      studentName: "",
      quote: "",
      videoUrl: "",
      rating: 5,
      country: "",
      university: "",
      displayOrder: 0,
      isPublished: true,
      isFeaturedOnHomepage: false,
      photo: {
        url: "",
      },
    });
  }

  // ------------------------------------------------------------
  // SUBMIT
  // ------------------------------------------------------------

  const onSubmit = (formData) => {
    const payload = {
      studentName: formData.studentName?.trim(),
      quote: formData.quote?.trim(),
      videoUrl: formData.videoUrl?.trim() || undefined,
      rating: Number(formData.rating || 5),
      displayOrder: Number(formData.displayOrder || 0),
      isPublished: Boolean(formData.isPublished),
      isFeaturedOnHomepage: Boolean(formData.isFeaturedOnHomepage),
    };

    // Photo
    if (formData.photo?.url?.trim()) {
      payload.photo = {
        url: formData.photo.url.trim(),
      };
    }

    // Country
    if (formData.country?.trim()) {
      payload.country = formData.country.trim();
    }

    // University
    if (formData.university?.trim()) {
      payload.university = formData.university.trim();
    }

    if (editingTestimonial) {
      updateMutation.mutate({
        id: editingTestimonial._id,
        payload,
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  const testimonials = data || [];

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------ */}
      {/* HEADER */}
      {/* ------------------------------------------------------ */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="font-heading text-xl font-bold tracking-tight text-navy-700">
            Student Testimonials
          </h2>

          <p className="mt-0.5 text-xs text-slate-500">
            Manage student success stories displayed across the website.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(true);
            setEditingTestimonial(null);

            reset({
              studentName: "",
              quote: "",
              videoUrl: "",
              rating: 5,
              country: "",
              university: "",
              displayOrder: 0,
              isPublished: true,
              isFeaturedOnHomepage: false,
              photo: {
                url: "",
              },
            });
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-coral px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-coral/90 hover:shadow active:scale-[0.98]"
        >
          <HiOutlinePlus size={16} />
          New Testimonial
        </button>
      </div>

      {/* ------------------------------------------------------ */}
      {/* CREATE / EDIT FORM */}
      {/* ------------------------------------------------------ */}

      {(showForm || editingTestimonial) && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-navy-700">
                {editingTestimonial ? "Edit Testimonial" : "Create Testimonial"}
              </h3>

              <p className="mt-0.5 text-xs text-slate-400">
                Add a genuine student success story.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <HiOutlineX size={18} />
            </button>
          </div>

          {/* STUDENT NAME + RATING */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Student Name
              </label>

              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 transition-colors focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
                {...register("studentName", {
                  required: true,
                  maxLength: 150,
                })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Rating
              </label>

              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition-colors focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
                {...register("rating")}
              >
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {"★".repeat(rating)} ({rating}/5)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* QUOTE */}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Student Quote
            </label>

            <textarea
              rows={4}
              placeholder="Write the student's testimonial..."
              className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-sm leading-relaxed text-slate-800 transition-colors focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
              {...register("quote", {
                required: true,
                maxLength: 1000,
              })}
            />

            <p className="mt-1 text-[10px] text-slate-400">
              Maximum 1000 characters.
            </p>
          </div>

          {/* PHOTO */}

          <div className="space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-navy-700">
                Student Photo
              </label>

              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 text-xs shadow-sm">
                <button
                  type="button"
                  onClick={() => setImageInputType("url")}
                  className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                    imageInputType === "url"
                      ? "bg-coral text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Image URL
                </button>

                <button
                  type="button"
                  onClick={() => setImageInputType("file")}
                  className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                    imageInputType === "file"
                      ? "bg-coral text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Upload
                </button>
              </div>
            </div>

            {imageInputType === "url" ? (
              <div className="relative">
                <HiOutlinePhotograph
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm transition-colors focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
                  {...register("photo.url")}
                />
              </div>
            ) : (
              <label
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white p-5 text-xs font-semibold text-slate-600 transition-all hover:border-coral hover:bg-slate-50/80 ${
                  isUploading ? "pointer-events-none opacity-60" : ""
                }`}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2 py-1">
                    <svg
                      className="h-6 w-6 animate-spin text-coral"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>

                    <span className="font-bold text-coral">
                      Uploading image...
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="rounded-full bg-coral/10 p-2 text-coral">
                      <HiOutlineUpload size={20} />
                    </div>

                    <span>Click to upload or drag & drop</span>

                    <span className="text-[10px] font-normal text-slate-400">
                      PNG, JPG, or WEBP (Max 5MB)
                    </span>
                  </>
                )}

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
            )}

            {photoUrl && (
              <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={photoUrl}
                    alt="Student preview"
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-slate-100"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-navy-700">
                      Photo Preview
                    </p>

                    <p className="mt-0.5 truncate text-[10px] text-slate-400 max-w-xs sm:max-w-md">
                      {photoUrl}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setValue("photo.url", "")}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                  title="Remove photo"
                >
                  <HiOutlineTrash size={16} />
                </button>
              </div>
            )}
          </div>

          {/* COUNTRY / UNIVERSITY DROPDOWNS */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* COUNTRY SELECT */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Country
              </label>

              <select
                disabled={isLoadingCountries}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition-colors focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral disabled:bg-slate-50 disabled:text-slate-400"
                {...register("country")}
              >
                <option value="">
                  {isLoadingCountries
                    ? "Loading countries..."
                    : "Select Country (Optional)"}
                </option>

                {countries.map((country) => (
                  <option key={country._id} value={country._id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* UNIVERSITY SELECT */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                University
              </label>

              <select
                disabled={!selectedCountrySlug || isLoadingUniversities}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition-colors focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral disabled:bg-slate-50 disabled:text-slate-400"
                {...register("university")}
              >
                <option value="">
                  {!selectedCountrySlug
                    ? "Select country first"
                    : isLoadingUniversities
                      ? "Loading universities..."
                      : universities.length === 0
                        ? "No universities found"
                        : "Select University (Optional)"}
                </option>

                {universities.map((university) => (
                  <option key={university._id} value={university._id}>
                    {university.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* VIDEO */}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Video URL
            </label>

            <input
              type="url"
              placeholder="YouTube / Vimeo URL (optional)"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm transition-colors focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
              {...register("videoUrl")}
            />
          </div>

          {/* SETTINGS */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Display Order
              </label>

              <input
                type="number"
                min="0"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm transition-colors focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
                {...register("displayOrder")}
              />
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3.5 transition-colors hover:bg-slate-50">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-coral focus:ring-coral accent-coral"
                {...register("isPublished")}
              />

              <div>
                <p className="text-xs font-bold text-navy-700">Published</p>

                <p className="text-[10px] text-slate-400">
                  Show on public pages
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3.5 transition-colors hover:bg-slate-50">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-coral focus:ring-coral accent-coral"
                {...register("isFeaturedOnHomepage")}
              />

              <div>
                <p className="text-xs font-bold text-navy-700">
                  Homepage Featured
                </p>

                <p className="text-[10px] text-slate-400">
                  Show in homepage carousel
                </p>
              </div>
            </label>
          </div>

          {/* ACTIONS */}

          <div className="flex gap-2.5 border-t border-slate-100 pt-4">
            <button
              type="submit"
              disabled={
                createMutation.isPending ||
                updateMutation.isPending ||
                isUploading
              }
              className="flex items-center gap-2 rounded-xl bg-coral px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-coral/90 hover:shadow disabled:opacity-50"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <svg
                  className="h-3.5 w-3.5 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : editingTestimonial
                  ? "Update Testimonial"
                  : "Create Testimonial"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ------------------------------------------------------ */}
      {/* TABLE */}
      {/* ------------------------------------------------------ */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-5 py-3.5">University</th>
                <th className="px-5 py-3.5">Country</th>
                <th className="px-5 py-3.5">Rating</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Homepage</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <>
                  {[1, 2, 3, 4, 5].map((item) => (
                    <tr key={item} className="animate-pulse">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-200" />
                          <div className="space-y-1.5">
                            <div className="h-4 w-32 rounded bg-slate-200" />
                            <div className="h-3 w-24 rounded bg-slate-200" />
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="h-4 w-28 rounded bg-slate-200" />
                      </td>

                      <td className="px-5 py-4">
                        <div className="h-4 w-20 rounded bg-slate-200" />
                      </td>

                      <td className="px-5 py-4">
                        <div className="h-4 w-16 rounded bg-slate-200" />
                      </td>

                      <td className="px-5 py-4">
                        <div className="h-6 w-20 rounded-full bg-slate-200" />
                      </td>

                      <td className="px-5 py-4">
                        <div className="h-6 w-20 rounded-full bg-slate-200" />
                      </td>

                      <td className="px-5 py-4">
                        <div className="ml-auto h-7 w-16 rounded bg-slate-200" />
                      </td>
                    </tr>
                  ))}
                </>
              )}

              {!isLoading && testimonials.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center">
                    <HiOutlineCheckCircle
                      size={36}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-semibold text-slate-600">
                      No testimonials yet
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Create your first student success story.
                    </p>
                  </td>
                </tr>
              )}

              {!isLoading &&
                testimonials.map((testimonial) => (
                  <tr
                    key={testimonial._id}
                    className="transition-colors hover:bg-slate-50/80"
                  >
                    {/* STUDENT */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {testimonial.photo?.url ? (
                          <img
                            src={testimonial.photo.url}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-50 font-bold text-navy-400 ring-2 ring-slate-100">
                            {testimonial.studentName
                              ?.charAt(0)
                              ?.toUpperCase() || "S"}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="max-w-[180px] truncate text-sm font-bold text-navy-700">
                            {testimonial.studentName}
                          </p>

                          <p className="max-w-[220px] truncate text-[11px] text-slate-400">
                            {testimonial.quote}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* UNIVERSITY */}

                    <td className="px-5 py-4 text-xs font-medium text-slate-600">
                      {testimonial.university?.name || "—"}
                    </td>

                    {/* COUNTRY */}

                    <td className="px-5 py-4 text-xs font-medium text-slate-600">
                      {testimonial.country?.name || "—"}
                    </td>

                    {/* RATING */}

                    <td className="px-5 py-4">
                      <span className="font-bold tracking-tight text-amber-500">
                        {"★".repeat(testimonial.rating || 5)}
                      </span>
                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-4">
                      {testimonial.isPublished ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                          <HiOutlineCheckCircle size={13} />
                          Published
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                          Draft
                        </span>
                      )}
                    </td>

                    {/* HOMEPAGE */}

                    <td className="px-5 py-4">
                      {testimonial.isFeaturedOnHomepage ? (
                        <span className="rounded-full bg-coral/10 px-2.5 py-1 text-[10px] font-bold text-coral ring-1 ring-inset ring-coral/20">
                          Featured
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400">
                          No
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}

                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(testimonial)}
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy-700"
                          title="Edit"
                        >
                          <HiOutlinePencil size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingTestimonial(testimonial)}
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                          title="Delete"
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

      {/* ------------------------------------------------------ */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ------------------------------------------------------ */}

      {deletingTestimonial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl transition-all">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50">
                <HiOutlineExclamation size={22} />
              </div>
              <h3 className="text-base font-bold text-navy-700">
                Delete Testimonial
              </h3>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Are you sure you want to delete the testimonial for{" "}
              <span className="font-semibold text-slate-700">
                "{deletingTestimonial.studentName}"
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingTestimonial(null)}
                disabled={deleteMutation.isPending}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => deleteMutation.mutate(deletingTestimonial._id)}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-rose-700 disabled:opacity-50"
              >
                {deleteMutation.isPending && (
                  <svg
                    className="h-3.5 w-3.5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
                {deleteMutation.isPending ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTestimonialsPage;
