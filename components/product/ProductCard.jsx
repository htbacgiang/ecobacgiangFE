import React, { useState } from "react";
import Modal from "react-modal";
import { FaRegHeart, FaHeart, FaEye, FaShoppingCart } from "react-icons/fa";
import { FiMinus, FiPlus } from "react-icons/fi";
import Link from "next/link";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { normalizeUnit } from "../../utils/normalizeUnit";
import {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  setCart,
} from "../../store/cartSlice";
import {
  addToWishlistDB,
  removeFromWishlistDB,
  optimisticAddToWishlist,
  optimisticRemoveFromWishlist,
} from "../../store/wishlistSlice";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const ProductCard = ({ product, view = "grid", isBestseller = false }) => {
  const dispatch = useDispatch();
  const { data: session, status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mainImage, setMainImage] = useState(product?.image?.[0] || "/fallback-image.jpg");

  // Wishlist state (only for authenticated users)
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems) || [];
  const isFavorite = session && status === "authenticated"
    ? Array.isArray(wishlistItems) && wishlistItems.some((item) => {
        if (!item || !item.product) return false;
        // Handle both object and string ID formats
        const itemProductId = item.product._id || item.product.toString() || item.product;
        const currentProductId = product?._id || product;
        return itemProductId === currentProductId;
      })
    : false;

  // Cart state
  const cartItems = useSelector((state) => state.cart.cartItems) || [];
  const cartItem = Array.isArray(cartItems)
    ? cartItems.find((item) => item.product === product?._id)
    : null;
  const quantity = cartItem ? cartItem.quantity : 0;

  // Early return if product is not provided (after all hooks are called)
  if (!product) {
    return <div className="bg-white rounded-lg p-4">Sản phẩm không khả dụng</div>;
  }

  // Ensure product has required properties
  const productName = product.name || "Sản phẩm không tên";
  const productPrice = product.price || 0;
  const productImages = Array.isArray(product.image) ? product.image : [];
  const productSlug = product.slug || "";
  const productRating = product.rating || 0;
  const productReviewCount = product.reviewCount || 0;
  const productDescription = product.description || "";
  const productStockStatus = product.stockStatus;
  const productPromotionalPrice = product.promotionalPrice || 0;
  const productUnit = normalizeUnit(product.unit) || "N/A";

  const isKgUnit = (unit) => (unit || "").toString().trim().toLowerCase() === "kg";
  const is100gUnit = (unit) => (normalizeUnit(unit) || unit) === "100g";

  const normalizeQuantity = (qty, unit) => {
    const n = Number(qty ?? 0);
    if (!Number.isFinite(n)) return 0;
    // avoid floating errors; for kg, snap to 0.5 steps
    if (isKgUnit(unit)) return Math.round(n * 2) / 2;
    // for non-kg, keep integer quantities
    return Math.round(n);
  };

  // Modal image handling
  const handleThumbnailClick = (thumb) => {
    setMainImage(thumb);
  };

  // Favorite toggle
  const handleToggleFavorite = async () => {
    if (status !== "authenticated" || !session?.user) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm yêu thích", { autoClose: 3000 });
      return;
    }

    const userId = session.user.id;
    
    // Optimistic update - Cập nhật UI ngay lập tức
    if (isFavorite) {
      dispatch(optimisticRemoveFromWishlist({ productId: product._id }));
    } else {
      dispatch(optimisticAddToWishlist({ product, style: "" }));
    }
    
    try {
      if (isFavorite) {
        await dispatch(
          removeFromWishlistDB({ userId, productId: product._id })
        ).unwrap();
        toast.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        await dispatch(
          addToWishlistDB({ userId, product: product._id, style: "" })
        ).unwrap();
        toast.success("Đã thêm vào danh sách yêu thích");
      }
    } catch (error) {
      // Rollback optimistic update nếu có lỗi
      if (isFavorite) {
        dispatch(optimisticAddToWishlist({ product, style: "" }));
      } else {
        dispatch(optimisticRemoveFromWishlist({ productId: product._id }));
      }
      toast.error("Không thể cập nhật danh sách yêu thích");
      console.error("Toggle favorite error:", error);
    }
  };

  // Modal open/close
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // Cart operations
  const handleAddToCart = async () => {
    // Kiểm tra tình trạng hàng trước khi cho phép thêm vào giỏ
    if (isOutOfStock) {
      toast.error("Sản phẩm đang hết hàng, không thể thêm vào giỏ");
      return;
    }
    
    const userId = session?.user?.id;
    try {
      if (userId) {
        // Thử dùng API server mới
        try {
          const { cartService } = await import("../../lib/api-services");
          const cart = await cartService.add({
            user: userId,
            product: product._id,
            title: productName,
            image: productImages[0],
            price: productPrice,
            quantity: 1,
          });
          dispatch(setCart(cart));
          toast.success("Đã thêm vào giỏ hàng");
        } catch (error) {
          console.error("Error adding to cart:", error);
          const errorMessage = error.response?.data?.error || error.message || "Có lỗi khi thêm vào giỏ hàng";
          toast.error(errorMessage);
        }
      } else {
        dispatch(
          addToCart({
            product: product._id,
            title: productName,
            image: productImages[0],
            price: productPrice,
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

  const handleIncreaseQuantity = async () => {
    // Kiểm tra tình trạng hàng trước khi tăng số lượng
    if (isOutOfStock) {
      toast.error("Sản phẩm đang hết hàng, không thể tăng số lượng");
      return;
    }
    
    try {
      if (session?.user) {
        // Thử dùng API server mới
        try {
          const { cartService } = await import("../../lib/api-services");
          const currentCart = await cartService.get(session.user.id);
          const productInCart = currentCart.products?.find(p => p.product.toString() === product._id);
          const currentQty = Number(productInCart?.quantity ?? 0);
          const effectiveStep =
            isKgUnit(productUnit) && currentQty === 0.5 ? 0.5 : 1;
          let newQuantity = normalizeQuantity(currentQty + effectiveStep, productUnit);
          if (is100gUnit(productUnit)) newQuantity = Math.min(9, Math.max(1, Math.round(newQuantity)));
          const cart = await cartService.update(session.user.id, product._id, newQuantity);
          dispatch(setCart(cart));
        } catch (apiError) {
          // Fallback về Next.js API
          const res = await axios.put(
            `/api/cart/${session.user.id}/${product._id}`,
            { type: "increase" }
          );
          dispatch(setCart(res.data));
        }
      } else {
        const currentQty = Number(quantity ?? 0);
        const effectiveStep =
          isKgUnit(productUnit) && currentQty === 0.5 ? 0.5 : 1;
        dispatch(increaseQuantity({ productId: product._id, step: effectiveStep }));
      }
    } catch (error) {
      toast.error("Không thể tăng số lượng");
      console.error("Increase quantity error:", error);
    }
  };

  const handleDecreaseQuantity = async () => {
    try {
      if (session?.user) {
        // Thử dùng API server mới
        try {
          const { cartService } = await import("../../lib/api-services");
          const currentCart = await cartService.get(session.user.id);
          const productInCart = currentCart.products?.find(p => p.product.toString() === product._id);
          const currentQty = Number(productInCart?.quantity ?? 0);
          const effectiveStep =
            isKgUnit(productUnit) && currentQty === 1 ? 0.5 : 1;
          let newQuantity = Math.max(0, normalizeQuantity(currentQty - effectiveStep, productUnit));
          if (is100gUnit(productUnit)) newQuantity = Math.min(9, Math.max(0, Math.round(newQuantity)));
          if (newQuantity === 0) {
            const cart = await cartService.remove(session.user.id, product._id);
            dispatch(setCart(cart));
          } else {
            const cart = await cartService.update(session.user.id, product._id, newQuantity);
            dispatch(setCart(cart));
          }
        } catch (apiError) {
          // Fallback về Next.js API
          const res = await axios.put(
            `/api/cart/${session.user.id}/${product._id}`,
            { type: "decrease" }
          );
          dispatch(setCart(res.data));
        }
      } else {
        dispatch(decreaseQuantity({ productId: product._id, step: 1 }));
      }
    } catch (error) {
      toast.error("Không thể giảm số lượng");
      console.error("Decrease quantity error:", error);
    }
  };

  const isOutOfStock = productStockStatus === "Hết hàng";

  return (
    <div className="relative bg-white w-full rounded-lg overflow-hidden transition-transform translate-y-0.5 cursor-pointer">
      {isBestseller && (
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
            🔥 Bán chạy
          </span>
        </div>
      )}
      <div
        className={`${
          view === "list"
            ? "flex border rounded-lg bg-white p-4"
            : "relative border w-full rounded-lg overflow-hidden shadow-sm"
        }`}
      >
        <Link href={`/san-pham/${productSlug}`}>
          <img
            src={productImages[0] || "/fallback-image.jpg"}
            alt={`Hình ảnh sản phẩm ${productName}`}
            className={`${
              view === "list"
                ? "md:w-40 md:h-40 h-32 w-32 object-contain mr-4"
                : "object-contain w-full md:h-64 h-40"
            } rounded`}
            onError={(e) => {
              e.target.src = "/fallback-image.jpg";
            }}
          />
        </Link>
        <div
          className={`flex-1 ${view === "list" ? "pr-4" : "p-3 text-left"}`}
        >
          <Link href={`/san-pham/${productSlug}`}>
            <h3 className="text-base font-bold text-gray-700 line-clamp-2">
              {productName}
            </h3>
          </Link>

          <div className="flex justify-start items-center mt-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${
                  i < Math.round(productRating)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10 15l-5.5 3 1-5.5L2 7.5l5.5-.5L10 2l2.5 5 5.5.5-3.5 4.5 1 5.5z" />
              </svg>
            ))}
            <span className="ml-1 text-sm text-gray-500 hidden md:block">
              ({productReviewCount} Đánh giá)
            </span>
          </div>

          <div className="flex items-center mt-2">
            <span className="text-green-600 font-bold text-lg">
              {formatCurrency(productPrice)}
              {productUnit && productUnit !== "N/A" && (
                <span className="text-gray-600 font-normal text-base ml-1">
                  /{productUnit}
                </span>
              )}
            </span>
            {productPromotionalPrice > 0 && (
              <span className="text-red-500 line-through text-base ml-2">
                {formatCurrency(productPromotionalPrice)}
              </span>
            )}
          </div>

          {view === "list" && (
            <>
              <p className="text-base text-gray-500 mt-2 md:block hidden">
                {productDescription}
              </p>
              <div className="list-view flex flex-wrap items-center gap-2 mt-4">
                <button
                  className="p-2 rounded-full shadow bg-white hover:bg-gray-100"
                  onClick={handleToggleFavorite}
                >
                  {isFavorite ? (
                    <FaHeart className="text-red-500" />
                  ) : (
                    <FaRegHeart className="text-gray-500" />
                  )}
                </button>
                <button
                  className="p-2 rounded-full shadow bg-white hover:bg-gray-100"
                  onClick={handleOpenModal}
                >
                  <FaEye className="text-blue-500" />
                </button>

                {quantity > 0 ? (
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button className="p-2" onClick={handleDecreaseQuantity}>
                      <FiMinus />
                    </button>
                    <span className="px-4">{quantity}</span>
                    <button
                      className={`p-2 ${
                        isOutOfStock
                          ? "text-gray-400 cursor-not-allowed"
                          : "hover:text-black"
                      }`}
                      onClick={handleIncreaseQuantity}
                      disabled={isOutOfStock}
                      title={isOutOfStock ? "Sản phẩm đang hết hàng" : "Tăng số lượng"}
                    >
                      <FiPlus />
                    </button>
                  </div>
                ) : (
                  <button
                    className={`${
                      isOutOfStock
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600"
                    } md:px-2 px-2 py-2 rounded text-base flex items-center`}
                    onClick={isOutOfStock ? undefined : handleAddToCart}
                    disabled={isOutOfStock}
                    title={isOutOfStock ? "Sản phẩm đang hết hàng" : "Thêm vào giỏ hàng"}
                  >
                    {isOutOfStock ? (
                      <>
                          <FaShoppingCart className="mr-2 text-red-700" />
                          <span className="mr-2 text-red-700"> Hết hàng</span>
                      </>
                    ) : (
                      <>
                    <FaShoppingCart className="mr-2" />
                    Thêm giỏ hàng
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {view !== "list" && (
          <>
            <div className="absolute top-2 right-2 flex-col flex space-y-1">
              <button
                className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                onClick={handleToggleFavorite}
              >
                {isFavorite ? (
                  <FaHeart className="text-red-500" />
                ) : (
                  <FaRegHeart className="text-gray-500" />
                )}
              </button>
              <button
                className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                onClick={handleOpenModal}
              >
                <FaEye className="text-blue-500" />
              </button>
            </div>

            <div className="flex justify-center items-center mt-2 pb-3 w-full">
              {quantity === 0 ? (
                <button
                  onClick={isOutOfStock ? undefined : handleAddToCart}
                  disabled={isOutOfStock}
                  className={`${
                    isOutOfStock 
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  } py-2 px-3 rounded-lg text-base flex items-center`}
                  title={isOutOfStock ? "Sản phẩm đang hết hàng" : "Thêm vào giỏ hàng"}
                >
                  {isOutOfStock ? (
                    <>
                    <FaShoppingCart className="mr-2 text-red-700" />
                      <span className="mr-2 text-red-700"> Hết hàng</span>
                    </>
                  ) : (
                    <>
                  <FaShoppingCart className="mr-2" />
                  Thêm giỏ hàng
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    className="p-2 text-gray-600 hover:text-black"
                    onClick={handleDecreaseQuantity}
                  >
                    <FiMinus />
                  </button>
                  <span className="px-5 py-2">{quantity}</span>
                  <button
                    className={`p-2 font-bold ${
                      isOutOfStock
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-600 hover:text-black"
                    }`}
                    onClick={handleIncreaseQuantity}
                    disabled={isOutOfStock}
                    title={isOutOfStock ? "Sản phẩm đang hết hàng" : "Tăng số lượng"}
                  >
                    <FiPlus />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        className="modalContent relative w-full max-w-[900px] bg-white p-3 sm:p-6 rounded-2xl shadow-2xl border border-gray-100 outline-none modal"
        overlayClassName="modalOverlay"
      >
        <button
          onClick={handleCloseModal}
          className="absolute top-4 right-4 w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-200 z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-1/2">
              <div
                className="relative w-full overflow-hidden rounded-xl"
                style={{ aspectRatio: "1 / 1" }}
              >
                <img
                  src={mainImage || "/fallback-image.jpg"}
                  alt={`Hình ảnh sản phẩm ${productName}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex w-full md:mt-4 mt-3 gap-3 justify-center">
                {productImages.slice(0, 5).map((thumb, index) => (
                  <img
                    key={index}
                    src={thumb || "/fallback-image.jpg"}
                    alt={`Thumbnail ${index + 1}`}
                    className={`w-20 h-20 object-cover rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                      mainImage === thumb ? "border-green-500 shadow-md" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleThumbnailClick(thumb)}
                  />
                ))}
              </div>
            </div>

            <div className="w-full lg:w-1/2 flex flex-col space-y-2">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 leading-tight">
                  {productName}
                </h2>
                <div className="flex items-center">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(productRating)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.5 3 1-5.5L2 7.5l5.5-.5L10 2l2.5 5 5.5.5-3.5 4.5 1 5.5z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-600 ml-2 text-sm font-medium">
                    {productRating.toFixed(1)} ({productReviewCount} đánh giá)
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-2 rounded-xl">
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(productPrice)}
                    {productUnit && productUnit !== "N/A" && (
                      <span className="text-gray-600 font-normal text-lg ml-2">
                        /{productUnit}
                      </span>
                    )}
                  </span>
                  {productPromotionalPrice > 0 && (
                    <span className="text-lg text-red-500 line-through ml-3">
                      {formatCurrency(productPromotionalPrice)}
                    </span>
                  )}
                </div>
                <div className="mt-2 space-y-1 text-sm text-gray-700">
                  <div className="flex gap-2">
                    <span className="font-semibold shrink-0">Mô tả:</span>
                    <span
                      className="text-gray-600"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {productDescription}
                    </span>
                  </div>
               <div className=" hidden md:block" >
                <span className="font-semibold">ĐVT:</span>
                <span className="text-gray-600 ml-2"> {productUnit}</span>
               </div>
                </div>

              </div>

              <div className="flex items-center space-x-4">
                {quantity > 0 ? (
                  <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl px-4 py-2">
                    <button
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={handleDecreaseQuantity}
                    >
                      <FiMinus />
                    </button>
                    <span className="px-6 font-semibold text-lg">{quantity}</span>
                    <button
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                        isOutOfStock
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-600 hover:text-black hover:bg-gray-100"
                      }`}
                      onClick={handleIncreaseQuantity}
                      disabled={isOutOfStock}
                      title={isOutOfStock ? "Sản phẩm đang hết hàng" : "Tăng số lượng"}
                    >
                      <FiPlus />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={isOutOfStock ? undefined : handleAddToCart}
                    disabled={isOutOfStock}
                    className={`${
                      isOutOfStock 
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700 hover:shadow-lg transform hover:scale-105"
                    } py-3 px-8 rounded-xl flex items-center font-semibold transition-all duration-200`}
                    title={isOutOfStock ? "Sản phẩm đang hết hàng" : "Thêm vào giỏ hàng"}
                  >
                    {isOutOfStock ? (
                      <>
                            <FaShoppingCart className="mr-2 text-red-700" />
                            <span className="mr-2 text-red-700"> Hết hàng</span>
                      </>
                    ) : (
                      <>
                    <FaShoppingCart className="mr-3 text-lg" />
                    Thêm giỏ hàng
                      </>
                    )}
                  </button>
                )}
                
                <button
                  onClick={handleToggleFavorite}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                    isFavorite 
                      ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100" 
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {isFavorite ? (
                    <FaHeart className="text-xl" />
                  ) : (
                    <FaRegHeart className="text-xl" />
                  )}
                </button>
              </div>


            </div>
          </div>
        </div>
      </Modal>
      
    </div>
  );
};

export default ProductCard;