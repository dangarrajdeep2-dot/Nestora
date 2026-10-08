'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { ListingImage } from '@/types';
import Image from 'next/image';

export default function ImageGallery({ images }: { images: ListingImage[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="h-64 bg-gray-200 flex flex-col items-center justify-center text-gray-500">
        <ImageIcon size={48} className="mb-2 opacity-50" />
        <span className="text-sm font-medium">No images available</span>
      </div>
    );
  }

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="relative h-64 sm:h-80 w-full bg-gray-100 overflow-hidden group">
      <Image
        src={images[currentIndex].image_url}
        alt={`Hostel Image ${currentIndex + 1}`}
        fill
        className="object-cover transition-opacity duration-300"
      />

      {images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-900 transition md:opacity-0 group-hover:opacity-100"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-900 transition md:opacity-0 group-hover:opacity-100"
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </button>
          
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
