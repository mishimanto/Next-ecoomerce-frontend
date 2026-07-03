"use client";
import React, { createContext, useContext, useState } from "react";

interface PreviewSliderType {
  isModalPreviewOpen: boolean;
  images: string[];
  initialSlide: number;
  openPreviewModal: (images?: string[], initialSlide?: number) => void;
  closePreviewModal: () => void;
}

const PreviewSlider = createContext<PreviewSliderType | undefined>(undefined);

export const usePreviewSlider = () => {
  const context = useContext(PreviewSlider);
  if (!context) {
    throw new Error("usePreviewSlider must be used within a ModalProvider");
  }
  return context;
};

export const PreviewSliderProvider = ({ children }) => {
  const [isModalPreviewOpen, setIsModalOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [initialSlide, setInitialSlide] = useState(0);

  const openPreviewModal = (nextImages: string[] = [], nextInitialSlide = 0) => {
    setImages(nextImages);
    setInitialSlide(nextInitialSlide);
    setIsModalOpen(true);
  };

  const closePreviewModal = () => {
    setIsModalOpen(false);
  };

  return (
    <PreviewSlider.Provider
      value={{
        isModalPreviewOpen,
        images,
        initialSlide,
        openPreviewModal,
        closePreviewModal,
      }}
    >
      {children}
    </PreviewSlider.Provider>
  );
};
