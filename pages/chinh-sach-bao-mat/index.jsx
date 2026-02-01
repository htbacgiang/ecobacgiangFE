import DefaultLayout from "../../components/layout/DefaultLayout";
import Head from "next/head";

export default function PrivacyPolicy() {
  return (
    <DefaultLayout>
      <Head>
        <title>Chính sách bảo mật thông tin - Eco Bắc Giang</title>
        <meta
          name="description"
          content="Chính sách bảo mật thông tin tại Eco Bắc Giang. Cam kết bảo vệ sự riêng tư và tin cậy của khách hàng như bảo vệ nguồn đất và nguồn nước."
        />
      </Head>

      {/* Header Spacer */}
      <div className="h-[80px] bg-gradient-to-r from-gray-50 to-gray-100"></div>

      {/* Main Content */}
      <div className="bg-white py-16 px-6">
        <div className="mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              CHÍNH SÁCH BẢO MẬT THÔNG TIN
            </h1>
            <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg  mx-auto text-left">
              <p className="text-lg text-gray-700 leading-relaxed">
                Eco Bắc Giang cam kết bảo vệ sự riêng tư và tin cậy của Quý khách hàng như bảo vệ chính nguồn đất và nguồn nước của chúng tôi.
              </p>
            </div>
         
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            {/* Section 1: Mục đích thu thập thông tin */}
            <section className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                1. MỤC ĐÍCH THU THẬP THÔNG TIN
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Chúng tôi chỉ thu thập những thông tin cần thiết để phục vụ cho việc mua sắm và chăm sóc khách hàng, bao gồm:
              </p>
              
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">• Họ và tên:</h3>
                  <p className="text-gray-700">Để xác nhận đơn hàng và xưng hô khi giao tiếp.</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">• Số điện thoại:</h3>
                  <p className="text-gray-700">Để liên hệ giao hàng và xử lý các vấn đề phát sinh.</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">• Địa chỉ giao hàng:</h3>
                  <p className="text-gray-700">Để shipper tìm được nhà của bạn.</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">• Email (tùy chọn):</h3>
                  <p className="text-gray-700">Để gửi hóa đơn điện tử hoặc thông tin khuyến mãi (nếu Quý khách đăng ký).</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">• Lịch sử mua hàng:</h3>
                  <p className="text-gray-700">Để hệ thống AI gợi ý sản phẩm phù hợp và áp dụng chương trình khách hàng thân thiết.</p>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mt-6">
                <p className="text-gray-700 leading-relaxed">
                  <strong>Cam kết:</strong> Chúng tôi <strong className="text-red-600">KHÔNG</strong> thu thập các thông tin nhạy cảm như quan điểm chính trị, tôn giáo hay tình trạng sức khỏe cá nhân không liên quan.
                </p>
              </div>
            </section>

            {/* Section 2: Phạm vi sử dụng thông tin */}
            <section className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                2. PHẠM VI SỬ DỤNG THÔNG TIN
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Thông tin của Quý khách chỉ được sử dụng trong nội bộ Eco Bắc Giang cho các mục đích:
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-4 mt-1">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Xử lý đơn hàng:</h3>
                    <p className="text-gray-700">Gọi điện xác nhận, đóng gói và giao hàng.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-4 mt-1">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Chăm sóc khách hàng:</h3>
                    <p className="text-gray-700">Giải quyết khiếu nại, đổi trả, hỗ trợ kỹ thuật.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-4 mt-1">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Cải thiện trải nghiệm:</h3>
                    <p className="text-gray-700">Sử dụng dữ liệu ẩn danh để phân tích nhu cầu thị trường và nâng cấp App/Website.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-4 mt-1">
                    4
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Gửi thông báo:</h3>
                    <p className="text-gray-700">Gửi tin nhắn về tình trạng đơn hàng hoặc các chương trình ưu đãi đặc biệt (Quý khách có thể từ chối nhận tin quảng cáo bất cứ lúc nào).</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Thời gian lưu trữ */}
            <section className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                3. THỜI GIAN LƯU TRỮ
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-3 ml-4">
                <li>Dữ liệu cá nhân của Quý khách sẽ được lưu trữ cho đến khi có yêu cầu hủy bỏ từ phía Quý khách.</li>
                <li>Trong mọi trường hợp còn lại, thông tin cá nhân thành viên sẽ được bảo mật trên máy chủ của Eco Bắc Giang.</li>
              </ul>
            </section>

            {/* Section 4: Cam kết không chia sẻ cho bên thứ ba */}
            <section className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                4. CAM KẾT KHÔNG CHIA SẺ CHO BÊN THỨ BA
              </h2>
              <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg mb-6">
                <p className="text-gray-700 leading-relaxed text-lg mb-4">
                  Eco Bắc Giang cam kết <strong className="text-red-600">KHÔNG</strong> bán, trao đổi, hay tiết lộ thông tin cá nhân của Quý khách cho bất kỳ bên thứ ba nào, ngoại trừ các trường hợp sau:
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">• Đơn vị vận chuyển:</h3>
                  <p className="text-gray-700">
                    Chúng tôi cần cung cấp Tên, Số điện thoại và Địa chỉ của Quý khách cho đối tác giao hàng để họ thực hiện việc giao nhận.
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">• Yêu cầu pháp lý:</h3>
                  <p className="text-gray-700">
                    Khi có yêu cầu từ cơ quan nhà nước có thẩm quyền theo quy định của pháp luật Việt Nam.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5: An toàn dữ liệu */}
            <section className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                5. AN TOÀN DỮ LIỆU
              </h2>
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <p className="text-gray-700 leading-relaxed">
                    Dữ liệu của Quý khách được lưu trữ trên hệ thống máy chủ Cloud an toàn (Azure/Google Cloud) với các biện pháp bảo mật tiêu chuẩn.
                  </p>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">
                    Mọi giao dịch thanh toán trực tuyến đều được thực hiện thông qua các cổng thanh toán uy tín (Ngân hàng, Ví điện tử) và được mã hóa đảm bảo an toàn. <strong>Eco Bắc Giang không lưu trữ thông tin thẻ tín dụng/thẻ ATM của Quý khách.</strong>
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6: Quyền lợi của khách hàng */}
            <section className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                6. QUYỀN LỢI CỦA KHÁCH HÀNG
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Quý khách có quyền:
              </p>
              
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">• Kiểm tra, cập nhật, điều chỉnh thông tin cá nhân:</h3>
                  <p className="text-gray-700">
                    Bằng cách đăng nhập vào tài khoản trên App/Website.
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">• Yêu cầu xóa thông tin cá nhân:</h3>
                  <p className="text-gray-700">
                    Quý khách có thể gửi yêu cầu xóa tài khoản và dữ liệu qua Email: <strong className="text-green-700">lienhe@ecobacgiang.vn</strong> hoặc Hotline: <strong className="text-green-700">0969.079.673</strong>. Chúng tôi sẽ thực hiện ngay lập tức sau khi xác minh.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7: Liên hệ về bảo mật */}
            <section className="bg-green-50 rounded-lg p-8 border border-green-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                7. LIÊN HỆ VỀ BẢO MẬT
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Nếu Quý khách có bất kỳ thắc mắc hay lo ngại nào về chính sách bảo mật, xin vui lòng liên hệ trực tiếp với chúng tôi:
              </p>
              
              <div className="bg-white rounded-lg p-6 space-y-3">
                <div className=" items-start">
                  <strong className="min-w-[180px] text-gray-900">Đơn vị quản lý:</strong>
                  <span className="text-gray-700"> Hợp tác xã Nông nghiệp thông minh Eco Bắc Giang</span>
                </div>
                <div className=" items-start">
                  <strong className="min-w-[180px] text-gray-900">Địa chỉ:</strong>
                  <span className="text-gray-700"> Tân An, Yên Dũng, Bắc Giang.</span>
                </div>
                <div className=" items-center">
                  <strong className="min-w-[180px] text-gray-900">Hotline:</strong>
                  <span className="text-green-700 font-semibold text-lg"> 0969.079.673</span>
                </div>
                <div className=" items-center">
                  <strong className="min-w-[180px] text-gray-900">Email:</strong>
                  <span className="text-gray-700"> lienhe@ecobacgiang.vn</span>
                </div>
              </div>
            </section>

            {/* Footer Message */}
            <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-1">
              <p className="text-xl text-gray-800 font-semibold italic">
                Sự tin tưởng của Quý khách là tài sản quý giá nhất của Eco Bắc Giang.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
