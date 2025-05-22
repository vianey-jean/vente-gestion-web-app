
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import StarRating from "./StarRating";
import { reviewsAPI, Review, ReviewFormData } from '@/services/api';
import { toast } from 'sonner';

interface ReviewFormProps {
  productId: string;
  onSuccess?: (review: Review) => void;
  onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onSuccess, onCancel }) => {
  const [productRating, setProductRating] = useState<number>(5);
  const [deliveryRating, setDeliveryRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{comment?: string, photos?: string}>({});

  // Handle photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (!files) return;
    
    // Validation
    if (photos.length + files.length > 4) {
      setErrors(prev => ({
        ...prev, 
        photos: 'Vous ne pouvez pas télécharger plus de 4 photos.'
      }));
      return;
    }
    
    // Reset error
    setErrors(prev => ({ ...prev, photos: undefined }));
    
    // Add new files to state
    const newPhotos = [...photos];
    const newPreviews = [...photoPreview];

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        newPhotos.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    });
    
    setPhotos(newPhotos);
    setPhotoPreview(newPreviews);
  };
  
  // Remove photo
  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    const newPreviews = [...photoPreview];
    
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviews[index]);
    
    newPhotos.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setPhotos(newPhotos);
    setPhotoPreview(newPreviews);
    
    // Reset error if any
    if (errors.photos) {
      setErrors(prev => ({ ...prev, photos: undefined }));
    }
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    const formErrors: {comment?: string, photos?: string} = {};
    
    if (!comment.trim()) {
      formErrors.comment = 'Veuillez ajouter un commentaire';
    } else if (comment.trim().length < 10) {
      formErrors.comment = 'Le commentaire doit comporter au moins 10 caractères';
    }
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    try {
      setLoading(true);
      
      // Create review data
      const reviewData: ReviewFormData = {
        productId,
        productRating,
        deliveryRating,
        comment: comment.trim(),
        photos
      };
      
      const response = await reviewsAPI.addReview(reviewData);
      
      toast.success('Votre avis a été ajouté avec succès');
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      // Reset form
      setProductRating(5);
      setDeliveryRating(5);
      setComment('');
      
      // Clean up photo previews
      photoPreview.forEach(url => URL.revokeObjectURL(url));
      setPhotos([]);
      setPhotoPreview([]);
      
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error('Erreur lors de l\'ajout de votre avis. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="product-rating">Qualité du produit</Label>
          <div className="mt-1">
            <StarRating 
              value={productRating} 
              onChange={setProductRating} 
              id="product-rating"
              readOnly={false}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="delivery-rating">Qualité de livraison</Label>
          <div className="mt-1">
            <StarRating 
              value={deliveryRating} 
              onChange={setDeliveryRating} 
              id="delivery-rating"
              readOnly={false} 
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="comment">Votre avis</Label>
          <Textarea
            id="comment"
            placeholder="Partagez votre expérience avec ce produit..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className={`mt-1 ${errors.comment ? 'border-red-500' : ''}`}
          />
          {errors.comment && <FormMessage>{errors.comment}</FormMessage>}
        </div>
        
        <div>
          <Label htmlFor="photos">Ajouter des photos (facultatif)</Label>
          <div className="mt-2">
            <div className="flex flex-wrap items-center gap-3">
              {photoPreview.map((src, index) => (
                <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden border">
                  <img src={src} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 rounded-full p-1"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
              
              {photos.length < 4 && (
                <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400">
                  <ImageIcon className="h-6 w-6 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">Ajouter</span>
                  <input
                    type="file"
                    id="photos"
                    onChange={handlePhotoChange}
                    accept="image/*"
                    className="sr-only"
                    multiple
                  />
                </label>
              )}
            </div>
            {errors.photos && <FormMessage>{errors.photos}</FormMessage>}
            <p className="text-xs text-gray-500 mt-2">Vous pouvez télécharger jusqu'à 4 photos</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Upload className="mr-2 h-4 w-4 animate-spin" />
              Envoi...
            </>
          ) : 'Envoyer'}
        </Button>
      </div>
    </form>
  );
};

export default ReviewForm;
