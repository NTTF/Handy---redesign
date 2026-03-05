import React, { useEffect, useRef, useState } from "react";
import { Tooltip } from "./Tooltip";

// Flat row style — matches reference design:
// Full-width rows on dark bg, no card borders, spacious padding,
// label on left (white), value/control on right (muted)

interface SettingContainerProps {
  title: string;
  description: string;
  children: React.ReactNode;
  descriptionMode?: "inline" | "tooltip";
  grouped?: boolean;
  layout?: "horizontal" | "stacked";
  disabled?: boolean;
  tooltipPosition?: "top" | "bottom";
}

export const SettingContainer: React.FC<SettingContainerProps> = ({
  title,
  description,
  children,
  descriptionMode = "tooltip",
  grouped = false,
  layout = "horizontal",
  disabled = false,
  tooltipPosition = "top",
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    };
    if (showTooltip) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showTooltip]);

  const toggleTooltip = () => setShowTooltip(!showTooltip);

  const rowStyle: React.CSSProperties = {
    padding: "8px 0",
    opacity: disabled ? 0.45 : 1,
  };

  const InfoIcon = () => (
    <div
      ref={tooltipRef}
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={toggleTooltip}
      style={{ flexShrink: 0 }}
    >
      <svg
        style={{ width: 14, height: 14, color: "var(--color-mid-gray, #5A5E6E)", cursor: "help" }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-label="More information"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleTooltip(); }
        }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {showTooltip && (
        <Tooltip targetRef={tooltipRef} position={tooltipPosition}>
          <p className="text-sm text-center leading-relaxed" style={{ fontSize: 10 }}>{description}</p>
        </Tooltip>
      )}
    </div>
  );

  if (layout === "stacked") {
    return (
      <div style={rowStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text, #F8F8F8)" }}>
            {title}
          </span>
          {descriptionMode === "tooltip" && <InfoIcon />}
        </div>
        {descriptionMode === "inline" && (
          <p style={{ fontSize: 12, color: "var(--color-mid-gray, #5A5E6E)", marginBottom: 8 }}>
            {description}
          </p>
        )}
        <div>{children}</div>
      </div>
    );
  }

  // Horizontal (default) — label left, control right
  return (
    <div style={{ ...rowStyle, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
      {/* Left: title + optional info icon */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text, #F8F8F8)" }}>
          {title}
        </span>
        {descriptionMode === "tooltip" && <InfoIcon />}
        {descriptionMode === "inline" && (
          <span style={{ fontSize: 10, color: "var(--color-mid-gray, #5A5E6E)", marginLeft: 4 }}>
            {description}
          </span>
        )}
      </div>

      {/* Right: control */}
      <div style={{ flexShrink: 0, position: "relative" }}>
        {children}
      </div>
    </div>
  );
};
