import { useCallback, useEffect, useState } from "react";
import { fetchResults, type ElectionResults } from "../lib/votingService";

type Outcome = { data: ElectionResults | null; error: string };

/** Fetches tallies, converting failures into a value instead of throwing. */
const loadOutcome = async (): Promise<Outcome> => {
  try {
    return { data: await fetchResults(), error: "" };
  } catch {
    return { data: null, error: "Unable to load results." };
  }
};

/** Loads and refreshes aggregated election results. */
export const useResults = () => {
  const [results, setResults] = useState<ElectionResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const apply = useCallback(({ data, error: message }: Outcome) => {
    if (data) setResults(data);
    setError(message);
    setIsLoading(false);
  }, []);

  // Initial load. `active` discards a response that lands after unmount.
  useEffect(() => {
    let active = true;
    void loadOutcome().then((outcome) => {
      if (active) apply(outcome);
    });
    return () => {
      active = false;
    };
  }, [apply]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    apply(await loadOutcome());
  }, [apply]);

  return { results, isLoading, error, refresh };
};
