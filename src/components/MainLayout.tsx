import React from "react";
import { cn } from "@/lib/utils";
import BottomNav from "./BottomNav";
import HistoryView from "./HistoryView";
import { SettingsBottomSheet } from "./SettingsBottomSheet";
import { useState } from "react";

type PanelId = "settings" | "models" | "vocabulary" | "info" | "advanced" | "postprocessing" | null;

interface MainLayoutProps {
  children?: React.ReactNode;
  activePanel?: PanelId;
  onPanelChange: (panel: PanelId) => void;
}

// Design:
// Outer bg:       Woodsmoke  #141414  (dark)
// Left card:      White      #F8F8F8  (rounded, padded, history)
// Right panel:    Shark      #1F2023  (dark, settings/models slide in)
// Bottom nav:     #141414    (seamless with outer)

const MainLayout: React.FC<MainLayoutProps> = ({ children, activePanel, onPanelChange }) => {
  const isPanelOpen = !!activePanel;
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div
      className="h-screen w-full flex flex-col overflow-hidden select-none"
      style={{ background: "#141414" }}
    >
      {/* Content Row */}
      <div className="flex flex-1 overflow-hidden gap-2 p-2 pb-0">
        {/* Left: History card — clipped width, NOT reflowed */}
        <div
          className="flex flex-col overflow-hidden rounded transition-all duration-300 ease-in-out"
          style={{
            flex: isPanelOpen ? "0 0 60%" : "1 1 100%",
            minWidth: 0,
            background: "#FFFFFF",
          }}
        >
          {/* Inner wrapper stays at a fixed min-width so text never reflows */}
          <div
            style={{
              width: "100%",
              minWidth: isPanelOpen ? 0 : undefined,
              height: "100%",
              overflow: "hidden",
            }}
          >
            <HistoryView isPanelOpen={isPanelOpen} />
          </div>
        </div>

        {/* Right: Panel — slides in from right side, dark */}
        <div
          className={cn(
            "flex flex-col overflow-hidden rounded transition-all duration-300 ease-in-out",
            isPanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          style={{
            width: isPanelOpen ? "40%" : "0%",
            background: "transparent",
            flexShrink: 0,
            minWidth: isPanelOpen ? "0" : "0",
          }}
        >
          {isPanelOpen && (
            <div
              className="flex flex-col h-full w-full overflow-y-auto hidden-scrollbar"
              style={{
                animation: "slideInRight 0.25s ease-out",
              }}
            >
              {children}
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav — dark, seamless */}
      <BottomNav 
        activePanel={activePanel} 
        onPanelChange={onPanelChange} 
        onOpenInfoSheet={() => setIsSheetOpen(true)}
      />

      {/* Info Bottom Sheet */}
      <SettingsBottomSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} />

      {/* Slide-in animation keyframe */}
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default MainLayout;
