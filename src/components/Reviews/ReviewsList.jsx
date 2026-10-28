// This component handles the list of reviews for a given bookstore

import React from "react";
import { getReviewsByBookstoreId } from "@/src/lib/firebase/firestore.js";
import ReviewsListClient from "@/src/components/Reviews/ReviewsListClient";
import { ReviewSkeleton } from "@/src/components/Reviews/Review";
import { getFirestore } from "firebase/firestore";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp";

export default async function ReviewsList({ bookstoreId, userId }) {
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  const reviews = await getReviewsByBookstoreId(
    getFirestore(firebaseServerApp),
    bookstoreId
  );

  return (
    <ReviewsListClient
      initialReviews={reviews}
      bookstoreId={bookstoreId}
      userId={userId}
    />
  );
}

export function ReviewsListSkeleton({ numReviews }) {
  return (
    <article>
      <ul className="reviews">
        <ul>
          {Array(numReviews)
            .fill(0)
            .map((value, index) => (
              <ReviewSkeleton key={`loading-review-${index}`} />
            ))}
        </ul>
      </ul>
    </article>
  );
}
