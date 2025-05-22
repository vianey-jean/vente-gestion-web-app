
import { ReactNode } from 'react';

// Define ProtectedRoute props
declare module '@/components/ProtectedRoute' {
  interface ProtectedRouteProps {
    children: ReactNode;
    requireAdmin?: boolean;
  }
}

// Define ReviewDetail props
declare module '@/components/reviews/ReviewDetail' {
  interface ReviewDetailProps {
    reviewId: string;
    onClose: () => void;
    onDelete: (reviewId: string) => Promise<void>;
    canDelete: boolean;
    review?: Review;
  }
}
