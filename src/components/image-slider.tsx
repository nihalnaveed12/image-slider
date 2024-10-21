"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { PlayIcon, PauseIcon } from "lucide-react";

interface ImageData {
  id: string;
  urls: {
    regular: string;
  };
  alt_description: string;
  description: string;
  user: {
    name: string;
  };
}

export default function ImageSliderComponent() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const interval = 5000;

  // Fetching images from Unsplash API
  const fetchImages = async (): Promise<void> => {
    try {
      const response = await fetch(
        `https://api.unsplash.com/photos?client_id=${process.env.NEXT_PUBLIC_UNSPLASH_API_KEY}&per_page=10`
      );
      const data = await response.json();

      // Ensure the response data is an array
      if (Array.isArray(data)) {
        setImages(data);
      } else {
        console.error("Unexpected data format:", data);
        setImages([]); // Set to an empty array if the format is wrong
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      setImages([]); // Handle fetch error by setting to an empty array
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Function to move to the next image
  const nextImage = useCallback((): void => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (isPlaying && images.length > 0) {
      const id = setInterval(nextImage, interval);
      return () => clearInterval(id);
    }
  }, [isPlaying, nextImage, images.length]);

  // Play/Pause toggle for the carousel
  const togglePlayPause = (): void => {
    setIsPlaying((prevIsPlaying) => !prevIsPlaying);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-4">Image Slider</h1>
        <p className="text-center text-gray-600 mb-8">
          A simple dynamic image slider/carousel with Unsplash.
        </p>

        {/* Carousel starts here */}
        <Carousel className="rounded-lg overflow-hidden relative">
          <CarouselContent>
            {/* Only render images if they exist */}
            {images.length > 0 ? (
              images.map((image, index) => (
                <CarouselItem
                  key={image.id}
                  className={index === currentIndex ? "block" : "hidden"}
                >
                  <Image
                    src={image.urls?.regular || "/fallback-image.jpg"}
                    alt={image.alt_description || "Image"}
                    width={800}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                  <div className="p-2 bg-white/75 text-center">
                    <h2 className="text-lg font-bold">{image.user.name}</h2>
                    <p className="text-sm">
                      {image.description || image.alt_description || "No description available"}
                    </p>
                  </div>
                </CarouselItem>
              ))
            ) : (
              <p>Loading images...</p> // Display loading message if images are not yet fetched
            )}
          </CarouselContent>

          {/* Play/Pause button */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlayPause}
              className="bg-white/50 hover:bg-white/75 p-2 rounded-full shadow-md transition-colors"
            >
              {isPlaying ? (
                <PauseIcon className="w-6 h-6 text-gray-800" />
              ) : (
                <PlayIcon className="w-6 h-6 text-gray-800" />
              )}
              <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
            </Button>
          </div>
        </Carousel>
      </div>
    </div>
  );
}
