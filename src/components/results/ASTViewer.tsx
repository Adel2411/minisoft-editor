import { Program } from "@/types";
import { useState } from "react";
import { getNodeColor } from "./utils/theme";
import CollapsibleSection from "./ui/CollapsibleSection";

export default function ASTViewer({
  program,
  theme,
}: {
  program: Program;
  theme: "dark" | "light";
}) {
  return (
    <div className="animate-fadeIn">
      <div
        className={`p-4 rounded-lg overflow-auto shadow-sm border animate-fadeIn ${
          theme === "dark"
            ? "bg-[#262220] border-[#3e3632]"
            : "bg-white border-[#efe0d9]"
        }`}
        style={{ maxHeight: "calc(100vh - 200px)" }}
      >
        <div className="mb-4">
          <h3
            className={`text-lg font-semibold ${theme === "dark" ? "text-[#f3ebe7]" : "text-[#212529]"}`}
          >
            Program: <span className="font-mono">{program.name}</span>
          </h3>
        </div>

        {program.declarations.length > 0 && (
          <CollapsibleSection title="Declarations" theme={theme}>
            {program.declarations.map((decl, index) => (
              <ASTNode key={`decl-${index}`} node={decl} theme={theme} />
            ))}
          </CollapsibleSection>
        )}

        {program.statements.length > 0 && (
          <CollapsibleSection title="Statements" theme={theme}>
            {program.statements.map((stmt, index) => (
              <ASTNode key={`stmt-${index}`} node={stmt} theme={theme} />
            ))}
          </CollapsibleSection>
        )}
      </div>
    </div>
  );
}

function ASTNode({
  node,
  theme,
  depth = 0,
}: {
  node: any;
  theme: "dark" | "light";
  depth?: number;
}) {
  const [collapsed, setCollapsed] = useState(depth > 2);
  const isLeaf =
    !node ||
    typeof node !== "object" ||
    (node.node === undefined &&
      !Array.isArray(node) &&
      !node.kind &&
      !node.data);

  // Handle primitive values and special literals
  if (isLeaf) {
    if (node && typeof node === "object") {
      if (node.value !== undefined) {
        return (
          <span
            className={`font-mono ${theme === "dark" ? "text-[#f39c78]" : "text-[#cb502a]"}`}
          >
            {typeof node.value === "string"
              ? `"${node.value}"`
              : String(node.value)}
          </span>
        );
      }
    }

    return (
      <span
        className={`font-mono ${theme === "dark" ? "text-[#f39c78]" : "text-[#cb502a]"}`}
      >
        {String(node)}
      </span>
    );
  }

  // Handle arrays
  if (Array.isArray(node)) {
    if (node.length === 0)
      return <span className="font-mono text-[#b5a9a2]">[]</span>;

    return (
      <div>
        <div
          className="cursor-pointer flex items-center"
          onClick={() => setCollapsed(!collapsed)}
        >
          <span
            className={`mr-2 ${collapsed ? "transform rotate-0" : "transform rotate-90"}`}
          >
            ▶
          </span>
          <span
            className={`${theme === "dark" ? "text-[#b5a9a2]" : "text-[#868e96]"}`}
          >
            Array [{node.length}]
          </span>
        </div>

        {!collapsed && (
          <div
            className={`pl-4 border-l-2 ml-2 space-y-1 ${
              theme === "dark" ? "border-[#3e3632]" : "border-[#efe0d9]"
            }`}
          >
            {node.map((item, idx) => (
              <div key={idx}>
                <ASTNode node={item} theme={theme} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Handle Located<T> nodes
  if (node.node && node.start !== undefined && node.end !== undefined) {
    const nodeContent = node.node;
    const kind = nodeContent.kind;
    const data = nodeContent.data;

    return (
      <div className="my-2">
        <div
          className={`cursor-pointer flex items-center rounded px-2 py-1 ${
            theme === "dark" ? "hover:bg-[#312c28]" : "hover:bg-[#fff1ec]"
          }`}
          onClick={() => setCollapsed(!collapsed)}
        >
          <span
            className={`mr-2 ${collapsed ? "transform rotate-0" : "transform rotate-90"}`}
          >
            ▶
          </span>
          <span className={`font-semibold ${getNodeColor(kind, theme)}`}>
            {kind}
          </span>
          <span className="ml-2 text-xs text-[#b5a9a2]">
            (pos: {node.start}-{node.end})
          </span>
        </div>

        {!collapsed && data && (
          <div
            className={`pl-4 border-l-2 ml-2 mt-1 space-y-1 ${
              theme === "dark" ? "border-[#3e3632]" : "border-[#efe0d9]"
            }`}
          >
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="flex flex-wrap items-start">
                <span
                  className={`font-medium mr-2 ${
                    theme === "dark" ? "text-[#e86f42]" : "text-[#e05d30]"
                  }`}
                >
                  {key}:
                </span>
                <ASTNode node={value} theme={theme} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Handle regular objects
  return (
    <div>
      <div
        className="cursor-pointer flex items-center"
        onClick={() => setCollapsed(!collapsed)}
      >
        <span
          className={`mr-2 ${collapsed ? "transform rotate-0" : "transform rotate-90"}`}
        >
          ▶
        </span>
        <span
          className={`${theme === "dark" ? "text-[#d9cec9]" : "text-[#495057]"}`}
        >
          Object
        </span>
      </div>

      {!collapsed && (
        <div
          className={`pl-4 border-l-2 ml-2 space-y-1 ${
            theme === "dark" ? "border-[#3e3632]" : "border-[#efe0d9]"
          }`}
        >
          {Object.entries(node).map(([key, value]) => (
            <div key={key} className="flex flex-wrap items-start">
              <span
                className={`font-medium mr-2 ${
                  theme === "dark" ? "text-[#e86f42]" : "text-[#e05d30]"
                }`}
              >
                {key}:
              </span>
              <ASTNode node={value} theme={theme} depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
