import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import ProductCard from '../product/ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CategoryProductSlider = ({ categoryName, categoryTitle }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const swipeThreshold = 50;

  // Determine products per page based on screen size
  const productsPerPage = useMemo(() => {
    if (typeof window === 'undefined') return 5; // Default for SSR
    if (windowWidth < 640) return 2; // Mobile: 2 products (1 row)
    if (windowWidth < 768) return 2; // Small tablet: 2 products
    if (windowWidth < 1024) return 3; // Tablet: 3 products
    return 5; // Desktop: 5 products
  }, [windowWidth]);

  // Track window width for responsive productsPerPage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return '/images/placeholder.jpg';
    }
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    if (imagePath.startsWith('/')) {
      return imagePath;
    }
    return `/${imagePath}`;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
        if (!apiBaseUrl) {
          throw new Error('NEXT_PUBLIC_API_SERVER_URL is not defined. Please set it in your .env file.');
        }
        const url = `${apiBaseUrl}/products${categoryName ? `?category=${categoryName}` : ''}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        
        if (data.status !== 'success') {
          throw new Error(data.err || 'Error fetching products');
        }
        
        // Filter products by categoryNameVN
        const filteredProducts = data.products
          .filter(product => {
            const productCategoryVN = product.categoryNameVN || product.category || '';
            return productCategoryVN === categoryTitle;
          })
          .map(product => ({
            _id: product._id,
            category: product.category,
            categoryNameVN: product.categoryNameVN || product.category || 'Unknown',
            name: product.name,
            image: Array.isArray(product.image) 
              ? product.image.map(url => getImageUrl(url))
              : [getImageUrl(product.image)],
            rating: product.rating,
            reviewCount: product.reviewCount,
            price: product.price,
            promotionalPrice: product.promotionalPrice || 0,
            stockStatus: product.stockStatus,
            slug: product.slug,
            unit: product.unit,
            description: product.description,
          }));
        
        setProducts(filteredProducts);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [categoryName, categoryTitle]);

  const maxIndex = useMemo(() => {
    return Math.max(products.length - productsPerPage, 0);
  }, [products, productsPerPage]);

  const displayedProducts = useMemo(
    () => products.slice(currentIndex, currentIndex + productsPerPage),
    [products, currentIndex, productsPerPage]
  );

  // Reset currentIndex when productsPerPage changes to prevent out of bounds
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(Math.max(0, maxIndex));
    }
  }, [productsPerPage, maxIndex, currentIndex]);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === maxIndex ? 0 : prev + 1));
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e) => {
    if (touchStartX !== null) {
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = Math.abs(currentX - touchStartX);
      const deltaY = Math.abs(currentY - e.touches[0].clientY);
      if (deltaX > deltaY && deltaX > 10) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = (e) => {
    setTouchEndX(e.changedTouches[0].clientX);
    if (touchStartX !== null && touchEndX !== null) {
      const deltaX = touchEndX - touchStartX;
      if (Math.abs(deltaX) > swipeThreshold) {
        if (deltaX > 0) handlePrev();
        else handleNext();
      }
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const totalSlides = products.length - productsPerPage + 1;
  const maxDots = 10;
  const dotsCount = Math.min(totalSlides, maxDots);
  const step = totalSlides > maxDots ? Math.floor(totalSlides / maxDots) : 1;

  // Don't render if no products
  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{categoryTitle}</h2>
        <Link 
          href={`/san-pham?category=${encodeURIComponent(categoryTitle)}`} 
          className="text-green-600 text-base font-medium hover:underline mt-2 hidden md:block"
        >
          Xem tất cả
        </Link>
      </div>

      <div
        className="relative group"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        aria-live="polite"
      >
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải sản phẩm...</p>
          </div>
        ) : error ? (
          <p className="text-center text-red-600 text-lg py-8">
            Lỗi khi tải sản phẩm: {error}. Vui lòng thử lại sau.
          </p>
        ) : displayedProducts.length === 0 ? (
          null // Don't render if no products
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-hidden">
            {displayedProducts.map((product, index) => (
              <ProductCard
                key={product._id || `${categoryTitle}-${index}`}
                product={{
                  _id: product._id,
                  name: product.name,
                  image: product.image,
                  rating: product.rating,
                  reviewCount: product.reviewCount,
                  price: product.price,
                  promotionalPrice: product.promotionalPrice,
                  stockStatus: product.stockStatus,
                  slug: product.slug,
                  unit: product.unit,
                  description: product.description
                }}
                view="grid"
              />
            ))}
          </div>
        )}

        {!isLoading && products.length > productsPerPage && (
          <>
            <button
              onClick={handlePrev}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handlePrev()}
              className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
              aria-label="Previous products"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
              aria-label="Next products"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {!isLoading && products.length > productsPerPage && (
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: dotsCount }).map((_, index) => {
              const dotIndex = Math.min(index * step, maxIndex);
              const isActive = currentIndex >= dotIndex && currentIndex < dotIndex + step;
              return (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-600' : 'bg-green-300'}`}
                  onClick={() => setCurrentIndex(dotIndex)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProductSlider;

