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
} from "react-icons/hi";
import {
  useAdminApplications,
  useUpdateApplicationStage,
} from "../../hooks/useAdminApplications";
import api from "../../lib/api";

const STAGES = [
  "application_submitted",
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

const label = (s) =>
  s ? s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—";

const AdminApplicationsPage = () => {
  const [stageFilter, setStageFilter] = useState("");
  const [selectedApp, setSelectedApp] = useState(null); // For viewing app details modal
  const [stageUpdateModal, setStageUpdateModal] = useState(null); // For custom stage update modal
  const [counsellorRemark, setCounsellorRemark] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const { data, isLoading, refetch } = useAdminApplications({
    stage: stageFilter || undefined,
  });
  const updateStage = useUpdateApplicationStage();

  const applications = data?.applications || [];

  // Initiate stage change modal
  const openStageModal = (appId, newStage) => {
    setStageUpdateModal({ appId, newStage });
    setCounsellorRemark("");
  };

  // Submit stage update
  const confirmStageChange = () => {
    if (!stageUpdateModal) return;

    updateStage.mutate(
      {
        id: stageUpdateModal.appId,
        stage: stageUpdateModal.newStage,
        counsellorRemark: counsellorRemark || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Application stage updated");
          setStageUpdateModal(null);
          setCounsellorRemark("");
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Failed to update stage"),
      },
    );
  };

  // Delete Application handler
  const handleDelete = async (id) => {
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
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-bold text-navy-600">
            Student Applications
          </h2>
          <p className="text-xs text-navy-400">
            Manage student admission lifecycles and stage progressions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <HiOutlineFilter className="text-navy-400" size={18} />
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-xs font-medium text-navy-600 focus:border-coral focus:outline-none"
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

      {/* Applications Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-navy-50 text-left text-xs uppercase text-navy-400">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">University</th>
              <th className="px-4 py-3">Current Stage</th>
              <th className="px-4 py-3">Advance To</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-50">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-navy-400">
                  Loading applications...
                </td>
              </tr>
            )}
            {!isLoading && applications.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-navy-400">
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
                  {app.interestedCountry?.name || "—"}
                </td>
                <td className="px-4 py-3 text-navy-600">
                  {app.targetUniversity?.name || "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-block rounded-full bg-coral-50 px-3 py-1 text-xs font-semibold text-coral">
                    {label(app.currentStage)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        openStageModal(app._id, e.target.value);
                        e.target.value = "";
                      }
                    }}
                    className="rounded-lg border border-navy-100 bg-white px-2 py-1 text-xs text-navy-600 focus:border-coral focus:outline-none"
                  >
                    <option value="" disabled>
                      Select stage...
                    </option>
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

      {/* VIEW APPLICATION DETAILS MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-navy-50 pb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-navy-600">
                  Application Details
                </h3>
                <p className="text-xs text-navy-400">ID: {selectedApp._id}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="rounded-lg p-1 text-navy-400 hover:bg-navy-50 hover:text-navy-600"
              >
                <HiOutlineX size={20} />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Student Info Card */}
              <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-white p-2 text-coral shadow-sm">
                    <HiOutlineUser size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-navy-400">
                      Student Info
                    </p>
                    <p className="text-sm font-bold text-navy-600">
                      {selectedApp.student?.name || "N/A"}
                    </p>
                    <p className="text-xs text-navy-500">
                      {selectedApp.student?.email}
                    </p>
                    <p className="text-xs text-navy-500">
                      Phone: {selectedApp.student?.phone || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-white p-2 text-coral shadow-sm">
                    <HiOutlineGlobe size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-navy-400">
                      Target Country & Counsellor
                    </p>
                    <p className="text-sm font-bold text-navy-600">
                      {selectedApp.interestedCountry?.name || "Not Specified"}
                    </p>
                    <p className="text-xs text-navy-500">
                      Counsellor:{" "}
                      {selectedApp.assignedCounsellor?.name || "Unassigned"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:col-span-2">
                  <div className="rounded-lg bg-white p-2 text-coral shadow-sm">
                    <HiOutlineAcademicCap size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-navy-400">
                      Target University
                    </p>
                    <p className="text-sm font-bold text-navy-600">
                      {selectedApp.targetUniversity?.name || "Not Specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Timeline */}
              <div>
                <h4 className="font-heading text-sm font-bold text-navy-600">
                  Stage Timeline History
                </h4>

                <div className="mt-4 space-y-3">
                  {selectedApp.stageHistory &&
                  selectedApp.stageHistory.length > 0 ? (
                    selectedApp.stageHistory.map((history, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 rounded-xl border border-navy-50 bg-white p-3 text-xs"
                      >
                        <HiOutlineCheckCircle
                          size={18}
                          className="mt-0.5 text-coral shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-navy-600">
                              {label(history.stage)}
                            </p>
                            <span className="text-[10px] text-navy-400">
                              {history.updatedAt
                                ? new Date(history.updatedAt).toLocaleString()
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
                    <p className="text-xs text-navy-400">
                      Current Stage:{" "}
                      <span className="font-semibold text-navy-600">
                        {label(selectedApp.currentStage)}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t border-navy-50 pt-4">
              <button
                onClick={() => setSelectedApp(null)}
                className="rounded-lg bg-navy-50 px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-navy-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE STAGE & REMARK MODAL */}
      {stageUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-heading text-base font-bold text-navy-600">
              Update Application Stage
            </h3>
            <p className="mt-1 text-xs text-navy-400">
              Advancing to{" "}
              <span className="font-bold text-coral">
                {label(stageUpdateModal.newStage)}
              </span>
            </p>

            <div className="mt-4 space-y-2">
              <label className="text-xs font-semibold text-navy-600">
                Counsellor Remark (Optional)
              </label>
              <textarea
                rows={3}
                value={counsellorRemark}
                onChange={(e) => setCounsellorRemark(e.target.value)}
                placeholder="Enter progress remarks or notes for the student..."
                className="w-full rounded-lg border border-navy-100 p-3 text-xs focus:border-coral focus:outline-none"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setStageUpdateModal(null)}
                className="rounded-lg border border-navy-100 px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-navy-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmStageChange}
                disabled={updateStage.isPending}
                className="rounded-lg bg-coral px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
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
                className="rounded-lg border border-navy-100 px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-navy-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
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

export default AdminApplicationsPage;
