import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { Toaster, toast } from "react-hot-toast";
import { FiMinus, FiPlus } from "react-icons/fi";
import Navbar from "../../components/header/Navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import axios from "axios";
import { userService, cartService, checkoutService, paymentService, couponService } from "../../lib/api-services";
import {
  setCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
} from "../../store/cartSlice";
import { AiOutlineClose } from "react-icons/ai";
import EditAddressPopup from "../../components/fontend/common/EditAddressPopup";
import SelectAddressPopup from "../../components/fontend/common/SelectAddressPopup";
import { io } from "socket.io-client";

export default function Cart() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { data: session } = useSession();
  const {
    cartItems,
    coupon: appliedCoupon,
    discount: reduxDiscount,
    totalAfterDiscount,
  } = useSelector((state) => state.cart);

  // Thêm sản phẩm test nếu giỏ hàng trống (để test)
  useEffect(() => {
    if (cartItems.length === 0 && process.env.NODE_ENV === 'development') {
      console.log("=== DEVELOPMENT MODE: Adding test product ===");
      // Có thể thêm logic để thêm sản phẩm test ở đây nếu cần
    }
  }, [cartItems.length]);

  // --- Payment state ---
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [paymentCode, setPaymentCode] = useState("");      // QR động Sepay/MoMo
  const [isPaid, setIsPaid] = useState(false);             // Trạng thái thanh toán
  const [loadingPayment, setLoadingPayment] = useState(false); // Loading khi tạo thanh toán
  const [qrUrl, setQrUrl] = useState("");                  // QR Sepay/MoMo hoặc BankTransfer
  const [payUrl, setPayUrl] = useState("");                // URL thanh toán MoMo
  const [showQR, setShowQR] = useState(false);             // QR BankTransfer
  const [qrBankInfo, setQrBankInfo] = useState(null);      // Thông tin ngân hàng từ QR

  // Debug useEffect để kiểm tra component mount
  useEffect(() => {
    console.log("=== COMPONENT MOUNTED ===");
    console.log("Session:", !!session?.user?.id);
    console.log("Cart Items:", cartItems.length);
    console.log("Payment Method:", paymentMethod);
  }, []);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );



  // State cho mã giảm giá
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  // State xác nhận xóa sản phẩm hoặc địa chỉ
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [confirmDeleteAddress, setConfirmDeleteAddress] = useState(null);

  // State thông tin người dùng và địa chỉ
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [deliveryTime, setDeliveryTime] = useState(""); // Thời gian giao hàng
  const [deliveryTimeType, setDeliveryTimeType] = useState(""); // 'business_hours' hoặc 'after_hours'

  // Tính discount amount từ discount state hoặc reduxDiscount
  // Ưu tiên local state (discount) nếu có, nếu không thì dùng Redux (reduxDiscount)
  const activeDiscount = discount > 0 ? discount : (reduxDiscount || 0);
  
  // Tính lại discount amount và totalAfterDiscount dựa trên totalPrice hiện tại
  // Đảm bảo luôn đồng bộ với giỏ hàng hiện tại
  const discountAmount = (totalPrice * activeDiscount) / 100;
  
  // Tính totalAfterDiscount: nếu có discount thì tính lại, nếu không thì dùng từ Redux hoặc totalPrice
  const calculatedTotalAfterDiscount = activeDiscount > 0 
    ? totalPrice - discountAmount 
    : (totalAfterDiscount || totalPrice);
  
  const finalTotalAfterDiscount = calculatedTotalAfterDiscount;
  const shippingFee = 0; // Tạm bỏ phí vận chuyển
  const finalTotal = finalTotalAfterDiscount + shippingFee;

  // Thông tin chuyển khoản
  const bankTransferInfo = {
    bankId: "TPB",
    bankName: "Ngân hàng Tiên Phong",
    bankAccount: "0392 4302 701",
    accountName: "NGO QUANG TRUONG",
  };

  // Hàm chuyển đổi tiếng Việt có dấu thành không dấu
  const removeVietnameseTones = (str) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^\w\s]/g, "")
      .trim();
  };

  // Hàm format số tài khoản với dấu cách để dễ đọc
  const formatAccountNumber = (accountNumber) => {
    if (!accountNumber) return "";
    // Loại bỏ tất cả dấu cách và ký tự không phải số
    const cleanNumber = accountNumber.replace(/\D/g, "");
    // Thêm dấu cách mỗi 4 số
    return cleanNumber.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  // State popup chỉnh sửa/ thêm địa chỉ
  const [showEditAddressPopup, setShowEditAddressPopup] = useState(false);

  // State cho auto-checkout
  const [autoCheckoutLoading, setAutoCheckoutLoading] = useState(false);
  const [checkoutCompleted, setCheckoutCompleted] = useState(false);

  const [editAddressData, setEditAddressData] = useState({
    _id: "",
    fullName: "",
    phoneNumber: "",
    city: "",
    cityName: "",
    district: "",
    districtName: "",
    ward: "",
    wardName: "",
    address1: "",
    type: "home",
    isDefault: false,
  });

  // Lấy thông tin người dùng (bao gồm địa chỉ)
  useEffect(() => {
    async function fetchUserInfo() {
      if (session?.user?.id) {
        try {
          // Thử dùng API server mới trước
          try {
            const { user } = await userService.getById(session.user.id);
            setName(user.name || "");
            setPhone(user.phone || user.address?.[0]?.phoneNumber || "");
            if (user.address && user.address.length > 0) {
              setAddresses(user.address);
              const defaultAddr =
                user.address.find((addr) => addr.isDefault) ||
                user.address[0];
              setSelectedAddress(defaultAddr);
            }
          } catch (apiError) {
            // Fallback về Next.js API
            const res = await axios.get(`/api/user/${session.user.id}`);
            const userData = res.data;
            setName(userData.name || "");
            setPhone(userData.phone || userData.address?.[0]?.phoneNumber || "");
            if (userData.address && userData.address.length > 0) {
              setAddresses(userData.address);
              const defaultAddr =
                userData.address.find((addr) => addr.isDefault) ||
                userData.address[0];
              setSelectedAddress(defaultAddr);
            }
          }
        } catch (error) {
          console.error("Error fetching user info:", error);
          toast.error("Không thể tải thông tin người dùng.");
        }
      }
    }
    fetchUserInfo();
  }, [session]);

  // Đồng bộ mã giảm giá từ Redux (chỉ khi Redux có coupon và local state chưa có)
  useEffect(() => {
    // Chỉ sync từ Redux nếu:
    // 1. Có session và có coupon trong Redux
    // 2. Local state chưa có coupon hoặc discount = 0
    if (session?.user?.id && appliedCoupon && appliedCoupon.trim() !== '') {
      // Chỉ update nếu local state khác với Redux
      if (coupon !== appliedCoupon || discount !== reduxDiscount) {
        console.log("🔄 Syncing coupon from Redux:", appliedCoupon, "discount:", reduxDiscount);
        setCoupon(appliedCoupon);
        setDiscount(reduxDiscount || 0);
      }
    } else if (!appliedCoupon || appliedCoupon.trim() === '') {
      // Chỉ reset nếu Redux không có coupon VÀ local có coupon/discount
      // Không reset khi đang loading để tránh mất dữ liệu khi user đang nhập
      if ((coupon !== '' || discount !== 0) && !loadingCoupon) {
        console.log("🔄 Clearing coupon (no coupon in Redux)");
        setCoupon("");
        setDiscount(0);
      }
    }
  }, [session?.user?.id, appliedCoupon, reduxDiscount, loadingCoupon]);

  // Các hàm xử lý giỏ hàng
  const handleIncreaseQuantity = async (item) => {
    if (session?.user?.id) {
      try {
        // Chỉ dùng Server API
        const currentCart = await cartService.get(session.user.id);
        const productInCart = currentCart.products?.find(p => p.product.toString() === item.product);
        const newQuantity = (productInCart?.quantity || 0) + 1;
        const cart = await cartService.update(session.user.id, item.product, newQuantity);
        
        // Nếu có coupon, tính lại totalAfterDiscount
        if (cart.coupon && cart.discount > 0) {
          const newTotalPrice = (cart.products || []).reduce(
            (sum, p) => sum + (p.price || 0) * (p.quantity || 0),
            0
          );
          const newDiscountAmount = (newTotalPrice * cart.discount) / 100;
          const newTotalAfterDiscount = newTotalPrice - newDiscountAmount;
          
          // Cập nhật lại cart với totalAfterDiscount mới
          const updatedCart = await cartService.applyCoupon(session.user.id, {
            coupon: cart.coupon,
            discount: cart.discount,
            totalAfterDiscount: newTotalAfterDiscount,
          });
          dispatch(setCart(updatedCart));
        } else {
          dispatch(setCart(cart));
        }
      } catch (error) {
        console.error(error);
        toast.error("Có lỗi khi tăng số lượng.");
      }
    } else {
      dispatch(increaseQuantity(item.product));
      // Nếu có coupon local, giữ nguyên discount
      if (coupon && discount > 0) {
        // Discount sẽ được tính lại tự động qua finalTotalAfterDiscount
      }
    }
  };

  const handleDecreaseQuantity = async (item) => {
    if (item.quantity === 1) {
      setConfirmDeleteItem(item.product);
    } else {
      if (session?.user?.id) {
        try {
          // Chỉ dùng Server API
          const currentCart = await cartService.get(session.user.id);
          const productInCart = currentCart.products?.find(p => p.product.toString() === item.product);
          const newQuantity = Math.max(0, (productInCart?.quantity || 0) - 1);
          const cart = await cartService.update(session.user.id, item.product, newQuantity);
          
          // Nếu có coupon, tính lại totalAfterDiscount
          if (cart.coupon && cart.discount > 0) {
            const newTotalPrice = (cart.products || []).reduce(
              (sum, p) => sum + (p.price || 0) * (p.quantity || 0),
              0
            );
            const newDiscountAmount = (newTotalPrice * cart.discount) / 100;
            const newTotalAfterDiscount = newTotalPrice - newDiscountAmount;
            
            // Cập nhật lại cart với totalAfterDiscount mới
            const updatedCart = await cartService.applyCoupon(session.user.id, {
              coupon: cart.coupon,
              discount: cart.discount,
              totalAfterDiscount: newTotalAfterDiscount,
            });
            dispatch(setCart(updatedCart));
          } else {
            dispatch(setCart(cart));
          }
        } catch (error) {
          console.error(error);
          toast.error("Có lỗi khi giảm số lượng.");
        }
      } else {
        dispatch(decreaseQuantity(item.product));
        // Nếu có coupon local, giữ nguyên discount
        if (coupon && discount > 0) {
          // Discount sẽ được tính lại tự động qua finalTotalAfterDiscount
        }
      }
    }
  };

  const handleRemoveItem = async (item) => {
    if (session?.user?.id) {
      try {
        // Chỉ dùng Server API
        await cartService.remove(session.user.id, item.product);
        const updatedCart = await cartService.get(session.user.id);
        
        // Nếu có coupon, tính lại totalAfterDiscount
        if (updatedCart.coupon && updatedCart.discount > 0) {
          const newTotalPrice = (updatedCart.products || []).reduce(
            (sum, p) => sum + (p.price || 0) * (p.quantity || 0),
            0
          );
          const newDiscountAmount = (newTotalPrice * updatedCart.discount) / 100;
          const newTotalAfterDiscount = newTotalPrice - newDiscountAmount;
          
          // Cập nhật lại cart với totalAfterDiscount mới
          const finalCart = await cartService.applyCoupon(session.user.id, {
            coupon: updatedCart.coupon,
            discount: updatedCart.discount,
            totalAfterDiscount: newTotalAfterDiscount,
          });
          dispatch(setCart(finalCart));
        } else {
          dispatch(setCart(updatedCart));
        }
        
        toast.success(`Đã xóa "${item.title}" khỏi giỏ hàng!`);
      } catch (error) {
        console.error(error);
        toast.error("Có lỗi khi xóa sản phẩm.");
      }
    } else {
      dispatch(removeFromCart(item.product));
      // Nếu có coupon local, giữ nguyên discount
      if (coupon && discount > 0) {
        // Discount sẽ được tính lại tự động qua finalTotalAfterDiscount
      }
    }
  };

  // Xử lý mã giảm giá
  const handleApplyCoupon = async () => {
    setLoadingCoupon(true);
    if (!session?.user?.id) {
      toast.error("Vui lòng đăng nhập để áp dụng mã giảm giá.");
      setLoadingCoupon(false);
      return;
    }
    if (!coupon || coupon.trim() === "") {
      setDiscount(0);
      setErrorMessage("Vui lòng nhập mã giảm giá.");
      setLoadingCoupon(false);
      return;
    }
    try {
      // Chỉ dùng Server API
      const couponResponse = await couponService.validate(coupon.toUpperCase());
      console.log("Coupon Response:", couponResponse);
      
      // Xử lý response format
      let couponData = null;
      if (Array.isArray(couponResponse)) {
        couponData = couponResponse.length > 0 ? couponResponse[0] : null;
      } else if (couponResponse && typeof couponResponse === 'object') {
        // Có thể là { coupon: {...} } hoặc object trực tiếp
        couponData = couponResponse.coupon || couponResponse;
      }
      
      if (!couponData || !couponData.discount) {
        setDiscount(0);
        setErrorMessage("Mã giảm giá không hợp lệ.");
        setLoadingCoupon(false);
        return;
      }
      const currentDate = new Date();
      const start = new Date(couponData.startDate);
      const end = new Date(couponData.endDate);
      if (currentDate < start || currentDate > end) {
        setDiscount(0);
        setErrorMessage("Mã giảm giá đã hết hạn hoặc chưa có hiệu lực.");
        setLoadingCoupon(false);
        return;
      }
      const discountValue = couponData.discount;
      
      // Tính lại totalPrice để đảm bảo tính toán chính xác
      const currentTotalPrice = cartItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
        0
      );
      
      const discountAmt = (currentTotalPrice * discountValue) / 100;
      const newTotalAfterDiscount = currentTotalPrice - discountAmt;
      
      console.log("💰 Applying coupon:", {
        coupon: coupon.toUpperCase(),
        discountValue,
        currentTotalPrice,
        discountAmt,
        newTotalAfterDiscount
      });
      
      // Chỉ dùng Server API
      const cart = await cartService.applyCoupon(session.user.id, {
        coupon: coupon.toUpperCase(),
        discount: discountValue,
        totalAfterDiscount: newTotalAfterDiscount,
      });
      
      // Đảm bảo cart có đầy đủ thông tin coupon và discount
      const cartData = {
        products: cart.products || cart.cartItems || cartItems,
        cartTotal: cart.cartTotal || currentTotalPrice,
        coupon: cart.coupon || coupon.toUpperCase(),
        discount: cart.discount || discountValue,
        totalAfterDiscount: cart.totalAfterDiscount || newTotalAfterDiscount,
      };
      
      console.log("✅ Cart data after apply coupon:", cartData);
      dispatch(setCart(cartData));
      setDiscount(discountValue);
      setCoupon(coupon.toUpperCase()); // Đảm bảo local state cũng được cập nhật
      setErrorMessage("");
      toast.success("Áp dụng mã giảm giá thành công!");
    } catch (error) {
      console.error("Coupon error:", error);
      setDiscount(0);
      setErrorMessage(error.message || "Có lỗi khi áp mã giảm giá.");
    } finally {
      setLoadingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    // Tính lại totalPrice để đảm bảo tính toán chính xác
    const currentTotalPrice = cartItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );
    
    if (session?.user?.id) {
      try {
        // Chỉ dùng Server API
        const cart = await cartService.applyCoupon(session.user.id, {
          coupon: "",
          discount: 0,
          totalAfterDiscount: currentTotalPrice,
        });
        
        // Đảm bảo cart có đầy đủ thông tin
        const cartData = {
          products: cart.products || cart.cartItems || cartItems,
          cartTotal: cart.cartTotal || currentTotalPrice,
          coupon: "",
          discount: 0,
          totalAfterDiscount: cart.totalAfterDiscount || currentTotalPrice,
        };
        
        dispatch(setCart(cartData));
        setCoupon("");
        setDiscount(0);
        setErrorMessage("");
        toast.success("Đã xóa mã giảm giá!");
      } catch (error) {
        console.error(error);
        setErrorMessage("Có lỗi khi xóa mã giảm giá.");
      }
    } else {
      dispatch(
        setCart({
          products: cartItems,
          cartTotal: currentTotalPrice,
          coupon: "",
          discount: 0,
          totalAfterDiscount: currentTotalPrice,
        })
      );
      setCoupon("");
      setDiscount(0);
      setErrorMessage("");
      toast.success("Đã xóa mã giảm giá!");
    }
  };

  // Tạo thanh toán (Sepay/MoMo)
  const handleCreatePayment = async () => {
    if (!session?.user?.id) {
      toast.error("Vui lòng đăng nhập để sử dụng thanh toán online");
      setPaymentMethod("COD");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Giỏ hàng trống, không thể tạo thanh toán");
      setPaymentMethod("COD");
      return;
    }

    setLoadingPayment(true);
    try {
      let res;
      if (paymentMethod === "Sepay") {
        // Tạo nội dung chuyển khoản: "Thanh toan" + Tên khách hàng + Ngày đặt
        const customerName = name || session?.user?.name || "Khach hang";
        const orderDate = new Date().toLocaleDateString('vi-VN'); // Format: dd/mm/yyyy
        const transferContent = `Thanh toan ${customerName} ${orderDate}`;
        
        // Chỉ dùng Server API
        res = await paymentService.createSepay(finalTotal, transferContent);
      } else if (paymentMethod === "MoMo") {
        // Chỉ dùng Server API
        res = await paymentService.createMomo(finalTotal, `Thanh toan don hang - ${Date.now()}`);
      }

      if (res.success) {
        setPaymentCode(res.paymentCode);
        setQrUrl(res.qrUrl || res.qrCodeUrl);
        setPayUrl(res.payUrl);

        // Lưu thông tin ngân hàng từ API (cho Sepay)
        if (paymentMethod === "Sepay" && res.bankInfo) {
          setQrBankInfo(res.bankInfo);
          console.log("=== BANK INFO FROM API ===");
          console.log("Bank ID:", res.bankInfo.bankId);
          console.log("Account:", res.bankInfo.accountNumber);
          console.log("Name:", res.bankInfo.accountName);
        }

        // Test QR accessibility và sử dụng backup nếu cần
        if (paymentMethod === "Sepay" && res.qrUrl) {
          try {
            const qrTest = await axios.get(res.qrUrl, {
              timeout: 5000,
              validateStatus: () => true
            });

            if (qrTest.status !== 200) {
              console.log("⚠️ Primary QR not accessible, trying backup...");
              if (res.backupQrUrl) {
                const backupTest = await axios.get(res.backupQrUrl, {
                  timeout: 5000,
                  validateStatus: () => true
                });

                if (backupTest.status === 200) {
                  console.log("✅ Using backup QR URL");
                  setQrUrl(res.backupQrUrl);
                } else {
                  console.log("❌ Both QR URLs failed");
                }
              }
            } else {
              console.log("✅ Primary QR accessible");
            }
          } catch (error) {
            console.log("⚠️ QR accessibility test failed:", error.message);
          }
        }

        setIsPaid(false);
        toast.success(`Đã tạo thanh toán ${paymentMethod}!`);
      } else {
        throw new Error(res.error || "Không thể tạo thanh toán");
      }
    } catch (err) {
      console.error("Payment creation error:", err);
      const errorMessage =
        err.response?.data?.error ||
        (err.message.includes("network")
          ? "Lỗi kết nối mạng, vui lòng thử lại."
          : `Không tạo được phiếu thanh toán ${paymentMethod}!`);
      toast.error(errorMessage);
      setPaymentMethod("COD");
      setPaymentCode("");
      setQrUrl("");
      setPayUrl("");
    } finally {
      setLoadingPayment(false);
    }
  };

  // Refresh QR code cho Sepay
  const handleRefreshQR = async () => {
    if (!paymentCode) {
      toast.error("Không có mã thanh toán để làm mới");
      return;
    }

    setLoadingPayment(true);
    try {
      // Chỉ dùng Server API
      const res = await paymentService.refreshSepayQR(paymentCode);

      if (res.success) {
        setQrUrl(res.qrUrl);
        toast.success("✅ Mã QR đã được làm mới!");
      } else {
        throw new Error(res.error || "Không thể làm mới mã QR");
      }
    } catch (err) {
      console.error("QR refresh error:", err);
      const errorMessage =
        err.response?.data?.error || "Không thể làm mới mã QR!";
      toast.error(errorMessage);
    } finally {
      setLoadingPayment(false);
    }
  };

  // Manually confirm Sepay payment
  // LƯU Ý: Chỉ cho phép xác nhận khi đã có webhook từ Sepay (bằng chứng đã chuyển khoản)
  const handleConfirmPayment = async () => {
    if (!paymentCode) {
      toast.error("Không có mã thanh toán");
      return;
    }

    if (!window.confirm("Bạn đã chuyển khoản thành công? Hệ thống sẽ kiểm tra và xác nhận thanh toán.")) {
      return;
    }

    setLoadingPayment(true);
    try {
      const res = await paymentService.confirmSepayPayment(paymentCode, finalTotal);

      if (res.success) {
        setIsPaid(true);
        toast.success(`✅ Thanh toán đã được xác nhận! Số tiền: ${formatCurrency(res.payment?.amount || finalTotal)}`);
        
        setTimeout(() => {
          const checkoutButton = document.querySelector(
            'button[data-testid="checkout-button"]'
          ) || document.querySelector(
            'button[type="submit"]'
          ) || document.querySelector(
            'button:not([disabled])'
          );

          if (checkoutButton) {
            checkoutButton.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 1000);
      } else {
        throw new Error(res.error || "Không thể xác nhận thanh toán");
      }
    } catch (err) {
      console.error("Confirm payment error:", err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Không thể xác nhận thanh toán!";
      const suggestion = err.response?.data?.suggestion || "";
      
      // Hiển thị thông báo lỗi chi tiết hơn
      if (errorMessage.includes("chưa nhận được xác nhận từ ngân hàng")) {
        toast.error(
          <div>
            <div className="font-semibold">{errorMessage}</div>
            {suggestion && <div className="text-sm mt-1">{suggestion}</div>}
          </div>,
          { duration: 5000 }
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoadingPayment(false);
    }
  };

  // Sepay: Lắng nghe xác nhận thanh toán
  useEffect(() => {
    if (!paymentCode) return;

    console.log("=== SETTING UP PAYMENT MONITORING ===");
    console.log("Payment Code:", paymentCode);
    console.log("Final Total:", finalTotal);

    let socket = null;
    
    // Thiết lập WebSocket - Kết nối đến Server API với error handling
    try {
      const socketUrl = process.env.NEXT_PUBLIC_API_SERVER_URL?.replace('/api', '') || 'https://ecobacgiang.vn';
      
      // Cấu hình Socket.IO với options để tránh lỗi unhandled
      socket = io(socketUrl, { 
        path: "/api/socket",
        transports: ['websocket', 'polling'], // Cho phép fallback giữa websocket và polling
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        timeout: 5000,
        autoConnect: true,
        // Tắt việc throw error để tránh unhandled runtime error
        forceNew: false
      });

      socket.on("connect", () => {
        console.log("✅ WebSocket connected, joining payment room:", paymentCode);
        socket.emit("join_payment", paymentCode);
      });

      socket.on("payment_paid", (data) => {
        console.log("🎉 WebSocket payment_paid event received:", data);
        if (data.paymentCode === paymentCode) {
          console.log("✅ Payment confirmed via WebSocket!");
          setIsPaid(true);
          toast.success(
            `✅ Thanh toán thành công! Số tiền: ${formatCurrency(
              data.amount || finalTotal
            )}`
          );

          setTimeout(() => {
            // Tìm button checkout bằng nhiều cách
            const checkoutButton = document.querySelector(
              'button[data-testid="checkout-button"]'
            ) || document.querySelector(
              'button[type="submit"]'
            ) || document.querySelector(
              'button:not([disabled])'
            );

            if (checkoutButton) {
              console.log("📍 Scrolling to checkout button");
              checkoutButton.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 1000);
        }
      });

      // Xử lý lỗi kết nối - bao gồm cả xhr poll error
      socket.on("connect_error", (error) => {
        // Xử lý lỗi một cách graceful, không throw unhandled error
        console.warn("⚠️ WebSocket connection error (will use polling instead):", error.message || error);
        console.log("🔄 Falling back to polling mechanism...");
        // Không throw error, chỉ log và tiếp tục với polling
      });

      // Xử lý lỗi khi reconnect thất bại
      socket.on("reconnect_error", (error) => {
        console.warn("⚠️ WebSocket reconnection error (will use polling instead):", error.message || error);
      });

      // Xử lý lỗi khi reconnect attempt thất bại
      socket.on("reconnect_failed", () => {
        console.warn("⚠️ WebSocket reconnection failed. Using polling mechanism only.");
      });

      socket.on("disconnect", (reason) => {
        console.log("🔌 WebSocket disconnected:", reason);
        // Nếu disconnect do lỗi, không throw error
        if (reason === "io server disconnect" || reason === "transport close") {
          console.log("🔄 Server disconnected. Will continue with polling.");
        }
      });

      // Xử lý lỗi chung để tránh unhandled runtime error
      socket.on("error", (error) => {
        console.warn("⚠️ Socket.IO error (non-critical, will use polling):", error);
        // Không throw error, chỉ log
      });
    } catch (error) {
      // Bắt mọi lỗi khi khởi tạo Socket.IO để tránh unhandled runtime error
      console.warn("⚠️ Failed to initialize WebSocket (will use polling only):", error.message || error);
      socket = null; // Đảm bảo socket là null nếu có lỗi
    }

    let pollingInterval = 3000; // Giảm từ 5s xuống 3s để phản hồi nhanh hơn
    let pollCount = 0;
    const maxPolls = 120; // 120 * 3s = 6 phút

    const checkPaymentStatus = async () => {
      try {
        pollCount++;
        console.log(`🔄 Polling attempt ${pollCount}/${maxPolls} for payment: ${paymentCode}`);

        // Chỉ dùng Server API
        const res = await paymentService.checkSepayStatus(paymentCode);
        console.log(`📊 Payment Status: ${res.payment?.status}`);

        if (res.success) {
          const payment = res.payment;
          if (payment && payment.status === "paid") {
            console.log("✅ Payment confirmed via polling!");
            setIsPaid(true);
            toast.success(
              `✅ Thanh toán thành công! Số tiền: ${formatCurrency(
                payment.amount
              )}`
            );
            setTimeout(() => {
              // Tìm button checkout bằng nhiều cách
              const checkoutButton = document.querySelector(
                'button[data-testid="checkout-button"]'
              ) || document.querySelector(
                'button[type="submit"]'
              ) || document.querySelector(
                'button:not([disabled])'
              );

              if (checkoutButton) {
                console.log("📍 Scrolling to checkout button");
                checkoutButton.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }
            }, 1000);
            clearInterval(interval);
          } else if (payment && payment.status === "expired") {
            console.log("⏰ Payment expired");
            toast.error("Mã QR đã hết hạn, vui lòng tạo lại");
            setPaymentCode("");
            setQrUrl("");
            clearInterval(interval);
          } else if (payment && payment.status === "failed") {
            console.log("❌ Payment failed");
            toast.error("Thanh toán thất bại, vui lòng thử lại");
            setPaymentCode("");
            setQrUrl("");
            clearInterval(interval);
          } else if (pollCount >= maxPolls) {
            console.log("⏰ Polling timeout reached");
            toast.error("Đã quá thời gian chờ thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ.");
            clearInterval(interval);
          } else {
            console.log(`⏳ Payment still ${payment?.status || 'unknown'}, continuing to poll...`);
          }
        } else {
          console.error("❌ API returned error:", res.data);
        }
      } catch (error) {
        console.error("❌ Payment status check error:", error);
        console.error("Error details:", error.response?.data || error.message);
        pollingInterval = Math.min(pollingInterval * 1.5, 10000); // Tăng interval khi có lỗi
      }
    };

    // Bắt đầu polling ngay lập tức
    console.log("🚀 Starting initial payment check...");
    checkPaymentStatus();

    // Sau đó poll định kỳ
    const interval = setInterval(checkPaymentStatus, pollingInterval);

    return () => {
      console.log("🧹 Cleaning up payment monitoring...");
      // Chỉ cleanup socket nếu nó tồn tại
      if (socket) {
        try {
          socket.off("payment_paid");
          socket.off("connect_error");
          socket.off("reconnect_error");
          socket.off("reconnect_failed");
          socket.off("error");
          socket.off("connect");
          socket.off("disconnect");
          socket.disconnect();
        } catch (error) {
          console.warn("⚠️ Error cleaning up socket:", error);
        }
      }
      clearInterval(interval);
    };
  }, [paymentCode, finalTotal]);

  // Xử lý khi thay đổi phương thức thanh toán
  useEffect(() => {
    if (paymentMethod === "Sepay" || paymentMethod === "MoMo") {
      if (session?.user?.id && cartItems.length > 0) {
        handleCreatePayment();
      } else {
        if (!session?.user?.id) {
          toast.error("Vui lòng đăng nhập để sử dụng thanh toán online");
          setPaymentMethod("COD");
        } else if (cartItems.length === 0) {
          toast.error("Giỏ hàng trống, không thể tạo thanh toán");
          setPaymentMethod("COD");
        }
      }
    } else {
      setPaymentCode("");
      setQrUrl("");
      setPayUrl("");
      setIsPaid(false);
    }
  }, [paymentMethod, session?.user?.id, cartItems.length]);

  // Ref để theo dõi tổng tiền trước đó
  const prevFinalTotalRef = useRef(finalTotal);

  // Tự động cập nhật QR code khi tổng tiền thay đổi
  useEffect(() => {
    const prevTotal = prevFinalTotalRef.current;
    prevFinalTotalRef.current = finalTotal;

    // Chỉ tạo lại payment nếu tổng tiền thực sự thay đổi và đã có paymentCode
    if (paymentMethod === "Sepay" || paymentMethod === "MoMo") {
      if (session?.user?.id && cartItems.length > 0 && finalTotal > 0) {
        if (paymentCode && !loadingPayment && prevTotal !== finalTotal && prevTotal > 0) {
          console.log("=== TOTAL CHANGED - AUTO REFRESHING QR CODE ===");
          console.log("Old total:", prevTotal);
          console.log("New total:", finalTotal);

          // Hiển thị thông báo cho người dùng
          toast("🔄 Đang cập nhật mã QR với số tiền mới...");

          // Reset trạng thái để tạo lại
          setIsPaid(false);
          handleCreatePayment();
        }
      }
    }
  }, [finalTotal, paymentMethod, session?.user?.id, cartItems.length, paymentCode, loadingPayment]);

  // Auto checkout khi thanh toán thành công
  useEffect(() => {
    const autoCheckout = async () => {
      if (isPaid && !checkoutCompleted && !autoCheckoutLoading && (paymentMethod === "Sepay" || paymentMethod === "MoMo")) {
        console.log("=== AUTO CHECKOUT STARTED ===");

        // Kiểm tra điều kiện cơ bản
        if (!session) {
          console.log("No session, skipping auto checkout");
          return;
        }

        if (!name || !phone || (!selectedAddress && !address)) {
          console.log("Missing required info, skipping auto checkout");
          toast.error("Thiếu thông tin giao hàng. Vui lòng điền đầy đủ thông tin!");
          return;
        }

        setAutoCheckoutLoading(true);

        try {
          const orderData = {
            user: session ? session.user.id : null,
            orderItems: cartItems,
            shippingAddress: selectedAddress
              ? {
                address: `${selectedAddress.address1}, ${selectedAddress.wardName}, ${selectedAddress.districtName}, ${selectedAddress.cityName}`,
              }
              : { address },
            phone,
            name,
            note,
            deliveryTime,
            coupon,
            discount,
            totalPrice,
            totalAfterDiscount: finalTotalAfterDiscount,
            finalTotal,
            shippingFee,
            paymentMethod,
            paymentCode: paymentMethod === "Sepay" || paymentMethod === "MoMo" ? paymentCode : undefined,
          };

          console.log("Submitting auto checkout with data:", orderData);
          // Chỉ dùng Server API
          await checkoutService.create(orderData);

          toast.success("🎉 Đặt hàng thành công! Đơn hàng của bạn đã được xử lý tự động.");
          setCheckoutCompleted(true);

          // Server API tự động clear cart sau khi checkout thành công
          // Không cần gọi API clear cart riêng

          dispatch(
            setCart({
              products: [],
              cartTotal: 0,
              coupon: "",
              discount: 0,
              totalAfterDiscount: 0,
            })
          );

        } catch (error) {
          console.error("Auto checkout error:", error);
          toast.error("Có lỗi khi tự động đặt hàng. Vui lòng thử lại!");
        } finally {
          setAutoCheckoutLoading(false);
        }
      }
    };

    autoCheckout();
  }, [isPaid, checkoutCompleted, autoCheckoutLoading, paymentMethod, session, name, phone, selectedAddress, address, cartItems, note, coupon, discount, totalPrice, finalTotalAfterDiscount, finalTotal, shippingFee, paymentCode]);

  // --- Đặt hàng: chỉ cho Sepay nếu đã isPaid === true ---
  const handleCheckout = async () => {
    if (!session) {
      toast.error("Hãy đăng nhập để tiếp tục");
      router.push(`/dang-nhap?callbackUrl=${encodeURIComponent("/checkout")}`);
      return;
    }
    if (!name || !phone || (!selectedAddress && !address)) {
      toast.error(
        "Vui lòng đảm bảo có đầy đủ Họ tên, Số điện thoại và Địa chỉ!"
      );
      return;
    }
    if (paymentMethod === "Sepay" && !isPaid) {
      toast.error("Bạn cần thanh toán Sepay trước khi đặt hàng!");
      return;
    }
    const orderData = {
      user: session ? session.user.id : null,
      orderItems: cartItems,
      shippingAddress: selectedAddress
        ? {
          address: `${selectedAddress.address1}, ${selectedAddress.wardName}, ${selectedAddress.districtName}, ${selectedAddress.cityName}`,
        }
        : { address },
      phone,
      name,
      note,
      deliveryTime,
      coupon,
      discount,
      totalPrice,
      totalAfterDiscount: finalTotalAfterDiscount,
      finalTotal,
      shippingFee,
      paymentMethod,
      paymentCode: paymentMethod === "Sepay" ? paymentCode : undefined,
    };
    try {
      // Chỉ dùng Server API
      await checkoutService.create(orderData);
      toast.success("Đặt hàng thành công!");
      // Server API tự động clear cart sau khi checkout thành công
      // Không cần gọi API clear cart riêng
      dispatch(
        setCart({
          products: [],
          cartTotal: 0,
          coupon: "",
          discount: 0,
          totalAfterDiscount: 0,
        })
      );
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi khi đặt hàng.");
    }
  };

  // Popup chọn địa chỉ
  const handleChangeAddress = () => {
    setShowAddressPopup(true);
  };
  const handleClosePopup = () => {
    setShowAddressPopup(false);
  };
  const handleConfirmAddress = () => {
    setShowAddressPopup(false);
  };

  // Popup chỉnh sửa/ thêm địa chỉ
  const handleOpenEditAddress = async (addr) => {
    if (addr) {
      setEditAddressData({
        _id: addr._id,
        fullName: addr.fullName,
        phoneNumber: addr.phoneNumber,
        city: addr.city,
        cityName: addr.cityName,
        district: addr.district,
        districtName: addr.districtName,
        ward: addr.ward,
        wardName: addr.wardName,
        address1: addr.address1,
        type: addr.type,
        isDefault: addr.isDefault,
      });
    } else {
      setEditAddressData({
        fullName: "",
        phoneNumber: "",
        city: "",
        cityName: "",
        district: "",
        districtName: "",
        ward: "",
        wardName: "",
        address1: "",
        type: "home",
        isDefault: false,
      });
    }
    setShowEditAddressPopup(true);
  };
  const handleCloseEditAddress = () => {
    setShowEditAddressPopup(false);
  };
  const handleSaveAddress = async () => {
    try {
      toast.success("Lưu địa chỉ thành công!");
      setShowEditAddressPopup(false);
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi khi lưu địa chỉ.");
    }
  };

  // --- CHỨC NĂNG XÓA ĐỊA CHỈ ---
  const handleDeleteAddress = (addressId) => {
    setConfirmDeleteAddress(addressId);
  };

  const confirmDeleteAddressHandler = async () => {
    if (session?.user?.id) {
      try {
        const res = await axios.delete(
          `/api/address?userId=${session.user.id}&addressId=${confirmDeleteAddress}`
        );
        setAddresses(res.data.addresses);
        if (selectedAddress && selectedAddress._id === confirmDeleteAddress) {
          setSelectedAddress(null);
        }
        toast.success("Đã xóa địa chỉ!");
      } catch (error) {
        console.error(error);
        toast.error("Có lỗi khi xóa địa chỉ.");
      }
    } else {
      const newAddresses = addresses.filter(
        (addr) => addr._id !== confirmDeleteAddress
      );
      setAddresses(newAddresses);
      if (selectedAddress && selectedAddress._id === confirmDeleteAddress) {
        setSelectedAddress(newAddresses[0] || null);
      }
      toast.success("Đã xóa địa chỉ!");
    }
    setConfirmDeleteAddress(null);
  };

  const cancelDeleteAddressHandler = () => {
    setConfirmDeleteAddress(null);
  };

  // Xóa sản phẩm
  const confirmDeleteItemHandler = async () => {
    if (session?.user?.id) {
      try {
        // Chỉ dùng Server API
        await cartService.remove(session.user.id, confirmDeleteItem);
        const updatedCart = await cartService.get(session.user.id);
        dispatch(setCart(updatedCart));
        toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
      } catch (error) {
        console.error(error);
        toast.error("Có lỗi khi xóa sản phẩm.");
      }
    } else {
      dispatch(removeFromCart(confirmDeleteItem));
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
    }
    setConfirmDeleteItem(null);
  };

  const cancelDeleteItemHandler = () => {
    setConfirmDeleteItem(null);
  };

  // Hàm định dạng tiền tệ
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  return (
    <>
      <Navbar />
      <Head>
        <title>Giỏ hàng</title>
        <meta name="description" content="Giỏ hàng của bạn tại Eco Bắc Giang" />
      </Head>
      <div className="h-[80px] bg-white"></div>
      <div className="p-4 bg-gray-100 min-h-screen">
        <Toaster />

        {/* Modal xác nhận xóa sản phẩm */}
        {confirmDeleteItem && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-[9999]">
            <div className="bg-white p-4 rounded-lg shadow-lg text-center w-80">
              <p className="mb-4">
                Bạn có chắc chắn muốn xóa sản phẩm này không?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                  onClick={confirmDeleteItemHandler}
                >
                  Đồng ý
                </button>
                <button
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={cancelDeleteItemHandler}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal xác nhận xóa địa chỉ */}
        {confirmDeleteAddress && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-[9999]">
            <div className="bg-white p-4 rounded-lg shadow-lg text-center w-80">
              <p className="mb-4">
                Bạn có chắc chắn?

 muốn xóa địa chỉ này không?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                  onClick={confirmDeleteAddressHandler}
                >
                  Đồng ý
                </button>
                <button
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={cancelDeleteAddressHandler}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Layout 2 cột */}
        <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cột trái: Sản phẩm */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 text-xl">🛒</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Giỏ hàng</h2>
                <span className="ml-auto bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  {cartItems.length} sản phẩm
                </span>
              </div>

              {cartItems.length > 0 ? (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow duration-200"
                      key={item.product}
                    >
                      <div className="flex items-center">
                        <div className="w-20 h-20 flex-shrink-0 relative bg-white rounded-lg overflow-hidden shadow-sm">
                          <Image
                            src={item.image}
                            alt={item.title}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 text-lg mb-1 truncate">
                            {item.title}
                          </h3>
                          {item.unit && (
                            <p className="text-gray-500 text-sm mb-2">
                              Đơn vị tính:{" "}
                              <span className="font-medium text-gray-700">
                                {item.unit}
                              </span>
                            </p>
                          )}
                          <div className="text-green-600 font-bold text-lg">
                            {formatCurrency(item.price)}
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-3">
                          <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm">
                            <button
                              className={`p-2 rounded-l-lg transition-colors duration-200 ${
                                checkoutCompleted
                                  ? "text-gray-400 cursor-not-allowed bg-gray-100"
                                  : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                              }`}
                              onClick={() => handleDecreaseQuantity(item)}
                              disabled={checkoutCompleted}
                            >
                              <FiMinus size={16} />
                            </button>
                            <span className="px-4 py-2 font-semibold text-gray-800 min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              className={`p-2 rounded-r-lg transition-colors duration-200 ${
                                checkoutCompleted
                                  ? "text-gray-400 cursor-not-allowed bg-gray-100"
                                  : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                              }`}
                              onClick={() => handleIncreaseQuantity(item)}
                              disabled={checkoutCompleted}
                            >
                              <FiPlus size={16} />
                            </button>
                          </div>
                          <button
                            className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors duration-200 ${
                              checkoutCompleted
                                ? "text-gray-400 cursor-not-allowed bg-gray-100"
                                : "text-red-500 hover:text-red-700 hover:bg-red-50"
                            }`}
                            onClick={() => handleRemoveItem(item)}
                            disabled={checkoutCompleted}
                          >
                            <span className="flex items-center">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Xóa
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-gray-400 text-3xl">🛒</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Giỏ hàng trống
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Bạn chưa có sản phẩm nào trong giỏ hàng.
                  </p>
                  <Link href="/">
                    <button className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium shadow-md">
                      Tiếp tục mua sắm
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Cột phải: Thanh toán */}
          {cartItems.length > 0 && (
            <div className="col-span-1 bg-gray-50 p-4 rounded-lg shadow-inner">
              <h2 className="text-xl font-semibold mb-1">
                Thông tin thanh toán
              </h2>
              <div className="mb-1">
                {session ? (
                  addresses.length > 0 ? (
                    selectedAddress ? (
                      <div className="border rounded-md p-2 flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm">
                            {selectedAddress.fullName || name}
                          </p>
                          <p className="text-gray-600 text-sm">
                            SĐT:{" "}
                            {selectedAddress.phoneNumber
                              ? `(+84) ${selectedAddress.phoneNumber}`
                              : phone}
                          </p>
                          <p className="text-gray-600 text-sm">
                            Địa chỉ: {selectedAddress.address1}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {selectedAddress.wardName},{" "}
                            {selectedAddress.districtName},{" "}
                            {selectedAddress.cityName}
                          </p>
                          {selectedAddress.type === "home" && (
                            <span className="inline-block bg-red-100 text-red-600 text-xs px-2 py-1 rounded mt-1">
                              Nhà riêng
                            </span>
                          )}
                          {selectedAddress.type === "office" && (
                            <span className="inline-block bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded mt-1">
                              Văn phòng
                            </span>
                          )}
                          {selectedAddress.isDefault && (
                            <span className="inline-block bg-green-100 text-green-600 text-xs px-2 py-1 rounded ml-2">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={handleChangeAddress}
                            className="text-blue-500 hover:underline ml-2 text-sm whitespace-nowrap"
                          >
                            Thay đổi
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-500">
                          Chưa có địa chỉ nào được chọn.
                        </p>
                        <button
                          onClick={handleChangeAddress}
                          className="text-blue-500 hover:underline"
                        >
                          + Thêm địa chỉ mới
                        </button>
                      </div>
                    )
                  ) : (
                    <div>
                      <p className="text-gray-500">Bạn chưa có địa chỉ nào.</p>
                      <button
                        onClick={handleChangeAddress}
                        className="text-blue-500 hover:underline"
                      >
                        + Thêm địa chỉ mới
                      </button>
                    </div>
                  )
                ) : (
                  <div>
                    <p className="text-gray-500">
                      Hãy{" "}
                      <button
                        onClick={() => router.push(`/dang-nhap?callbackUrl=${encodeURIComponent("/checkout")}`)}
                        className="text-blue-500 hover:underline"
                      >
                        Đăng nhập
                      </button>{" "}
                      để tiếp tục.
                    </p>
                    <div className="mt-2 flex gap-4">
                      <p className="text-gray-500">
                        Nếu chưa có,{" "}
                        <Link
                          href="/dang-ky"
                          className="text-blue-500 hover:underline"
                        >
                          Đăng ký
                        </Link>{" "}
                        ngay.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-800 font-bold text-lg mb-4">
                  Phương thức thanh toán
                </label>

                <div className="space-y-3">
                  {/* COD Payment Option */}
                  <div className={`relative border-2 rounded-xl p-4 transition-all duration-300 hover:shadow-md ${
                    paymentMethod === "COD"
                      ? "border-green-400 bg-green-50 shadow-lg"
                      : "border-gray-200 bg-white hover:border-green-300"
                  }`}>
                    <label className="flex items-center cursor-pointer group">
                      <div className="relative mr-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="COD"
                          checked={paymentMethod === "COD"}
                          onChange={(e) => {
                            console.log("COD selected:", e.target.value);
                            setPaymentMethod(e.target.value);
                          }}
                          className="sr-only"
                          disabled={checkoutCompleted}
                        />
                        <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                          paymentMethod === "COD"
                            ? "border-green-500 bg-green-500"
                            : "border-gray-300 group-hover:border-green-400"
                        }`}>
                          {paymentMethod === "COD" && (
                            <div className="w-full h-full rounded-full bg-white scale-50 transition-transform duration-200"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`text-base font-medium transition-colors duration-200 ${
                          checkoutCompleted
                            ? "text-gray-500"
                            : paymentMethod === "COD"
                              ? "text-green-700"
                              : "text-gray-700 group-hover:text-green-600"
                        }`}>
                          Thanh toán khi nhận hàng (COD)
                        </span>
                        <span className="ml-2 text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          Phổ biến
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Sepay Payment Option */}
                  <div className={`relative border-2 rounded-xl p-4 transition-all duration-300 hover:shadow-md ${
                    paymentMethod === "Sepay"
                      ? "border-blue-400 bg-blue-50 shadow-lg"
                      : "border-gray-200 bg-white hover:border-blue-300"
                  }`}>
                    <label className="flex items-center cursor-pointer group">
                      <div className="relative mr-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="Sepay"
                          checked={paymentMethod === "Sepay"}
                          onChange={(e) => {
                            console.log("=== SEPAY RADIO CLICKED ===");
                            console.log("Event:", e);
                            console.log("Target:", e.target);
                            console.log("Value:", e.target.value);
                            console.log("Checked:", e.target.checked);

                            // Đơn giản hóa logic
                            setPaymentMethod("Sepay");
                            console.log("Payment method set to Sepay");
                          }}
                          disabled={loadingPayment || checkoutCompleted}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                          paymentMethod === "Sepay"
                            ? "border-blue-500 bg-blue-500"
                            : loadingPayment || checkoutCompleted
                              ? "border-gray-300 opacity-50"
                              : "border-gray-300 group-hover:border-blue-400"
                        }`}>
                          {paymentMethod === "Sepay" && (
                            <div className="w-full h-full rounded-full bg-white scale-50 transition-transform duration-200"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center flex-1">
                        <div>
                          <span className={`text-base font-medium transition-colors duration-200 ${
                            checkoutCompleted
                              ? "text-gray-500"
                              : paymentMethod === "Sepay"
                                ? "text-blue-700"
                                : "text-gray-700 group-hover:text-blue-600"
                          }`}>
                            Quét mã QR Ngân hàng
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            Thanh toán nhanh qua ứng dụng ngân hàng
                          </p>
                        </div>
                        <span className="ml-2 text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                          Online
                        </span>
                      </div>
                    </label>

                    {/* Manual create QR button */}
                    {paymentMethod === "Sepay" && !paymentCode && !loadingPayment && (
                      <div className="mt-4 pt-3 border-t border-blue-200">
                        <button
                          onClick={() => {
                            console.log("=== MANUAL CREATE QR CLICKED ===");
                            if (session?.user?.id && cartItems.length > 0) {
                              handleCreatePayment();
                            } else {
                              console.log("Cannot create - missing session or cart");
                            }
                          }}
                          className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          disabled={!session?.user?.id || cartItems.length === 0}
                        >
                          <span className="flex items-center justify-center">
                            <span className="mr-2">🔄</span>
                            Tạo mã QR thanh toán
                          </span>
                        </button>
                        {(!session?.user?.id || cartItems.length === 0) && (
                          <p className="text-xs text-red-500 mt-2 text-center bg-red-50 p-2 rounded">
                            {!session?.user?.id ? "Vui lòng đăng nhập" : "Giỏ hàng trống"}
                          </p>
                        )}
                      </div>
                    )}

                    {loadingPayment && paymentMethod === "Sepay" && (
                      <div className="mt-3 flex items-center justify-center text-blue-600 text-sm bg-blue-50 p-3 rounded-lg">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                        <span>Đang tạo mã QR...</span>
                      </div>
                    )}
                  </div>
                
                  {(paymentMethod === "Sepay" || paymentMethod === "MoMo") && (
                    paymentCode ? (
                    <div className="text-center mt-4 border-2 border-blue-200 p-6 rounded-lg shadow-lg bg-gradient-to-br from-blue-50 to-white">

                      {loadingPayment ? (
                        <div className="py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                          <p className="text-gray-600">Đang tạo thanh toán...</p>
                        </div>
                      ) : (
                        <>
                          <div className="bg-white p-4 rounded-lg shadow-md inline-block">
                            <Image
                              src={qrUrl}
                              alt={`QR Code ${paymentMethod}`}
                              width={256}
                              height={256}
                              className="w-64 h-64 mx-auto border-2 border-gray-200 rounded-lg"
                              unoptimized
                              onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "block";
                              }}
                            />
                            <div className="hidden text-center py-8">
                                <p className="text-red-500 mb-2">
                                  Không thể tải mã QR
                                </p>
                              <button
                                onClick={handleCreatePayment}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                              >
                                Thử lại
                              </button>
                            </div>
                          </div>

                          <div className="mt-3 space-y-3">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">
                                  Số tiền cần thanh toán:
                                </p>
                              <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(finalTotal)}
                              </p>
                            </div>


                            {paymentMethod === "MoMo" && payUrl && (
                              <div className="bg-pink-50 p-3 rounded-lg">
                                  <p className="text-sm text-pink-700 mb-2">
                                    Hoặc thanh toán qua app MoMo:
                                  </p>
                                <a
                                  href={payUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition-colors"
                                >
                                  📱 Mở app MoMo
                                </a>
                              </div>
                            )}

                            {!isPaid ? (
                              <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                                <div className="flex items-center justify-center mb-2">
                                  <div className="animate-pulse w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                                    <p className="text-orange-700 font-medium">
                                      Đang chờ thanh toán
                                    </p>
                                </div>
                                <p className="text-sm text-orange-600 text-center mb-3">
                                  {paymentMethod === "Sepay" ? (
                                    <>
                                        📱 Quét mã QR bằng ứng dụng ngân hàng
                                        <br />
                                        💳 {typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? (
                                          <>
                                            <span className="font-semibold">Đang ở môi trường local:</span> Sau khi chuyển khoản, vui lòng click nút &quot;Đã chuyển khoản&quot; bên dưới để xác nhận thủ công
                                          </>
                                        ) : (
                                          "Hệ thống sẽ tự động xác nhận khi thanh toán thành công"
                                        )}
                                    </>
                                  ) : (
                                    <>
                                        📱 Quét mã QR hoặc mở app MoMo
                                        <br />
                                        💳 Hệ thống sẽ tự động xác nhận khi thanh
                                        toán thành công
                                    </>
                                  )}
                                </p>
                                {paymentMethod === "Sepay" && (
                                  <>
                                    <button
                                      onClick={handleConfirmPayment}
                                      disabled={loadingPayment}
                                      className="w-full mt-2 px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {loadingPayment ? (
                                        <span className="flex items-center justify-center">
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                          Đang xác nhận...
                                        </span>
                                      ) : (
                                        "✅ Đã chuyển khoản - Xác nhận ngay"
                                      )}
                                    </button>
                                    <p className="text-xs text-gray-600 mt-2 text-center bg-yellow-50 p-2 rounded border border-yellow-200">
                                      ⚠️ <strong>Lưu ý:</strong> Nút này chỉ hoạt động sau khi hệ thống đã nhận được xác nhận từ ngân hàng (webhook). Nếu bạn đã chuyển khoản nhưng nút này không hoạt động, vui lòng đợi vài phút để hệ thống tự động xác nhận.
                                    </p>
                                  </>
                                )}
                              </div>
                            ) : (
                              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                                <div className="flex items-center justify-center mb-2">
                                    <span className="text-green-600 text-xl mr-2">
                                      ✅
                                    </span>
                                    <p className="text-green-700 font-bold">
                                      Thanh toán thành công!
                                    </p>
                                </div>
                                <p className="text-sm text-green-600 text-center">
                                  Bạn có thể tiếp tục đặt hàng
                                </p>
                              </div>
                            )}
                          </div>

                            <div className="mt-4 space-y-2">
                              <div className="text-xs text-gray-500">
                                <p>⏰ Mã QR có hiệu lực trong 15 phút</p>
                            <p>🔄 Quét bằng app ngân hàng để thanh toán</p>
                              </div>
     
                          </div>
                        </>
                      )}
                    </div>
                    ) : (
                      <div className="text-center mt-4 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <p className="text-gray-500 mb-2">Chưa có mã QR thanh toán</p>
                        <p className="text-sm text-gray-400">Vui lòng click &quot;Tạo mã QR thanh toán&quot; ở trên</p>
                      </div>
                    )
                  )}

                  {/* MoMo Payment Option */}
                  <div className={`relative border-2 rounded-xl p-4 transition-all duration-300 hover:shadow-md ${
                    paymentMethod === "MoMo"
                      ? "border-pink-400 bg-pink-50 shadow-lg"
                      : "border-gray-200 bg-white hover:border-pink-300"
                  }`}>
                    <label className="flex items-center cursor-pointer group">
                      <div className="relative mr-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="MoMo"
                          checked={paymentMethod === "MoMo"}
                          onChange={() => setPaymentMethod("MoMo")}
                          disabled={loadingPayment || checkoutCompleted}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                          paymentMethod === "MoMo"
                            ? "border-pink-500 bg-pink-500"
                            : loadingPayment || checkoutCompleted
                              ? "border-gray-300 opacity-50"
                              : "border-gray-300 group-hover:border-pink-400"
                        }`}>
                          {paymentMethod === "MoMo" && (
                            <div className="w-full h-full rounded-full bg-white scale-50 transition-transform duration-200"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center flex-1">
                        <div>
                          <span className={`text-base font-medium transition-colors duration-200 ${
                            checkoutCompleted
                              ? "text-gray-500"
                              : paymentMethod === "MoMo"
                                ? "text-pink-700"
                                : "text-gray-700 group-hover:text-pink-600"
                          }`}>
                            Thanh toán qua MoMo
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            QR Code + Ứng dụng MoMo
                          </p>
                        </div>
                        <span className="ml-2 text-sm text-pink-600 bg-pink-100 px-2 py-1 rounded-full">
                          Đa dạng
                        </span>
                      </div>
                    </label>

                    {loadingPayment && paymentMethod === "MoMo" && (
                      <div className="mt-3 flex items-center justify-center text-pink-600 text-sm bg-pink-50 p-3 rounded-lg">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500 mr-2"></div>
                        <span>Đang tạo thanh toán...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-800 font-bold text-lg mb-2">
                  Thời gian giao hàng
                </label>
                
                {/* 2 lựa chọn chính */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryTimeType("business_hours");
                      setDeliveryTime("business_hours");
                    }}
                    className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                      deliveryTimeType === "business_hours"
                        ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                        : "border-gray-200 bg-white text-gray-700 hover:border-green-300"
                    } ${checkoutCompleted ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={checkoutCompleted}
                  >
                    Giờ hành chính
                    <br />
                    <span className="text-xs font-normal">(8h - 17h)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryTimeType("after_hours");
                      setDeliveryTime(""); // Reset để chọn khung giờ
                    }}
                    className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                      deliveryTimeType === "after_hours"
                        ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                        : "border-gray-200 bg-white text-gray-700 hover:border-green-300"
                    } ${checkoutCompleted ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={checkoutCompleted}
                  >
                    Ngoài giờ hành chính
                  </button>
                </div>

                {/* Hiển thị các khung giờ khi chọn ngoài giờ hành chính */}
                {deliveryTimeType === "after_hours" && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <label className="block text-gray-600 text-sm mb-2">
                      Chọn khung giờ:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryTime("17-18")}
                        className={`px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
                          deliveryTime === "17-18"
                            ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                            : "border-gray-200 bg-white text-gray-700 hover:border-green-300"
                        } ${checkoutCompleted ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={checkoutCompleted}
                      >
                        17h - 18h
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryTime("18-19")}
                        className={`px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
                          deliveryTime === "18-19"
                            ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                            : "border-gray-200 bg-white text-gray-700 hover:border-green-300"
                        } ${checkoutCompleted ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={checkoutCompleted}
                      >
                        18h - 19h
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryTime("19-20")}
                        className={`px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
                          deliveryTime === "19-20"
                            ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                            : "border-gray-200 bg-white text-gray-700 hover:border-green-300"
                        } ${checkoutCompleted ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={checkoutCompleted}
                      >
                        19h - 20h
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-2">
                <label className="block text-gray-600 mb-1">Ghi chú</label>
                <textarea
                  placeholder="Yêu cầu đặc biệt..."
                  className={`w-full border rounded p-2 ${
                    checkoutCompleted ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
                  }`}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={checkoutCompleted}
                />
              </div>

              <div className="flex justify-between mb-2">
                <p className="text-gray-600">Tổng tạm tính</p>
                <p className="font-medium">{formatCurrency(totalPrice)}</p>
              </div>

              <div className="mb-2">
                <label className="block text-gray-600">Mã giảm giá</label>
                <div className="relative w-full mt-2 flex gap-2">
                  <div className="relative flex-1">
                    {discount > 0 && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center bg-green-500 text-white px-2 py-1 rounded">
                        <span>{coupon.toUpperCase()}</span>
                        <button
                          className={`ml-1 ${
                            checkoutCompleted
                              ? "text-gray-400 cursor-not-allowed"
                              : "hover:text-gray-200"
                          }`}
                          onClick={handleRemoveCoupon}
                          disabled={checkoutCompleted}
                        >
                          <AiOutlineClose size={14} />
                        </button>
                      </div>
                    )}
                    <input
                      type="text"
                      className={`w-full border rounded p-2 ${
                        checkoutCompleted ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
                      }`}
                      placeholder="Nhập mã (VD: ECO10, ECO20...)"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      disabled={discount > 0 || loadingCoupon || checkoutCompleted}
                    />
                  </div>
                  <button
                    className={`px-2 py-2 rounded whitespace-nowrap ${
                      checkoutCompleted
                        ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                    onClick={handleApplyCoupon}
                    disabled={loadingCoupon || discount > 0 || checkoutCompleted}
                  >
                    {loadingCoupon ? "Đang kiểm tra..." : "Áp dụng"}
                  </button>
                </div>
                {errorMessage && (
                  <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
                )}
              </div>

              {discount > 0 && (
                <div className="flex justify-between mb-2 text-red-500">
                  <p>Giảm giá ({discount}%)</p>
                  <p>-{formatCurrency(discountAmount)}</p>
                </div>
              )}
              <div className="flex justify-between mb-2">
                <p className="text-gray-600">Phí vận chuyển</p>
                <p className="font-medium">{formatCurrency(shippingFee)}</p>
              </div>

              <div className="flex justify-between mb-2">
                <p className="text-gray-600 font-semibold">Thành tiền</p>
                <p className="font-bold text-lg">{formatCurrency(finalTotal)}</p>
              </div>

              {checkoutCompleted ? (
                <div className="w-full bg-green-100 border border-green-200 text-green-800 py-3 px-4 rounded-md mt-2 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-2xl mr-2">✅</span>
                    <span className="font-bold">Đơn hàng đã được xử lý thành công!</span>
                  </div>
                  <p className="text-sm">Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ sớm nhất có thể.</p>
                </div>
              ) : autoCheckoutLoading ? (
                <button
                  className="w-full bg-blue-500 text-white py-2 rounded-md mt-2 cursor-wait"
                  disabled={true}
                >
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang xử lý đơn hàng tự động...
                  </div>
                </button>
              ) : (
                <button
                  className="w-full bg-green-500 text-white py-2 rounded-md mt-2 hover:bg-green-600 disabled:bg-gray-400"
                  onClick={handleCheckout}
                  disabled={paymentMethod === "Sepay" && !isPaid}
                >
                  THANH TOÁN
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Popup chọn địa chỉ */}
      <SelectAddressPopup
        isOpen={showAddressPopup}
        onClose={handleClosePopup}
        addresses={addresses}
        selectedAddress={selectedAddress}
        setSelectedAddress={setSelectedAddress}
        onEditAddress={handleOpenEditAddress}
        onAddNewAddress={() => handleOpenEditAddress(null)}
        onConfirm={handleConfirmAddress}
        onDeleteAddress={handleDeleteAddress}
      />

      {/* Popup chỉnh sửa/ thêm địa chỉ */}
      <EditAddressPopup
        isOpen={showEditAddressPopup}
        onClose={handleCloseEditAddress}
        onSave={handleSaveAddress}
        addressData={editAddressData}
        setAddressData={setEditAddressData}
        refreshAddresses={() => {
          axios.get(`/api/user/${session.user.id}`).then((res) => {
            setAddresses(res.data.address);
            if (res.data.address.length > 0) {
              const defaultAddr =
                res.data.address.find((addr) => addr.isDefault) ||
                res.data.address[0];
              setSelectedAddress(defaultAddr);
            }
          });
        }}
      />
    </>
  );
}