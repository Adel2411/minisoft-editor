import { X, AlertCircle } from "lucide-react";

interface ErrorReporterProps {
  error: string;
  onDismiss: () => void;
  theme: "dark" | "light";
}

export default function ErrorReporter({
  error,
  onDismiss,
  theme,
}: ErrorReporterProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div
        className={`p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 transform transition-all duration-300 ${
          theme === "dark"
            ? "bg-gray-800 text-gray-100"
            : "bg-white text-gray-900"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <AlertCircle className="text-red-500" size={24} />
            Compilation Error
          </h3>
          <button
            onClick={onDismiss}
            className={`p-1 rounded-full hover:bg-opacity-20 ${
              theme === "dark" ? "hover:bg-gray-600" : "hover:bg-gray-200"
            }`}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div
          className={`p-4 rounded-md overflow-auto max-h-80 ${
            theme === "dark"
              ? "bg-gray-900 text-red-300"
              : "bg-red-50 text-red-800"
          }`}
        >
          <pre className="whitespace-pre-wrap font-mono text-sm">{error}</pre>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onDismiss}
            className={`px-4 py-2 rounded-md transition-colors ${
              theme === "dark"
                ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
