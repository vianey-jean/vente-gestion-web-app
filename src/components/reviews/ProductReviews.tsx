import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  createReview as createReviewAPI,
  getReviews as getReviewsAPI,
  updateReview as updateReviewAPI,
  deleteReview as deleteReviewAPI,
  Review as ReviewType,
  User as UserType
} from '@/services/api';
import StarRating from '@/components/reviews/StarRating';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Delete } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ProductReviewsProps {
  productId: string;
}

interface ReviewDetailProps {
  review: ReviewType;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
}

const ReviewDetail: React.FC<ReviewDetailProps> = ({ review, isOpen, onClose, onDelete, canDelete }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Détail de l'avis</DialogTitle>
          <DialogDescription>
            Avis de {review.user.nom} le {format(new Date(review.createdAt), 'dd MMMM yyyy', { locale: fr })}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={review.user.image} />
              <AvatarFallback>{review.user.nom.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{review.user.nom}</p>
              <StarRating rating={review.rating} readOnly={true} />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">{review.comment}</p>
          </div>
        </div>
        {canDelete && (
          <Button variant="destructive" onClick={() => onDelete(review.id)}><Delete className="mr-2 h-4 w-4" />Supprimer</Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewType | null>(null);
  const { user } = useAuth();

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const reviewsData = await getReviewsAPI(productId);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour laisser un avis.');
      return;
    }

    if (!comment.trim()) {
      toast.error('Le commentaire ne peut pas être vide.');
      return;
    }

    if (!rating) {
      toast.error('Veuillez donner une note au produit.');
      return;
    }

    try {
      const newReview = await createReviewAPI({
        productId,
        comment,
        rating,
      });

      setReviews(prevReviews => [...prevReviews, newReview]);
      setComment('');
      setRating(null);
      toast.success('Avis ajouté avec succès!');
    } catch (error) {
      console.error('Error creating review:', error);
      toast.error('Erreur lors de la création de l\'avis.');
    }
  };

  const handleUpdateReview = async (id: string, updatedComment: string, updatedRating: number) => {
    try {
      await updateReviewAPI(id, { comment: updatedComment, rating: updatedRating });
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review.id === id ? { ...review, comment: updatedComment, rating: updatedRating } : review
        )
      );
      toast.success('Review updated successfully!');
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review.');
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      await deleteReviewAPI(id);
      setReviews(prevReviews => prevReviews.filter(review => review.id !== id));
      toast.success('Review deleted successfully!');
      handleCloseReview();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review.');
    }
  };

  const handleOpenReview = (review: ReviewType) => {
    setSelectedReview(review);
  };

  const handleCloseReview = () => {
    setSelectedReview(null);
  };

  const canUserDeleteReview = selectedReview?.userId === user?.id || user?.role === 'admin';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avis sur le produit</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center space-x-2">
          <StarRating
            rating={rating}
            onChange={(newRating) => setRating(newRating)}
            readOnly={false}
            id="product-review"
          />
        </div>
        <div className="grid gap-2">
          <Textarea
            placeholder="Écrivez votre avis ici"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button onClick={handleSubmitReview} disabled={loading}>
            {loading ? 'Envoi en cours...' : 'Soumettre l\'avis'}
          </Button>
        </div>

        {/* Display Reviews */}
        {loading ? (
          <div>Chargement des avis...</div>
        ) : (
          <ScrollArea className="h-[300px] w-full rounded-md border">
            <div className="p-4">
              {reviews.length === 0 ? (
                <div>Aucun avis pour le moment.</div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="mb-4 p-4 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleOpenReview(review)}>
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src={review.user.image} />
                        <AvatarFallback>{review.user.nom.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{review.user.nom}</p>
                        <StarRating rating={review.rating} readOnly={true} />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        )}

        {selectedReview && (
          <ReviewDetail 
            review={selectedReview}
            isOpen={!!selectedReview}
            onClose={handleCloseReview}
            onDelete={handleDeleteReview}
            canDelete={canUserDeleteReview}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ProductReviews;
