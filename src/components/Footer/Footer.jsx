import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🏪</span>
              </div>
              <h3 className="text-xl font-bold">Fine Dining Restaurant</h3>
            </div>
            <p className="text-gray-400 mb-6">
              We offer the finest authentic Eastern and Arabic dishes with the highest quality and best service in a comfortable and family-friendly atmosphere.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/menu" className="text-gray-400 hover:text-white transition-colors">Menu</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Our Services */}
          <div>
            <h4 className="text-xl font-semibold mb-4 text-white">Our Services</h4>
            <ul className="space-y-3">
              <li className="text-gray-400">
                Fast Delivery
              </li>
              <li className="text-gray-400">
                24/7 Service
              </li>
              <li className="text-gray-400">
                Quality Guarantee
              </li>
              <li className="text-gray-400">
                Healthy Dishes
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="text-xl font-semibold mb-4 text-white">Contact Us</h4>
            <ul className="space-y-3">
              <li className="text-gray-400 flex items-center space-x-2">
                <span className="text-orange-400">📍</span>
                <span>King Fahd Street, Riyadh, Saudi Arabia</span>
              </li>
              <li className="text-gray-400 flex items-center space-x-2">
                <span className="text-orange-400">📞</span>
                <span>+966 11 234 5678</span>
              </li>
              <li className="text-gray-400 flex items-center space-x-2">
                <span className="text-orange-400">📧</span>
                <span>info@restaurant.com</span>
              </li>
              <li className="text-gray-400 flex items-center space-x-2">
                <span className="text-orange-400">🕒</span>
                <span>Daily: 10:00 AM - 12:00 AM</span>
              </li>
            </ul>
          </div>
        </div>


        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🏪</span>
            </div>
            <span className="text-gray-400">Fine Dining Restaurant</span>
          </div>
          <p className="text-gray-400">
            © 2025 Fine Dining Restaurant. All rights reserved.
          </p>
          <div className="mt-4 flex justify-center space-x-6">
            <Link to="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
            <Link to="#" className="text-gray-400 hover:text-white transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 