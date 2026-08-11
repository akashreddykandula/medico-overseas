import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineUser,
} from "react-icons/hi";
import { useCounsellors } from "../../hooks/useCounsellors";
import api from "../../lib/api";
import { useQueryClient } from "@tanstack/react-query";

const AdminCounsellorsPage = () => {
  const { data: counsellors = [], isLoading } = useCounsellors();
  const queryClient = useQueryClient();

  // Modal & Form States
  const [showModal, setShowModal] = useState(false);
  const [editingCounsellor, setEditingCounsellor] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setEditingCounsellor(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = (counsellor) => {
    setEditingCounsellor(counsellor);
    setName(counsellor.name || "");
    setEmail(counsellor.email || "");
    setPhone(counsellor.phone || "");
    setPassword(""); // Leave blank unless updating
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingCounsellor) {
        // Edit Mode
        const payload = { name, email, phone };
        if (password) payload.password = password;

        await api.put(`/admin/counsellors/${editingCounsellor._id}`, payload);
        toast.success("Counsellor updated successfully");
      } else {
        // Create Mode
        await api.post("/admin/counsellors", {
          name,
          email,
          phone,
          password,
        });
        toast.success("Counsellor created successfully");
      }

      queryClient.invalidateQueries({
        queryKey: ["counsellors"],
      });

      setShowModal(false);
      resetForm();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          `Failed to ${editingCounsellor ? "update" : "create"} counsellor`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCounsellor = async (id) => {
    try {
      await api.delete(`/admin/counsellors/${id}`);
      toast.success("Counsellor deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["counsellors"],
      });
      setDeleteConfirmId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete counsellor");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-bold text-navy-600 sm:text-2xl">
            Counsellors
          </h1>
          <p className="text-xs text-navy-400">
            Manage student advisors and assignment access
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 rounded-lg bg-coral px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
        >
          <HiOutlinePlus size={16} /> Add Counsellor
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-navy-50 text-left text-xs uppercase text-navy-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-navy-50">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="p-0">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between border-b border-navy-50 px-4 py-3.5 animate-pulse"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-navy-100 shrink-0" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-32 rounded bg-navy-100" />
                          <div className="h-2.5 w-20 rounded bg-navy-50" />
                        </div>
                      </div>
                      <div className="h-3.5 w-28 rounded bg-navy-50 hidden sm:block" />
                      <div className="h-5 w-16 rounded-full bg-coral/15" />
                      <div className="h-7 w-16 rounded-lg bg-navy-100" />
                    </div>
                  ))}
                </td>
              </tr>
            ) : counsellors.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-navy-400">
                  No counsellors found.
                </td>
              </tr>
            ) : (
              counsellors.map((c) => (
                <tr
                  key={c._id}
                  className="transition-colors hover:bg-slate-50/50"
                >
                  <td className="px-4 py-3 font-semibold text-navy-600">
                    {c.name}
                  </td>
                  <td className="px-4 py-3 text-navy-600">{c.email}</td>
                  <td className="px-4 py-3 text-navy-600">{c.phone || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEditModal(c)}
                        className="rounded-md p-1.5 text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-600"
                        title="Edit Counsellor"
                      >
                        <HiOutlinePencil size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(c._id)}
                        className="rounded-md p-1.5 text-coral transition-colors hover:bg-coral-50 hover:text-coral-700"
                        title="Delete Counsellor"
                      >
                        <HiOutlineTrash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-navy-50 pb-4">
              <h2 className="font-heading text-base font-bold text-navy-600">
                {editingCounsellor ? "Edit Counsellor" : "Add New Counsellor"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="rounded-lg p-1 text-navy-400 hover:bg-navy-50 hover:text-navy-600"
              >
                <HiOutlineX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div className="relative flex items-center">
                <HiOutlineUser
                  className="absolute left-3 text-navy-400"
                  size={18}
                />
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full rounded-lg border border-navy-100 pl-10 pr-3 py-2 text-sm focus:border-coral focus:outline-none"
                />
              </div>

              <div className="relative flex items-center">
                <HiOutlineMail
                  className="absolute left-3 text-navy-400"
                  size={18}
                />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full rounded-lg border border-navy-100 pl-10 pr-3 py-2 text-sm focus:border-coral focus:outline-none"
                />
              </div>

              <div className="relative flex items-center">
                <HiOutlinePhone
                  className="absolute left-3 text-navy-400"
                  size={18}
                />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="w-full rounded-lg border border-navy-100 pl-10 pr-3 py-2 text-sm focus:border-coral focus:outline-none"
                />
              </div>

              <input
                type="password"
                value={password}
                required={!editingCounsellor}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  editingCounsellor
                    ? "New Password (leave blank to keep current)"
                    : "Password"
                }
                className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-coral focus:outline-none"
              />

              <div className="mt-6 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="rounded-lg border border-navy-100 px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-navy-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-coral px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingCounsellor
                      ? "Update Counsellor"
                      : "Create Counsellor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-heading text-base font-bold text-navy-600">
              Delete Counsellor?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Are you sure you want to delete this counsellor? Their assigned
              leads and applications will become unassigned.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-lg border border-navy-100 px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-navy-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCounsellor(deleteConfirmId)}
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

export default AdminCounsellorsPage;
