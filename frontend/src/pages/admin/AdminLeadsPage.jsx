import React, { useState } from "react";
import toast from "react-hot-toast";
import { useCounsellors } from "../../hooks/useCounsellors";
import {
  HiDownload,
  HiOutlineDocumentReport,
  HiOutlineSearch,
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineGlobe,
  HiOutlineUserGroup,
} from "react-icons/hi";
import { useLeads, useUpdateLead } from "../../hooks/useLeads";
import api from "../../lib/api";

const STATUSES = [
  "new",
  "contacted",
  "interested",
  "follow_up",
  "converted",
  "rejected",
];

const STATUS_COLORS = {
  new: "bg-navy-50 text-navy-600 border border-navy-100",
  contacted: "bg-blue-50 text-blue-600 border border-blue-100",
  interested: "bg-amber-50 text-amber-600 border border-amber-100",
  follow_up: "bg-purple-50 text-purple-600 border border-purple-100",
  converted: "bg-green-50 text-green-600 border border-green-100",
  rejected: "bg-red-50 text-red-600 border border-red-100",
};

const AdminLeadsPage = () => {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // File Export Loading States
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const { data, isLoading, refetch } = useLeads({
    status: status || undefined,
    search: search || undefined,
    page,
    limit: 15,
  });
  const updateLead = useUpdateLead(refetch);

  const leads = data?.leads || [];
  const pagination = data?.pagination;

  const handleDeleteLead = async (id) => {
    try {
      await api.delete(`/leads/${id}`);
      toast.success("Lead deleted successfully");
      setDeleteConfirmId(null);
      if (selectedLead?._id === id) setSelectedLead(null);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete lead");
    }
  };

  // Export Excel File
  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      const response = await api.get("/admin/export/leads/excel", {
        responseType: "blob",
      });
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Leads_Report_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Excel report downloaded successfully");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to export Excel report",
      );
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Export PDF File
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const response = await api.get("/admin/export/leads/pdf", {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Leads_Report_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("PDF report downloaded successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to export PDF report");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const { data: counsellors = [] } = useCounsellors();

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-bold tracking-tight text-navy-600">
            Lead CRM
          </h2>
          <p className="mt-0.5 text-xs text-navy-400">
            Track and manage student inquiries and conversions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="flex items-center gap-1.5 rounded-xl border border-navy-100 bg-navy-50 px-3.5 py-2 text-xs font-semibold text-navy-600 shadow-sm transition-all hover:bg-navy-100 hover:text-navy-700 disabled:opacity-50"
          >
            {isExportingExcel ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-navy-600 border-t-transparent" />
            ) : (
              <HiDownload size={16} />
            )}
            <span>{isExportingExcel ? "Downloading..." : "Excel"}</span>
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 rounded-xl border border-navy-100 bg-navy-50 px-3.5 py-2 text-xs font-semibold text-navy-600 shadow-sm transition-all hover:bg-navy-100 hover:text-navy-700 disabled:opacity-50"
          >
            {isExportingPdf ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-navy-600 border-t-transparent" />
            ) : (
              <HiOutlineDocumentReport size={16} />
            )}
            <span>{isExportingPdf ? "Downloading..." : "PDF"}</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-navy-100 bg-white px-3.5 py-2 text-xs font-semibold text-navy-600 shadow-sm transition-all focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ").toUpperCase()}
            </option>
          ))}
        </select>

        <div className="relative flex-1 min-w-[240px]">
          <HiOutlineSearch
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-300"
            size={18}
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, phone, email..."
            className="w-full rounded-xl border border-navy-100 bg-white py-2 pl-10 pr-3.5 text-xs text-navy-600 shadow-sm transition-all focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
          />
        </div>
      </div>

      {/* Leads Data Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-100 bg-navy-50/70 font-bold uppercase tracking-wider text-navy-400">
            <tr>
              <th className="px-4 py-3.5">Name</th>
              <th className="px-4 py-3.5">Phone</th>
              <th className="px-4 py-3.5">Country</th>
              <th className="px-4 py-3.5">Source</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Counsellor</th>
              <th className="px-4 py-3.5">Date</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-50 font-medium text-navy-600">
            {isLoading && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-navy-400"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-coral border-t-transparent" />
                    <span>Loading leads...</span>
                  </div>
                </td>
              </tr>
            )}
            {!isLoading && leads.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-navy-400"
                >
                  No leads found.
                </td>
              </tr>
            )}
            {leads.map((lead) => (
              <tr
                key={lead._id}
                className="transition-colors hover:bg-slate-50/60"
              >
                <td className="px-4 py-3.5 font-bold text-navy-700">
                  <div className="max-w-[160px] truncate" title={lead.name}>
                    {lead.name}
                  </div>
                </td>
                <td className="px-4 py-3.5 font-mono text-navy-600">
                  {lead.phone}
                </td>
                <td className="px-4 py-3.5 text-navy-600">
                  <span className="inline-flex items-center rounded-md bg-navy-50 px-2 py-0.5 text-[11px] font-semibold text-navy-600">
                    {lead.interestedCountry?.name || "—"}
                  </span>
                </td>
                <td className="px-4 py-3.5 capitalize text-navy-500">
                  {lead.source ? lead.source.replace("_", " ") : "—"}
                </td>
                <td className="px-4 py-3.5">
                  <select
                    value={lead.status}
                    onChange={(e) =>
                      updateLead.mutate({
                        id: lead._id,
                        updates: { status: e.target.value },
                      })
                    }
                    className={`cursor-pointer rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider outline-none transition-all focus:ring-1 focus:ring-coral ${
                      STATUS_COLORS[lead.status] || "bg-navy-50 text-navy-600"
                    }`}
                  >
                    {STATUSES.map((s) => (
                      <option
                        key={s}
                        value={s}
                        className="bg-white text-navy-800"
                      >
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3.5">
                  <select
                    value={lead.assignedCounsellor?._id || ""}
                    onChange={(e) =>
                      updateLead.mutate({
                        id: lead._id,
                        updates: {
                          assignedCounsellor: e.target.value || null,
                        },
                      })
                    }
                    className="max-w-[140px] rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-navy-700 focus:border-coral focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {counsellors.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap text-xs text-navy-400">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setSelectedLead(lead)}
                      className="rounded-lg p-1.5 text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-600"
                      title="View Lead Details"
                    >
                      <HiOutlineEye size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(lead._id)}
                      className="rounded-lg p-1.5 text-coral transition-colors hover:bg-coral-50 hover:text-coral-700"
                      title="Delete Lead"
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

      {/* Pagination Controls */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-1.5 pt-2">
          {Array.from({ length: pagination.pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`h-8 w-8 rounded-xl text-xs font-bold transition-all ${
                page === i + 1
                  ? "bg-navy text-white shadow-sm scale-105"
                  : "bg-navy-50 text-navy-500 hover:bg-navy-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* VIEW LEAD DETAILS MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-navy-50 pb-3">
              <div>
                <h3 className="font-heading text-base font-bold text-navy-600">
                  Lead Details
                </h3>
                <p className="text-[10px] font-mono text-navy-400">
                  ID: {selectedLead._id}
                </p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="rounded-lg p-1 text-navy-400 hover:bg-navy-50 hover:text-navy-600"
              >
                <HiOutlineX size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-white p-2 text-coral shadow-sm">
                    <HiOutlineUser size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-navy-400">
                      Student Name
                    </p>
                    <p className="truncate text-xs font-bold text-navy-600">
                      {selectedLead.name || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-white p-2 text-coral shadow-sm">
                    <HiOutlinePhone size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-navy-400">
                      Phone
                    </p>
                    <p className="truncate text-xs font-bold text-navy-600 font-mono">
                      {selectedLead.phone || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-white p-2 text-coral shadow-sm">
                    <HiOutlineMail size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-navy-400">
                      Email
                    </p>
                    <p className="truncate text-xs font-bold text-navy-600">
                      {selectedLead.email || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-white p-2 text-coral shadow-sm">
                    <HiOutlineGlobe size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-navy-400">
                      Target Country
                    </p>
                    <p className="truncate text-xs font-bold text-navy-600">
                      {selectedLead.interestedCountry?.name || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:col-span-2">
                  <div className="rounded-xl bg-white p-2 text-coral shadow-sm">
                    <HiOutlineUserGroup size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-navy-400">
                      Assigned Counsellor
                    </p>
                    <p className="truncate text-xs font-bold text-navy-600">
                      {selectedLead.assignedCounsellor
                        ? `${selectedLead.assignedCounsellor.name} (${selectedLead.assignedCounsellor.email})`
                        : "Unassigned"}
                    </p>
                  </div>
                </div>
              </div>

              {selectedLead.notes && (
                <div className="rounded-2xl border border-navy-50 bg-white p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-navy-400">
                    Lead Notes
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    {selectedLead.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-navy-50 pt-3">
              <button
                onClick={() => setSelectedLead(null)}
                className="rounded-xl bg-navy-50 px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-navy-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="font-heading text-base font-bold text-navy-600">
              Delete Lead?
            </h3>
            <p className="text-xs leading-relaxed text-slate-600">
              Are you sure you want to delete this lead from the CRM? This
              action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-xl border border-navy-100 px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-navy-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteLead(deleteConfirmId)}
                className="rounded-xl bg-coral px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
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

export default AdminLeadsPage;
