import React, { useState, useEffect } from "react";
import Image from "next/image";

const VisionComponent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className=" overflow-hidden">
      <div className="mt-6">
        <div className=" mb-12">
        <h2 className="md:text-2xl text-xl font-bold text-green-800 mb-2">1. Tầm Nhìn</h2>
          <p className={`text-base text-gray-600 m mx-auto transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Định hướng phát triển tương lai của Eco Bắc Giang trong lĩnh vực nông nghiệp thông minh và bền vững
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <div className={`relative transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video">
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 to-transparent z-10"></div>
              <Image
                src="/images/2.jpg"
                alt="Tầm nhìn Eco Bắc Giang"
                fill
                className="object-cover rounded-2xl"
              />
              
              {/* Overlay Content */}
              <div className="absolute bottom-1 left-6 right-6 z-20">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-white/20">
                  <div className="text-center">
                    <h3 className="text-lg md:text-xl font-bold text-green-700 font-heading">
                      Tương Lai Xanh
                    </h3>
                    <p className="text-gray-700 text-base">
                      Hướng tới Net Zero 2050
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-6">
            {[
              {
                title: "Thương Hiệu Dẫn Đầu",
                content: "Eco Bắc Giang hướng tới trở thành thương hiệu dẫn đầu trong lĩnh vực nông nghiệp thông minh và sản xuất hữu cơ bền vững tại Việt Nam."
              },
              {
                title: "Kinh Tế Xanh",
                content: "Chúng tôi cam kết phát triển mô hình kinh tế xanh, tôn trọng quy luật tự nhiên, đồng thời góp phần vào mục tiêu Net Zero 2050."
              },
              {
                title: "Nông Nghiệp Bền Vững",
                content: "Bằng việc ứng dụng công nghệ hiện đại, chúng tôi mong muốn xây dựng một nền nông nghiệp bền vững, hài hòa giữa lợi ích kinh tế, trách nhiệm xã hội và bảo vệ môi trường."
              }
            ].map((item, index) => (
              <div 
                key={index}
                className={`flex items-start space-x-4 p-6 bg-white/70 backdrop-blur-base rounded-xl shadow-lg transition-all duration-1000 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                }`}
                style={{ transitionDelay: `${900 + index * 200}ms` }}
              >
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2 font-heading">{item.title}</h3>
                  <p className="text-gray-600 text-base leading-relaxed">
                    {item.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisionComponent;
