import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import ProductCard from '../products/ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MonthlySales = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef(null);
  const productsPerPage = 5;
  const swipeThreshold = 50;

  // Hiện nút điều hướng khi section vào viewport (mobile); desktop vẫn dùng hover
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchBestsellers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Chỉ dùng Server API
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
        if (!apiBaseUrl) {
          throw new Error('NEXT_PUBLIC_API_SERVER_URL is not defined. Please set it in your .env file.');
        }
        const response = await fetch(`${apiBaseUrl}/orders/bestsellers`);
        if (!response.ok) {
          throw new Error('Failed to fetch bestsellers');
        }
        const data = await response.json();
        // Map dữ liệu từ API orders/bestsellers
        const mappedProducts = data.map(item => ({
          _id: item._id,
          name: item.name,
          image: item.image || ['/images/placeholder.jpg'],
          rating: item.rating || 0,
          reviewCount: item.reviewCount || 0,
          price: item.price || 0,
          // Giá gốc: ưu tiên giaGoc, fallback promotionalPrice cho dữ liệu cũ
          giaGoc: item.giaGoc || item.promotionalPrice || 0,
          stockStatus: item.stockStatus || 'Còn hàng',
          slug: item.slug,
          unit: item.unit || 'unit',
          description: item.description || '',
        }));
        setProducts(mappedProducts);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBestsellers();
  }, []);

  // Helper function to get image URL (supports external links and local paths)
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return '/images/placeholder.jpg';
    }
    // If it's already a full URL (http/https), return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // If it's a local path starting with /, return as is
    if (imagePath.startsWith('/')) {
      return imagePath;
    }
    // Otherwise, treat as local path
    return `/${imagePath}`;
  };
  const displayedProducts = useMemo(
    () => products.slice(currentIndex, currentIndex + productsPerPage),
    [products, currentIndex]
  );

  const maxIndex = useMemo(() => {
    return Math.max(products.length - productsPerPage, 0);
  }, [products]);

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

  return (
    <div ref={sectionRef} className="w-full container mx-auto py-6 px-4 md:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Bán chạy hàng tháng</h2>
        <Link href="/san-pham" className="text-blue-600 text-base font-medium hover:underline mt-2 hidden md:block">
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải sản phẩm...</p>
          </div>
        ) : error ? (
          <p className="text-center text-red-600 text-lg py-8">
            Lỗi khi tải sản phẩm: {error}. Vui lòng thử lại sau.
          </p>
        ) : displayedProducts.length === 0 ? (
          <p className="text-center text-gray-600 text-lg py-8">
            Không có sản phẩm bán chạy nào.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {displayedProducts.map((product, index) => (
              <ProductCard
                key={product._id || `bestseller-${index}`}
                product={{
                  _id: product._id,
                  name: product.name,
                  image: product.image.map(url => getImageUrl(url)),
                  rating: product.rating,
                  reviewCount: product.reviewCount,
                  price: product.price,
                  giaGoc: product.giaGoc,
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
              className={`absolute top-1/2 left-0 -translate-y-1/2 bg-gray-800/70 text-white p-2 rounded-full transition-opacity z-10 ${isInView ? 'opacity-40' : 'opacity-90'} md:opacity-0 md:group-hover:opacity-100`}
              aria-label="Previous products"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              className={`absolute top-1/2 right-0 -translate-y-1/2 bg-gray-800/70 text-white p-2 rounded-full transition-opacity z-10 ${isInView ? 'opacity-40' : 'opacity-90'} md:opacity-0 md:group-hover:opacity-100`}
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
                  className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-600' : 'bg-orange-400'}`}
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

export default MonthlySales;