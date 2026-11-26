'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import confetti from 'canvas-confetti'
import type { GiftData } from '@/lib/giftData'

interface Props {
  data: GiftData
}

type ScreenType = 'cat' | 'envelope' | 'birthdayMessage'
type MusicStatus = 'idle' | 'playing' | 'blocked' | 'error'

export default function GiftClient({ data }: Props) {
  const [screen, setScreen] = useState<ScreenType>('cat')
  const [envelopeExiting, setEnvelopeExiting] = useState(false)
  const [isOpening, setIsOpening] = useState(false)
  const [musicStatus, setMusicStatus] = useState<MusicStatus>('idle')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const playMusic = useCallback((audio: HTMLAudioElement | null) => {
    if (!audio) return

    audio.play().then(
      () => setMusicStatus('playing'),
      (error: unknown) => {
        setMusicStatus(
          error instanceof DOMException && error.name === 'NotAllowedError'
            ? 'blocked'
            : 'error'
        )
      }
    )
  }, [])

  useEffect(() => {
    window.history.replaceState({ screen: 'cat' }, '')
  }, [])

  useEffect(() => {
    if (!data.musicUrl) return

    const audio = new Audio(data.musicUrl)
    audio.loop = true
    audio.volume = 0.5
    audioRef.current = audio
    playMusic(audio)

    return () => {
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [data.musicUrl, playMusic])

  useEffect(() => {
    return () => {
      if (openTimerRef.current) clearTimeout(openTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (screen !== 'birthdayMessage') return

    confetti({
      particleCount: 80,
      spread: 85,
      origin: { y: 0.55 },
      colors: ['#0e2044', '#1e3870', '#8b1538', '#dfc08f', '#ffffff'],
    })
  }, [screen])

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const nextScreen = event.state?.screen
      setScreen(
        nextScreen === 'envelope' || nextScreen === 'birthdayMessage'
          ? nextScreen
          : 'cat'
      )
      setEnvelopeExiting(false)
      setIsOpening(false)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleContinue = useCallback(() => {
    if (screen !== 'cat') return
    if (musicStatus !== 'playing') playMusic(audioRef.current)
    window.history.pushState({ screen: 'envelope' }, '')
    setScreen('envelope')
  }, [musicStatus, playMusic, screen])

  const handleEnvelopeClick = useCallback(() => {
    if (isOpening || screen !== 'envelope') return

    setIsOpening(true)
    setEnvelopeExiting(true)
    openTimerRef.current = setTimeout(() => {
      window.history.pushState({ screen: 'birthdayMessage' }, '')
      setScreen('birthdayMessage')
    }, 550)
  }, [isOpening, screen])

  return (
    <main className="gift-page">
      <div className="ambient-glow glow-top-left" />
      <div className="ambient-glow glow-bottom-right" />

      <section
        className={`screen cat-screen ${screen === 'cat' ? 'visible' : 'hidden'}`}
      >
        <div className="intro-content cat-content">
          <Image
            src="/images/cat.png"
            alt="Birthday cat sticker"
            width={220}
            height={280}
            className="intro-cat-sticker"
            priority
          />
          <button type="button" className="open-envelope-btn" onClick={handleContinue}>
            tap to continue ✨
          </button>
        </div>
      </section>

      {musicStatus === 'blocked' && (
        <p className="music-status" role="status">
        </p>
      )}
      {musicStatus === 'error' && (
        <p className="music-status music-error" role="alert">
        </p>
      )}

      <section
        className={`screen intro-screen ${
          screen === 'envelope' ? (envelopeExiting ? 'exit' : 'visible') : 'hidden'
        }`}
      >
        <div className="intro-content">
          <p className="handwritten intro-heading">hey babe!</p>
          <button
            type="button"
            className="envelope-button"
            onClick={handleEnvelopeClick}
            disabled={isOpening}
            aria-label="Open your birthday message"
          >
            <Image
              src={data.envelopeImage}
              alt=""
              width={290}
              height={205}
              className="envelope-image"
              priority
            />
            <span className="handwritten intro-subtitle">tap the envelope to open ✨</span>
          </button>
        </div>
      </section>

      <section
        className={`screen birthday-message-screen ${
          screen === 'birthdayMessage' ? 'visible' : 'hidden'
        }`}
      >
        <div className="screen-scroll-container">
          <div className="stationery-card birthday-wishes-card">
            <div className="birthday-message-content">
              <div className="navy-badge-tag"></div>
              <h1 className="handwritten birthday-wishes-title">
                {data.birthdayWishesTitle}
              </h1>
              <p dir="rtl" className="handwritten birthday-wishes-body">
                {data.birthdayWishesMessage}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
