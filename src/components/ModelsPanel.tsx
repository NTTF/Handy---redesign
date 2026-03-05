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
        background: isActive ? "#2A2B30" : "transparent",
        border: `1px solid ${isActive ? "#3A3B42" : "#28292E"}`,
        borderRadius: 8,
        padding: "10px 12px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled && !isActive ? 0.45 : 1,
        transition: "background 0.15s, border-color 0.15s",
      }}
      onMouseEnter={e => {
        if (!isActive && !disabled) {
          (e.currentTarget as HTMLDivElement).style.background = "#252629";
          (e.currentTarget as HTMLDivElement).style.borderColor = "#35363C";
        }
      }}
      onMouseLeave={e => {
        if (!isActive && !disabled) {
          (e.currentTarget as HTMLDivElement).style.background = "transparent";
          (e.currentTarget as HTMLDivElement).style.borderColor = "#28292E";
        }
      }}
    >
      {/* Row: left info + right indicator */}
      <div className="flex items-start justify-between gap-2">
        {/* Left: name + badges + description */}
        <div className="flex-1 min-w-0">
          {/* Name + status badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span style={{ color: "#F0F0F0", fontSize: 13, fontWeight: 600 }}>{name}</span>

            {isActive && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  padding: "1px 5px",
                  borderRadius: 3,
                  background: "rgba(74, 222, 128, 0.15)",
                  color: "#4ade80",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                READY
              </span>
            )}
            {model.is_recommended && !isActive && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  padding: "1px 5px",
                  borderRadius: 3,
                  background: "rgba(9, 136, 240, 0.15)",
                  color: "#0988F0",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                RECOMMENDED
              </span>
            )}
            {isDownloadable && !model.is_recommended && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  padding: "1px 5px",
                  borderRadius: 3,
                  background: "rgba(90, 94, 110, 0.2)",
                  color: "#8B8F9F",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                DOWNLOAD
              </span>
            )}
            {isBusy && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  padding: "1px 5px",
                  borderRadius: 3,
                  background: "rgba(251, 146, 60, 0.15)",
                  color: "#fb923c",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {status === "extracting" ? "EXTRACTING" : "DOWNLOADING"}
              </span>
            )}
          </div>

          {/* Description */}
          {description && (
            <p style={{ color: "#6B6F7E", fontSize: 11, marginTop: 2, lineHeight: 1.4 }}>
              {description}
              {isDownloadable && model.size_mb > 0 && (
                <> · {formatModelSize(Number(model.size_mb))}</>
              )}
            </p>
          )}

          {/* Speed + Accuracy dots */}
          {(model.speed_score > 0 || model.accuracy_score > 0) && (
            <div className="flex gap-3 mt-1.5">
              {model.speed_score > 0 && <DotBar value={model.speed_score} label="Speed" />}
              {model.accuracy_score > 0 && <DotBar value={model.accuracy_score} label="Accuracy" />}
            </div>
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

        {/* Right: circle indicator */}
        <div style={{ flexShrink: 0, marginTop: 2 }}>
          {isActive ? (
            /* Filled green checkmark circle */
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "#4ade80",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Check size={11} color="#0a0a0a" strokeWidth={3} />
            </div>
          ) : isBusy ? (
            <Loader2 size={18} className="animate-spin" style={{ color: "#fb923c" }} />
          ) : isDownloadable ? (
            /* Empty circle with download icon */
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                border: "1.5px solid #3A3B42",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Download size={9} color="#5A5E6E" />
            </div>
          ) : (
            /* Available — empty radio circle */
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                border: "1.5px solid #3A3B42",
              }}
            />
          )}
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
        <h2 style={{ color: "#F0F0F0", fontSize: 13, fontWeight: 600 }}>Choose your model</h2>
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
