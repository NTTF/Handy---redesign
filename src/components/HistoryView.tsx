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
  dayMonth: string;   // e.g. "7 December"
  year: string;       // e.g. "2022"
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
      <div className="px-5 pt-4 pb-16 flex flex-col gap-3">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="group relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Each entry: text left + date right, aligned to top */}
            <div className="flex items-start gap-3 py-0 px-1 -mx-1 rounded transition-colors hover:bg-black/[0.04] cursor-default">

              {/* Left: Transcription text — fixed width so it NEVER reflows */}
              <div
                style={{
                  width: 340,
                  minWidth: 340,
                  flexShrink: 0,
                  color: "#1A1816",
                  fontFamily: "Geist, sans-serif",
                  fontSize: 14,
                  fontWeight: 400,
                  lineHeight: "20px",
                }}
              >
                {entry.text}
              </div>

              {/* Right Side: Date vs Actions */}
              <div className="ml-auto shrink-0 flex items-start justify-end pt-0.5 min-h-[28px]">
                {/* Date stack (hidden on hover or when panel open) */}
                {!isPanelOpen && (
                  <div className="text-right group-hover:hidden">
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 400,
                        color: "#9B9790",
                        lineHeight: "14px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {entry.dayMonth}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 400,
                        color: "#B8B4AE",
                        lineHeight: "14px",
                      }}
                    >
                      {entry.year}
                    </div>
                  </div>
                )}

                {/* Inline Action Buttons (visible only on hover) */}
                <div className="hidden group-hover:flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlay(entry.fileName);
                    }}
                    className="p-1 rounded hover:bg-black/10 transition-colors"
                    style={{ color: "#5A5E6E" }}
                    title="Play audio"
                  >
                    <Play className="w-[14px] h-[14px]" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(entry.text);
                    }}
                    className="p-1 rounded hover:bg-black/10 transition-colors"
                    style={{ color: "#5A5E6E" }}
                    title="Copy text"
                  >
                    <Copy className="w-[14px] h-[14px]" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(entry.id);
                    }}
                    className="p-1 rounded hover:bg-red-50 transition-colors"
                    style={{ color: "#DC2626" }}
                    title="Delete"
                  >
                    <Trash2 className="w-[14px] h-[14px]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default HistoryView;
