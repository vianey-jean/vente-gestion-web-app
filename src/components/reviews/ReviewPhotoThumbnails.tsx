
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface ReviewPhotoThumbnailsProps {
  photos: string[];
  maxDisplay?: number;
}

const ReviewPhotoThumbnails: React.FC<ReviewPhotoThumbnailsProps> = ({ 
  photos, 
  maxDisplay = 4
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const visiblePhotos = photos.slice(0, maxDisplay);
  const remainingCount = photos.length - maxDisplay;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {visiblePhotos.map((photo, index) => (
          <Dialog key={index}>
            <DialogTrigger asChild>
              <div 
                className="cursor-pointer relative h-16 w-16 rounded overflow-hidden border border-gray-200"
                onClick={() => setSelectedImageIndex(index)}
              >
                <AspectRatio ratio={1/1}>
                  <img 
                    src={photo} 
                    alt={`Review photo ${index + 1}`} 
                    className="object-cover w-full h-full" 
                  />
                </AspectRatio>
                {index === maxDisplay - 1 && remainingCount > 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <span className="text-white font-medium">+{remainingCount}</span>
                  </div>
                )}
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <div className="flex flex-col gap-4">
                <div className="relative rounded overflow-hidden">
                  <img 
                    src={photos[selectedImageIndex || index]} 
                    alt={`Review photo ${(selectedImageIndex || index) + 1}`} 
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                </div>
                {photos.length > 1 && (
                  <ScrollArea className="w-full">
                    <div className="flex gap-2 pb-2">
                      {photos.map((p, i) => (
                        <button
                          key={i}
                          className={`relative h-16 w-16 rounded overflow-hidden border-2 ${
                            (selectedImageIndex || index) === i ? 'border-primary' : 'border-gray-200'
                          }`}
                          onClick={() => setSelectedImageIndex(i)}
                        >
                          <img 
                            src={p} 
                            alt={`Thumbnail ${i + 1}`} 
                            className="object-cover w-full h-full" 
                          />
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
};

export default ReviewPhotoThumbnails;
