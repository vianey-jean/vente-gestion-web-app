
import React, { useState, useEffect } from 'react';
import { Review, reviewsAPI } from '@/services/api';
import { DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import StarRating from './StarRating';
import { toast } from '@/components/ui/sonner';
import { Loader2 } from 'lucide-react';

export interface ReviewDetailProps {
  reviewId: string;
  onClose: () => void;
  onDelete: (reviewId: string) => Promise<void>;
  canDelete: boolean;
}

const ReviewDetail: React.FC<ReviewDetailProps> = ({ reviewId, onClose, onDelete, canDelete }) => {
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState<Review | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchReviewDetail = async () => {
      try {
        setLoading(true);
        const response = await reviewsAPI.getReviewDetail(reviewId);
        setReview(response.data);
      } catch (error) {
        console.error("Error fetching review details:", error);
        toast.error("Impossible de charger les détails de l'avis");
      } finally {
        setLoading(false);
      }
    };

    fetchReviewDetail();
  }, [reviewId]);

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await onDelete(reviewId);
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error("Error deleting review:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="text-center py-6">
        <p>Avis introuvable</p>
        <Button onClick={onClose} className="mt-4">Fermer</Button>
      </div>
    );
  }

  const AUTH_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  return (
    <>
      <DialogHeader>
        <DialogTitle>Détails de l'avis</DialogTitle>
      </DialogHeader>

      <div className="mt-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">{review.userName}</p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(review.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div>
            <p className="text-sm font-medium">Qualité du produit</p>
            <StarRating rating={review.productRating} />
          </div>
          <div>
            <p className="text-sm font-medium">Service de livraison</p>
            <StarRating rating={review.deliveryRating} />
          </div>
        </div>

        <div className="mt-4">
          <p className="font-medium">Commentaire</p>
          <p className="mt-1">{review.comment}</p>
        </div>

        {review.photos && review.photos.length > 0 && (
          <div className="mt-4">
            <p className="font-medium mb-2">Photos</p>
            <div className="grid grid-cols-2 gap-2">
              {review.photos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                  <img 
                    src={`${AUTH_BASE_URL}${photo}`}
                    alt={`Photo de l'avis ${index + 1}`}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `${AUTH_BASE_URL}/uploads/placeholder.jpg`;
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <DialogFooter className="mt-6 gap-2">
        {canDelete && (
          <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Supprimer</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action ne peut pas être annulée. Cet avis sera définitivement supprimé.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={deleteLoading}>
                  {deleteLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    'Confirmer'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <Button onClick={onClose}>Fermer</Button>
      </DialogFooter>
    </>
  );
};

export default ReviewDetail;
