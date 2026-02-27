import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ProductCard from '../products/ProductCard';

const CategoryProductSlider = ({ categoryName, categoryTitle }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const handleResize = () => checkScrollPosition();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, [products]);

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
        
        // Map products (API already filtered by category if categoryName provided)
        const filteredProducts = data.products.map(product => ({
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
          // Giá gốc: ưu tiên giaGoc, fallback promotionalPrice cho dữ liệu cũ
          giaGoc: product.giaGoc || product.promotionalPrice || 0,
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
  }, [categoryName]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = 320; // Width of one card + gap
      const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScrollPosition, 300);
    }
  };

  // Don't render if no products
  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <section className="py-6 md:py-8 bg-white">
      <div className="container mx-auto px-4 md:px-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">{categoryTitle}</h2>
        <Link 
          href={`/san-pham?category=${encodeURIComponent(categoryTitle)}`} 
            className="text-green-600 px-4 py-2 rounded-lg text-sm font-bold hover:shadow-lg transition-all duration-300"
        >
          Xem tất cả
        </Link>
      </div>

        <div className="relative group">
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-[-8px] top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100"
              aria-label="Scroll left"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <div
            ref={scrollContainerRef}
            onScroll={checkScrollPosition}
            className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {isLoading ? (
              <div className="flex items-center justify-center w-full py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                <p className="ml-2 text-gray-600">Đang tải sản phẩm...</p>
          </div>
        ) : error ? (
              <div className="flex items-center justify-center w-full py-8">
                <p className="text-red-600 text-lg">
            Lỗi khi tải sản phẩm: {error}. Vui lòng thử lại sau.
          </p>
              </div>
        ) : (
              products.map((product, index) => (
                <div key={product._id || `${categoryTitle}-${index}`} className="flex-none w-[calc(45%-4px)] sm:w-[calc(33.333%-6px)] md:w-[280px] xl:w-[230px]">
              <ProductCard
                product={{
                  _id: product._id,
                  name: product.name,
                  image: product.image,
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
                </div>
              ))
            )}
          </div>

          {showRightArrow && !isLoading && !error && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-[-8px] top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100"
              aria-label="Scroll right"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </button>
        )}
      </div>
    </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default CategoryProductSlider;

