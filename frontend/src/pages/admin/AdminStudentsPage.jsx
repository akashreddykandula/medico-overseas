import React, { useState } from "react";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineEye,
  HiOutlineSearch,
  HiOutlineX,
  HiOutlineCalendar,
  HiOutlineAcademicCap,
  HiOutlineGlobe,
  HiOutlineShieldCheck,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import { useStudents } from "../../hooks/useStudents";

const AdminStudentsPage = () => {
  const { data: students = [], isLoading, isError } = useStudents();
  const [searchTerm, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Filter students based on search input
  const filteredStudents = students.filter((student) => {
    const term = searchTerm.toLowerCase();
    return (
      student.name?.toLowerCase().includes(term) ||
      student.email?.toLowerCase().includes(term) ||
      student.phone?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-navy-600 sm:text-2xl">
            Students
          </h2>
          <p className="mt-0.5 text-xs text-navy-400">
            View and manage registered students
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <HiOutlineSearch
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-300"
          />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-navy-100 bg-white py-2 pl-10 pr-4 text-xs text-navy-600 focus:border-coral focus:outline-none shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-300 hover:text-navy-600"
            >
              <HiOutlineX size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-navy-400">
              Total Students
            </p>
            <div className="rounded-xl bg-coral/10 p-2 text-coral">
              <HiOutlineUser size={18} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-navy-600">
            {students.length}
          </p>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy-50 text-xs uppercase text-navy-400">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Registered</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-navy-50">
            {isLoading && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-navy-400"
                >
                  Loading students...
                </td>
              </tr>
            )}

            {isError && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-red-500">
                  Failed to load students.
                </td>
              </tr>
            )}

            {!isLoading && !isError && filteredStudents.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-navy-400"
                >
                  No students found.
                </td>
              </tr>
            )}

            {filteredStudents.map((student) => (
              <tr
                key={student._id}
                className="transition-colors hover:bg-slate-50/60"
              >
                {/* Student */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-coral/10 text-coral font-bold">
                      {student.name?.[0]?.toUpperCase() || (
                        <HiOutlineUser size={20} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-navy-600">
                        {student.name || "N/A"}
                      </p>

                      <p className="text-xs text-navy-400">Student Account</p>
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2 text-navy-600">
                    <HiOutlineMail size={16} className="text-navy-300" />
                    <span>{student.email || "—"}</span>
                  </div>
                </td>

                {/* Phone */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2 text-navy-600">
                    <HiOutlinePhone size={16} className="text-navy-300" />
                    <span>{student.phone || "—"}</span>
                  </div>
                </td>

                {/* Date */}
                <td className="px-4 py-4 text-xs text-navy-400">
                  {student.createdAt
                    ? new Date(student.createdAt).toLocaleDateString()
                    : "—"}
                </td>

                {/* Actions */}
                <td className="px-4 py-4 text-right">
                  <button
                    onClick={() => setSelectedStudent(student)}
                    className="rounded-lg p-2 text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-600"
                    title="View Student"
                  >
                    <HiOutlineEye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VIEW STUDENT DETAILS MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-navy-50 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-coral/10 font-bold text-coral text-lg">
                  {selectedStudent.name?.[0]?.toUpperCase() || "S"}
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-navy-600">
                    {selectedStudent.name || "Student Profile"}
                  </h3>
                  <p className="text-xs text-navy-400">
                    ID: {selectedStudent._id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="rounded-lg p-1 text-navy-400 hover:bg-navy-50 hover:text-navy-600"
              >
                <HiOutlineX size={20} />
              </button>
            </div>

            {/* Student Profile Information */}
            <div className="mt-6 space-y-6">
              {/* Contact Info Card */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-navy-400">
                  Contact Details
                </h4>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
                  <div className="flex items-center gap-2.5 text-navy-600">
                    <div className="rounded-lg bg-white p-2 text-coral shadow-sm">
                      <HiOutlineMail size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-navy-400">Email Address</p>
                      <p className="font-semibold truncate">
                        {selectedStudent.email || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-navy-600">
                    <div className="rounded-lg bg-white p-2 text-coral shadow-sm">
                      <HiOutlinePhone size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-navy-400">Phone Number</p>
                      <p className="font-semibold">
                        {selectedStudent.phone || "Not Provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-navy-600 sm:col-span-2">
                    <div className="rounded-lg bg-white p-2 text-coral shadow-sm">
                      <HiOutlineCalendar size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-navy-400">
                        Registration Date
                      </p>
                      <p className="font-semibold">
                        {selectedStudent.createdAt
                          ? new Date(selectedStudent.createdAt).toLocaleString()
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information / Role */}
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-navy-600">
                    <HiOutlineShieldCheck
                      size={18}
                      className="text-emerald-500"
                    />
                    <span>
                      Account Role:{" "}
                      <strong className="capitalize">
                        {selectedStudent.role || "student"}
                      </strong>
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                    <HiOutlineCheckCircle size={13} /> Active Registered
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex justify-end border-t border-navy-50 pt-4">
              <button
                onClick={() => setSelectedStudent(null)}
                className="rounded-xl bg-navy-50 px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-navy-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudentsPage;
