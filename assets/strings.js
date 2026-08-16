/* LevSha strings engine v1
   Seven vertical "strings" (the site grid, Figma node 4005:8298) rendered as
   SVG paths. The cursor bends a nearby string; crossing it plucks it and the
   string rings with a damped vibration, like a guitar string.
   Layout stays in CSS — elements align to the same percentages. */

(function () {
  const POSITIONS = [9.14, 22.73, 36.33, 50, 63.59, 77.19, 90.78]; // % of width
  const PULL_RADIUS = 110;   // px: how close the cursor must be to bend a string
  const MAX_PULL = 46;       // px: max magnetic bend
  const DAMPING = 0.986;     // per-frame amplitude decay while ringing
  const FREQ = 0.35;         // base oscillation frequency, rad per frame
  const SPRING = 0.12;       // how fast the bend follows the cursor

  const svg = document.getElementById('strings-svg');
  if (!svg) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = innerWidth, H = innerHeight;
  const NS = 'http://www.w3.org/2000/svg';

  const strings = POSITIONS.map(pct => {
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('class', 'string');
    svg.appendChild(path);
    return {
      pct, path,
      x: W * pct / 100,
      bend: 0,        // current control-point offset (px)
      target: 0,      // magnetic target while cursor is near
      amp: 0,         // ringing amplitude after a pluck
      phase: 0,
      grabY: 0.5,     // where along the string the cursor acts (0..1)
      prevSide: null  // which side of the string the cursor was on
    };
  });

  function resize() {
    W = innerWidth; H = innerHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    strings.forEach(s => { s.x = W * s.pct / 100; });
  }
  resize();
  addEventListener('resize', resize);

  let mouseX = -1e4, mouseY = 0, lastX = -1e4;
  addEventListener('pointermove', e => { mouseX = e.clientX; mouseY = e.clientY; });

  function frame() {
    const speed = Math.min(Math.abs(mouseX - lastX), 60);
    strings.forEach(s => {
      // pluck detection: the cursor crossed the string's x
      const side = mouseX < s.x ? -1 : 1;
      if (s.prevSide !== null && side !== s.prevSide && Math.abs(mouseY) < H) {
        s.amp = Math.min(6 + speed * 0.55, MAX_PULL);
        s.phase = side > 0 ? 0 : Math.PI; // start swinging away from travel direction
        s.grabY = Math.max(0.08, Math.min(0.92, mouseY / H));
      }
      s.prevSide = side;

      // magnetic bend while the cursor hovers near (not while ringing hard)
      const dist = Math.abs(mouseX - s.x);
      s.target = dist < PULL_RADIUS
        ? (mouseX - s.x) * (1 - dist / PULL_RADIUS) * (MAX_PULL / PULL_RADIUS) * 2.2
        : 0;
      if (s.target !== 0) s.grabY = Math.max(0.08, Math.min(0.92, mouseY / H));
      s.bend += (s.target - s.bend) * SPRING;

      // ringing
      let ring = 0;
      if (s.amp > 0.15) {
        s.phase += FREQ;
        s.amp *= DAMPING;
        ring = Math.sin(s.phase) * s.amp;
      } else s.amp = 0;

      const off = reduceMotion ? 0 : s.bend + ring;
      const cy = s.grabY * H;
      s.path.setAttribute('d',
        `M ${s.x} 0 Q ${s.x + off} ${cy} ${s.x} ${H}`);
    });
    lastX = mouseX;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
