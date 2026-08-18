import { useCallback, useMemo, useState } from "react";
import { MAX_VOTES, WRITE_IN_SLOTS } from "../lib/constants";
import { isValidEmail, normalizeEmail, toTitleCase } from "../lib/format";
import { castBallot, findVoter } from "../lib/votingService";

export type WriteIn = {
  enabled: boolean;
  name: string;
};

const emptyWriteIns = (): WriteIn[] =>
  Array.from({ length: WRITE_IN_SLOTS }, () => ({ enabled: false, name: "" }));

type UseBallotOptions = {
  /** Invoked when the email field matches the analytics password. */
  onUnlockAnalytics: () => void;
};

/** Owns ballot state, validation, and submission. */
export const useBallot = ({ onUnlockAnalytics }: UseBallotOptions) => {
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [writeIns, setWriteIns] = useState<WriteIn[]>(emptyWriteIns);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectionCount = useMemo(
    () =>
      selected.length + writeIns.filter((writeIn) => writeIn.enabled).length,
    [selected, writeIns],
  );

  const toggleCandidate = useCallback((candidate: string) => {
    setSelected((current) =>
      current.includes(candidate)
        ? current.filter((name) => name !== candidate)
        : [...current, candidate],
    );
  }, []);

  const updateWriteIn = useCallback(
    (index: number, patch: Partial<WriteIn>) => {
      setWriteIns((current) =>
        current.map((writeIn, i) =>
          i === index
            ? {
                ...writeIn,
                ...patch,
                ...(patch.name !== undefined
                  ? { name: toTitleCase(patch.name) }
                  : {}),
              }
            : writeIn,
        ),
      );
    },
    [],
  );

  const submit = useCallback(async () => {
    setError("");

    const address = normalizeEmail(email);

    if (address === import.meta.env.VITE_ANALYTICS_PASSWORD) {
      onUnlockAnalytics();
      return;
    }

    if (!address) return setError("Please enter your email.");
    if (!isValidEmail(address)) return setError("Please enter a valid email.");

    const selections = [...selected];
    for (const writeIn of writeIns) {
      if (!writeIn.enabled) continue;
      if (!writeIn.name.trim()) {
        return setError("Please don't leave a checked write-in blank.");
      }
      selections.push(writeIn.name.trim());
    }

    if (selections.length === 0) {
      return setError("Please select at least one candidate.");
    }
    if (selections.length > MAX_VOTES) {
      return setError(`Please select at most ${MAX_VOTES} candidates.`);
    }

    setIsSubmitting(true);
    try {
      const voter = await findVoter(address);
      if (!voter) return setError("Your email is not registered to vote.");
      if (voter.hasVoted) return setError("You have already voted.");

      await castBallot(voter, selections);
      setIsSubmitted(true);
    } catch {
      setError(
        "Something went wrong submitting your ballot. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [email, onUnlockAnalytics, selected, writeIns]);

  return {
    email,
    setEmail,
    selected,
    toggleCandidate,
    writeIns,
    updateWriteIn,
    selectionCount,
    error,
    dismissError: useCallback(() => setError(""), []),
    isSubmitted,
    isSubmitting,
    submit,
  };
};
