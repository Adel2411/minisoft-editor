import React, { useState } from "react";
import { CompilationResult, TabItem } from "@/types";
import TokensTable from "./results/TokensTable";
import AstDisplay from "./results/AstDisplay";
import SymbolTable from "./results/SymbolTable";
import QuadruplesTable from "./results/QuadruplesTable";

interface ResultsDisplayProps {
  result: CompilationResult;
}

export default function ResultsDisplay({ result }: ResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState<string>("tokens");

  const tabs: TabItem[] = [
    {
      id: "tokens",
      label: "Tokens",
      content: <TokensTable tokens={result.tokens} />,
    },
    {
      id: "ast",
      label: "AST",
      content: <AstDisplay ast={result.ast} />,
    },
    {
      id: "symbol-table",
      label: "Symbol Table",
      content: <SymbolTable symbols={result.symbol_table} />,
    },
    {
      id: "quadruples",
      label: "Quadruples",
      content: <QuadruplesTable quadruples={result.quadruples} />,
    },
  ];

  return (
    <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
      <h2 className="text-xl font-bold p-4 bg-gray-800 text-white flex items-center">
        <span className="mr-2">✅</span> Compilation Results
      </h2>

      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="p-4">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}

interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  setActiveTab: (id: string) => void;
}

function TabNavigation({ tabs, activeTab, setActiveTab }: TabNavigationProps) {
  return (
    <div className="border-b border-gray-200">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
