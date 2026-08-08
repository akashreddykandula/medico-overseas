import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineViewGrid,
  HiOutlineUserGroup,
  HiOutlineDocumentText,
  HiOutlineGlobeAlt,
  HiOutlineAcademicCap,
  HiOutlineNewspaper,
  HiOutlineLogout,
  HiOutlineQuestionMarkCircle,
  HiOutlineMenuAlt2,
  HiOutlineX,
  HiOutlineBell,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import { logout } from "../../features/authSlice";

const LINKS = [
  { to: "/admin", label: "Overview", icon: HiOutlineViewGrid, end: true },
  { to: "/admin/leads", label: "Leads (CRM)", icon: HiOutlineUserGroup },
  {
    to: "/admin/counsellors",
    label: "Counsellors",
    icon: HiOutlineUserGroup,
  },
  {
    to: "/admin/students",
    label: "Students",
    icon: HiOutlineUserGroup,
  },
  {
    to: "/admin/applications",
    label: "Applications",
    icon: HiOutlineDocumentText,
  },
  {
    to: "/admin/countries",
    label: "Destinations",
    icon: HiOutlineGlobeAlt,
  },
  {
    to: "/admin/universities",
    label: "Universities",
    icon: HiOutlineAcademicCap,
  },
  { to: "/admin/blogs", label: "Blog CMS", icon: HiOutlineNewspaper },
  {
    to: "/admin/faqs",
    label: "FAQs",
    icon: HiOutlineQuestionMarkCircle,
  },
];

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-navy-50 font-sans">
      {/* Sidebar - Desktop */}
      <aside className="relative hidden w-72 shrink-0 flex-col overflow-hidden bg-navy p-6 text-white shadow-2xl lg:flex">
        {/* Decorative Background Glows */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-coral/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-navy-400/20 blur-3xl" />

        {/* Brand Logo Header */}
        <div className="relative z-10 flex items-center gap-3 border-b border-white/10 pb-6">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5 shadow-md transition-transform duration-300 hover:scale-105">
            <img
              src="/medicologo.png"
              alt="Medico Overseas Logo"
              className="h-full w-full object-contain mix-blend-multiply"
            />
          </div>
          <div>
            <span className="font-heading text-lg font-bold tracking-tight text-white">
              Medico Overseas
            </span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-coral">
              <HiOutlineShieldCheck size={13} />
              <span className="uppercase tracking-wider">Admin Portal</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="relative z-10 mt-8 flex flex-col gap-1.5">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `group relative flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-coral text-white shadow-lg shadow-coral/25"
                    : "text-navy-100 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <l.icon
                    size={20}
                    className={`transition-transform duration-200 group-hover:scale-110 ${
                      isActive
                        ? "text-white"
                        : "text-navy-200 group-hover:text-white"
                    }`}
                  />
                  <span>{l.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute right-2 h-2 w-2 rounded-full bg-white shadow-sm"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Card & Logout */}
        <div className="relative z-10 mt-auto pt-6">
          <div className="mb-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-coral/20 font-bold text-coral">
                {user?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-sm font-semibold text-white">
                  {user?.name || "Admin User"}
                </p>
                <p className="truncate text-xs text-navy-200 capitalize">
                  {user?.role?.replace("_", " ") || "Administrator"}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="group flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-navy-100 transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
          >
            <HiOutlineLogout
              size={18}
              className="transition-transform duration-200 group-hover:-translate-x-1"
            />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-navy-100 bg-white/80 px-6 py-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg border border-navy-100 p-2 text-navy-600 hover:bg-navy-50 lg:hidden"
            >
              {mobileMenuOpen ? (
                <HiOutlineX size={20} />
              ) : (
                <HiOutlineMenuAlt2 size={20} />
              )}
            </button>

            <h1 className="font-heading text-xl font-bold tracking-tight text-navy-600">
              Admin Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative rounded-xl border border-navy-100 p-2.5 text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-600">
              <HiOutlineBell size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-coral" />
            </button>

            <div className="hidden sm:flex items-center gap-2 rounded-full border border-navy-100 bg-navy-50/50 px-3.5 py-1.5 text-xs font-semibold text-navy-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{user?.name}</span>
              <span className="text-navy-300">•</span>
              <span className="capitalize text-navy-400">
                {user?.role?.replace("_", " ")}
              </span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-navy-100 bg-navy p-6 text-white lg:hidden"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white p-1">
                  <img
                    src="/medicologo.png"
                    alt="Logo"
                    className="h-full w-full object-contain mix-blend-multiply"
                  />
                </div>
                <span className="font-heading font-bold">Medico Overseas</span>
              </div>
              <div className="flex flex-col gap-1">
                {LINKS.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.end}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-coral text-white"
                          : "text-navy-100 hover:bg-white/10"
                      }`
                    }
                  >
                    <l.icon size={18} /> {l.label}
                  </NavLink>
                ))}
                <button
                  onClick={handleLogout}
                  className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10"
                >
                  <HiOutlineLogout size={18} /> Log Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Content Outlet */}
        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
