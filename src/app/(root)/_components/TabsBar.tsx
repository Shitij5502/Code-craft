"use client";

import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { X } from "lucide-react";

function TabsBar() {
  const { files, openFileIds, activeFileId, setActiveFile, closeFileTab } = useCodeEditorStore();

  if (openFileIds.length === 0) return null;

  return (
    <div className="flex items-center px-2 py-1 border-b border-[#232338] bg-[#14141f] rounded-t-lg overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
      <div className="flex items-center gap-1 min-w-max">
        {openFileIds.map((id) => {
          const file = files[id];
          if (!file || file.type !== "file") return null;

          const isActive = id === activeFileId;

          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveFile(id)}
              className={`group flex items-center gap-2 px-3 py-1 text-xs rounded-md border flex-shrink-0 ${
                isActive
                  ? "bg-[#1f2937] border-blue-500/40 text-blue-100"
                  : "bg-[#151521] border-transparent text-gray-300 hover:bg-[#1b1b2b]"
              }`}
            >
              <span className="truncate max-w-[40vw] sm:max-w-[200px]">{file.name}</span>
              <X
                className="w-3 h-3 text-gray-500 hover:text-gray-300"
                onClick={(e) => {
                  e.stopPropagation();
                  closeFileTab(id);
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default TabsBar;


