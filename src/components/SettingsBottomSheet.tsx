import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getVersion } from "@tauri-apps/api/app";
import { openUrl } from "@tauri-apps/plugin-opener";
import { X } from "lucide-react";

import { SettingContainer } from "./ui/SettingContainer";
import { Button } from "./ui/Button";
import { AppDataDirectory } from "./settings/AppDataDirectory";
import { AppLanguageSelector } from "./settings/AppLanguageSelector";
import { LogDirectory } from "./settings/debug";

interface SettingsBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsBottomSheet: React.FC<SettingsBottomSheetProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [version, setVersion] = useState("");

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const appVersion = await getVersion();
        setVersion(appVersion);
      } catch (error) {
        setVersion("0.1.2");
      }
    };
    fetchVersion();
  }, []);

  const handleDonateClick = async () => {
    try {
      await openUrl("https://github.com/cjpais");
    } catch (error) {
      console.error("Failed to open donate link:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-[#1F2023] rounded-t-xl z-50 border-t border-[#2F3030] shadow-2xl transition-transform duration-300 ease-out flex flex-col max-h-[85vh]"
        style={{
          animation: "slideUpSheet 0.3s ease-out forwards"
        }}
      >
        {/* Header/Handle */}
        <div className="flex justify-between items-center p-4 border-b border-[#2F3030] shrink-0">
          <h2 className="text-white font-medium text-14px">{t("settings.about.title")}</h2>
          <button 
            onClick={onClose}
            className="text-[#808080] hover:text-white transition-colors p-1 rounded-sm hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 space-y-6 hidden-scrollbar pb-10">
          <div className="space-y-1">
            <AppLanguageSelector descriptionMode="tooltip" grouped={true} />
            
            <SettingContainer
              title={t("settings.about.version.title")}
              description={t("settings.about.version.description")}
              grouped={true}
            >
              <span className="text-[12px] text-[#808080] font-mono">v{version}</span>
            </SettingContainer>

            <SettingContainer
              title={t("settings.about.supportDevelopment.title")}
              description={t("settings.about.supportDevelopment.description")}
              grouped={true}
            >
              <Button onClick={handleDonateClick} className="bg-[#ec4899] hover:bg-[#db2777] text-white border-none text-[12px] h-7 px-3 rounded">
                {t("settings.about.supportDevelopment.button", "Donate")}
              </Button>
            </SettingContainer>

            <SettingContainer
              title={t("settings.about.sourceCode.title")}
              description={t("settings.about.sourceCode.description")}
              grouped={true}
            >
              <Button
                onClick={() => openUrl("https://github.com/cjpais")}
                className="bg-[#28282A] hover:bg-[#3F3F46] text-white border border-[#3F3F46] text-[12px] h-7 px-3 rounded"
              >
                {t("settings.about.sourceCode.button", "View on GitHub")}
              </Button>
            </SettingContainer>

            <AppDataDirectory descriptionMode="tooltip" grouped={true} />
            <LogDirectory grouped={true} />
          </div>

          <div className="space-y-2">
            <h3 className="text-[#808080] text-[10px] uppercase font-bold tracking-wider px-1">
              {t("settings.about.acknowledgments.title")}
            </h3>
            <SettingContainer
              title={t("settings.about.acknowledgments.whisper.title")}
              description={t("settings.about.acknowledgments.whisper.description")}
              grouped={true}
              layout="stacked"
            >
              <div className="text-[12px] text-[#808080] leading-relaxed">
                {t("settings.about.acknowledgments.whisper.details")}
              </div>
            </SettingContainer>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUpSheet {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
};
