import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Loader2, Trash2, Bookmark, Play } from "lucide-react";
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
        setHistory(formatted);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  // Bookmark is just visual right now
  const handleBookmark = async (id: number) => {
    // stub
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
          className="text-black mb-4" 
          style={{ 
            fontFamily: "serif", // Using generic serif to match 'History' font if precise one isn't imported
            fontSize: "24px",
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
                  color: "#282828",
                  fontFamily: "Geist, sans-serif",
                  fontSize: 16,
                  fontStyle: "italic",
                  fontWeight: 400,
                  lineHeight: "22px",
                  maxWidth: 420,
                  width: "100%",
                }}
              >
                {entry.text}
              </div>

              {/* Right Side container: Actions + Timeline */}
              <div className="flex items-center shrink-0">
                {/* Always-visible Action Buttons (matching screenshot: play + bookmark) */}
                <div className="flex items-center gap-4 mr-8 opacity-40 hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlay(entry.fileName);
                    }}
                    className="hover:opacity-60 transition-colors"
                  >
                    <Play className="w-[18px] h-[18px]" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookmark(entry.id);
                    }}
                    className="hover:opacity-60 transition-colors"
                  >
                    <Bookmark className="w-[18px] h-[18px]" strokeWidth={1.5} />
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
                    className="bg-white border border-[#EDEDED] rounded-[16px] px-[12px] py-[6px] text-[#8C9FBC] text-[11px] font-medium z-10 flex items-center justify-center whitespace-nowrap"
                    style={{ letterSpacing: "0.2px" }}
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
