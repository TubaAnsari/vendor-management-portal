import React, { useState, useEffect } from 'react';
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
  const [logoError, setLogoError] = useState(false);
  const [productImagesError, setProductImagesError] = useState({});

  useEffect(() => {
    fetchVendorDetails();
  }, [id]);

  const fetchVendorDetails = async () => {
    try {
      setLoading(true);
      const response = await vendorAPI.getById(id);
      setVendor(response.data);
      setProducts(response.data.products || []);
      setLogoError(false);
      setProductImagesError({});
    } catch (error) {
      console.error('Failed to fetch vendor details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle logo image error
  const handleLogoError = () => {
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
    if (!name) return 'V';
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Vendor not found</h2>
        <Link to="/vendors" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Browse Vendors
        </Link>
      </div>
    );
  }

  return (
    <div>
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
          <div className="mr-6 mb-4 md:mb-0">
            {vendor.logo_url && !logoError ? (
              <img
                src={`http://localhost:5000${vendor.logo_url}`}
                alt={vendor.vendor_name}
                className="w-32 h-32 rounded-lg object-cover"
                onError={handleLogoError}
                onLoad={() => setLogoError(false)}
              />
            ) : (
              <div className="w-32 h-32 rounded-lg flex items-center justify-center vendor-fallback-avatar">
                <span className="text-4xl font-bold text-white">
                  {getFallbackAvatar(vendor.vendor_name)}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">{vendor.vendor_name}</h1>
                <div className="flex items-center mt-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mr-4">
                    {vendor.business_category}
                  </span>
                  <DisplayRating value={vendor.average_rating || 0} size={24} />
                  <span className="ml-2 text-gray-600">
                    ({vendor.review_count || 0} reviews)
                  </span>
                </div>
              </div>
              
              <Link
                to={`/vendor/${id}/feedback`}
                className="mt-4 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Leave Feedback
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center">
                <FaMapMarkerAlt className="text-gray-400 mr-2" />
                <span>{vendor.city}</span>
              </div>
              <div className="flex items-center">
                <FaPhone className="text-gray-400 mr-2" />
                <span>{vendor.contact_number}</span>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="text-gray-400 mr-2" />
                <span>{vendor.email}</span>
              </div>
            </div>
          </div>
        </div>

        {vendor.description && (
          <div className="mt-8 pt-8 border-t">
            <h2 className="text-xl font-semibold mb-4">About Us</h2>
            <p className="text-gray-700 whitespace-pre-line">{vendor.description}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {vendor.review_count || 0}
          </div>
          <div className="text-gray-600">Total Reviews</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {vendor.average_rating ? Number(vendor.average_rating).toFixed(1) : '0.0'}
          </div>
          <div className="text-gray-600">Average Rating</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {products.length}
          </div>
          <div className="text-gray-600">Products</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <Link
            to={`/vendor/${id}/feedback`}
            className="block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Leave Review
          </Link>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Products & Services</h2>
          <span className="text-gray-600">
            {products.length} products available
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
              <div key={product.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow">
                {/* PRODUCT IMAGE WITH ERROR HANDLING */}
                {product.product_image && !productImagesError[product.id] ? (
                  <img
                    src={`http://localhost:5000${product.product_image}`}
                    alt={product.product_name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                    onError={() => handleProductImageError(product.id)}
                    onLoad={() => setProductImagesError(prev => ({
                      ...prev,
                      [product.id]: false
                    }))}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center product-fallback-image">
                    <FaBuilding className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <h3 className="font-bold text-lg mb-2">{product.product_name}</h3>
                <p className="text-gray-600 text-sm mb-3">{product.short_description}</p>
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

      {/* Add CSS for fallback avatars */}
      <style jsx>{`
        .vendor-fallback-avatar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .product-fallback-image {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
      `}</style>
    </div>
  );
};

export default VendorProfilePage;