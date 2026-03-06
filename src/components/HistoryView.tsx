import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Loader2, Play, Copy, Trash2, MoreHorizontal } from "lucide-react";
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
    <ScrollArea className="h-full" style={{ background: "transparent" }}>
      <div className="px-2 pt-6 pb-16 flex flex-col">
        {history.map((entry, index) => (
          <div
            key={entry.id}
            className="group relative flex"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Timeline Column */}
            <div className="relative w-[80px] shrink-0 flex flex-col items-center">
              {/* Vertical Dotted Line */}
              <div 
                className="absolute top-0 bottom-0 w-[1px] border-l-[1.5px] border-dotted border-[#E8E8E8]"
                style={{ 
                  left: "50%", 
                  top: index === 0 ? "34px" : "0px", // don't draw line above first pill
                  bottom: index === history.length - 1 ? "calc(100% - 30px)" : "0px" // don't draw below last pill
                }} 
              />
              
              {/* Time Pill */}
              <div 
                className="absolute top-4 bg-white border border-[#EDEDED] rounded-full px-4 py-[6px] text-[#8C9FBC] text-[11px] font-medium z-10 flex items-center justify-center -translate-x-1/2 whitespace-nowrap"
                style={{
                  left: "50%",
                }}
              >
                {entry.time}
              </div>
            </div>

            {/* Content Column */}
            <div className="flex-1 pb-10 pt-[18px] pl-2 pr-6">
              {/* Text content */}
              <div
                style={{
                  color: "#3F3F46", // Dark gray, matching the exact reference look
                  fontFamily: "Geist, sans-serif",
                  fontSize: 14,
                  fontWeight: 400,
                  lineHeight: "22px",
                  maxWidth: 380,
                }}
              >
                {entry.text.split('\n').map((paragraph, i) => (
                  <p key={i} className={i > 0 ? "mt-4" : ""}>{paragraph}</p>
                ))}
              </div>

              {/* Inline Action Buttons (visible only on hover) */}
              <div className="hidden group-hover:flex items-center gap-1 mt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlay(entry.fileName);
                  }}
                  className="p-1.5 rounded hover:bg-black/5 transition-colors"
                  style={{ color: "#71717A" }}
                  title="Play audio"
                >
                  <Play className="w-[14px] h-[14px]" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(entry.text);
                  }}
                  className="p-1.5 rounded hover:bg-black/5 transition-colors"
                  style={{ color: "#71717A" }}
                  title="Copy text"
                >
                  <Copy className="w-[14px] h-[14px]" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(entry.id);
                  }}
                  className="p-1.5 rounded hover:bg-red-50 transition-colors"
                  style={{ color: "#EF4444" }}
                  title="Delete"
                >
                  <Trash2 className="w-[14px] h-[14px]" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default HistoryView;
