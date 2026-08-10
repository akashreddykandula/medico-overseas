import React from "react";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";

const WHATSAPP_NUMBER = "916301878730"; // replace with real business number
const DEFAULT_MESSAGE =
  "Hi Medico Overseas, I'd like to know more about MBBS abroad.";

const WhatsAppButton = () => (
  <motion.a
    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 1, type: "spring", stiffness: 200 }}
    whileHover={{ scale: 1.08 }}
    whileTap={{ scale: 0.95 }}
    className="fixed bottom-6 right-4 z-50  flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl"
    aria-label="Chat on WhatsApp"
  >
    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-40" />
    <FaWhatsapp size={28} className="relative" />
  </motion.a>
);

export default WhatsAppButton;
