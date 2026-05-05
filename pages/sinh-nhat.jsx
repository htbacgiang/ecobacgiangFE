import React, { useCallback, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cake, X } from 'lucide-react';
import Image from 'next/image';
import Head from 'next/head';

// Danh sách ảnh và lời chúc – bạn thay URL bằng ảnh thực trong /public/sn-huyen/
const BIRTHDAY_IMAGES = [
  { url: '/anh-sn-huyen-1.jpg', message: '🌸 Chúc Huyền sinh nhật thật vui, luôn rạng rỡ và xinh đẹp mỗi ngày!' },
  { url: '/anh-sn-huyen-2.jpg', message: '✨ Tuổi mới thật nhiều điều tuyệt vời đang đợi Huyền phía trước!' },
  { url: '/anh-sn-huyen-3.jpg', message: '💖 Chúc Huyền luôn hạnh phúc, sức khỏe dồi dào và vui vẻ mỗi ngày!' },
  { url: '/anh-sn-huyen-4.jpg', message: '🎂 Sinh nhật chỉ có một lần trong năm – chúc Huyền tận hưởng thật trọn vẹn!' },
  { url: '/anh-sn-huyen-5.jpg', message: '🌿 Mong Huyền luôn giữ nụ cười tươi và tâm hồn nhẹ nhàng như mùa xuân!' },
  { url: '/anh-sn-huyen-6.jpg', message: '🎀 Huyền xứng đáng nhận được mọi điều tốt đẹp nhất trên đời này!' },
  { url: '/anh-sn-huyen-7.jpg', message: '💕 Chúc Huyền mãi trẻ đẹp, rạng rỡ và ngập tràn niềm vui!' },
  { url: '/anh-sn-huyen-8.jpg', message: '🍀 Tuổi mới bình an, luôn vui vẻ và gặp nhiều may mắn!' },
];

