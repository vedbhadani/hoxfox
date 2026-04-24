import React from 'react';

export const OrbField = () => (
  <div className="orb-field">
    {[
      { w: 600, h: 600, top: '-10%', left: '-10%', color: 'oklch(0.65 0.22 310 / 0.5)', dur: '18s' },
      { w: 500, h: 500, top: '40%', right: '-8%', color: 'oklch(0.82 0.22 145 / 0.4)', dur: '22s' },
      { w: 400, h: 400, top: '60%', left: '10%', color: 'oklch(0.72 0.22 25 / 0.35)', dur: '26s' },
      { w: 350, h: 350, top: '20%', left: '50%', color: 'oklch(0.72 0.18 225 / 0.3)', dur: '20s' },
    ].map((o, i) => (
      <div key={i} className="orb" style={{
        width: o.w, height: o.h,
        top: o.top, left: o.left, right: o.right,
        background: o.color,
        animationDuration: o.dur,
        animationDelay: `${i * -4}s`,
      }} />
    ))}
  </div>
);
