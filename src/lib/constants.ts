export const CANDIDATES = ["Ryan Dreier", "Alen Lin", "Mari Conway"] as const;

/** Maximum number of candidates a voter may select. */
export const MAX_VOTES = 3;

/** Number of write-in slots offered on the ballot. */
export const WRITE_IN_SLOTS = 3;

export const ELECTION_TITLE = "Illini Grove Annual Board Election";
export const ELECTION_SUBTITLE = `Select up to ${MAX_VOTES} candidates to serve on the board.`;
