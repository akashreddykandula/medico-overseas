import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppButton from "../common/WhatsAppButton";
import useLenis from "../../hooks/useLenis";

const PublicLayout = () => {
  useLenis();
  const location = useLocation();
  const isDestinationPage = location.pathname.startsWith("/destinations/");

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-1 w-full overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
      {!isDestinationPage && <WhatsAppButton />}
    </div>
  );
};

export default PublicLayout;
