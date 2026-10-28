import { getReviewsByBookstoreId } from "@/src/lib/firebase/firestore.js";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp";
import { getFirestore } from "firebase/firestore";

const MODEL = "gemini-3.8-flash";

// App Hosting runs as the project service account, which can call Vertex AI.
async function summarizeWithVertex(prompt) {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || "week10-cs5513";
  const tokenResponse = await fetch(
    "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
    {
      headers: { "Metadata-Flavor": "Google" },
      cache: "no-store",
    },
  );
  if (!tokenResponse.ok) {
    throw new Error("App Hosting did not provide a service account token.");
  }
  const { access_token: accessToken } = await tokenResponse.json();
  const response = await fetch(
    `https://aiplatform.googleapis.com/v1/projects/${projectId}/locations/global/publishers/google/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    },
  );
  if (!response.ok) {
    throw new Error(`Vertex Gemini returned ${response.status}.`);
  }
  const data = await response.json();
  const text = (data.candidates?.[0]?.content?.parts || [])
    .map((part) => part.text || "")
    .join("")
    .trim();
  if (!text) {
    throw new Error("Vertex Gemini returned an empty summary.");
  }
  return text;
}

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
    const text = await summarizeWithVertex(prompt);

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
        <p>A summary could not be generated. Reload this shop in a moment.</p>
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
