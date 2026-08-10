import React from "react";
import { useSelector } from "react-redux";

const StudentProfilePage = () => {
  const { user } = useSelector((s) => s.auth);

  // Generate initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "S";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="mx-auto max-w-lg overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100">
      {/* Header Banner & Title */}
      <div className="border-b border-slate-100 bg-slate-50/50 p-6 pb-5">
        <div className="flex items-center space-x-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy-600 font-heading text-lg font-bold text-white shadow-sm">
            {getInitials(user?.name)}
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-navy-600">
              Your Profile
            </h2>
            <p className="text-xs font-medium text-navy-400">
              Student Account Information
            </p>
          </div>
        </div>
      </div>

      {/* Main Profile Info Section */}
      <div className="p-6">
        <div className="space-y-4">
          {/* Full Name Field */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/30 p-3.5 transition-colors hover:bg-slate-50/80">
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">
              Full Name
            </p>
            <p className="mt-1 font-medium text-navy-600">
              {user?.name || "—"}
            </p>
          </div>

          {/* Email Field */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/30 p-3.5 transition-colors hover:bg-slate-50/80">
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">
              Email Address
            </p>
            <p className="mt-1 font-medium text-navy-600">
              {user?.email || "—"}
            </p>
          </div>

          {/* Phone Field */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/30 p-3.5 transition-colors hover:bg-slate-50/80">
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">
              Phone Number
            </p>
            <p className="mt-1 font-medium text-navy-600">
              {user?.phone || "—"}
            </p>
          </div>
        </div>

        {/* Developer / Info Note Banner */}
        <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-3.5 text-center">
          <p className="text-xs leading-relaxed text-navy-300">
            Profile editing (NEET score, address, DOB) can be wired to{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] font-mono text-navy-400">
              PATCH /api/users/me
            </code>{" "}
            — add that endpoint when ready.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
