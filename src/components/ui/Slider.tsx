import { SettingContainer } from "./SettingContainer";
import { useState, useRef, useEffect } from "react";

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  label: string;
  description: string;
  descriptionMode?: "inline" | "tooltip";
  grouped?: boolean;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min,
  max,
  step = 0.01,
  disabled = false,
  label,
  description,
  descriptionMode = "tooltip",
  grouped = false,
  showValue = true,
  formatValue = (v) => v.toFixed(2),
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const sliderRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  const percentage = ((value - min) / (max - min)) * 100;

  // Calculate position for tooltip
  const getTooltipStyle = () => {
    // Thumb is 16px wide, track has padding usually. We need to center the tooltip over the thumb.
    return {
      left: `calc(${percentage}% + (${8 - percentage * 0.16}px))`,
      transform: 'translateX(-50%)'
    };
  };

  return (
    <SettingContainer
      title={label}
      description={description}
      descriptionMode={descriptionMode}
      grouped={grouped}
      layout="horizontal"
      disabled={disabled}
    >
      <div className="w-full pt-6 pb-2 relative">
        {/* Hover/Active Tooltip */}
        {(isDragging || hoverValue !== null) && showValue && (
          <div
            className="absolute -top-1 px-2.5 py-1 bg-[#27272A] text-white text-[11px] font-medium rounded shadow-lg pointer-events-none z-10 flex flex-col items-center justify-center after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-solid after:border-[4px] after:border-t-[#27272A] after:border-x-transparent after:border-b-transparent"
            style={getTooltipStyle()}
          >
            {formatValue(hoverValue !== null ? hoverValue : value)}
          </div>
        )}

        {/* Range Input */}
        <div className="relative flex items-center h-4">
          <input
            ref={sliderRef}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleChange}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            onMouseEnter={() => setHoverValue(value)}
            onMouseMove={(e) => {
              if (sliderRef.current) {
                const rect = sliderRef.current.getBoundingClientRect();
                const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                const pct = x / rect.width;
                const hoverVal = min + (max - min) * pct;
                
                // Snap to step
                const steppedVal = Math.round(hoverVal / step) * step;
                // Clamp to min/max
                const finalVal = Math.max(min, Math.min(steppedVal, max));
                setHoverValue(finalVal);
              }
            }}
            onMouseLeave={() => setHoverValue(null)}
            disabled={disabled}
            className="w-full h-[4px] bg-[#27272A] rounded-full appearance-none outline-none cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#D4D4D8] [&::-webkit-slider-thumb]:rounded-[4px] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-110 active:[&::-webkit-slider-thumb]:scale-95
                       [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-[#D4D4D8] [&::-moz-range-thumb]:rounded-[4px] [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:transition-transform hover:[&::-moz-range-thumb]:scale-110 active:[&::-moz-range-thumb]:scale-95"
            style={{
              background: `linear-gradient(to right, #3B82F6 ${percentage}%, #27272A ${percentage}%)`,
            }}
          />
        </div>

        {/* Min/Max Labels below track */}
        <div className="flex justify-between items-center mt-3 px-1">
          <span className="text-[11px] text-[#71717A] font-medium">{formatValue(min)}</span>
          <span className="text-[11px] text-[#71717A] font-medium">{formatValue(max)}</span>
        </div>
      </div>
    </SettingContainer>
  );
};
