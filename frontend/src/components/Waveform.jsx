import React from 'react';

export const Waveform = ({ active, color = 'lime', bars = 18, height = 32 }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height }}>
    {Array.from({ length: bars }, (_, i) => (
      <div key={i} className="wave-bar" style={{
        height: `${20 + Math.random() * 80}%`,
        background: `var(--${color})`,
        animationDuration: `${0.4 + Math.random() * 0.6}s`,
        animationDelay: `${i * 0.04}s`,
        opacity: active ? 1 : 0.3,
        animationPlayState: active ? 'running' : 'paused',
      }} />
    ))}
  </div>
);
