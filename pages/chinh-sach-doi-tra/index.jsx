import DefaultLayout from "../../components/layout/DefaultLayout";
import Head from "next/head";

export default function ReturnPolicy() {
  return (
    <DefaultLayout>
      <Head>
        <title>Chính sách đổi trả - Eco Bắc Giang</title>
        <meta
          name="description"
          content="Chính sách đổi trả hàng tại Eco Bắc Giang. Quy định và điều kiện đổi trả sản phẩm một cách công bằng và minh bạch."
        />
      </Head>

      {/* Header Spacer */}
      <div className="h-[80px] bg-gradient-to-r from-gray-50 to-gray-100"></div>

      {/* Main Content */}
      <div className="bg-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Chính sách đổi trả và hoàn tiền
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
              Tại Eco Bắc Giang, sự hài lòng của Quý khách là thước đo thành công của chúng tôi.
            </p>
            <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg mx-auto text-left">
              <p className="text-gray-700 leading-relaxed">
                Chúng tôi hiểu rằng rau củ hữu cơ là mặt hàng &quot;nhạy cảm&quot;, dễ bị ảnh hưởng bởi thời tiết và vận chuyển. 
                Vì vậy, Eco Bắc Giang xây dựng chính sách đổi trả minh bạch và linh hoạt, với tinh thần 
                <strong className="text-green-700"> &quot;Thà chịu thiệt chứ không để Khách hàng chịu thiệt&quot;</strong>.
              </p>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            {/* Section 1 */}
            <section className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. Điều kiện đổi trả
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Quý khách có thể yêu cầu đổi trả hoặc hoàn tiền trong các trường hợp sau:
              </p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    A. Lỗi từ phía Eco Bắc Giang hoặc Đơn vị vận chuyển:
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Rau củ bị dập nát, hư hỏng, héo úa, chảy nước khi nhận hàng.</li>
                    <li>Sản phẩm có dấu hiệu bị sâu bệnh bên trong (mà mắt thường không thấy khi sơ chế) hoặc chất lượng không đúng như cam kết (ví dụ: quả bị sượng, đắng bất thường).</li>
                    <li>Giao sai loại rau hoặc thiếu sản phẩm so với đơn đặt hàng.</li>
                    <li>Sản phẩm hết hạn sử dụng (đối với các sản phẩm sơ chế đóng gói có ghi hạn dùng).</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    B. Lỗi chủ quan từ Khách hàng:
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Đặt nhầm sản phẩm (Eco Bắc Giang hỗ trợ đổi nếu sản phẩm chưa qua sử dụng và còn nguyên bao bì, tem nhãn. Phí ship đổi trả do Khách hàng chi trả).</li>
                  </ul>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4 rounded">
                    <p className="text-gray-700">
                      <strong>Lưu ý:</strong> Chúng tôi xin phép từ chối đổi trả đối với các sản phẩm rau tươi nếu Quý khách bảo quản không đúng cách sau khi nhận hàng quá 24h.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. Thời gian yêu cầu đổi trả
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    <strong>Đối với Rau ăn lá (Xà lách, Cải...):</strong> Quý khách vui lòng kiểm tra và phản hồi trong vòng <strong className="text-green-700">24 giờ</strong> kể từ khi nhận hàng.
                  </p>
                </div>
                <div>
                  <p className="text-gray-700 leading-relaxed">
                    <strong>Đối với Củ quả (Khoai tây, Bí đỏ...) & Đồ khô:</strong> Quý khách có thể phản hồi trong vòng <strong className="text-green-700">03 ngày</strong> kể từ khi nhận hàng.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. Quy trình đổi trả & Hoàn tiền
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Để được hỗ trợ nhanh nhất, Quý khách vui lòng thực hiện theo các bước sau:
              </p>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-4 mt-1">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Bước 1: Chụp ảnh/Quay video</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Quý khách vui lòng chụp ảnh hoặc quay video rõ nét tình trạng rau củ bị lỗi và hóa đơn mua hàng (hoặc mã đơn hàng trên App).
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-4 mt-1">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Bước 2: Gửi yêu cầu</h3>
                    <p className="text-gray-700 leading-relaxed mb-2">
                      Gửi thông tin qua các kênh sau:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Zalo/Hotline: <strong>0969.079.673</strong></li>
                      <li>Tính năng &quot;Phản hồi&quot; trên App Eco Bắc Giang</li>
                      <li>Fanpage: Eco Bắc Giang</li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-4 mt-1">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Bước 3: Xác nhận & Xử lý</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Nhân viên CSKH của Eco Bắc Giang sẽ tiếp nhận, xác minh và phản hồi ngay lập tức (trong giờ hành chính) hoặc chậm nhất trong vòng <strong className="text-green-700">2h làm việc</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Phương án đền bù
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Sau khi xác nhận lỗi thuộc về Eco Bắc Giang, chúng tôi sẽ đưa ra các phương án giải quyết để Quý khách lựa chọn:
              </p>
              
              <div className="space-y-6">
                <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Phương án 1: Đổi sản phẩm mới (Khuyên dùng)
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    Chúng tôi sẽ gửi bù phần rau củ mới cùng loại (chất lượng tốt nhất) vào chuyến giao hàng sớm nhất hoặc gộp vào đơn hàng kế tiếp của Quý khách.
                  </p>
                  <p className="text-gray-700 leading-relaxed font-semibold text-green-700">
                    Đặc biệt: Tặng thêm một bó rau gia vị hoặc sản phẩm dùng thử thay lời xin lỗi chân thành.
                  </p>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Phương án 2: Hoàn tiền 100%
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Hoàn lại đúng số tiền tương ứng với giá trị sản phẩm bị lỗi.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-2 font-semibold">
                    Hình thức hoàn tiền:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Chuyển khoản ngân hàng (trong vòng 24h).</li>
                    <li>Hoàn tiền vào Ví tích điểm trên App Eco Bắc Giang để trừ vào đơn hàng sau (cộng thêm <strong className="text-green-700">10% giá trị</strong> coi như phí bồi thường tinh thần).</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Founder Commitment */}
            <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-8 border-2 border-green-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Lời cam kết từ Founder
              </h2>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <p className="text-gray-700 leading-relaxed italic text-lg mb-4">
                  &quot;Chúng tôi làm nông nghiệp tử tế, không chỉ là trồng rau sạch, mà còn là cách cư xử sạch. 
                  Mọi sai sót (nếu có) đều là cơ hội để Eco Bắc Giang hoàn thiện hơn. 
                  Xin Quý khách đừng ngần ngại phản hồi, chúng tôi luôn lắng nghe và chịu trách nhiệm đến cùng.&quot;
                </p>
              
              </div>
            </section>

            {/* Contact Section */}
            <section className="bg-green-50 rounded-lg p-8 border border-green-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Liên hệ hỗ trợ
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Mọi thắc mắc, xin vui lòng liên hệ:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <strong className="min-w-[100px]">Hotline:</strong>
                  <span className="text-green-700 font-semibold">0969.079.673</span>
                </li>
                <li className="flex items-center">
                  <strong className="min-w-[100px]">Email:</strong>
                  <span>lienhe@ecobacgiang.vn</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}

