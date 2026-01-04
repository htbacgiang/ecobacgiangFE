import { useState } from "react";
import { 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaClock,
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaPaperPlane,
  FaUser,
  FaRuler,
  FaCheckCircle
} from "react-icons/fa";
import { SiZalo } from "react-icons/si";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    productType: "",
    quantity: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errors, setErrors] = useState({});

  const contactInfo = {
    address: "Tân An, Yên Dũng, Bắc Giang",
    phone: "0866.572.271",
    email: "lienhe@ecobacgiang.vn",
    workingHours: {
      weekdays: "Thứ 2 - Thứ 7: 8:00 - 18:00",
      weekend: "Chủ nhật: 9:00 - 17:00"
    }
  };

  const socialLinks = [
    { name: "Facebook", icon: FaFacebookF, url: "https://facebook.com/ecobacgiang", color: "bg-blue-600" },
    { name: "Instagram", icon: FaInstagram, url: "https://instagram.com/ecobacgiang", color: "bg-pink-600" },
    { name: "YouTube", icon: FaYoutube, url: "https://youtube.com/@ecobacgiang", color: "bg-red-600" },
    { name: "Zalo", icon: SiZalo, url: "https://zalo.me/0866572271", color: "bg-blue-500" }
  ];

  const productTypes = [
    "Rau củ quả hữu cơ",
    "Trái cây theo mùa", 
    "Gạo hữu cơ",
    "Gia vị hữu cơ",
    "Thực phẩm chế biến",
    "Sản phẩm đặc biệt",
    "Gói combo",
    "Khác"
  ];

  const quantityRanges = [
    "Dưới 5kg",
    "5kg - 10kg",
    "10kg - 20kg", 
    "20kg - 50kg",
    "Trên 50kg",
    "Chưa xác định"
  ];

  const validateForm = () => {
    const newErrors = {};

    // Validate required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Họ và tên là bắt buộc';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else {
      // Basic phone validation
      const phoneRegex = /^[0-9+\-\s()]+$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Số điện thoại không hợp lệ';
      }
    }

    // Validate email if provided
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Email không hợp lệ';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          message: `Loại sản phẩm: ${formData.productType || 'Chưa chọn'}\nSố lượng: ${formData.quantity || 'Chưa xác định'}\n\n${formData.message || ''}`
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus("success");
        setErrors({});
        // Reset form
        setFormData({
          name: "",
          phone: "",
          email: "",
          productType: "",
          quantity: "",
          message: "",
        });
      } else {
        setSubmitStatus("error");
        console.error('API Error:', result.message);
      }
    } catch (error) {
      setSubmitStatus("error");
      console.error('Network Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="h-[80px]"> </div>
      {/* Contact Information */}
      <section className="md:py-20 py-8 px-5">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-green-900 mb-6">
                Thông tin liên hệ
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt className="text-green-900 text-lg" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-green-900 mb-1">Địa chỉ</h3>
                    <p className="text-green-700 text-sm leading-relaxed">{contactInfo.address}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaPhone className="text-green-900 text-lg" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-green-900 mb-1">Hotline</h3>
                    <a 
                      href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                      className="text-green-900 hover:text-green-700 font-medium text-base transition-colors"
                    >
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaEnvelope className="text-green-900 text-lg" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-green-900 mb-1">Email</h3>
                    <a 
                      href={`mailto:${contactInfo.email}`}
                      className="text-green-900 hover:text-green-700 font-medium text-sm transition-colors"
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaClock className="text-green-900 text-lg" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-green-900 mb-1">Giờ làm việc</h3>
                    <p className="text-green-700 text-sm">{contactInfo.workingHours.weekdays}</p>
                    <p className="text-green-700 text-sm">{contactInfo.workingHours.weekend}</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <p className="text-base font-bold text-green-900 mb-3">Kết nối với chúng tôi</p>
                <div className="flex space-x-3">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-10 h-10 ${social.color} rounded-lg flex items-center justify-center text-white hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="text-lg" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Map */}
            <div>
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg h-96">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3207.660320715124!2d105.83861376595286!3d20.691144069113736!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135cbbd49100805%3A0xf7bd8a83a0cf059c!2zRWNvIELhuq9jIEdpYW5nIC0gTsO0bmcgVHLhuqFpIEjhu691IEPGoQ!5e1!3m2!1svi!2s!4v1755957385053!5m2!1svi!2s" 
                  width="100%" 
                  height="100%" 
                  style={{border: 0}} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="md:py-10 py-6 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-4">
                  Gửi yêu cầu tư vấn
                </h2>
                <p className="text-lg text-green-600 max-w-2xl mx-auto">
                  Điền thông tin dưới đây để chúng tôi có thể hỗ trợ bạn tốt nhất. 
                  Chúng tôi sẽ phản hồi trong vòng 24 giờ.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 px-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-2">
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">
                      Họ và tên *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent ${
                          errors.name ? 'border-red-500' : 'border-green-300'
                        }`}
                        placeholder="Nhập họ và tên của bạn"
                      />
                      <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-400" />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">
                      Số điện thoại *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent ${
                          errors.phone ? 'border-red-500' : 'border-green-300'
                        }`}
                        placeholder="Nhập số điện thoại"
                      />
                      <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-400" />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-green-300'
                      }`}
                      placeholder="Nhập địa chỉ email"
                    />
                    <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-400" />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">
                      Loại sản phẩm
                    </label>
                    <select
                      name="productType"
                      value={formData.productType}
                      onChange={handleInputChange}
                      className="w-full py-3 px-4 border border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent"
                    >
                      <option value="">Chọn loại sản phẩm</option>
                      {productTypes.map((type, index) => (
                        <option key={index} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">
                      Số lượng dự kiến
                    </label>
                    <select
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className="w-full py-3 px-4 border border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent"
                    >
                      <option value="">Chọn số lượng</option>
                      {quantityRanges.map((range, index) => (
                        <option key={index} value={range}>{range}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">
                    Mô tả chi tiết
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full py-3 px-4 border border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent resize-none"
                    placeholder="Mô tả chi tiết về nhu cầu, yêu cầu đặc biệt hoặc câu hỏi của bạn..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-900 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-4 px-6 rounded-xl transition-colors duration-300 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Đang gửi...
                    </div>
                  ) : (
                    <>
                      <FaPaperPlane className="mr-3" />
                      Gửi yêu cầu tư vấn
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Success/Error Messages */}
            {submitStatus === "success" && (
              <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-500 text-2xl mr-4" />
                  <div>
                    <h3 className="text-lg font-bold text-green-800 mb-2">
                      Gửi thành công!
                    </h3>
                    <p className="text-green-700">
                      Cảm ơn bạn đã liên hệ với Eco Bắc Giang. Chúng tôi sẽ phản hồi trong vòng 24 giờ.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {submitStatus === "error" && (
              <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center">
                  <div className="text-red-500 text-2xl mr-4">⚠️</div>
                  <div>
                    <h3 className="text-lg font-bold text-red-800 mb-2">
                      Có lỗi xảy ra
                    </h3>
                    <p className="text-red-700">
                      Vui lòng thử lại hoặc liên hệ trực tiếp qua hotline: {contactInfo.phone}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

