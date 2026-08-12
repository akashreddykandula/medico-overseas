import React, { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineUpload,
  HiOutlineTrash,
  HiOutlineEye,
  HiCheckCircle,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineExclamationCircle,
  HiOutlineCloudUpload,
  HiOutlineInformationCircle,
  HiOutlineRefresh,
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
];

const DocumentSlot = ({ type, label, existingDoc }) => {
  const [dragOver, setDragOver] = useState(false);

  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();

  const [otherDocumentName, setOtherDocumentName] = useState(
    existingDoc?.documentName || "",
  );

  const [otherDocumentDescription, setOtherDocumentDescription] = useState(
    existingDoc?.description || "",
  );

  const handleFile = useCallback(
    (file) => {
      if (!file) return;

      // "Other" document requires a document name if not uploaded yet
      if (type === "other" && !existingDoc && !otherDocumentName.trim()) {
        toast.error("Please enter the document name first");
        return;
      }

      uploadMutation.mutate(
        {
          file,
          type,
          documentName:
            type === "other"
              ? otherDocumentName.trim() || existingDoc?.documentName
              : undefined,
          description:
            type === "other"
              ? otherDocumentDescription.trim() || existingDoc?.description
              : undefined,
        },
        {
          onSuccess: () => {
            toast.success(
              type === "other"
                ? `${otherDocumentName.trim() || label} uploaded`
                : `${label} ${existingDoc ? "replaced" : "uploaded"}`,
            );
            if (!existingDoc) {
              setOtherDocumentName("");
              setOtherDocumentDescription("");
            }
          },
          onError: (err) =>
            toast.error(err.response?.data?.message || "Upload failed"),
        },
      );
    },
    [
      type,
      label,
      existingDoc,
      uploadMutation,
      otherDocumentName,
      otherDocumentDescription,
    ],
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  // Display Name: Show custom document name if uploaded, else show prop label
  const displayLabel = existingDoc?.documentName || label;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 hover:shadow ${
        dragOver
          ? "border-coral bg-coral-50/40 shadow-md scale-[1.01]"
          : "border-navy-100 hover:border-navy-200"
      }`}
    >
      <div className="space-y-3">
        {/* Top Header: Document Label & Verification Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                existingDoc
                  ? existingDoc.verified
                    ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60"
                    : existingDoc.rejectionReason
                      ? "bg-rose-50 text-rose-600 ring-1 ring-rose-200/60"
                      : "bg-amber-50 text-amber-600 ring-1 ring-amber-200/60"
                  : "bg-navy-50 text-navy-400 ring-1 ring-navy-100 group-hover:bg-coral-50 group-hover:text-coral group-hover:ring-coral/20"
              }`}
            >
              <HiOutlineDocumentText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-heading text-sm font-semibold text-navy-700">
                {displayLabel}
              </p>
              <p className="text-[11px] font-medium text-navy-400">
                PDF, JPG, or PNG
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="shrink-0">
            {existingDoc ? (
              existingDoc.verified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                  <HiCheckCircle size={14} className="text-emerald-600" />
                  Verified
                </span>
              ) : existingDoc.rejectionReason ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/20">
                  <HiOutlineExclamationCircle
                    size={14}
                    className="text-rose-600"
                  />
                  Rejected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                  <HiOutlineClock size={14} className="text-amber-600" />
                  In Review
                </span>
              )
            ) : (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-navy-400 ring-1 ring-inset ring-slate-200">
                Required
              </span>
            )}
          </div>
        </div>

        {/* Rejection Message if Applicable */}
        {existingDoc?.rejectionReason && (
          <div className="flex items-start gap-2 rounded-xl bg-rose-50/80 p-3 text-xs text-rose-700 ring-1 ring-inset ring-rose-200">
            <HiOutlineExclamationCircle
              size={16}
              className="shrink-0 text-rose-600 mt-0.5"
            />
            <div className="leading-relaxed">
              <strong className="font-semibold">Reason for Rejection:</strong>{" "}
              {existingDoc.rejectionReason}
            </div>
          </div>
        )}

        {/* OTHER DOCUMENT DETAILS FORM (Only when creating a NEW "other" doc) */}
        {type === "other" && !existingDoc && (
          <div className="space-y-3 pt-1">
            <div>
              <label className="mb-1 block text-xs font-medium text-navy-700">
                Document Name <span className="text-coral">*</span>
              </label>
              <input
                type="text"
                disabled={uploadMutation.isPending}
                value={otherDocumentName}
                onChange={(e) => setOtherDocumentName(e.target.value)}
                placeholder="e.g. Transfer Certificate"
                className="w-full rounded-xl border border-navy-100 bg-white px-3 py-2 text-xs text-navy-700 placeholder-navy-300 outline-none transition-all focus:border-coral focus:ring-2 focus:ring-coral/20 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-navy-700">
                Description / Note{" "}
                <span className="text-[10px] text-navy-400">(Optional)</span>
              </label>
              <textarea
                disabled={uploadMutation.isPending}
                value={otherDocumentDescription}
                onChange={(e) => setOtherDocumentDescription(e.target.value)}
                rows={2}
                placeholder="Tell your counsellor what this document is..."
                className="w-full resize-none rounded-xl border border-navy-100 bg-white px-3 py-2 text-xs text-navy-700 placeholder-navy-300 outline-none transition-all focus:border-coral focus:ring-2 focus:ring-coral/20 disabled:bg-slate-50"
              />
            </div>
          </div>
        )}

        {/* DISPLAY DESCRIPTION FOR UPLOADED OTHER DOCUMENTS */}
        {type === "other" && existingDoc?.description && (
          <div className="rounded-xl bg-slate-50 p-2.5 text-xs text-navy-600">
            <p className="font-medium text-[11px] text-navy-400">Note:</p>
            <p className="break-words mt-0.5">{existingDoc.description}</p>
          </div>
        )}
      </div>

      {/* Action Buttons & File Drop Trigger */}
      <div className="mt-5 border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-2">
        <label
          className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
            uploadMutation.isPending || deleteMutation.isPending
              ? "pointer-events-none opacity-50 bg-navy-50 text-navy-400"
              : "cursor-pointer bg-navy-50/80 text-navy-700 hover:bg-coral-50 hover:text-coral active:scale-95"
          }`}
        >
          {existingDoc ? (
            <HiOutlineRefresh size={15} />
          ) : (
            <HiOutlineUpload size={15} />
          )}
          <span>{existingDoc ? "Replace File" : "Upload File"}</span>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            disabled={uploadMutation.isPending || deleteMutation.isPending}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>

        {existingDoc && (
          <div className="flex items-center gap-1.5">
            <a
              href={existingDoc.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-navy-700 transition-all hover:bg-slate-200 active:scale-95 ${
                uploadMutation.isPending || deleteMutation.isPending
                  ? "pointer-events-none opacity-50"
                  : ""
              }`}
            >
              <HiOutlineEye size={15} />
              <span>Preview</span>
            </a>
            <button
              type="button"
              onClick={() =>
                deleteMutation.mutate(existingDoc._id, {
                  onSuccess: () => toast.success("Document deleted"),
                })
              }
              disabled={deleteMutation.isPending || uploadMutation.isPending}
              className="inline-flex items-center justify-center min-w-[36px] min-h-[36px] rounded-xl bg-rose-50 px-2 py-2 text-xs font-semibold text-rose-600 transition-all hover:bg-rose-100 active:scale-95 disabled:opacity-50"
              title="Delete Document"
            >
              {deleteMutation.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
              ) : (
                <HiOutlineTrash size={15} />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Uploading / Updating Loading Overlay */}
      <AnimatePresence>
        {uploadMutation.isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-white/95 backdrop-blur-xs p-4 text-center"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-coral border-t-transparent" />
              <span className="text-xs font-semibold text-navy-700">
                {existingDoc
                  ? "Replacing document..."
                  : type === "other"
                    ? "Uploading document..."
                    : `Uploading ${label}...`}
              </span>
              <p className="text-[11px] text-navy-400">Please wait a moment</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const StudentDocumentsPage = () => {
  const { data: application, isLoading } = useMyApplication();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 py-6">
        <div className="space-y-2 border-b border-navy-100 pb-5">
          <div className="h-7 w-48 animate-pulse rounded-lg bg-navy-100" />
          <div className="h-4 w-96 animate-pulse rounded-md bg-navy-50" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-navy-100 bg-white p-5 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 w-3/4">
                  <div className="h-10 w-10 rounded-xl bg-navy-50 shrink-0" />
                  <div className="space-y-1.5 w-full">
                    <div className="h-4 w-2/3 rounded bg-navy-100" />
                    <div className="h-3 w-1/3 rounded bg-navy-50" />
                  </div>
                </div>
                <div className="h-6 w-16 rounded-full bg-navy-50 shrink-0" />
              </div>
              <div className="h-9 w-full rounded-xl bg-navy-50/60 pt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const docByType = (type) => {
    if (type === "other") return undefined;
    return application?.documents?.find((d) => d.type === type);
  };

  const otherDocuments =
    application?.documents?.filter((d) => d.type === "other") || [];
  const requiredDocuments = application?.requiredDocuments || [];
  const isDocumentsRequired =
    application?.currentStage === "documents_required";

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      {/* Title & Guidelines Header */}
      <div className="border-b border-slate-200/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral/10 text-coral">
            <HiOutlineCloudUpload size={24} />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold tracking-tight text-navy-800">
              Your Documents
            </h2>
            <p className="mt-0.5 text-xs text-navy-400 sm:text-sm">
              Drag and drop files into the designated slots below, or click to
              upload.
            </p>
          </div>
        </div>

        <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-100/80 px-3.5 py-2 text-xs font-medium text-navy-600">
          <HiOutlineInformationCircle
            size={16}
            className="text-navy-400 shrink-0"
          />
          <span>
            Accepted formats:{" "}
            <strong className="font-semibold text-navy-800">
              PDF, JPG, or PNG (Up to 10MB)
            </strong>
          </span>
        </div>
      </div>

      {/* Required Documents From Counsellor Warning Box */}
      {isDocumentsRequired && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-coral/30 bg-gradient-to-r from-coral-50/60 to-orange-50/40 p-5 shadow-sm"
        >
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-coral text-white shadow-sm">
              <HiOutlineExclamationCircle size={22} />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-navy-800">
                Action Required: Outstanding Documents
              </h3>
              <p className="mt-1 text-xs text-navy-500 leading-relaxed">
                Your counsellor has requested specific documents. Please fulfill
                the requirements below to avoid delays in your application
                process.
              </p>
            </div>
          </div>

          <div className="mt-4 divide-y divide-coral-100/60 rounded-xl border border-coral-200/50 bg-white/80 backdrop-blur-sm overflow-hidden">
            {requiredDocuments.map((document) => {
              const uploadedDocument = docByType(document.type);

              return (
                <div
                  key={document._id || document.type}
                  className="p-3.5 transition-colors hover:bg-white"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          uploadedDocument?.verified
                            ? "bg-emerald-100 text-emerald-700"
                            : uploadedDocument
                              ? "bg-amber-100 text-amber-700"
                              : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {uploadedDocument?.verified ? (
                          <HiCheckCircle size={18} />
                        ) : (
                          <HiOutlineDocumentText size={18} />
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-navy-800">
                          {document.label}
                        </p>
                        {document.instructions && (
                          <p className="mt-0.5 text-[11px] text-navy-500">
                            {document.instructions}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        uploadedDocument?.verified
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                          : uploadedDocument
                            ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                            : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
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
        </motion.div>
      )}

      {/* Primary Documents Grid */}
      <div>
        <div className="mb-4">
          <h3 className="font-heading text-base font-bold text-navy-800">
            Upload Documents
          </h3>
          <p className="text-xs text-navy-400">
            Upload required application documents or add custom files.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
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

          {/* New Custom Document Slot */}
          {(!isDocumentsRequired ||
            !requiredDocuments.some(
              (document) => document.type === "other",
            )) && (
            <DocumentSlot
              type="other"
              label="Other Document"
              existingDoc={undefined}
            />
          )}
        </div>
      </div>

      {/* Uploaded Custom/Other Documents Section */}
      {otherDocuments.length > 0 && (
        <div className="pt-2">
          <div className="mb-4">
            <h3 className="font-heading text-base font-bold text-navy-800">
              Additional Uploaded Documents
            </h3>
            <p className="text-xs text-navy-400">
              Supplementary files attached to your profile.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {otherDocuments.map((document) => (
              <DocumentSlot
                key={document._id}
                type="other"
                label={document.documentName || "Other Document"}
                existingDoc={document}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDocumentsPage;
