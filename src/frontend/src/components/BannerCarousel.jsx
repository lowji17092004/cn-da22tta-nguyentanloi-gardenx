import React, { useEffect, useRef, useState } from 'react'

export default function BannerCarousel({ items = [] }){
  const [idx, setIdx] = useState(0);
  const mounted = useRef(false)
  const timerRef = useRef(null)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    mounted.current = true
    startTimer()
    return () => { mounted.current = false; stopTimer() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length])

  function startTimer(){
    stopTimer()
    timerRef.current = setInterval(()=> setIdx(i => (i+1) % items.length), 4000)
  }
  function stopTimer(){ if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null } }

  if (!items.length) return null;

  function go(n){
    setIdx((prev)=> {
      const next = (prev + n + items.length) % items.length
      return next
    })
    startTimer()
  }

  function onKey(e){
    if (e.key === 'ArrowLeft') go(-1)
    if (e.key === 'ArrowRight') go(1)
  }

  return (
    <section className="banner" aria-roledescription="carousel" aria-label="Promotional banners" onKeyDown={onKey} tabIndex={0}
      onMouseEnter={() => { stopTimer(); setPlaying(false) }}
      onMouseLeave={() => { startTimer(); setPlaying(true) }}
    >
      {items.map((it, i)=> (
        <div
          key={i}
          className={`banner-slide ${i===idx ? 'active' : ''}`}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i+1} of ${items.length}`}
          aria-hidden={i===idx ? 'false' : 'true'}
        >
          <img src={it.image} alt={it.title} />
          <div className="overlay">
            <h2>{it.title}</h2>
            {it.subtitle && <p className="lead">{it.subtitle}</p>}
          </div>
        </div>
      ))}

      <button className="banner-control prev" aria-label="Previous slide" onClick={()=> go(-1)}>‹</button>
      <button className="banner-control next" aria-label="Next slide" onClick={()=> go(1)}>›</button>

      <div className="banner-controls">
        <button className="btn-icon small" aria-pressed={!playing} onClick={() => { if (playing) { stopTimer(); setPlaying(false) } else { startTimer(); setPlaying(true) } }} aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}>
          {playing ? '❚❚' : '▶'}
        </button>
      </div>

      <div className="banner-indicators" role="tablist" aria-label="Banner indicators">
        {items.map((_, i)=> (
          <button
            key={i}
            className={`indicator ${i===idx ? 'on' : ''}`}
            aria-label={`Go to slide ${i+1}`}
            aria-pressed={i===idx}
            onClick={() => { setIdx(i); startTimer() }}
          />
        ))}
      </div>
    </section>
  )
}