// Sinh ra một "hạt" rơi – có thể là ảnh hoặc emoji
function createFallingItem(id) {
  const isImage = Math.random() > 0.4 && BIRTHDAY_IMAGES.length > 0;
  const imageData = isImage ? BIRTHDAY_IMAGES[Math.floor(Math.random() * BIRTHDAY_IMAGES.length)] : null;
  const emojis = ['🌸', '✨', '💖', '🎂', '🎀', '🌷', '🎊', '💐', '🌺', '🎁', '⭐', '🌟'];
  // Kích thước ngẫu nhiên: ưu tiên nhỏ và vừa, bớt ảnh to khổng lồ
  const sizeRand = Math.random();
  const imageSize = sizeRand < 0.5
    ? 45 + Math.random() * 25        // nhỏ: 45–70px (50%)
    : sizeRand < 0.85
      ? 70 + Math.random() * 20      // vừa: 70–90px (35%)
      : 80 + Math.random() * 30;     // to: 90–120px (15%)
  const emojiSize = sizeRand < 0.5
    ? 18 + Math.random() * 10        // nhỏ: 18–28px
    : sizeRand < 0.85
      ? 28 + Math.random() * 12      // vừa: 28–40px
      : 40 + Math.random() * 15;     // to: 40–55px

  const hintColors = ['#D4537E', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#F39C12', '#E74C3C', '#9B59B6', '#3498DB', '#1ABC9C'];
  const hintColor = hintColors[Math.floor(Math.random() * hintColors.length)];

  return {
    id,
    isImage,
    imageData,
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
    left: (() => { const zone = id % 7; const zw = 88 / 7; return zone * zw + 2 + Math.random() * zw * 0.7; })(),
    delay: 0,                        // s - rơi ngay lập tức
    duration: 25 + Math.random() * 20, // s – chậm: 25–45s
    size: isImage ? imageSize : emojiSize,
    rotate: (Math.random() - 0.5) * 30,
    swayAmount: (Math.random() - 0.5) * 30,
    pulseDuration: 1.5 + Math.random() * 1.5,
    pulseDelay: -(Math.random() * 2),
    showHint: isImage && Math.random() < 0.25, // 25% cơ hội hiện chữ
    hintColor,
  };
}

const BirthdayPage = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Falling items state
  const [fallingItems, setFallingItems] = useState([]);
  const fallingTimerRef = useRef(null);
  const itemCleanupRefs = useRef([]);
  const itemCountRef = useRef(0);
  const hasTriggeredRef = useRef(false);

  // Modal state
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState('');

  const toggleAudio = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log('Audio error:', e));
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.pause();
    };
  }, []);

  // Spawn liên tục, mỗi ảnh tự cleanup sau khi rơi xong
  const startFallingEffect = useCallback(() => {
    if (fallingTimerRef.current) return; // đang chạy rồi thì không start lại

    const spawnOne = () => {
      const newItem = createFallingItem(itemCountRef.current++);
      setFallingItems(prev => [...prev, newItem]);
      // Cleanup sau khi animation kết thúc + 1s buffer (lúc này ảnh đã ra khỏi màn hình)
      const cleanupT = setTimeout(() => {
        setFallingItems(items => items.filter(i => i.id !== newItem.id));
      }, (newItem.duration + 1) * 1000);
      itemCleanupRefs.current.push(cleanupT);
    };

    spawnOne();
    fallingTimerRef.current = setInterval(spawnOne, 3000);
  }, []);

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      if (fallingTimerRef.current) clearInterval(fallingTimerRef.current);
      itemCleanupRefs.current.forEach(t => clearTimeout(t));
    };
  }, []);

  const handleConfetti = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const confettiModule = await import('canvas-confetti');
    const confetti = confettiModule.default;
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 28, spread: 340, ticks: 60, zIndex: 9999 };
    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) { window.clearInterval(interval); return; }
      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        colors: ['#F4C0D1', '#ED93B1', '#FBEAF0', '#C0DD97', '#9FE1CB'],
        origin: { x: Math.random(), y: Math.random() - 0.2 },
      });
    }, 250);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const confettiTimer = window.setTimeout(() => {
      if (!hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        handleConfetti();
        startFallingEffect();
      }
    }, 1500);

    return () => {
      window.clearTimeout(confettiTimer);
    };
  }, [handleConfetti, startFallingEffect]);

  const wishes = [
    { emoji: '🌸', label: 'Luôn luôn xinh đẹp' },
    { emoji: '✨', label: 'Vui vẻ mỗi ngày' },
    { emoji: '🌿', label: 'Sức khỏe dồi dào' },
    { emoji: '💖', label: 'Hạnh phúc' },
  ];

  return (
    <>
      <Head>
        <title>Happy Birthday – Huyền 🎂</title>
        <meta name="description" content="Chúc mừng sinh nhật Huyền – Món quà nhỏ từ Trường!" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Be+Vietnam+Pro:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </Head>

      <style>{`
        @keyframes musicBounce {
          from { height: 4px; }
          to { height: 16px; }
        }
        .music-bar-line {
          animation: musicBounce 0.8s ease-in-out infinite alternate;
        }
        @keyframes fallDown {
          0% { transform: translateY(-120px) rotate(var(--rotate-start)); opacity: 0; }
          8% { opacity: 1; }
          100% { transform: translateY(115vh) translateX(var(--sway)) rotate(var(--rotate-end)); opacity: 1; }
        }
        @keyframes pulseImage {
          0% { transform: scale(0.92); box-shadow: 0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.4); }
          100% { transform: scale(1.08); box-shadow: 0 0 20px rgba(255,255,255,1), 0 0 40px rgba(255,255,255,0.8); }
        }
        .falling-item {
          position: fixed;
          top: 0;
          pointer-events: auto;
          z-index: 8000;
          cursor: pointer;
          animation: fallDown var(--duration) var(--delay) linear forwards;
        }
        .falling-item img {
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.98);
          box-shadow: 0 0 15px rgba(255, 255, 255, 1), 0 0 30px rgba(255, 255, 255, 0.6);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          width: 100%;
          height: 100%;
          object-fit: cover;
          animation: pulseImage var(--pulse-duration, 2s) ease-in-out infinite alternate;
          animation-delay: var(--pulse-delay, 0s);
        }
        .falling-item:hover img {
          transform: scale(1.15) !important;
        }
        .falling-emoji {
          position: fixed;
          top: 0;
          pointer-events: none;
          z-index: 7999;
          animation: fallDown var(--duration) var(--delay) linear forwards;
          user-select: none;
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.88); }
          to { opacity: 1; transform: scale(1); }
        }
        .modal-content-inner {
          animation: modalIn 0.3s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes hintBounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(4px); }
        }
        .falling-hint {
          position: absolute;
          top: calc(100% + 12px);
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.95);
          color: #D4537E;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(212,83,126,0.25);
          pointer-events: none;
          animation: hintBounce 1.5s ease-in-out infinite;
          border: 1px solid #fbeaf0;
        }
        .falling-hint::before {
          content: '';
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 0 5px 5px 5px;
          border-style: solid;
          border-color: transparent transparent rgba(255, 255, 255, 0.95) transparent;
        }
      `}</style>

      {/* Falling items overlay */}
      {fallingItems.map(item => (
        item.isImage ? (
          <div
            key={item.id}
            className="falling-item"
            style={{
              left: `${item.left}vw`,
              width: item.size,
              height: item.size,
              '--duration': `${item.duration}s`,
              '--delay': `${item.delay}s`,
              '--rotate-start': `${item.rotate}deg`,
              '--rotate-end': `${item.rotate + 20}deg`,
              '--sway': `${item.swayAmount}px`,
              '--pulse-duration': `${item.pulseDuration}s`,
              '--pulse-delay': `${item.pulseDelay}s`,
            }}
            onClick={() => {
              setSelectedImage(item.imageData.url);
              setSelectedMessage(item.imageData.message);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageData.url}
              alt="birthday"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            />
            {item.showHint && (
              <span className="falling-hint" style={{ color: item.hintColor }}>
                Huyền click vô ảnh nhé!
              </span>
            )}
          </div>
        ) : (
          <span
            key={item.id}
            className="falling-emoji"
            style={{
              left: `${item.left}vw`,
              fontSize: item.size,
              '--duration': `${item.duration}s`,
              '--delay': `${item.delay}s`,
              '--rotate-start': `${item.rotate}deg`,
              '--rotate-end': `${item.rotate + 15}deg`,
              '--sway': `${item.swayAmount}px`,
            }}
          >
            {item.emoji}
          </span>
        )
      ))}

      {/* Modal popup khi click ảnh */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 z-[9000] flex items-center justify-center p-4"
            style={{ backdropFilter: 'blur(12px)', background: 'rgba(10,5,20,0.55)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setSelectedImage(null); setSelectedMessage(''); }}
          >
            <motion.div
              className="relative max-w-lg w-full flex flex-col items-center gap-4"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Ảnh */}
              <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-[#F4C0D1]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedImage}
                  alt="Ảnh sinh nhật"
                  style={{ width: '100%', maxHeight: '60vh', objectFit: 'contain', display: 'block' }}
                />
                <button
                  onClick={() => { setSelectedImage(null); setSelectedMessage(''); }}
                  className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white text-gray-800 flex items-center justify-center shadow-lg hover:bg-[#fbeaf0] hover:scale-110 transition-all z-10"
                  aria-label="Đóng"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Lời chúc */}
              {selectedMessage && (
                <div className="w-full bg-gradient-to-r from-[#D4537E] via-[#993556] to-[#BA55D3] px-5 py-4 rounded-2xl shadow-2xl">
                  <p className="text-white text-sm md:text-base font-medium text-center leading-relaxed font-['Be_Vietnam_Pro',sans-serif]">
                    {selectedMessage}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-[#fdf6f9] flex items-center justify-center px-4 relative font-['Be_Vietnam_Pro',sans-serif]">
        <div className="fixed inset-0 z-0 bg-[radial-gradient(#f4c0d1_1px,transparent_1px)] bg-[size:28px_28px] opacity-40 pointer-events-none" />

        <div className="relative z-10 w-full max-w-[540px] flex flex-col items-center gap-5 my-10">
          <motion.div
            className="w-full bg-white rounded-3xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_32px_rgba(0,0,0,0.08)] border border-[#f4c0d1]"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Hero image */}
            <div className="relative h-[300px] w-full bg-[#fbeaf0] overflow-hidden">
              <Image
                src="/anh-sn-huyen.jpg"
                alt="Happy Birthday Huyền"
                fill
                sizes="(max-width: 640px) 100vw, 560px"
                className="object-cover object-center"
                priority
              />
              <div className="absolute inset-0 z-10" />
              <motion.span
                className="absolute bottom-4 right-5 text-5xl leading-none z-20 drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 220 }}
              >
              </motion.span>
            </div>

            {/* Content */}
            <div className="px-6 py-3 pb-4 sm:p-8 sm:pb-9">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="block w-max mx-auto text-center py-3 px-3.5 bg-[#fbeaf0] border border-[#f4c0d1] rounded-full text-[#993556] text-xs font-medium tracking-wide mb-4">
                  🎉 Chúc mừng sinh nhật
                </span>

                <h1 className="font-['Playfair_Display',serif] text-center text-xl mb-1 font-bold text-gray-900 leading-[1.2] tracking-tight">
                  Happy Birthday,
                  <span className="text-[#D4537E]"> Em gái xinh xinh!</span>
                </h1>

                <p className="text-xl font-bold text-gray-900 text-center ">
                  Nguyễn Thị Huyền · 05/05
                </p>

                <p className="text-[0.925rem] font-light text-gray-600 leading-[1.9] mb-6">
                  Sinh nhật năm nay, chúc Huyền bỏ lại mọi thứ nặng nề, chỉ giữ lại
                  những gì làm mình mỉm cười.
                </p>

                <div className="flex gap-2.5 flex-wrap mb-6">
                  {wishes.map((w, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-1.5 py-1.5 px-3.5 bg-[#fdf6f9] border border-[#f4c0d1] rounded-full"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.35 + i * 0.08 }}
                    >
                      <span className="text-base leading-none">{w.emoji}</span>
                      <span className="text-xs font-medium text-gray-700">{w.label}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Nhạc Phan Đinh Tùng */}
                <div
                  className="flex items-center gap-3 bg-[#fdf6f9] border border-[#f4c0d1] rounded-[40px] py-2.5 px-5 mb-5 cursor-pointer hover:bg-[#fbeaf0] transition-colors"
                  onClick={toggleAudio}
                >
                  <div className="w-8 h-8 rounded-full bg-[#D4537E] text-white flex items-center justify-center text-[10px] shrink-0">
                    {isPlaying ? '⏸' : '▶'}
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-gray-900">Khúc hát mừng sinh nhật</div>
                    <div className="text-[11px] text-gray-400">Phan Đinh Tùng</div>
                  </div>
                  <div className="flex items-end gap-[2px] h-4">
                    {isPlaying ? (
                      <>
                        <span className="block w-[3px] bg-[#D4537E] rounded-[2px] music-bar-line" style={{ height: '8px' }} />
                        <span className="block w-[3px] bg-[#D4537E] rounded-[2px] music-bar-line" style={{ height: '8px', animationDelay: '0.2s' }} />
                        <span className="block w-[3px] bg-[#D4537E] rounded-[2px] music-bar-line" style={{ height: '8px', animationDelay: '0.4s' }} />
                        <span className="block w-[3px] bg-[#D4537E] rounded-[2px] music-bar-line" style={{ height: '8px', animationDelay: '0.1s' }} />
                      </>
                    ) : (
                      <>
                        <span className="block w-[3px] bg-[#D4537E] rounded-[2px]" style={{ height: '4px' }} />
                        <span className="block w-[3px] bg-[#D4537E] rounded-[2px]" style={{ height: '8px' }} />
                        <span className="block w-[3px] bg-[#D4537E] rounded-[2px]" style={{ height: '6px' }} />
                        <span className="block w-[3px] bg-[#D4537E] rounded-[2px]" style={{ height: '4px' }} />
                      </>
                    )}
                  </div>
                </div>

                <audio
                  ref={audioRef}
                  src="/happy-birthday.mp3"
                  loop
                  className="hidden"
                />

                <motion.button
                  className="flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-[#D4537E] text-white text-sm font-medium rounded-xl cursor-pointer shadow-[0_4px_14px_rgba(212,83,126,0.3)] hover:bg-[#993556] hover:shadow-[0_6px_20px_rgba(212,83,126,0.4)] transition-all mb-3 font-['Be_Vietnam_Pro',sans-serif]"
                  onClick={() => {
                    hasTriggeredRef.current = true;
                    handleConfetti();
                    startFallingEffect();
                    if (audioRef.current && !isPlaying) {
                      audioRef.current.play().catch(e => console.log('Audio error:', e));
                    }
                  }}
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Cake size={18} />
                  Bật pháo hoa chúc mừng 🎆
                </motion.button>

                <p className="text-center text-[0.78rem] text-gray-400">Nhấn để tung pháo hoa & ảnh kỷ niệm ✨</p>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </>
  );
};

export default BirthdayPage;