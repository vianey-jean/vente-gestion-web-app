
import React from 'react';
import { Review } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import StarRating from './StarRating';
import ReviewPhotoThumbnails from './ReviewPhotoThumbnails';
import { Loader2 } from 'lucide-react';

export interface ReviewsListProps {
  reviews: Review[];
  loading?: boolean;
  onViewReview: (reviewId: string) => Promise<void>;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ reviews, loading = false, onViewReview }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-10 border rounded-md">
        <p className="text-muted-foreground">Aucun avis pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map(review => (
        <Card key={review.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{review.userName}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <StarRating rating={(review.productRating + review.deliveryRating) / 2} />
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(review.createdAt), 'dd MMMM yyyy', { locale: fr })}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-sm line-clamp-3">{review.comment}</p>
            </div>

            {review.photos && review.photos.length > 0 && (
              <div className="mt-3">
                <ReviewPhotoThumbnails photos={review.photos} maxDisplay={3} />
              </div>
            )}

            <div className="mt-3 text-right">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onViewReview(review.id)}
              >
                Voir détails
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReviewsList;
