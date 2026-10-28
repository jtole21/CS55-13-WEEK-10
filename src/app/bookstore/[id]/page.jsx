import Bookstore from "@/src/components/Bookstore.jsx";
import { Suspense } from "react";
import { getBookstoreById } from "@/src/lib/firebase/firestore.js";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js";
import ReviewsList, {
  ReviewsListSkeleton,
} from "@/src/components/Reviews/ReviewsList";
import {
  GeminiSummary,
  GeminiSummarySkeleton,
} from "@/src/components/Reviews/ReviewSummary";
import { Review } from "@/src/components/Reviews/Review";
import { getFirestore } from "firebase/firestore";
import {
  getPreviewBookstore,
  isPreviewMode,
} from "@/src/lib/previewCatalog.js";

export default async function Home(props) {
  const params = await props.params;

  if (isPreviewMode()) {
    const bookstore = getPreviewBookstore(params.id);
    if (!bookstore) {
      throw new Error("That bookstore is not in the preview catalog.");
    }
    return (
      <main className="main__bookstore">
        <Bookstore
          id={params.id}
          initialBookstore={bookstore}
          initialUserId=""
        >
          <div className="bookstore__review_summary">
            <p>
              Visitors describe {bookstore.name} through the notes below.
              The published shop page asks Gemini for one sentence from these notes.
            </p>
            <p>Gemini summary</p>
          </div>
        </Bookstore>
        <article>
          <ul className="reviews">
            <ul>
              {bookstore.reviews.map((review) => (
                <Review
                  key={review.id}
                  rating={review.rating}
                  text={review.text}
                  timestamp={review.timestamp}
                />
              ))}
            </ul>
          </ul>
        </article>
      </main>
    );
  }

  const { currentUser } = await getAuthenticatedAppForUser();
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  const bookstore = await getBookstoreById(
    getFirestore(firebaseServerApp),
    params.id
  );

  return (
    <main className="main__bookstore">
      <Bookstore
        id={params.id}
        initialBookstore={bookstore}
        initialUserId={currentUser?.uid || ""}
      >
        <Suspense fallback={<GeminiSummarySkeleton />}>
          <GeminiSummary bookstoreId={params.id} />
        </Suspense>
      </Bookstore>
      <Suspense
        fallback={<ReviewsListSkeleton numReviews={bookstore.numRatings} />}
      >
        <ReviewsList bookstoreId={params.id} userId={currentUser?.uid || ""} />
      </Suspense>
    </main>
  );
}
