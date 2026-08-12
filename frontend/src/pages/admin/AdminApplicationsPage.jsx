import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlineFilter,
  HiOutlineX,
  HiOutlineCheckCircle,
  HiOutlineUser,
  HiOutlineAcademicCap,
  HiOutlineGlobe,
  HiOutlineDocumentText,
  HiOutlineExternalLink,
  HiOutlineXCircle,
  HiOutlineArrowLeft,
  HiOutlinePhone,
  HiOutlineMail,
} from "react-icons/hi";
import { CgSpinner } from "react-icons/cg";
import { useCounsellors } from "../../hooks/useCounsellors";
import {
  useAdminApplications,
  useUpdateApplicationStage,
} from "../../hooks/useAdminApplications";
import api from "../../lib/api";

const STAGES = [
  "application_submitted",
  "documents_required",
  "documents_verified",
  "university_shortlisted",
  "application_sent",
  "offer_letter",
  "admission_confirmed",
  "visa_processing",
  "visa_approved",
  "flight_booked",
  "departure",
  "university_reached",
  "completed",
];

const DOCUMENT_TYPES = [
  ["passport", "Passport"],
  ["aadhaar", "Aadhaar Card"],
  ["pan", "PAN Card"],
  ["10th_memo", "10th Memo"],
  ["12th_memo", "12th Memo"],
  ["neet_scorecard", "NEET Scorecard"],
  ["passport_photo", "Passport Photo"],
  ["medical_certificate", "Medical Certificate"],
  ["offer_letter", "Offer Letter"],
  ["visa_documents", "Visa Documents"],
  ["other", "Other"],
];

const label = (s) =>
  s ? s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—";

