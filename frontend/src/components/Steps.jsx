import React from 'react';

export const Steps = ({ current }) => {
  const labels = ['Connect', 'Choose', 'Filter', 'Create'];
  const pct = ((current - 1) / 3) * 100;
  return (
    <div className="w-full max-w-[480px] mb-8 px-1">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between">
        {labels.map((l, i) => (
          <span key={l} className={`font-display text-[11px] font-semibold tracking-[0.06em] uppercase ${i + 1 <= current ? 'text-text2' : 'text-text3'}`}>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
};
