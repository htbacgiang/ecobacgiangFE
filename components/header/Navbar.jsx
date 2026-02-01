"use client";
import React, { useState, useEffect, useRef } from "react";
import logo from "../../public/logoecobacgiang.png";
import Image from "next/image";
import Link from "next/link";
import { IoSearch, IoCartOutline } from "react-icons/io5";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { FaRegUser } from "react-icons/fa";
import ShoppingCart from "../products/ShoppingCart";
import ResponsiveNavbar from "./ResponsiveNavbar";
import UserDropdown from "./UserDropdown";
import CrowdfundingSection from "./CrowdfundingSection";
import useAuth from "../../hooks/useAuth";
import { setCart } from "../../store/cartSlice";
import { useSelector, useDispatch } from "react-redux";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isCrowdFundingOpen, setIsCrowdFundingOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [productsCache, setProductsCache] = useState(null);
  const { user: sessionUser, isAuthenticated } = useAuth();
  const session = isAuthenticated ? { user: sessionUser } : null;

  const dropdownRef = useRef(null);

  // Redux cart state
  const cartItems = useSelector((state) => state.cart.cartItems) || [];
  const totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
  const dispatch = useDispatch();

  // Sync cart with backend on login
  useEffect(() => {
    async function syncCart() {
      if (sessionUser?.id) {
        try {
          // Chỉ dùng Server API
          const { cartService } = await import("../../lib/api-services");
          const cart = await cartService.get(sessionUser.id);
          dispatch(setCart(cart));
        } catch (error) {
          // Chỉ log error, không hiển thị toast để tránh spam
          // Nếu cart rỗng thì không sao, có thể user chưa có sản phẩm nào
          if (error.message && !error.message.includes('not found') && !error.message.includes('404')) {
            console.error("Error syncing cart:", error);
          }
          // Set empty cart nếu có lỗi
          dispatch(setCart({ products: [], cartTotal: 0 }));
        }
      }
      // Không làm gì khi không có session - giữ nguyên cart trong Redux store (localStorage)
      // Điều này cho phép người dùng chưa đăng nhập vẫn có thể thêm sản phẩm vào giỏ hàng
    }
    syncCart();
  }, [sessionUser?.id, dispatch]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sticky navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Disable body scroll when CrowdFunding modal is open
  useEffect(() => {
    if (isCrowdFundingOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore scroll position
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isCrowdFundingOpen]);

  // Toggle functions
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleCart = () => setCartOpen(!cartOpen);
  const toggleSearch = () => setSearchOpen(!searchOpen);
  const toggleUserDropdown = () => setUserDropdownOpen(!userDropdownOpen);
  const toggleCrowdFunding = () => setIsCrowdFundingOpen(!isCrowdFundingOpen);

  // Load products cache khi mở search
  useEffect(() => {
    if (searchOpen && !productsCache) {
      const loadProducts = async () => {
        try {
          const { productService } = await import("../../lib/api-services");
          const response = await productService.getAll();
          const allProducts = response.products || response || [];
          setProductsCache(allProducts);
        } catch (error) {
          console.error('Error loading products:', error);
        }
      };
      loadProducts();
    }
  }, [searchOpen, productsCache]);

  // Lấy URL ảnh từ product (API trả về image là mảng hoặc string)
  const getProductImageUrl = (product) => {
    const raw = Array.isArray(product.image)
      ? product.image[0]
      : product.image || product.images?.[0];
    if (!raw) return null;
    if (typeof raw === "object" && raw?.url) return raw.url;
    const url = typeof raw === "string" ? raw : String(raw);
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) return url;
    return `/${url}`;
  };

  // Normalize text để tìm kiếm không phân biệt hoa thường và có dấu
  const normalizeText = (text) => {
    if (!text) return '';
    return String(text)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
      .trim();
  };

  // Search function - lọc sản phẩm chính xác theo từng từ trong query
  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // Nếu chưa có cache, load products trước
      let allProducts = productsCache;
      if (!allProducts) {
        const { productService } = await import("../../lib/api-services");
        const response = await productService.getAll();
        allProducts = response.products || response || [];
        setProductsCache(allProducts);
      }
      
      const normalizedQuery = normalizeText(query);
      const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);
      if (queryWords.length === 0) {
        setSearchResults([]);
        return;
      }

      const filteredProducts = allProducts.filter(product => {
        const name = product.name || product.title || '';
        const description = product.description || product.shortDescription || '';
        const slug = product.slug || '';
        const slugForSearch = slug ? String(slug).replace(/-/g, ' ') : '';
        const category = product.category;
        const categoryStr = typeof category === 'object' && category !== null
          ? (category.name || category.title || category.slug || '')
          : (category || '');
        
        const searchableText = `${name} ${description} ${slugForSearch} ${slug} ${categoryStr}`;
        const normalizedSearch = normalizeText(searchableText);
        
        // Mỗi từ trong query phải xuất hiện trong text (tìm theo từ, chính xác hơn)
        return queryWords.every(word => normalizedSearch.includes(word));
      });
      
      // Format lại để hiển thị (image phải là URL string, API trả về product.image là mảng)
      setSearchResults(filteredProducts.map(product => ({
        id: product._id || product.id,
        title: product.name || product.title,
        slug: product.slug,
        image: getProductImageUrl(product),
        price: product.price,
        description: product.description || product.shortDescription,
        type: 'product'
      })));
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when searchQuery changes; performSearch is stable
  }, [searchQuery]);

  // Handle search selection
  const handleSearchSelect = (item) => {
    setSearchOpen(false);
    setSearchQuery("");
    // Navigate to product page
    window.location.href = `/san-pham/${item.slug}`;
  };

  // Keyboard support for search
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
        setSearchQuery("");
      }
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  return (
    <nav
      className={`fixed w-full h-20 z-[9999] transition-all duration-500 ${
        isSticky 
          ? "shadow-xl bg-white/95 backdrop-blur-md border-b border-gray-100" 
          : "bg-white shadow-lg border-b border-gray-100"
      }`}
    >
      <div className="flex justify-between container mx-auto items-center h-full w-full px-4 md:px-0">
        {/* Left Side - Logo */}
        <div className="flex-shrink-0">
          <Link href="/">
            <Image
              src={logo}
              alt="Eco Bắc Giang logo"
              width={150}
              height={45}
              className="cursor-pointer transition-transform duration-300 hover:scale-105"
              priority
              objectFit="contain"
            />
          </Link>
        </div>

        {/* Center - Navigation Links */}
        <div className="hidden lg:flex">
          <ul className="flex items-center space-x-8">
            <li>
              <Link
                href="/"
                className="text-gray-700  hover:text-green-600 font-heading font-semibold transition-all duration-300 relative group"
              >
                Trang chủ
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
            <li
              className="relative group"
              onMouseEnter={() => setAboutDropdownOpen(true)}
              onMouseLeave={() => setAboutDropdownOpen(false)}
            >
              <p className="text-gray-700 cursor-pointer  hover:text-green-600 font-heading font-semibold transition-all duration-300 relative">
                Về Eco Bắc Giang
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
              </p>
              {aboutDropdownOpen && (
                <React.Fragment>
                  <div className="absolute top-full left-0 w-full h-2"></div>
                  <ul className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl z-[10000] w-72 border border-gray-100 overflow-hidden pt-3">
                    <li className="hover:bg-green-50 transition-colors duration-200">
                      <Link href="/gioi-thieu-ecobacgiang" className="block px-6 py-3 text-gray-700 hover:text-green-600">
                        Giới thiệu
                      </Link>
                    </li>
                    <li className="hover:bg-green-50 transition-colors duration-200">
                      <Link href="/tam-nhin-su-menh" className="block px-6 py-3 text-gray-700 hover:text-green-600">
                        Tầm nhìn, Sứ mạng
                      </Link>
                    </li>
                    <li className="hover:bg-green-50 transition-colors duration-200">
                      <Link href="/y-nghia-logo-ecobacgiang" className="block px-6 py-3 text-gray-700 hover:text-green-600">
                        Ý nghĩa Logo
                      </Link>
                    </li>
                    <li className="hover:bg-green-50 transition-colors duration-200">
                      <Link href="/doi-ngu" className="block px-6 py-3 text-gray-700 hover:text-green-600">
                        Đội ngũ
                      </Link>
                    </li>
               
                  </ul>
                </React.Fragment>
              )}
            </li>
            <li>
              <Link
                href="/bai-viet"
                className="text-gray-700  hover:text-green-600 font-heading font-semibold transition-all duration-300 relative group"
              >
                Blog sống xanh
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
            <li>
              <Link
                href="/san-pham"
                className="text-gray-700  hover:text-green-600 font-heading font-semibold transition-all duration-300 relative group"
              >
                Sản phẩm
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
         
            <li>
              <Link
                href="/lien-he"
                className="text-gray-700  hover:text-green-600 font-heading font-semibold transition-all duration-300 relative group"
              >
                Liên hệ
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Right Side - Actions */}
        <div className="hidden lg:flex items-center space-x-3">
          <button
            onClick={toggleCrowdFunding}
            className="bg-green-600 hover:bg-green-700 py-3 font-heading text-white px-6 rounded-full font-semibold  transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            aria-label="Open Crowd Funding form"
          >
            CrowdFunding
          </button>
          <div
            className="bg-white p-3 rounded-full shadow-md hover:shadow-lg hover:bg-gray-50 cursor-pointer transition-all duration-300 transform hover:scale-110 border border-gray-100 relative group"
            onClick={toggleSearch}
            aria-label="Open search"
            title="Tìm kiếm (Ctrl+K)"
          >
            <IoSearch className="text-gray-600 text-lg" />
            {/* Keyboard shortcut hint */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              Ctrl+K
            </div>
          </div>
          <div className="relative">
            <div
              className="bg-white p-3 rounded-full shadow-md hover:shadow-lg hover:bg-gray-50 cursor-pointer transition-all duration-300 transform hover:scale-110 border border-gray-100"
              onClick={toggleCart}
              aria-label={`Shopping cart with ${totalQuantity} items`}
            >
              <IoCartOutline className="text-gray-600 text-lg" />
              {totalQuantity > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full animate-pulse">
                  {totalQuantity}
                </span>
              )}
            </div>
          </div>
          <div className="relative" ref={dropdownRef}>
            <div
              className="cursor-pointer bg-white p-3 rounded-full shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-110 border border-gray-100"
              onClick={toggleUserDropdown}
              role="button"
              aria-expanded={userDropdownOpen}
              aria-controls="user-dropdown"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && toggleUserDropdown()}
            >
              <FaRegUser className="text-gray-600 text-lg" />
            </div>
            <UserDropdown
              userDropdownOpen={userDropdownOpen}
              toggleUserDropdown={toggleUserDropdown}
            />
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center space-x-2">
          <div
            className="cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            onClick={toggleSearch}
            title="Tìm kiếm"
          >
            <IoSearch size={20} className="text-gray-700" />
          </div>
          <div className="cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors duration-200" onClick={toggleMenu}>
            {menuOpen ? <AiOutlineClose size={25} className="text-gray-700" /> : <AiOutlineMenu size={25} className="text-gray-700" />}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <ResponsiveNavbar isOpen={menuOpen} toggleMenu={toggleMenu} />

      {/* Search Overlay - Đơn giản hóa */}
      {searchOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm z-[10000] flex items-start justify-center"
          onClick={() => {
            setSearchOpen(false);
            setSearchQuery("");
          }}
        >
          <div
            className="w-full max-w-[600px] bg-white mt-20 mx-4 rounded-lg shadow-xl border border-gray-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center px-4 py-3 border-b border-gray-200">
              <IoSearch className="text-gray-400 text-xl mr-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="flex-1 border-none outline-none text-gray-700 text-base placeholder-gray-400"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchResults.length > 0) {
                    handleSearchSelect(searchResults[0]);
                  }
                }}
              />
              {isSearching && (
                <div className="ml-2 animate-spin">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-green-600 rounded-full"></div>
                </div>
              )}
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <AiOutlineClose size={18} className="text-gray-500" />
              </button>
            </div>
            
            {/* Search Results */}
            <div className="max-h-[500px] overflow-y-auto">
              {searchQuery.trim() ? (
                <div className="p-4">
                  {isSearching ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin">
                        <div className="w-6 h-6 border-2 border-gray-300 border-t-green-600 rounded-full"></div>
                      </div>
                      <p className="text-gray-500 mt-3 text-sm">Đang tìm kiếm...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 mb-3">
                        Tìm thấy {searchResults.length} sản phẩm
                      </p>
                      {searchResults.map((item) => (
                        <button
                          key={item.id || item.slug}
                          onClick={() => handleSearchSelect(item)}
                          className="w-full flex items-center p-3 hover:bg-green-50 rounded-lg transition-colors text-left border border-transparent hover:border-green-200"
                        >
                          <div className="relative w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mr-3 overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <span className="text-2xl">🥬</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-800 mb-1">{item.title}</div>
                            {item.description && (
                              <div className="text-sm text-gray-500 line-clamp-1 mb-1">{item.description}</div>
                            )}
                            {item.price && (
                              <div className="text-sm text-green-600 font-semibold">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <IoSearch className="text-gray-400 text-xl" />
                      </div>
                      <p className="text-gray-600 font-medium mb-1">Không tìm thấy sản phẩm</p>
                      <p className="text-sm text-gray-400">Thử từ khóa khác</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center py-12">
                  <IoSearch className="text-gray-300 text-4xl mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Nhập từ khóa để tìm kiếm sản phẩm</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shopping Cart */}
      {cartOpen && (
        <ShoppingCart toggleCart={toggleCart} />
      )}

      {/* Crowd Funding Popup */}
      {isCrowdFundingOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] overflow-y-auto"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10000
          }}
          onClick={() => setIsCrowdFundingOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Crowd Funding Form"
        >
          <div
            className="min-h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full mx-4 my-8 flex flex-col border border-gray-200"
              style={{ maxHeight: '90vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end items-center border-b border-gray-100 p-4 flex-shrink-0">
                <AiOutlineClose
                  className="cursor-pointer bg-gray-100 hover:bg-red-500 hover:text-white text-gray-700 p-2 rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-110"
                  size={30}
                  onClick={() => setIsCrowdFundingOpen(false)}
                  aria-label="Close Crowd Funding form"
                />
              </div>
              <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(90vh - 80px)' }}>
                <CrowdfundingSection />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;