const AdminApplicationsPage = () => {
  const [stageFilter, setStageFilter] = useState("");
  const { data: counsellors = [] } = useCounsellors();
  const [selectedApp, setSelectedApp] = useState(null);
  const [stageUpdateModal, setStageUpdateModal] = useState(null);
  const [counsellorRemark, setCounsellorRemark] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState("");
  const [documentAction, setDocumentAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const { data, isLoading, refetch } = useAdminApplications({
    stage: stageFilter || undefined,
  });
  const updateStage = useUpdateApplicationStage();

  const applications = data?.applications || [];

  const handleAssignCounsellor = async (applicationId, counsellorId) => {
    if (!counsellorId) return;
    setIsAssigning(true);
    try {
      await api.patch(`/applications/${applicationId}/assign`, {
        counsellorId,
      });
      toast.success("Counsellor assigned successfully");
      refetch();
      if (selectedApp?._id === applicationId) {
        refreshSelectedApp(applicationId);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign counsellor");
    } finally {
      setIsAssigning(false);
    }
  };

  const openStageModal = (appId, newStage) => {
    setStageUpdateModal({ appId, newStage });
    setCounsellorRemark("");
    setEstimatedCompletionDate("");
    setRequiredDocuments([]);
  };

  const confirmStageChange = () => {
    if (!stageUpdateModal) return;

    updateStage.mutate(
      {
        id: stageUpdateModal.appId,
        stage: stageUpdateModal.newStage,
        counsellorRemark: counsellorRemark || undefined,
        estimatedCompletionDate: estimatedCompletionDate || undefined,
        requiredDocuments:
          stageUpdateModal.newStage === "documents_required"
            ? requiredDocuments
            : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Application stage updated");
          setStageUpdateModal(null);
          setCounsellorRemark("");
          setEstimatedCompletionDate("");
          setRequiredDocuments([]);

          if (selectedApp?._id === stageUpdateModal.appId) {
            refreshSelectedApp(selectedApp._id);
          }
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Failed to update stage"),
      },
    );
  };

  const handleDelete = async (id) => {
    setActionLoading("deleting");
    try {
      await api.delete(`/applications/${id}`);
      toast.success("Application deleted successfully");
      setDeleteConfirmId(null);
      if (selectedApp?._id === id) setSelectedApp(null);
      refetch();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to delete application",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const refreshSelectedApp = async (applicationId) => {
    try {
      const { data } = await api.get("/applications");
      const updatedApp = data?.data?.applications?.find(
        (app) => app._id === applicationId,
      );
      if (updatedApp) {
        setSelectedApp(updatedApp);
      }
    } catch (err) {
      console.error("Failed to refresh application details", err);
    }
  };

  const handleDocumentVerification = async (
    applicationId,
    documentId,
    verified,
  ) => {
    if (!verified && !rejectionReason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }

    const actionKey = verified
      ? `verify_${documentId}`
      : `reject_${documentId}`;
    setActionLoading(actionKey);

    try {
      await api.patch(
        `/applications/${applicationId}/documents/${documentId}/verify`,
        {
          verified,
          rejectionReason: verified ? undefined : rejectionReason,
        },
      );

      toast.success(
        verified ? "Document verified successfully" : "Document rejected",
      );

      setDocumentAction(null);
      setRejectionReason("");
      refetch();
      refreshSelectedApp(applicationId);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update document status",
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {selectedApp ? (
        /* Full Page View */
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-100 pb-4">
            <button
              onClick={() => setSelectedApp(null)}
              className="inline-flex items-center gap-2 rounded-xl border border-navy-100 bg-white px-4 py-2 text-xs font-bold text-navy-600 shadow-sm transition-all hover:bg-navy-50"
            >
              <HiOutlineArrowLeft size={16} /> Back to Applications List
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-navy-400">Current Stage:</span>
              <span className="inline-block rounded-full bg-coral-50 px-3 py-1 text-xs font-bold text-coral">
                {label(selectedApp.currentStage)}
              </span>
              <button
                onClick={() => setDeleteConfirmId(selectedApp._id)}
                className="ml-2 inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
              >
                <HiOutlineTrash size={15} /> Delete Application
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-heading text-xl font-bold text-navy-600 sm:text-2xl">
                  {selectedApp.student?.name || "Student Application"}
                </h2>
                <p className="mt-0.5 text-xs text-navy-400">
                  Application Reference ID: {selectedApp._id}
                </p>
              </div>

              <div className="mt-2 md:mt-0">
                <label className="text-xs font-semibold text-navy-500 block mb-1">
                  Advance Application Stage
                </label>
                <select
                  value={selectedApp.currentStage || ""}
                  onChange={(e) => {
                    if (
                      e.target.value &&
                      e.target.value !== selectedApp.currentStage
                    ) {
                      openStageModal(selectedApp._id, e.target.value);
                    }
                  }}
                  className="rounded-xl border border-navy-100 bg-white px-3 py-2 text-xs font-semibold text-navy-600 shadow-sm focus:border-coral focus:outline-none"
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s}>
                      {label(s)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Student Info */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-coral/10 p-2.5 text-coral">
                  <HiOutlineUser size={22} />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-navy-600">
                    Student Information
                  </h3>
                  <p className="text-[11px] text-navy-400">Applicant Details</p>
                </div>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-navy-400">Full Name</span>
                  <p className="font-semibold text-navy-600">
                    {selectedApp.student?.name || "N/A"}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-navy-600">
                  <HiOutlineMail className="text-navy-400" size={15} />
                  <span className="truncate">
                    {selectedApp.student?.email || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-navy-600">
                  <HiOutlinePhone className="text-navy-400" size={15} />
                  <span>{selectedApp.student?.phone || "Not Provided"}</span>
                </div>
              </div>
            </div>

            {/* Target Destination */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-coral/10 p-2.5 text-coral">
                  <HiOutlineGlobe size={22} />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-navy-600">
                    Target Destination
                  </h3>
                  <p className="text-[11px] text-navy-400">
                    University & Country
                  </p>
                </div>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-navy-400">Country Preference</span>
                  <p className="font-semibold text-navy-600">
                    {selectedApp.interestedCountry?.name || "Not Specified"}
                  </p>
                </div>
                <div>
                  <span className="text-navy-400">Target University</span>
                  <p className="font-semibold text-navy-600">
                    {selectedApp.targetUniversity?.name || "Not Specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Counsellor */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-coral/10 p-2.5 text-coral">
                    <HiOutlineAcademicCap size={22} />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-navy-600">
                      Assigned Counsellor
                    </h3>
                    <p className="text-[11px] text-navy-400">CRM Assignment</p>
                  </div>
                </div>
                {isAssigning && (
                  <CgSpinner size={18} className="animate-spin text-coral" />
                )}
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-navy-400">Current Counsellor</span>
                  <p className="font-semibold text-navy-600">
                    {selectedApp.assignedCounsellor?.name || "Unassigned"}
                  </p>
                </div>
                <div className="pt-2">
                  <label className="text-[11px] font-semibold text-navy-500 block mb-1">
                    Assign / Change Counsellor
                  </label>
                  <select
                    value={selectedApp.assignedCounsellor?._id || ""}
                    onChange={(e) =>
                      handleAssignCounsellor(selectedApp._id, e.target.value)
                    }
                    disabled={isAssigning}
                    className="w-full rounded-xl border border-navy-100 bg-navy-50/50 px-3 py-2 text-xs font-semibold text-navy-600 focus:border-coral focus:outline-none disabled:opacity-50 cursor-pointer"
                  >
                    <option value="" disabled>
                      Select Counsellor...
                    </option>
                    {counsellors.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid Documents & History */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-navy-50 pb-4">
                  <div>
                    <h3 className="font-heading text-base font-bold text-navy-600">
                      Submitted Documents
                    </h3>
                    <p className="text-xs text-navy-400">
                      Review and verify student uploaded paperwork
                    </p>
                  </div>
                  <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-bold text-navy-600">
                    {selectedApp.documents?.length || 0} Files
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  {!selectedApp.documents?.length ? (
                    <div className="rounded-2xl border border-dashed border-navy-100 bg-slate-50/50 p-8 text-center">
                      <HiOutlineDocumentText
                        size={32}
                        className="mx-auto text-navy-300"
                      />
                      <p className="mt-2 text-sm font-semibold text-navy-600">
                        No documents uploaded
                      </p>
                      <p className="mt-1 text-xs text-navy-400">
                        The student has not submitted any documents yet.
                      </p>
                    </div>
                  ) : (
                    selectedApp.documents.map((doc) => {
                      const isVerifying = actionLoading === `verify_${doc._id}`;
                      const isActioning = actionLoading?.includes(doc._id);

                      return (
                        <div
                          key={doc._id}
                          className="rounded-2xl border border-navy-100/80 bg-white p-4 shadow-sm transition-all hover:border-navy-200"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="rounded-xl bg-coral-50 p-2.5 text-coral shrink-0">
                                <HiOutlineDocumentText size={20} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-navy-600">
                                  {doc.documentName?.trim() || label(doc.type)}
                                </p>
                                <p className="text-[11px] font-semibold text-coral mt-0.5">
                                  Type: {label(doc.type)}
                                </p>
                                <p className="truncate text-xs text-navy-400 mt-0.5">
                                  {doc.fileName || "Document File"}
                                </p>
                                {doc.description?.trim() && (
                                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                                    <span className="font-semibold text-navy-500">
                                      Description:{" "}
                                    </span>
                                    {doc.description}
                                  </p>
                                )}
                                <p className="text-[10px] text-navy-300 mt-1">
                                  Uploaded:{" "}
                                  {doc.uploadedAt
                                    ? new Date(doc.uploadedAt).toLocaleString()
                                    : "—"}
                                </p>
                              </div>
                            </div>

                            <div className="shrink-0">
                              {doc.verified ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 border border-emerald-200/60">
                                  <HiOutlineCheckCircle size={15} /> Verified
                                </span>
                              ) : doc.rejectionReason ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600 border border-red-200/60">
                                  <HiOutlineXCircle size={15} /> Rejected
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600 border border-amber-200/60">
                                  Pending Review
                                </span>
                              )}
                            </div>
                          </div>

                          {doc.rejectionReason && (
                            <div className="mt-3 rounded-xl bg-red-50/80 p-3 text-xs text-red-700 border border-red-100">
                              <span className="font-bold uppercase tracking-wider text-[10px] text-red-500 block mb-0.5">
                                Rejection Reason
                              </span>
                              {doc.rejectionReason}
                            </div>
                          )}

                          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-navy-50 pt-3">
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-xl border border-navy-100 bg-white px-3.5 py-1.5 text-xs font-semibold text-navy-600 transition-colors hover:bg-navy-50"
                            >
                              <HiOutlineExternalLink size={15} /> View File
                            </a>

                            {!doc.verified && (
                              <>
                                <button
                                  type="button"
                                  disabled={isActioning}
                                  onClick={() =>
                                    handleDocumentVerification(
                                      selectedApp._id,
                                      doc._id,
                                      true,
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                                >
                                  {isVerifying ? (
                                    <CgSpinner
                                      className="animate-spin"
                                      size={15}
                                    />
                                  ) : (
                                    <HiOutlineCheckCircle size={15} />
                                  )}
                                  Verify
                                </button>

                                <button
                                  type="button"
                                  disabled={isActioning}
                                  onClick={() => {
                                    setDocumentAction({
                                      applicationId: selectedApp._id,
                                      documentId: doc._id,
                                    });
                                    setRejectionReason("");
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-red-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                                >
                                  <HiOutlineXCircle size={15} /> Reject
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="font-heading text-base font-bold text-navy-600">
                  Stage Timeline History
                </h3>
                <p className="text-xs text-navy-400 mt-0.5">
                  Audit log of application progress updates
                </p>

                <div className="mt-5 space-y-3">
                  {selectedApp.stageHistory &&
                  selectedApp.stageHistory.length > 0 ? (
                    selectedApp.stageHistory.map((history, idx) => (
                      <div
                        key={idx}
                        className="relative flex items-start gap-3 rounded-xl border border-navy-50 bg-slate-50/50 p-3.5 text-xs"
                      >
                        <HiOutlineCheckCircle
                          size={18}
                          className="mt-0.5 text-coral shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-bold text-navy-600 truncate">
                              {label(history.stage)}
                            </p>
                            <span className="text-[10px] text-navy-400 shrink-0">
                              {history.updatedAt
                                ? new Date(
                                    history.updatedAt,
                                  ).toLocaleDateString()
                                : ""}
                            </span>
                          </div>
                          {history.counsellorRemark && (
                            <p className="mt-1 text-slate-600 italic">
                              "{history.counsellorRemark}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-navy-400 py-4 text-center">
                      Current Stage:{" "}
                      <span className="font-bold text-navy-600">
                        {label(selectedApp.currentStage)}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-lg font-bold text-navy-600">
                Student Applications
              </h2>
              <p className="text-xs text-navy-400">
                Manage student admission lifecycles, assign counsellors, and
                stage progressions
              </p>
            </div>

            <div className="flex items-center gap-2">
              <HiOutlineFilter className="text-navy-400" size={18} />
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="rounded-xl border border-navy-100 bg-white px-3 py-2 text-xs font-medium text-navy-600 focus:border-coral focus:outline-none"
              >
                <option value="">All Stages</option>
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {label(s)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-navy-50 text-left text-xs uppercase text-navy-400">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Country & University</th>
                  <th className="px-4 py-3">Assigned Counsellor</th>
                  <th className="px-4 py-3">Current Stage</th>
                  <th className="px-4 py-3">Advance Stage</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {isLoading && (
                  <>
                    {[1, 2, 3, 4, 5].map((item) => (
                      <tr key={item} className="animate-pulse">
                        <td className="px-4 py-4">
                          <div className="h-4 w-28 rounded bg-navy-100" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-36 rounded bg-navy-100" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-24 rounded bg-navy-50" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-5 w-20 rounded-full bg-coral/15" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-16 rounded bg-navy-50" />
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="ml-auto h-7 w-16 rounded-lg bg-navy-100" />
                        </td>
                      </tr>
                    ))}
                  </>
                )}
                {!isLoading && applications.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-navy-400"
                    >
                      No applications found.
                    </td>
                  </tr>
                )}
                {applications.map((app) => (
                  <tr
                    key={app._id}
                    className="transition-colors hover:bg-slate-50/50"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-navy-600">
                        {app.student?.name || "N/A"}
                      </p>
                      <p className="text-xs text-navy-400">
                        {app.student?.email || "N/A"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-navy-600">
                      <p className="font-semibold">
                        {app.interestedCountry?.name || "—"}
                      </p>
                      <p className="text-xs text-navy-400">
                        {app.targetUniversity?.name || "—"}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <select
                        value={app.assignedCounsellor?._id || ""}
                        onChange={(e) =>
                          handleAssignCounsellor(app._id, e.target.value)
                        }
                        disabled={isAssigning}
                        className="rounded-lg border border-navy-100 bg-white px-2 py-1 text-xs text-navy-600 focus:border-coral focus:outline-none disabled:opacity-50 cursor-pointer"
                      >
                        <option value="" disabled>
                          Assign Counsellor...
                        </option>
                        {counsellors.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-coral-50 px-3 py-1 text-xs font-semibold text-coral">
                        {label(app.currentStage)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={app.currentStage || ""}
                        onChange={(e) => {
                          if (
                            e.target.value &&
                            e.target.value !== app.currentStage
                          ) {
                            openStageModal(app._id, e.target.value);
                          }
                        }}
                        className="rounded-lg border border-navy-100 bg-white px-2 py-1 text-xs text-navy-600 focus:border-coral focus:outline-none"
                      >
                        {STAGES.map((s) => (
                          <option key={s} value={s}>
                            {label(s)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="rounded-md p-1.5 text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-600"
                          title="View Details"
                        >
                          <HiOutlineEye size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(app._id)}
                          className="rounded-md p-1.5 text-coral transition-colors hover:bg-coral-50 hover:text-coral-700"
                          title="Delete Application"
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
      )}

      {/* DOCUMENT REJECTION MODAL */}
      {documentAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-base font-bold text-navy-600">
                  Reject Document
                </h3>
                <p className="mt-1 text-xs text-navy-400">
                  Enter a reason so the student knows what needs to be
                  corrected.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDocumentAction(null);
                  setRejectionReason("");
                }}
                className="rounded-lg p-1 text-navy-400 hover:bg-navy-50"
              >
                <HiOutlineX size={20} />
              </button>
            </div>

            <div className="mt-5">
              <label className="text-xs font-semibold text-navy-600">
                Rejection Reason
              </label>
              <textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Example: Document image is blurry. Please upload a clear copy."
                className="mt-2 w-full rounded-xl border border-navy-100 p-3 text-xs text-navy-600 focus:border-coral focus:outline-none"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={
                  actionLoading === `reject_${documentAction.documentId}`
                }
                onClick={() => {
                  setDocumentAction(null);
                  setRejectionReason("");
                }}
                className="rounded-xl border border-navy-100 px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-navy-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  actionLoading === `reject_${documentAction.documentId}`
                }
                onClick={() =>
                  handleDocumentVerification(
                    documentAction.applicationId,
                    documentAction.documentId,
                    false,
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {actionLoading === `reject_${documentAction.documentId}` && (
                  <CgSpinner className="animate-spin" size={15} />
                )}
                Reject Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE STAGE MODAL */}
      {stageUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-heading text-base font-bold text-navy-600">
              Update Application Stage
            </h3>
            <p className="mt-1 text-xs text-navy-400">
              Advancing to{" "}
              <span className="font-bold text-coral">
                {label(stageUpdateModal.newStage)}
              </span>
            </p>

            <div className="mt-4 space-y-4">
              {stageUpdateModal.newStage === "documents_required" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-navy-600">
                      Required Documents
                    </label>
                    <p className="mt-1 text-[10px] text-navy-400">
                      Select the documents the student must upload before the
                      application can proceed to document verification.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {DOCUMENT_TYPES.map(([type, documentLabel]) => {
                      const selected = requiredDocuments.some(
                        (doc) => doc.type === type,
                      );

                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setRequiredDocuments((current) => {
                              if (current.some((doc) => doc.type === type)) {
                                return current.filter(
                                  (doc) => doc.type !== type,
                                );
                              }

                              return [
                                ...current,
                                {
                                  type,
                                  label: documentLabel,
                                  instructions: "",
                                },
                              ];
                            });
                          }}
                          className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all ${
                            selected
                              ? "border-coral bg-coral-50 text-coral"
                              : "border-navy-100 bg-white text-navy-600 hover:border-coral/40 hover:bg-navy-50"
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                              selected
                                ? "border-coral bg-coral text-white"
                                : "border-navy-200 bg-white"
                            }`}
                          >
                            {selected && <HiOutlineCheckCircle size={15} />}
                          </span>

                          <span className="text-xs font-semibold">
                            {documentLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {requiredDocuments.length === 0 && (
                    <p className="text-[11px] font-medium text-red-500">
                      Please select at least one required document.
                    </p>
                  )}

                  {requiredDocuments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold text-navy-500">
                        Instructions for selected documents
                      </p>

                      {requiredDocuments.map((doc) => (
                        <div
                          key={doc.type}
                          className="rounded-xl border border-navy-100 bg-slate-50 p-3"
                        >
                          <p className="text-xs font-semibold text-navy-600">
                            {doc.label}
                          </p>

                          <input
                            type="text"
                            value={doc.instructions}
                            onChange={(e) => {
                              const value = e.target.value;

                              setRequiredDocuments((current) =>
                                current.map((item) =>
                                  item.type === doc.type
                                    ? {
                                        ...item,
                                        instructions: value,
                                      }
                                    : item,
                                ),
                              );
                            }}
                            placeholder={`Instructions for ${doc.label}...`}
                            maxLength={500}
                            className="mt-2 w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-xs text-navy-600 focus:border-coral focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold text-navy-600">
                  Estimated Completion Date
                </label>
                <input
                  type="date"
                  value={estimatedCompletionDate}
                  onChange={(e) => setEstimatedCompletionDate(e.target.value)}
                  className="w-full rounded-xl border border-navy-100 bg-white px-3 py-2.5 text-xs text-navy-600 focus:border-coral focus:outline-none"
                />
                <p className="text-[10px] text-navy-400">
                  Select the expected date for completing this stage.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-navy-600">
                  Counsellor Remark (Optional)
                </label>
                <textarea
                  rows={3}
                  value={counsellorRemark}
                  onChange={(e) => setCounsellorRemark(e.target.value)}
                  placeholder="Enter progress remarks or notes for the student..."
                  className="w-full rounded-xl border border-navy-100 p-3 text-xs focus:border-coral focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setStageUpdateModal(null)}
                disabled={updateStage.isPending}
                className="rounded-xl border border-navy-100 px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-navy-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmStageChange}
                disabled={updateStage.isPending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-coral px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {updateStage.isPending && (
                  <CgSpinner className="animate-spin" size={15} />
                )}
                {updateStage.isPending ? "Updating..." : "Confirm Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-heading text-base font-bold text-navy-600">
              Delete Application?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Are you sure you want to delete this application? This action
              cannot be undone and will erase all progress history.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={actionLoading === "deleting"}
                className="rounded-xl border border-navy-100 px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-navy-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={actionLoading === "deleting"}
                className="inline-flex items-center gap-1.5 rounded-xl bg-coral px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {actionLoading === "deleting" && (
                  <CgSpinner className="animate-spin" size={15} />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApplicationsPage;
