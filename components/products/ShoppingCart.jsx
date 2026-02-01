  import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AiOutlineClose, AiOutlineMinus, AiOutlinePlus, AiOutlineShoppingCart, AiOutlineGift, AiOutlineCreditCard } from "react-icons/ai";
import { BiTrash } from "react-icons/bi";
import { MdOutlineLocalOffer } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import {
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  setCart,
} from "../../store/cartSlice";
import useAuth from "../../hooks/useAuth";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { normalizeUnit } from "../../utils/normalizeUnit";

const ShoppingCart = ({ toggleCart }) => {
  // Thêm keyboard support để đóng cart bằng ESC
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        toggleCart();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleCart]);

  // Đảm bảo body không scroll khi cart mở
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  const dispatch = useDispatch();
  const { user } = useAuth();

  // Lấy dữ liệu cart từ Redux
  const {
    cartItems,
    coupon: appliedCoupon,
    discount: reduxDiscount,
    totalAfterDiscount,
  } = useSelector((state) => state.cart);

  // Tính tổng tiền từ cartItems (như ở trang cart)
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // State local cho coupon, errorMessage, loading
  const [coupon, setCoupon] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  // Tính phần giảm giá và tổng thanh toán sau giảm dựa trên totalPrice
  // Ưu tiên dùng reduxDiscount từ Redux (đã được sync từ server)
  const activeDiscount = reduxDiscount || 0;
  const discountAmount = (totalPrice * activeDiscount) / 100;
  const finalTotalAfterDiscount = totalAfterDiscount || totalPrice - discountAmount;

  // Đồng bộ coupon từ Redux (chỉ khi Redux có coupon và local chưa có)
  useEffect(() => {
    // Chỉ sync từ Redux nếu:
    // 1. Có user và có coupon trong Redux
    // 2. Local state chưa có coupon hoặc khác với Redux
    if (user?.id && appliedCoupon && appliedCoupon.trim() !== '') {
      // Chỉ update nếu local state khác với Redux
      if (coupon !== appliedCoupon) {
        console.log("🔄 Syncing coupon from Redux:", appliedCoupon);
        setCoupon(appliedCoupon);
      }
    } else if (!appliedCoupon || appliedCoupon.trim() === '') {
      // Chỉ reset nếu Redux không có coupon VÀ local có coupon
      // Không reset nếu user đang nhập coupon
      if (coupon !== '' && !loadingCoupon) {
        console.log("🔄 Clearing coupon (no coupon in Redux)");
        setCoupon("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync coupon from Redux; adding coupon would cause loop
  }, [user?.id, appliedCoupon, loadingCoupon]);

  // Các hàm xử lý tăng/giảm/xóa sản phẩm
  const isKgUnit = (unit) => (unit || "").toString().trim().toLowerCase() === "kg";
  const is100gUnit = (unit) => (normalizeUnit(unit) || unit) === "100g";

  const displayQty = (qty, unit) => {
    const n = Number(qty ?? 0);
    if (!Number.isFinite(n)) return "0";
    if (is100gUnit(unit)) return String(Math.round(n) * 100);
    return String(n);
  };

  const normalizeQuantity = (qty, unit) => {
    const n = Number(qty ?? 0);
    if (!Number.isFinite(n)) return 0;
    if (isKgUnit(unit)) return Math.round(n * 2) / 2;
    return Math.round(n);
  };

  const handleIncrease = async (productId, step = 1, unit = "") => {
    if (user?.id) {
      try {
        // Chỉ dùng Server API
        const { cartService } = await import("../../lib/api-services");
        const currentCart = await cartService.get(user.id);
        const productInCart = currentCart.products?.find(p => p.product.toString() === productId);
        const currentQty = Number(productInCart?.quantity ?? 0);
        // Nếu đang 0.5kg và bấm "+": tăng lên 1kg trước, sau đó tăng theo 1 như cũ
        const effectiveStep =
          isKgUnit(unit) && step === 1 && currentQty === 0.5 ? 0.5 : step;
        let newQuantity = normalizeQuantity(currentQty + effectiveStep, unit);
        if (is100gUnit(unit)) newQuantity = Math.min(9, Math.max(1, Math.round(newQuantity)));
        const cart = await cartService.update(user.id, productId, newQuantity);
        dispatch(setCart(cart));
      } catch (error) {
        console.error(error);
        toast.error("Có lỗi khi tăng số lượng.");
      }
    } else {
      // Xử lý tăng số lượng cho người dùng chưa đăng nhập
      const currentItem = cartItems.find((i) => i.product === productId);
      const currentQty = Number(currentItem?.quantity ?? 0);
      const effectiveStep =
        isKgUnit(unit) && step === 1 && currentQty === 0.5 ? 0.5 : step;
      dispatch(increaseQuantity({ productId, step: effectiveStep }));
    }
  };

  const handleDecrease = async (productId, step = 1, unit = "") => {
    if (user?.id) {
      try {
        // Chỉ dùng Server API
        const { cartService } = await import("../../lib/api-services");
        const currentCart = await cartService.get(user.id);
        const productInCart = currentCart.products?.find(p => p.product.toString() === productId);
        const currentQuantity = Number(productInCart?.quantity ?? 0);
        // Logic giảm xuống 0.5kg khi đang là 1kg
        const effectiveStep = isKgUnit(unit) && currentQuantity === 1 && step === 1 ? 0.5 : step;
        const newQuantity = Math.max(0, normalizeQuantity(currentQuantity - effectiveStep, unit));

        if (newQuantity === 0) {
          await cartService.remove(user.id, productId);
          const updatedCart = await cartService.get(user.id);
          dispatch(setCart(updatedCart));
        } else {
          const cart = await cartService.update(user.id, productId, newQuantity);
          dispatch(setCart(cart));
        }
      } catch (error) {
        console.error(error);
        toast.error("Có lỗi khi giảm số lượng.");
      }
    } else {
      // Xử lý giảm số lượng cho người dùng chưa đăng nhập
      dispatch(decreaseQuantity({ productId, step }));
    }
  };

  const handleRemove = async (productId) => {
    if (user?.id) {
      try {
        // Chỉ dùng Server API
        const { cartService } = await import("../../lib/api-services");
        await cartService.remove(user.id, productId);
        const updatedCart = await cartService.get(user.id);
        dispatch(setCart(updatedCart));
        toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
      } catch (error) {
        console.error(error);
        toast.error("Có lỗi khi xóa sản phẩm.");
      }
    } else {
      dispatch(removeFromCart(productId));
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
    }
  };

  // Hàm áp mã giảm giá
  const handleApplyCoupon = async () => {
    setLoadingCoupon(true);
    if (!user?.id) {
      toast.error("Vui lòng đăng nhập để áp dụng mã giảm giá.");
      setLoadingCoupon(false);
      return;
    }
    // Kiểm tra nếu mã giảm giá rỗng
    if (!coupon || coupon.trim() === "") {
      setErrorMessage("Vui lòng nhập mã giảm giá.");
      setLoadingCoupon(false);
      return;
    }
    try {
      const code = coupon.toUpperCase();
      const { cartService } = await import("../../lib/api-services");
      const cart = await cartService.applyCoupon(user.id, {
        coupon: code,
      });

      // apiClient có thể trả về warning object cho 400/404 (không throw).
      // Tránh overwrite cart về 0 trong trường hợp coupon không hợp lệ/hết lượt.
      if (cart && cart._isWarning) {
        setErrorMessage(cart.message || cart.error || "Không thể áp dụng mã giảm giá.");
        return;
      }
      // Safety: if backend didn't actually apply the code, don't show "0%" with the code
      if (!cart?.coupon || cart.coupon.toUpperCase() !== code || !(Number(cart.discount) > 0)) {
        setErrorMessage(cart?.message || "Không thể áp dụng mã giảm giá. Vui lòng thử lại.");
        return;
      }

      // Đảm bảo cart có đúng format để Redux luôn có coupon/discount => sang /checkout tự sync
      const cartData = {
        products: cart.products || cart.cartItems || [],
        cartTotal: cart.cartTotal || 0,
        coupon: cart.coupon,
        discount: cart.discount,
        totalAfterDiscount: cart.totalAfterDiscount || totalPrice,
      };
      dispatch(setCart(cartData));
      setCoupon(cartData.coupon || code);
      setErrorMessage("");
      toast.success("Áp dụng mã giảm giá thành công!");
    } catch (error) {
      console.error("Coupon error:", error);
      setErrorMessage(error.response?.data?.message || error.message || "Có lỗi khi áp mã giảm giá.");
    } finally {
      setLoadingCoupon(false);
    }
  };

  // Hàm xóa mã giảm giá
  const handleRemoveCoupon = async () => {
    if (user?.id) {
      try {
        // Chỉ dùng Server API
        const { cartService } = await import("../../lib/api-services");
        const cart = await cartService.applyCoupon(user.id, {
          coupon: "",
        });

        if (cart && cart._isWarning) {
          setErrorMessage(cart.message || cart.error || "Không thể xóa mã giảm giá.");
          return;
        }

        const cartData = {
          products: cart.products || cart.cartItems || [],
          cartTotal: cart.cartTotal || totalPrice,
          coupon: "",
          discount: 0,
          totalAfterDiscount: cart.totalAfterDiscount || totalPrice,
        };
        dispatch(setCart(cartData));
        setCoupon("");
        setErrorMessage("");
        toast.success("Đã xóa mã giảm giá.");
      } catch (error) {
        console.error(error);
        setErrorMessage("Có lỗi khi xóa mã giảm giá.");
      }
    } else {
      // Xử lý cục bộ
      dispatch(
        setCart({
          products: cartItems,
          cartTotal: totalPrice,
          coupon: "",
          discount: 0,
          totalAfterDiscount: totalPrice,
        })
      );
      setCoupon("");
      setErrorMessage("");
      toast.success("Đã xóa mã giảm giá.");
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  return (
    <div
      className="fixed top-0 left-0 w-full h-screen bg-black bg-opacity-50 z-[10000] flex items-start justify-end backdrop-blur-sm transition-all duration-300"
      onClick={toggleCart}
      style={{ height: '100vh' }}
    >
      <div
        className="w-full sm:w-[380px] bg-white h-screen flex flex-col shadow-2xl transform transition-all duration-300 ease-out animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        style={{ 
          height: '100vh',
          maxHeight: '100vh',
          minHeight: '100vh'
        }}
      >
        {/* Header với màu đơn giản */}
        <header className="flex justify-between items-center p-3 bg-green-600 text-white shadow-lg">
          <div className="flex items-center space-x-3">
            <AiOutlineShoppingCart size={24} className="text-green-200" />
            <h2 id="cart-title" className="font-bold text-xl">Giỏ hàng</h2>
            {cartItems.length > 0 && (
              <span className="bg-white text-green-600 text-xs font-bold px-2 py-1 rounded-full">
                {cartItems.length}
              </span>
            )}
          </div>
          
          <button 
            className="cursor-pointer hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50" 
            onClick={toggleCart}
            aria-label="Đóng giỏ hàng"
          >
            <AiOutlineClose size={22} />
          </button>
        </header>

        {/* Danh sách sản phẩm */}
        <div className="flex-1 p-2 overflow-auto bg-gray-50 min-h-0">
          {cartItems.length > 0 ? (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.product}
                  className="relative bg-white rounded-lg p-1.5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group"
                >
                  {/* Nút xóa với hiệu ứng đẹp */}
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-2 transition-all duration-200 opacity-0 group-hover:opacity-100"
                    onClick={() => handleRemove(item.product)}
                    title="Xóa sản phẩm"
                  >
                    <BiTrash size={16} />
                  </button>
                  
                  <div className="flex items-center">
                    {/* Hình ảnh sản phẩm với border radius đẹp */}
                    <div className="relative">
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover shadow-sm"
                        priority
                      />
                      {/* Badge số lượng */}
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {displayQty(item.quantity, item.unit)}{is100gUnit(item.unit) ? "g" : ""}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm leading-tight mb-1 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-green-600 font-bold text-lg mb-3">
                        {formatCurrency(item.price)}
                      </p>
                      
                      {/* Điều khiển số lượng với thiết kế đẹp */}
                      <div className="flex items-center space-x-2">
                        {/* Chỉ cho phép trừ 0.5kg khi đang là 1kg */}
                        {item.unit?.toLowerCase() === "kg" && Number(item.quantity) === 1 && (
                          <button
                            className="w-10 h-8 border border-gray-300 rounded-lg bg-white hover:bg-red-50 hover:border-red-300 transition-all duration-200 flex items-center justify-center text-gray-600 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 disabled:hover:text-gray-400 text-xs font-semibold"
                            onClick={() => handleDecrease(item.product, 0.5, item.unit)}
                            disabled={item.quantity <= 0.5}
                            title="Giảm 0.5kg"
                          >
                            -0.5
                          </button>
                        )}
                        <button
                          className="w-8 h-8 border border-gray-300 rounded-lg bg-white hover:bg-green-50 hover:border-green-300 transition-all duration-200 flex items-center justify-center text-gray-600 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 disabled:hover:text-gray-400"
                          onClick={() => handleDecrease(item.product, 1, item.unit)}
                          disabled={item.quantity <= 1}
                          title="Giảm số lượng"
                        >
                          <AiOutlineMinus size={14} />
                        </button>
                        <span className="w-12 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-semibold text-gray-700">
                          {displayQty(item.quantity, item.unit)}{is100gUnit(item.unit) ? "g" : (item.unit && item.unit !== "N/A" ? item.unit : "")}
                        </span>
                    
                        <button
                          className="w-8 h-8 border border-gray-300 rounded-lg bg-white hover:bg-green-50 hover:border-green-300 transition-all duration-200 flex items-center justify-center text-gray-600 hover:text-green-600"
                          onClick={() => handleIncrease(item.product, 1, item.unit)}
                          disabled={is100gUnit(item.unit) && Number(item.quantity) >= 9}
                          title={is100gUnit(item.unit) && Number(item.quantity) >= 9 ? "Tối đa 900g" : "Tăng số lượng"}
                        >
                          <AiOutlinePlus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AiOutlineShoppingCart size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg mb-2">Giỏ hàng của bạn đang trống</p>
              <p className="text-gray-400 text-sm">Hãy thêm các sản phẩm rau củ hữu cơ vào giỏ hàng nhé!</p>
            </div>
          )}
        </div>

        {/* Phần tổng tiền và mã giảm giá */}
        {cartItems.length > 0 && (
          <div className="px-4 py-2 bg-white border-t border-gray-100">
            {/* Tổng tạm tính */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 font-medium">Tổng tạm tính</span>
              <span className="text-green-600 font-bold text-lg">
                {formatCurrency(totalPrice)}
              </span>
            </div>

            {/* Mã giảm giá */}
            <div className="mb-4">
              <label className="flex text-gray-600 font-medium mb-2 items-center">
                <MdOutlineLocalOffer className="mr-2 text-orange-500" />
                Mã giảm giá
              </label>
              
              {(reduxDiscount > 0 || appliedCoupon) ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AiOutlineGift className="text-green-600" />
                      <span className="text-green-800 font-medium">{(coupon || appliedCoupon || '').toUpperCase()}</span>
                      <span className="text-green-600 text-sm">(-{reduxDiscount || 0}%)</span>
                    </div>
                    <button
                      className="text-green-600 hover:text-green-800 transition-colors"
                      onClick={handleRemoveCoupon}
                      title="Xóa mã giảm giá"
                    >
                      <AiOutlineClose size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-24 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      disabled={loadingCoupon}
                      placeholder="Nhập mã giảm giá..."
                    />
                    <button
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-500 text-white px-3 py-1.5 rounded-md hover:bg-green-600 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleApplyCoupon}
                      disabled={loadingCoupon || !coupon.trim()}
                    >
                      {loadingCoupon ? "Đang kiểm tra..." : "Áp dụng"}
                    </button>
                  </div>
                </div>
              )}
              
              {errorMessage && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  {errorMessage}
                </p>
              )}
            </div>

            {/* Hiển thị giảm giá nếu có */}
            {(reduxDiscount > 0 || appliedCoupon) && (
              <div className="flex justify-between items-center mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-red-700 font-medium">Giảm giá ({reduxDiscount || 0}%)</span>
                <span className="text-red-700 font-bold">-{formatCurrency(discountAmount)}</span>
              </div>
            )}

            {/* Phí vận chuyển */}
            <div className="flex justify-between items-center mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-blue-700 font-medium flex items-center">
               Phí vận chuyển
              </span>
              <span className="text-blue-700 font-bold">
                {totalPrice >= 500000 ? "Miễn phí" : formatCurrency(30000)}
              </span>
            </div>

            {/* Tổng thành tiền và nút thanh toán */}
            <div className="flex justify-between items-center py-2 border-t border-gray-200">
              <span className="text-gray-800 font-bold text-base">Thành tiền:</span>
              <div className="flex items-center space-x-3">
                <span className="text-green-600 font-bold text-lg">
                  {formatCurrency(totalPrice >= 500000 ? finalTotalAfterDiscount : finalTotalAfterDiscount + 30000)}
                </span>
                <Link href="/checkout">
                  <button className="bg-green-600 text-white py-2 px-4 rounded-lg font-bold hover:bg-green-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg">
                    <AiOutlineCreditCard size={18} />
                    <span>Thanh toán</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingCart;
