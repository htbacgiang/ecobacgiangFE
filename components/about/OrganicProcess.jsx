import Image from "next/image";

const OrganicProcess = () => {
  return (
    <section className="bg-white py-4">
      <div className="container mx-auto px-4 md:px-0">
        {/* Phần tiêu đề */}
        <div className="text-center mb-12">
          <div className="relative mx-auto md:w-2/5 w-4/5 mb-6 aspect-[4/2]">
            <Image
              src="/images/4.webp"
              alt="Sản phẩm hữu cơ và tinh khiết"
              fill
              className="object-contain"
            />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Quy Trình Hữu Cơ
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Khám phá quy trình sản xuất hữu cơ chất lượng cao của chúng tôi
          </p>
        </div>

        {/* Phần quy trình */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Bước 1 */}
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto bg-green-50 rounded-full flex items-center justify-center relative">
                <Image
                  src="/images/step-1.webp"
                  alt="Lên kế hoạch"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
              Lên kế hoạch
            </h3>
            <p className="text-gray-600 text-center leading-relaxed text-sm">
              Lập kế hoạch chi tiết cho quy trình canh tác hữu cơ để đảm bảo
              hiệu quả tối ưu.
            </p>
          </div>

          {/* Bước 2 */}
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto bg-green-50 rounded-full flex items-center justify-center relative">
                <Image
                  src="/images/step-2.webp"
                  alt="Ươm mầm"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
              Ươm mầm
            </h3>
            <p className="text-gray-600 text-center leading-relaxed text-sm">
              Gieo hạt và chăm sóc cây non với kỹ thuật hữu cơ để đảm bảo
              phát triển tốt nhất.
            </p>
          </div>

          {/* Bước 3 */}
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto bg-green-50 rounded-full flex items-center justify-center relative">
                <Image
                  src="/images/step-1.webp"
                  alt="Đảm bảo chất lượng"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
              Kiểm soát chất lượng
            </h3>
            <p className="text-gray-600 text-center leading-relaxed text-sm">
              Kiểm tra kỹ lưỡng chất lượng sản phẩm trong từng giai đoạn
              sản xuất.
            </p>
          </div>

          {/* Bước 4 */}
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto bg-green-50 rounded-full flex items-center justify-center relative">
                <Image
                  src="/images/step-3.webp"
                  alt="Tiếp thị"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                4
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
              Marketing
            </h3>
            <p className="text-gray-600 text-center leading-relaxed text-sm">
              Đưa sản phẩm ra thị trường với các chiến lược tiếp thị hiệu quả
              và bền vững.
            </p>
          </div>
        </div>

        {/* Connecting lines for desktop */}
        <div className="hidden lg:block relative mt-12">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-green-200 transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/4 w-0.5 h-8 bg-green-300 transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-0.5 h-8 bg-green-300 transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-3/4 w-0.5 h-8 bg-green-300 transform -translate-y-1/2"></div>
        </div>
      </div>
    </section>
  );
};

export default OrganicProcess;
