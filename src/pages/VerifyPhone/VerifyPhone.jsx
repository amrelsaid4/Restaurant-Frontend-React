import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/services/api';
import { Icons } from '@/components/icons/IconLibrary';

const VerifyPhone = () => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    const { checkAuth } = useAuth();

    const { email, phone } = location.state || {};

    useEffect(() => {
        if (!email) {
            toast.error("User information not found. Please register again.", { id: 'verify-error' });
            navigate('/register');
        } else {
            toast.success(`A verification code has been sent to ${phone}.`);
        }
    }, [email, phone, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!code || code.length < 6) {
            toast.error("Please enter a valid 6-digit verification code.");
            return;
        }
        setLoading(true);

        try {
            await authAPI.verifyPhone({ email, code });
            toast.success("Verification successful! Welcome!");

            // Trigger auth context to re-check auth state from localStorage
            await checkAuth();

            navigate('/');

        } catch (error) {
            const errorMessage = error.response?.data?.error || "Verification failed. Please try again.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (resendCooldown > 0) return;

        setLoading(true);
        try {
            const response = await authAPI.resendVerificationCode({ email });
            
            // DEV-ONLY: Display verification code if backend sends it
            if (response && response.data && response.data.verification_code) {
                toast.success(`DEV: New Code is ${response.data.verification_code}`, { duration: 10000 });
            }

            toast.success("A new verification code has been sent.");
            setResendCooldown(60); // Start 60-second cooldown
        } catch (error) {
            toast.error("Failed to resend code. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);
    
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
            <motion.div
                className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-8"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            >
                <motion.div variants={itemVariants} className="text-center mb-6">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                        {React.createElement(Icons.mobile, { className: "h-6 w-6 text-green-600"})}
                    </div>
                    <h2 className="mt-4 text-2xl font-extrabold text-gray-900">Verify Your Phone</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter the 6-digit code sent to your phone number ending in ...{phone?.slice(-4)}.
                    </p>
                </motion.div>

                <motion.form onSubmit={handleSubmit} className="space-y-6" variants={itemVariants}>
                    <div>
                        <label htmlFor="code" className="sr-only">Verification Code</label>
                        <input
                            id="code"
                            name="code"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            required
                            className="w-full text-center text-2xl tracking-[0.5em] font-bold border-gray-300 rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500"
                            placeholder="------"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            maxLength={6}
                        />
                    </div>

                    <motion.button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${loading ? 'bg-gray-400' : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'}`}
                        whileHover={!loading ? { scale: 1.02 } : {}}
                        whileTap={!loading ? { scale: 0.98 } : {}}
                    >
                        {loading ? 'Verifying...' : 'Verify Account'}
                    </motion.button>
                </motion.form>
                
                <motion.div variants={itemVariants} className="mt-4 text-center text-sm">
                    <button 
                        onClick={handleResendCode}
                        disabled={resendCooldown > 0}
                        className="font-medium text-orange-600 hover:text-orange-500 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Didn't receive a code? Resend"}
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default VerifyPhone;
