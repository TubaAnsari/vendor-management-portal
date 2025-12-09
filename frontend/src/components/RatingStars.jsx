import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const RatingStars = ({ value = 0, edit = false, size = 24, onChange }) => {
    // Ensure value is a number and handle null/undefined
    const numericValue = Number(value) || 0;
    
    const renderStars = () => {
        const stars = [];
        const fullStars = Math.floor(numericValue);
        const hasHalfStar = numericValue % 1 >= 0.5;
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <FaStar
                    key={`full-${i}`}
                    className="text-yellow-500 cursor-pointer"
                    style={{ fontSize: size }}
                    onClick={() => edit && onChange(i + 1)}
                />
            );
        }
        
        // Half star
        if (hasHalfStar) {
            stars.push(
                <FaStarHalfAlt
                    key="half"
                    className="text-yellow-500 cursor-pointer"
                    style={{ fontSize: size }}
                    onClick={() => edit && onChange(fullStars + 0.5)}
                />
            );
        }
        
        // Empty stars
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <FaRegStar
                    key={`empty-${i}`}
                    className="text-gray-300 cursor-pointer"
                    style={{ fontSize: size }}
                    onClick={() => edit && onChange(fullStars + i + 1)}
                />
            );
        }
        
        return stars;
    };

    return (
        <div className="flex items-center">
            {renderStars()}
        </div>
    );
};

export const DisplayRating = ({ value = 0, size = 20 }) => {
    // Ensure value is a number, default to 0 if null/undefined
    const numericValue = Number(value) || 0;
    
    return (
        <div className="flex items-center">
            <RatingStars value={numericValue} size={size} />
            <span className="ml-2 text-gray-600 font-medium">
                {numericValue.toFixed(1)}
            </span>
        </div>
    );
};

export default RatingStars;