import React, { useState, useEffect } from 'react';
import { testAPI, vendorAPI } from '../services/api';

const TestConnection = () => {
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testAllConnections = async () => {
      const results = {};
      
      try {
        // Test CORS
        const corsResponse = await testAPI.corsTest();
        results.cors = { success: true, data: corsResponse.data };
      } catch (error) {
        results.cors = { success: false, error: error.message };
      }

      try {
        // Test vendors endpoint
        const vendorsResponse = await vendorAPI.getAll();
        results.vendors = { 
          success: true, 
          count: vendorsResponse.data.length 
        };
      } catch (error) {
        results.vendors = { success: false, error: error.message };
      }

      try {
        // Test health endpoint
        const healthResponse = await testAPI.health();
        results.health = { success: true, data: healthResponse.data };
      } catch (error) {
        results.health = { success: false, error: error.message };
      }

      setStatus(results);
      setLoading(false);
    };

    testAllConnections();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p>Testing connections...</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Connection Test Results</h2>
      
      <div className="space-y-3">
        <div className="p-3 bg-white rounded border">
          <h3 className="font-semibold">CORS Test:</h3>
          {status.cors?.success ? (
            <div className="text-green-600">
              Success - Origin: {status.cors.data?.origin}
            </div>
          ) : (
            <div className="text-red-600">
              Failed: {status.cors?.error}
            </div>
          )}
        </div>

        <div className="p-3 bg-white rounded border">
          <h3 className="font-semibold">Vendors API:</h3>
          {status.vendors?.success ? (
            <div className="text-green-600">
              Success - Found {status.vendors.count} vendors
            </div>
          ) : (
            <div className="text-red-600">
              Failed: {status.vendors?.error}
            </div>
          )}
        </div>

        <div className="p-3 bg-white rounded border">
          <h3 className="font-semibold">Health Check:</h3>
          {status.health?.success ? (
            <div className="text-green-600">
              Success - API is healthy
            </div>
          ) : (
            <div className="text-red-600">
              Failed: {status.health?.error}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded border">
        <h3 className="font-semibold">API Base URL:</h3>
        <code className="text-sm bg-gray-100 p-1 rounded">
          {import.meta.env.VITE_API_URL || 'Not set'}
        </code>
      </div>
    </div>
  );
};

export default TestConnection;