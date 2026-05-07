"use client";

import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { FileNode } from "@/types";
import {
  ChevronDown,
  ChevronRight,
  FileCode2,
  Folder,
  FolderOpen,
  Pencil,
  Trash2,
  Plus,
  FolderPlus,
  FilePlus,
} from "lucide-react";
import { useMemo, useState } from "react";

function FileExplorer() {
  const {
    files,
    activeFileId,
    createFile,
    createFolder,
    renameNode,
    deleteNode,
    setActiveFile,
    toggleFolderOpen,
  } = useCodeEditorStore();

  const [dialog, setDialog] = useState<{
    type: "rename" | "delete";
    node: FileNode;
  } | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const roots = useMemo(
    () => Object.values(files).filter((f) => f.parentId === null),
    [files]
  );

  const childrenOf = (parentId: string | null) =>
    Object.values(files).filter((f) => f.parentId === parentId);

  const handleNewFile = (parentId?: string | null) => {
    createFile(parentId ?? null);
  };

  const handleNewFolder = (parentId?: string | null) => {
    createFolder(parentId ?? null);
  };

  const openRenameDialog = (node: FileNode) => {
    setDialog({ type: "rename", node });
    setRenameValue(node.name);
  };

  const openDeleteDialog = (node: FileNode) => {
    setDialog({ type: "delete", node });
  };

  const closeDialog = () => {
    setDialog(null);
    setRenameValue("");
  };

  const confirmRename = () => {
    if (!dialog || dialog.type !== "rename") return;
    const value = renameValue.trim();
    if (value && value !== dialog.node.name) {
      renameNode(dialog.node.id, value);
    }
    closeDialog();
  };

  const confirmDelete = () => {
    if (!dialog || dialog.type !== "delete") return;
    deleteNode(dialog.node.id);
    closeDialog();
  };

  const renderNode = (node: FileNode, depth = 0) => {
    const isActive = node.id === activeFileId;
    const indent = depth * 12;

    if (node.type === "folder") {
      const folderChildren = childrenOf(node.id);
      const isOpen = node.isOpen ?? true;

      return (
        <div key={node.id}>
          <div
            className="w-full flex items-center justify-between px-2 py-1.5 text-xs rounded-md hover:bg-[#262637] text-gray-300"
            style={{ paddingLeft: 8 + indent }}
          >
            <button
              type="button"
              onClick={() => toggleFolderOpen(node.id)}
              className="flex items-center gap-1.5 flex-1 text-left"
            >
              {isOpen ? (
                <ChevronDown className="w-3 h-3 text-gray-500" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-500" />
              )}
              {isOpen ? (
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Folder className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="truncate">{node.name}</span>
            </button>
            <div className="flex items-center gap-1 ml-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNewFile(node.id);
                }}
                className="p-0.5 rounded hover:bg-[#323244]"
                title="New file"
              >
                <FilePlus className="w-3 h-3 text-gray-400" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNewFolder(node.id);
                }}
                className="p-0.5 rounded hover:bg-[#323244]"
                title="New folder"
              >
                <FolderPlus className="w-3 h-3 text-gray-400" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openRenameDialog(node);
                }}
                className="p-0.5 rounded hover:bg-[#323244]"
                title="Rename folder"
              >
                <Pencil className="w-3 h-3 text-gray-400" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteDialog(node);
                }}
                className="p-0.5 rounded hover:bg-[#3a1f1f]"
                title="Delete folder"
              >
                <Trash2 className="w-3 h-3 text-red-400" />
              </button>
            </div>
          </div>
          {isOpen && folderChildren.length > 0 && (
            <div className="space-y-0.5 mt-0.5">
              {folderChildren.map((child) => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={node.id}
        className={`w-full flex items-center justify-between px-2 py-1.5 text-xs rounded-md ${
          isActive ? "bg-blue-500/20 text-blue-300" : "text-gray-300 hover:bg-[#262637]"
        }`}
        style={{ paddingLeft: 8 + indent }}
      >
        <button
          type="button"
          onClick={() => setActiveFile(node.id)}
          className="flex items-center gap-1.5 flex-1 text-left"
        >
          <FileCode2 className="w-3.5 h-3.5 text-blue-400" />
          <span className="truncate">{node.name}</span>
        </button>
        <div className="flex items-center gap-1 ml-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openRenameDialog(node);
            }}
            className="p-0.5 rounded hover:bg-[#323244]"
            title="Rename file"
          >
            <Pencil className="w-3 h-3 text-gray-400" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openDeleteDialog(node);
            }}
            className="p-0.5 rounded hover:bg-[#3a1f1f]"
            title="Delete file"
          >
            <Trash2 className="w-3 h-3 text-red-400" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col h-full bg-[#151521] border border-[#232338] rounded-lg">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#232338]">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Folder className="w-3.5 h-3.5 text-gray-400" />
            <span>Explorer</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleNewFile(null)}
              className="p-1 rounded hover:bg-[#232338]"
              title="New file"
            >
              <FilePlus className="w-3.5 h-3.5 text-gray-400" />
            </button>
            <button
              type="button"
              onClick={() => handleNewFolder(null)}
              className="p-1 rounded hover:bg-[#232338]"
              title="New folder"
            >
              <FolderPlus  className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-1.5 py-1 space-y-0.5">
          {roots.length === 0 ? (
            <button
              type="button"
              onClick={() => handleNewFile(null)}
              className="w-full text-xs text-gray-500 py-4 text-center hover:text-gray-300"
            >
              No files yet. Click to create <span className="text-gray-300">main.js</span>.
            </button>
          ) : (
            roots.map((node) => renderNode(node))
          )}
        </div>
      </div>

      <ExplorerDialog
        dialog={dialog}
        renameValue={renameValue}
        setRenameValue={setRenameValue}
        confirmRename={confirmRename}
        confirmDelete={confirmDelete}
        closeDialog={closeDialog}
      />
    </>
  );
}

export default FileExplorer;

// Dialog UI
function ExplorerDialog({
  dialog,
  renameValue,
  setRenameValue,
  confirmRename,
  confirmDelete,
  closeDialog,
}: {
  dialog: { type: "rename" | "delete"; node: FileNode } | null;
  renameValue: string;
  setRenameValue: (value: string) => void;
  confirmRename: () => void;
  confirmDelete: () => void;
  closeDialog: () => void;
}) {
  if (!dialog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-[#1a1a2e] border border-white/10 p-5 shadow-2xl">
        {dialog.type === "rename" ? (
          <>
            <h3 className="text-lg font-semibold text-white mb-3">Rename {dialog.node.type}</h3>
            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full rounded-lg bg-[#0f0f19] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter new name"
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={closeDialog}
                className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRename}
                className="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-500 transition-colors"
              >
                Save
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-white mb-2">Delete {dialog.node.type}?</h3>
            <p className="text-sm text-gray-400 mb-4">
              {dialog.node.type === "folder"
                ? "This will remove the folder and all of its contents. This action cannot be undone."
                : "This file will be removed permanently. This action cannot be undone."}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeDialog}
                className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-500 transition-colors"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
