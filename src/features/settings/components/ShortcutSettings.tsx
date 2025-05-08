import React from 'react';

interface ShortcutSettingsProps {
  theme: "dark" | "light";
}

export default function ShortcutSettings({ theme }: ShortcutSettingsProps) {
  const shortcuts = [
    { action: "Search", shortcut: "Ctrl+F" },
    { action: "Replace", shortcut: "Ctrl+H" },
    { action: "Save File", shortcut: "Ctrl+S" },
    { action: "Compile", shortcut: "Ctrl+Enter" },
    { action: "Toggle Comment", shortcut: "Ctrl+/" },
    { action: "Go to Line", shortcut: "Ctrl+G" },
    { action: "Indent", shortcut: "Tab" },
    { action: "Outdent", shortcut: "Shift+Tab" },
    { action: "Command Palette", shortcut: "Ctrl+Shift+P" },
    { action: "Move Lines Up", shortcut: "Alt+↑" },
    { action: "Move Lines Down", shortcut: "Alt+↓" },
    { action: "Duplicate Line", shortcut: "Ctrl+Shift+D" },
    { action: "Delete Line", shortcut: "Ctrl+Shift+K" },
    { action: "Undo", shortcut: "Ctrl+Z" },
    { action: "Redo", shortcut: "Ctrl+Y" },
    { action: "Zoom In", shortcut: "Ctrl++" },
    { action: "Zoom Out", shortcut: "Ctrl+-" },
    { action: "Reset Zoom", shortcut: "Ctrl+0" },
  ];

  return (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-[#f3ebe7]" : "text-[#212529]"}`}>
        Keyboard Shortcuts
      </h3>
      
      <div className={`border rounded-md ${
        theme === "dark" ? "border-[#3e3632]" : "border-[#efe0d9]"
      }`}>
        <table className="w-full">
          <thead>
            <tr className={`border-b ${
              theme === "dark" ? "border-[#3e3632]" : "border-[#efe0d9]"
            }`}>
              <th className={`px-4 py-2 text-left text-sm font-medium ${
                theme === "dark" ? "text-[#d9cec9]" : "text-[#495057]"
              }`}>
                Action
              </th>
              <th className={`px-4 py-2 text-right text-sm font-medium ${
                theme === "dark" ? "text-[#d9cec9]" : "text-[#495057]"
              }`}>
                Shortcut
              </th>
            </tr>
          </thead>
          <tbody>
            {shortcuts.map((item, index) => (
              <tr 
                key={index} 
                className={`${
                  index % 2 === 0 
                    ? theme === "dark" ? "bg-[#262220]" : "bg-white" 
                    : theme === "dark" ? "bg-[#1e1a17]" : "bg-[#fefaf8]"
                } ${
                  index < shortcuts.length - 1
                    ? theme === "dark" ? "border-b border-[#3e3632]" : "border-b border-[#efe0d9]"
                    : ""
                }`}
              >
                <td className={`px-4 py-2 text-sm ${
                  theme === "dark" ? "text-[#f3ebe7]" : "text-[#212529]"
                }`}>
                  {item.action}
                </td>
                <td className="px-4 py-2 text-right">
                  <kbd 
                    className={`px-2 py-1 text-xs font-semibold rounded ${
                      theme === "dark" 
                        ? "bg-[#312c28] text-[#d9cec9] border border-[#3e3632]" 
                        : "bg-[#fff1ec] text-[#495057] border border-[#efe0d9]"
                    }`}
                  >
                    {item.shortcut}
                  </kbd>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
