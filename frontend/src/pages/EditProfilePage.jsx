import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

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
    vendor_name: Yup.string().required('Vendor name is required'),
    owner_name: Yup.string().required('Owner name is required'),
    contact_number: Yup.string().required('Contact number is required'),
    business_category: Yup.string().required('Business category is required'),
    city: Yup.string().required('City is required'),
    description: Yup.string().required('Description is required'),
  });

  const formik = useFormik({
    initialValues: {
      vendor_name: '',
      owner_name: '',
      contact_number: '',
      business_category: '',
      city: '',
      description: '',
      logo: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const formData = new FormData();
        Object.keys(values).forEach(key => {
          if (key !== 'logo' && values[key] !== null) {
            formData.append(key, values[key]);
          }
        });
        
        if (values.logo instanceof File) {
          formData.append('logo', values.logo);
        }

        await authAPI.updateProfile(formData);
        toast.success('Profile updated successfully');
        navigate('/dashboard');
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to update profile');
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await authAPI.getProfile();
        const vendor = response.data;
        formik.setValues({
          vendor_name: vendor.vendor_name || '',
          owner_name: vendor.owner_name || '',
          contact_number: vendor.contact_number || '',
          business_category: vendor.business_category || '',
          city: vendor.city || '',
          description: vendor.description || '',
          logo: null,
        });
        
        if (vendor.logo_url) {
          setImagePreview(`http://localhost:5000${vendor.logo_url}`);
        }
      } catch (error) {
        toast.error('Failed to load profile');
      }
    };
    loadProfile();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      formik.setFieldValue('logo', file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Edit Profile</h1>
        
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Name *
              </label>
              <input
                type="text"
                name="vendor_name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formik.values.vendor_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formik.values.owner_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formik.values.contact_number}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.contact_number && formik.errors.contact_number && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.contact_number}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Category *
              </label>
              <select
                name="business_category"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formik.values.business_category}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              name="city"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formik.values.city}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.city && formik.errors.city && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.city}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              onChange={handleFileChange}
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Logo Preview"
                  className="w-32 h-32 object-cover rounded"
                />
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: JPG, PNG, GIF (max 5MB)
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex-1"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;