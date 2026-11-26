import type { Metadata } from 'next'
import giftData from '@/lib/giftData'
import GiftClient from '@/components/GiftClient'

export const metadata: Metadata = {
  metadataBase: new URL('https://agiftforyouuu.vercel.app'),
  title: ' habibty! ',
  description: 'A special  message for habibty 🤍',
  openGraph: {
    title: ' habibty! ',
    description: 'A special  message for habibty 🤍',
    url: 'https://agiftforyouuu.vercel.app',
    siteName: 'Birthday Gift',
    type: 'website',
    images: [
      {
        url: 'https://agiftforyouuu.vercel.app/images/og-cat.jpg',
        secureUrl: 'https://agiftforyouuu.vercel.app/images/og-cat.jpg',
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: ' Ahmed Cat 🐱',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: ' habibty! ',
    description: 'A special  message for habibty 🤍',
    images: ['https://agiftforyouuu.vercel.app/images/og-cat.jpg'],
  },
}

export default function Home() {
  const data = giftData.ahmed || giftData.amir
  return <GiftClient data={data} />
}