import React, { useEffect, useState } from 'react';
import StarRating from './StarRating';
import axios from 'axios';
import { Avatar } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { Quote, Users, Star, Heart, MessageCircle } from 'lucide-react';

interface ReviewData {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  productRating: number;
  deliveryRating: number;
  comment: string;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
}

const TestimonialSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const AUTH_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${AUTH_BASE_URL}/api/reviews/best`);
        
        // Si l'API ne renvoie pas de données, utiliser l'approche de secours
        if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
          const allReviewsResponse = await axios.get(`${AUTH_BASE_URL}/api/reviews`);
          
          if (allReviewsResponse.data && Array.isArray(allReviewsResponse.data)) {
            // Trier les commentaires par note (d'abord les 5 étoiles, puis les 4, etc.)
            const sortedReviews = [...allReviewsResponse.data].sort((a, b) => {
              // Calculer la moyenne des notes (produit et livraison)
              const avgRatingA = (a.productRating + a.deliveryRating) / 2;
              const avgRatingB = (b.productRating + b.deliveryRating) / 2;
              
              // Trier par note moyenne décroissante
              if (avgRatingB !== avgRatingA) {
                return avgRatingB - avgRatingA;
              }
              
              // Si les notes sont identiques, trier par date (du plus récent au plus ancien)
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            
            // Prendre les trois premiers commentaires
            setTestimonials(sortedReviews.slice(0, 3));
          }
        } else {
          setTestimonials(response.data.slice(0, 3));
        }
        
      } catch (error) {
        console.error("Erreur lors de la récupération des témoignages:", error);
        
        // Approche de secours - charger tous les commentaires et trier
        try {
          const allReviewsResponse = await axios.get(`${AUTH_BASE_URL}/api/reviews`);
          if (allReviewsResponse.data && Array.isArray(allReviewsResponse.data)) {
            // Même logique de tri que ci-dessus
            const sortedReviews = [...allReviewsResponse.data].sort((a, b) => {
              const avgRatingA = (a.productRating + a.deliveryRating) / 2;
              const avgRatingB = (b.productRating + b.deliveryRating) / 2;
              
              if (avgRatingB !== avgRatingA) {
                return avgRatingB - avgRatingA;
              }
              
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            
            setTestimonials(sortedReviews.slice(0, 3));
          }
        } catch (e) {
          console.error("Erreur lors de la récupération de tous les commentaires:", e);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [AUTH_BASE_URL]);

  // Calcule la note moyenne (produit et livraison)
  const getAverageRating = (review: ReviewData) => {
    return Math.round((review.productRating + review.deliveryRating) / 2);
  };
  
  // Extraire les initiales du nom pour l'avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <section className="mb-20 relative">
      {/* Éléments décoratifs */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-red-500/5 to-pink-500/5 rounded-full -translate-x-16 -translate-y-16"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-blue-500/5 to-purple-500/5 rounded-full translate-x-20 translate-y-20"></div>
      
      <div className="text-center mb-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl mb-6 shadow-lg">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            Ce Que Nos Clients Disent
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Découvrez les expériences authentiques de notre communauté
          </p>
          <div className="mt-6 flex items-center justify-center space-x-2">
            <div className="flex -space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 ml-2">
              4.9/5 basé sur 2,400+ avis
            </span>
          </div>
        </motion.div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="flex items-center mb-4 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="flex items-center">
                <div className="mr-4">
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                </div>
                <div className="w-full">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : testimonials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((review, index) => (
            <motion.div 
              key={review.id} 
              className="group bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-500 hover:shadow-2xl hover:scale-105 relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* Gradient de fond au hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Élément décoratif de citation */}
              <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-full flex items-center justify-center">
                <Quote className="h-6 w-6 text-red-500/50" />
              </div>
              
              <div className="relative z-10">
                {/* Étoiles avec animation */}
                <motion.div 
                  className="flex items-center text-yellow-400 mb-6"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <StarRating rating={getAverageRating(review)} readOnly size={20} />
                  <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {getAverageRating(review)}/5
                  </span>
                </motion.div>
                
                {/* Commentaire */}
                <p className="text-gray-700 dark:text-gray-300 mb-6 line-clamp-4 min-h-[100px] text-lg leading-relaxed relative">
                  <span className="text-red-500 text-2xl font-serif absolute -top-2 -left-2">«</span>
                  <span className="ml-4">{review.comment}</span>
                  <span className="text-red-500 text-2xl font-serif">»</span>
                </p>
                
                {/* Profil utilisateur */}
                <div className="flex items-center">
                  <div className="mr-4 relative">
                    {review.photos && review.photos[0] ? (
                      <Avatar className="ring-2 ring-red-500/20 group-hover:ring-red-500/40 transition-all duration-300">
                        <img 
                          src={`${AUTH_BASE_URL}${review.photos[0]}`}
                          alt={review.userName}
                          className="w-14 h-14 object-cover rounded-full"
                        />
                      </Avatar>
                    ) : (
                      <Avatar className="bg-gradient-to-r from-red-500 to-pink-500 text-white w-14 h-14 ring-2 ring-red-500/20 group-hover:ring-red-500/40 transition-all duration-300">
                        <span className="text-lg font-bold">{getInitials(review.userName)}</span>
                      </Avatar>
                    )}
                    {/* Badge vérifié */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                      <Users className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-lg text-gray-900 dark:text-white">{review.userName}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Client{review.userName.endsWith('e') ? 'e' : ''} vérifié{review.userName.endsWith('e') ? 'e' : ''}</p>
                      <Heart className="h-3 w-3 text-red-500 fill-current" />
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div 
          className="text-center py-16 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-3xl border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="w-16 h-16 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Aucun témoignage disponible pour le moment.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Soyez le premier à partager votre expérience !</p>
        </motion.div>
      )}
    </section>
  );
};

export default TestimonialSection;
