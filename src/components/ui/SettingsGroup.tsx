import React from "react";

interface SettingsGroupProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export const SettingsGroup: React.FC<SettingsGroupProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div style={{ marginBottom: 16 }}>
      {/* Items — flat list with no dividers */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {children}
      </div>
    </div>
  );
};
