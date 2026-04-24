import React from 'react';

export const CoverArt = ({ hue, size = 48, radius = 10, name }) => (
  <div style={{
    width: size, height: size, borderRadius: radius, flexShrink: 0,
    background: `linear-gradient(135deg, oklch(0.3 0.15 ${hue}), oklch(0.6 0.2 ${hue}))`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: size * 0.35, fontWeight: 700, color: 'white', fontFamily: 'Space Grotesk',
    userSelect: 'none',
  }}>
    {name?.[0]?.toUpperCase()}
  </div>
);
