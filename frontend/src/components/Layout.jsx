import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('vendor');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <Link to="/" className="text-xl font-bold text-gray-900">
                            Vendor Portal
                        </Link>
                        
                        <div className="flex items-center space-x-4">
                            <Link to="/vendors" className="text-gray-700 hover:text-blue-600">
                                Vendors
                            </Link>
                            
                            {token ? (
                                <>
                                    <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/register" className="text-gray-700 hover:text-blue-600">
                                        Register
                                    </Link>
                                    <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                                        Login
                                    </Link>
                                </>
                            )}
                            
                            <Link to="/admin" className="text-gray-700 hover:text-blue-600">
                                Admin
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;