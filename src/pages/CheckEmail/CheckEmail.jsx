import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';

function CheckEmail() {
  const location = useLocation();
  const email = location.state?.email || 'your email address';
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      const response = await authAPI.resendVerificationEmail(email);
      toast.success(response.message || 'A new verification link has been sent!');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to resend email. Please try again later.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-blue-100"
          animate={{ rotate: [0, 15, -10, 15, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
        >
          <span role="img" aria-label="email" className="text-5xl">📧</span>
        </motion.div>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Check Your Inbox!
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          We've sent a verification link to <strong className="text-blue-600">{email}</strong>.
        </p>
        <p className="mt-2 text-md text-gray-500">
          Please click the link in the email to activate your account. It might take a minute to arrive.
        </p>
        <div className="mt-8">
          <p className="text-sm text-gray-500">
            Didn't receive the email? Check your spam folder or{" "}
            <button
              onClick={handleResend}
              disabled={loading}
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'resend the verification link'}
            </button>
            .
          </p>
        </div>
        <div className="mt-6">
          <Link
            to="/login"
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default CheckEmail; 