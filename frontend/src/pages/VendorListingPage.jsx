import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './VendorsList.css';

const VendorsList = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New vendor form state
  const [newVendor, setNewVendor] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    imageUrl: '',
    category: '',
    description: '',
    createdAt: new Date().toISOString()
  });

  // Fetch vendors from Firestore
  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const vendorsCollection = collection(db, 'vendors');
      const vendorSnapshot = await getDocs(vendorsCollection);
      const vendorsList = vendorSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Ensure imageUrl exists even if undefined
        imageUrl: doc.data().imageUrl || '',
        // Ensure all required fields have default values
        name: doc.data().name || 'Unnamed Vendor',
        email: doc.data().email || '',
        phone: doc.data().phone || '',
        category: doc.data().category || 'General',
      }));
      
      // Validate and sanitize vendor data
      const validatedVendors = vendorsList.map(vendor => {
        // Check for invalid image URLs
        let safeImageUrl = vendor.imageUrl;
        if (vendor.imageUrl && !isValidImageUrl(vendor.imageUrl)) {
          safeImageUrl = '';
          console.warn(`Invalid image URL for vendor ${vendor.id}: ${vendor.imageUrl}`);
        }
        
        return {
          ...vendor,
          imageUrl: safeImageUrl,
          // Add timestamp for sorting if missing
          createdAt: vendor.createdAt || new Date().toISOString(),
        };
      });
      
      // Sort by creation date (newest first)
      validatedVendors.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setVendors(validatedVendors);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError(`Failed to load vendors: ${err.message}`);
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  // Validate image URL
  const isValidImageUrl = (url) => {
    if (!url || url.trim() === '') return false;
    
    try {
      const parsedUrl = new URL(url);
      // Allow common image extensions
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      const hasValidExtension = validExtensions.some(ext => 
        parsedUrl.pathname.toLowerCase().endsWith(ext)
      );
      
      return hasValidExtension || 
             url.startsWith('data:image/') || 
             url.startsWith('blob:') ||
             url.includes('cloudinary') ||
             url.includes('firebasestorage');
    } catch {
      // Not a valid URL, could be a base64 or relative path
      return url.startsWith('data:image/') || 
             url.startsWith('/') ||
             url.startsWith('./');
    }
  };

  // Get fallback image based on vendor name
  const getFallbackImage = (vendorName) => {
    const initials = vendorName
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'V';
    
    return `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff&size=200`;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingVendor) {
      setEditingVendor(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setNewVendor(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Add new vendor
  const handleAddVendor = async (e) => {
    e.preventDefault();
    
    if (!newVendor.name.trim()) {
      toast.error('Vendor name is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare vendor data with defaults
      const vendorData = {
        name: newVendor.name.trim(),
        email: newVendor.email.trim() || '',
        phone: newVendor.phone.trim() || '',
        address: newVendor.address.trim() || '',
        imageUrl: newVendor.imageUrl.trim() || '',
        category: newVendor.category.trim() || 'General',
        description: newVendor.description.trim() || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Validate image URL
      if (vendorData.imageUrl && !isValidImageUrl(vendorData.imageUrl)) {
        toast.warn('Invalid image URL. Using default avatar.');
        vendorData.imageUrl = '';
      }
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'vendors'), vendorData);
      
      // Update local state
      const addedVendor = {
        id: docRef.id,
        ...vendorData
      };
      
      setVendors(prev => [addedVendor, ...prev]);
      
      // Reset form
      setNewVendor({
        name: '',
        email: '',
        phone: '',
        address: '',
        imageUrl: '',
        category: '',
        description: '',
        createdAt: new Date().toISOString()
      });
      setShowAddForm(false);
      
      toast.success('Vendor added successfully!');
    } catch (err) {
      console.error('Error adding vendor:', err);
      setError(`Failed to add vendor: ${err.message}`);
      toast.error('Failed to add vendor');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update vendor
  const handleUpdateVendor = async (e) => {
    e.preventDefault();
    
    if (!editingVendor?.name?.trim()) {
      toast.error('Vendor name is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare update data
      const updateData = {
        name: editingVendor.name.trim(),
        email: editingVendor.email?.trim() || '',
        phone: editingVendor.phone?.trim() || '',
        address: editingVendor.address?.trim() || '',
        imageUrl: editingVendor.imageUrl?.trim() || '',
        category: editingVendor.category?.trim() || 'General',
        description: editingVendor.description?.trim() || '',
        updatedAt: new Date().toISOString(),
      };
      
      // Validate image URL
      if (updateData.imageUrl && !isValidImageUrl(updateData.imageUrl)) {
        toast.warn('Invalid image URL. Using default avatar.');
        updateData.imageUrl = '';
      }
      
      // Update in Firestore
      const vendorDoc = doc(db, 'vendors', editingVendor.id);
      await updateDoc(vendorDoc, updateData);
      
      // Update local state
      setVendors(prev => prev.map(vendor => 
        vendor.id === editingVendor.id 
          ? { ...vendor, ...updateData }
          : vendor
      ));
      
      // Reset editing state
      setEditingVendor(null);
      
      toast.success('Vendor updated successfully!');
    } catch (err) {
      console.error('Error updating vendor:', err);
      setError(`Failed to update vendor: ${err.message}`);
      toast.error('Failed to update vendor');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete vendor
  const handleDeleteVendor = async (vendorId) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'vendors', vendorId));
      
      // Update local state
      setVendors(prev => prev.filter(vendor => vendor.id !== vendorId));
      
      toast.success('Vendor deleted successfully!');
    } catch (err) {
      console.error('Error deleting vendor:', err);
      setError(`Failed to delete vendor: ${err.message}`);
      toast.error('Failed to delete vendor');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Reload page
  const handleReload = () => {
    window.location.reload();
  };

  // Load vendors on component mount
  useEffect(() => {
    fetchVendors();
  }, []);

  // Render loading state
  if (loading) {
    return (
      <div className="vendors-loading">
        <div className="loading-spinner"></div>
        <p>Loading vendors...</p>
      </div>
    );
  }

  return (
    <div className="vendors-container">
      <div className="vendors-header">
        <h1>Vendors</h1>
        <button 
          onClick={() => setShowAddForm(true)}
          className="btn-add-vendor"
          disabled={isSubmitting}
        >
          + Add New Vendor
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <div className="error-details">
              <h3>Something went wrong</h3>
              <p>{error}</p>
              <div className="error-actions">
                <button onClick={fetchVendors} className="btn-retry">
                  Try Again
                </button>
                <button onClick={handleReload} className="btn-reload">
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingVendor) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</h2>
              <button 
                onClick={() => {
                  setShowAddForm(false);
                  setEditingVendor(null);
                }}
                className="btn-close"
                disabled={isSubmitting}
              >
                &times;
              </button>
            </div>
            
            <form 
              onSubmit={editingVendor ? handleUpdateVendor : handleAddVendor}
              className="vendor-form"
            >
              <div className="form-group">
                <label htmlFor="name">Vendor Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={editingVendor ? editingVendor.name : newVendor.name}
                  onChange={handleInputChange}
                  placeholder="Enter vendor name"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="imageUrl">Image URL</label>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  value={editingVendor ? editingVendor.imageUrl : newVendor.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  disabled={isSubmitting}
                />
                <small className="form-hint">
                  Leave empty for default avatar. Supports JPG, PNG, GIF, WebP, SVG, or base64.
                </small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editingVendor ? editingVendor.email : newVendor.email}
                    onChange={handleInputChange}
                    placeholder="vendor@example.com"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={editingVendor ? editingVendor.phone : newVendor.phone}
                    onChange={handleInputChange}
                    placeholder="(123) 456-7890"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={editingVendor ? editingVendor.category : newVendor.category}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                >
                  <option value="">Select Category</option>
                  <option value="Supplier">Supplier</option>
                  <option value="Contractor">Contractor</option>
                  <option value="Service Provider">Service Provider</option>
                  <option value="Technology">Technology</option>
                  <option value="Consultant">Consultant</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={editingVendor ? editingVendor.description : newVendor.description}
                  onChange={handleInputChange}
                  placeholder="Additional details about the vendor..."
                  rows="3"
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingVendor(null);
                  }}
                  className="btn-cancel"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="submitting-text">
                      <span className="spinner-small"></span>
                      {editingVendor ? 'Updating...' : 'Adding...'}
                    </span>
                  ) : (
                    editingVendor ? 'Update Vendor' : 'Add Vendor'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vendors Grid */}
      {vendors.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No vendors found</h3>
          <p>Add your first vendor to get started!</p>
          <button 
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            Add Vendor
          </button>
        </div>
      ) : (
        <div className="vendors-grid">
          {vendors.map(vendor => (
            <div key={vendor.id} className="vendor-card">
              <div className="vendor-image-wrapper">
                <ImageWithFallback
                  src={vendor.imageUrl}
                  alt={vendor.name}
                  fallbackSrc={getFallbackImage(vendor.name)}
                  className="vendor-image"
                />
              </div>
              
              <div className="vendor-info">
                <h3 className="vendor-name">{vendor.name}</h3>
                
                {vendor.category && (
                  <span className="vendor-category">{vendor.category}</span>
                )}
                
                {vendor.email && (
                  <p className="vendor-email">
                    <span className="info-icon">📧</span>
                    {vendor.email}
                  </p>
                )}
                
                {vendor.phone && (
                  <p className="vendor-phone">
                    <span className="info-icon">📱</span>
                    {vendor.phone}
                  </p>
                )}
                
                {vendor.description && (
                  <p className="vendor-description">{vendor.description}</p>
                )}
                
                <div className="vendor-meta">
                  <span className="vendor-date">
                    Added: {formatDate(vendor.createdAt)}
                  </span>
                </div>
              </div>
              
              <div className="vendor-actions">
                <button
                  onClick={() => setEditingVendor(vendor)}
                  className="btn-edit"
                  aria-label={`Edit ${vendor.name}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteVendor(vendor.id)}
                  className="btn-delete"
                  aria-label={`Delete ${vendor.name}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Separate ImageWithFallback component to handle image errors
const ImageWithFallback = ({ src, alt, fallbackSrc, className, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src || fallbackSrc);
    setHasError(false);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={`${className} ${hasError ? 'fallback-image' : ''}`}
      onError={handleError}
      loading="lazy"
      {...props}
    />
  );
};

export default VendorsList;