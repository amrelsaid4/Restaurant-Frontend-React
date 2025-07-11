import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Icons } from '@/components/icons/IconLibrary';

const Login = () => {
  const [formData, setFormData] = useState({
    identity: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginType, setLoginType] = useState('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  
  const { login, adminLogin, isAuthenticated, isAdmin, user, loading: authLoading, initialized } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast.success('Your email has been successfully verified! You can now log in.');
      // Optional: remove the query param from URL without reloading
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);


  // 🔥 KEY FIX: Wait for auth state to be ready before redirecting
  useEffect(() => {
    console.log('🔍 Auth state monitor:', { 
      isAuthenticated, 
      isAdmin, 
      user: !!user, 
      authLoading, 
      initialized,
      pendingNavigation 
    });


    if (initialized && !authLoading && isAuthenticated && user) {
      console.log('🎯 Auth state ready for navigation');
      
      if (isAdmin) {
        console.log('🔴 Admin user - navigating to dashboard');
        navigate('/admin/dashboard', { replace: true });
      } else {
        console.log('🟢 Customer user - navigating to home');
        navigate('/', { replace: true });
      }
      
      // Clear pending navigation
      setPendingNavigation(null);
    }
  }, [isAuthenticated, isAdmin, user, authLoading, initialized, navigate, pendingNavigation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleTabChange = (type) => {
    setLoginType(type);
    setError('');
    setFormData({
      identity: '',
      email: '',
      password: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setLoading(true);
    setError('');

    try {
      let result;
      if (loginType === 'admin') {
        result = await adminLogin({ email: formData.email, password: formData.password });
      } else {
        result = await login({ identity: formData.identity, password: formData.password });
      }
      
      if (result && result.success) {
        toast.success('Login successful! 🎉');
        console.log('✅ Login successful, setting pending navigation');
        
        // Set pending navigation flag - useEffect will handle actual navigation
        setPendingNavigation(loginType);
        
        console.log('⏳ Waiting for auth state to update...');
      } else {
        const errorMessage = result?.error || 'Login failed. Please check your credentials.';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMessage = error.message || 'An unexpected error occurred.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const benefits = [
    {
      icon: Icons.shield,
      text: "Secure and fast login system",
      color: "text-green-600"
    },
    {
      icon: Icons.restaurant,
      text: "Access to exclusive menu items", 
      color: "text-orange-600"
    },
    {
      icon: Icons.mobile,
      text: "Seamless ordering experience",
      color: "text-blue-600"
    },
    {
      icon: Icons.lightning,
      text: "Quick checkout and delivery",
      color: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex">
      <motion.div 
        className="flex w-full max-w-6xl mx-auto my-auto shadow-2xl rounded-2xl overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Side - Branding */}
        <motion.div 
          className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-600 to-red-600 p-12 text-white relative overflow-hidden"
          variants={itemVariants}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-repeat" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          <div className="relative z-10 flex flex-col justify-center">
            <motion.div 
              className="mb-8"
              variants={itemVariants}
            >
              <h1 className="text-4xl font-bold mb-4">Fine Dining</h1>
              <p className="text-xl text-orange-100">
                Welcome back to exceptional culinary experiences
              </p>
            </motion.div>

            <motion.div 
              className="space-y-6"
              variants={itemVariants}
            >
              {benefits.map((benefit, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center space-x-4"
                  variants={itemVariants}
                  whileHover={{ x: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    {React.createElement(benefit.icon, { className: "w-6 h-6 text-white" })}
                  </div>
                  <span className="text-orange-100">{benefit.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div 
          className="w-full lg:w-1/2 bg-white p-8 lg:p-12"
          variants={itemVariants}
        >
          <div className="max-w-md mx-auto">
            <motion.div 
              className="text-center mb-8"
              variants={itemVariants}
            >
              <h2 className="text-3xl font-extrabold text-gray-900">
                Sign In
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Access your account
              </p>
            </motion.div>

            {/* Login Tabs */}
            <div className="flex justify-center rounded-lg bg-gray-100 p-2 mb-6 space-x-3">
              <button
                onClick={() => handleTabChange('customer')}
                className={`w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  loginType === 'customer'
                    ? 'bg-orange-600 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => handleTabChange('admin')}
                className={`w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  loginType === 'admin'
                    ? 'bg-orange-600 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Admin
              </button>
            </div>

            <motion.form onSubmit={handleSubmit} className="space-y-6" variants={itemVariants}>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-center"
                  role="alert"
                >
                  <span className="block sm:inline">{error}</span>
                </motion.div>
              )}

              {loginType === 'customer' ? (
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username or Email
                  </label>
                  <motion.input
                    type="text"
                    name="identity"
                    value={formData.identity}
                    onChange={handleChange}
                    required
                    placeholder="Enter your username or email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
              ) : (
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Email
                  </label>
                  <motion.input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="admin@restaurant.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
              )}

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <motion.input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    whileFocus={{ scale: 1.02 }}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {React.createElement(showPassword ? Icons.eye : Icons.eyeOff, { className: "w-5 h-5" })}
                  </motion.button>
                </div>
              </div>

              <motion.button 
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg hover:shadow-xl'
                }`}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  `Sign in as ${loginType === 'customer' ? 'Customer' : 'Admin'}`
                )}
              </motion.button>
            </motion.form>

            {/* Register Link */}
            {loginType === 'customer' && (
              <motion.div 
                className="mt-6 text-center"
                variants={itemVariants}
              >
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link 
                    to="/register" 
                    className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                  >
                    Sign up here
                  </Link>
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login; 