import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
  type DocumentReference,
} from "firebase/firestore";
import { db } from "../firebase";
import { CANDIDATES } from "./constants";

const EMAILS = "emails";
const VOTES = "votes";

export type VoterRecord = {
  ref: DocumentReference;
  hasVoted: boolean;
};

export type ElectionResults = {
  tallies: Record<string, number>;
  ballotsCast: number;
  registeredVoters: number;
};

/** Looks up a registered voter by email. Returns null when unregistered. */
export const findVoter = async (email: string): Promise<VoterRecord | null> => {
  const snapshot = await getDocs(
    query(collection(db, EMAILS), where("email", "==", email)),
  );
  const record = snapshot.docs[0];
  if (!record) return null;

  return { ref: record.ref, hasVoted: Boolean(record.data().voted) };
};

/**
 * Records a ballot and flags the voter as having voted, atomically: a partial
 * failure must never mark a voter as having voted without counting their votes.
 */
export const castBallot = async (
  voter: VoterRecord,
  selections: string[],
): Promise<void> => {
  const batch = writeBatch(db);
  batch.update(voter.ref, { voted: true });
  for (const vote of selections) {
    batch.set(doc(collection(db, VOTES)), { vote });
  }
  await batch.commit();
};

/** Aggregates every recorded vote plus voter turnout. */
export const fetchResults = async (): Promise<ElectionResults> => {
  const [voteSnapshot, emailSnapshot] = await Promise.all([
    getDocs(collection(db, VOTES)),
    getDocs(collection(db, EMAILS)),
  ]);

  const tallies: Record<string, number> = Object.fromEntries(
    CANDIDATES.map((candidate) => [candidate, 0]),
  );
  for (const doc of voteSnapshot.docs) {
    const vote = doc.data().vote as string;
    tallies[vote] = (tallies[vote] ?? 0) + 1;
  }

  return {
    tallies,
    ballotsCast: emailSnapshot.docs.filter((doc) => doc.data().voted).length,
    registeredVoters: emailSnapshot.docs.length,
  };
};
