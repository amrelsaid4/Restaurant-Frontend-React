import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function InvalidVerificationLink() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 flex items-center justify-center p-4">
      <motion.div
        className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100">
          <span role="img" aria-label="error" className="text-5xl">😞</span>
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Link Invalid or Expired
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          The verification link you used is either invalid or has expired.
        </p>
        <p className="mt-2 text-md text-gray-500">
          Please try registering again or contact support if you believe this is an error.
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Register Again
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Contact Support
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default InvalidVerificationLink; 