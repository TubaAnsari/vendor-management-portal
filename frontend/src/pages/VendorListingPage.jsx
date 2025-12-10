import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaSearch, FaFilter, FaStar, FaBuilding, FaTimes } from 'react-icons/fa';
import { vendorAPI } from '../services/api';
import { DisplayRating } from '../components/RatingStars';

const VendorListingPage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get categories from vendors (unique business categories)
  const allCategories = [...new Set(vendors.map(v => v.business_category).filter(Boolean))].sort();

  // Default categories if none exist yet
  const defaultCategories = [
    'Contractor',
    'Material Supplier',
    'Consultant',
    'Fabricator',
    'Manufacturer',
    'Service Provider',
  ];

  const categories = allCategories.length > 0 ? allCategories : defaultCategories;

  // Fetch vendors when component mounts or filters change
  useEffect(() => {
    // Get initial values from URL
    const urlCategory = searchParams.get('category') || '';
    const urlSearch = searchParams.get('search') || '';
    const urlSort = searchParams.get('sort') || '';
    
    // Only update state if values are different
    if (urlCategory !== category) setCategory(urlCategory);
    if (urlSearch !== search) setSearch(urlSearch);
    if (urlSort !== sort) setSort(urlSort);
    
    // Fetch vendors with current filters
    fetchVendors(urlCategory, urlSearch, urlSort);
  }, [searchParams]); // Run when URL params change

  // Update URL when local state changes (but don't fetch - useEffect above handles it)
  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    if (sort) params.set('sort', sort);
    
    // Only update if params have changed
    const currentParams = new URLSearchParams(searchParams);
    if (params.toString() !== currentParams.toString()) {
      setSearchParams(params);
    }
  }, [category, search, sort]);

  const fetchVendors = async (cat = category, srch = search, srt = sort) => {
  try {
    setLoading(true);
    const params = {};
    if (cat) params.category = cat;
    if (srch.trim()) params.search = srch.trim();
    if (srt) params.sort = srt;
    
    console.log('Fetching vendors with params:', params);
    
    const response = await vendorAPI.getAll(params);
    console.log('Vendors response:', response.data);
    
    setVendors(response.data || []);
  } catch (error) {
    console.error('Failed to fetch vendors:', error);
    console.error('Error details:', error.response?.data);
    setVendors([]);
    
    // Show error message
    toast.error('Failed to load vendors. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVendors();
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    // fetchVendors will be triggered by useEffect
  };

  const handleSearchChange = (value) => {
    setSearch(value);
  };

  const handleSortChange = (value) => {
    setSort(value);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setSort('');
    // URL will update via useEffect, which triggers fetchVendors
  };

  const removeCategoryFilter = () => {
    setCategory('');
  };

  const removeSearchFilter = () => {
    setSearch('');
  };

  const removeSortFilter = () => {
    setSort('');
  };

  // Active filter count
  const activeFilterCount = [category, search.trim(), sort].filter(Boolean).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Browse Vendors</h1>
        <div className="text-gray-600">
          {loading ? 'Loading...' : `${vendors.length} vendor${vendors.length !== 1 ? 's' : ''} found`}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Vendors
            </label>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search by name or description..."
                className="w-full px-4 py-2 pl-10 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
              />
              <button 
                type="submit" 
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
              >
                <FaSearch className="text-gray-400 hover:text-gray-600" />
              </button>
              {search && (
                <button
                  type="button"
                  onClick={removeSearchFilter}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              )}
            </form>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <div className="relative">
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none'
                }}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <div className="relative">
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none'
                }}
              >
                <option value="">Default (Newest)</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaFilter className="text-blue-600 mr-2" />
                <span className="text-sm text-blue-800">
                  {activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear All
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Category: {category}
                  <button 
                    onClick={removeCategoryFilter}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Search: "{search}"
                  <button 
                    onClick={removeSearchFilter}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </span>
              )}
              {sort && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Sort: {sort === 'rating' ? 'Highest Rated' : 'Name (A-Z)'}
                  <button 
                    onClick={removeSortFilter}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {vendors.length} of {vendors.length} vendors
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => fetchVendors()}
              className="text-sm bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200"
            >
              Refresh
            </button>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Quick Links */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Browse by Category</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleCategoryChange('')}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              !category 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                category === cat 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading vendors...</span>
        </div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-12">
          <FaSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No vendors found</h3>
          <p className="text-gray-600 mb-4">
            {category ? `No vendors found in "${category}" category` : 'Try adjusting your search or filters'}
          </p>
          {category && (
            <button
              onClick={removeCategoryFilter}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mr-2"
            >
              Clear Category Filter
            </button>
          )}
          <button
            onClick={clearFilters}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Show All Vendors
          </button>
        </div>
      ) : (
        <>
          {/* Category Header */}
          {category && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-blue-900">
                    {category} Vendors
                  </h2>
                  <p className="text-blue-700">
                    Showing {vendors.length} vendor{vendors.length !== 1 ? 's' : ''} in this category
                  </p>
                </div>
                <button
                  onClick={removeCategoryFilter}
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <FaTimes className="mr-1" /> Clear Filter
                </button>
              </div>
            </div>
          )}
          
          {/* Sort Info */}
          {sort && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">
                Sorted by: <span className="font-semibold">
                  {sort === 'rating' ? 'Highest Rating' : 
                   sort === 'name' ? 'Name (A-Z)' : 
                   'Newest First'}
                </span>
              </p>
            </div>
          )}
          
          {/* Vendors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex items-start mb-4">
                  {vendor.logo_url ? (
                    <img
                      src={`http://localhost:5000${vendor.logo_url}`}
                      alt={vendor.vendor_name}
                      className="w-16 h-16 rounded-lg object-cover mr-4"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        parent.innerHTML = `
                          <div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                            <i class="fas fa-building text-gray-500 text-xl"></i>
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                      <FaBuilding className="w-8 h-8 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg">{vendor.vendor_name}</h3>
                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mt-1">
                      {vendor.business_category}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {vendor.description || 'No description provided'}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <DisplayRating value={vendor.average_rating || 0} />
                  <span className="text-gray-500 text-sm">
                    {vendor.review_count || 0} review{vendor.review_count !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="text-sm text-gray-500 mb-4">
                  <span className="flex items-center">
                    📍 {vendor.city || 'Location not specified'}
                  </span>
                </div>

                <div className="flex space-x-2">
                  <Link
                    to={`/vendor/${vendor.id}`}
                    className="flex-1 text-center bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                  >
                    View Profile
                  </Link>
                  <Link
                    to={`/vendor/${vendor.id}/feedback`}
                    className="flex-1 text-center bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300"
                  >
                    Leave Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default VendorListingPage;