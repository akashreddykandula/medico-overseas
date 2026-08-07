import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFoundPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-navy px-4 text-center">
    <motion.h1
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="font-heading text-8xl font-extrabold text-coral"
    >
      404
    </motion.h1>
    <p className="mt-4 max-w-md text-navy-100">
      The page you're looking for doesn't exist or may have moved. Let's get you back on track.
    </p>
    <Link to="/" className="btn-primary mt-8">
      Back to Homepage
    </Link>
  </div>
);

export default NotFoundPage;
