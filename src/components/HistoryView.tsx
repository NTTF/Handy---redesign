import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { ChevronDown, Loader2 } from "lucide-react";
import { commands, type HistoryEntry } from "@/bindings";
import { format } from "date-fns";

// Palette:
// Woodsmoke  #0E0E10 — primary text
// Cod Gray   #1A1A1A — strong text 
// Scarpa Flow #585560 — label text
// Hit Gray   #A1AAAB — muted / dates
// Iron       #DADBDD — dividers

interface TranscriptionEntry {
  id: string;
  text: string;
  timestamp: string;
  dateGroup: string;
}

const HistoryView: React.FC = () => {
  const [history, setHistory] = useState<TranscriptionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const result = await commands.getHistoryEntries();
        if (result.status === "ok") {
          const formatted: TranscriptionEntry[] = result.data.map((entry: HistoryEntry) => {
            const date = new Date(entry.timestamp);
            return {
              id: entry.id.toString(),
              text: entry.transcription_text,
              timestamp: format(date, "do MMMM yyyy"),
              dateGroup: getDateGroup(date),
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
    fetchHistory();
  }, []);

  const getDateGroup = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date >= today) return "Today";
    if (date >= yesterday) return "Yesterday";
    return format(date, "EEEE, MMM d");
  };

  const groupedHistory = history.reduce((acc, entry) => {
    if (!acc[entry.dateGroup]) acc[entry.dateGroup] = [];
    acc[entry.dateGroup].push(entry);
    return acc;
  }, {} as Record<string, TranscriptionEntry[]>);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#A1AAAB" }} />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center h-full text-center px-8 text-sm" style={{ color: "#A1AAAB" }}>
        No transcriptions yet.<br />Start recording to see them here.
      </div>
    );
  }

  return (
    <ScrollArea className="h-full" style={{ background: "#F8F8F8" }}>
      <div className="px-4 py-4 space-y-4 pb-4">
        {Object.entries(groupedHistory).map(([group, entries]) => (
          <div key={group}>
            {/* Date group header */}
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#A1AAAB" }}>
                {entries.length} {entries.length === 1 ? "note" : "notes"}
              </span>
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end">
                  <span className="text-[13px] font-semibold" style={{ color: "#585560" }}>{group}</span>
                  <ChevronDown className="w-3.5 h-3.5" style={{ color: "#A1AAAB" }} />
                </div>
                <span className="text-[11px]" style={{ color: "#A1AAAB" }}>
                  {entries[0].timestamp}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "#DADBDD", marginBottom: 12 }} />

            {/* Entries */}
            <div className="flex flex-col gap-2">
              {entries.map((entry) => (
                <p key={entry.id} className="text-[14px] leading-relaxed" style={{ color: "#1A1A1A" }}>
                  {entry.text}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default HistoryView;
