// components/PromoBanner.jsx
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { promoBannerService } from '../../lib/api-services'

export default function PromoBanner() {
  const [config, setConfig] = useState(null)
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 })
  const [loading, setLoading] = useState(true)

  // Fetch config từ BE
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await promoBannerService.get()
        setConfig(data)
      } catch (error) {
        console.error('Error fetching promo banner config:', error)
        setConfig({
          countdownDate: '2026-01-01T00:00:00',
          subtitle: 'Khám phá Eco Bắc Giang',
          title: 'Ưu đãi mua rau củ hữu cơ',
          description: 'Sản phẩm sạch – tươi ngon từ nông trại của chúng tôi',
          countdownLabel: 'Thời gian khuyến mãi còn lại',
          buttonText: 'Mua ngay',
          buttonLink: '/san-pham',
          backgroundImage: '/banner.png',
          isActive: true,
        })
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [])

  // Tính countdown
  const getTimeLeft = (targetDate) => {
    if (!targetDate) return { d: 0, h: 0, m: 0, s: 0 }
    const diff = +new Date(targetDate) - +new Date()
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 }
    return {
      d: Math.floor(diff / (1000 * 60 * 60 * 24)),
      h: Math.floor((diff / (1000 * 60 * 60)) % 24),
      m: Math.floor((diff / (1000 * 60)) % 60),
      s: Math.floor((diff / 1000) % 60),
    }
  }

  useEffect(() => {
    if (!config || !config.isActive) return

    const updateTime = () => {
      setTime(getTimeLeft(config.countdownDate))
    }
    
    updateTime()
    const t = setInterval(updateTime, 1000)
    return () => clearInterval(t)
  }, [config])

  const fmt = (n) => String(n).padStart(2, '0')

  // Không hiển thị nếu đang loading hoặc không active
  if (loading || !config || !config.isActive) {
    return null
  }

  return (
    <section
      className="container mx-auto
        relative overflow-hidden rounded-xl shadow-lg
        bg-no-repeat bg-center bg-cover mb-4
      "
      style={{
        minHeight: '400px',
        backgroundImage: `url('${config.backgroundImage}')`,
      }}
    >
      <div className="relative container mx-auto h-full flex items-center px-4 py-12">
        {/* Box chứa text + countdown, đẩy sang phải */}
        <div className="ml-auto w-full md:w-1/2 text-center md:text-left">
          <p className="text-green-600 font-medium mb-2">{config.subtitle}</p>
          <h2 className="text-4xl font-bold mb-4">{config.title}</h2>
          <p className="text-gray-700 mb-6">{config.description}</p>
          <p className="text-gray-600 mb-2">{config.countdownLabel}</p>

          <div className="inline-flex space-x-2 mb-6">
            {[fmt(time.d), fmt(time.h), fmt(time.m), fmt(time.s)]
              .map((v, i) => (
                <span
                  key={i}
                  className="bg-orange-500 text-white rounded-lg px-3 py-2 text-lg font-semibold"
                >
                  {v}
                </span>
              ))
              .reduce((acc, el, idx) =>
                idx > 0
                  ? [
                      ...acc,
                      <span
                        key={`sep${idx}`}
                        className="text-orange-500 text-xl font-bold"
                      >
                        :
                      </span>,
                      el,
                    ]
                  : [el],
                []
              )}
          </div>

          <div className="mt-4">
            <Link
              href={config.buttonLink}
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium rounded-full px-8 py-3 transition"
            >
              {config.buttonText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}