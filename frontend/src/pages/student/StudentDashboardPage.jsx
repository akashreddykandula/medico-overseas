import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiCheckCircle,
  HiUserGroup,
  HiCalendar,
  HiFlag,
  HiChatAlt2,
  HiOutlineDocumentText,
  HiOutlineArrowRight,
  HiSparkles,
} from "react-icons/hi";
import { useMyApplication } from "../../hooks/useApplication";

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

const label = (stage) =>
  stage.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const StudentDashboardPage = () => {
  const navigate = useNavigate();
  const { data: application, isLoading } = useMyApplication();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-coral border-t-transparent" />
          <p className="text-xs font-semibold text-navy-400">
            Loading your application...
          </p>
        </div>
      </div>
    );
  }

  // No application exists
  if (!application) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm sm:p-12"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-coral-50 text-coral">
            <HiOutlineDocumentText size={32} />
          </div>

          <h2 className="mt-5 font-heading text-2xl font-bold tracking-tight text-navy-600">
            Start Your Application
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-navy-400">
            You don't currently have an active application. Start your
            application to begin your MBBS admission journey with Medico
            Overseas.
          </p>

          <button
            type="button"
            onClick={() => navigate("/portal/apply")}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-coral px-6 py-3 text-sm font-semibold text-white shadow-md shadow-coral/20 transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-lg active:scale-95"
          >
            <span>Start Application</span>
            <HiOutlineArrowRight size={16} />
          </button>
        </motion.div>
      </div>
    );
  }

  const currentIndex = STAGES.indexOf(
    application.currentStage || "application_submitted",
  );

  const lastHistoryEntry =
    application.stageHistory?.[application.stageHistory.length - 1];

  const progressPercent = Math.round(
    ((currentIndex + 1) / STAGES.length) * 100,
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-2 sm:p-4 font-sans">
      {/* Main Grid: Left Overview & Right Side Progress */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* LEFT COLUMN: Overview Metrics, Counsellor Remark, & Progress Card (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Welcome & Progress Overview Banner */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl border border-navy-100 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-coral-50 px-3 py-1 text-xs font-bold text-coral border border-coral-100">
                <HiSparkles size={14} /> LIVE APPLICANT PORTAL
              </span>
            </div>

            <h1 className="mt-4 font-heading text-2xl font-bold tracking-tight text-navy-600 sm:text-3xl">
              MBBS Admission Journey
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-navy-400">
              Destination:{" "}
              <span className="font-semibold text-navy-600">
                {application.interestedCountry?.name || "MBBS Abroad"}
              </span>
            </p>

            {/* Main Progress Indicator Bar */}
            <div className="mt-6 pt-6 border-t border-navy-50">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-navy-400 uppercase tracking-wider">
                  Overall Completion
                </span>
                <span className="font-bold text-coral text-sm">
                  {progressPercent}%
                </span>
              </div>

              <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-navy-50 p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full bg-coral shadow-sm"
                />
              </div>
            </div>
          </motion.div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Current Stage */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:border-coral/20 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-navy-400">
                  Current Stage
                </p>
                <div className="rounded-xl bg-coral-50 p-2.5 text-coral">
                  <HiFlag size={18} />
                </div>
              </div>
              <p className="mt-3 font-heading text-base font-bold tracking-tight text-navy-600 sm:text-lg leading-tight">
                {label(application.currentStage || "application_submitted")}
              </p>
            </motion.div>

            {/* Assigned Counsellor */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:border-navy-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-navy-400">
                  Assigned Counsellor
                </p>
                <div className="rounded-xl bg-navy-50 p-2.5 text-navy-400">
                  <HiUserGroup size={18} />
                </div>
              </div>
              <p className="mt-3 font-heading text-base font-bold tracking-tight text-navy-600 sm:text-lg leading-tight truncate">
                {application.assignedCounsellor?.name || "Not assigned"}
              </p>
            </motion.div>

            {/* Est. Completion */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:border-navy-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-navy-400">
                  Est. Completion
                </p>
                <div className="rounded-xl bg-navy-50 p-2.5 text-navy-400">
                  <HiCalendar size={18} />
                </div>
              </div>
              <p className="mt-3 font-heading text-base font-bold tracking-tight text-navy-600 sm:text-lg leading-tight">
                {lastHistoryEntry?.estimatedCompletionDate
                  ? new Date(
                      lastHistoryEntry.estimatedCompletionDate,
                    ).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}
              </p>
            </motion.div>
          </div>

          {/* Counsellor Remark Callout */}
          {lastHistoryEntry?.counsellorRemark && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl border border-coral-100 bg-coral-50/70 p-5 shadow-sm backdrop-blur-sm"
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 rounded-xl bg-white p-2.5 text-coral shadow-sm shrink-0">
                  <HiChatAlt2 size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-coral">
                    Counsellor Remark
                  </p>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-navy-600">
                    "{lastHistoryEntry.counsellorRemark}"
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* RIGHT COLUMN: SIDE PROGRESS TIMELINE (5 cols) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
        >
          <div className="border-b border-navy-50 pb-4">
            <h2 className="font-heading text-lg font-bold tracking-tight text-navy-600">
              Application Stages
            </h2>
            <p className="text-xs text-navy-400 mt-0.5">
              Side progress tracker of your 12 admission steps
            </p>
          </div>

          {/* Vertical Connected Timeline */}
          <div className="relative mt-6 pl-1">
            {/* Connected Vertical Line */}
            <div className="absolute bottom-5 left-[17px] top-5 w-[2px] bg-navy-100/70" />

            <div className="space-y-4">
              {STAGES.map((stage, i) => {
                const isDone = i <= currentIndex;
                const isCurrent = i === currentIndex;

                return (
                  <div
                    key={stage}
                    className="relative flex items-center gap-3.5 transition-colors duration-200"
                  >
                    {/* Step Icon Badge */}
                    <div
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                        isDone
                          ? "bg-coral text-white shadow-sm ring-4 ring-white"
                          : "bg-navy-50 text-navy-300 ring-4 ring-white"
                      }`}
                    >
                      {isDone ? <HiCheckCircle size={18} /> : i + 1}
                    </div>

                    {/* Step Name & Status Tag */}
                    <div
                      className={`flex flex-1 items-center justify-between rounded-xl px-3 py-2 transition-all duration-200 ${
                        isCurrent
                          ? "bg-coral-50/80 border border-coral-100"
                          : "hover:bg-slate-50/60"
                      }`}
                    >
                      <p
                        className={`text-xs sm:text-sm font-semibold transition-colors duration-200 ${
                          isCurrent
                            ? "text-coral font-bold"
                            : isDone
                              ? "text-navy-600"
                              : "text-navy-300"
                        }`}
                      >
                        {label(stage)}
                      </p>

                      {isCurrent && (
                        <span className="inline-flex items-center rounded-full bg-coral px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm animate-pulse">
                          Current
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboardPage;
