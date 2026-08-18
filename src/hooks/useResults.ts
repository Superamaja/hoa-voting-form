import { useCallback, useEffect, useState } from "react";
import { fetchResults, type ElectionResults } from "../lib/votingService";

/** Loads and refreshes aggregated election results. */
export const useResults = () => {
  const [results, setResults] = useState<ElectionResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setResults(await fetchResults());
    } catch {
      setError("Unable to load results.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { results, isLoading, error, refresh };
};
