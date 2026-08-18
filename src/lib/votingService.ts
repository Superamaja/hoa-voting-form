import {
  addDoc,
  collection,
  getDocs,
  query,
  updateDoc,
  where,
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
  const doc = snapshot.docs[0];
  if (!doc) return null;

  return { ref: doc.ref, hasVoted: Boolean(doc.data().voted) };
};

/** Records a ballot and flags the voter as having voted. */
export const castBallot = async (
  voter: VoterRecord,
  selections: string[],
): Promise<void> => {
  await updateDoc(voter.ref, { voted: true });
  await Promise.all(
    selections.map((vote) => addDoc(collection(db, VOTES), { vote })),
  );
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
