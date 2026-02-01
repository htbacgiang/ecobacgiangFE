import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';

export default function VideoHero({
  videoSrc = '/eco-farm.mp4',
  fallbackImage = '/images/farm-fallback.jpg',
  observerThreshold = 0.5,
}) {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true); // Track play state
  const [isMuted, setIsMuted] = useState(true); // Track mute state

  // Toggle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {
          console.error('Video playback failed');
          setVideoError(true);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Toggle mute/unmute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Intersection Observer to handle play/pause based on visibility
  useEffect(() => {
    const section = sectionRef.current; // Copy sectionRef.current
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (videoRef.current) {
          if (entry.isIntersecting && isPlaying && !videoError) {
            videoRef.current.play().catch(() => {
              console.error('Video playback failed');
              setVideoError(true);
            });
          } else {
            videoRef.current.pause();
          }
        }
      },
      { threshold: observerThreshold }
    );
  
    if (section) {
      observer.observe(section);
    }
  
    return () => {
      if (section) {
        observer.unobserve(section);
      }
    };
  }, [isPlaying, videoError, observerThreshold]);

  return (
    <section
      ref={sectionRef}
      className="container mx-auto relative overflow-hidden mb-6 bg-gradient-to-br from-green-50 via-white to-green-50"
      aria-labelledby="video-hero-heading"
      lang="vi"
    >
      <div className="container mx-auto pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6 order-2 lg:order-1">
            <div className="inline-block">
              <p className="text-green-600 font-bold uppercase tracking-wider text-sm mb-2 px-3 py-1 bg-green-100 rounded-full">
                NÔNG TRẠI ECO BẮC GIANG
              </p>
            </div>
            <h2
              id="video-hero-heading"
              className="text-2xl md:text-4xl  font-bold leading-tight text-gray-900"
            >
              Hành Trình Hữu Cơ Từ Trang Trại Đến Bàn Ăn
            </h2>
            <p className="text-gray-700 text-base md:text-lg leading-relaxed">
              Khám phá quy trình canh tác tự nhiên, thu hoạch tươi sạch và giao tận tay
              người tiêu dùng. Chúng tôi cam kết chất lượng và bền vững.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 rounded-lg">
                <span className="text-green-600 font-semibold text-sm">✓</span>
                <span className="text-gray-700 font-medium text-sm">Tươi sạch</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 rounded-lg">
                <span className="text-green-600 font-semibold text-sm">✓</span>
                <span className="text-gray-700 font-medium text-sm">An toàn</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 rounded-lg">
                <span className="text-green-600 font-semibold text-sm">✓</span>
                <span className="text-gray-700 font-medium text-sm">Chất lượng</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 rounded-lg">
                <span className="text-green-600 font-semibold text-sm">✓</span>
                <span className="text-gray-700 font-medium text-sm">Thân thiện môi trường</span>
              </div>
            </div>
          </div>

          {/* Video Section */}
          <div className="relative order-1 lg:order-2">
            <div className="relative w-full rounded-xl overflow-hidden shadow-xl bg-gray-900">
              {videoError ? (
                <div className="relative w-full aspect-video">
                  <Image
                    src={fallbackImage}
                    alt="Cảnh trang trại hữu cơ Eco Bắc Giang"
                    fill
                    style={{ objectFit: 'cover' }}
                    quality={75}
                    loading="lazy"
                    className="rounded-xl"
                  />
                </div>
              ) : (
                <div className="relative w-full">
                  <video
                    ref={videoRef}
                    className="w-full h-auto rounded-xl"
                    src={videoSrc}
                    autoPlay
                    muted={isMuted}
                    loop
                    playsInline
                    preload="metadata"
                    tabIndex={0}
                    title="Video giới thiệu nông trại Eco Bắc Giang"
                    aria-label="Video giới thiệu nông trại Eco Bắc Giang"
                    onError={() => setVideoError(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        togglePlay();
                      }
                    }}
                  />
                  {/* Controls Overlay */}
                  <div className="absolute bottom-4 right-4 flex space-x-2 z-10">
                    <button
                      onClick={togglePlay}
                      className="bg-black bg-opacity-70 hover:bg-opacity-90 text-white p-3 rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
                      aria-label={isPlaying ? "Tạm dừng video" : "Phát video"}
                    >
                      <span className="text-lg">
                        {isPlaying ? "❚❚" : "▶"}
                      </span>
                    </button>
                    <button
                      onClick={toggleMute}
                      className="bg-black bg-opacity-70 hover:bg-opacity-90 text-white p-3 rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
                      aria-label={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
                    >
                      <span className="text-lg">
                        {isMuted ? "🔇" : "🔊"}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

VideoHero.propTypes = {
  videoSrc: PropTypes.string.isRequired,
  fallbackImage: PropTypes.string.isRequired,
  observerThreshold: PropTypes.number,
};