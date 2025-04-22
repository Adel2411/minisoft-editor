import { Program } from "@/types";
import { useState } from "react";

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
        className={`ast-viewer p-4 rounded-lg overflow-auto shadow-sm border animate-fadeIn ${
          theme === "dark"
            ? "bg-gray-900 border-gray-700"
            : "bg-gray-50 border-gray-200"
        }`}
        style={{ maxHeight: "calc(100vh - 200px)" }}
      >
        <div className="mb-4">
          <h3
            className={`text-lg font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}
          >
            Program: <span className="font-mono">{program.name}</span>
          </h3>
        </div>

        {program.declarations.length > 0 && (
          <ASTSection title="Declarations" theme={theme}>
            {program.declarations.map((decl, index) => (
              <ASTNode key={`decl-${index}`} node={decl} theme={theme} />
            ))}
          </ASTSection>
        )}

        {program.statements.length > 0 && (
          <ASTSection title="Statements" theme={theme}>
            {program.statements.map((stmt, index) => (
              <ASTNode key={`stmt-${index}`} node={stmt} theme={theme} />
            ))}
          </ASTSection>
        )}
      </div>
    </div>
  );
}

function ASTSection({
  title,
  children,
  theme,
}: {
  title: string;
  children: React.ReactNode;
  theme: "dark" | "light";
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="mb-4">
      <div
        className={`flex items-center cursor-pointer p-2 rounded-md ${
          theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-200"
        }`}
        onClick={() => setCollapsed(!collapsed)}
      >
        <span
          className={`mr-2 ${collapsed ? "transform rotate-0" : "transform rotate-90"}`}
        >
          ▶
        </span>
        <h4
          className={`text-md font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
        >
          {title}
        </h4>
      </div>

      {!collapsed && (
        <div
          className={`pl-6 border-l-2 ml-2 mt-2 mb-4 space-y-2 ${
            theme === "dark" ? "border-gray-700" : "border-gray-300"
          }`}
        >
          {children}
        </div>
      )}
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
  // Update the isLeaf check around line 101
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
            className={`font-mono ${theme === "dark" ? "text-green-300" : "text-green-700"}`}
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
        className={`font-mono ${theme === "dark" ? "text-green-300" : "text-green-700"}`}
      >
        {String(node)}
      </span>
    );
  }

  // Handle arrays
  if (Array.isArray(node)) {
    if (node.length === 0)
      return <span className="font-mono text-gray-500">[]</span>;

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
            className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
          >
            Array [{node.length}]
          </span>
        </div>

        {!collapsed && (
          <div
            className={`pl-4 border-l-2 ml-2 space-y-1 ${
              theme === "dark" ? "border-gray-700" : "border-gray-300"
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
            theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"
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
          <span className="ml-2 text-xs text-gray-500">
            (pos: {node.start}-{node.end})
          </span>
        </div>

        {!collapsed && data && (
          <div
            className={`pl-4 border-l-2 ml-2 mt-1 space-y-1 ${
              theme === "dark" ? "border-gray-700" : "border-gray-300"
            }`}
          >
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="flex flex-wrap items-start">
                <span
                  className={`font-medium mr-2 ${
                    theme === "dark" ? "text-blue-300" : "text-blue-600"
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
          className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
        >
          Object
        </span>
      </div>

      {!collapsed && (
        <div
          className={`pl-4 border-l-2 ml-2 space-y-1 ${
            theme === "dark" ? "border-gray-700" : "border-gray-300"
          }`}
        >
          {Object.entries(node).map(([key, value]) => (
            <div key={key} className="flex flex-wrap items-start">
              <span
                className={`font-medium mr-2 ${
                  theme === "dark" ? "text-blue-300" : "text-blue-600"
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

function getNodeColor(kind: string, theme: "dark" | "light"): string {
  switch (kind) {
    case "Variable":
    case "VariableWithInit":
    case "Identifier":
      return theme === "dark" ? "text-blue-300" : "text-blue-700";
    case "Array":
    case "ArrayWithInit":
    case "ArrayAccess":
      return theme === "dark" ? "text-purple-300" : "text-purple-700";
    case "Constant":
      return theme === "dark" ? "text-emerald-300" : "text-emerald-700";
    case "Assignment":
      return theme === "dark" ? "text-yellow-300" : "text-yellow-700";
    case "IfThen":
    case "IfThenElse":
    case "DoWhile":
    case "For":
      return theme === "dark" ? "text-orange-300" : "text-orange-700";
    case "Input":
    case "Output":
      return theme === "dark" ? "text-cyan-300" : "text-cyan-700";
    case "BinaryOp":
    case "UnaryOp":
      return theme === "dark" ? "text-red-300" : "text-red-700";
    case "Literal":
      return theme === "dark" ? "text-green-300" : "text-green-700";
    default:
      return theme === "dark" ? "text-gray-300" : "text-gray-700";
  }
}
