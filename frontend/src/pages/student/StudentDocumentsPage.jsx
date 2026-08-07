import React, { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineUpload, HiOutlineTrash, HiOutlineEye, HiCheckCircle, HiOutlineClock } from 'react-icons/hi';
import { useMyApplication, useUploadDocument, useDeleteDocument } from '../../hooks/useApplication';

const DOCUMENT_TYPES = [
  ['passport', 'Passport'],
  ['aadhaar', 'Aadhaar Card'],
  ['pan', 'PAN Card'],
  ['10th_memo', '10th Memo'],
  ['12th_memo', '12th Memo'],
  ['neet_scorecard', 'NEET Scorecard'],
  ['passport_photo', 'Passport Photo'],
  ['medical_certificate', 'Medical Certificate'],
  ['offer_letter', 'Offer Letter'],
  ['visa_documents', 'Visa Documents'],
  ['other', 'Other'],
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
          onSuccess: () => toast.success(`${label} ${existingDoc ? 'replaced' : 'uploaded'}`),
          onError: (err) => toast.error(err.response?.data?.message || 'Upload failed'),
        }
      );
    },
    [type, label, existingDoc, uploadMutation]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`rounded-2xl border-2 border-dashed p-5 transition-colors ${
        dragOver ? 'border-coral bg-coral-50' : 'border-navy-100 bg-white'
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="font-medium text-navy-600">{label}</p>
        {existingDoc ? (
          existingDoc.verified ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
              <HiCheckCircle /> Verified
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
              <HiOutlineClock /> Pending Review
            </span>
          )
        ) : (
          <span className="text-xs font-medium text-navy-300">Not uploaded</span>
        )}
      </div>

      {existingDoc?.rejectionReason && (
        <p className="mt-1 text-xs text-coral-600">Rejected: {existingDoc.rejectionReason}</p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-navy-50 px-3 py-2 text-xs font-semibold text-navy-600 hover:bg-navy-100">
          <HiOutlineUpload /> {existingDoc ? 'Replace' : 'Upload'}
          <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => handleFile(e.target.files?.[0])} />
        </label>

        {existingDoc && (
          <>
            <a href={existingDoc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg bg-navy-50 px-3 py-2 text-xs font-semibold text-navy-600 hover:bg-navy-100">
              <HiOutlineEye /> Preview
            </a>
            <button
              onClick={() => deleteMutation.mutate(existingDoc._id, { onSuccess: () => toast.success('Document deleted') })}
              className="flex items-center gap-1 rounded-lg bg-coral-50 px-3 py-2 text-xs font-semibold text-coral hover:bg-coral-100"
            >
              <HiOutlineTrash /> Delete
            </button>
          </>
        )}
      </div>

      {uploadMutation.isPending && <p className="mt-2 text-xs text-navy-300">Uploading...</p>}
    </div>
  );
};

const StudentDocumentsPage = () => {
  const { data: application, isLoading } = useMyApplication();

  if (isLoading) return <p className="text-navy-400">Loading documents...</p>;

  const docByType = (type) => application?.documents?.find((d) => d.type === type);

  return (
    <div>
      <h2 className="font-heading text-lg font-bold text-navy-600">Your Documents</h2>
      <p className="mt-1 text-sm text-navy-400">Drag and drop files, or click to upload. PDF, JPG, or PNG up to 10MB.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {DOCUMENT_TYPES.map(([type, label]) => (
          <DocumentSlot key={type} type={type} label={label} existingDoc={docByType(type)} />
        ))}
      </div>
    </div>
  );
};

export default StudentDocumentsPage;
