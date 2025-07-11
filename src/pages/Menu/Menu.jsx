import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { menuAPI } from '@/services/api';
import { useCart } from '@/contexts/CartContext';
import { useAlert } from '@/contexts/AlertContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader'; // Import the new component

const menuHeroImage = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80';

// Utility function for rendering stars
const renderStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push(<span key={i} className="text-yellow-400">★</span>);
  }

  if (hasHalfStar) {
    stars.push(<span key="half" className="text-yellow-400">☆</span>);
  }

  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<span key={`empty-${i}`} className="text-gray-300">☆</span>);
  }

  return stars;
};

// Memoized Dish Card Component
const DishCard = memo(({ dish, onAddToCart }) => {
  const handleAddToCart = useCallback(() => {
    onAddToCart(dish);
  }, [dish, onAddToCart]);

  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loop if placeholder fails
    e.target.src = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80`; // Fallback image
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col"
      whileHover={{ y: -5 }}
      layout
    >
      {/* Image Container */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <img
          src={dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80'}
          alt={dish.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80';
          }}
        />
        
        {/* Price Badge */}
        <div className="absolute top-3 right-3 bg-white bg-opacity-95 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-orange-600 font-bold">${parseFloat(dish.price).toFixed(2)}</span>
        </div>

        {/* Rating Badge */}
        {dish.average_rating && (
          <div className="absolute top-3 left-3 bg-white bg-opacity-95 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1">
            <span className="text-yellow-400">★</span>
            <span className="text-sm font-medium">{dish.average_rating.toFixed(1)}</span>
          </div>
        )}

        {/* Category Badge */}
        {dish.category && (
          <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
            {dish.category.name}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex-grow mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {dish.name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 h-10">
            {dish.description}
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-2 mb-4 h-5">
            {dish.average_rating ? (
                <>
          <div className="flex">
            {renderStars(dish.average_rating || 0)}
          </div>
          {dish.rating_count > 0 && (
            <span className="text-sm text-gray-500">
                ({dish.rating_count})
            </span>
                    )}
                </>
            ) : (
                <span className="text-sm text-gray-400">No ratings yet</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Link
            to={`/dish/${dish.id}`}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-semibold transition-colors text-center text-sm hover:bg-gray-200"
          >
            View
          </Link>
          <motion.button
            className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors text-sm"
            onClick={handleAddToCart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Add to Cart
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

DishCard.displayName = 'DishCard';

const Menu = () => {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { showAlert } = useAlert();

  const selectedCategory = searchParams.get('category');
  const sortBy = searchParams.get('sort') || 'name';

  // Memoized filtered and sorted dishes
  const filteredDishes = useMemo(() => {
    let filtered = dishes.filter(dish => {
      // Search filter
      if (searchTerm && !dish.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !dish.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (selectedCategory && selectedCategory !== 'all' && 
          dish.category?.id !== parseInt(selectedCategory)) {
        return false;
      }
      
      return true;
    });

    // Sort dishes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price_high':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'rating':
          return (b.average_rating || 0) - (a.average_rating || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
    }
    });

    return filtered;
  }, [dishes, searchTerm, selectedCategory, sortBy]);

  const handleAddToCart = useCallback((dish) => {
    try {
      addToCart(dish);
      toast.success(`${dish.name} added to cart!`);
    } catch (error) {
      showAlert('Failed to add item to cart. Please try again.', 'error');
    }
  }, [addToCart, showAlert]);

  const handleCategoryChange = useCallback((categoryId) => {
    const newParams = new URLSearchParams(searchParams);
    if (categoryId && categoryId !== 'all') {
      newParams.set('category', categoryId);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const handleSortChange = useCallback((sortValue) => {
    const newParams = new URLSearchParams(searchParams);
    if (sortValue && sortValue !== 'name') {
      newParams.set('sort', sortValue);
    } else {
      newParams.delete('sort');
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // Data fetching
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [dishesResponse, categoriesResponse] = await Promise.all([
          menuAPI.getDishes({ page_size: 100 }), // Fetch all dishes
          menuAPI.getCategories()
        ]);

        if (isMounted) {
          setDishes(dishesResponse.results || dishesResponse.data || []);
          setCategories(categoriesResponse.results || categoriesResponse.data || []);
        }
      } catch (error) {
        if (isMounted) {
          showAlert('Failed to load menu. Please refresh the page.', 'error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [showAlert]);

  return (
    <div className="bg-gray-50">
      <PageHeader 
        title="Our Delicious Menu"
        subtitle="Explore our wide range of dishes, crafted with the freshest ingredients."
        image={menuHeroImage}
      />

      {/* Filters Bar */}
      <div className="sticky top-0 bg-white z-10 shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="w-full md:w-1/3">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search dishes..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Categories */}
            <div className="w-full md:w-2/3 overflow-x-auto pb-2">
              <div className="flex space-x-3">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex-shrink-0 ${
                    !selectedCategory || selectedCategory === 'all'
                      ? 'bg-orange-600 text-white shadow'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(String(category.id))}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex-shrink-0 ${
                      selectedCategory === String(category.id)
                        ? 'bg-orange-600 text-white shadow'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Results Info */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-gray-600">
            Showing {filteredDishes.length} of {dishes.length} dishes
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </motion.div>

        {/* Dishes Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading our delicious dishes...</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredDishes.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {filteredDishes.map(dish => (
                  <DishCard key={dish.id} dish={dish} onAddToCart={handleAddToCart} />
              ))}
              </motion.div>
            ) : (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h3 className="text-2xl font-semibold text-gray-800">No Dishes Found</h3>
                <p className="text-gray-500 mt-2">
                  Try adjusting your search or category filters.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Menu; 