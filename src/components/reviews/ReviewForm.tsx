
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { Upload } from 'lucide-react';
import { reviewsAPI } from '@/services/api';
import StarRating from './StarRating';

interface ReviewFormProps {
  productId: string;
  onReviewAdded: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onReviewAdded }) => {
  const [productRating, setProductRating] = useState(5);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos = Array.from(e.target.files);
      
      // Vérifier la taille des fichiers (max 5MB par photo)
      const validPhotos = newPhotos.filter(photo => photo.size <= 5 * 1024 * 1024);
      
      if (validPhotos.length < newPhotos.length) {
        toast.warning("Certaines photos sont trop volumineuses et n'ont pas été ajoutées. Maximum 5MB par photo.");
      }
      
      // Limiter à 5 photos
      const combinedPhotos = [...selectedPhotos, ...validPhotos];
      if (combinedPhotos.length > 5) {
        toast.warning("Maximum 5 photos peuvent être téléchargées.");
        setSelectedPhotos(combinedPhotos.slice(0, 5));
      } else {
        setSelectedPhotos(combinedPhotos);
      }
    }
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos(selectedPhotos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const reviewData = {
        productId,
        productRating,
        deliveryRating,
        comment,
        photos: selectedPhotos
      };

      await reviewsAPI.addReview(reviewData);
      
      setProductRating(5);
      setDeliveryRating(5);
      setComment('');
      setSelectedPhotos([]);
      
      toast.success("Merci pour votre commentaire !");
      onReviewAdded();
    } catch (error) {
      console.error("Erreur lors de l'envoi du commentaire:", error);
      toast.error("Une erreur est survenue lors de l'envoi du commentaire.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Ajouter un commentaire</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="product-rating">Évaluation du produit</Label>
            <StarRating 
              value={productRating} 
              onChange={setProductRating} 
              id="product-rating"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery-rating">Évaluation de la livraison</Label>
            <StarRating 
              value={deliveryRating} 
              onChange={setDeliveryRating} 
              id="delivery-rating"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Votre commentaire</Label>
            <Textarea
              id="comment"
              placeholder="Partagez votre expérience avec ce produit..."
              className="min-h-[100px]"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photos">Photos (optionnel)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedPhotos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={URL.createObjectURL(photo)} 
                    alt={`Photo ${index + 1}`} 
                    className="h-20 w-20 object-cover rounded-md border" 
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    &times;
                  </button>
                </div>
              ))}
              {selectedPhotos.length < 5 && (
                <label className="h-20 w-20 border border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                  <Upload size={24} className="text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">Ajouter</span>
                  <input 
                    type="file" 
                    id="photos" 
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-500">Vous pouvez télécharger jusqu'à 5 photos (max 5MB chacune)</p>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Envoi en cours...' : 'Soumettre le commentaire'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
