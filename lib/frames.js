// 240 pre-rendered frames of the planet collision, extracted from the original build.
export const FRAMES = Array.from(
  { length: 240 },
  (_, i) => `/assets/frames/frame-${String(i).padStart(3, '0')}.webp`
)
