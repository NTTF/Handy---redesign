import React, { useEffect, useState } from "react";
import { 
  ChevronsUpDown,
  AudioLines,
  Sparkle
} from "lucide-react";
import { listen } from "@tauri-apps/api/event";
import { commands } from "@/bindings";

type PanelId = "settings" | "models" | "vocabulary" | "info" | "advanced" | "postprocessing" | null;

interface BottomNavProps {
  onPanelChange: (panel: PanelId) => void;
  activePanel: PanelId;
  onOpenInfoSheet?: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ onPanelChange, activePanel, onOpenInfoSheet }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [micLevel, setMicLevel] = useState(0);

  useEffect(() => {
    let unlistenShow: () => void;
    let unlistenHide: () => void;
    let unlistenMic: () => void;

    const setupListeners = async () => {
      unlistenShow = await listen("show-overlay", () => setIsRecording(true));
      unlistenHide = await listen("hide-overlay", () => {
        setIsRecording(false);
        setMicLevel(0);
      });
      unlistenMic = await listen<number[]>("mic-level", (event) => {
        if (event.payload && event.payload.length > 0) {
          const avg = event.payload.reduce((a, b) => a + b, 0) / event.payload.length;
          setMicLevel(avg);
        }
      });
      const recording = await commands.isRecording();
      setIsRecording(recording);
    };

    setupListeners();
    return () => {
      if (unlistenShow) unlistenShow();
      if (unlistenHide) unlistenHide();
      if (unlistenMic) unlistenMic();
    };
  }, []);

  // SVG matching the exact reference for Info (octagon with dot at top, line at bottom)
  const InfoIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
      <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
      <line x1="12" y1="12" x2="12" y2="16" />
    </svg>
  );

  // SVG for Post Process icon (box with cut corner, sparkle, and waveform)
  const ProcessIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Box with gap in top right for the sparkle */}
      <path d="M15 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9" strokeLinecap="round" strokeLinejoin="round" />
      {/* Waveform bars */}
      <line x1="7" y1="14" x2="7" y2="10" strokeLinecap="round" />
      <line x1="10" y1="16" x2="10" y2="8" strokeLinecap="round" />
      <line x1="13" y1="18" x2="13" y2="6" strokeLinecap="round" />
      <line x1="16" y1="16" x2="16" y2="12" strokeLinecap="round" />
      {/* Sparkle */}
      <path d="M19 2l1.5 3.5L24 7l-3.5 1.5L19 12l-1.5-3.5L14 7l3.5-1.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  // SVG for Model Dropdown Arrows (triangle up, line, triangle down)
  const ModelArrowsIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12,4 18,10 6,10" />
      <rect x="6" y="11.5" width="12" height="1" />
      <polygon points="12,20 6,14 18,14" />
    </svg>
  );
  const CustomSettingsIcon = () => {
    const points = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8;
      const r = i % 2 === 0 ? 10 : 6.5;
      points.push(`${12 + r * Math.sin(angle)},${12 - r * Math.cos(angle)}`);
    }
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3.5" />
        <polygon points={points.join(" ")} />
      </svg>
    );
  };

  return (
    <div
      className="h-[60px] w-full flex items-center justify-between px-5 relative"
      style={{ background: "#141414" }}
    >
      {/* Left icons */}
      <div className="flex items-center gap-5 text-[#A1A1AA]">
        <button
          onClick={() => {
            if (onOpenInfoSheet) onOpenInfoSheet();
            else onPanelChange(activePanel === "info" ? null : "info");
          }}
          className="hover:text-[#F8F8F8] transition-colors"
        >
          <InfoIcon />
        </button>

        <button
          onClick={() => onPanelChange(activePanel === "postprocessing" ? null : "postprocessing")}
          className="hover:text-[#F8F8F8] transition-colors"
        >
          <ProcessIcon />
        </button>

        <button
          onClick={() => onPanelChange(activePanel === "advanced" ? null : "advanced")}
          className="hover:text-[#F8F8F8] transition-colors font-medium text-[17px] leading-none tracking-tight"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Aa
        </button>
      </div>

      {/* Center recording pill */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <button
          className="w-[52px] h-[36px] rounded-[18px] flex items-center justify-center transition-all duration-300"
          style={{
            background: isRecording ? "#EF4444" : "#40A9FF",
            boxShadow: isRecording
              ? "0 2px 12px rgba(239,68,68,0.4)"
              : "0 2px 12px rgba(64,169,255,0.45)",
            transform: isRecording ? `scale(${1 + micLevel * 0.15})` : undefined,
          }}
        >
          <AudioLines className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
        </button>
      </div>

      {/* Right: model selector + settings */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => onPanelChange(activePanel === "models" ? null : "models")}
          className="flex items-center gap-1.5 px-3 py-1.5 transition-all text-[13px] font-medium rounded-[18px]"
          style={{
            background: "#2A2A2A",
            color: "#F8F8F8",
          }}
        >
          <ModelArrowsIcon />
          <span style={{ paddingTop: 1 }}>Parakeet V3</span>
        </button>

        <button
          onClick={() => onPanelChange(activePanel === "settings" ? null : "settings")}
          className="relative flex items-center justify-center transition-all rounded-[16px] w-[32px] h-[32px] group"
          style={{
            background: "#2A2A2A",
            color: activePanel === "settings" ? "#F8F8F8" : "#E4E4E7",
          }}
        >
          <CustomSettingsIcon />
          {/* Cyan dot */}
          <span className="absolute -top-0.5 -right-0.5 w-[9px] h-[9px] rounded-full border-[2px] border-[#141414]" style={{ background: "#00d0ff" }} />
        </button>
      </div>
    </div>
  );
};

export default BottomNav;
