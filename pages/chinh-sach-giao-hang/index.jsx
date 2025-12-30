import DefaultLayout from "../../components/layout/DefaultLayout";
import Head from "next/head";

export default function ShippingPolicy() {
  return (
    <DefaultLayout>
      <Head>
        <title>Chính sách đặt hàng & giao nhận - Eco Bắc Giang</title>
        <meta
          name="description"
          content="Chính sách đặt hàng, thanh toán và giao nhận tại Eco Bắc Giang. Nơi nông sản tử tế được bảo chứng bằng công nghệ."
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
              CHÍNH SÁCH ĐẶT HÀNG & GIAO NHẬN TẠI ECO BẮC GIANG
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-4">
              Chào mừng bạn đến với Eco Bắc Giang - Nơi nông sản tử tế được bảo chứng bằng công nghệ!
            </p>
            <p className="text-base text-gray-700 max-w-3xl mx-auto">
              Để mang đến trải nghiệm mua sắm minh bạch và thuận tiện nhất, chúng tôi xin gửi đến Quý khách hàng quy định chi tiết về chính sách đặt hàng, thanh toán và giao nhận như sau:
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            {/* Section 1: Hướng dẫn đặt hàng */}
            <section className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                1. HƯỚNG DẪN ĐẶT HÀNG
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Quý khách có thể đặt mua nông sản sạch của Eco Bắc Giang qua các kênh chính thức sau:
              </p>
              
              <div className="space-y-6">
                {/* Cách 1: Mobile App */}
                <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Cách 1: Đặt hàng qua Mobile App &quot;Eco Bắc Giang&quot; (Khuyên dùng)
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Đây là cách nhanh nhất và minh bạch nhất. Trên App, bạn không chỉ đặt hàng mà còn có thể:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Xem trực tiếp Camera tại Farm.</li>
                    <li>Truy xuất nguồn gốc và nhật ký canh tác của từng mớ rau.</li>
                    <li>Nhận thông báo ưu đãi độc quyền.</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    <strong>Tải App ngay tại:</strong> [Link iOS] | [Link Android]
                  </p>
                </div>

                {/* Cách 2: Website */}
                <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Cách 2: Đặt hàng qua Website
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Truy cập ecobacgiang.vn, chọn sản phẩm vào giỏ hàng và tiến hành thanh toán theo hướng dẫn.
                  </p>
                </div>

                {/* Cách 3: Hotline/Zalo */}
                <div className="bg-purple-50 border-l-4 border-purple-600 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Cách 3: Đặt hàng qua Hotline/Zalo
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Liên hệ trực tiếp số: <strong className="text-green-700">0866.572.271</strong> để được nhân viên tư vấn và lên đơn.
                  </p>
                </div>
              </div>

              {/* Lưu ý */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Lưu ý:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Eco Bắc Giang nhận đơn hàng 24/7 qua hệ thống online.</li>
                  <li>Các đơn hàng đặt trước <strong>10:00 sáng</strong> sẽ được xử lý và giao trong ngày (tùy khu vực).</li>
                  <li>Các đơn hàng đặt sau 10:00 sáng có thể được giao vào ngày hôm sau để đảm bảo độ tươi ngon nhất (thu hoạch sáng sớm).</li>
                </ul>
              </div>
            </section>

            {/* Section 2: Chính sách thanh toán */}
            <section className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                2. CHÍNH SÁCH THANH TOÁN
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Chúng tôi cung cấp đa dạng các phương thức thanh toán linh hoạt và bảo mật:
              </p>
              
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    1. Thanh toán khi nhận hàng (COD)
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Quý khách kiểm tra hàng, ưng ý mới thanh toán tiền mặt cho shipper.
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    2. Chuyển khoản ngân hàng
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li><strong>Ngân hàng:</strong> [Tên ngân hàng]</li>
                    <li><strong>Số tài khoản:</strong> [Số tài khoản]</li>
                    <li><strong>Chủ tài khoản:</strong> [Tên chủ tài khoản - Ví dụ: HTX Nông nghiệp thông minh ECO BẮC GIANG]</li>
                    <li><strong>Nội dung:</strong> [Mã đơn hàng] + [Số điện thoại]</li>
                  </ul>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    3. Thanh toán qua Ví điện tử
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Momo, ZaloPay, VNPay (Tích hợp sẵn trên App/Web).
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: Chính sách giao hàng */}
            <section className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                3. CHÍNH SÁCH GIAO HÀNG (LOGISTICS)
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Eco Bắc Giang cam kết giao nông sản &quot;Từ Farm đến Bàn ăn&quot; trong thời gian ngắn nhất để giữ trọn dinh dưỡng.
              </p>

              {/* Lịch giao hàng cố định */}
              <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Lịch Giao Hàng Cố Định:
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Để tối ưu quy trình thu hoạch và đảm bảo độ tươi ngon nhất, Eco Bắc Giang thực hiện giao hàng vào các ngày <strong>Thứ 2, Thứ 4 và Thứ 6</strong> hàng tuần.</li>
                  <li>Quý khách vui lòng đặt hàng trước ngày giao ít nhất 1 ngày để Farm kịp thời chuẩn bị.</li>
                </ul>
              </div>

              {/* Phạm vi & Phí giao hàng */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Phạm vi & Phí giao hàng:
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-green-600 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold">Khu vực</th>
                        <th className="px-6 py-4 text-left font-semibold">Thời gian giao dự kiến</th>
                        <th className="px-6 py-4 text-left font-semibold">Phí giao hàng (Tham khảo)</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      <tr className="border-t border-gray-200">
                        <td className="px-6 py-4 font-medium">Phường Bắc Giang</td>
                        <td className="px-6 py-4">Trong ngày</td>
                        <td className="px-6 py-4">30.000đ</td>
                      </tr>
                      <tr className="border-t border-gray-200 bg-gray-50">
                        <td className="px-6 py-4 font-medium">Các xã phường lân cận</td>
                        <td className="px-6 py-4">Trong ngày</td>
                        <td className="px-6 py-4">40.000đ</td>
                      </tr>
                      <tr className="border-t border-gray-200">
                        <td className="px-6 py-4 font-medium">Phường Kinh Bắc</td>
                        <td className="px-6 py-4">Trong ngày</td>
                        <td className="px-6 py-4">40.000đ</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-gray-600 text-sm mt-4 italic">
                  Lưu ý: Phí ship thực tế sẽ được hiển thị rõ ràng khi Quý khách chốt đơn trên App/Web.
                </p>
              </div>

              {/* Quy trình đóng gói */}
              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Quy trình đóng gói:
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Sử dụng bao bì thân thiện môi trường (túi giấy, lá chuối, túi sinh học tự hủy).</li>
                  <li>Sản phẩm được bảo quản mát trong suốt quá trình vận chuyển.</li>
                </ul>
              </div>
            </section>

            {/* Section 4: Chính sách đổi trả & hoàn tiền */}
            <section className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                4. CHÍNH SÁCH ĐỔI TRẢ & HOÀN TIỀN (CAM KẾT TỬ TẾ)
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Với triết lý &quot;Minh bạch hóa lòng tin&quot;, Eco Bắc Giang cam kết chịu trách nhiệm đến cùng với từng sản phẩm bán ra.
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Điều kiện đổi trả:
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Sản phẩm bị hư hỏng, dập nát, héo úa trong quá trình vận chuyển.</li>
                    <li>Sản phẩm không đúng với mô tả hoặc đơn đặt hàng.</li>
                    <li>Phát hiện chất lượng không đảm bảo (sâu bệnh bên trong mà mắt thường không thấy khi sơ chế).</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quy trình xử lý:
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-4 mt-1">
                        1
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        Quý khách vui lòng chụp ảnh/quay video tình trạng sản phẩm và gửi cho chúng tôi qua Zalo/App trong vòng <strong>24h</strong> kể từ khi nhận hàng.
                      </p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-4 mt-1">
                        2
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        Eco Bắc Giang sẽ xác minh và phản hồi ngay lập tức.
                      </p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-4 mt-1">
                        3
                      </div>
                      <div>
                        <p className="text-gray-700 leading-relaxed mb-2">
                          Phương án đền bù:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                          <li>Gửi bù sản phẩm mới vào đơn hàng sau (kèm quà xin lỗi).</li>
                          <li>Hoàn tiền 100% giá trị sản phẩm lỗi qua chuyển khoản hoặc ví tích điểm trên App.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Founder Quote */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6 mt-6">
                  <p className="text-gray-700 italic text-lg leading-relaxed">
                    &quot;Chúng tôi thà chịu thiệt chứ không để Khách hàng chịu thiệt.&quot; - Đó là lời hứa từ Founder Ngô Quang Trường.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5: Liên hệ hỗ trợ */}
            <section className="bg-green-50 rounded-lg p-8 border border-green-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                5. LIÊN HỆ HỖ TRỢ
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Mọi thắc mắc hoặc khiếu nại, xin vui lòng liên hệ:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center">
                  <strong className="min-w-[120px]">Hotline:</strong>
                  <span className="text-green-700 font-semibold text-lg">0866.572.271</span>
                </li>
                <li className="flex items-center">
                  <strong className="min-w-[120px]">Email:</strong>
                  <span>lienhe@ecobacgiang.vn</span>
                </li>
                <li className="flex items-start">
                  <strong className="min-w-[120px]">Địa chỉ:</strong>
                  <span>Tân An, Yên Dũng, Bắc Giang.</span>
                </li>
              </ul>
            </section>

            {/* Footer Message */}
            <div className="text-center bg-gray-50 rounded-lg p-8">
              <p className="text-lg text-gray-700 font-medium">
                Eco Bắc Giang xin chân thành cảm ơn sự tin tưởng và đồng hành của Quý khách!
              </p>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
