-- Create database
CREATE DATABASE vendor_portal;

-- Connect to database
\c vendor_portal;

-- Create vendors table
CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    vendor_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    business_category VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    password VARCHAR(255) NOT NULL,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    product_image VARCHAR(500),
    short_description TEXT,
    price_range VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reviews table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
    client_name VARCHAR(255) NOT NULL,
    project_name VARCHAR(255),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comments TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_vendors_email ON vendors(email);
CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_reviews_vendor_id ON reviews(vendor_id);
CREATE INDEX idx_vendors_category ON vendors(business_category);
CREATE INDEX idx_vendors_city ON vendors(city);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();