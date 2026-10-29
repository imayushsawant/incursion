// The proposed schedule (placeholder dates, confirm with organisers).
// To add a character cut-out or any image: use {url:'/assets/name.png',z:'cover',p:'50% 50%'} for img or ic.
export type Pic = { f?: number; s?: 'w' | 'c'; url?: string; z?: string; p?: string }
export type Entry = { t: string; d: string; x: string; img: Pic; ic: Pic }

export const TIMELINE: Entry[] = [
  {
    t: 'The Signal',
    d: '3 November 2026',
    x: 'Registrations open. Form your team and get in before the breach widens.',
    img: { f: 5 },
    ic: { f: 5, z: '420%', p: '4% 45%' },
  },
  {
    t: 'The Briefing',
    d: '1 December 2026',
    x: 'Problem statements are released. Choose the universe you will defend.',
    img: { s: 'w', z: '190%', p: '50% 20%' },
    ic: { s: 'c', z: '520%', p: '58% 17%' },
  },
  {
    t: 'The Breach',
    d: '15 December 2026',
    x: 'Idea submissions close. Two worlds begin to overlap.',
    img: { f: 90 },
    ic: { f: 90, z: '420%', p: '56% 46%' },
  },
  {
    t: 'The Collapse',
    d: '5 January 2027',
    x: 'Shortlisted teams are announced. The other timelines fracture.',
    img: { f: 150 },
    ic: { f: 150, z: '420%', p: '50% 50%' },
  },
  {
    t: 'The Convergence',
    d: '22 January 2027',
    x: 'Incursion begins. The worlds collide and the build starts.',
    img: { f: 200 },
    ic: { f: 200, z: '420%', p: '50% 52%' },
  },
  {
    t: 'The Verdict',
    d: '24 January 2027',
    x: 'Final demos and results. The best defence is chosen.',
    img: { s: 'c', z: '250%', p: '52% 41%' },
    ic: { s: 'c', z: '460%', p: '67% 50%' },
  },
]
