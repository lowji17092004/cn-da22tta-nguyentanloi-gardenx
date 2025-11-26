import React from 'react'
import BannerCarousel from '../components/BannerCarousel'

export default function Home(){
  const hero = [
    { image: '/images/hero1.jpg' },
    { image: '/images/hero2.jpg' },
    { image: '/images/hero3.jpg' }
  ]

  return (
    <div>
      <div className="home-hero">
        <BannerCarousel items={hero} />
      </div>
    </div>
  )
}
