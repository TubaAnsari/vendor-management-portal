import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { vendorAPI } from '../services/api';
import { DisplayRating } from '../components/RatingStars';

const VendorProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logoError, setLogoError] = useState(false);
  const [productImagesError, setProductImagesError] = useState({});
  
  // Use ref to prevent multiple fetches
  const isFetching = useRef(false);

  useEffect(() => {
    // Prevent multiple simultaneous fetches
    if (isFetching.current) return;
    
    fetchVendorDetails();
    
    return () => {
      isFetching.current = false;
    };
  }, [id]);

  const fetchVendorDetails = async () => {
    // Prevent multiple calls
    if (isFetching.current) return;
    
    try {
      isFetching.current = true;
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching vendor ID:', id);
      const response = await vendorAPI.getById(id);
      console.log('📦 Vendor API Response:', response.data);
      
      // Validate response data
      if (!response.data) {
        throw new Error('No vendor data received');
      }
      
      // Ensure vendor has all required fields
      const vendorData = {
        ...response.data,
        vendor_name: response.data.vendor_name || response.data.name || 'Unnamed Vendor',
        business_category: response.data.business_category || response.data.category || 'Contractor',
        city: response.data.city || response.data.location || 'Location not specified',
        contact_number: response.data.contact_number || response.data.phone || 'Not provided',
        email: response.data.email || '',
        description: response.data.description || '',
        average_rating: response.data.average_rating || 0,
        review_count: response.data.review_count || response.data.reviews || 0,
        logo_url: response.data.logo_url || response.data.imageUrl || '',
        products: response.data.products || [],
      };
      
      console.log('✅ Processed vendor data:', vendorData);
      
      setVendor(vendorData);
      setProducts(vendorData.products || []);
      setLogoError(false);
      setProductImagesError({});
      
    } catch (error) {
      console.error('❌ Failed to fetch vendor details:', error);
      setError(error.message || 'Failed to load vendor details');
      
      // Set minimal vendor data to prevent complete crash
      setVendor({
        vendor_name: 'Vendor',
        business_category: 'Contractor',
        city: 'Location not specified',
        contact_number: 'Not provided',
        email: '',
        description: '',
        average_rating: 0,
        review_count: 0,
        logo_url: '',
        products: [],
      });
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  // Handle logo image error
  const handleLogoError = () => {
    console.log('🖼️ Logo image failed to load');
    setLogoError(true);
  };

  // Handle product image error
  const handleProductImageError = (productId) => {
    setProductImagesError(prev => ({
      ...prev,
      [productId]: true
    }));
  };

  // Get fallback avatar based on vendor name
  const getFallbackAvatar = (name) => {
    if (!name || name === 'Vendor') return 'V';
    const firstLetter = name.charAt(0).toUpperCase();
    return firstLetter.match(/[A-Z]/) ? firstLetter : 'V';
  };

  // Format vendor name safely
  const getVendorName = () => {
    if (!vendor) return 'Vendor';
    return vendor.vendor_name || vendor.name || 'Vendor';
  };

  if (loading && !vendor) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vendor profile...</p>
        </div>
      </div>
    );
  }

  // Don't show "not found" if we have minimal vendor data
  if (error && !vendor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Vendor not found</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Link to="/vendors" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Browse Vendors
        </Link>
      </div>
    );
  }

  const vendorName = getVendorName();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>
          <h1 className="text-3xl font-bold">Vendor Profile</h1>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center">
          {/* VENDOR LOGO SECTION WITH ERROR HANDLING */}
          <div className="mr-6 mb-4 md:mb-0 relative">
            {vendor.logo_url && !logoError ? (
              <img
                src={`http://localhost:5000${vendor.logo_url}`}
                alt={vendorName}
                className="w-32 h-32 rounded-lg object-cover border border-gray-200"
                onError={handleLogoError}
                onLoad={() => setLogoError(false)}
              />
            ) : (
              <div className="w-32 h-32 rounded-lg flex items-center justify-center vendor-fallback-avatar border border-gray-200">
                <span className="text-4xl font-bold text-white">
                  {getFallbackAvatar(vendorName)}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                {/* VENDOR NAME - ALWAYS VISIBLE */}
                <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="vendor-name">
                  {vendorName}
                </h1>
                
                <div className="flex items-center mt-2 flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {vendor.business_category}
                  </span>
                  <DisplayRating value={vendor.average_rating || 0} size={24} />
                  <span className="text-gray-600">
                    ({vendor.review_count || 0} reviews)
                  </span>
                </div>
              </div>
              
              <Link
                to={`/vendor/${id}/feedback`}
                className="mt-4 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Leave Feedback
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center text-gray-700">
                <FaMapMarkerAlt className="text-gray-400 mr-2 flex-shrink-0" />
                <span className="truncate">{vendor.city}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <FaPhone className="text-gray-400 mr-2 flex-shrink-0" />
                <span className="truncate">{vendor.contact_number}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <FaEnvelope className="text-gray-400 mr-2 flex-shrink-0" />
                <span className="truncate">{vendor.email || 'Email not provided'}</span>
              </div>
            </div>
          </div>
        </div>

        {vendor.description && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">About Us</h2>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">{vendor.description}</p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {vendor.review_count || 0}
          </div>
          <div className="text-gray-600 font-medium">Total Reviews</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {vendor.average_rating ? Number(vendor.average_rating).toFixed(1) : '0.0'}
          </div>
          <div className="text-gray-600 font-medium">Average Rating</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {products.length}
          </div>
          <div className="text-gray-600 font-medium">Products</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
          <Link
            to={`/vendor/${id}/feedback`}
            className="block bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Leave Review
          </Link>
        </div>
      </div>

      {/* Products Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Products & Services</h2>
          <span className="text-gray-600 font-medium">
            {products.length} product{products.length !== 1 ? 's' : ''} available
          </span>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center py-12">
            <FaBuilding className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-600">This vendor hasn't added any products yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow duration-300">
                {/* PRODUCT IMAGE WITH ERROR HANDLING */}
                {product.product_image && !productImagesError[product.id] ? (
                  <img
                    src={`http://localhost:5000${product.product_image}`}
                    alt={product.product_name}
                    className="w-full h-48 object-cover rounded-lg mb-4 border border-gray-200"
                    onError={() => handleProductImageError(product.id)}
                    onLoad={() => setProductImagesError(prev => ({
                      ...prev,
                      [product.id]: false
                    }))}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center product-fallback-image border border-gray-200">
                    <FaBuilding className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <h3 className="font-bold text-lg mb-2 text-gray-900">{product.product_name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.short_description}</p>
                {product.price_range && (
                  <div className="text-blue-600 font-medium">
                    {product.price_range}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-bold text-yellow-800 mb-2">Debug Info:</h3>
          <pre className="text-sm text-yellow-700 overflow-auto">
            {JSON.stringify({
              vendorId: id,
              vendorName: vendorName,
              hasVendorData: !!vendor,
              vendorKeys: vendor ? Object.keys(vendor) : [],
              logoUrl: vendor?.logo_url,
              error: error
            }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default VendorProfilePage;