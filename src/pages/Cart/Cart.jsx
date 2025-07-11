import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Add safety check for cart - default to empty array if undefined
  const cartItems = cart || [];

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      toast.success('Item removed from cart');
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleRemoveItem = (id, name) => {
    removeFromCart(id);
    toast.success(`${name} removed from cart`);
  };

  const handlePromoCode = async () => {
    if (!promoCode.trim()) return;
    
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const promoCodes = {
      'WELCOME20': 0.20,
      'SAVE10': 0.10,
      'NEWUSER': 0.15
    };
    
    if (promoCodes[promoCode.toUpperCase()]) {
      setDiscount(promoCodes[promoCode.toUpperCase()]);
      toast.success(`Promo code applied! ${(promoCodes[promoCode.toUpperCase()] * 100)}% off`);
    } else {
      toast.error('Invalid promo code');
    }
    
    setLoading(false);
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to proceed with checkout');
      navigate('/login');
      return;
    }
    
    // Prepare checkout data and store in session storage
    const checkoutData = {
      items: cartItems.map(item => ({
        dish_id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        special_instructions: item.specialInstructions || '',
      })),
      subtotal: subtotal,
      total: total,
    };
    
    sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    
    navigate('/checkout');
  };

  const subtotal = getTotalPrice ? getTotalPrice() : 0;
  const discountAmount = subtotal * discount;
  const deliveryFee = subtotal > 50 ? 0 : 5;
  const total = subtotal - discountAmount + deliveryFee;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    },
    exit: {
      x: -100,
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div 
          className="text-center max-w-md"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="text-8xl mb-6"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            🛒
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any delicious items to your cart yet!
          </p>
          <div className="space-y-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/menu"
                className="inline-block w-full px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                🍽️ Browse Menu
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/"
                className="inline-block w-full px-8 py-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                🏠 Go Home
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <motion.h1 
              className="text-4xl font-bold mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              🛒 Your Cart
            </motion.h1>
            <motion.p 
              className="text-orange-100 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Review your delicious selections
            </motion.p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div 
          className="flex flex-col lg:flex-row gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-4 sm:p-6"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Cart Items ({cartItems.length})
                </h2>
                <motion.button
                  className="text-red-600 hover:text-red-700 font-medium transition-colors"
                  onClick={() => {
                    clearCart();
                    toast.success('Cart cleared');
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🗑️ Clear All
                </motion.button>
              </div>

              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    className="flex items-start sm:items-center space-x-3 sm:space-x-4 py-4 border-b border-gray-200 last:border-b-0"
                    variants={itemVariants}
                    exit="exit"
                    layout
                  >
                    {/* Image */}
                    <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl">🍽️</span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800 truncate sm:text-lg">{item.name}</h3>
                          <p className="text-sm text-gray-500">${parseFloat(item.price).toFixed(2)}</p>
                        </div>
                        <motion.button
                          className="ml-2 flex-shrink-0 text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveItem(item.id, item.name)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label={`Remove ${item.name}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                          </svg>
                        </motion.button>
                      </div>

                      {/* Quantity & Notes for larger screens */}
                      <div className="hidden sm:flex items-center justify-between mt-2">
                        {/* Quantity Control */}
                        <div className="flex items-center">
                          <motion.button
                            className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            whileTap={{ scale: 0.9 }}
                          >
                            -
                          </motion.button>
                          <span className="mx-3 font-semibold">{item.quantity}</span>
                          <motion.button
                            className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            whileTap={{ scale: 0.9 }}
                          >
                            +
                          </motion.button>
                        </div>
                        
                        {item.specialInstructions && (
                          <div className="text-sm text-gray-500 bg-yellow-100 p-2 rounded-md">
                            <strong>Note:</strong> {item.specialInstructions}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-4 sm:p-6"
              variants={itemVariants}
              style={{ position: 'sticky', top: '2rem' }}
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 border-b pb-4">
                Order Summary
              </h2>
              
              {/* Promo Code */}
              <div className="mb-6">
                <label htmlFor="promo-code" className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Code
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="promo-code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code"
                    className="flex-grow w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={loading}
                  />
                  <motion.button
                    onClick={handlePromoCode}
                    className="px-4 py-2 bg-orange-600 text-white font-medium rounded-r-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-400"
                    disabled={loading}
                    whileTap={{ scale: 0.95 }}
                  >
                    {loading ? '...' : 'Apply'}
                  </motion.button>
                </div>
              </div>

              {/* Price Details */}
              <div className="space-y-3 text-sm sm:text-base">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                {discount > 0 && (
                  <motion.div 
                    className="flex justify-between text-green-600"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <span>Discount ({(discount * 100)}%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </motion.div>
                )}
                
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="flex items-center">
                    ${deliveryFee.toFixed(2)}
                    {subtotal > 50 && (
                      <span className="ml-2 text-green-600 text-sm">FREE</span>
                    )}
                  </span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Free Delivery Notice */}
              {subtotal < 50 && (
                <motion.div 
                  className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <p className="text-orange-700 text-sm">
                    🚚 Add ${(50 - subtotal).toFixed(2)} more for free delivery!
                  </p>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <motion.button
                  className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  onClick={handleCheckout}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  🛒 Proceed to Checkout
                </motion.button>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to="/menu"
                    className="block w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors text-center"
                  >
                    ← Continue Shopping
                  </Link>
                </motion.div>
              </div>

              {/* Payment Options */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-3">We Accept</h3>
                <div className="flex space-x-2">
                  <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                    VISA
                  </div>
                  <div className="w-12 h-8 bg-red-600 rounded flex items-center justify-center text-white text-xs font-bold">
                    MC
                  </div>
                  <div className="w-12 h-8 bg-yellow-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    💳
                  </div>
                  <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">
                    💰
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Cart; 