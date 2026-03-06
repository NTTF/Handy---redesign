import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Loader2, Trash2, Copy, Play } from "lucide-react";
import { commands, type HistoryEntry } from "@/bindings";
import { format } from "date-fns";
import { convertFileSrc } from "@tauri-apps/api/core";

interface TranscriptionEntry {
  id: number;
  fileName: string;
  text: string;
  dayMonth: string;
  year: string;
  time: string;
  relativeDay: string;
}

const HistoryView: React.FC<{ isPanelOpen?: boolean }> = ({ isPanelOpen = false }) => {
  const [history, setHistory] = useState<TranscriptionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const result = await commands.getHistoryEntries();
      if (result.status === "ok") {
        const formatted: TranscriptionEntry[] = result.data.map((entry: HistoryEntry) => {
          const date = new Date(entry.timestamp);
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);

          let relativeDay: string;
          if (date >= today) relativeDay = "Today";
          else if (date >= yesterday) relativeDay = "Yesterday";
          else relativeDay = format(date, "EEEE");

          return {
            id: entry.id,
            fileName: entry.file_name,
            text: entry.transcription_text,
            dayMonth: format(date, "d MMMM"),
            year: format(date, "yyyy"),
            time: format(date, "h.mm a").toUpperCase(),
            relativeDay,
          };
        });

        // Add dummy mock data mimicking exact screenshot for review
        const dummyData: TranscriptionEntry[] = [
          { id: 991, fileName: "dummy1", text: "I want I want all the settings page should be in this format like I want touch the design which I really want I really liked it like", dayMonth: "7 March", year: "2026", time: "1.20 AM", relativeDay: "Today" },
          { id: 992, fileName: "dummy2", text: "I want I want all the settings page should be in this format like I want touch the design which I really want I really liked it like", dayMonth: "7 March", year: "2026", time: "1.20 AM", relativeDay: "Today" },
          { id: 993, fileName: "dummy3", text: "User preferences should be easily accessible and customizable, allowing for a personalized experience.", dayMonth: "7 March", year: "2026", time: "1.30 AM", relativeDay: "Today" },
          { id: 994, fileName: "dummy4", text: "The layout must support both light and dark modes to enhance user comfort during usage.", dayMonth: "7 March", year: "2026", time: "1.40 AM", relativeDay: "Today" },
          { id: 995, fileName: "dummy5", text: "Notifications settings should provide options to toggle alerts based on user activity levels.", dayMonth: "7 March", year: "2026", time: "1.50 AM", relativeDay: "Today" },
          { id: 996, fileName: "dummy6", text: "Accessibility features should include voice commands and screen readers for visually impaired users.", dayMonth: "7 March", year: "2026", time: "2.00 AM", relativeDay: "Today" }
        ];

        setHistory([...formatted, ...dummyData]);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  const handleDelete = async (id: number) => {
    try {
      await commands.deleteHistoryEntry(id);
      setHistory(prev => prev.filter(e => e.id !== id));
    } catch (e) {
      console.error("Failed to delete entry:", e);
    }
  };

  const handlePlay = async (fileName: string) => {
    if (!fileName) return;
    try {
      const result = await commands.getAudioFilePath(fileName);
      if (result.status === "ok") {
        const url = convertFileSrc(result.data);
        new Audio(url).play();
      }
    } catch (e) {
      console.error("Failed to play audio:", e);
    }
  };

  // We've removed play/copy to match the exact design ref.

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#A3A099" }} />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full text-center px-8 gap-2">
        <div className="text-[14px] font-medium" style={{ color: "#6B6860" }}>No transcriptions yet</div>
        <div className="text-[12px]" style={{ color: "#A3A099" }}>Start recording to see them here.</div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full" style={{ background: "transparent" }}>
      <div className="p-4 pb-16 flex flex-col w-full">
        {/* Title */}
        <h1 
          className="mb-4" 
          style={{ 
            color: "#141415",
            fontFamily: "'Roboto Slab', serif",
            fontSize: "16px",
            fontWeight: 400,
            lineHeight: "28px"
          }}
        >
          History
        </h1>

        {/* History List */}
        <div className="flex flex-col w-full gap-4">
          {history.map((entry, index) => (
            <div
              key={entry.id}
              className="group relative flex items-center justify-between gap-6 w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left Side: Content */}
              <div
                className="flex-shrink-0"
                style={{
                  color: "#141415",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  fontStyle: "italic",
                  fontWeight: 400,
                  lineHeight: "22px",
                  width: 300,
                  maxWidth: 300,
                }}
              >
                {entry.text}
              </div>

              {/* Right Side container: Actions + Timeline */}
              <div className="flex items-center shrink-0">
                {/* Always-visible Action Buttons (matching screenshot: play + copy) */}
                <div className="flex items-center gap-4 mr-8 text-[#A1A1AA]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlay(entry.fileName);
                    }}
                    className="hover:text-[#52525B] transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="6 3 20 12 6 21" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(entry.text);
                    }}
                    className="hover:text-[#52525B] transition-colors"
                  >
                    <Copy className="w-[16px] h-[16px]" strokeWidth={1.5} />
                  </button>
                </div>

                {/* Right Side: Timeline Column */}
                <div className="relative w-[100px] shrink-0 flex flex-col items-center">
                  {/* Vertical Dotted Line */}
                  <div 
                    className="absolute top-0 bottom-0 w-[1px] border-l-[1.5px] border-dotted border-[#E8E8E8]"
                    style={{ 
                      left: "50%", 
                      top: index === 0 ? "14px" : "-20px", // align with pill vs overflow to last
                      bottom: index === history.length - 1 ? "calc(100% - 14px)" : "-20px" // connect strictly between bubbles
                    }} 
                  />
                  
                  {/* Time Pill */}
                  <div 
                    className="bg-white border border-[#EDEDED] rounded-[16px] font-medium z-10 flex items-center justify-center whitespace-nowrap shrink-0"
                    style={{ 
                      width: "54px",
                      height: "20px",
                      color: "#2C2D2E",
                      fontSize: "10px",
                      letterSpacing: "0.2px" 
                    }}
                  >
                    {entry.time}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};

export default HistoryView;
