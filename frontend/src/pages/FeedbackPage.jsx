import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaStar, FaArrowLeft, FaComment } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { reviewAPI, vendorAPI } from '../services/api';
import RatingStars from '../components/RatingStars';

const FeedbackPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVendorAndReviews();
    }, [id]);

    const fetchVendorAndReviews = async () => {
        try {
            const [vendorResponse, reviewsResponse] = await Promise.all([
                vendorAPI.getById(id),
                reviewAPI.getByVendor(id)
            ]);
            
            setVendor(vendorResponse.data);
            setReviews(reviewsResponse.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const validationSchema = Yup.object({
        client_name: Yup.string().required('Client name is required'),
        project_name: Yup.string(),
        rating: Yup.number()
            .min(1, 'Rating must be at least 1')
            .max(5, 'Rating must be at most 5')
            .required('Rating is required'),
        comments: Yup.string().required('Comments are required'),
    });

    const formik = useFormik({
        initialValues: {
            client_name: '',
            project_name: '',
            rating: 5,
            comments: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                await reviewAPI.create(id, values);
                toast.success('Feedback submitted successfully!');
                formik.resetForm();
                fetchVendorAndReviews();
            } catch (error) {
                toast.error(error.response?.data?.error || 'Failed to submit feedback');
            }
        },
    });

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
                <button
                    onClick={() => navigate('/vendors')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    Browse Vendors
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
                >
                    <FaArrowLeft className="mr-2" /> Back
                </button>
                <h1 className="text-3xl font-bold">Feedback & Reviews</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                        <h2 className="text-2xl font-bold mb-6">Submit Feedback</h2>
                        
                        <form onSubmit={formik.handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Your Name *
                                </label>
                                <input
                                    type="text"
                                    name="client_name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter your name"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.client_name}
                                />
                                {formik.touched.client_name && formik.errors.client_name && (
                                    <p className="mt-1 text-sm text-red-600">{formik.errors.client_name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Project Name (Optional)
                                </label>
                                <input
                                    type="text"
                                    name="project_name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter project name"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.project_name}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Rating *
                                </label>
                                <div className="flex items-center space-x-2">
                                    <RatingStars
                                        value={formik.values.rating}
                                        edit={true}
                                        onChange={(newRating) => {
                                            formik.setFieldValue('rating', newRating);
                                        }}
                                    />
                                    <span className="text-gray-600">
                                        {formik.values.rating} stars
                                    </span>
                                </div>
                                {formik.touched.rating && formik.errors.rating && (
                                    <p className="mt-1 text-sm text-red-600">{formik.errors.rating}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Comments *
                                </label>
                                <textarea
                                    name="comments"
                                    rows="4"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Share your experience with this vendor..."
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.comments}
                                />
                                {formik.touched.comments && formik.errors.comments && (
                                    <p className="mt-1 text-sm text-red-600">{formik.errors.comments}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={formik.isSubmitting}
                                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700"
                            >
                                {formik.isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="font-bold text-lg mb-4">Vendor Information</h3>
                        <div className="flex items-center mb-4">
                            {vendor.logo_url ? (
                                <img
                                    src={`http://localhost:5000${vendor.logo_url}`}
                                    alt={vendor.vendor_name}
                                    className="w-16 h-16 rounded-lg object-cover mr-4"
                                />
                            ) : (
                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                                    <FaStar className="w-8 h-8 text-gray-500" />
                                </div>
                            )}
                            <div>
                                <h4 className="font-semibold">{vendor.vendor_name}</h4>
                                <span className="text-sm text-gray-600">{vendor.business_category}</span>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Average Rating:</span>
                                <span className="font-semibold">
                                    {vendor.average_rating ? Number(vendor.average_rating).toFixed(1) : '0.0'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Reviews:</span>
                                <span className="font-semibold">{vendor.review_count}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="font-bold text-lg mb-4">Recent Reviews</h3>
                        {reviews.length === 0 ? (
                            <div className="text-center py-4">
                                <FaComment className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-600">No reviews yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reviews.slice(0, 3).map((review) => (
                                    <div key={review.id} className="pb-4 border-b last:border-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold">{review.client_name}</span>
                                            <div className="flex items-center">
                                                <RatingStars value={review.rating} size={16} />
                                            </div>
                                        </div>
                                        {review.project_name && (
                                            <p className="text-sm text-gray-600 mb-2">
                                                Project: {review.project_name}
                                            </p>
                                        )}
                                        <p className="text-gray-700 text-sm">{review.comments}</p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {reviews.length > 3 && (
                            <button
                                onClick={() => navigate(`/vendor/${id}`)}
                                className="w-full mt-4 text-center text-blue-600 hover:text-blue-700 text-sm"
                            >
                                View all {reviews.length} reviews →
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedbackPage;