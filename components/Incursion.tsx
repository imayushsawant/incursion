'use client'

import { useEffect, type CSSProperties } from 'react'
import { initIncursion } from '@/lib/engine'
import { FRAMES } from '@/lib/frames'
import { jag } from '@/lib/jag'
import { TIMELINE, type Pic } from '@/lib/timeline'

const SRCS = {
  w: '/assets/img/throne-wide.webp',
  c: '/assets/img/throne-close.webp',
}

const bgs = (o: Pic): CSSProperties => {
  const u = o.url || (o.f != null ? FRAMES[o.f] : SRCS[o.s as 'w' | 'c'])
  const fr = o.f != null
  return {
    backgroundImage: `url(${u})`,
    backgroundSize: o.z || (fr ? '125%' : 'cover'),
    backgroundPosition: o.p || (fr ? '0% 35%' : '50% 50%'),
  }
}

const Arrow = () => (
  <svg viewBox="0 0 18 8" fill="none" stroke="currentColor">
    <path d="M0 4h17M13 1l4 3-4 3" />
  </svg>
)

export default function Incursion() {
  // The scroll-driven scene is imperative by nature (canvas + per-frame style writes),
  // so it runs as one effect over the DOM rendered below.
  useEffect(() => initIncursion(), [])

  return (
    <div id="scroll">
      <div id="stage">
        <canvas id="c" role="img" aria-label="Two planets collide as you scroll"></canvas>
        <section id="throne" aria-label="Doctor Doom on his throne">
          {/* eslint-disable-next-line @next/next/no-img-element -- plain <img> keeps the original rendering/animation pipeline untouched */}
          <img id="tw2" className="pic" alt="" src={SRCS.w} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img id="tc" className="pic" alt="Doctor Doom, hooded, eyes glowing green" src={SRCS.c} />
          <div className="vg" id="vg"></div>
          <div className="scrim" id="scrim"></div>
        </section>
        <div id="aurw">
          <div id="aur">
            <i className="gl"></i>
            <i className="cu"></i>
            <i className="cu"></i>
          </div>
        </div>
        <div id="title">
          <div>
            <h1 id="tw">
              <span id="tm">Incursion</span>
              {Array.from({ length: 7 }, (_, i) => (
                <span
                  key={i}
                  className="b"
                  aria-hidden="true"
                  style={{ clipPath: `inset(${(i * 100) / 7}% 0 ${100 - ((i + 1) * 100) / 7}% 0)` }}
                >
                  Incursion
                </span>
              ))}
            </h1>
            <p id="sub">A GDG on Campus hackathon &middot; January 2027</p>
          </div>
        </div>
        <div className="t warn" data-w="13.4,13.9,14.9,15.3">
          <h2>Your universe is&nbsp;next.</h2>
          <p data-w="13.8,14.3,14.9,15.3">
            Doctor Doom has torn open a breach between two universes. At Incursion, teams pick a problem
            statement and build a working solution before the collision reaches us.
          </p>
        </div>
        <div className="t mis" data-w="15.6,16.1,17.4,17.8">
          <p className="lead" data-w="15.6,16.1,17.4,17.8">
            Incursion is a team hackathon.
          </p>
          <span className="it" data-w="16.0,16.5,17.4,17.8">
            <b>Assemble.</b>Form a team and register.
          </span>
          <span className="it" data-w="16.4,16.9,17.4,17.8">
            <b>Choose your front.</b>Pick a problem statement. Each one is a universe in danger.
          </span>
          <span className="it" data-w="16.8,17.3,17.4,17.8">
            <b>Defend.</b>Build a working solution and present it to the judges.
          </span>
        </div>
        <div className="t dir" data-w="18.2,18.7,19.7,20.1">
          <h2>Save it.</h2>
          <p>Registrations open on 3&nbsp;November. The schedule is below.</p>
          <a className="btn reg" href="#">
            See the schedule
            <Arrow />
          </a>
        </div>
        <section className="ch" id="tlv" aria-label="Schedule">
          <div className="tlh">
            <div className="k">Schedule</div>
            <h2>The Fractured Timeline</h2>
          </div>
          <div id="tmask">
            <ol id="tcol">
              {TIMELINE.map((e, i) => (
                <li key={e.t} className={`row ${i % 2 ? 'R' : 'L'}`}>
                  <div className="strip">
                    <i className="pp" style={{ clipPath: jag(i * 13 + 3) }}></i>
                    <i className="im" style={{ ...bgs(e.img), clipPath: jag(i * 13 + 9) }}></i>
                  </div>
                  <div className="txt">
                    <i className="ic" style={bgs(e.ic)}></i>
                    <h3>{e.t}</h3>
                    <span className="ln"></span>
                    <div className="date">{e.d}</div>
                    <p>{e.x}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section className="ch" id="c5">
          <div>
            <h2>Doom isn&rsquo;t waiting.</h2>
            <p>Incursion &middot; January 2027</p>
            <a className="btn reg" href="#">
              Register
              <Arrow />
            </a>
          </div>
          <div className="k">A GDG on Campus hackathon</div>
        </section>
        <header id="hdr">
          <b>Incursion</b>
          <button id="snd" aria-pressed="true" type="button">
            Sound on
          </button>
        </header>
        <div id="hint">Scroll</div>
        <div className="grain"></div>
        <section id="term">
          <video id="iv" playsInline preload="auto" src="/assets/video/intro.mp4"></video>
          <div id="gate">
            <div className="k">GDG on Campus presents</div>
            <h1>Incursion</h1>
            <button className="btn" id="enter" type="button">
              Enter with sound
              <Arrow />
            </button>
            <button className="btn q" id="enterq" type="button">
              Enter without sound
            </button>
          </div>
          <button id="skip" type="button">
            Skip intro
          </button>
        </section>
      </div>
    </div>
  )
}
