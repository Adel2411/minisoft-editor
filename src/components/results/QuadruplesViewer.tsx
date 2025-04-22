interface QuadruplesViewerProps {
  quadruples: string[];
  theme: "dark" | "light";
  searchTerm?: string;
}

export default function QuadruplesViewer({
  quadruples,
  theme,
  searchTerm = "",
}: QuadruplesViewerProps) {
  const filterQuadruples = (quadruples: string[]) => {
    if (!searchTerm) return quadruples;
    return quadruples.filter((quad) =>
      quad.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  return (
    <div className="animate-fadeIn">
      <div
        className={`p-4 rounded-lg overflow-auto font-mono text-sm shadow-sm border ${
          theme === "dark"
            ? "bg-gray-900 text-gray-300 border-gray-700"
            : "bg-gray-100 text-gray-800 border-gray-200"
        }`}
      >
        <ol className="list-decimal pl-5 space-y-1">
          {filterQuadruples(quadruples).map((quad: string, index: number) => (
            <li
              key={index}
              className="break-all hover:bg-opacity-50 transition-colors px-2 py-1 rounded-sm"
            >
              {quad}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
