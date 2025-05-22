
import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  color?: string;
  onClick?: (rating: number) => void;
  readOnly?: boolean;
  value?: number; // Added to support ReviewForm
  onChange?: (rating: number) => void; // Added to support ReviewForm
  id?: string; // Added to support ReviewForm
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  value, // Use value if provided, otherwise use rating
  maxRating = 5,
  size = 20,
  color = 'gold',
  onClick,
  onChange,
  readOnly = true,
  id
}) => {
  // Use value if it's provided (for controlled components like forms)
  const displayRating = value !== undefined ? value : rating;
  
  const handleStarClick = (starRating: number) => {
    if (!readOnly) {
      if (onClick) onClick(starRating);
      if (onChange) onChange(starRating);
    }
  };

  const stars = [];

  for (let i = 1; i <= maxRating; i++) {
    stars.push(
      <Star
        key={i}
        size={size}
        fill={i <= displayRating ? color : 'transparent'}
        stroke={i <= displayRating ? color : '#ccc'}
        className={!readOnly ? 'cursor-pointer transition-transform hover:scale-110' : ''}
        onClick={() => handleStarClick(i)}
        id={id ? `${id}-star-${i}` : undefined}
      />
    );
  }

  return <div className="flex gap-1">{stars}</div>;
};

export default StarRating;
