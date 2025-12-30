import DefaultLayout from "../../components/layout/DefaultLayout";
import Head from "next/head";
import Link from "next/link";

export default function TermsOfService() {
  return (
    <DefaultLayout>
      <Head>
        <title>Điều khoản sử dụng - Eco Bắc Giang</title>
        <meta
          name="description"
          content="Điều khoản sử dụng dịch vụ tại Eco Bắc Giang. Quy định và điều kiện khi sử dụng website và ứng dụng của chúng tôi."
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
              ĐIỀU KHOẢN SỬ DỤNG
            </h1>
            <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg mx-auto text-left">
              <p className="text-lg text-gray-700 leading-relaxed">
                Chào mừng bạn đến với Eco Bắc Giang. Bằng việc truy cập và sử dụng website ecobacgiang.vn và ứng dụng di động &quot;Eco Bắc Giang&quot;, 
                bạn đồng ý tuân thủ các điều khoản và điều kiện sau đây.
              </p>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            {/* Section 1: Chấp nhận điều khoản */}
            <section className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                1. CHẤP NHẬN ĐIỀU KHOẢN
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Khi truy cập và sử dụng các dịch vụ của Eco Bắc Giang (bao gồm Website ecobacgiang.vn và Ứng dụng di động &quot;Eco Bắc Giang&quot;), 
                bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý tuân thủ tất cả các điều khoản và điều kiện được nêu trong tài liệu này.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng không sử dụng dịch vụ của chúng tôi.
              </p>
            </section>

            {/* Section 2: Định nghĩa */}
            <section className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                2. ĐỊNH NGHĨA
              </h2>
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">• &quot;Chúng tôi&quot;, &quot;Eco Bắc Giang&quot;:</h3>
                  <p className="text-gray-700">Chỉ Hợp tác xã Nông nghiệp thông minh Eco Bắc Giang, đơn vị vận hành website và ứng dụng.</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">• &quot;Bạn&quot;, &quot;Người dùng&quot;, &quot;Khách hàng&quot;:</h3>
                  <p className="text-gray-700">Chỉ bất kỳ cá nhân hoặc tổ chức nào truy cập và sử dụng dịch vụ của chúng tôi.</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">• &quot;Dịch vụ&quot;:</h3>
                  <p className="text-gray-700">Bao gồm tất cả các tính năng, nội dung và dịch vụ được cung cấp trên website và ứng dụng của Eco Bắc Giang.</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">• &quot;Sản phẩm&quot;:</h3>
                  <p className="text-gray-700">Chỉ các sản phẩm nông sản hữu cơ được bán trên nền tảng của Eco Bắc Giang.</p>
                </div>
              </div>
            </section>

            {/* Section 3: Điều kiện sử dụng */}
            <section className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                3. ĐIỀU KIỆN SỬ DỤNG
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">3.1. Độ tuổi và năng lực pháp lý:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Bạn phải đủ 18 tuổi trở lên hoặc có sự đồng ý của người giám hộ hợp pháp để sử dụng dịch vụ.</li>
                    <li>Bạn phải có đầy đủ năng lực pháp lý để thực hiện các giao dịch mua bán.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">3.2. Tài khoản người dùng:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình.</li>
                    <li>Bạn không được chia sẻ tài khoản với người khác.</li>
                    <li>Bạn phải thông báo ngay cho chúng tôi nếu phát hiện việc sử dụng trái phép tài khoản.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">3.3. Sử dụng hợp pháp:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Bạn chỉ được sử dụng dịch vụ cho mục đích hợp pháp và phù hợp với các quy định của pháp luật Việt Nam.</li>
                    <li>Bạn không được sử dụng dịch vụ để thực hiện bất kỳ hoạt động gian lận, lừa đảo hoặc vi phạm pháp luật nào.</li>
                    <li>Bạn không được can thiệp, phá hoại hoặc làm gián đoạn hoạt động của hệ thống.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4: Đặt hàng và thanh toán */}
            <section className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                4. ĐẶT HÀNG VÀ THANH TOÁN
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">4.1. Đặt hàng:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Khi đặt hàng, bạn xác nhận rằng tất cả thông tin cung cấp là chính xác và đầy đủ.</li>
                    <li>Đơn hàng chỉ được xác nhận sau khi chúng tôi gửi email/SMS xác nhận.</li>
                    <li>Chúng tôi có quyền từ chối hoặc hủy đơn hàng nếu phát hiện gian lận hoặc vi phạm điều khoản.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">4.2. Giá cả:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Giá sản phẩm được hiển thị trên website/app là giá cuối cùng (đã bao gồm VAT nếu có).</li>
                    <li>Chúng tôi có quyền thay đổi giá sản phẩm bất cứ lúc nào mà không cần thông báo trước.</li>
                    <li>Giá áp dụng là giá tại thời điểm đặt hàng, không áp dụng cho các đơn hàng đã được xác nhận.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">4.3. Thanh toán:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Bạn có thể thanh toán bằng các phương thức: COD, chuyển khoản ngân hàng, ví điện tử.</li>
                    <li>Đối với thanh toán trực tuyến, giao dịch được xử lý qua các cổng thanh toán uy tín và được mã hóa bảo mật.</li>
                    <li>Chúng tôi không lưu trữ thông tin thẻ tín dụng/thẻ ATM của bạn.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 5: Giao hàng */}
            <section className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                5. GIAO HÀNG
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">5.1. Thời gian giao hàng:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Thời gian giao hàng được tính từ khi đơn hàng được xác nhận và thanh toán thành công.</li>
                    <li>Eco Bắc Giang giao hàng vào các ngày Thứ 2, Thứ 4 và Thứ 6 hàng tuần.</li>
                    <li>Thời gian giao hàng có thể thay đổi do điều kiện thời tiết, thiên tai hoặc các sự kiện bất khả kháng.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">5.2. Địa chỉ giao hàng:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Bạn chịu trách nhiệm cung cấp địa chỉ giao hàng chính xác và đầy đủ.</li>
                    <li>Nếu địa chỉ không chính xác dẫn đến không giao được hàng, bạn sẽ chịu phí vận chuyển cho lần giao lại.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">5.3. Nhận hàng:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Bạn cần kiểm tra hàng hóa trước khi ký nhận.</li>
                    <li>Nếu phát hiện hàng hóa bị hư hỏng, thiếu sót, vui lòng từ chối nhận hàng và liên hệ ngay với chúng tôi.</li>
                    <li>Sau khi ký nhận, bạn chịu trách nhiệm về hàng hóa đã nhận.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 6: Đổi trả và hoàn tiền */}
            <section className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                6. ĐỔI TRẢ VÀ HOÀN TIỀN
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Chính sách đổi trả và hoàn tiền được áp dụng theo <Link href="/chinh-sach-doi-tra" className="text-green-600 hover:text-green-700 underline">Chính sách đổi trả</Link> của Eco Bắc Giang.
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  <strong>Lưu ý:</strong> Đối với sản phẩm rau tươi, bạn cần phản hồi trong vòng 24 giờ kể từ khi nhận hàng để được hỗ trợ đổi trả.
                </p>
              </div>
            </section>

            {/* Section 7: Quyền sở hữu trí tuệ */}
            <section className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                7. QUYỀN SỞ HỮU TRÍ TUỆ
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">7.1. Nội dung website/app:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Tất cả nội dung trên website và ứng dụng (bao gồm văn bản, hình ảnh, logo, video, thiết kế) đều thuộc quyền sở hữu của Eco Bắc Giang hoặc được cấp phép sử dụng.</li>
                    <li>Bạn không được sao chép, phân phối, sửa đổi hoặc sử dụng nội dung này cho mục đích thương mại mà không có sự đồng ý bằng văn bản của chúng tôi.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">7.2. Thương hiệu:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Logo, tên thương hiệu &quot;Eco Bắc Giang&quot; là tài sản trí tuệ của chúng tôi.</li>
                    <li>Bạn không được sử dụng các thương hiệu này mà không có sự cho phép.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 8: Miễn trừ trách nhiệm */}
            <section className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                8. MIỄN TRỪ TRÁCH NHIỆM
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">8.1. Sự cố kỹ thuật:</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Chúng tôi không chịu trách nhiệm cho bất kỳ thiệt hại nào phát sinh do sự cố kỹ thuật, lỗi hệ thống, 
                    gián đoạn dịch vụ hoặc các vấn đề ngoài tầm kiểm soát của chúng tôi.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">8.2. Thông tin sản phẩm:</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Mặc dù chúng tôi cố gắng cung cấp thông tin chính xác về sản phẩm, nhưng không đảm bảo rằng 
                    tất cả thông tin đều hoàn toàn chính xác hoặc đầy đủ. Hình ảnh sản phẩm chỉ mang tính chất minh họa.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">8.3. Liên kết bên thứ ba:</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Website/app có thể chứa các liên kết đến website của bên thứ ba. Chúng tôi không chịu trách nhiệm 
                    về nội dung, chính sách bảo mật hoặc thực hành của các website này.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 9: Giới hạn trách nhiệm */}
            <section className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                9. GIỚI HẠN TRÁCH NHIỆM
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Trong phạm vi tối đa được pháp luật cho phép, trách nhiệm của Eco Bắc Giang đối với bạn sẽ không vượt quá 
                giá trị của đơn hàng mà bạn đã thanh toán.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Chúng tôi không chịu trách nhiệm cho bất kỳ thiệt hại gián tiếp, ngẫu nhiên, đặc biệt hoặc hậu quả nào 
                phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ của chúng tôi.
              </p>
            </section>

            {/* Section 10: Bồi thường */}
            <section className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                10. BỒI THƯỜNG
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Bạn đồng ý bồi thường và giữ cho Eco Bắc Giang không bị thiệt hại từ bất kỳ khiếu nại, yêu cầu, 
                thiệt hại, tổn thất, chi phí và phí tổn (bao gồm cả phí luật sư) phát sinh từ:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-4">
                <li>Việc bạn vi phạm các điều khoản sử dụng này.</li>
                <li>Việc bạn vi phạm bất kỳ quyền nào của bên thứ ba.</li>
                <li>Việc bạn sử dụng dịch vụ một cách trái pháp luật hoặc gian lận.</li>
              </ul>
            </section>

            {/* Section 11: Chấm dứt dịch vụ */}
            <section className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                11. CHẤM DỨT DỊCH VỤ
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Chúng tôi có quyền chấm dứt hoặc tạm ngưng quyền truy cập của bạn vào dịch vụ bất cứ lúc nào, 
                mà không cần thông báo trước, nếu bạn vi phạm các điều khoản sử dụng này hoặc có hành vi 
                không phù hợp với quy định của pháp luật.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Bạn cũng có quyền chấm dứt việc sử dụng dịch vụ bất cứ lúc nào bằng cách xóa tài khoản của mình.
              </p>
            </section>

            {/* Section 12: Thay đổi điều khoản */}
            <section className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                12. THAY ĐỔI ĐIỀU KHOẢN
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Chúng tôi có quyền cập nhật, sửa đổi các điều khoản sử dụng này bất cứ lúc nào. 
                Các thay đổi sẽ có hiệu lực ngay sau khi được đăng tải trên website/app.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Việc bạn tiếp tục sử dụng dịch vụ sau khi các điều khoản được cập nhật được coi là 
                bạn đã đồng ý với các thay đổi đó. Vui lòng thường xuyên kiểm tra trang này để cập nhật các thay đổi.
              </p>
            </section>

            {/* Section 13: Luật áp dụng */}
            <section className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                13. LUẬT ÁP DỤNG VÀ GIẢI QUYẾT TRANH CHẤP
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">13.1. Luật áp dụng:</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Các điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Mọi tranh chấp phát sinh 
                    sẽ được giải quyết theo quy định của pháp luật Việt Nam.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">13.2. Giải quyết tranh chấp:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Trước tiên, các bên sẽ cố gắng giải quyết tranh chấp thông qua thương lượng, hòa giải.</li>
                    <li>Nếu không thể giải quyết, tranh chấp sẽ được đưa ra giải quyết tại Tòa án có thẩm quyền tại Bắc Giang, Việt Nam.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 14: Liên hệ */}
            <section className="bg-green-50 rounded-lg p-8 border border-green-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                14. LIÊN HỆ
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Nếu bạn có bất kỳ câu hỏi nào về các điều khoản sử dụng này, vui lòng liên hệ với chúng tôi:
              </p>
              
              <div className="bg-white rounded-lg p-6 space-y-3">
                <div className="flex items-start">
                  <strong className="min-w-[180px] text-gray-900">Đơn vị quản lý:</strong>
                  <span className="text-gray-700">Hợp tác xã Nông nghiệp thông minh Eco Bắc Giang</span>
                </div>
                <div className="flex items-start">
                  <strong className="min-w-[180px] text-gray-900">Địa chỉ:</strong>
                  <span className="text-gray-700">Tân An, Yên Dũng, Bắc Giang.</span>
                </div>
                <div className="flex items-center">
                  <strong className="min-w-[180px] text-gray-900">Hotline:</strong>
                  <span className="text-green-700 font-semibold text-lg">0866.572.271</span>
                </div>
                <div className="flex items-center">
                  <strong className="min-w-[180px] text-gray-900">Email:</strong>
                  <span className="text-gray-700">lienhe@ecobacgiang.vn</span>
                </div>
              </div>
            </section>

            {/* Footer Message */}
            <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-8 border-2 border-green-200">
              <p className="text-lg text-gray-700 leading-relaxed">
                <strong>Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của Eco Bắc Giang!</strong>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}

