import { useBallot } from "../hooks/useBallot";
import {
  CANDIDATES,
  ELECTION_SUBTITLE,
  ELECTION_TITLE,
  MAX_VOTES,
} from "../lib/constants";
import { CandidateOption } from "./CandidateOption";
import { WriteInRow } from "./WriteInRow";
import { Alert } from "./ui/Alert";
import { Button } from "./ui/Button";
import { BallotIcon } from "./ui/Icons";
import { TextField } from "./ui/TextField";

type VotingFormProps = {
  onUnlockAnalytics: () => void;
};

export const VotingForm = ({ onUnlockAnalytics }: VotingFormProps) => {
  const ballot = useBallot({ onUnlockAnalytics });
  const atLimit = ballot.selectionCount >= MAX_VOTES;

  if (ballot.isSubmitted) {
    return (
      <section className="w-full max-w-lg animate-scale-in surface p-10 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30">
          <BallotIcon className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Your ballot is in
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Thank you for voting in the {ELECTION_TITLE}. Results are announced
          once voting closes.
        </p>
      </section>
    );
  }

  return (
    <section className="w-full max-w-lg animate-fade-up surface p-8 sm:p-10">
      <header className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold tracking-widest text-brand-200 uppercase">
          <BallotIcon className="h-3.5 w-3.5" />
          Official ballot
        </span>
        <h1 className="mt-4 text-3xl leading-tight font-bold tracking-tight text-white">
          {ELECTION_TITLE}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          {ELECTION_SUBTITLE}
        </p>
      </header>

      <form
        className="space-y-7"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void ballot.submit();
        }}
      >
        {ballot.error && (
          <Alert message={ballot.error} onDismiss={ballot.dismissError} />
        )}

        <TextField
          id="email"
          type="email"
          label="Registered email"
          placeholder="name@example.com"
          autoComplete="email"
          value={ballot.email}
          onChange={(e) => ballot.setEmail(e.target.value)}
          hint="Must match the address on the homeowner roster."
        />

        <fieldset className="space-y-3">
          <legend className="flex w-full items-center justify-between pb-1">
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Candidates
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tabular-nums transition-colors ${
                atLimit
                  ? "bg-brand-500/20 text-brand-200"
                  : "bg-white/5 text-slate-400"
              }`}
            >
              {ballot.selectionCount} / {MAX_VOTES} selected
            </span>
          </legend>

          {CANDIDATES.map((candidate) => (
            <CandidateOption
              key={candidate}
              candidate={candidate}
              isSelected={ballot.selected.includes(candidate)}
              isDisabled={atLimit && !ballot.selected.includes(candidate)}
              onToggle={ballot.toggleCandidate}
            />
          ))}

          <p className="pt-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Write-ins
          </p>
          {ballot.writeIns.map((writeIn, index) => (
            <WriteInRow
              key={`write-in-${index}`}
              index={index}
              writeIn={writeIn}
              isDisabled={atLimit && !writeIn.enabled}
              onChange={ballot.updateWriteIn}
            />
          ))}
        </fieldset>

        <Button type="submit" isLoading={ballot.isSubmitting}>
          {ballot.isSubmitting ? "Submitting ballot" : "Submit ballot"}
        </Button>
      </form>
    </section>
  );
};
