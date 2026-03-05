import React, { useEffect, useState } from "react";
import { 
  Cog,
  Sparkles,
  FileText,
  Settings, 
  ChevronDown,
  AudioLines
} from "lucide-react";
import { listen } from "@tauri-apps/api/event";
import { commands } from "@/bindings";

// Dark theme palette (matches outer window):
// Outer/Nav bg:   #141414
// Pill bg:        #1F2023
// Active pill:    #2F3035
// Active icon:    #F8F8F8
// Inactive icon:  #5A5E6E
// Model text:     #9FA3B3  
// Active model:   #F8F8F8

type PanelId = "settings" | "models" | "vocabulary" | "info" | "advanced" | "postprocessing" | null;

interface BottomNavProps {
  onPanelChange: (panel: PanelId) => void;
  activePanel: PanelId;
}

const BottomNav: React.FC<BottomNavProps> = ({ onPanelChange, activePanel }) => {
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

  const leftNavItems: Array<{ id: PanelId; icon: React.ElementType; label: string }> = [
    { id: "info",           icon: FileText,  label: "Info" },
    { id: "advanced",       icon: Cog,       label: "Advanced" },
    { id: "postprocessing", icon: Sparkles,  label: "Post Process" },
  ];

  return (
    <div
      className="h-[60px] w-full flex items-center justify-between px-4 relative"
      style={{ background: "#141414" }}
    >
      {/* Left icons — each separately styled, not grouped in a pill */}
      <div className="flex items-center gap-2">
        {leftNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;
          return (
            <button
              key={item.id as string}
              title={item.label}
              onClick={() => onPanelChange(isActive ? null : item.id)}
              className="p-2 transition-all"
              style={{
                borderRadius: 4,
                background: isActive ? "#2F3035" : "transparent",
                color: isActive ? "#F8F8F8" : "#A1A1AA",
              }}
            >
              <Icon className="w-[15px] h-[15px]" strokeWidth={isActive ? 2.5 : 2} />
            </button>
          );
        })}
      </div>

      {/* Center recording button — absolutely centered, stays rounded-full */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <button
          className="w-[60px] h-[38px] rounded-full flex items-center justify-center transition-all duration-300"
          style={{
            background: isRecording ? "#EF4444" : "#0988F0",
            boxShadow: isRecording
              ? "0 2px 12px rgba(239,68,68,0.4)"
              : "0 2px 12px rgba(9,136,240,0.45)",
            transform: isRecording ? `scale(${1 + micLevel * 0.15})` : undefined,
          }}
        >
          <AudioLines className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
        </button>
      </div>

      {/* Right: model selector + settings */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPanelChange(activePanel === "models" ? null : "models")}
          className="flex items-center gap-1.5 px-2 py-1 transition-all text-[12px] font-medium"
          style={{
            borderRadius: 4,
            background: activePanel === "models" ? "#2F3035" : "transparent",
            color: activePanel === "models" ? "#F8F8F8" : "#D4D4D8",
          }}
        >
          <div className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }} />
          <span>Parakeet V3</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-80" />
        </button>

        <button
          onClick={() => onPanelChange(activePanel === "settings" ? null : "settings")}
          className="p-2 transition-all"
          style={{
            borderRadius: 4,
            background: activePanel === "settings" ? "#2F3035" : "transparent",
            color: activePanel === "settings" ? "#F8F8F8" : "#A1A1AA",
          }}
        >
          <Settings className="w-[15px] h-[15px]" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default BottomNav;
