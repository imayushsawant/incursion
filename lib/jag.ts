// Deterministic jagged "torn paper" polygon used for the timeline strips.
// Ported 1:1 from the original script so every edge lands on the same pixel.
export function jag(seed: number): string {
  let r = seed * 9301 + 49297
  const R = () => (r = (r * 9301 + 49297) % 233280) / 233280
  const P: string[] = []
  for (let i = 0; i <= 14; i++) P.push(`${(R() * 3).toFixed(1)}% ${((i * 100) / 14).toFixed(1)}%`)
  for (let i = 1; i <= 9; i++) P.push(`${((i * 100) / 9).toFixed(1)}% ${(100 - R() * 3).toFixed(1)}%`)
  for (let i = 13; i >= 0; i--) P.push(`${(100 - R() * 3).toFixed(1)}% ${((i * 100) / 14).toFixed(1)}%`)
  for (let i = 8; i >= 1; i--) P.push(`${((i * 100) / 9).toFixed(1)}% ${(R() * 3).toFixed(1)}%`)
  return `polygon(${P.join(',')})`
}
