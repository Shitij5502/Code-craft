import EditorPanel from "./_components/EditorPanel";
import Header from "./_components/Header";
import OutputPanel from "./_components/OutputPanel";
import AIChatPanel from "./_components/AIChatPanel";
import KeyboardShortcuts from "./_components/KeyboardShortcuts";
import WeeklyProgressCard from "./_components/WeeklyProgressCard";

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1800px] mx-auto p-4">
        <Header />

        <div className="flex flex-col gap-4">
          <WeeklyProgressCard />
          <EditorPanel />
          <OutputPanel />
        </div>

        <AIChatPanel />
        <KeyboardShortcuts />
      </div>
    </div>
  );
}