import { useState } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  where,
  query,
} from "firebase/firestore";

function App() {
  const candidates = ["Puffy", "Brownie", "Connor", "Mimi"];

  const [email, setEmail] = useState("");
  const [votes, setVotes] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [displayAnalytics, setDisplayAnalytics] = useState(false);
  const [emailsVoted, setEmailsVoted] = useState<string>("");
  const [votingResults, setVotingResults] = useState<{ [key: string]: number }>(
    {},
  );

  const handleError = (message: string) => {
    setError(message);
    setSuccess("");
  };

  const handleVote = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;

    if (checked) {
      setVotes((votes) => [...votes, value]);
    } else {
      setVotes((votes) => votes.filter((vote) => vote !== value));
    }
  };

  const getAnalytics = async () => {
    setVotingResults({});
    setEmailsVoted("");

    const querySnapshot = await getDocs(collection(db, "votes"));
    const votes = querySnapshot.docs.map((doc) => doc.data().vote);

    const analytics: { [key: string]: number } = {};
    for (const vote of votes) {
      if (analytics[vote]) {
        analytics[vote]++;
      } else {
        analytics[vote] = 1;
      }
    }
    setVotingResults(analytics);

    const emailQuerySnapshot = await getDocs(collection(db, "emails"));
    setEmailsVoted(
      `${emailQuerySnapshot.docs.filter((doc) => doc.data().voted).length}/${emailQuerySnapshot.docs.length}`,
    );
  };

  const handleSubmit = async () => {
    if (!email) {
      handleError("Please enter your email.");
      return;
    }

    if (email === "dog") {
      setDisplayAnalytics(true);
      getAnalytics();
      return;
    }

    // Check if the email is in the database
    let email_doc;
    try {
      const emailQuery = query(
        collection(db, "emails"),
        where("email", "==", email),
      );
      const querySnapshot = await getDocs(emailQuery);
      email_doc = querySnapshot.docs[0];
    } catch (error) {
      handleError("Error checking email.");
      return;
    }

    if (!email_doc) {
      handleError("Your email is not registered to vote.");
      return;
    }

    // Check if the email has already voted
    if (email_doc.data().voted) {
      handleError("You have already voted.");
      return;
    }

    // Check if the user has selected 1-3 candidates
    if (votes.length === 0) {
      handleError("Please select at least one candidate.");
      return;
    }
    if (votes.length > 3) {
      handleError("Please select at most three candidates.");
      return;
    }

    // Process the vote
    await updateDoc(email_doc.ref, {
      voted: true,
    });

    for (const vote of votes) {
      await addDoc(collection(db, "votes"), {
        vote,
      });
    }

    setSuccess("Thank you for voting!");
    setError("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-700">
      {displayAnalytics ? (
        <div className="mx-auto max-w-md rounded-lg bg-slate-300 p-6 shadow-lg">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Election Analytics
          </h2>
          {Object.keys(votingResults).length === 0 ? (
            <div>Loading...</div>
          ) : null}
          {Object.entries(votingResults).map(([candidate, votes]) => (
            <div key={candidate} className="my-1">
              <span className="font-semibold">{candidate}</span>: {votes}
            </div>
          ))}
          <div className="my-4">
            <span className="font-semibold">Emails Voted:</span> {emailsVoted}
          </div>
          <button
            className="my-4 w-full rounded-lg bg-green-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300"
            onClick={getAnalytics}
          >
            Refresh
          </button>
          <button
            className="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
            onClick={() => setDisplayAnalytics(false)}
          >
            Back
          </button>
        </div>
      ) : (
        <div className="mx-auto mt-10 max-w-md rounded-lg bg-slate-300 p-6 shadow-lg">
          {error && (
            <div className="mb-4 rounded-lg border border-red-300 bg-red-100 p-2 text-sm text-red-600">
              <button
                className="float-right text-red-600 hover:text-red-800"
                onClick={() => setError("")}
              >
                x
              </button>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-lg bg-green-100 p-2 text-sm text-green-600">
              <button
                className="float-right text-green-600 hover:text-green-800"
                onClick={() => setSuccess("")}
              >
                x
              </button>
              {success}
            </div>
          )}
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Illini Grove Annual Board Election
          </h2>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="vote"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Vote for up to 3 candidates
            </label>
            {candidates.map((candidate) => (
              <div key={candidate}>
                <input
                  className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-800"
                  type="checkbox"
                  id={`checkbox-${candidate}`}
                  value={candidate}
                  onChange={handleVote}
                  checked={votes.includes(candidate)}
                />
                <label
                  htmlFor={`checkbox-${candidate}`}
                  className="ml-2 text-sm text-gray-900"
                >
                  {candidate}
                </label>
              </div>
            ))}
          </div>
          <button
            className="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
            onClick={handleSubmit}
          >
            Vote
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
