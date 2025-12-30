import { useState } from "react";
import { paymentService } from "../../../lib/api-services";
import { toast } from "react-hot-toast";

const PaymentOptions = ({ orderId, amount }) => {
  const [paymentUrl, setPaymentUrl] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePayment = async (method) => {
    setSelectedMethod(method);
    setLoading(true);
    try {
      // Chỉ dùng Server API
      let response;
      if (method === "VNPay") {
        // VNPay chưa có trong backend, chỉ hỗ trợ MoMo và Sepay
        toast.error("VNPay chưa được hỗ trợ. Vui lòng chọn MoMo hoặc Sepay.");
        setLoading(false);
        return;
      } else if (method === "MoMo") {
        response = await paymentService.createMomo(amount, { orderId });
        setPaymentUrl(response.payUrl || response.paymentUrl || "");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      const errorMessage = error.response?.data?.error || error.message || "Có lỗi khi tạo thanh toán";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-semibold mb-4">Chọn phương thức thanh toán</h2>
      <div className="flex gap-4">
        <button
          onClick={() => handlePayment("MoMo")}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Đang tạo..." : "Thanh toán qua MoMo"}
        </button>
      </div>

      {paymentUrl && (
        <div className="text-center mt-4">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
              paymentUrl
            )}&size=200x200`}
            alt={`${selectedMethod} QR Code`}
            className="mx-auto border p-2 shadow-md"
          />
          <p className="mt-2">
            Quét mã QR để thanh toán qua {selectedMethod}
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentOptions;
