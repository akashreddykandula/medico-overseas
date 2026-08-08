import React, { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  HiOutlineUpload,
  HiOutlineTrash,
  HiOutlineEye,
  HiCheckCircle,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import {
  useMyApplication,
  useUploadDocument,
  useDeleteDocument,
} from "../../hooks/useApplication";

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

const DocumentSlot = ({ type, label, existingDoc }) => {
  const [dragOver, setDragOver] = useState(false);
  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();

  const handleFile = useCallback(
    (file) => {
      if (!file) return;
      uploadMutation.mutate(
        { file, type },
        {
          onSuccess: () =>
            toast.success(`${label} ${existingDoc ? "replaced" : "uploaded"}`),
          onError: (err) =>
            toast.error(err.response?.data?.message || "Upload failed"),
        },
      );
    },
    [type, label, existingDoc, uploadMutation],
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`group relative flex flex-col justify-between rounded-2xl border-2 border-dashed p-5 transition-all duration-200 ${
        dragOver
          ? "border-coral bg-coral-50/60 shadow-md scale-[1.01]"
          : existingDoc
            ? "border-navy-100 bg-white shadow-sm hover:border-navy-200 hover:shadow"
            : "border-navy-100/80 bg-white/70 shadow-sm hover:border-coral/40 hover:bg-white"
      }`}
    >
      <div>
        {/* Top Header: Document Label & Verification Status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                existingDoc
                  ? existingDoc.verified
                    ? "bg-green-50 text-green-600"
                    : "bg-amber-50 text-amber-600"
                  : "bg-navy-50 text-navy-400 group-hover:bg-coral-50 group-hover:text-coral"
              }`}
            >
              <HiOutlineDocumentText size={20} />
            </div>
            <div>
              <p className="font-heading text-sm font-semibold text-navy-600">
                {label}
              </p>
              <p className="text-[11px] text-navy-300">PDF, JPG or PNG</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="shrink-0">
            {existingDoc ? (
              existingDoc.verified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-600 border border-green-200/50">
                  <HiCheckCircle size={14} /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600 border border-amber-200/50">
                  <HiOutlineClock size={14} /> Pending
                </span>
              )
            ) : (
              <span className="inline-flex items-center rounded-full bg-navy-50 px-2.5 py-1 text-xs font-medium text-navy-300">
                Required
              </span>
            )}
          </div>
        </div>

        {/* Rejection Message if Applicable */}
        {existingDoc?.rejectionReason && (
          <div className="mt-3 flex items-start gap-1.5 rounded-xl bg-coral-50/80 p-2.5 text-xs text-coral-600 border border-coral-100">
            <HiOutlineExclamationCircle size={16} className="shrink-0 mt-0.5" />
            <span>
              <strong className="font-semibold">Rejected:</strong>{" "}
              {existingDoc.rejectionReason}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons & File Drop Trigger */}
      <div className="mt-5 pt-3 border-t border-navy-50 flex flex-wrap items-center justify-between gap-2">
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-navy-50 px-3.5 py-2 text-xs font-semibold text-navy-600 transition-colors hover:bg-navy-100 active:scale-95">
          <HiOutlineUpload size={15} />{" "}
          {existingDoc ? "Replace File" : "Upload File"}
          <input
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>

        {existingDoc && (
          <div className="flex items-center gap-2">
            <a
              href={existingDoc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-navy-50 px-3 py-2 text-xs font-semibold text-navy-600 transition-colors hover:bg-navy-100 active:scale-95"
            >
              <HiOutlineEye size={15} /> Preview
            </a>
            <button
              type="button"
              onClick={() =>
                deleteMutation.mutate(existingDoc._id, {
                  onSuccess: () => toast.success("Document deleted"),
                })
              }
              disabled={deleteMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-coral-50 px-3 py-2 text-xs font-semibold text-coral transition-colors hover:bg-coral-100 active:scale-95 disabled:opacity-50"
            >
              <HiOutlineTrash size={15} /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Uploading Loading Overlay */}
      {uploadMutation.isPending && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/90 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-coral">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-coral border-t-transparent" />
            <span>Uploading {label}...</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const StudentDocumentsPage = () => {
  const { data: application, isLoading } = useMyApplication();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-coral border-t-transparent" />
        <p className="mt-3 text-sm font-medium text-navy-400">
          Loading your document checklist...
        </p>
      </div>
    );
  }

  const docByType = (type) =>
    application?.documents?.find((d) => d.type === type);

  return (
    <div className="max-w-5xl">
      {/* Title & Guidelines Header */}
      <div className="border-b border-navy-100 pb-5">
        <h2 className="font-heading text-xl font-bold tracking-tight text-navy-600 sm:text-2xl">
          Your Documents
        </h2>
        <p className="mt-1 text-sm text-navy-400">
          Drag and drop files into the designated slots below, or click to
          upload. Supported formats:{" "}
          <strong className="font-semibold text-navy-500">
            PDF, JPG, or PNG (up to 10MB)
          </strong>
          .
        </p>
      </div>

      {/* Responsive Document Slots Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {DOCUMENT_TYPES.map(([type, label]) => (
          <DocumentSlot
            key={type}
            type={type}
            label={label}
            existingDoc={docByType(type)}
          />
        ))}
      </div>
    </div>
  );
};

export default StudentDocumentsPage;
