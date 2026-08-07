import React from "react";
import {
  HiCheckCircle,
  HiUserGroup,
  HiCalendar,
  HiFlag,
  HiChatAlt2,
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
  const { data: application, isLoading } = useMyApplication();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="animate-pulse text-sm font-medium text-navy-400">
          Loading your application...
        </p>
      </div>
    );
  }

  const currentIndex = STAGES.indexOf(
    application?.currentStage || "application_submitted",
  );
  const lastHistoryEntry =
    application?.stageHistory?.[application.stageHistory.length - 1];
  const progressPercent = Math.round(
    ((currentIndex + 1) / STAGES.length) * 100,
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-2 sm:p-4">
      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">
              Current Stage
            </p>
            <div className="rounded-lg bg-coral-50 p-2 text-coral">
              <HiFlag size={18} />
            </div>
          </div>
          <p className="mt-2 font-heading text-xl font-bold tracking-tight text-navy-600">
            {label(application?.currentStage || "application_submitted")}
          </p>
        </div>

        <div className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">
              Assigned Counsellor
            </p>
            <div className="rounded-lg bg-navy-50 p-2 text-navy-400">
              <HiUserGroup size={18} />
            </div>
          </div>
          <p className="mt-2 font-heading text-xl font-bold tracking-tight text-navy-600">
            {application?.assignedCounsellor?.name || "Not yet assigned"}
          </p>
        </div>

        <div className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">
              Est. Completion
            </p>
            <div className="rounded-lg bg-navy-50 p-2 text-navy-400">
              <HiCalendar size={18} />
            </div>
          </div>
          <p className="mt-2 font-heading text-xl font-bold tracking-tight text-navy-600">
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
        </div>
      </div>

      {/* Counsellor Remark Callout */}
      {lastHistoryEntry?.counsellorRemark && (
        <div className="relative overflow-hidden rounded-2xl border border-coral-100 bg-coral-50 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-white p-2 text-coral shadow-sm">
              <HiChatAlt2 size={18} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-coral">
                Counsellor Remark
              </p>
              <p className="mt-1 text-sm font-medium leading-relaxed text-navy-600">
                {lastHistoryEntry.counsellorRemark}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Application Progress Timeline */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-heading text-xl font-bold tracking-tight text-navy-600">
              Application Progress
            </h2>
            <p className="text-xs text-navy-400">
              Track your step-by-step admission journey
            </p>
          </div>
          <span className="self-start rounded-full bg-coral-50 px-3 py-1 text-xs font-bold text-coral sm:self-auto">
            {progressPercent}% Completed
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-navy-50">
          <div
            className="h-full rounded-full bg-coral transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Vertical Connected Timeline */}
        <div className="relative mt-10 pl-2">
          {/* Connector Line behind steps */}
          <div className="absolute bottom-6 left-[19px] top-6 w-[2px] bg-navy-50" />

          <div className="space-y-6">
            {STAGES.map((stage, i) => {
              const isDone = i <= currentIndex;
              const isCurrent = i === currentIndex;

              return (
                <div
                  key={stage}
                  className="relative flex items-center gap-4 transition-colors duration-200"
                >
                  {/* Step Icon Badge */}
                  <div
                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                      isDone
                        ? "bg-coral text-white shadow-sm ring-4 ring-white"
                        : "bg-navy-50 text-navy-300 ring-4 ring-white"
                    }`}
                  >
                    {isDone ? <HiCheckCircle size={20} /> : i + 1}
                  </div>

                  {/* Step Info */}
                  <div className="flex flex-1 items-center justify-between">
                    <p
                      className={`text-sm font-semibold transition-colors duration-200 ${
                        isCurrent
                          ? "text-coral"
                          : isDone
                            ? "text-navy-600"
                            : "text-navy-300"
                      }`}
                    >
                      {label(stage)}
                    </p>

                    {isCurrent && (
                      <span className="inline-flex items-center rounded-full bg-coral-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-coral animate-pulse">
                        Current
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardPage;
