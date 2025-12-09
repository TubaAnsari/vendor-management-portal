import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';

const LoginPage = () => {
    const navigate = useNavigate();

    const validationSchema = Yup.object({
        email: Yup.string()
            .email('Invalid email address')
            .required('Email is required'),
        password: Yup.string()
            .required('Password is required'),
    });

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                const response = await authAPI.login(values);
                
                // Store token and vendor info
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('vendor', JSON.stringify(response.data.vendor));
                
                toast.success('Login successful!');
                navigate('/dashboard');
            } catch (error) {
                toast.error(error.response?.data?.error || 'Login failed');
            }
        },
    });

    return (
        <div className="max-w-md mx-auto">
            <div className="card">
                <h1 className="text-2xl font-bold text-center mb-6">Vendor Login</h1>
                
                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address *
                        </label>
                        <input
                            type="email"
                            name="email"
                            className="input-field"
                            placeholder="Enter your email"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.email}
                        />
                        {formik.touched.email && formik.errors.email && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password *
                        </label>
                        <input
                            type="password"
                            name="password"
                            className="input-field"
                            placeholder="Enter your password"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.password}
                        />
                        {formik.touched.password && formik.errors.password && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={formik.isSubmitting}
                        className="w-full btn-primary py-3"
                    >
                        {formik.isSubmitting ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;