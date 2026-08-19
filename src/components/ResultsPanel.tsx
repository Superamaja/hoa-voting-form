import { useResults } from "../hooks/useResults";
import { Button } from "./ui/Button";
import { ArrowLeftIcon, RefreshIcon } from "./ui/Icons";

type ResultsPanelProps = {
  onBack: () => void;
};

type StatProps = { label: string; value: string };

const Stat = ({ label, value }: StatProps) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
    <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
      {label}
    </p>
    <p className="mt-1 text-xl font-bold text-white tabular-nums">{value}</p>
  </div>
);

export const ResultsPanel = ({ onBack }: ResultsPanelProps) => {
  const { results, isLoading, error, refresh } = useResults();

  const entries = Object.entries(results?.tallies ?? {}).sort(
    ([, a], [, b]) => b - a,
  );
  const leadingVotes = Math.max(1, ...entries.map(([, votes]) => votes));
  const turnout =
    results && results.registeredVoters > 0
      ? `${Math.round((results.ballotsCast / results.registeredVoters) * 100)}%`
      : "—";

  return (
    <section className="w-full max-w-lg animate-fade-up surface p-8 sm:p-10">
      <header className="mb-8">
        <span className="text-[11px] font-semibold tracking-widest text-brand-200 uppercase">
          Live tally
        </span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
          Election results
        </h1>
      </header>

      {error && <p className="mb-6 text-sm text-rose-300">{error}</p>}

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Stat
          label="Ballots cast"
          value={
            results ? `${results.ballotsCast}/${results.registeredVoters}` : "—"
          }
        />
        <Stat label="Turnout" value={turnout} />
      </div>

      <div className="space-y-3">
        {isLoading && !results
          ? [0, 1, 2].map((placeholder) => (
              <div
                key={placeholder}
                className="h-16 animate-pulse rounded-2xl bg-white/[0.04]"
              />
            ))
          : entries.map(([candidate, votes]) => (
              <div
                key={candidate}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-sm font-medium text-slate-100">
                    {candidate}
                  </span>
                  <span className="text-sm font-bold text-white tabular-nums">
                    {votes}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-400 to-violet-400 transition-all duration-700"
                    style={{ width: `${(votes / leadingVotes) * 100}%` }}
                  />
                </div>
              </div>
            ))}
      </div>

      <div className="mt-8 flex gap-3">
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={() => void refresh()} isLoading={isLoading}>
          <RefreshIcon className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    </section>
  );
};
