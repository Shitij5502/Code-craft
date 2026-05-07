import type * as monaco from "monaco-editor";
import { Id } from "../../convex/_generated/dataModel";
import { AIMessage, AIConfig } from "@/lib/ai/types";

export interface Theme {
  id: string;
  label: string;
  color: string;
}

export interface Language {
  id: string;
  label: string;
  logoPath: string;
  monacoLanguage: string;
  defaultCode: string;
  pistonRuntime: LanguageRuntime;
}

export interface LanguageRuntime {
  language: string;
  version: string;
}

export interface ExecuteCodeResponse {
  compile?: {
    output: string;
  };
  run?: {
    output: string;
    stderr: string;
  };
}

export interface ExecutionResult {
  code: string;
  output: string;
  error: string | null;
}

export type FileNodeType = "file" | "folder";

export interface FileNode {
  id: string;
  name: string;
  type: FileNodeType;
  parentId: string | null;
  /**
   * Only used for folders in the UI to track expanded/collapsed state.
   */
  isOpen?: boolean;
  /**
   * Only present for files.
   */
  content?: string;
  /**
   * Only present for files to persist their active language.
   */
  language?: string;
}

export interface CodeEditorState {
  language: string;
  output: string;
  isRunning: boolean;
  error: string | null;
  theme: string;
  fontSize: number;
  editor: monaco.editor.IStandaloneCodeEditor | null;
  executionResult: ExecutionResult | null;

  // Virtual file system
  files: Record<string, FileNode>;
  activeFileId: string | null;
  openFileIds: string[];

  // AI-related state
  chatMessages: AIMessage[];
  isChatPanelOpen: boolean;
  isAIThinking: boolean;
  selectedCode: string;
  aiConfig: AIConfig;
  isAutocompleteEnabled: boolean;
  autocompleteDelay: number;

  setEditor: (editor: monaco.editor.IStandaloneCodeEditor) => void;
  getCode: () => string;
  setLanguage: (language: string) => void;
  setTheme: (theme: string) => void;
  setFontSize: (fontSize: number) => void;
  runCode: () => Promise<void>;

  // File system & tabs
  initializeFileSystem: () => void;
  createFile: (parentId?: string | null) => void;
  createFolder: (parentId?: string | null) => void;
  renameNode: (id: string, name: string) => void;
  toggleFolderOpen: (id: string) => void;
  deleteNode: (id: string) => void;
  setActiveFile: (id: string) => void;
  closeFileTab: (id: string) => void;
  updateActiveFileContent: (content: string) => void;

  // AI methods
  addChatMessage: (message: AIMessage) => void;
  toggleChatPanel: () => void;
  setAIThinking: (thinking: boolean) => void;
  setSelectedCode: (code: string) => void;
  updateAIConfig: (config: Partial<AIConfig>) => void;
  clearChatHistory: () => void;
  setAutocompleteEnabled: (enabled: boolean) => void;
  setAutocompleteDelay: (delay: number) => void;
}

export interface Snippet {
  _id: Id<"snippets">;
  _creationTime: number;
  userId: string;
  language: string;
  code: string;
  title: string;
  userName: string;
}
