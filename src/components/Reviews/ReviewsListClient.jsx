"use client";

import React, { useState, useEffect } from "react";
import { getReviewsSnapshotByBookstoreId } from "@/src/lib/firebase/firestore.js";
import { Review } from "@/src/components/Reviews/Review";

export default function ReviewsListClient({
  initialReviews,
  bookstoreId,
  userId,
}) {
  const [reviews, setReviews] = useState(initialReviews);

  useEffect(() => {
    return getReviewsSnapshotByBookstoreId(bookstoreId, (data) => {
      setReviews(data);
    });
  }, [bookstoreId]);
  return (
    <article>
      <ul className="reviews">
        {reviews.length > 0 ? (
          <ul>
            {reviews.map((review) => (
              <Review
                key={review.id}
                rating={review.rating}
                text={review.text}
                timestamp={review.timestamp}
              />
            ))}
          </ul>
        ) : (
          <p>
            No visitor notes yet.
            {!userId ? " Sign in, then" : ""} leave the first one.
          </p>
        )}
      </ul>
    </article>
  );
}
