import React from 'react';
import {
  Code,
  Terminal as TerminalIcon,
  FileText,
  Database,
} from "lucide-react";

interface ResultTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: "dark" | "light";
}

export default function ResultTabs({ activeTab, setActiveTab, theme }: ResultTabsProps) {
  const tabs = [
    { id: "tokens", label: "Tokens", icon: FileText },
    { id: "ast", label: "AST", icon: Code },
    { id: "symbols", label: "Symbols", icon: Database },
    { id: "quadruples", label: "Quadruples", icon: TerminalIcon },
  ];

  return (
    <div
      className={`flex border-b transition-colors duration-300 ${
        theme === "dark" ? "border-[#3e3632]" : "border-[#efe0d9]"
      }`}
    >
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors duration-200 ${
              activeTab === tab.id
                ? theme === "dark"
                  ? "border-b-2 border-[#e86f42] text-[#e86f42]"
                  : "border-b-2 border-[#e05d30] text-[#e05d30]"
                : ""
            }`}
          >
            <IconComponent size={16} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
