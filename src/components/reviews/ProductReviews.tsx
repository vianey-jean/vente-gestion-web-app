
import React, { useState, useEffect } from 'react';
import { Review, reviewsAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import ReviewsList from './ReviewsList';
import ReviewForm from './ReviewForm';
import ReviewDetail from './ReviewDetail';

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedTab, setSelectedTab] = useState('all');
  const [reviewDetailOpen, setReviewDetailOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewsAPI.getProductReviews(productId);
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Impossible de charger les avis");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleAddReview = async (formData: FormData) => {
    try {
      await reviewsAPI.addReview({
        productId,
        productRating: Number(formData.get('productRating')),
        deliveryRating: Number(formData.get('deliveryRating')),
        comment: formData.get('comment') as string,
        photos: formData.getAll('photos') as File[]
      });
      
      toast.success("Avis ajouté avec succès");
      await fetchReviews();
    } catch (error) {
      console.error("Error adding review:", error);
      toast.error("Impossible d'ajouter l'avis");
    }
  };

  const handleViewReview = async (reviewId: string) => {
    try {
      const reviewToView = reviews.find(review => review.id === reviewId);
      if (reviewToView) {
        setSelectedReview(reviewToView);
        setReviewDetailOpen(true);
      }
    } catch (error) {
      console.error("Error viewing review details:", error);
      toast.error("Impossible de voir les détails de l'avis");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await reviewsAPI.deleteReview(reviewId);
      toast.success("Avis supprimé avec succès");
      setReviewDetailOpen(false);
      await fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Impossible de supprimer l'avis");
    }
  };

  // Filter reviews by rating
  const filterReviewsByRating = (rating: number) => {
    return reviews.filter(review => 
      Math.round((review.productRating + review.deliveryRating) / 2) === rating
    );
  };

  const excellentReviews = filterReviewsByRating(5);
  const goodReviews = filterReviewsByRating(4);
  const averageReviews = filterReviewsByRating(3);
  const poorReviews = filterReviewsByRating(2).concat(filterReviewsByRating(1));

  // Check if user has already reviewed this product
  const hasUserReviewed = user && reviews.some(review => review.userId === user.id);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Avis clients</h2>
      
      {user && !hasUserReviewed && (
        <div className="mb-6">
          <Button 
            onClick={() => document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' })}
            variant="outline"
          >
            Ajouter un avis
          </Button>
        </div>
      )}

      <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="all">
            Tous ({reviews.length})
          </TabsTrigger>
          <TabsTrigger value="excellent">
            Excellents ({excellentReviews.length})
          </TabsTrigger>
          <TabsTrigger value="good">
            Bons ({goodReviews.length})
          </TabsTrigger>
          <TabsTrigger value="average">
            Moyens ({averageReviews.length})
          </TabsTrigger>
          <TabsTrigger value="poor">
            Médiocres ({poorReviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ReviewsList 
            reviews={reviews} 
            loading={loading}
            onViewReview={handleViewReview}
          />
        </TabsContent>
        
        <TabsContent value="excellent">
          <ReviewsList 
            reviews={excellentReviews} 
            loading={loading}
            onViewReview={handleViewReview}
          />
        </TabsContent>
        
        <TabsContent value="good">
          <ReviewsList 
            reviews={goodReviews} 
            loading={loading}
            onViewReview={handleViewReview}
          />
        </TabsContent>
        
        <TabsContent value="average">
          <ReviewsList 
            reviews={averageReviews} 
            loading={loading}
            onViewReview={handleViewReview}
          />
        </TabsContent>
        
        <TabsContent value="poor">
          <ReviewsList 
            reviews={poorReviews} 
            loading={loading}
            onViewReview={handleViewReview}
          />
        </TabsContent>
      </Tabs>

      {user && !hasUserReviewed && (
        <div id="review-form" className="mt-12 border-t pt-8">
          <h3 className="text-xl font-semibold mb-4">Partagez votre expérience</h3>
          <ReviewForm onSubmit={handleAddReview} />
        </div>
      )}

      <Dialog open={reviewDetailOpen} onOpenChange={setReviewDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedReview && (
            <ReviewDetail 
              reviewId={selectedReview.id}
              onClose={() => setReviewDetailOpen(false)}
              onDelete={handleDeleteReview}
              canDelete={user?.id === selectedReview.userId || user?.role === 'admin'}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductReviews;
