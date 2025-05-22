
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { reviewsAPI, Review } from '@/services/api';
import ReviewsList from './ReviewsList';
import ReviewForm from './ReviewForm';
import ReviewDetail from './ReviewDetail';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    loadReviews();
  }, [productId]);
  
  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewsAPI.getProductReviews(productId);
      setReviews(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error);
      toast.error('Impossible de charger les commentaires');
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewReview = async (reviewId: string) => {
    try {
      const response = await reviewsAPI.getReviewDetail(reviewId);
      setSelectedReview(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement du commentaire:', error);
      toast.error('Impossible de charger le détail du commentaire');
    }
  };
  
  const handleCloseReviewDetail = () => {
    setSelectedReview(null);
  };
  
  const handleReviewAdded = () => {
    loadReviews();
    setShowReviewForm(false);
  };
  
  const handleDeleteReview = async (reviewId: string) => {
    try {
      await reviewsAPI.deleteReview(reviewId);
      toast.success('Commentaire supprimé avec succès');
      loadReviews();
      setSelectedReview(null);
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error);
      toast.error('Impossible de supprimer le commentaire');
    }
  };
  
  const userHasReviewed = reviews.some(review => user && review.userId === user.id);
  
  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Avis clients ({reviews.length})</CardTitle>
        {user && !userHasReviewed && !showReviewForm && (
          <Button onClick={() => setShowReviewForm(true)}>
            Laisser un avis
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-4 max-w-[400px] mb-4">
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="positive">Positifs</TabsTrigger>
            <TabsTrigger value="average">Moyens</TabsTrigger>
            <TabsTrigger value="negative">Négatifs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {showReviewForm && (
              <ReviewForm productId={productId} onReviewAdded={handleReviewAdded} />
            )}
            <ReviewsList 
              reviews={reviews} 
              loading={loading} 
              onViewReview={handleViewReview} 
            />
          </TabsContent>
          
          <TabsContent value="positive">
            <ReviewsList 
              reviews={reviews.filter(review => review.productRating >= 4)} 
              loading={loading} 
              onViewReview={handleViewReview} 
            />
          </TabsContent>
          
          <TabsContent value="average">
            <ReviewsList 
              reviews={reviews.filter(review => review.productRating === 3)} 
              loading={loading} 
              onViewReview={handleViewReview} 
            />
          </TabsContent>
          
          <TabsContent value="negative">
            <ReviewsList 
              reviews={reviews.filter(review => review.productRating < 3)} 
              loading={loading} 
              onViewReview={handleViewReview} 
            />
          </TabsContent>
        </Tabs>
        
        {selectedReview && (
          <ReviewDetail 
            review={selectedReview} 
            onClose={handleCloseReviewDetail}
            onDelete={handleDeleteReview}
            canDelete={user?.id === selectedReview.userId || user?.role === 'admin'}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ProductReviews;
