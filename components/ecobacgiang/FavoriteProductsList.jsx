import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FiMinus, FiPlus, FiHeart, FiShoppingBag, FiTrash2 } from "react-icons/fi";
import { FaShoppingCart } from "react-icons/fa";
import { addToCart, setCart, increaseQuantity, decreaseQuantity } from "../../store/cartSlice";
import { fetchWishlistDB, removeFromWishlistDB, optimisticRemoveFromWishlist } from "../../store/wishlistSlice";

const FavoriteProductsList = () => {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  // Cart state from Redux
  const cartItems = useSelector((state) => state.cart.cartItems) || [];
  
  // Wishlist state from Redux - ĐỒNG BỘ TỰ ĐỘNG
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems) || [];
  const favorites = Array.isArray(wishlistItems) ? wishlistItems : [];

  // Fetch wishlist khi component mount hoặc user thay đổi
  useEffect(() => {
    if (session?.user?.id) {
      setIsLoading(true);
      dispatch(fetchWishlistDB(session.user.id))
        .unwrap()
        .catch((error) => {
          toast.error("Không thể tải danh sách yêu thích");
          console.error("Fetch favorites error:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [session?.user?.id, dispatch]);

  const handleAddToCart = async (product) => {
    // Kiểm tra tình trạng hàng trước khi cho phép thêm vào giỏ
    if (product.product.stockStatus === 'Hết hàng') {
      toast.error("Sản phẩm đang hết hàng, không thể thêm vào giỏ");
      return;
    }
    
    const userId = session?.user?.id;
    // Kiểm tra an toàn cho image
    const imageArray = product.product?.image;
    const imagePath = Array.isArray(imageArray) && imageArray.length > 0 
      ? imageArray[0] 
      : (typeof imageArray === 'string' ? imageArray : null);
    const cleanPath = imagePath ? (imagePath.startsWith("/") ? imagePath.slice(1) : imagePath) : "placeholder.jpg";
    const fullImageUrl = `https://res.cloudinary.com/djbmybqt2/${cleanPath}`;
    try {
      if (userId) {
        // Chỉ dùng Server API
        const { cartService } = await import("../../lib/api-services");
        const cart = await cartService.add({
          user: userId,
          product: product.product._id,
          title: product.product.name,
          image: fullImageUrl,
          price: product.product.price,
          quantity: 1,
        });
        dispatch(setCart(cart));
        toast.success("Đã thêm vào giỏ hàng");
      } else {
        dispatch(
          addToCart({
            product: product.product._id,
            title: product.product.name,
            image: fullImageUrl,
            price: product.product.price,
            quantity: 1,
          })
        );
        toast.success("Đã thêm vào giỏ hàng");
      }
    } catch (error) {
      toast.error("Không thể thêm vào giỏ hàng");
      console.error("Add to cart error:", error);
    }
  };

  const handleIncreaseQuantity = async (productId, product) => {
    // Kiểm tra tình trạng hàng trước khi tăng số lượng
    if (product?.stockStatus === 'Hết hàng') {
      toast.error("Sản phẩm đang hết hàng, không thể tăng số lượng");
      return;
    }
    
    try {
      if (session?.user) {
        // Chỉ dùng Server API
        const { cartService } = await import("../../lib/api-services");
        const currentCart = await cartService.get(session.user.id);
        const productInCart = currentCart.products?.find(p => p.product.toString() === productId);
        const newQuantity = (productInCart?.quantity || 0) + 1;
        const cart = await cartService.update(session.user.id, productId, newQuantity);
        dispatch(setCart(cart));
      } else {
        dispatch(increaseQuantity(productId));
      }
    } catch (error) {
      toast.error("Không thể tăng số lượng");
      console.error("Increase quantity error:", error);
    }
  };

  const handleDecreaseQuantity = async (productId) => {
    const cartItem = cartItems.find((item) => item.product === productId);
    if (cartItem && cartItem.quantity <= 1) {
      try {
        if (session?.user) {
          // Chỉ dùng Server API
          const { cartService } = await import("../../lib/api-services");
          const cart = await cartService.remove(session.user.id, productId);
          dispatch(setCart(cart));
        } else {
          dispatch(decreaseQuantity(productId));
        }
        toast.success("Đã xóa khỏi giỏ hàng");
      } catch (error) {
        toast.error("Không thể xóa khỏi giỏ hàng");
        console.error("Remove from cart error:", error);
      }
    } else {
      try {
        if (session?.user) {
          // Chỉ dùng Server API
          const { cartService } = await import("../../lib/api-services");
          const currentCart = await cartService.get(session.user.id);
          const productInCart = currentCart.products?.find(p => p.product.toString() === productId);
          const newQuantity = Math.max(0, (productInCart?.quantity || 0) - 1);
          if (newQuantity === 0) {
            const cart = await cartService.remove(session.user.id, productId);
            dispatch(setCart(cart));
          } else {
            const cart = await cartService.update(session.user.id, productId, newQuantity);
            dispatch(setCart(cart));
          }
        } else {
          dispatch(decreaseQuantity(productId));
        }
      } catch (error) {
        toast.error("Không thể giảm số lượng");
        console.error("Decrease quantity error:", error);
      }
    }
  };

  const handleRemoveFavorite = async (productId) => {
    if (!session?.user?.id) {
      toast.error("Vui lòng đăng nhập để xóa sản phẩm");
      return;
    }
    
    // Optimistic update - Xóa ngay lập tức trong UI
    dispatch(optimisticRemoveFromWishlist({ productId }));
    
    try {
      // Dùng Redux action để đồng bộ với các component khác
      await dispatch(
        removeFromWishlistDB({ userId: session.user.id, productId })
      ).unwrap();
      toast.success("Đã xóa khỏi danh sách yêu thích");
      // Redux state sẽ tự động cập nhật với full data từ Server API
    } catch (error) {
      // Rollback: Fetch lại wishlist để restore state
      dispatch(fetchWishlistDB(session.user.id));
      toast.error("Không thể xóa sản phẩm khỏi danh sách yêu thích");
      console.error("Remove favorite error:", error);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/placeholder.jpg";
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    if (imagePath.startsWith('/')) return imagePath;
    return `/${imagePath}`;
  };

  const getProductImage = (product) => {
    const imageArray = product.image;
    return Array.isArray(imageArray) && imageArray.length > 0
      ? imageArray[0]
      : (typeof imageArray === 'string' ? imageArray : null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div 
          className="w-8 h-8 rounded-full animate-spin border-2 border-gray-200 border-t-green-500"
        />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-2xl bg-gray-100">
          <FiHeart />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa có sản phẩm yêu thích</h3>
        <p className="text-gray-600 mb-6 text-sm max-w-md mx-auto">
          Bạn chưa có sản phẩm nào trong danh sách yêu thích. Hãy khám phá các sản phẩm hữu cơ của chúng tôi!
        </p>
        <Link
          href="/san-pham"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
        >
          <FiShoppingBag />
          Khám phá sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Thống kê */}
      <div className="bg-white rounded-xl mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3 bg-green-50 px-4 py-3 rounded-lg border border-green-100">
            <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white text-lg">
              <FiHeart />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{favorites.length}</h3>
              <p className="text-xs text-gray-600">Sản phẩm yêu thích</p>
            </div>
          </div>
          
      
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
        {favorites.map((item, index) => {
          const product = item.product || item;
          if (!product || !product._id) return null;
          
          const cartItem = Array.isArray(cartItems)
            ? cartItems.find((item) => item.product === product._id)
            : null;
          const quantity = cartItem?.quantity || 0;
          const isInCart = !!cartItem;
          const isOutOfStock = product.stockStatus === 'Hết hàng';

          return (
            <div
              key={product._id}
              className="flex items-start md:items-center p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
            >
              {/* Số thứ tự */}
              <div className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center font-semibold text-sm mr-4 flex-shrink-0 self-center md:self-auto">
                {index + 1}
              </div>
              
              {/* Hình ảnh */}
              <div className="md:w-16 w-24 md:h-16 h-24 rounded-lg overflow-hidden mr-4 flex-shrink-0 border border-gray-200">
                <img
                  src={getImageUrl(getProductImage(product))}
                  alt={product.name || 'Sản phẩm'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
              </div>
              
              {/* Thông tin sản phẩm */}
              <div className="flex-1 mr-4">
                <h3 className="text-base font-semibold text-gray-900 mb-1 leading-tight">
                  <Link
                    href={`/san-pham/${product.slug}`}
                    className="hover:text-green-600 transition-colors"
                  >
                    {product.name}
                  </Link>
                </h3>
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(product.price)}
                </div>

                {/* Mobile: các nút thao tác xuống dòng dưới giá */}
                <div className="mt-3 flex items-center gap-2 flex-wrap md:hidden">
                  {isInCart ? (
                    <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200 gap-1.5">
                      <button
                        onClick={() => handleDecreaseQuantity(product._id)}
                        className="w-7 h-7 bg-white rounded-md text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center text-sm"
                        aria-label="Giảm số lượng"
                      >
                        <FiMinus />
                      </button>
                      <span className="min-w-[28px] text-center font-semibold text-gray-900 text-sm">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleIncreaseQuantity(product._id, product)}
                        disabled={isOutOfStock}
                        className={`w-7 h-7 bg-white rounded-md transition-colors flex items-center justify-center text-sm ${
                          isOutOfStock
                            ? "text-gray-300 cursor-not-allowed opacity-50"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        aria-label={isOutOfStock ? "Sản phẩm đang hết hàng" : "Tăng số lượng"}
                        title={isOutOfStock ? "Sản phẩm đang hết hàng" : "Tăng số lượng"}
                      >
                        <FiPlus />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={isOutOfStock}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        isOutOfStock
                          ? "bg-red-100 text-red-600 cursor-not-allowed"
                          : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                      aria-label={
                        isOutOfStock
                          ? "Sản phẩm đang hết hàng"
                          : `Thêm ${product.name} vào giỏ hàng`
                      }
                      title={isOutOfStock ? "Sản phẩm đang hết hàng" : "Thêm vào giỏ hàng"}
                    >
                      <FaShoppingCart />
                      Thêm
                    </button>
                  )}

                  <button
                    onClick={() => handleRemoveFavorite(product._id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm bg-red-500 text-white hover:bg-red-600 transition-colors"
                    aria-label={`Xóa ${product.name} khỏi danh sách yêu thích`}
                  >
                    <FiTrash2 />
                    Xóa
                  </button>
                </div>
              </div>

              {/* Desktop: giữ như cũ (nút nằm bên phải) */}
              <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                {isInCart ? (
                  <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200 gap-1.5">
                    <button
                      onClick={() => handleDecreaseQuantity(product._id)}
                      className="w-7 h-7 bg-white rounded-md text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center text-sm"
                      aria-label="Giảm số lượng"
                    >
                      <FiMinus />
                    </button>
                    <span className="min-w-[28px] text-center font-semibold text-gray-900 text-sm">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleIncreaseQuantity(product._id, product)}
                      disabled={isOutOfStock}
                      className={`w-7 h-7 bg-white rounded-md transition-colors flex items-center justify-center text-sm ${
                        isOutOfStock
                          ? "text-gray-300 cursor-not-allowed opacity-50"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                      aria-label={isOutOfStock ? "Sản phẩm đang hết hàng" : "Tăng số lượng"}
                      title={isOutOfStock ? "Sản phẩm đang hết hàng" : "Tăng số lượng"}
                    >
                      <FiPlus />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={isOutOfStock}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      isOutOfStock
                        ? "bg-red-100 text-red-600 cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                    aria-label={isOutOfStock ? "Sản phẩm đang hết hàng" : `Thêm ${product.name} vào giỏ hàng`}
                    title={isOutOfStock ? "Sản phẩm đang hết hàng" : "Thêm vào giỏ hàng"}
                  >
                    <FaShoppingCart />
                    Thêm
                  </button>
                )}

                <button
                  onClick={() => handleRemoveFavorite(product._id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm bg-red-500 text-white hover:bg-red-600 transition-colors"
                  aria-label={`Xóa ${product.name} khỏi danh sách yêu thích`}
                >
                  <FiTrash2 />
                  Xóa
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default FavoriteProductsList;