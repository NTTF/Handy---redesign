import { useEffect, useState, useRef } from "react";
import { Toaster } from "sonner";
import { useTranslation } from "react-i18next";
import { platform } from "@tauri-apps/plugin-os";
import {
  checkAccessibilityPermission,
  checkMicrophonePermission,
} from "tauri-plugin-macos-permissions-api";
import "./App.css";
import AccessibilityPermissions from "./components/AccessibilityPermissions";
import Onboarding, { AccessibilityOnboarding } from "./components/onboarding";
import ModelsPanel from "./components/ModelsPanel";
import MainLayout from "./components/MainLayout";
import SettingsPanel from "./components/SettingsPanel";
import { SidebarSection } from "./components/Sidebar";
import { useSettings } from "./hooks/useSettings";
import { useSettingsStore } from "./stores/settingsStore";
import { commands } from "@/bindings";
import { getLanguageDirection, initializeRTL } from "@/lib/utils/rtl";

type OnboardingStep = "accessibility" | "model" | "done";

function App() {
  const { i18n } = useTranslation();
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep | null>(null);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [currentSection, setCurrentSection] = useState<SidebarSection>("general");
  const { settings, updateSetting } = useSettings();
  const direction = getLanguageDirection(i18n.language);
  const refreshAudioDevices = useSettingsStore(state => state.refreshAudioDevices);
  const refreshOutputDevices = useSettingsStore(state => state.refreshOutputDevices);
  const hasCompletedPostOnboardingInit = useRef(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    initializeRTL(i18n.language);
  }, [i18n.language]);

  useEffect(() => {
    if (onboardingStep === "done" && !hasCompletedPostOnboardingInit.current) {
      hasCompletedPostOnboardingInit.current = true;
      Promise.all([
        commands.initializeEnigo(),
        commands.initializeShortcuts(),
      ]).catch((e) => {
        console.warn("Failed to initialize:", e);
      });
      refreshAudioDevices();
      refreshOutputDevices();
    }
  }, [onboardingStep, refreshAudioDevices, refreshOutputDevices]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isDebugShortcut =
        event.shiftKey &&
        event.key.toLowerCase() === "d" &&
        (event.ctrlKey || event.metaKey);

      if (isDebugShortcut) {
        event.preventDefault();
        const currentDebugMode = settings?.debug_mode ?? false;
        updateSetting("debug_mode", !currentDebugMode);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [settings?.debug_mode, updateSetting]);

  const checkOnboardingStatus = async () => {
    try {
      const result = await commands.hasAnyModelsAvailable();
      const hasModels = result.status === "ok" && result.data;

      if (hasModels) {
        setIsReturningUser(true);
        if (platform() === "macos") {
          try {
            const [hasAccessibility, hasMicrophone] = await Promise.all([
              checkAccessibilityPermission(),
              checkMicrophonePermission(),
            ]);
            if (!hasAccessibility || !hasMicrophone) {
              setOnboardingStep("accessibility");
              return;
            }
          } catch (e) {
            console.warn("Failed to check permissions:", e);
          }
        }
        setOnboardingStep("done");
      } else {
        setIsReturningUser(false);
        setOnboardingStep("accessibility");
      }
    } catch (error) {
      console.error("Failed to check onboarding status:", error);
      setOnboardingStep("accessibility");
    }
  };

  const handleAccessibilityComplete = () => {
    setOnboardingStep(isReturningUser ? "done" : "model");
  };

  const [activePanel, setActivePanel] = useState<"settings" | "models" | "vocabulary" | "info" | "advanced" | "postprocessing" | null>(null);

  // Effect to map nav buttons → correct settings section
  useEffect(() => {
    if (activePanel === "settings")       setCurrentSection("general");
    if (activePanel === "advanced")       setCurrentSection("advanced");
    if (activePanel === "vocabulary")     setCurrentSection("advanced");  // Transcription lives in advanced
    if (activePanel === "postprocessing") setCurrentSection("postprocessing");
  }, [activePanel]);

  const handleModelSelected = () => {
    setOnboardingStep("done");
  };

  if (onboardingStep === null) {
    return null;
  }

  if (onboardingStep === "accessibility") {
    return <AccessibilityOnboarding onComplete={handleAccessibilityComplete} />;
  }

  if (onboardingStep === "model") {
    return <Onboarding onModelSelected={handleModelSelected} />;
  }

  return (
    <div
      dir={direction}
      className="h-screen flex flex-col select-none cursor-default overflow-hidden"
      style={{ background: "#141414" }}
    >
      <Toaster
        position="top-center"
        toastOptions={{
          classNames: {
            toast: "rounded shadow-md text-sm",
          },
        }}
      />
      
      <MainLayout 
        activePanel={activePanel} 
        onPanelChange={setActivePanel}
      >
        <div className="flex flex-col h-full w-full">
          <AccessibilityPermissions />
          
          {(activePanel === "settings" || activePanel === "advanced" || activePanel === "vocabulary" || activePanel === "postprocessing") && (
             <SettingsPanel 
               activeSection={currentSection} 
               onSectionChange={setCurrentSection} 
             />
          )}

          {activePanel === "models" && (
            <ModelsPanel onClose={() => setActivePanel(null)} />
          )}


          {activePanel === "info" && (
             <div className="flex flex-col items-center justify-center h-full px-5 py-8">
               <div className="w-14 h-14 rounded bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg mb-4 flex items-center justify-center">
                 <span className="text-sm font-medium text-white">H</span>
               </div>
               <h2 className="text-sm font-medium mb-1" style={{ color: "#F8F8F8" }}>Handy</h2>
               <p className="text-sm mb-6" style={{ color: "#5A5E6E" }}>Version 0.7.9</p>
               
               <div className="w-full rounded" style={{ background: "#2F3035", border: "1px solid #3A3B42" }}>
                 <div className="flex justify-between items-center px-4 py-3" style={{ borderBottom: "1px solid #3A3B42" }}>
                   <span className="text-sm" style={{ color: "#9FA3B3" }}>Developer</span>
                   <span className="font-medium text-sm" style={{ color: "#F8F8F8" }}>pais.handy</span>
                 </div>
                 <div className="flex justify-between items-center px-4 py-3" style={{ borderBottom: "1px solid #3A3B42" }}>
                   <span className="text-sm" style={{ color: "#9FA3B3" }}>License</span>
                   <span className="font-medium text-sm" style={{ color: "#F8F8F8" }}>MIT</span>
                 </div>
                 <div className="flex justify-between items-center px-4 py-3">
                   <span className="text-sm" style={{ color: "#9FA3B3" }}>Build</span>
                   <span className="font-medium text-[12px] px-2 py-0.5 rounded" style={{ color: "#F8F8F8", background: "#3A3B42" }}>Tauri + React</span>
                 </div>
               </div>
             </div>
          )}
        </div>
      </MainLayout>
    </div>
  );
}

export default App;
