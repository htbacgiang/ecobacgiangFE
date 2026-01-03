import React, { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import { FaShoppingCart, FaEye, FaRegHeart, FaHeart } from "react-icons/fa";
import { BsFillCartPlusFill, BsChevronDown } from "react-icons/bs";
import {
  FiSearch,
  FiGrid,
  FiList,
  FiFilter,
} from "react-icons/fi";
import ProductCard from "./ProductCard";
import debounce from "lodash/debounce";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import { fetchWishlistDB } from "../../store/wishlistSlice";
import { useBestsellers } from "../../hooks/use-bestsellers";

export default function Product3() {
  const router = useRouter();
  const { category } = router.query;
  const [isListView, setIsListView] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, Infinity]);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sortOption, setSortOption] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  const inputRef = useRef(null);
  const productListRef = useRef(null);
  const prevPageRef = useRef(currentPage);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const { bestsellers, loading: bestsellersLoading } = useBestsellers();

  const itemsPerPage = 15;
  const fallbackImage = "/images/fallback-image.jpg";

  // Fetch wishlist when component mounts or userId changes
  useEffect(() => {
    const userId = session?.user?.id;
    if (userId) {
      dispatch(fetchWishlistDB(userId));
    }
  }, [dispatch, session]);

  // Read category from URL query parameter and set selected category
  useEffect(() => {
    if (category && typeof category === 'string') {
      // Decode URL parameter
      const decodedCategory = decodeURIComponent(category);
      setSelectedCategory(decodedCategory);
      // Reset to first page when category changes
      setCurrentPage(1);
    }
  }, [category]);

  // Fetch products from API - images are already full URLs from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Chỉ dùng Server API
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
        if (!apiBaseUrl) {
          throw new Error('NEXT_PUBLIC_API_SERVER_URL is not defined. Please set it in your .env file.');
        }
        const res = await fetch(`${apiBaseUrl}/products`);
        const data = await res.json();
        const transformedProducts = data.products.map((product) => ({
          ...product,
          image: Array.isArray(product.image) && product.image.length > 0
            ? product.image.filter(img => img && img.trim() !== '') // Filter out empty images
            : [fallbackImage],
        }));
        setProducts(transformedProducts);
        setFilteredProducts(transformedProducts);
        
        // Extract unique categories from products
        const categories = ['Tất cả', ...new Set(transformedProducts.map(p => p.categoryNameVN).filter(Boolean))];
        setAvailableCategories(categories);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Scroll to top of product list when currentPage changes
  useEffect(() => {
    if (prevPageRef.current !== currentPage) {
      if (productListRef.current) {
        const rect = productListRef.current.getBoundingClientRect();
        const offset = 165;
        window.scrollTo({
          top: rect.top + window.scrollY - offset,
          behavior: "smooth",
        });
      }
      prevPageRef.current = currentPage;
    }
  }, [currentPage]);

  // Search handler
  const handleSearch = useMemo(
    () =>
      debounce((query) => {
        setSearchQuery(query);

        if (!query) {
          setFilteredProducts(products);
          return;
        }

        const lowerQuery = query.toLowerCase();
        const result = products.filter((product) =>
          product.name?.toLowerCase().includes(lowerQuery) ||
          product.description?.toLowerCase().includes(lowerQuery) ||
          product.categoryNameVN?.toLowerCase().includes(lowerQuery) ||
          product.maSanPham?.toLowerCase().includes(lowerQuery)
        );
        setFilteredProducts(result);
      }, 300),
    [products]
  );

  useEffect(() => {
    return () => handleSearch.cancel();
  }, [handleSearch]);

  // Reset current page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePriceFilter = (range) => {
    setPriceRange(range);
    setCurrentPage(1);
  };
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    // Update URL without page reload
    if (category === "Tất cả") {
      router.push('/san-pham', undefined, { shallow: true });
    } else {
      router.push(`/san-pham?category=${encodeURIComponent(category)}`, undefined, { shallow: true });
    }
  };
  const handleSortChange = (option) => {
    setSortOption(option);
    setIsDropdownOpen(false);
  };

  const handleDropdownToggle = () => {
    console.log('Dropdown toggle clicked, current state:', isDropdownOpen);
    setIsDropdownOpen(!isDropdownOpen);
  };
  const handlePageChange = (page) => setCurrentPage(page);

  // Filter and sort products
  const combinedFilteredProducts = useMemo(() => {
    return [...filteredProducts]
      .filter((product) => {
        const isInCategory =
          selectedCategory === "Tất cả" || product.categoryNameVN === selectedCategory;
        const isInPriceRange =
          product.price >= priceRange[0] && product.price <= priceRange[1];
        return isInCategory && isInPriceRange;
      })
      .sort((a, b) => {
        switch (sortOption) {
          case "price-asc":
            return a.price - b.price;
          case "price-desc":
            return b.price - a.price;
          case "bestselling":
            // Sử dụng dữ liệu bestsellers thực tế nếu có, nếu không thì dùng rating
            if (bestsellers.length > 0) {
              const aIndex = bestsellers.findIndex(item => item._id === a._id);
              const bIndex = bestsellers.findIndex(item => item._id === b._id);
              
              // Nếu cả hai đều có trong bestsellers, sắp xếp theo thứ tự
              if (aIndex !== -1 && bIndex !== -1) {
                return aIndex - bIndex;
              }
              // Nếu chỉ một trong hai có trong bestsellers, ưu tiên sản phẩm có trong bestsellers
              if (aIndex !== -1) return -1;
              if (bIndex !== -1) return 1;
            }
            
            // Fallback: sử dụng rating và reviewCount
            const scoreA = (a.rating || 0) * (a.reviewCount || 0);
            const scoreB = (b.rating || 0) * (b.reviewCount || 0);
            return scoreB - scoreA;
          case "newest":
            return new Date(b.createdAt) - new Date(a.createdAt);
          default:
            return 0;
        }
      });
  }, [filteredProducts, selectedCategory, priceRange, sortOption]);

  // Pagination
  const totalPages = Math.ceil(combinedFilteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    return combinedFilteredProducts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [combinedFilteredProducts, currentPage, itemsPerPage]);

  const handleIconClick = () => {
    setIsExpanded(true);
    inputRef.current?.focus();
  };

  const handleBlur = () => {
    setIsExpanded(false);
  };

  // Handle outside click for dropdown
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isDropdownOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 md:p-5 p-0">
      <div className="max-w-7xl mx-auto py-6 px-1 md:px-2">
        <div className="grid grid-cols-12 md:gap-6 gap-2 mb-6">
          <aside className="product-sidebar col-span-3 bg-white p-5 rounded-2xl shadow-lg border border-green-100 hidden md:block transition-all duration-300 hover:shadow-xl">
            {/* Danh mục sản phẩm */}
            <div className="mb-6">
              <h2 className="product-sidebar-header font-bold text-lg mb-4 flex items-center pb-2 border-b-2 border-green-200">
                <span className="product-sidebar-indicator w-1 h-6 rounded-full mr-3"></span>
                Danh mục sản phẩm
              </h2>
              <ul className="space-y-1.5">
                {availableCategories.length > 0 ? (
                  availableCategories.map((cat) => (
                    <li key={cat} className="group">
                      <label className={`product-sidebar-item flex items-center p-2.5 rounded-xl cursor-pointer ${
                        selectedCategory === cat ? "selected" : ""
                      }`}>
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === cat}
                          onChange={() => handleCategoryChange(cat)}
                          className="w-4 h-4 text-green-600 bg-white border-2 border-gray-300 focus:ring-green-500 focus:ring-2 rounded-full cursor-pointer transition-all duration-200 checked:bg-green-500 checked:border-green-500"
                        />
                        <span className={`product-sidebar-text ml-3 text-sm font-medium ${
                          selectedCategory === cat ? "" : "text-gray-700"
                        }`}>
                          {cat}
                        </span>
                        {selectedCategory === cat && (
                          <span className="ml-auto">
                            <span className="product-sidebar-dot w-2 h-2 rounded-full"></span>
                          </span>
                        )}
                      </label>
                    </li>
                  ))
                ) : (
                  // Fallback to default categories while loading
                  <>
                    <li className="group">
                      <label className={`product-sidebar-item flex items-center p-2.5 rounded-xl cursor-pointer ${
                        selectedCategory === "Tất cả" ? "selected" : ""
                      }`}>
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === "Tất cả"}
                          onChange={() => handleCategoryChange("Tất cả")}
                          className="w-4 h-4 text-green-600 bg-white border-2 border-gray-300 focus:ring-green-500 focus:ring-2 rounded-full cursor-pointer transition-all duration-200 checked:bg-green-500 checked:border-green-500"
                        />
                        <span className={`product-sidebar-text ml-3 text-sm font-medium ${
                          selectedCategory === "Tất cả" ? "" : "text-gray-700"
                        }`}>
                          Tất cả
                        </span>
                        {selectedCategory === "Tất cả" && (
                          <span className="ml-auto">
                            <span className="product-sidebar-dot w-2 h-2 rounded-full"></span>
                          </span>
                        )}
                      </label>
                    </li>
                  </>
                )}
              </ul>
            </div>
            {/* Mức giá */}
            <div className="mt-6">
              <h2 className="product-sidebar-header font-bold text-lg mb-4 flex items-center pb-2 border-b-2 border-green-200">
                <span className="product-sidebar-indicator w-1 h-6 rounded-full mr-3"></span>
                Mức giá
              </h2>
              <ul className="space-y-1.5">
                <li className="group">
                  <label className={`product-sidebar-item flex items-center p-2.5 rounded-xl cursor-pointer ${
                    priceRange[0] === 0 && priceRange[1] === Infinity ? "selected" : ""
                  }`}>
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange[0] === 0 && priceRange[1] === Infinity}
                      onChange={() => handlePriceFilter([0, Infinity])}
                      className="w-4 h-4 text-green-600 bg-white border-2 border-gray-300 focus:ring-green-500 focus:ring-2 rounded-full cursor-pointer transition-all duration-200 checked:bg-green-500 checked:border-green-500"
                    />
                    <span className={`product-sidebar-text ml-3 text-sm font-medium ${
                      priceRange[0] === 0 && priceRange[1] === Infinity ? "" : "text-gray-700"
                    }`}>
                      Tất cả mức giá
                    </span>
                    {priceRange[0] === 0 && priceRange[1] === Infinity && (
                      <span className="ml-auto">
                        <span className="product-sidebar-dot w-2 h-2 rounded-full"></span>
                      </span>
                    )}
                  </label>
                </li>
                <li className="group">
                  <label className={`product-sidebar-item flex items-center p-2.5 rounded-xl cursor-pointer ${
                    priceRange[0] === 0 && priceRange[1] === 30000 ? "selected" : ""
                  }`}>
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange[0] === 0 && priceRange[1] === 30000}
                      onChange={() => handlePriceFilter([0, 30000])}
                      className="w-4 h-4 text-green-600 bg-white border-2 border-gray-300 focus:ring-green-500 focus:ring-2 rounded-full cursor-pointer transition-all duration-200 checked:bg-green-500 checked:border-green-500"
                    />
                    <span className={`product-sidebar-text ml-3 text-sm font-medium ${
                      priceRange[0] === 0 && priceRange[1] === 30000 ? "" : "text-gray-700"
                    }`}>
                      10,000₫ - 30,000₫
                    </span>
                    {priceRange[0] === 0 && priceRange[1] === 30000 && (
                      <span className="ml-auto">
                        <span className="product-sidebar-dot w-2 h-2 rounded-full"></span>
                      </span>
                    )}
                  </label>
                </li>
                <li className="group">
                  <label className={`product-sidebar-item flex items-center p-2.5 rounded-xl cursor-pointer ${
                    priceRange[0] === 30001 && priceRange[1] === 50000 ? "selected" : ""
                  }`}>
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange[0] === 30001 && priceRange[1] === 50000}
                      onChange={() => handlePriceFilter([30001, 50000])}
                      className="w-4 h-4 text-green-600 bg-white border-2 border-gray-300 focus:ring-green-500 focus:ring-2 rounded-full cursor-pointer transition-all duration-200 checked:bg-green-500 checked:border-green-500"
                    />
                    <span className={`product-sidebar-text ml-3 text-sm font-medium ${
                      priceRange[0] === 30001 && priceRange[1] === 50000 ? "" : "text-gray-700"
                    }`}>
                      30,000₫ - 50,000₫
                    </span>
                    {priceRange[0] === 30001 && priceRange[1] === 50000 && (
                      <span className="ml-auto">
                        <span className="product-sidebar-dot w-2 h-2 rounded-full"></span>
                      </span>
                    )}
                  </label>
                </li>
                <li className="group">
                  <label className={`product-sidebar-item flex items-center p-2.5 rounded-xl cursor-pointer ${
                    priceRange[0] === 50001 && priceRange[1] === 100000 ? "selected" : ""
                  }`}>
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange[0] === 50001 && priceRange[1] === 100000}
                      onChange={() => handlePriceFilter([50001, 100000])}
                      className="w-4 h-4 text-green-600 bg-white border-2 border-gray-300 focus:ring-green-500 focus:ring-2 rounded-full cursor-pointer transition-all duration-200 checked:bg-green-500 checked:border-green-500"
                    />
                    <span className={`product-sidebar-text ml-3 text-sm font-medium ${
                      priceRange[0] === 50001 && priceRange[1] === 100000 ? "" : "text-gray-700"
                    }`}>
                      50,000₫ - 100,000₫
                    </span>
                    {priceRange[0] === 50001 && priceRange[1] === 100000 && (
                      <span className="ml-auto">
                        <span className="product-sidebar-dot w-2 h-2 rounded-full"></span>
                      </span>
                    )}
                  </label>
                </li>
                <li className="group">
                  <label className={`product-sidebar-item flex items-center p-2.5 rounded-xl cursor-pointer ${
                    priceRange[0] === 100001 && priceRange[1] === Infinity ? "selected" : ""
                  }`}>
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange[0] === 100001 && priceRange[1] === Infinity}
                      onChange={() => handlePriceFilter([100001, Infinity])}
                      className="w-4 h-4 text-green-600 bg-white border-2 border-gray-300 focus:ring-green-500 focus:ring-2 rounded-full cursor-pointer transition-all duration-200 checked:bg-green-500 checked:border-green-500"
                    />
                    <span className={`product-sidebar-text ml-3 text-sm font-medium ${
                      priceRange[0] === 100001 && priceRange[1] === Infinity ? "" : "text-gray-700"
                    }`}>
                      Trên 100,000₫
                    </span>
                    {priceRange[0] === 100001 && priceRange[1] === Infinity && (
                      <span className="ml-auto">
                        <span className="product-sidebar-dot w-2 h-2 rounded-full"></span>
                      </span>
                    )}
                  </label>
                </li>
              </ul>
            </div>
            {/* Sản phẩm nổi bật */}
            <div className="mt-6 relative overflow-hidden rounded-2xl featured-bg-gradient p-4 shadow-xl border border-green-200/50 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] group">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-200/20 rounded-full blur-2xl -ml-12 -mb-12"></div>
              
              <div className="relative z-10 w-full">
                {/* Header */}
                <div className="flex items-center justify-center mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-6 featured-bar-gradient rounded-full"></div>
                    <h3 className="text-xl font-bold featured-title-gradient">
                      Sản phẩm nổi bật
                    </h3>
                    <div className="w-1 h-6 featured-bar-gradient rounded-full"></div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-5 font-medium">Khám phá những sản phẩm chất lượng cao</p>
                
                {/* Product Card */}
                <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-green-100/50 transition-all duration-300 hover:shadow-xl hover:border-green-300 group-hover:bg-white">
                  <div className="relative overflow-hidden rounded-xl mb-4 group/image">
                    <img
                      src="https://orgado.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fflash-banner-01.7f962f08.jpg&w=640&q=75"
                      alt="Sản phẩm nổi bật"
                      className="w-full h-28 object-cover rounded-xl transition-transform duration-500 group-hover/image:scale-110"
                    />
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                    {/* HOT Badge with animation */}
                    <div className="absolute top-2 right-2 featured-hot-badge-gradient text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse hover:animate-none hover:scale-110 transition-transform duration-200">
                      🔥 HOT
                    </div>
                  </div>
                  
                  {/* Product Info */}
                  <h4 className="font-bold text-gray-900 text-base text-center mb-2 leading-tight">Khoai tây hữu cơ</h4>
                  
                  {/* Rating */}
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400 text-sm">★★★★★</span>
                    </div>
                    <span className="text-xs text-gray-600 font-medium bg-gray-100 px-2 py-0.5 rounded-full">4.8</span>
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <span className="text-gray-400 line-through text-sm font-medium">60,000₫</span>
                    <span className="text-green-600 font-bold text-lg bg-green-50 px-3 py-1 rounded-lg">
                      Từ 45,000₫
                    </span>
                  </div>
                </div>
                
                {/* CTA Button */}
                <div className="mt-5">
                  <button className="w-full inline-flex items-center justify-center featured-btn-gradient text-white text-sm font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group/btn">
                    <span className="mr-2">Xem ngay</span>
                    <svg 
                      className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </aside>

          <div className="col-span-12 md:col-span-9">
            <header className="bg-white shadow-lg mb-4 p-4 rounded-2xl flex justify-between items-center border border-green-100">
              <div className="flex items-center w-full">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <div className="relative ml-0 dropdown-container" ref={dropdownRef}>
                      <button
                        className="bg-white border border-green-200 md:px-5 px-2 py-2 flex items-center justify-center space-x-2 whitespace-nowrap rounded-lg hover:bg-green-50 transition-colors duration-200 text-gray-700 font-medium shadow-sm"
                        onClick={handleDropdownToggle}
                      >
                        <span>
                          {sortOption === "price-asc"
                            ? "Giá: Thấp - Cao"
                            : sortOption === "price-desc"
                              ? "Giá: Cao - Thấp"
                              : sortOption === "bestselling"
                                ? bestsellersLoading ? "Đang tải..." : "Bán chạy nhất"
                                : sortOption === "newest"
                                  ? "Mới nhất"
                                  : "Sắp xếp"}
                        </span>
                        <BsChevronDown className="text-green-600" />
                      </button>
                      {isDropdownOpen && (
                        <ul
                          className="absolute left-0 mt-2 w-48 z-50 whitespace-nowrap bg-white border border-green-200 rounded-lg shadow-lg overflow-hidden dropdown-container"
                          style={{ 
                            minWidth: "12rem",
                            display: "block",
                            visibility: "visible",
                            opacity: "1"
                          }}
                        >
                          <li
                            className="px-4 py-2 hover:bg-green-50 cursor-pointer transition-colors duration-200 text-gray-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSortChange("");
                            }}
                          >
                            Mặc định
                          </li>
                          <li
                            className="px-4 py-2 hover:bg-green-50 cursor-pointer transition-colors duration-200 text-gray-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSortChange("price-asc");
                            }}
                          >
                            Giá: Thấp - Cao
                          </li>
                          <li
                            className="px-4 py-2 hover:bg-green-50 cursor-pointer transition-colors duration-200 text-gray-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSortChange("price-desc");
                            }}
                          >
                            Giá: Cao - Thấp
                          </li>
                          <li
                            className="px-4 py-2 hover:bg-green-50 cursor-pointer transition-colors duration-200 text-gray-700 flex items-center justify-between"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSortChange("bestselling");
                            }}
                          >
                            <span>Bán chạy nhất</span>
                            {bestsellersLoading ? (
                              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                Đang tải...
                              </span>
                            ) : bestsellers.length > 0 ? (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                {bestsellers.length} sản phẩm
                              </span>
                            ) : (
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                Theo rating
                              </span>
                            )}
                          </li>
                          <li
                            className="px-4 py-2 hover:bg-green-50 cursor-pointer transition-colors duration-200 text-gray-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSortChange("newest");
                            }}
                          >
                            Mới nhất
                          </li>
                        </ul>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {isListView ? (
                        <button
                          className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors duration-200 md:hidden"
                          onClick={() => setIsListView(false)}
                        >
                          <FiGrid />
                        </button>
                      ) : (
                        <button
                          className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors duration-200 md:hidden"
                          onClick={() => setIsListView(true)}
                        >
                          <FiList />
                        </button>
                      )}
                      <button className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors duration-200 md:hidden">
                        <FiFilter />
                      </button>
                      <button
                        className={`p-2 rounded-lg transition-colors duration-200 hidden md:inline-flex ${
                          !isListView ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        onClick={() => setIsListView(false)}
                      >
                        <FiGrid />
                      </button>
                      <button
                        className={`p-2 rounded-lg transition-colors duration-200 hidden md:inline-flex ${
                          isListView ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        onClick={() => setIsListView(true)}
                      >
                        <FiList />
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className={`md:relative right-3 absolute flex items-center justify-center transition-all duration-300 ${
                    isExpanded ? "w-8/12 z-50" : "w-10"
                  } h-10 sm:w-full sm:h-12 overflow-hidden`}
                  onBlur={handleBlur}
                >
                  <FiSearch
                    className="absolute left-3 cursor-pointer sm:left-4 text-green-600"
                    onClick={handleIconClick}
                  />
                  <input
                    ref={inputRef}
                    type="text"
                    className={`w-full h-full pl-10 pr-4 border border-green-200 rounded-lg ${
                      isExpanded ? "opacity-100" : "opacity-0"
                    } sm:opacity-100`}
                    placeholder="Tìm kiếm sản phẩm"
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={handleIconClick}
                  />
                </div>
              </div>
            </header>

            <div ref={productListRef}>
              {loading ? (
                <p className="text-center text-gray-600 text-lg py-8">Đang tải...</p>
              ) : combinedFilteredProducts.length > 0 ? (
                <div
                  className={`${
                    isListView ? "space-y-4" : "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  } px-2`}
                >
                  {paginatedProducts.map((product) => {
                    const isBestseller = bestsellers.some(item => item._id === product._id);
                    return (
                      <ProductCard
                        key={product._id}
                        product={product}
                        view={isListView ? "list" : "grid"}
                        isBestseller={isBestseller}
                      />
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-600 text-lg py-8">Không tìm thấy sản phẩm nào.</p>
              )}
            </div>

            <div className="flex justify-center items-center space-x-2 mt-8">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                    currentPage === index + 1 
                      ? "bg-green-600 text-white shadow-lg" 
                      : "bg-white text-gray-700 border border-green-200 hover:bg-green-50"
                  }`}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}