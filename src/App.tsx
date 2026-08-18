import { useState } from "react";
import { AuroraBackground } from "./components/AuroraBackground";
import { ResultsPanel } from "./components/ResultsPanel";
import { VotingForm } from "./components/VotingForm";

function App() {
  const [showResults, setShowResults] = useState(false);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <AuroraBackground />
      <main className="relative flex w-full justify-center">
        {showResults ? (
          <ResultsPanel onBack={() => setShowResults(false)} />
        ) : (
          <VotingForm onUnlockAnalytics={() => setShowResults(true)} />
        )}
      </main>
      <footer className="relative mt-8 text-xs text-slate-600">
        Illini Grove Homeowners Association
      </footer>
    </div>
  );
}

export default App;
