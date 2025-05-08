import { useState } from "react";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  theme: "dark" | "light";
  defaultCollapsed?: boolean;
}

export default function CollapsibleSection({
  title,
  children,
  theme,
  defaultCollapsed = false,
}: CollapsibleSectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className="mb-4">
      <div
        className={`flex items-center cursor-pointer p-2 rounded-md ${
          theme === "dark" ? "hover:bg-[#312c28]" : "hover:bg-[#fff1ec]"
        }`}
        onClick={() => setCollapsed(!collapsed)}
      >
        <span
          className={`mr-2 transition-transform ${collapsed ? "transform rotate-0" : "transform rotate-90"}`}
        >
          ▶
        </span>
        <h4
          className={`text-md font-semibold ${theme === "dark" ? "text-[#d9cec9]" : "text-[#495057]"}`}
        >
          {title}
        </h4>
      </div>

      {!collapsed && (
        <div
          className={`pl-6 border-l-2 ml-2 mt-2 mb-4 space-y-2 ${
            theme === "dark" ? "border-[#3e3632]" : "border-[#efe0d9]"
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
