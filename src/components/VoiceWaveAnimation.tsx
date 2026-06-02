import { useEffect, useState } from 'react';

interface VoiceWaveAnimationProps {
  isActive: boolean;
  color?: 'slate' | 'emerald';
  size?: 'sm' | 'md' | 'lg';
}

export function VoiceWaveAnimation({ isActive, color = 'slate', size = 'md' }: VoiceWaveAnimationProps) {
  const [bars, setBars] = useState<number[]>(Array(6).fill(30));

  useEffect(() => {
    if (!isActive) {
      setBars(Array(6).fill(30));
      return;
    }

    const interval = setInterval(() => {
      setBars(prev => prev.map(() => 30 + Math.random() * 70));
    }, 120);

    return () => clearInterval(interval);
  }, [isActive]);

  const colorClasses = {
    slate: 'bg-gradient-to-t from-slate-500 to-slate-400',
    emerald: 'bg-gradient-to-t from-emerald-500 to-emerald-400',
  };

  const sizeClasses = {
    sm: 'w-1',
    md: 'w-1.5',
    lg: 'w-2',
  };

  return (
    <div className="flex items-center justify-center gap-0.5">
      {bars.map((height, index) => (
        <div
          key={index}
          className={`${sizeClasses[size]} rounded-full ${colorClasses[color]} transition-all duration-100 ease-out`}
          style={{ height: `${(height / 100) * (size === 'sm' ? 24 : size === 'md' ? 48 : 80)}px` }}
        />
      ))}
    </div>
  );
}
