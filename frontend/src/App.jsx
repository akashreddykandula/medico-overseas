import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";

import Preloader from "./components/common/Preloader";
import PublicLayout from "./components/layout/PublicLayout";
import StudentPortalLayout from "./components/layout/StudentPortalLayout";
import AdminLayout from "./components/layout/AdminLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { fetchMe } from "./features/authSlice";
import AdminCounsellorsPage from "./pages/admin/AdminCounsellorsPage";

// Public pages
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import DestinationPage from "./pages/DestinationPage";
import ExamPage from "./pages/ExamPage";
import BlogListPage from "./pages/BlogListPage";
import BlogPostPage from "./pages/BlogPostPage";
import ContactPage from "./pages/ContactPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import GalleryPage from "./pages/GalleryPage";
import FaqsPage from "./pages/FaqsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import NotFoundPage from "./pages/NotFoundPage";

// Auth pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// Student portal pages
import StudentDashboardPage from "./pages/student/StudentDashboardPage";
import StudentDocumentsPage from "./pages/student/StudentDocumentsPage";
import StudentProfilePage from "./pages/student/StudentProfilePage";

// Admin pages
import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import AdminLeadsPage from "./pages/admin/AdminLeadsPage";
import AdminApplicationsPage from "./pages/admin/AdminApplicationsPage";
import AdminCountriesPage from "./pages/admin/AdminCountriesPage";
import AdminUniversitiesPage from "./pages/admin/AdminUniversitiesPage";
import AdminBlogsPage from "./pages/admin/AdminBlogsPage";
import AdminFaqsPage from "./pages/admin/AdminFaqsPage";

const ADMIN_ROLES = [
  "super_admin",
  "admin",
  "counsellor",
  "content_manager",
  "marketing_manager",
];

const App = () => {
  const dispatch = useDispatch();
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        await dispatch(fetchMe()).unwrap();
      } catch (err) {
        // ignore if not logged in
      } finally {
        setShowPreloader(false);
      }
    };

    initialize();
  }, [dispatch]);

  return (
    <>
      <Preloader show={showPreloader} />

      <Routes>
        {/* Public site */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/destinations/:slug" element={<DestinationPage />} />
          <Route path="/exams/:examSlug" element={<ExamPage />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/faqs" element={<FaqsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Student portal */}
        <Route element={<ProtectedRoute roles={["student"]} />}>
          <Route element={<StudentPortalLayout />}>
            <Route path="/portal" element={<StudentDashboardPage />} />
            <Route
              path="/portal/documents"
              element={<StudentDocumentsPage />}
            />
            <Route path="/portal/profile" element={<StudentProfilePage />} />
          </Route>
        </Route>

        {/* Admin dashboard */}
        <Route element={<ProtectedRoute roles={ADMIN_ROLES} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminOverviewPage />} />
            <Route path="/admin/leads" element={<AdminLeadsPage />} />
            <Route
              path="/admin/applications"
              element={<AdminApplicationsPage />}
            />
            <Route path="/admin/countries" element={<AdminCountriesPage />} />
            <Route
              path="/admin/universities"
              element={<AdminUniversitiesPage />}
            />
            <Route path="/admin/blogs" element={<AdminBlogsPage />} />
            <Route path="/admin/faqs" element={<AdminFaqsPage />} />

            {/* ✅ Move it here */}
            <Route
              path="/admin/counsellors"
              element={<AdminCounsellorsPage />}
            />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};

export default App;
