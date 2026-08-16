import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppButton from "../common/WhatsAppButton";
import ApplicationPopup from "../common/ApplicationPopup";
import useLenis from "../../hooks/useLenis";

const PublicLayout = () => {
  useLenis();

  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDestinationPage = location.pathname.startsWith("/destinations/");

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden">
      <Navbar onMobileMenuChange={setMobileOpen} />

      <main className="flex-1 w-full overflow-x-hidden">
        <Outlet />
      </main>

      <Footer />

      {/* Application Popup */}
      {!isDestinationPage && !mobileOpen && <ApplicationPopup />}

      {/* Hide WhatsApp on destination pages AND when mobile menu is open */}
      {!isDestinationPage && !mobileOpen && <WhatsAppButton />}
    </div>
  );
};

export default PublicLayout;
