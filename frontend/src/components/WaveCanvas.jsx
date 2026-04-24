import React, { useEffect, useRef } from 'react';
import { SONG_FRAGMENTS } from '../data';

export const WaveCanvas = () => {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const LABEL_TOPS = [0.20, 0.32, 0.50, 0.63, 0.75];
    const WAVES = [
      { color: [120, 60, 255], speed: 0.018, freq: 0.016, amp: 22 },
      { color: [255, 100, 60], speed: 0.022, freq: 0.020, amp: 20 },
      { color: [60, 180, 255], speed: 0.015, freq: 0.013, amp: 24 },
      { color: [60, 220, 160], speed: 0.020, freq: 0.018, amp: 18 },
      { color: [255, 200, 60], speed: 0.017, freq: 0.022, amp: 20 },
    ];
    const phases = WAVES.map(() => Math.random() * Math.PI * 2);

    // Song fragments: each pinned to a wave with a fractional x position
    const fragments = WAVES.map((w, wi) =>
      Array.from({ length: 4 }, (_, fi) => ({
        wi, frac: 0.08 + fi * 0.11 + Math.random() * 0.04,
        text: SONG_FRAGMENTS[(wi * 4 + fi) % SONG_FRAGMENTS.length],
      }))
    ).flat();

    let dpr = window.devicePixelRatio || 1;
    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };
    resize();
    window.addEventListener('resize', resize);

    const getWaveY = (wi, x, W, H) => {
      const cy = H / 2, mergeX = W * 0.50;
      const startY = LABEL_TOPS[wi] * H;
      const rawT = Math.min(1, x / mergeX);
      const conv = rawT * rawT * (3 - 2 * rawT);
      const baseY = startY + (cy - startY) * conv;
      const amp = WAVES[wi].amp * (1 - conv);
      return baseY + amp * Math.sin(phases[wi] + x * WAVES[wi].freq);
    };

    const draw = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const cy = H / 2, mergeX = W * 0.50;

      // Subtle dot grid background
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      const gx = 40, gy = 40;
      for (let gxi = 0; gxi * gx < W; gxi++) {
        for (let gyi = 0; gyi * gy < H; gyi++) {
          ctx.beginPath();
          ctx.arc(gxi * gx + 20, gyi * gy + 20, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Radial glow at merge point
      const grad = ctx.createRadialGradient(mergeX, cy, 0, mergeX, cy, 120);
      grad.addColorStop(0, 'rgba(160,255,100,0.12)');
      grad.addColorStop(1, 'rgba(160,255,100,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(mergeX - 120, cy - 120, 240, 240);

      // Draw each wave
      WAVES.forEach((wave, wi) => {
        phases[wi] += wave.speed;
        const startY = LABEL_TOPS[wi] * H;
        ctx.beginPath();
        const steps = 200;
        for (let s = 0; s <= steps; s++) {
          const x = (s / steps) * W;
          if (x > mergeX) break;
          const y = getWaveY(wi, x, W, H);
          s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        const [r, g, b] = wave.color;
        // gradient stroke: full color → fades near merge
        const sg = ctx.createLinearGradient(0, 0, mergeX, 0);
        sg.addColorStop(0, `rgba(${r},${g},${b},0.7)`);
        sg.addColorStop(0.7, `rgba(${r},${g},${b},0.55)`);
        sg.addColorStop(1, `rgba(${r},${g},${b},0.1)`);
        ctx.strokeStyle = sg;
        ctx.lineWidth = 1.8;
        ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.stroke();

        // Node dots along the wave
        [0.15, 0.30, 0.45].forEach(frac => {
          const nx = frac * mergeX;
          const ny = getWaveY(wi, nx, W, H);
          ctx.beginPath();
          ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},0.5)`;
          ctx.fill();
        });
      });

      // Song fragment labels along waves
      ctx.font = '500 9px "Space Grotesk", sans-serif';
      ctx.textBaseline = 'middle';
      fragments.forEach(f => {
        if (f.frac > 0.95) return;
        const x = f.frac * mergeX;
        const y = getWaveY(f.wi, x, W, H);
        const [r, g, b] = WAVES[f.wi].color;
        ctx.fillStyle = `rgba(${r},${g},${b},0.28)`;
        ctx.fillText(f.text, x + 8, y - 10);
      });

      // Merged lime wave right of center
      ctx.beginPath();
      for (let s = 0; s <= 120; s++) {
        const x = mergeX + (s / 120) * (W - mergeX);
        const y = cy + 20 * Math.sin(phases[0] + x * 0.014);
        s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      const limeGrad = ctx.createLinearGradient(mergeX, 0, W, 0);
      limeGrad.addColorStop(0, 'rgba(160,255,100,0.4)');
      limeGrad.addColorStop(0.2, 'rgba(160,255,100,0.95)');
      limeGrad.addColorStop(1, 'rgba(160,255,100,0.6)');
      ctx.strokeStyle = limeGrad;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(160,255,100,0.5)';
      ctx.shadowBlur = 18;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Node dots on merged wave
      [0.15, 0.4, 0.65, 0.88].forEach(f => {
        const x = mergeX + f * (W - mergeX);
        const y = cy + 20 * Math.sin(phases[0] + x * 0.014);
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(160,255,100,0.7)';
        ctx.shadowColor = 'rgba(160,255,100,0.8)'; ctx.shadowBlur = 8;
        ctx.fill(); ctx.shadowBlur = 0;
      });

      // Merge point pulse
      const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.003);
      ctx.beginPath();
      ctx.arc(mergeX, cy, 5 + pulse * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(160,255,100,${0.3 + pulse * 0.2})`;
      ctx.shadowColor = 'rgba(160,255,100,0.9)'; ctx.shadowBlur = 20 + pulse * 10;
      ctx.fill(); ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.arc(mergeX, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(160,255,100,1)'; ctx.fill();

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};
