import classNames from "classnames";
import { ChangeEventHandler, FC, useEffect, useState, useRef } from "react";
import Image from 'next/image';
import GalleryModal, { ImageSelectionResult } from './GalleryModal';

interface ImageData {
  src: string;
  altText?: string;
  id?: string;
}

interface Props {
  initialValue?: string;
  onChange(file: File): void;
  // Gallery props
  images?: ImageData[];
  uploading?: boolean;
  onFileSelect?(imageData: File | { file: File; altText: string }): void;
  onImageFromGallery?(imageUrl: string): void;
}

const ThumbnailSelector: FC<Props> = ({
  initialValue,
  onChange,
  images = [],
  uploading = false,
  onFileSelect,
  onImageFromGallery,
}): JSX.Element => {
  const [selectedThumbnail, setSelectedThumbnail] = useState("");
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleChange: ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    const { files } = target;
    if (!files) return;

    const file = files[0];
    setSelectedThumbnail(URL.createObjectURL(file));
    onChange(file);
  };

  useEffect(() => {
    if (typeof initialValue === "string") setSelectedThumbnail(initialValue);
  }, [initialValue]);

  // Close popover when clicking outside
  useEffect(() => {
    if (!showGalleryModal) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowGalleryModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showGalleryModal]);

  const handleGallerySelect = (result: ImageSelectionResult) => {
    setSelectedThumbnail(result.src);
    setShowGalleryModal(false);
    if (onImageFromGallery) {
      onImageFromGallery(result.src);
    }
  };

  const handleGalleryFileSelect = (imageData: File | { file: File; altText: string }) => {
    if (onFileSelect) {
      onFileSelect(imageData);
    }
  };

  return (
    <div ref={containerRef} className="thumbnail-container relative">
      <input
        type="file"
        hidden
        accept="image/jpg, image/png, image/jpeg"
        id="thumbnail"
        onChange={handleChange}
      />
      
      {/* Thumbnail display và Gallery button cùng 1 hàng */}
      <div className="flex gap-3">
        {/* Thumbnail display - Click to upload */}
        <label htmlFor="thumbnail" className="cursor-pointer flex-1">
          {selectedThumbnail ? (
            <div className="thumbnail-section compact hover:opacity-80 transition-opacity">
              <img
                src={selectedThumbnail}
                alt="Thumbnail"
                className="w-full h-full object-cover rounded"
              />
            </div>
          ) : (
            <PosterUI label="Ảnh đại diện" />
          )}
        </label>

        {/* Gallery button */}
        {images && images.length > 0 && (
          <button
            onClick={() => setShowGalleryModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-7 px-3 rounded-lg transition-colors self-start whitespace-nowrap"
          >
            Thư viện ảnh
          </button>
        )}
      </div>

      {/* Gallery Modal - Popover style */}
      {showGalleryModal && (
        <GalleryModal
          visible={showGalleryModal}
          images={images}
          uploading={uploading}
          onFileSelect={handleGalleryFileSelect}
          onSelect={handleGallerySelect}
          onClose={() => setShowGalleryModal(false)}
          popover={true}
        />
      )}
    </div>
  );
};


const PosterUI: FC<{ label: string; className?: string }> = ({
  label,
  className,
}) => {
  return (
    <div className={classNames("thumbnail-section", className)}>
      <div className="thumbnail-icon">📷</div>
      <div className="thumbnail-text">{label}</div>
    </div>
  );
};

export default ThumbnailSelector;
