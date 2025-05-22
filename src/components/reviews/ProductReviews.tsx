import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reviewsAPI, Review, ReviewFormData } from '@/services/api';
import { Button } from '@/components/ui/button';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

const ProductReviews: React.FC<{ productId: string }> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { user, isAuthenticated } = useAuth();
  
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await reviewsAPI.getProductReviews(productId);
        setReviews(response.data);
      } catch (err) {
        console.error("Error fetching product reviews:", err);
        setError("Impossible de charger les avis pour ce produit.");
      } finally {
        setLoading(false);
      }
    };
    
    if (productId) {
      fetchReviews();
    }
  }, [productId]);
  
  const handleSubmitReview = async (formData: FormData) => {
    try {
      // Create a ReviewFormData object from the FormData
      const reviewData: ReviewFormData = {
        productId: formData.get('productId') as string,
        productRating: Number(formData.get('productRating')),
        deliveryRating: Number(formData.get('deliveryRating')),
        comment: formData.get('comment') as string,
        photos: []
      };
      
      // Get all the files from the FormData
      const photosEntries = formData.getAll('photos');
      reviewData.photos = photosEntries.filter(entry => entry instanceof File) as File[];
      
      const response = await reviewsAPI.addReview(reviewData);
      
      // Add the new review to the list with the current user's name
      const newReview = {
        ...response.data,
        userName: `${user?.prenom || ''} ${user?.nom || ''}`.trim()
      };
      
      setReviews([newReview, ...reviews]);
      setShowReviewForm(false);
      toast.success("Votre avis a été ajouté avec succès !");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Une erreur est survenue lors de l'ajout de votre avis.");
    }
  };
  
  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    
    const sum = reviews.reduce((acc, review) => acc + review.productRating, 0);
    return sum / reviews.length;
  };
  
  const getReviewCountByRating = (rating: number) => {
    return reviews.filter(review => Math.round(review.productRating) === rating).length;
  };
  
  const getRatingPercentage = (rating: number) => {
    if (reviews.length === 0) return 0;
    return (getReviewCountByRating(rating) / reviews.length) * 100;
  };
  
  if (loading) {
    return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div></div>;
  }
  
  if (error) {
    return <div className="text-red-500 py-4">{error}</div>;
  }
  
  return (
    <div className="space-y-8">
      {/* Reviews Summary */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Avis des clients</h3>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Average Rating */}
          <div className="flex flex-col items-center justify-center mb-4 md:mb-0">
            <div className="text-4xl font-bold text-red-800">{calculateAverageRating().toFixed(1)}</div>
            <div className="mt-2 mb-3">
              <StarRating rating={calculateAverageRating()} size={24} />
            </div>
            <div className="text-sm text-gray-500">{reviews.length} avis</div>
          </div>
          
          {/* Rating Bars */}
          <div className="flex-grow space-y-2">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center gap-2">
                <div className="text-sm w-12 text-right">{rating} étoiles</div>
                <div className="flex-grow bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-yellow-400 h-2" 
                    style={{ width: `${getRatingPercentage(rating)}%` }} 
                  ></div>
                </div>
                <div className="text-sm w-12 text-gray-500">
                  {getReviewCountByRating(rating)}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Add Review Button */}
        {isAuthenticated ? (
          <div className="mt-6 flex justify-center">
            <Button 
              onClick={() => setShowReviewForm(!showReviewForm)}
              variant="outline"
              className="border-red-800 text-red-800 hover:bg-red-50"
            >
              {showReviewForm ? 'Annuler' : 'Ajouter un avis'}
            </Button>
          </div>
        ) : (
          <p className="mt-6 text-center text-sm">
            <Link to="/login" className="text-red-800 hover:underline">Connectez-vous</Link> pour laisser un avis
          </p>
        )}
      </div>
      
      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Votre avis</h3>
          <ReviewForm 
            productId={productId} 
            onSubmit={handleSubmitReview} 
          />
        </div>
      )}
      
      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{review.userName}</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center">
                      <StarRating rating={review.productRating} size={16} />
                      <span className="text-sm ml-2">Produit</span>
                    </div>
                    <div className="flex items-center">
                      <StarRating rating={review.deliveryRating} size={16} />
                      <span className="text-sm ml-2">Livraison</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <p className="mt-3 text-gray-700">{review.comment}</p>
              
              {/* Review Photos */}
              {review.photos && review.photos.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {review.photos.map((photo, index) => (
                    <img 
                      key={index}
                      src={`${import.meta.env.VITE_API_BASE_URL}${photo}`}
                      alt={`Photo ${index + 1} du commentaire`}
                      className="h-20 w-20 object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `${import.meta.env.VITE_API_BASE_URL}/uploads/placeholder.jpg`;
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-6 text-center rounded-lg border">
          <p className="text-gray-500">Aucun avis pour ce produit</p>
          {isAuthenticated && (
            <Button 
              onClick={() => setShowReviewForm(true)}
              variant="link" 
              className="text-red-800 mt-2"
            >
              Soyez le premier à laisser un avis
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
