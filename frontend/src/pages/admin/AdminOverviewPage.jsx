import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import {
  HiOutlineUsers,
  HiOutlineUserAdd,
  HiOutlineTrendingUp,
  HiOutlineDocumentText,
  HiOutlineAcademicCap,
  HiOutlineGlobe,
  HiOutlineLibrary,
  HiOutlineNewspaper,
} from "react-icons/hi";
import { useAdminAnalytics } from "../../hooks/useAdminAnalytics";
const COLORS = [
  "#1F3864",
  "#E15B3F",
  "#6F96D2",
  "#F18463",
  "#9FB9E1",
  "#F6AD97",
];

const STAT_CONFIG = {
  "Total Students": { icon: HiOutlineUsers, badge: "Students" },
  "Total Leads": { icon: HiOutlineUserAdd, badge: "Leads" },
  "New Leads (30d)": { icon: HiOutlineTrendingUp, badge: "Recent" },
  "Conversion Rate": { icon: HiOutlineTrendingUp, badge: "Rate" },
  Applications: { icon: HiOutlineDocumentText, badge: "Pipeline" },
  Destinations: { icon: HiOutlineGlobe, badge: "Global" },
  Universities: { icon: HiOutlineAcademicCap, badge: "Partners" },
  "Published Blogs": { icon: HiOutlineNewspaper, badge: "Content" },
};

const StatCard = ({ label, value }) => {
  const Icon = STAT_CONFIG[label]?.icon || HiOutlineLibrary;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-navy-400">
          {label}
        </p>
        <div className="rounded-xl bg-navy-50/80 p-2.5 text-navy-600 transition-colors duration-300 group-hover:bg-coral-50 group-hover:text-coral">
          <Icon size={18} />
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <p className="font-heading text-2xl font-bold tracking-tight text-navy-600 sm:text-3xl">
          {value}
        </p>
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-50">
        <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-navy-400 to-coral opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
    </div>
  );
};

// Custom Chart Tooltip for High-End Dashboard feel
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-100 bg-white/95 p-3 shadow-xl backdrop-blur-md">
        <p className="text-xs font-semibold text-navy-400">
          {label || payload[0].name}
        </p>
        <p className="mt-1 text-sm font-bold text-navy-600">
          {payload[0].value.toLocaleString()}{" "}
          <span className="text-xs font-normal text-slate-500">count</span>
        </p>
      </div>
    );
  }
  return null;
};

const AdminOverviewPage = () => {
  const { data, isLoading } = useAdminAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6 py-6">
        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-slate-100 bg-white p-5 space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="h-3 w-20 rounded bg-navy-100" />
                <div className="h-8 w-8 rounded-xl bg-coral/10" />
              </div>
              <div className="h-7 w-28 rounded bg-navy-100" />
              <div className="h-3 w-16 rounded bg-emerald-50" />
            </div>
          ))}
        </div>

        {/* Main Chart Section Skeleton */}
        <div className="animate-pulse rounded-2xl border border-slate-100 bg-white p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="h-4 w-36 rounded bg-navy-100" />
            <div className="h-8 w-24 rounded-lg bg-navy-50" />
          </div>
          <div className="flex h-64 items-end gap-3 pt-4">
            {[40, 65, 30, 85, 50, 75, 90, 60, 45, 70, 80, 55].map(
              (height, i) => (
                <div
                  key={i}
                  className="w-full rounded-t-lg bg-navy-50"
                  style={{ height: `${height}%` }}
                />
              ),
            )}
          </div>
        </div>
      </div>
    );
  }

  const { totals, leadsByStatus, conversionRate, monthlyLeadGrowth } = data;

  const growthData = monthlyLeadGrowth.map((m) => ({
    month: `${m._id.month}/${m._id.year.toString().slice(2)}`,
    leads: m.count,
  }));

  return (
    <div className="space-y-8 p-1">
      {/* Dashboard Executive Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div>
          <h1 className="font-heading text-xl font-bold tracking-tight text-navy-600 sm:text-2xl">
            Executive Performance Dashboard
          </h1>
          <p className="text-xs text-navy-400">
            Real-time metric monitoring and lead conversion analytics
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live System Data
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-5">
        <StatCard label="Total Students" value={totals.students} />
        <StatCard label="Total Leads" value={totals.leads} />
        <StatCard label="New Leads (30d)" value={totals.newLeadsLast30Days} />
        <StatCard label="Conversion Rate" value={`${conversionRate}%`} />
        <StatCard label="Applications" value={totals.applications} />
        <StatCard label="Destinations" value={totals.countries} />
        <StatCard label="Universities" value={totals.universities} />
        <StatCard label="Published Blogs" value={totals.publishedBlogs} />
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Lead Growth Chart */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div>
              <h2 className="font-heading text-base font-bold text-navy-600">
                Monthly Lead Growth
              </h2>
              <p className="text-xs text-navy-400">
                Acquisition velocity over recent months
              </p>
            </div>
            <span className="rounded-lg bg-coral-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-coral">
              Growth
            </span>
          </div>

          <div className="mt-6">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={growthData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F1F5F9"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  stroke="#94A3B8"
                />
                <YAxis
                  fontSize={11}
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  stroke="#94A3B8"
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#F8FAFC" }}
                />
                <Bar
                  dataKey="leads"
                  fill="#E15B3F"
                  radius={[6, 6, 0, 0]}
                  barSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leads by Status Chart */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div>
              <h2 className="font-heading text-base font-bold text-navy-600">
                Leads by Status
              </h2>
              <p className="text-xs text-navy-400">
                Distribution breakdown across active pipeline stages
              </p>
            </div>
            <span className="rounded-lg bg-navy-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-navy-600">
              Pipeline
            </span>
          </div>

          <div className="mt-6 flex flex-col items-center justify-center sm:flex-row">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={leadsByStatus}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={3}
                >
                  {leadsByStatus.map((entry, i) => (
                    <Cell
                      key={entry._id}
                      fill={COLORS[i % COLORS.length]}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Custom Pie Chart Side Legend */}
            <div className="mt-4 flex w-full flex-wrap gap-2 sm:mt-0 sm:w-48 sm:flex-col sm:justify-center">
              {leadsByStatus.map((entry, i) => (
                <div
                  key={entry._id}
                  className="flex items-center gap-2 text-xs"
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="capitalize text-navy-600 font-medium truncate">
                    {entry._id || "Unassigned"}
                  </span>
                  <span className="ml-auto font-semibold text-slate-400">
                    ({entry.count})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewPage;
