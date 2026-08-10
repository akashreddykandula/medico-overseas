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

  const handleFileUpload = async (e, setValue) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Client-side validation
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      e.target.value = "";
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPG, PNG, and WebP images are allowed");
      e.target.value = "";
      return;
    }

    try {
      const formData = new FormData();

      // IMPORTANT:
      // Backend uses upload.single("file")
      formData.append("file", file);

      // IMPORTANT:
      // Backend route is POST /api/uploads/image
      const { data } = await api.post(
        "/uploads/image?folder=medico-overseas/countries",
        formData,
      );

      const imageUrl = data?.data?.url;

      if (!imageUrl) {
        throw new Error("Image URL was not returned by upload API");
      }

      // Store Cloudinary URL in React Hook Form
      setValue("heroImage.url", imageUrl, {
        shouldValidate: true,
        shouldDirty: true,
      });

      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Image upload failed:", error);

      toast.error(error.response?.data?.message || "Failed to upload image");
    } finally {
      // Allow selecting the same file again
      e.target.value = "";
    }
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
      capital: formData.capital || "",
      currency: formData.currency || "",
      flightDuration: formData.flightDuration || "",
      timeDifference: formData.timeDifference || "",
      internationalAirports: formData.internationalAirports || "",

      durationYears: Number(formData.durationYears) || 6,
      mediumOfInstruction: formData.mediumOfInstruction || "English",

      fees: {
        tuitionPerYear: Number(formData.tuitionPerYear) || 0,
        hostelPerYear: Number(formData.hostelPerYear) || 0,
        messPerYear: Number(formData.messPerYear) || 0,
        oneTimeCosts: Number(formData.oneTimeCosts) || 0,
        currency: formData.feeCurrency || "USD",
      },

      eligibility: {
        minAge: Number(formData.minAge) || 17,
        neetRequired: formData.neetRequired === "true",
        minAcademicPercent: Number(formData.minAcademicPercent) || 50,
        notes: formData.eligibilityNotes || "",
      },
      requiredDocuments: formData.requiredDocuments
        ? formData.requiredDocuments
            .split("\n")
            .map((doc) => doc.trim())
            .filter(Boolean)
        : [],
      visaProcess: formData.visaProcess || "",

      livingCost: {
        monthlyEstimate: Number(formData.monthlyLivingCost) || 0,
        currency: formData.livingCostCurrency || "USD",
        notes: formData.livingCostNotes || "",
      },
      admissionProcess: formData.admissionProcess
        ? formData.admissionProcess
            .split("\n")
            .map((step, index) => {
              const [title, ...descriptionParts] = step.split("|");

              return {
                step: title?.trim() || `Step ${index + 1}`,
                description: descriptionParts.join("|").trim(),
              };
            })
            .filter((item) => item.description)
        : [],
      faqs: formData.faqs
        ? formData.faqs
            .split("\n")
            .map((faq) => {
              const [question, ...answerParts] = faq.split("|");

              return {
                question: question?.trim(),
                answer: answerParts.join("|").trim(),
              };
            })
            .filter((item) => item.question && item.answer)
        : [],
    });
  };

  const onSubmitEdit = (formData) => {
    updateMutation.mutate({
      id: editingCountry._id,
      payload: {
        name: formData.name,
        shortDescription: formData.shortDescription,
        overview: formData.overview,
        isPublished: formData.isPublished === "true",

        heroImage: {
          url: formData.heroImage?.url || "",
        },

        capital: formData.capital || "",
        currency: formData.currency || "",
        flightDuration: formData.flightDuration || "",
        timeDifference: formData.timeDifference || "",
        internationalAirports: formData.internationalAirports || "",

        durationYears: Number(formData.durationYears) || 6,
        mediumOfInstruction: formData.mediumOfInstruction || "English",

        fees: {
          tuitionPerYear: Number(formData.tuitionPerYear) || 0,
          hostelPerYear: Number(formData.hostelPerYear) || 0,
          messPerYear: Number(formData.messPerYear) || 0,
          oneTimeCosts: Number(formData.oneTimeCosts) || 0,
          currency: formData.feeCurrency || "USD",
        },

        eligibility: {
          minAge: Number(formData.minAge) || 17,
          neetRequired: formData.neetRequired === "true",
          minAcademicPercent: Number(formData.minAcademicPercent) || 50,
          notes: formData.eligibilityNotes || "",
        },

        requiredDocuments: formData.requiredDocuments
          ? formData.requiredDocuments
              .split("\n")
              .map((doc) => doc.trim())
              .filter(Boolean)
          : [],
        visaProcess: formData.visaProcess || "",

        livingCost: {
          monthlyEstimate: Number(formData.monthlyLivingCost) || 0,
          currency: formData.livingCostCurrency || "USD",
          notes: formData.livingCostNotes || "",
        },

        admissionProcess: formData.admissionProcess
          ? formData.admissionProcess
              .split("\n")
              .map((step, index) => {
                const [title, ...descriptionParts] = step.split("|");

                return {
                  step: title?.trim() || `Step ${index + 1}`,
                  description: descriptionParts.join("|").trim(),
                };
              })
              .filter((item) => item.description)
          : [],
        faqs: formData.faqs
          ? formData.faqs
              .split("\n")
              .map((faq) => {
                const [question, ...answerParts] = faq.split("|");

                return {
                  question: question?.trim(),
                  answer: answerParts.join("|").trim(),
                };
              })
              .filter((item) => item.question && item.answer)
          : [],

        climateNotes: formData.climateNotes || "",
        studentLifeNotes: formData.studentLifeNotes || "",
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

      isPublished: String(country.isPublished ?? true),

      heroImage: {
        url: country.heroImage?.url || country.heroImage || "",
      },

      // Destination Information
      capital: country.capital || "",
      currency: country.currency || "",
      flightDuration: country.flightDuration || "",
      timeDifference: country.timeDifference || "",
      internationalAirports: country.internationalAirports || "",

      // MBBS Information
      durationYears: country.durationYears ?? 6,
      mediumOfInstruction: country.mediumOfInstruction || "English",

      // Fee Structure (Leave empty if undefined or zero to display placeholder)
      tuitionPerYear: country.fees?.tuitionPerYear
        ? country.fees.tuitionPerYear
        : "",
      hostelPerYear: country.fees?.hostelPerYear
        ? country.fees.hostelPerYear
        : "",
      messPerYear: country.fees?.messPerYear ? country.fees.messPerYear : "",
      oneTimeCosts: country.fees?.oneTimeCosts ? country.fees.oneTimeCosts : "",
      feeCurrency: country.fees?.currency || "USD",

      // Eligibility
      minAge: country.eligibility?.minAge ?? 17,
      neetRequired: String(country.eligibility?.neetRequired ?? true),
      minAcademicPercent: country.eligibility?.minAcademicPercent ?? 50,
      eligibilityNotes: country.eligibility?.notes || "",

      // Required Documents
      requiredDocuments: (country.requiredDocuments || []).join("\n"),
      visaProcess: country.visaProcess || "",

      monthlyLivingCost: country.livingCost?.monthlyEstimate
        ? country.livingCost.monthlyEstimate
        : "",
      livingCostCurrency: country.livingCost?.currency || "USD",
      livingCostNotes: country.livingCost?.notes || "",

      // Admission Process
      admissionProcess: (country.admissionProcess || [])
        .map((item) => `${item.step} | ${item.description}`)
        .join("\n"),

      // FAQs
      faqs: (country.faqs || [])
        .map((item) => `${item.question} | ${item.answer}`)
        .join("\n"),

      // Climate & Student Life
      climateNotes: country.climateNotes || "",
      studentLifeNotes: country.studentLifeNotes || "",
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

          {/* BASIC DESTINATION INFORMATION */}
          <div className="space-y-3 rounded-xl border border-navy-50 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-navy-600">
              Destination Information
            </h4>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                placeholder="Capital City"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerCreate("capital")}
              />

              <input
                placeholder="Currency (e.g. RUB, GEL, USD)"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerCreate("currency")}
              />

              <input
                placeholder="Flight Duration (e.g. 7-8 Hours)"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerCreate("flightDuration")}
              />

              <input
                placeholder="Time Difference (e.g. +2:30 Hours)"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerCreate("timeDifference")}
              />

              <input
                placeholder="International Airports"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none sm:col-span-2"
                {...registerCreate("internationalAirports")}
              />
            </div>
          </div>

          {/* MBBS INFORMATION */}
          <div className="space-y-3 rounded-xl border border-navy-50 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-navy-600">
              MBBS Information
            </h4>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="number"
                placeholder="Course Duration (Years)"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerCreate("durationYears")}
              />

              <input
                placeholder="Medium of Instruction"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerCreate("mediumOfInstruction")}
              />
            </div>
          </div>

          {/* FEE STRUCTURE */}
          <div className="space-y-3 rounded-xl border border-navy-50 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-navy-600">
              Fee Structure
            </h4>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-navy-600">
                  Tuition Fee / Year
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 4000"
                  className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                  {...registerCreate("tuitionPerYear")}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-navy-600">
                  Hostel Fee / Year
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 800"
                  className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                  {...registerCreate("hostelPerYear")}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-navy-600">
                  Mess Fee / Year
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 1000"
                  className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                  {...registerCreate("messPerYear")}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-navy-600">
                  One-Time Costs
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 1500"
                  className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                  {...registerCreate("oneTimeCosts")}
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-navy-600">
                  Fee Currency
                </label>
                <input
                  placeholder="Fee Currency (e.g. USD)"
                  className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                  {...registerCreate("feeCurrency")}
                  defaultValue="USD"
                />
              </div>
            </div>
          </div>

          {/* ELIGIBILITY */}
          <div className="space-y-3 rounded-xl border border-navy-50 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-navy-600">
              Eligibility
            </h4>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                type="number"
                min="1"
                placeholder="Minimum Age"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerCreate("minAge")}
                defaultValue={17}
              />

              <input
                type="number"
                min="0"
                max="100"
                placeholder="Minimum Academic %"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerCreate("minAcademicPercent")}
                defaultValue={50}
              />

              <select
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerCreate("neetRequired")}
                defaultValue="true"
              >
                <option value="true">NEET Required</option>
                <option value="false">NEET Not Required</option>
              </select>
            </div>

            <textarea
              placeholder="Eligibility notes"
              rows={2}
              className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
              {...registerCreate("eligibilityNotes")}
            />
          </div>

          {/* REQUIRED DOCUMENTS */}
          <div className="space-y-3 rounded-xl border border-navy-50 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-navy-600">
              Required Documents
            </h4>

            <p className="text-[11px] text-navy-400">
              Enter one document per line.
            </p>

            <textarea
              placeholder={`Example:
Original Passport
Class 10th Marksheet
Class 12th Marksheet
NEET Scorecard
Passport Size Photographs
Medical Fitness Certificate`}
              rows={6}
              className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
              {...registerCreate("requiredDocuments")}
            />
          </div>

          {/* VISA & LIVING COST */}
          <div className="space-y-4 rounded-xl border border-navy-50 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-navy-600">
              Visa & Living Cost
            </h4>

            {/* Visa Process */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-navy-600">
                Visa Process
              </label>

              <textarea
                placeholder="Describe the student visa process, invitation letter, embassy submission, visa stamping, etc."
                rows={4}
                className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerCreate("visaProcess")}
              />
            </div>

            {/* Living Cost */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-navy-600">
                Monthly Living Cost
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 200"
                  className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                  {...registerCreate("monthlyLivingCost")}
                />

                <input
                  placeholder="Currency (e.g. USD)"
                  defaultValue="USD"
                  className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                  {...registerCreate("livingCostCurrency")}
                />
              </div>
            </div>

            {/* Living Cost Notes */}
            <textarea
              placeholder="Living cost notes (food, transport, accommodation, utilities, personal expenses...)"
              rows={3}
              className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
              {...registerCreate("livingCostNotes")}
            />
          </div>

          {/* ADMISSION PROCESS */}
          <div className="space-y-3 rounded-xl border border-navy-50 bg-slate-50/50 p-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-navy-600">
                Admission Process
              </h4>

              <p className="mt-1 text-[11px] text-navy-400">
                Add one admission step per line using: Step Title | Description
              </p>
            </div>

            <textarea
              placeholder={`Example:
Step 1 | Submit application and academic documents
Step 2 | Receive admission confirmation
Step 3 | Receive invitation letter
Step 4 | Apply for student visa
Step 5 | Travel to the destination country
Step 6 | Complete university registration`}
              rows={8}
              className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
              {...registerCreate("admissionProcess")}
            />
          </div>

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
              <option value="true">Published</option>
              <option value="false">Draft</option>
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

          {/* EDIT DESTINATION INFORMATION */}
          <div className="space-y-3 rounded-xl border border-navy-50 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-navy-600">
              Destination Information
            </h4>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                placeholder="Capital City"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerEdit("capital")}
              />

              <input
                placeholder="Currency (e.g. RUB, GEL, USD)"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerEdit("currency")}
              />

              <input
                placeholder="Flight Duration (e.g. 7-8 Hours)"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerEdit("flightDuration")}
              />

              <input
                placeholder="Time Difference (e.g. +2:30 Hours)"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerEdit("timeDifference")}
              />

              <input
                placeholder="International Airports"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none sm:col-span-2"
                {...registerEdit("internationalAirports")}
              />
            </div>
          </div>

          {/* EDIT MBBS INFORMATION */}
          <div className="space-y-3 rounded-xl border border-navy-50 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-navy-600">
              MBBS Information
            </h4>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="number"
                placeholder="Course Duration (Years)"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerEdit("durationYears")}
              />

              <input
                placeholder="Medium of Instruction"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerEdit("mediumOfInstruction")}
              />
            </div>
          </div>

          {/* EDIT FEE STRUCTURE */}
          <div className="space-y-3 rounded-xl border border-navy-50 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-navy-600">
              Fee Structure
            </h4>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-navy-600">
                  Tuition Fee / Year
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 4000"
                  className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                  {...registerEdit("tuitionPerYear")}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-navy-600">
                  Hostel Fee / Year
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 800"
                  className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                  {...registerEdit("hostelPerYear")}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-navy-600">
                  Mess Fee / Year
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 1000"
                  className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                  {...registerEdit("messPerYear")}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-navy-600">
                  One-Time Costs
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 1500"
                  className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                  {...registerEdit("oneTimeCosts")}
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-navy-600">
                  Fee Currency
                </label>
                <input
                  placeholder="Fee Currency (e.g. USD)"
                  className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                  {...registerEdit("feeCurrency")}
                />
              </div>
            </div>
          </div>

          {/* EDIT ELIGIBILITY */}
          <div className="space-y-3 rounded-xl border border-navy-50 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-navy-600">
              Eligibility
            </h4>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                type="number"
                min="1"
                placeholder="Minimum Age"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerEdit("minAge")}
              />

              <input
                type="number"
                min="0"
                max="100"
                placeholder="Minimum Academic %"
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerEdit("minAcademicPercent")}
              />

              <select
                className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerEdit("neetRequired")}
              >
                <option value="true">NEET Required</option>
                <option value="false">NEET Not Required</option>
              </select>
            </div>

            <textarea
              placeholder="Eligibility notes"
              rows={2}
              className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
              {...registerEdit("eligibilityNotes")}
            />
          </div>

          {/* EDIT VISA & LIVING COST */}
          <div className="space-y-4 rounded-xl border border-navy-50 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-navy-600">
              Visa & Living Cost
            </h4>

            {/* Visa Process */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-navy-600">
                Visa Process
              </label>

              <textarea
                placeholder="Describe the student visa process, invitation letter, embassy submission, visa stamping, etc."
                rows={4}
                className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                {...registerEdit("visaProcess")}
              />
            </div>

            {/* Living Cost */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-navy-600">
                Monthly Living Cost
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 200"
                  className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                  {...registerEdit("monthlyLivingCost")}
                />

                <input
                  placeholder="Currency (e.g. USD)"
                  className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
                  {...registerEdit("livingCostCurrency")}
                />
              </div>
            </div>

            {/* Living Cost Notes */}
            <textarea
              placeholder="Living cost notes (food, transport, accommodation, utilities, personal expenses...)"
              rows={3}
              className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
              {...registerEdit("livingCostNotes")}
            />
          </div>

          {/* EDIT ADMISSION PROCESS */}
          <div className="space-y-3 rounded-xl border border-navy-50 bg-slate-50/50 p-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-navy-600">
                Admission Process
              </h4>

              <p className="mt-1 text-[11px] text-navy-400">
                Add one admission step per line using: Step Title | Description
              </p>
            </div>

            <textarea
              placeholder={`Example:
Step 1 | Submit application and academic documents
Step 2 | Receive admission confirmation
Step 3 | Receive invitation letter
Step 4 | Apply for student visa
Step 5 | Travel to the destination country
Step 6 | Complete university registration`}
              rows={8}
              className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
              {...registerEdit("admissionProcess")}
            />
          </div>

          {/* EDIT FAQs */}
          <div className="space-y-3 rounded-xl border border-navy-50 bg-slate-50/50 p-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-navy-600">
                Frequently Asked Questions
              </h4>

              <p className="mt-1 text-[11px] text-navy-400">
                Add one FAQ per line using: Question | Answer
              </p>
            </div>

            <textarea
              placeholder={`Example:
What is the duration of MBBS? | The MBBS program is 6 years.
Is NEET required? | Yes, NEET qualification is required.
Is the course taught in English? | Yes, English-medium programs are available.
Is hostel accommodation available? | Yes, hostel accommodation is available.`}
              rows={8}
              className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
              {...registerEdit("faqs")}
            />
          </div>

          {/* EDIT CLIMATE & STUDENT LIFE */}
          <div className="space-y-3 rounded-xl border border-navy-50 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-navy-600">
              Climate & Student Life
            </h4>

            <textarea
              placeholder="Climate & Seasons (e.g. Cold winters, pleasant summers...)"
              rows={3}
              className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
              {...registerEdit("climateNotes")}
            />

            <textarea
              placeholder="Student Life (e.g. Indian community, food, accommodation, campus life...)"
              rows={3}
              className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
              {...registerEdit("studentLifeNotes")}
            />
          </div>

          {/* EDIT REQUIRED DOCUMENTS */}
          <div className="space-y-3 rounded-xl border border-navy-50 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-navy-600">
              Required Documents
            </h4>

            <p className="text-[11px] text-navy-400">
              Enter one document per line.
            </p>

            <textarea
              placeholder={`Example:
Original Passport
Class 10th Marksheet
Class 12th Marksheet
NEET Scorecard
Passport Size Photographs
Medical Fitness Certificate`}
              rows={6}
              className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus:border-coral focus:outline-none"
              {...registerEdit("requiredDocuments")}
            />
          </div>

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
