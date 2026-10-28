import { gemini20Flash, googleAI } from "@genkit-ai/googleai";
import { genkit } from "genkit";
import { getReviewsByBookstoreId } from "@/src/lib/firebase/firestore.js";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp";
import { getFirestore } from "firebase/firestore";

// Read the visitor notes for one shop and ask Gemini for a single-sentence summary.
export async function GeminiSummary({ bookstoreId }) {
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  const reviews = await getReviewsByBookstoreId(
    getFirestore(firebaseServerApp),
    bookstoreId,
  );
  const notes = (reviews || []).map((review) => review.text).filter(Boolean);

  if (notes.length === 0) {
    return (
      <div className="bookstore__review_summary">
        <p>No visitor notes yet. A summary appears after the first review.</p>
      </div>
    );
  }

  const prompt = `
    The following notes were written by visitors to an independent bookstore.
    Each note is separated by the character "@".
    Write one sentence, in a warm and specific voice, summarizing what people think of the shop.
    Do not mention that you are an AI, and do not invent details that are not in the notes.

    Notes: ${notes.join("@")}
  `;

  try {
    const ai = genkit({
      plugins: [googleAI()],
      model: gemini20Flash,
    });
    const { text } = await ai.generate(prompt);

    return (
      <div className="bookstore__review_summary">
        <p>{text}</p>
        <p>Summary of visitor notes, written by Gemini</p>
      </div>
    );
  } catch (error) {
    console.error("Gemini could not summarize the visitor notes.", error);
    return (
      <div className="bookstore__review_summary">
        <p>
          A summary could not be generated. Set GEMINI_API_KEY in the
          environment, then reload this shop.
        </p>
      </div>
    );
  }
}

export function GeminiSummarySkeleton() {
  return (
    <div className="bookstore__review_summary">
      <p>Summarizing visitor notes with Gemini...</p>
    </div>
  );
}
