import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Anton, Archivo, Chivo_Mono } from 'next/font/google'
import './globals.css'

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-anton',
  display: 'swap',
})

const archivo = Archivo({
  weight: ['400', '500', '600', '700', '900'],
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
})

const chivoMono = Chivo_Mono({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-chivo',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.comptimer.com'),
  title: 'Comp Timer — competition timing for climbing gyms',
  description:
    'The comp clock for climbing gyms. Throw the display on any TV, scan the QR with your phone, and run 5-on / 5-off rotations from the judging table.',
  openGraph: {
    title: 'Comp Timer — every second, seen to the back row',
    description:
      'Big-screen competition timing for climbing comps. Any TV, controlled from your phone. No accounts, pairs in seconds.',
    url: 'https://www.comptimer.com',
    siteName: 'Comp Timer',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Comp Timer — competition timing for climbing gyms',
    description:
      'Big-screen competition timing. Any TV, controlled from your phone.',
  },
}

// Pre-paint: set the saved/preferred theme before first paint to avoid a flash.
const themeScript = `(function(){try{var t=localStorage.getItem('ct-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang='en'
      className={`${anton.variable} ${archivo.variable} ${chivoMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
