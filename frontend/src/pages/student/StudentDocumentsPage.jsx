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
                  <HiCheckCircle size={14} />
                  Verified
                </span>
              ) : existingDoc.rejectionReason ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 border border-red-200/50">
                  <HiOutlineExclamationCircle size={14} />
                  Rejected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600 border border-amber-200/50">
                  <HiOutlineClock size={14} />
                  Pending Review
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
      <div className="mx-auto max-w-2xl space-y-4 py-8">
        <div className="flex items-center justify-between pb-2">
          <div className="h-5 w-48 animate-pulse rounded-lg bg-navy-100" />
          <div className="h-4 w-20 animate-pulse rounded bg-navy-50" />
        </div>

        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="animate-pulse flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3 w-3/4">
              <div className="h-8 w-8 rounded-xl bg-coral/10 shrink-0" />
              <div className="space-y-1.5 w-full">
                <div className="h-4 w-1/2 rounded bg-navy-100" />
                <div className="h-3 w-1/3 rounded bg-navy-50" />
              </div>
            </div>
            <div className="h-7 w-20 rounded-lg bg-navy-100 shrink-0" />
          </div>
        ))}
      </div>
    );
  }
  const docByType = (type) =>
    application?.documents?.find((d) => d.type === type);
  const requiredDocuments = application?.requiredDocuments || [];

  const isDocumentsRequired =
    application?.currentStage === "documents_required";
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
      {/* Required Documents From Counsellor */}
      {isDocumentsRequired && (
        <div className="mt-6 rounded-2xl border border-coral/20 bg-coral-50/40 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-coral text-white">
              <HiOutlineExclamationCircle size={21} />
            </div>

            <div>
              <h3 className="font-heading text-sm font-bold text-navy-600">
                Documents Required
              </h3>

              <p className="mt-1 text-xs leading-relaxed text-navy-400">
                Your counsellor has requested the following documents. Please
                upload all required documents to continue your application.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {requiredDocuments.map((document) => {
              const uploadedDocument = docByType(document.type);

              return (
                <div
                  key={document._id || document.type}
                  className="rounded-xl border border-navy-100 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          uploadedDocument?.verified
                            ? "bg-green-50 text-green-600"
                            : uploadedDocument
                              ? "bg-amber-50 text-amber-600"
                              : "bg-navy-50 text-navy-400"
                        }`}
                      >
                        {uploadedDocument?.verified ? (
                          <HiCheckCircle size={19} />
                        ) : (
                          <HiOutlineDocumentText size={19} />
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-navy-600">
                          {document.label}
                        </p>

                        {document.instructions && (
                          <p className="mt-1 text-xs leading-relaxed text-navy-400">
                            {document.instructions}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        uploadedDocument?.verified
                          ? "bg-green-50 text-green-600"
                          : uploadedDocument
                            ? "bg-amber-50 text-amber-600"
                            : "bg-red-50 text-red-500"
                      }`}
                    >
                      {uploadedDocument?.verified
                        ? "Verified"
                        : uploadedDocument
                          ? "Uploaded"
                          : "Required"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload Requested Documents */}
      <div className="mt-6">
        <h3 className="font-heading text-base font-bold text-navy-600">
          Upload Documents
        </h3>

        <p className="mt-1 text-xs text-navy-400">
          Upload the documents requested by your counsellor below.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {(isDocumentsRequired
          ? requiredDocuments
          : DOCUMENT_TYPES.map(([type, label]) => ({
              type,
              label,
            }))
        ).map((document) => (
          <DocumentSlot
            key={document.type}
            type={document.type}
            label={document.label}
            existingDoc={docByType(document.type)}
          />
        ))}
      </div>
    </div>
  );
};

export default StudentDocumentsPage;
