/* 3D garment viewer for Sajanies Learning (uses js/vendor/three.min.js).
   Each design is built from real 3D shapes — neckline, sleeves, skirt, hem — using the colours and
   patterns from the teacher's drawing. Front/side views follow the drawing; the back is an interpretation. */
(function () {
  "use strict";
  const T = window.THREE;
  const PI = Math.PI;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  /* smooth 1-D curve through [x, y] control points (x ascending) */
  function curveFn(pts) {
    const x0 = pts[0][0], x1 = pts[pts.length - 1][0], step = (x1 - x0) / 240 || 1;
    const n = 241; let ys = new Array(n);
    for (let i = 0; i < n; i++) {
      const x = x0 + i * step; let k = 1;
      while (k < pts.length - 1 && pts[k][0] < x) k++;
      const a = pts[k - 1], b = pts[k]; const t = b[0] === a[0] ? 0 : clamp((x - a[0]) / (b[0] - a[0]), 0, 1);
      ys[i] = a[1] + (b[1] - a[1]) * t;
    }
    for (let pass = 0; pass < 6; pass++) {
      const c = ys.slice();
      for (let i = 1; i < n - 1; i++) ys[i] = (c[i - 1] + 2 * c[i] + c[i + 1]) / 4;
    }
    return (x) => {
      if (x <= x0) return ys[0]; if (x >= x1) return ys[n - 1];
      const f = (x - x0) / step, i = Math.floor(f), t = f - i; return ys[i] * (1 - t) + ys[i + 1] * t;
    };
  }

  /* ---------- fabric patterns (drawn on a small canvas, repeated over the garment) ---------- */
  function canvasTex(w, h, draw) {
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const g = c.getContext("2d"); draw(g, w, h);
    g.globalAlpha = 0.05; // fine woven grain
    for (let i = 0; i < 700; i++) { g.fillStyle = i % 2 ? "#000" : "#fff"; g.fillRect(Math.random() * w, Math.random() * h, 1.2, 1.2); }
    const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 4; return t;
  }
  const heart = (g, x, y, s) => { g.beginPath(); g.moveTo(x, y + s * .55); g.bezierCurveTo(x - s * 1.15, y - s * .1, x - s * .5, y - s * .95, x, y - s * .35); g.bezierCurveTo(x + s * .5, y - s * .95, x + s * 1.15, y - s * .1, x, y + s * .55); g.fill(); };
  const tri = (g, x, y, s) => { g.beginPath(); g.moveTo(x - s, y - s * .7); g.lineTo(x + s, y - s * .7); g.lineTo(x, y + s * .85); g.closePath(); g.fill(); };
  const spots = [[.25, .25], [.75, .75]];

  const PAT = {
    dots: (o) => canvasTex(256, 256, (g, w, h) => { g.fillStyle = o.base; g.fillRect(0, 0, w, h); g.fillStyle = o.dot; spots.forEach(([x, y]) => { g.beginPath(); g.arc(x * w, y * h, (o.r || .14) * w, 0, 2 * PI); g.fill(); }); }),
    hearts: (o) => canvasTex(256, 256, (g, w, h) => { g.fillStyle = o.base; g.fillRect(0, 0, w, h); g.fillStyle = o.dot; spots.forEach(([x, y]) => heart(g, x * w, y * h, (o.r || .16) * w)); }),
    tris: (o) => canvasTex(256, 256, (g, w, h) => { g.fillStyle = o.base; g.fillRect(0, 0, w, h); g.fillStyle = o.dot; spots.forEach(([x, y]) => tri(g, x * w, y * h, (o.r || .12) * w)); }),
    rings: (o) => canvasTex(256, 256, (g, w, h) => { g.fillStyle = o.base; g.fillRect(0, 0, w, h); g.strokeStyle = o.dot; const R = (o.r || .13) * w; g.lineWidth = R * .55; spots.forEach(([x, y]) => { g.beginPath(); g.arc(x * w, y * h, R, 0, 2 * PI); g.stroke(); }); }),
    stripes: (o) => canvasTex(128, 16, (g, w, h) => { g.fillStyle = o.b; g.fillRect(0, 0, w, h); g.fillStyle = o.a; g.fillRect(0, 0, w * (o.ratio || .55), h); }),
    diag: (o) => canvasTex(256, 256, (g, w, h) => {
      g.fillStyle = o.b; g.fillRect(0, 0, w, h); g.fillStyle = o.a;
      for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(k * w, 0); g.lineTo(k * w + w * (o.ratio || .5), 0); g.lineTo(k * w + w * (o.ratio || .5) + w, h); g.lineTo(k * w + w, h); g.closePath(); g.fill(); }
    }),
    chevron: (o) => canvasTex(512, 128, (g, w, h) => {
      g.fillStyle = o.b; g.fillRect(0, 0, w, h); g.strokeStyle = o.a; g.lineWidth = h * .19; g.lineJoin = "miter";
      for (let k = -9; k <= 1; k++) { g.beginPath(); for (let x = 0; x <= w; x += 8) { const y = h * .5 + k * h + (w / 2 - Math.abs(x - w / 2)) * 2.4; if (x === 0) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke(); }
    })
  };

  function mat(o) {
    const m = new T.MeshStandardMaterial({ color: o.map ? 0xffffff : o.color, map: o.map || null, roughness: o.rough == null ? .88 : o.rough, metalness: 0, side: T.DoubleSide });
    if (o.opacity != null) { m.transparent = true; m.opacity = o.opacity; }
    return m;
  }

  /* ---------- geometry builders ---------- */
  function finish(pos, uv, idx, segs, rows) {
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    if (segs) { // hide the seam where the loop closes
      const n = g.attributes.normal;
      for (let j = 0; j <= rows; j++) {
        const a = j * (segs + 1), b = a + segs;
        const x = (n.getX(a) + n.getX(b)) / 2, y = (n.getY(a) + n.getY(b)) / 2, z = (n.getZ(a) + n.getZ(b)) / 2;
        n.setXYZ(a, x, y, z); n.setXYZ(b, x, y, z);
      }
    }
    return g;
  }

  /* A garment body wrapped around the figure: radius by height, with its own neckline (top) and hem edges. */
  function shell(o) {
    const segs = o.segs || 96, rows = o.rows || 60, zs = o.zs || .66;
    const pos = [], uv = [], idx = [];
    for (let j = 0; j <= rows; j++) {
      const v = j / rows;
      for (let i = 0; i <= segs; i++) {
        const th = -PI + (i / segs) * 2 * PI;
        const yT = o.top(th), yB = o.hem(th), y = yT + (yB - yT) * v;
        let r = o.r(y); if (o.mod) r += o.mod(th, y, v);
        pos.push(r * Math.sin(th), y, r * Math.cos(th) * zs);
        uv.push((i / segs) * (o.uTurns || 1), y / (o.vScale || 8));
      }
    }
    for (let j = 0; j < rows; j++) for (let i = 0; i < segs; i++) {
      const a = j * (segs + 1) + i, b = a + 1, c = a + segs + 1, d = c + 1; idx.push(a, c, b, b, c, d);
    }
    return new T.Mesh(finish(pos, uv, idx, segs, rows), o.mat);
  }

  /* A tube following a path with changing radius (sleeves, legs, straps). */
  function tube(o) {
    const curve = new T.CatmullRomCurve3(o.pts.map((p) => new T.Vector3(p[0], p[1], p[2])));
    const steps = o.steps || 30, segs = o.segs || 28, t0 = o.range ? o.range[0] : 0, t1 = o.range ? o.range[1] : 1;
    const pos = [], uv = [], idx = [];
    for (let j = 0; j <= steps; j++) {
      const s = j / steps, t = lerp(t0, t1, s);
      const P = curve.getPoint(t), Tg = curve.getTangent(t).normalize();
      const ref = Math.abs(Tg.z) > .9 ? new T.Vector3(1, 0, 0) : new T.Vector3(0, 0, 1);
      const N = ref.clone().cross(Tg).normalize(), B = Tg.clone().cross(N).normalize();
      for (let i = 0; i <= segs; i++) {
        const ph = (i / segs) * 2 * PI, r = o.r(t, ph);
        pos.push(P.x + (N.x * Math.cos(ph) + B.x * Math.sin(ph)) * r, P.y + (N.y * Math.cos(ph) + B.y * Math.sin(ph)) * r, P.z + (N.z * Math.cos(ph) + B.z * Math.sin(ph)) * r);
        uv.push((i / segs) * (o.uRep || 1), (t * (o.len || 40)) / (o.vScale || 8));
      }
    }
    for (let j = 0; j < steps; j++) for (let i = 0; i < segs; i++) {
      const a = j * (segs + 1) + i, b = a + 1, c = a + segs + 1, d = c + 1; idx.push(a, c, b, b, c, d);
    }
    return new T.Mesh(finish(pos, uv, idx, segs, steps), o.mat);
  }

  /* ---------- the figure ---------- */
  const BODY = [[78, 14.2], [84, 15.4], [90, 16.4], [98, 14.8], [106, 12.6], [116, 14.2], [126, 16.4], [132, 16.0], [139, 14.2], [143, 7.5], [148, 5.4]];
  const fit = (e) => BODY.map(([y, r]) => [y, r + e]);
  const ARM = [[18.5, 138, 0], [24.5, 113, .5], [28.5, 90, 1.5]];
  const LEG = [[7.4, 84, 0], [7, 64, .6], [6.6, 46, .4], [6.2, 26, -.4], [6.4, 8, 0]];
  const mir = (pts, s) => pts.map((p) => [p[0] * s, p[1], p[2]]);

  function mannequin() {
    const g = new T.Group(), skin = new T.MeshStandardMaterial({ color: 0xe6d3bf, roughness: .9 });
    const torso = new T.Mesh(new T.LatheGeometry(BODY.map(([y, r]) => new T.Vector2(r, y)), 48), skin);
    torso.scale.z = .6; g.add(torso);
    const ball = (x, y, z, sx, sy, sz, m) => { const s = new T.Mesh(new T.SphereGeometry(1, 24, 18), m || skin); s.position.set(x, y, z); s.scale.set(sx, sy, sz); g.add(s); return s; };
    [1, -1].forEach((s) => {
      ball(s * 17.2, 138.2, 0, 4.4, 4.6, 3.8);
      g.add(tube({ pts: mir(ARM, s), r: curveFn([[0, 3.8], [.5, 3.0], [1, 2.1]]), mat: skin, steps: 18, segs: 16 }));
      ball(s * 28.8, 86.5, 1.7, 2.1, 4.6, 1.6);
      g.add(tube({ pts: mir(LEG, s), r: curveFn([[0, 6.9], [.25, 6.3], [.5, 5.0], [.75, 3.9], [1, 3.0]]), mat: skin, steps: 24, segs: 18 }));
      ball(s * 6.6, 3, 3.2, 3.2, 2.6, 8.2);
    });
    const neck = new T.Mesh(new T.CylinderGeometry(4, 4.6, 12, 24), skin); neck.position.set(0, 149, 0); g.add(neck);
    ball(0, 161.5, .6, 8.6, 11, 9.6);
    const hair = new T.MeshStandardMaterial({ color: 0x3a2f2b, roughness: .8 });
    ball(0, 163, -1.4, 9.9, 12, 10.4, hair);
    ball(0, 157, -2.6, 9.4, 6.2, 8.2, hair);
    return g;
  }

  /* ---------- edges ---------- */
  const NECK = {
    v: (D, w) => (th) => { const t = Math.abs(th / w); return t >= 1 ? 0 : D * (1 - t); },
    scoop: (D, w) => (th) => { const t = Math.abs(th / w); return t >= 1 ? 0 : D * Math.cos(t * PI / 2); },
    sweet: (D, w) => (th) => { const t = Math.abs(th / w); if (t >= 1) return 0; return t < .45 ? D * (.78 + .22 * (1 - t / .45)) : D * .78 * (1 - (t - .45) / .55); }
  };
  const topEdge = (base, dip, back) => (th) => base - dip(th) + (Math.abs(th) > 2.2 && back ? back : 0);
  const flat = (y) => () => y;
  const highLow = (lo, hi, pow, shift) => (th) => lerp(lo, hi, Math.pow((1 + Math.cos(th - (shift || 0))) / 2, pow || 1.3));
  const ruffle = (amp, k, pw) => (th, y, v) => amp * Math.pow(v, pw || 2) * Math.sin(k * th + y * .08);

  /* ---------- the nine designs ---------- */
  const D = {};
  const mk = (map, color, extra) => mat(Object.assign({ map, color }, extra || {}));
  const cap = (g, m) => [1, -1].forEach((s) => { const b = new T.Mesh(new T.SphereGeometry(1, 20, 14), m); b.position.set(s * 17, 139, 0); b.scale.set(5.6, 5.2, 4.8); g.add(b); });

  D.d01 = () => { // yellow polka high-low
    const g = new T.Group(), yel = 0xf2c230, dots = PAT.dots({ base: "#f2c230", dot: "#ec7a2e", r: .15 }), m = mk(dots);
    const r = curveFn([[44, 38], [60, 34], [72, 29], [84, 22.5], [92, 18.4], [98, 15.2], [106, 13.4], [116, 14.9], [126, 17], [132, 16.6], [139, 14.8]]);
    const body = shell({ r, mat: m, uTurns: 11, vScale: 9, top: topEdge(133, NECK.sweet(9, .85)), hem: highLow(48, 70, 1.4), mod: ruffle(1.8, 10, 2.6) });
    g.add(body);
    const band = shell({ r: curveFn(BODY.map(([y, rr]) => [y, rr + 1.4])), mat: mk(null, 0xe0a81c), top: flat(113), hem: flat(98), segs: 72, rows: 12, mod: (th, y) => .55 * Math.sin(14 * th + y * .5) });
    g.add(band);
    [1, -1].forEach((s) => g.add(tube({ pts: mir(ARM, s), range: [0, .15], r: (t, ph) => (4.6 + 2.4 * t / .15) * (1 + .13 * Math.sin(9 * ph)), mat: m, uRep: 4, steps: 10, segs: 36, len: 40 })));
    cap(g, m);
    return g;
  };

  D.d02 = () => { // pink puff-sleeve mini
    const g = new T.Group(), m = mk(PAT.dots({ base: "#eab6d8", dot: "#2b2d77", r: .14 }));
    const r = curveFn([[60, 32], [68, 29], [78, 24], [88, 19.6], [96, 16.4], [103, 13.4], [116, 14.8], [126, 17], [132, 16.6], [139, 14.8]]);
    g.add(shell({ r, mat: m, uTurns: 11, vScale: 9, top: topEdge(133, NECK.sweet(9, .85)), hem: flat(66), mod: (th, y, v) => .9 * Math.pow(v, 6) * Math.sin(18 * th) }));
    g.add(shell({ r: curveFn(BODY.map(([y, rr]) => [y, rr + 1.3])), mat: mk(null, 0xd98fba), top: flat(112), hem: flat(98), segs: 72, rows: 12, mod: (th, y) => .55 * Math.sin(14 * th + y * .5) }));
    const puff = curveFn([[0, 4.2], [.25, 7.8], [.7, 7.4], [1, 4.0]]);
    [1, -1].forEach((s) => g.add(tube({ pts: mir(ARM, s), range: [0, .4], r: (t) => puff(t / .4), mat: m, uRep: 4, steps: 16, segs: 32, len: 40 })));
    cap(g, m);
    return g;
  };

  D.d03 = () => { // green ruched bodycon midi
    const g = new T.Group(), m = mk(PAT.dots({ base: "#7fbf8a", dot: "#d94545", r: .09 }));
    const r = curveFn([[40, 12.4], [52, 14], [64, 15.9], [76, 17.2], [84, 17.6], [90, 17.6], [98, 15.4], [106, 13.4], [116, 15], [126, 17.2], [134, 16.8], [139, 14.8]]);
    const wg = (th, c) => Math.exp(-Math.pow((th - c) / .55, 2));
    g.add(shell({ r, mat: m, uTurns: 14, vScale: 7, top: topEdge(139, NECK.scoop(16, 1.0)), hem: flat(40), mod: (th, y) => (.7 * wg(th, 1.25) + .4 * wg(th, -1.25)) * Math.sin(.95 * y + 3 * th) }));
    return g;
  };

  D.d04 = () => { // pink pleated midi, chevron bodice
    const g = new T.Group(), chev = mk(PAT.chevron({ a: "#d9488f", b: "#f8d9e6" })), stripes = mk(PAT.stripes({ a: "#d9488f", b: "#f6cfe0", ratio: .6 }));
    const rb = curveFn([[104, 12.9], [116, 14.8], [126, 17.0], [134, 16.6], [139, 14.4], [143, 7.4], [147, 6.3]]);
    g.add(shell({ r: rb, mat: chev, uTurns: 1, vScale: 6, top: flat(147), hem: flat(104) }));
    const rs = curveFn([[26, 27], [40, 25], [60, 22.5], [78, 19.8], [92, 17.6], [100, 15.4], [108, 14.2]]);
    g.add(shell({ r: rs, mat: stripes, uTurns: 30, vScale: 20, top: flat(106), hem: (th) => 31 + 4.5 * Math.sin(th), mod: (th, y, v) => .95 * Math.sin(40 * th) * sstep(0, .25, v) }));
    g.add(shell({ r: curveFn([[100, 14.8], [112, 14.8]]), mat: mk(null, 0xc23b80), top: flat(108), hem: flat(102), segs: 72, rows: 4, mod: () => .8 }));
    const sl = curveFn([[0, 4.6], [.12, 6.8], [.3, 6.2], [.55, 4.4], [.75, 4.7], [.9, 3.4], [1, 3.1]]);
    [1, -1].forEach((s) => {
      g.add(tube({ pts: mir(ARM, s), range: [0, .93], r: (t) => sl(t), mat: mk(null, 0xf3c2d7, { opacity: .96 }), steps: 36, segs: 32 }));
      g.add(tube({ pts: mir(ARM, s), range: [.9, 1], r: () => 3.3, mat: mk(null, 0xd9488f), steps: 6, segs: 24 }));
    });
    cap(g, mk(null, 0xf3c2d7));
    return g;
  };

  D.d05 = () => { // blue diagonal-stripe jumpsuit
    const g = new T.Group(), m = mk(PAT.diag({ a: "#3b8fc6", b: "#e6f1f7", ratio: .45 }));
    const r = curveFn([[72, 15.2], [80, 15.8], [90, 17.2], [98, 15.4], [106, 13.4], [116, 15], [126, 17.1], [131, 16.6]]);
    g.add(shell({ r, mat: m, uTurns: 5, vScale: 18, top: topEdge(131, NECK.v(15, .7)), hem: flat(74), segs: 90, rows: 40 }));
    g.add(shell({ r: curveFn(BODY.map(([y, rr]) => [y, rr + 1.3])), mat: mk(null, 0x2f5776), top: flat(109), hem: flat(98), segs: 72, rows: 6 }));
    const buckle = new T.Mesh(new T.BoxGeometry(5.4, 4.2, .9), mk(null, 0xc9ced3, { rough: .35 })); buckle.position.set(0, 103.5, 10.3); g.add(buckle);
    const leg = [[7.6, 86, 0], [8.4, 64, .5], [8.8, 44, .3], [7.4, 24, -.3], [5.8, 10, 0]], lr = curveFn([[0, 8.7], [.2, 9.3], [.55, 9.8], [.8, 7.4], [.93, 5.8], [1, 6.2]]);
    [1, -1].forEach((s) => {
      g.add(tube({ pts: mir(leg, s), r: (t) => lr(t), mat: m, uRep: 5, len: 80, vScale: 18, steps: 36, segs: 36 }));
      g.add(tube({ pts: mir(leg, s), range: [.93, 1], r: () => 6.2, mat: mk(null, 0x2f6fa6), steps: 4, segs: 28 }));
      const st = [[s * 7, 129.5, 10.3], [s * 9.6, 141, 0], [s * 7, 129.5, -9.8]];
      g.add(tube({ pts: st, r: () => .6, mat: mk(null, 0x3b8fc6), steps: 16, segs: 8 }));
    });
    return g;
  };

  D.d06 = () => { // striped wrap dress, ruffle hem
    const g = new T.Group(), m = mk(PAT.stripes({ a: "#9b7bc9", b: "#1b1722", ratio: .55 }));
    const r = curveFn([[22, 26], [44, 27], [60, 26], [74, 23], [86, 19.8], [96, 16.6], [104, 13.6], [116, 14.9], [126, 17], [134, 16.4]]);
    g.add(shell({ r, mat: m, uTurns: 36, vScale: 30, top: topEdge(134, NECK.v(27, .88)), hem: highLow(24, 58, 1.2, .35), mod: (th, y, v) => 1.9 * Math.pow(v, 2.2) * Math.sin(11 * th + y * .1) }));
    g.add(shell({ r: curveFn(BODY.map(([y, rr]) => [y, rr + 1.1])), mat: mk(null, 0x2a2230), top: flat(108), hem: flat(100), segs: 72, rows: 6 }));
    [[11.5, 103.5, 8.8, .5], [13.8, 103, 8.3, -.5]].forEach(([x, y, z, rz]) => { const b = new T.Mesh(new T.SphereGeometry(1, 16, 12), mk(null, 0x2a2230)); b.position.set(x, y, z); b.scale.set(3.2, 2.2, 1); b.rotation.z = rz; g.add(b); });
    const tail = new T.Mesh(new T.BoxGeometry(1.6, 9, .6), mk(null, 0x2a2230)); tail.position.set(12.4, 96, 8.4); tail.rotation.z = .12; g.add(tail);
    [1, -1].forEach((s) => g.add(tube({ pts: mir(ARM, s), range: [0, .34], r: (t, ph) => (4.4 + 3.6 * Math.pow(t / .34, 1.2)) * (1 + .1 * Math.sin(7 * ph)), mat: m, uRep: 12, steps: 14, segs: 40, len: 40 })));
    cap(g, m);
    return g;
  };

  D.d07 = () => { // blue heart blouse + orange shorts
    const g = new T.Group(), bl = mk(PAT.hearts({ base: "#2b86c5", dot: "#2d4658", r: .2 })), or = 0xee8a45;
    const r = curveFn([[94, 17.6], [100, 16.6], [108, 15.8], [118, 16.8], [126, 17.6], [134, 16.6], [140, 13.8], [144, 8]]);
    g.add(shell({ r, mat: bl, uTurns: 11, vScale: 9, top: topEdge(143, NECK.v(7, .5)), hem: flat(95), mod: (th, y, v) => -.6 * Math.pow(v, 4) * Math.sin(22 * th) }));
    const sl = curveFn([[0, 4.6], [.2, 7.0], [.55, 7.4], [.9, 3.9], [1, 3.4]]);
    [1, -1].forEach((s) => {
      g.add(tube({ pts: mir(ARM, s), range: [0, .8], r: (t) => sl(t / .8), mat: bl, uRep: 4, steps: 24, segs: 36, len: 40 }));
      g.add(tube({ pts: mir(ARM, s), range: [.78, .87], r: () => 3.3, mat: mk(null, 0x2b86c5), steps: 4, segs: 24 }));
    });
    g.add(shell({ r: curveFn([[74, 14.6], [84, 17.2], [92, 17.2], [100, 15.2]]), mat: mk(null, or), top: flat(101), hem: flat(74), segs: 80, rows: 14 }));
    const leg = [[7.6, 88, 0], [7.4, 76, .3], [7.2, 64, .4]];
    [1, -1].forEach((s) => {
      g.add(tube({ pts: mir(leg, s), r: (t) => 8.4 - .2 * t + (t > .8 ? .5 : 0), mat: mk(null, or), steps: 12, segs: 28 }));
      g.add(tube({ pts: mir(leg, s), range: [.8, 1], r: () => 8.9, mat: mk(null, 0xd9712c), steps: 5, segs: 28 }));
    });
    const pocket = new T.Mesh(new T.BoxGeometry(6, 7, .5), mk(null, 0xe07a33)); pocket.position.set(-7.6, 80, 8.9); g.add(pocket);
    cap(g, bl);
    return g;
  };

  D.d08 = () => { // plunge peplum + red mini
    const g = new T.Group(), top = mk(PAT.tris({ base: "#c4d437", dot: "#e0503a", r: .13 }));
    g.add(shell({ r: curveFn([[70, 17.6], [80, 17.8], [90, 17.4], [100, 14.9]]), mat: mk(null, 0xe8444a), top: flat(100), hem: flat(70), segs: 80, rows: 20 }));
    g.add(shell({ r: curveFn([[104, 13.4], [116, 14.8], [126, 17.0], [134, 16.6], [141, 14.4]]), mat: top, uTurns: 11, vScale: 9, top: topEdge(141, NECK.v(36, .92)), hem: flat(105), segs: 90, rows: 30 }));
    g.add(shell({ r: curveFn([[86, 25], [96, 20.4], [106, 14.4]]), mat: top, uTurns: 11, vScale: 9, top: flat(106), hem: flat(86), mod: (th, y, v) => 1.4 * Math.pow(v, 1.6) * Math.sin(13 * th) }));
    const sl = curveFn([[0, 4.5], [.2, 6], [.5, 6.8], [.85, 5.2], [.95, 3.2], [1, 3]]);
    [1, -1].forEach((s) => {
      g.add(tube({ pts: mir(ARM, s), range: [0, 1], r: (t) => sl(t), mat: top, uRep: 4, steps: 36, segs: 32, len: 80 }));
      g.add(tube({ pts: mir(ARM, s), range: [.93, 1], r: () => 3.2, mat: mk(null, 0xb5c52c), steps: 5, segs: 24 }));
    });
    cap(g, top);
    return g;
  };

  D.d09 = () => { // purple asymmetric ring-dot
    const g = new T.Group(), m = mk(PAT.rings({ base: "#a58fd8", dot: "#1f2257", r: .13 }));
    const r = curveFn([[34, 31], [48, 28], [62, 24], [74, 21], [84, 18.8], [92, 17], [98, 15.2], [106, 13.2], [116, 14.8], [126, 17], [134, 16.6], [140, 14.4]]);
    g.add(shell({ r, mat: m, uTurns: 10, vScale: 10, top: topEdge(141, NECK.scoop(5, .6)), hem: (th) => 50 + 15 * Math.sin(th), mod: (th, y, v) => .6 * Math.pow(v, 3) * Math.sin(9 * th) }));
    g.add(shell({ r: curveFn(BODY.map(([y, rr]) => [y, rr + 1])), mat: mk(null, 0x8c73c8), top: flat(108), hem: flat(103), segs: 72, rows: 4 }));
    const puff = curveFn([[0, 4.4], [.25, 7.6], [.75, 7], [1, 4.1]]);
    [1, -1].forEach((s) => g.add(tube({ pts: mir(ARM, s), range: [0, .62], r: (t) => puff(t / .62), mat: m, uRep: 4, steps: 22, segs: 36, len: 40 })));
    cap(g, m);
    return g;
  };

  /* ---------- viewer ---------- */
  function mount(host, id, o) {
    o = o || {};
    if (!T || !D[id]) return null;
    let renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: !!o.preserve }); }
    catch (e) { return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    host.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%;touch-action:pan-y;";

    const scene = new T.Scene();
    scene.add(new T.HemisphereLight(0xffffff, 0xcdbba5, .62));
    const key = new T.DirectionalLight(0xffffff, .62); key.position.set(90, 220, 260); scene.add(key);
    const rim = new T.DirectionalLight(0xfff1e0, .3); rim.position.set(-160, 140, -220); scene.add(rim);
    const fill = new T.DirectionalLight(0xffffff, .12); fill.position.set(-140, 60, 200); scene.add(fill);

    const root = new T.Group();
    root.add(mannequin()); if (!o.bare) root.add(D[id]());
    const plate = new T.Mesh(new T.CylinderGeometry(30, 32, 2.4, 48), new T.MeshStandardMaterial({ color: 0xe6d8c6, roughness: .9 }));
    plate.position.y = -1.2; root.add(plate);
    scene.add(root);

    const cam = new T.PerspectiveCamera(27, 1, 10, 1200);
    cam.position.set(0, 92, 415); cam.lookAt(0, 87, 0);

    let angle = o.angle == null ? .5 : o.angle, auto = o.auto !== false, dragging = false, sx = 0, sa = 0, visible = true, dead = false;
    const draw = () => { root.rotation.y = angle; renderer.render(scene, cam); };
    const size = () => { const w = host.clientWidth || 300, h = host.clientHeight || 420; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); draw(); };
    size();
    let ro = null; if ("ResizeObserver" in window) { ro = new ResizeObserver(size); ro.observe(host); }
    let io = null; if ("IntersectionObserver" in window) { io = new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); }, { threshold: .05 }); io.observe(host); }
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const el = renderer.domElement;
    el.addEventListener("pointerdown", (e) => { dragging = true; sx = e.clientX; sa = angle; auto = false; el.setPointerCapture(e.pointerId); api.onInteract && api.onInteract(); });
    el.addEventListener("pointermove", (e) => { if (dragging) { angle = sa + (e.clientX - sx) * .013; draw(); } });
    const up = () => { dragging = false; };
    el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);

    function destroy() { dead = true; if (ro) ro.disconnect(); if (io) io.disconnect(); renderer.dispose(); try { renderer.forceContextLoss(); } catch (e) {} }
    (function loop() {
      if (dead) return;
      if (!host.isConnected && host.__seen) { destroy(); return; }
      if (host.isConnected) host.__seen = true;
      if (visible && auto && !dragging && !reduce) { angle += .007; draw(); }
      requestAnimationFrame(loop);
    })();

    const api = {
      setAngle(a) { angle = a; auto = false; draw(); },
      turn(d) { angle += d; auto = false; draw(); },
      toggleAuto() { auto = !auto; return auto; },
      isAuto() { return auto; },
      destroy, root
    };
    return api;
  }

  window.Garment3D = {
    mount, ids: Object.keys(D), supported: !!T,
    names: { d01: "01 · Yellow polka high-low dress", d02: "02 · Pink puff-sleeve mini dress", d03: "03 · Green ruched bodycon midi", d04: "04 · Pink pleated midi, chevron bodice", d05: "05 · Blue diagonal-stripe jumpsuit", d06: "06 · Striped wrap dress, ruffle hem", d07: "07 · Blue heart blouse, orange shorts", d08: "08 · Plunge peplum, red mini", d09: "09 · Purple asymmetric ring-dot dress" }
  };
})();
