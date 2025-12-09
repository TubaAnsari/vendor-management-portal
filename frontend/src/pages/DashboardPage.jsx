import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaBox, FaStar, FaChartLine, FaUserMinus, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { authAPI, productAPI } from '../services/api';
import { DisplayRating } from '../components/RatingStars';

const ProductFormModal = ({ 
  show, 
  onClose, 
  onSubmit, 
  initialData = null,
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    product_name: initialData?.product_name || '',
    short_description: initialData?.short_description || '',
    price_range: initialData?.price_range || '',
    product_image: null
  });

  const [imagePreview, setImagePreview] = useState(
    initialData?.product_image ? `http://localhost:5000${initialData.product_image}` : null
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, product_image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">
          {initialData ? 'Edit Product' : 'Add New Product'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              name="product_name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.product_name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="short_description"
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.short_description}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Range (Optional)
            </label>
            <input
              type="text"
              name="price_range"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., $100-$500"
              value={formData.price_range}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Image
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              onChange={handleFileChange}
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Saving...' : initialData ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteProfileModal = ({ show, onClose, onDelete, loading }) => {
  const [reason, setReason] = useState('');
  const [confirmText, setConfirmText] = useState('');

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <FaExclamationTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-700">Delete Profile</h3>
            <p className="text-sm text-gray-600">This action cannot be undone</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for leaving (Optional)
            </label>
            <textarea
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Tell us why you're leaving..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type <span className="font-bold text-red-600">DELETE MY PROFILE</span> to confirm
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="DELETE MY PROFILE"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-2">⚠️ Warning</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Your profile will be permanently deleted</li>
              <li>• All your products will be removed</li>
              <li>• All reviews will be deleted</li>
              <li>• This action cannot be reversed</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onDelete(reason)}
              disabled={confirmText !== 'DELETE MY PROFILE' || loading}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Deleting...' : 'Delete Profile Permanently'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVendorData();
  }, []);

  const fetchVendorData = async () => {
    try {
      const [vendorResponse, productsResponse] = await Promise.all([
        authAPI.getProfile(),
        productAPI.getByVendor()
      ]);
      
      setVendor(vendorResponse.data);
      setProducts(productsResponse.data || []);
    } catch (error) {
      toast.error('Failed to fetch vendor data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (formData) => {
    setFormLoading(true);
    try {
      const apiFormData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          apiFormData.append(key, formData[key]);
        }
      });

      if (editingProduct) {
        await productAPI.update(editingProduct.id, apiFormData);
        toast.success('Product updated successfully');
      } else {
        await productAPI.create(apiFormData);
        toast.success('Product added successfully');
      }
      
      setShowAddProduct(false);
      setEditingProduct(null);
      fetchVendorData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save product');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.delete(productId);
        toast.success('Product deleted successfully');
        fetchVendorData();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleDeleteProfile = async (reason) => {
    setDeleteLoading(true);
    try {
      await authAPI.deleteProfile({ reason });
      
      toast.success('Profile deleted successfully');
      localStorage.removeItem('token');
      localStorage.removeItem('vendor');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete profile');
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
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
        <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Please login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
        <p className="text-gray-600">Welcome back, {vendor.vendor_name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Overview</h2>
            <div className="flex items-center mb-4">
              {vendor.logo_url ? (
                <img
                  src={`http://localhost:5000${vendor.logo_url}`}
                  alt={vendor.vendor_name}
                  className="w-20 h-20 rounded-full object-cover mr-4"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                  <FaBox className="w-10 h-10 text-gray-500" />
                </div>
              )}
              <div>
                <h3 className="font-bold">{vendor.vendor_name}</h3>
                <span className="text-sm text-gray-600">{vendor.business_category}</span>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span>{vendor.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Contact:</span>
                <span>{vendor.contact_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span>{vendor.city}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Link
                to="/profile/edit"
                className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
              >
                Edit Profile
              </Link>
              
              <button
                onClick={() => setShowDeleteModal(true)}
                className="block w-full text-center bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 hover:text-red-700 flex items-center justify-center"
              >
                <FaUserMinus className="mr-2" />
                Delete Profile
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaBox className="text-blue-600 mr-2" />
                  <span>Products</span>
                </div>
                <span className="font-bold">{products.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaStar className="text-yellow-600 mr-2" />
                  <span>Average Rating</span>
                </div>
                <DisplayRating value={vendor.average_rating || 0} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaChartLine className="text-green-600 mr-2" />
                  <span>Reviews</span>
                </div>
                <span className="font-bold">{vendor.review_count || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Products Management</h2>
              <button
                onClick={() => setShowAddProduct(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center"
              >
                <FaPlus className="mr-2" /> Add Product
              </button>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12">
                <FaBox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
                <p className="text-gray-600 mb-4">Add your first product to showcase on your profile</p>
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                >
                  Add Product
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price Range
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            {product.product_image ? (
                              <img
                                src={`http://localhost:5000${product.product_image}`}
                                alt={product.product_name}
                                className="w-12 h-12 rounded object-cover mr-3"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center mr-3">
                                <FaBox className="w-6 h-6 text-gray-500" />
                              </div>
                            )}
                            <span className="font-medium">{product.product_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {product.short_description}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-blue-600 font-medium">
                            {product.price_range || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Public Profile</h2>
            <p className="text-gray-600 mb-4">
              This is how your vendor profile appears to clients
            </p>
            <Link
              to={`/vendor/${vendor.id}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700"
              target="_blank"
            >
              View Public Profile →
            </Link>
          </div>
        </div>
      </div>

      <ProductFormModal
        show={showAddProduct || !!editingProduct}
        onClose={() => {
          setShowAddProduct(false);
          setEditingProduct(null);
        }}
        onSubmit={handleProductSubmit}
        initialData={editingProduct}
        loading={formLoading}
      />

      <DeleteProfileModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDeleteProfile}
        loading={deleteLoading}
      />
    </div>
  );
};

export default DashboardPage;