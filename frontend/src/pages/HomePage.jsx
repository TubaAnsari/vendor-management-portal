import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBuilding, FaStar, FaUsers, FaChartLine } from 'react-icons/fa';
import { vendorAPI } from '../services/api';

const HomePage = () => {
    const [categoryCounts, setCategoryCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Define categories to display
    const categories = [
        { name: 'Contractor', key: 'Contractor' },
        { name: 'Material Supplier', key: 'Material Supplier' },
        { name: 'Consultant', key: 'Consultant' },
        { name: 'Fabricator', key: 'Fabricator' }
    ];

    useEffect(() => {
        fetchCategoryCounts();
    }, []);

    const fetchCategoryCounts = async () => {
  try {
    setLoading(true);
    setError(null);
    
    console.log('Fetching vendors for category counts...');
    
    const response = await vendorAPI.getAll();
    console.log('Vendors response:', response);
    
    const vendors = response.data || [];
    
    // Count vendors per category
    const counts = {};
    categories.forEach(cat => {
      counts[cat.key] = vendors.filter(vendor => 
        vendor.business_category === cat.key
      ).length;
    });
    
    setCategoryCounts(counts);
  } catch (error) {
    console.error('Failed to fetch category counts:', error);
    console.error('Error details:', error.response?.data);
    setError(`Failed to load categories: ${error.message}`);
    
    // Set default counts
    const defaultCounts = {};
    categories.forEach(cat => {
      defaultCounts[cat.key] = 0;
    });
    setCategoryCounts(defaultCounts);
  } finally {
    setLoading(false);
  }
};

    return (
        <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="text-center py-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl mb-12 px-4">
                <h1 className="text-5xl font-bold text-gray-900 mb-4">
                    Vendor Management Portal
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                    Connect with trusted vendors, showcase your products, and grow your business
                </p>
                <div className="flex justify-center space-x-4">
                    <Link to="/register" className="btn-primary text-lg px-8 py-3">
                        Register as Vendor
                    </Link>
                    <Link to="/vendors" className="btn-secondary text-lg px-8 py-3">
                        Browse Vendors
                    </Link>
                </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 px-4">
                <div className="card text-center hover:shadow-lg transition-shadow">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <FaBuilding className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Vendor Registration</h3>
                    <p className="text-gray-600">
                        Easy registration process for vendors to join our platform
                    </p>
                </div>

                <div className="card text-center hover:shadow-lg transition-shadow">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <FaStar className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Rating System</h3>
                    <p className="text-gray-600">
                        Transparent client feedback and rating system
                    </p>
                </div>

                <div className="card text-center hover:shadow-lg transition-shadow">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                        <FaUsers className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Product Showcase</h3>
                    <p className="text-gray-600">
                        Showcase your products with detailed information
                    </p>
                </div>

                <div className="card text-center hover:shadow-lg transition-shadow">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                        <FaChartLine className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Admin Dashboard</h3>
                    <p className="text-gray-600">
                        Comprehensive admin view for managing vendors
                    </p>
                </div>
            </div>

            {/* Dynamic Categories */}
            <div className="mb-12 px-4">
                <h2 className="text-3xl font-bold text-center mb-8">Business Categories</h2>
                
                {error && (
                    <div className="text-center text-red-600 mb-4">
                        {error}
                    </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {categories.map((category) => (
                        <Link 
                            key={category.key} 
                            to={`/vendors?category=${encodeURIComponent(category.key)}`}
                            className="card hover:shadow-lg transition-shadow text-center hover:border-blue-300 border-2 border-transparent min-h-[120px] flex flex-col justify-center"
                        >
                            <h3 className="font-semibold text-lg text-gray-800 mb-2">
                                {category.name}
                            </h3>
                            {loading ? (
                                <div className="h-6 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                </div>
                            ) : (
                                <p className="text-gray-600 text-sm">
                                    <span className="font-bold text-blue-600 text-lg">
                                        {categoryCounts[category.key] || 0}
                                    </span> 
                                    <span className="ml-1">
                                        {categoryCounts[category.key] === 1 ? ' vendor' : ' vendors'}
                                    </span>
                                </p>
                            )}
                            <div className="mt-3 text-blue-500 text-xs">
                                Browse vendors →
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            
            {/* Call to Action */}
            <div className="text-center px-4">
                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Ready to Find Your Perfect Vendor?
                    </h3>
                    <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                        Browse through our curated list of verified vendors across multiple categories.
                    </p>
                    <Link 
                        to="/vendors" 
                        className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Explore All Vendors
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HomePage;