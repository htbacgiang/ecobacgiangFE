import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Gift, Cake } from 'lucide-react';
import Image from 'next/image';

const BirthdayPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleConfetti = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const confettiModule = await import('canvas-confetti');
    const confetti = confettiModule.default;
    const duration = 1 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        window.clearInterval(interval);
        return;
      }
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } });
    }, 250);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timer = window.setTimeout(() => {
      setIsOpen(true);
      handleConfetti();
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [handleConfetti]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleClose, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 18 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 18 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="relative max-w-2xl w-full"
            role="dialog"
            aria-modal="true"
            aria-label="Chúc mừng sinh nhật"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -inset-2 rounded-[2.7rem]  blur-xl"></div>

            <div className="relative rounded-[2.5rem]  p-[2px] shadow-[0_30px_80px_-35px_rgba(16,185,129,0.9)]">
              <div className="relative bg-white rounded-[2.4rem] overflow-hidden">
                <button
                  onClick={handleClose}
                  className="absolute top-5 right-5 z-20 p-2 bg-white/85 rounded-full text-gray-500 hover:text-emerald-700 shadow-md ring-1 ring-gray-200 transition-colors backdrop-blur"
                  type="button"
                  aria-label="Đóng"
                >
                  <X size={22} />
                </button>

                <div className="relative h-72 w-full bg-neutral-900">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/15 to-transparent"></div>
                  <Image
                    src="/images/media-1.jpg"
                    alt="Happy Birthday CEO Bích Thủy"
                    fill
                    sizes="(max-width: 768px) 100vw, 600px"
                    className="object-cover opacity-95"
                    priority
                  />

                  <motion.div
                    aria-hidden="true"
                    className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-white/15 blur-xl"
                    animate={{ y: [0, 10, 0], x: [0, -6, 0] }}
                    transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.div
                    aria-hidden="true"
                    className="absolute -bottom-14 -left-12 h-56 w-56 rounded-full bg-white/10 blur-2xl"
                    animate={{ y: [0, -8, 0], x: [0, 6, 0] }}
                    transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
                  />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute -inset-2 rounded-full bg-white/25 blur-md"></div>
                    </div>
                  </div>
                </div>

                <div className="p-4 text-center">
                  <motion.div initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 tracking-tight">
                      Happy Birthday, Idol CEO!
                    </h2>
                    <p className="text-emerald-700 font-bold text-2xl mb-2"> Ms. Lê Bích Thủy</p>

                    <div className="w-20 h-1.5 bg-gradient-to-r from-emerald-500 via-green-500 to-lime-400 mx-auto mb-2 rounded-full"></div>

                    <p className="text-gray-700 leading-relaxed mb-7">
                      Đây là món quà nhỏ mà Trường dành tặng sinh nhật cho idol — CEO Bích Thủy. Chúc chị một tuổi mới rạng
                      rỡ, luôn giữ vững ngọn lửa đam mê để tiếp tục khai phóng những giọng nói và phong thái tuyệt vời cho
                      người Việt!
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        onClick={handleConfetti}
                        className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-emerald-600/25 transition-all transform hover:scale-[1.02] active:scale-[0.99] flex items-center justify-center gap-2"
                        type="button"
                      >
                        <Cake size={20} /> BẬT PHÁO HOA CHÚC MỪNG
                      </button>

                      <button
                        onClick={handleClose}
                        className="w-full sm:w-auto px-7 py-4 rounded-full font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 ring-1 ring-emerald-200 transition-colors"
                        type="button"
                      >
                        Nhận quà sau
                      </button>
                    </div>

                    <p className="mt-5 text-xs text-gray-500">
                      Tip: Nhấn Esc để đóng nhanh
                    </p>
                  </motion.div>
                </div>

                <div className="absolute -bottom-10 -left-10 text-emerald-100 opacity-50 rotate-12">
                  <Gift size={120} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BirthdayPopup;
