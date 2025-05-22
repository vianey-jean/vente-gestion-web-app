
import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating?: number;
  value?: number;
  maxRating?: number;
  size?: number;
  color?: string;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  id?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  value,
  maxRating = 5,
  size = 20,
  color = 'gold',
  onChange,
  readOnly = true,
  id
}) => {
  // Use value if provided, otherwise use rating
  const currentValue = value !== undefined ? value : (rating || 0);
  
  const stars = [];

  for (let i = 1; i <= maxRating; i++) {
    stars.push(
      <Star
        key={i}
        id={id ? `${id}-star-${i}` : undefined}
        size={size}
        fill={i <= currentValue ? color : 'transparent'}
        stroke={i <= currentValue ? color : '#ccc'}
        className={!readOnly ? 'cursor-pointer transition-transform hover:scale-110' : ''}
        onClick={() => !readOnly && onChange && onChange(i)}
      />
    );
  }

  return <div className="flex gap-1">{stars}</div>;
};

export default StarRating;
