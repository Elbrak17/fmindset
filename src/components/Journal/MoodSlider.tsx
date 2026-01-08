'use client';

import React, { useCallback, useId } from 'react';

export interface MoodSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  colorClass?: string;
  emojis?: string[];
  description?: string;
  isInverse?: boolean; // For stress where lower is better
}

/**
 * Get emoji based on value (0-100)
 * For normal metrics (mood, energy): higher is better
 * For inverse metrics (stress): lower is better
 */
function getEmoji(value: number, emojis: string[], isInverse: boolean): string {
  const normalizedValue = isInverse ? 100 - value : value;
  
  if (normalizedValue <= 20) return emojis[0];
  if (normalizedValue <= 40) return emojis[1];
  if (normalizedValue <= 60) return emojis[2];
  if (normalizedValue <= 80) return emojis[3];
  return emojis[4];
}

/**
 * MoodSlider Component
 * A reusable slider with emoji indicators for mood, energy, and stress tracking.
 * Supports keyboard navigation and is fully accessible.
 */
export function MoodSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  colorClass = 'bg-blue-500',
  emojis = ['😢', '😕', '😐', '😊', '😄'],
  description,
  isInverse = false,
}: MoodSliderProps) {
  const sliderId = useId();
  const descriptionId = useId();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value, 10);
      onChange(newValue);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      let newValue = value;
      const step = e.shiftKey ? 10 : 1;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          newValue = Math.min(max, value + step);
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          newValue = Math.max(min, value - step);
          break;
        case 'Home':
          newValue = min;
          break;
        case 'End':
          newValue = max;
          break;
        default:
          return;
      }

      if (newValue !== value) {
        e.preventDefault();
        onChange(newValue);
      }
    },
    [value, min, max, onChange]
  );

  const emoji = getEmoji(value, emojis, isInverse);
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor={sliderId}
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-hidden="true">
            {emoji}
          </span>
          <span className="text-sm font-semibold text-gray-900 min-w-[3ch] text-right">
            {value}
          </span>
        </div>
      </div>

      {description && (
        <p id={descriptionId} className="text-xs text-gray-500 mb-2">
          {description}
        </p>
      )}

      <div className="relative">
        {/* Track background */}
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          {/* Filled track */}
          <div
            className={`h-full ${colorClass} rounded-full transition-all duration-150`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Slider input */}
        <input
          id={sliderId}
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-describedby={description ? descriptionId : undefined}
          className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer"
          style={{ margin: 0 }}
        />

        {/* Custom thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 ${colorClass} rounded-full shadow-md border-2 border-white pointer-events-none transition-all duration-150`}
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400">{min}</span>
        <span className="text-xs text-gray-400">{max}</span>
      </div>
    </div>
  );
}

export default MoodSlider;
