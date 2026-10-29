import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Incursion — a GDG hackathon, January 2027',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

// The original build inlined its fonts, so text never swapped. Preloading them
// keeps first paint identical now that they are served as files.
const FONTS = [
  'bodoni-moda-normal-400-900',
  'bodoni-moda-italic-400-900',
  'hanken-grotesk-normal-400',
  'hanken-grotesk-normal-500',
  'hanken-grotesk-normal-600',
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {FONTS.map((f) => (
          <link
            key={f}
            rel="preload"
            as="font"
            type="font/woff2"
            href={`/fonts/${f}.woff2`}
            crossOrigin="anonymous"
          />
        ))}
      </head>
      <body>{children}</body>
    </html>
  )
}
