import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaStar, FaBuilding, FaChartBar } from 'react-icons/fa';
import { adminAPI } from '../services/api';

const AdminPage = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [stats, setStats] = useState({
        totalVendors: 0,
        averageRating: 0,
        totalReviews: 0,
        totalProducts: 0
    });

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const response = await adminAPI.getAllVendors();
            setVendors(response.data);
            
            // Calculate stats
            const totalVendors = response.data.length;
            const totalReviews = response.data.reduce((sum, vendor) => sum + vendor.review_count, 0);
            const totalProducts = response.data.reduce((sum, vendor) => sum + vendor.product_count, 0);
            const averageRating = totalVendors > 0 
    ? response.data.reduce((sum, vendor) => sum + (Number(vendor.average_rating) || 0), 0) / totalVendors
    : 0;


            setStats({
                totalVendors,
                averageRating: parseFloat(averageRating.toFixed(1)),
                totalReviews,
                totalProducts
            });
        } catch (error) {
            console.error('Failed to fetch vendors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewVendor = async (vendorId) => {
        try {
            const response = await adminAPI.getVendorDetails(vendorId);
            setSelectedVendor(response.data);
        } catch (error) {
            console.error('Failed to fetch vendor details:', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <div className="text-gray-600">
                    Total: {vendors.length} vendors
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="card">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                            <FaBuilding className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats.totalVendors}</div>
                            <div className="text-gray-600">Total Vendors</div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                            <FaStar className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats.averageRating}</div>
                            <div className="text-gray-600">Avg Rating</div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                            <FaChartBar className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats.totalReviews}</div>
                            <div className="text-gray-600">Total Reviews</div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                            <FaChartBar className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats.totalProducts}</div>
                            <div className="text-gray-600">Total Products</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Vendors Table */}
                <div className="lg:col-span-2">
                    <div className="card">
                        <h2 className="text-xl font-semibold mb-6">All Vendors</h2>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Vendor
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Rating
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Reviews
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {vendors.map((vendor) => (
                                        <tr key={vendor.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center">
                                                    {vendor.logo_url ? (
                                                        <img
                                                            src={`http://localhost:5000${vendor.logo_url}`}
                                                            alt={vendor.vendor_name}
                                                            className="w-10 h-10 rounded-full object-cover mr-3"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                                            <FaBuilding className="w-5 h-5 text-gray-500" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {vendor.vendor_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {vendor.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                    {vendor.business_category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center">
    <FaStar className="w-4 h-4 text-yellow-500 mr-1" />
    <span className="font-medium">
        {vendor.average_rating ? Number(vendor.average_rating).toFixed(1) : '0.0'}
    </span>
</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-gray-900">
                                                    {vendor.review_count}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleViewVendor(vendor.id)}
                                                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                                                    >
                                                        <FaEye className="mr-1" /> View
                                                    </button>
                                                    <Link
                                                        to={`/vendor/${vendor.id}`}
                                                        className="flex items-center text-green-600 hover:text-green-800 text-sm"
                                                        target="_blank"
                                                    >
                                                        Profile
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Vendor Details Panel */}
                <div>
                    <div className="card">
                        <h2 className="text-xl font-semibold mb-6">Vendor Details</h2>
                        
                        {selectedVendor ? (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-lg mb-2">{selectedVendor.vendor.vendor_name}</h3>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-gray-600 text-sm">Owner:</span>
                                            <p className="font-medium">{selectedVendor.vendor.owner_name}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 text-sm">Contact:</span>
                                            <p className="font-medium">{selectedVendor.vendor.contact_number}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 text-sm">Email:</span>
                                            <p className="font-medium">{selectedVendor.vendor.email}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 text-sm">Location:</span>
                                            <p className="font-medium">{selectedVendor.vendor.city}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 text-sm">Registered:</span>
                                            <p className="font-medium">{formatDate(selectedVendor.vendor.created_at)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-3">Statistics</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {selectedVendor.products.length}
                                            </div>
                                            <div className="text-sm text-gray-600">Products</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">
                                                {selectedVendor.reviews.length}
                                            </div>
                                            <div className="text-sm text-gray-600">Reviews</div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-3">Latest Review</h4>
                                    {selectedVendor.reviews.length > 0 ? (
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-medium">
                                                    {selectedVendor.reviews[0].client_name}
                                                </span>
                                                <div className="flex items-center">
                                                    {[...Array(5)].map((_, i) => (
                                                        <FaStar
                                                            key={i}
                                                            className={`w-4 h-4 ${
                                                                i < selectedVendor.reviews[0].rating
                                                                    ? 'text-yellow-500'
                                                                    : 'text-gray-300'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700">
                                                {selectedVendor.reviews[0].comments}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm">No reviews yet</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FaEye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600">Select a vendor to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;