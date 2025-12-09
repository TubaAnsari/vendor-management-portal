import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';

const RegisterPage = () => {
    const navigate = useNavigate();

    const businessCategories = [
        'Contractor',
        'Material Supplier',
        'Consultant',
        'Fabricator',
        'Manufacturer',
        'Service Provider',
        'Other'
    ];

    const validationSchema = Yup.object({
        vendor_name: Yup.string()
            .required('Vendor name is required')
            .min(2, 'Vendor name must be at least 2 characters'),
        owner_name: Yup.string()
            .required('Owner name is required'),
        contact_number: Yup.string()
            .required('Contact number is required')
            .matches(/^[0-9]{10}$/, 'Contact number must be 10 digits'),
        email: Yup.string()
            .email('Invalid email address')
            .required('Email is required'),
        business_category: Yup.string()
            .required('Business category is required'),
        city: Yup.string()
            .required('City is required'),
        description: Yup.string()
            .required('Description is required')
            .min(10, 'Description must be at least 10 characters'),
        password: Yup.string()
            .required('Password is required')
            .min(6, 'Password must be at least 6 characters'),
        confirm_password: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required('Confirm password is required'),
    });

    const formik = useFormik({
        initialValues: {
            vendor_name: '',
            owner_name: '',
            contact_number: '',
            email: '',
            business_category: '',
            city: '',
            description: '',
            logo: null,
            password: '',
            confirm_password: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                const formData = new FormData();
                
                // Add all fields to formData
                Object.keys(values).forEach(key => {
                    if (key !== 'confirm_password') {
                        if (key === 'logo' && values[key]) {
                            formData.append(key, values[key]);
                        } else if (key !== 'logo') {
                            formData.append(key, values[key]);
                        }
                    }
                });

                const response = await authAPI.register(formData);
                
                toast.success('Registration successful!');
                navigate('/login');
            } catch (error) {
                toast.error(error.response?.data?.error || 'Registration failed');
            }
        },
    });

    const handleFileChange = (event) => {
        formik.setFieldValue('logo', event.currentTarget.files[0]);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="card">
                <h1 className="text-2xl font-bold text-center mb-6">Vendor Registration</h1>
                
                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vendor Name *
                            </label>
                            <input
                                type="text"
                                name="vendor_name"
                                className="input-field"
                                placeholder="Enter vendor name"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.vendor_name}
                            />
                            {formik.touched.vendor_name && formik.errors.vendor_name && (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.vendor_name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Owner Name *
                            </label>
                            <input
                                type="text"
                                name="owner_name"
                                className="input-field"
                                placeholder="Enter owner name"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.owner_name}
                            />
                            {formik.touched.owner_name && formik.errors.owner_name && (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.owner_name}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contact Number *
                            </label>
                            <input
                                type="text"
                                name="contact_number"
                                className="input-field"
                                placeholder="Enter 10-digit contact number"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.contact_number}
                            />
                            {formik.touched.contact_number && formik.errors.contact_number && (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.contact_number}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                name="email"
                                className="input-field"
                                placeholder="Enter email address"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.email}
                            />
                            {formik.touched.email && formik.errors.email && (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Business Category *
                            </label>
                            <select
                                name="business_category"
                                className="input-field"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.business_category}
                            >
                                <option value="">Select Category</option>
                                {businessCategories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                            {formik.touched.business_category && formik.errors.business_category && (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.business_category}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                City *
                            </label>
                            <input
                                type="text"
                                name="city"
                                className="input-field"
                                placeholder="Enter city"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.city}
                            />
                            {formik.touched.city && formik.errors.city && (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.city}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description *
                        </label>
                        <textarea
                            name="description"
                            rows="3"
                            className="input-field"
                            placeholder="Describe your business..."
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.description}
                        />
                        {formik.touched.description && formik.errors.description && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.description}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company Logo (Optional)
                        </label>
                        <input
                            type="file"
                            name="logo"
                            accept="image/*"
                            className="input-field"
                            onChange={handleFileChange}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Supported formats: JPG, PNG, GIF (max 5MB)
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password *
                            </label>
                            <input
                                type="password"
                                name="password"
                                className="input-field"
                                placeholder="Enter password"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.password}
                            />
                            {formik.touched.password && formik.errors.password && (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password *
                            </label>
                            <input
                                type="password"
                                name="confirm_password"
                                className="input-field"
                                placeholder="Confirm password"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.confirm_password}
                            />
                            {formik.touched.confirm_password && formik.errors.confirm_password && (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.confirm_password}</p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={formik.isSubmitting}
                        className="w-full btn-primary py-3 mt-4"
                    >
                        {formik.isSubmitting ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;