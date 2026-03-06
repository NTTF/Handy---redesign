import React from "react";
import { Check, Download, Loader2 } from "lucide-react";
import type { ModelInfo } from "@/bindings";
import { useModelStore } from "../stores/modelStore";
import { getTranslatedModelName, getTranslatedModelDescription } from "../lib/utils/modelTranslation";
import { formatModelSize } from "../lib/utils/format";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

type ModelRowStatus = "active" | "available" | "downloading" | "extracting" | "downloadable";

// Color-coded dot bars for speed/accuracy — 5 dots, green → yellow → red
const DotBar: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  const filled = Math.round(value * 5);
  const colors = ["#4ade80", "#4ade80", "#facc15", "#facc15", "#f87171"];
  return (
    <div className="flex items-center gap-1">
      <span style={{ color: "#5A5E6E", fontSize: 10 }}>{label}</span>
      <div className="flex gap-0.5">
        {colors.map((color, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: i < filled ? color : "#3A3B42",
            }}
          />
        ))}
      </div>
    </div>
  );
};

interface ModelRowProps {
  model: ModelInfo;
  status: ModelRowStatus;
  disabled: boolean;
  downloadProgress?: number;
  onClick: () => void;
}

const ModelRow: React.FC<ModelRowProps> = ({ model, status, disabled, downloadProgress, onClick }) => {
  const { t } = useTranslation();
  const name = getTranslatedModelName(model, t);
  const description = getTranslatedModelDescription(model, t);
  const isActive = status === "active";
  const isDownloadable = status === "downloadable";
  const isBusy = status === "downloading" || status === "extracting";

  return (
    <div
      onClick={disabled ? undefined : onClick}
      style={{
        background: "#18181b", // zinc-900 (matches flat dark card)
        border: "1px solid #27272a", // zinc-800 subtle border
        borderRadius: 4,
        padding: "16px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled && !isActive ? 0.45 : 1,
        transition: "border-color 0.15s, background 0.15s",
      }}
      onMouseEnter={e => {
        if (!disabled) {
          (e.currentTarget as HTMLDivElement).style.borderColor = "#3f3f46"; // zinc-700 hover
        }
      }}
      onMouseLeave={e => {
        if (!disabled) {
          (e.currentTarget as HTMLDivElement).style.borderColor = "#27272a";
        }
      }}
    >
      {/* Row: left info + right indicator */}
      <div className="flex items-start justify-between gap-2">
      <div className="flex items-center justify-between gap-3">
        {/* Left: name + size + description */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-baseline gap-2">
            <span style={{ color: "#F4F4F5", fontSize: 13, fontWeight: 500 }}>
              {name}
            </span>
            {isDownloadable && model.size_mb > 0 && (
              <span style={{ color: "#71717A", fontSize: 11 }}>
                {formatModelSize(Number(model.size_mb))}
              </span>
            )}
          </div>
          {description && (
            <p
              className="truncate"
              style={{ color: "#71717A", fontSize: 11, marginTop: 2 }}
            >
              {description}
            </p>
          )}





          {/* Download progress */}
          {status === "downloading" && downloadProgress !== undefined && (
            <div style={{ marginTop: 6 }}>
              <div style={{ width: "100%", height: 2, borderRadius: 2, background: "#2F3035", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${downloadProgress}%`,
                    background: "#0988F0",
                    transition: "width 0.3s",
                    borderRadius: 2,
                  }}
                />
              </div>
              <span style={{ fontSize: 10, color: "#5A5E6E", display: "block", marginTop: 2 }}>
                {Math.round(downloadProgress)}%
              </span>
            </div>
          )}
          {status === "extracting" && (
            <div style={{ marginTop: 6 }}>
              <div style={{ width: "100%", height: 2, borderRadius: 2, background: "#2F3035", overflow: "hidden" }}>
                <div style={{ height: "100%", width: "100%", background: "#f59e0b", borderRadius: 2 }} className="animate-pulse" />
              </div>
              <span style={{ fontSize: 10, color: "#5A5E6E", display: "block", marginTop: 2 }}>Extracting…</span>
            </div>
          )}
        </div>

        </div>

        {/* Right side: Badge + Radio toggle */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Badge */}
          {isActive ? (
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                padding: "2px 8px",
                borderRadius: 4,
                background: "rgba(74, 222, 128, 0.15)",
                color: "#4ade80",
              }}
            >
              Ready
            </span>
          ) : isBusy ? (
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                padding: "2px 8px",
                borderRadius: 4,
                background: "rgba(251, 146, 60, 0.15)",
                color: "#fb923c",
              }}
            >
              {status === "extracting" ? "Extracting..." : "Downloading..."}
            </span>
          ) : model.is_recommended ? (
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                padding: "2px 8px",
                borderRadius: 4,
                background: "rgba(9, 136, 240, 0.15)",
                color: "#0988F0",
              }}
            >
              Recommended
            </span>
          ) : isDownloadable ? (
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                padding: "2px 8px",
                borderRadius: 4,
                background: "rgba(113, 113, 122, 0.15)",
                color: "#A1A1AA",
              }}
            >
              Download
            </span>
          ) : null}

          {/* Radio indicator */}
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: isActive ? "#0988F0" : "#27272a",
              border: isActive ? "none" : "1.5px solid #3f3f46",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s ease",
            }}
          >
            {isActive ? (
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
            ) : isDownloadable && !isBusy ? (
              <Download size={10} color="#71717A" />
            ) : isBusy ? (
              <Loader2 size={10} className="animate-spin" style={{ color: "#fb923c" }} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ModelsPanelProps {
  onClose: () => void;
}

const ModelsPanel: React.FC<ModelsPanelProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const {
    models,
    downloadModel,
    selectModel,
    downloadingModels,
    extractingModels,
    downloadProgress,
    currentModel,
  } = useModelStore();

  const isAnyDownloading = Object.keys(downloadingModels).length > 0;

  const getRowStatus = (model: ModelInfo): ModelRowStatus => {
    if (model.id === currentModel) return "active";
    if (model.id in extractingModels) return "extracting";
    if (model.id in downloadingModels) return "downloading";
    if (model.is_downloaded) return "available";
    return "downloadable";
  };

  const handleRowClick = async (model: ModelInfo) => {
    const status = getRowStatus(model);
    if (status === "active") return;
    if (status === "available") {
      const success = await selectModel(model.id);
      if (success) onClose();
      else toast.error(t("onboarding.errors.selectModel"));
      return;
    }
    if (status === "downloadable") {
      await downloadModel(model.id);
    }
  };

  // Sort: active first, then available, then downloadable
  const sortedModels = [...models].sort((a, b) => {
    const order: Partial<Record<ModelRowStatus, number>> = { active: 0, available: 1, downloadable: 2 };
    return (order[getRowStatus(a)] ?? 3) - (order[getRowStatus(b)] ?? 3);
  });

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "#1F2023" }}
    >
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          padding: "10px 16px",
          borderBottom: "1px solid #28292E",
          textAlign: "center",
        }}
      >
        <h2 style={{ color: "#F0F0F0", fontSize: 13, fontWeight: 500 }}>Choose your model</h2>
      </div>

      {/* Scrollable list */}
      <div
        className="flex-1 overflow-y-auto hidden-scrollbar"
        style={{ padding: "8px 8px" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {sortedModels.map((model) => {
            const status = getRowStatus(model);
            return (
              <ModelRow
                key={model.id}
                model={model}
                status={status}
                disabled={isAnyDownloading && status !== "active"}
                downloadProgress={downloadProgress[model.id]?.percentage}
                onClick={() => handleRowClick(model)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ModelsPanel;
