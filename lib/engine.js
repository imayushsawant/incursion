/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-expressions -- verbatim port of the original script */
/*
 * Incursion scene engine.
 *
 * This is the original inline <script> from the static HTML build, ported
 * with its logic untouched. Only the plumbing changed:
 *   - FRAMES / AUDIO_TRACK / REGISTER_URL come from modules instead of inline data
 *   - the timeline list and the title-glitch slices are rendered by React
 *     (see components/Incursion.tsx) instead of being injected via innerHTML / createElement
 *   - listeners, rAF and timers are tracked so the effect can be cleaned up
 */
import { FRAMES } from './frames'
import { REGISTER_URL } from './config'

const AUDIO_TRACK = '/assets/audio/track.mp3'

export function initIncursion() {
  const offs = []
  const on = (t, e, f) => {
    t.addEventListener(e, f)
    offs.push(() => t.removeEventListener(e, f))
  }
  let dirty = true,
    raf = 0
  const N = FRAMES.length,
    KEYS = [
      [0, 0],
      [0.03, 0],
      [0.12, 70],
      [0.22, 150],
      [0.29, 205],
      [0.33, 226],
      [0.36, 239],
      [1, 239],
    ]
  const $ = s => document.querySelector(s),
    $$ = s => [...document.querySelectorAll(s)],
    clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)),
    lerp = (a, b, t) => a + (b - a) * t
  const ss = (a, b, x) => {
      const t = clamp((x - a) / (b - a))
      return t * t * (3 - 2 * t)
    },
    vis = (el, o) => {
      el.style.opacity = o
      el.style.visibility = o > 0.002 ? 'visible' : 'hidden'
    }
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches
  history.scrollRestoration = 'manual'
  scrollTo(0, 0)
  document.documentElement.classList.add('lock')
  const tcol = $('#tcol')
  let colH = 0
  function lay() {
    colH = tcol.offsetHeight
    dirty = true
  }
  on(window, 'resize', lay)
  on(window, 'load', lay)
  if (document.readyState === 'complete') lay()
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(lay)
  /* ---- audio controller ---- */
  const AC = {
    ctx: null,
    on: true,
    trk: null,
    hasTrk: true,
    want: false,
    init() {
      if (this.ctx || this.trk) return
      try {
        const C = window.AudioContext || window.webkitAudioContext
        this.ctx = new C()
        this.master = this.ctx.createGain()
        this.master.gain.value = this.on ? 1 : 0
        this.master.connect(this.ctx.destination)
      } catch (e) {
        this.ctx = null
      }
      const t = new Audio(AUDIO_TRACK)
      t.preload = 'auto'
      t.volume = 0
      t.muted = !this.on
      t.addEventListener('error', () => {
        this.hasTrk = false
        upd()
      })
      this.trk = t
      const p = t.play()
      if (p && p.then)
        p.then(() => {
          t.pause()
          t.currentTime = 0
        }).catch(() => {})
    },
    noise(d) {
      const c = this.ctx,
        b = c.createBuffer(1, c.sampleRate * d, c.sampleRate),
        a = b.getChannelData(0)
      for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1
      return b
    },
    drone() {
      const c = this.ctx
      if (!c || this.dr) return
      const g = c.createGain(),
        f = c.createBiquadFilter()
      f.type = 'lowpass'
      f.frequency.value = 170
      g.gain.value = 0
      ;[49, 49.6, 98.2].forEach((hz, i) => {
        const o = c.createOscillator()
        o.type = i < 2 ? 'sine' : 'triangle'
        o.frequency.value = hz
        const og = c.createGain()
        og.gain.value = i < 2 ? 1 : 0.25
        o.connect(og)
        og.connect(f)
        o.start()
      })
      f.connect(g)
      g.connect(this.master)
      g.gain.linearRampToValueAtTime(0.07, c.currentTime + 5)
      this.dr = g
    },
    duck(x, s) {
      if (this.dr) this.dr.gain.setTargetAtTime(x, this.ctx.currentTime, s || 0.8)
    },
    glitch() {
      const c = this.ctx
      if (!c || RM) return
      const t = c.currentTime,
        s = c.createBufferSource()
      s.buffer = this.noise(0.3)
      const f = c.createBiquadFilter()
      f.type = 'bandpass'
      f.frequency.value = 2600
      f.Q.value = 0.7
      const g = c.createGain()
      ;[
        [0, 0.1],
        [0.09, 0],
        [0.14, 0.07],
        [0.2, 0],
      ].forEach(a => g.gain.setValueAtTime(a[1], t + a[0]))
      s.connect(f)
      f.connect(g)
      g.connect(this.master)
      s.start(t)
      s.stop(t + 0.3)
    },
    impact(k) {
      const c = this.ctx
      if (!c) return
      k = k || 1
      const t = c.currentTime,
        o = c.createOscillator(),
        g = c.createGain()
      o.frequency.setValueAtTime(95, t)
      o.frequency.exponentialRampToValueAtTime(30, t + 1.4)
      g.gain.setValueAtTime(0.5 * k, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.8)
      o.connect(g)
      g.connect(this.master)
      o.start(t)
      o.stop(t + 1.9)
      const s = c.createBufferSource()
      s.buffer = this.noise(1.2)
      const f = c.createBiquadFilter()
      f.type = 'lowpass'
      f.frequency.value = 380
      const n = c.createGain()
      n.gain.setValueAtTime(0.22 * k, t)
      n.gain.exponentialRampToValueAtTime(0.001, t + 1.1)
      s.connect(f)
      f.connect(n)
      n.connect(this.master)
      s.start(t)
    },
    swell() {
      const c = this.ctx
      if (!c) return
      const t = c.currentTime,
        s = c.createBufferSource()
      s.buffer = this.noise(1.4)
      const f = c.createBiquadFilter()
      f.type = 'lowpass'
      f.frequency.setValueAtTime(200, t)
      f.frequency.exponentialRampToValueAtTime(1400, t + 1)
      const g = c.createGain()
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.045, t + 0.6)
      g.gain.linearRampToValueAtTime(0, t + 1.3)
      s.connect(f)
      f.connect(g)
      g.connect(this.master)
      s.start(t)
    },
    fade(to, ms, then) {
      const t = this.trk
      if (!t) return
      clearInterval(this._f)
      const from = t.volume,
        st = performance.now()
      this._f = setInterval(() => {
        const k = Math.min(1, (performance.now() - st) / ms)
        t.volume = clamp(from + (to - from) * k)
        if (k >= 1) {
          clearInterval(this._f)
          if (then) then()
        }
      }, 50)
    },
    play(from, vol, ms) {
      const t = this.trk
      if (!t || !this.hasTrk) return
      if (from != null) {
        try {
          t.currentTime = from
        } catch (e) {}
      }
      this.want = true
      const p = t.play()
      if (p && p.catch) p.catch(() => {})
      this.fade(vol, ms)
    },
    stop(ms) {
      this.want = false
      this.fade(0, ms, () => {
        if (this.trk) this.trk.pause()
      })
    },
    set(b) {
      this.on = b
      if (this.master) this.master.gain.setTargetAtTime(b ? 1 : 0, this.ctx.currentTime, 0.05)
      if (this.trk) this.trk.muted = !b
      iv.muted = !b
      upd()
    },
  }
  function upd() {
    const b = $('#snd')
    b.textContent = AC.on ? 'Sound on' : 'Sound off'
    b.setAttribute('aria-pressed', AC.on)
    b.title = AC.hasTrk ? '' : 'The music track failed to load, so only the synthesised cues will play'
  }
  on($('#snd'), 'click', () => {
    AC.init()
    AC.set(!AC.on)
  })
  on(document, 'visibilitychange', () => {
    if (document.hidden) {
      AC.ctx && AC.ctx.suspend()
      AC.trk && AC.trk.pause()
    } else {
      AC.ctx && AC.ctx.resume()
      if (AC.want && AC.trk) AC.trk.play().catch(() => {})
    }
  })
  /* ---- intro video ---- */
  const iv = $('#iv')
  let done = false,
    ready = false
  function finish() {
    if (done) return
    done = true
    ready = true
    iv.pause()
    $('#skip').style.display = 'none'
    $('#gate').classList.add('go')
    document.documentElement.classList.remove('lock')
    iv.style.transition = 'opacity 1.4s'
    iv.style.opacity = 0
    AC.drone()
    dirty = true
  }
  function enter(snd) {
    AC.on = snd
    AC.init()
    AC.set(snd)
    $('#gate').classList.add('go')
    $('#skip').style.display = 'block'
    const p = iv.play()
    if (p && p.catch) p.catch(finish)
  }
  on($('#enter'), 'click', () => enter(true))
  on($('#enterq'), 'click', () => enter(false))
  on(iv, 'ended', finish)
  on(iv, 'error', finish)
  on($('#skip'), 'click', finish)
  /* ---- registration / schedule buttons ---- */
  $$('.reg').forEach(a => {
    if (REGISTER_URL) {
      a.href = REGISTER_URL
      a.target = '_blank'
      a.rel = 'noopener'
      if (a.closest('#c5')) a.textContent = 'Register'
    } else
      on(a, 'click', e => {
        e.preventDefault()
        scrollTo({ top: 20.6 * innerHeight, behavior: RM ? 'auto' : 'smooth' })
      })
  })
  if (REGISTER_URL) $$('.dir .reg').forEach(a => (a.firstChild.textContent = 'Register'))
  /* ---- collision canvas ---- */
  const c = $('#c'),
    ctx = c.getContext('2d'),
    imgs = new Array(N)
  let W,
    H,
    dpr = 1,
    cur = 0,
    lv = -1
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2)
    W = innerWidth
    H = innerHeight
    c.width = Math.round(W * dpr)
    c.height = Math.round(H * dpr)
    dirty = true
  }
  function frameFor(p) {
    for (let i = 1; i < KEYS.length; i++) {
      if (p <= KEYS[i][0]) {
        const a = KEYS[i - 1],
          b = KEYS[i]
        return a[1] + ((b[1] - a[1]) * (p - a[0])) / (b[0] - a[0])
      }
    }
    return KEYS[KEYS.length - 1][1]
  }
  function getImg(i) {
    for (let k = i; k >= 0; k--) {
      const im = imgs[k]
      if (im && im.complete && im.naturalWidth) return im
    }
    return null
  }
  function draw(f) {
    const im = getImg(clamp(Math.round(f), 0, N - 1))
    if (!im) return
    const s = Math.max(c.width / im.naturalWidth, c.height / im.naturalHeight) * 1.04,
      w = im.naturalWidth * s,
      h = im.naturalHeight * s
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.drawImage(im, (c.width - w) / 2, (c.height - h) / 2, w, h)
  }
  on(window, 'resize', resize)
  resize()
  for (let i = 0; i < N; i++) {
    const im = new Image()
    im.decoding = 'async'
    im.src = FRAMES[i]
    imgs[i] = im
  }
  /* ---- title sequence (one-shot, timed) ---- */
  const tm = $('#tm'),
    sub = $('#sub'),
    sl = $$('#tw .b')
  let tt = [],
    played = false
  const show = (ix, x, o) =>
      ix.forEach(i => {
        sl[i].style.opacity = o
        sl[i].style.transform = `translateX(${x}px)`
      }),
    clr = () =>
      sl.forEach(b => {
        b.style.opacity = 0
        b.style.transform = 'none'
      })
  function titleSeq() {
    const S = (ms, f) => tt.push(setTimeout(f, ms))
    if (RM) {
      S(300, () => {
        $('#aur').classList.add('on')
        tm.style.transition = 'opacity 1.4s,filter 1.4s'
        tm.style.opacity = 1
        tm.style.filter = 'none'
      })
      S(1800, () => sub.classList.add('on'))
      return
    }
    S(700, () => {
      show([2, 4], 16, 0.5)
      AC.glitch()
    })
    S(790, clr)
    S(960, () => show([0, 1, 5], -26, 0.6))
    S(1060, clr)
    S(1180, () => show([3], 10, 0.7))
    S(1240, () => {
      clr()
      tm.style.opacity = 0.5
    })
    S(1320, () => {
      tm.style.opacity = 0
    })
    S(1420, () => {
      tm.style.opacity = 1
      tm.style.filter = 'none'
      $('#aur').classList.add('on')
      AC.impact(0.8)
    })
    S(1600, () => show([4], -6, 0.5))
    S(1660, clr)
    S(2900, () => sub.classList.add('on'))
  }
  function titleReset() {
    tt.forEach(clearTimeout)
    tt = []
    clr()
    tm.style.transition = 'none'
    tm.style.opacity = 0
    tm.style.filter = 'blur(3px)'
    sub.classList.remove('on')
    $('#aur').classList.remove('on')
    played = false
  }
  /* ---- scene tick ---- */
  const THR = $('#throne'),
    tw2 = $('#tw2'),
    tc = $('#tc'),
    vg = $('#vg'),
    scrim = $('#scrim'),
    tl = $$('[data-w]').map(e => ({ e, w: e.dataset.w.split(',').map(Number) }))
  const CH = [
    [$('#tlv'), 20.4, 29.2],
    [$('#c5'), 29.2, 30.6],
  ].map(a => ({ el: a[0], s: a[1], e: a[2], seen: false }))
  let reveal = 0,
    trk = 0
  function tick() {
    raf = requestAnimationFrame(tick)
    const v = scrollY / innerHeight,
      now = performance.now()
    if (v === lv && !dirty) return
    lv = v
    dirty = false
    /* chrome */
    $('#term').style.opacity = ready ? Math.max(0, 1 - ss(0, 0.5, v)) : 1
    $('#term').style.visibility = ready && v > 0.5 ? 'hidden' : 'visible'
    $('#hdr').style.opacity = ready ? ss(0.2, 0.8, v) : 0
    $('#hint').style.opacity = ready ? 1 - ss(0.1, 0.6, v) : 0
    /* collision */
    const tgt = frameFor(clamp(v / 14, 0, 1))
    cur += (tgt - cur) * 0.14
    if (Math.abs(tgt - cur) < 0.02) cur = tgt
    else dirty = true
    const cO = 1 - ss(6.9, 7.4, v)
    vis(c, cO)
    if (cO > 0) draw(cur)
    /* title */
    if (v >= 4.8 && !played) {
      played = true
      titleSeq()
    } else if (v < 4.3 && played) titleReset()
    $('#title').style.opacity = 1 - ss(6.6, 7.1, v)
    /* throne */
    const em = ss(7.2, 8.8, v),
      pu = clamp((v - 8.8) / 2.9),
      S = 1 + 3.2 * Math.pow(pu, 2.2)
    if (v >= 11.7 && !reveal) {
      reveal = now
      AC.duck(0.02, 0.5)
      if (trk >= 1) {
        AC.fade(0.1, 1200)
        setTimeout(() => {
          if (reveal) AC.play(81.9, 0.95, 900)
        }, 1500)
      }
      setTimeout(() => {
        if (reveal && (!AC.trk || !AC.hasTrk || AC.trk.paused)) AC.impact(1.4)
        else if (reveal) AC.impact(0.5)
      }, 3100)
    } else if (v < 11.3 && reveal) {
      reveal = 0
      if (trk >= 1) AC.play(0, 0.7, 800)
      AC.duck(0.07, 0.8)
    }
    const rt = reveal ? (now - reveal) / 1000 : 0,
      timed = reveal ? ss(2.4, 3.3, rt) : 0
    if (reveal && rt < 3.4) dirty = true
    const co = Math.max(timed, ss(12.3, 13.0, v)),
      tO = ss(7.1, 7.4, v) * (1 - ss(19.8, 20.6, v))
    vis(THR, tO)
    if (tO > 0) {
      const j = RM ? 0 : 0.5 + 1.4 * pu,
        jx = (Math.sin(v * 11) + Math.sin(v * 6.3)) * j,
        jy = Math.cos(v * 8.7) * j
      tw2.style.transform = `translate(${jx}px,${jy}px) scale(${S})`
      tw2.style.filter = `brightness(${0.1 + 0.9 * em})${RM ? '' : ` blur(${1.4 * pu * pu}px)`}`
      tw2.style.visibility = co < 0.999 ? 'visible' : 'hidden'
      const dim = 1 - 0.45 * ss(14.9, 15.5, v)
      tc.style.opacity = co
      tc.style.transform = `scale(${1 + 0.07 * ss(12.6, 13.8, v)})`
      tc.style.filter = `brightness(${dim})`
      const r = lerp(lerp(10, 74, em) * (1 - 0.5 * pu), 34, co)
      vg.style.setProperty('--r', r + '%')
      vg.style.setProperty('--fx', lerp(55, 52, co) + '%')
      vg.style.setProperty('--fy', lerp(58, 36, co) + '%')
      scrim.style.opacity = ss(13.2, 13.8, v) * (1 - ss(14.9, 15.3, v))
    }
    /* text scenes */
    tl.forEach(o => {
      const w = o.w,
        t = ss(w[0], w[1], v) * (1 - ss(w[2], w[3], v))
      o.e.style.opacity = t
      o.e.style.visibility = t > 0.002 ? 'visible' : 'hidden'
      o.e.style.translate = o.e.classList.contains('dir') || o.e.classList.contains('mis') ? '' : ''
    })
    /* timeline + closing scene */
    CH.forEach((k, i) => {
      const o = ss(k.s - 0.25, k.s + 0.25, v) * (i < 1 ? 1 - ss(k.e - 0.25, k.e + 0.25, v) : 1),
        u = clamp((v - k.s) / (k.e - k.s))
      vis(k.el, o)
      if (o > 0.5 && !k.seen) {
        k.seen = true
        AC.swell()
      } else if (v < k.s - 0.6) k.seen = false
      if (i === 0 && o > 0) {
        if (!colH) colH = tcol.offsetHeight
      }
      if (i === 0 && o > 0)
        tcol.style.transform = `translateY(${lerp(innerHeight * 0.66, -(colH - innerHeight * 0.55), u)}px)`
    })
    vis($('#aurw'), 1 - ss(6.6, 7.1, v))
    /* music state */
    if (v >= 7.2 && trk === 0 && AC.trk) {
      trk = 1
      AC.play(0, 0.7, 6000)
    } else if (v < 6.8 && trk >= 1) {
      trk = 0
      reveal = 0
      AC.stop(700)
    }
    if (trk >= 1 && reveal && AC.trk && AC.trk.volume > 0) {
      /* chapter level */ const q = v >= 20.4 ? 0.4 : 0.9
      if (AC._q !== q && rt > 4.5) {
        AC._q = q
        AC.fade(q, 2500)
      }
    }
  }
  raf = requestAnimationFrame(tick)
  return () => {
    cancelAnimationFrame(raf)
    offs.forEach(f => f())
    tt.forEach(clearTimeout)
    clearInterval(AC._f)
    if (AC.trk) AC.trk.pause()
    if (AC.ctx && AC.ctx.close) AC.ctx.close().catch(() => {})
    AC.ctx = null
    AC.dr = null
    iv.pause()
    document.documentElement.classList.remove('lock')
    history.scrollRestoration = 'auto'
  }
}
