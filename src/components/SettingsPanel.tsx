import React from "react";
import { useTranslation } from "react-i18next";
import { SidebarSection, SECTIONS_CONFIG } from "./Sidebar";

interface SettingsPanelProps {
  activeSection: SidebarSection;
  onSectionChange: (section: SidebarSection) => void;
}

// Section display names (simplified, without "Settings" suffix)
const SECTION_LABELS: Record<string, string> = {
  general: "Settings",
  models: "Models",
  advanced: "Transcription",
  postprocessing: "Post Process",
  history: "History",
  debug: "Debug",
  about: "About",
};

const SettingsPanel: React.FC<SettingsPanelProps> = ({ activeSection }) => {
  const { t } = useTranslation();
  const ActiveComponent = SECTIONS_CONFIG[activeSection]?.component;
  const label = SECTION_LABELS[activeSection] ?? t(SECTIONS_CONFIG[activeSection]?.labelKey ?? "");

  return (
    <div
      className="flex flex-col h-full w-full"
      style={{ background: "transparent" }}
    >
      {/* Section header */}
      <div
        className="flex-shrink-0 px-4 py-3 text-center"
        style={{ borderBottom: "1px solid #2A2B30" }}
      >
        <h2
          className="text-[14px] font-medium"
          style={{ color: "#F8F8F8" }}
        >
          {label}
        </h2>
      </div>

      {/* Content area with dark CSS variable overrides */}
      <div
        className="flex-1 overflow-y-auto hidden-scrollbar px-4 py-4"
        style={{
          // Override CSS design tokens to dark values inside this scope
          ["--color-text" as string]: "#F8F8F8",
          ["--color-background" as string]: "transparent",
          ["--color-mid-gray" as string]: "#5A5E6E",
        }}
      >
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};

export default SettingsPanel;
