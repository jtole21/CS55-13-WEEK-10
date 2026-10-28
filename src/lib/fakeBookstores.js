import { bookstoreCatalog } from "@/src/lib/bookstoreCatalog.js";
import { Timestamp } from "firebase/firestore";

// Turn the curated catalog into Firestore documents and visitor notes.
// Dates are fixed so the sample set is the same each time it is added.
export async function generateFakeBookstoresAndReviews() {
  return bookstoreCatalog.map((shop, index) => {
    const bookstoreTimestamp = Timestamp.fromDate(
      new Date(Date.UTC(2023, index, 14, 16, 0, 0)),
    );

    const ratingsData = shop.reviews.map((review, reviewIndex) => ({
      rating: review.rating,
      text: review.text,
      userId: review.userId,
      timestamp: Timestamp.fromDate(
        new Date(Date.UTC(2025, (index + reviewIndex) % 12, 6 + reviewIndex, 18, 30, 0)),
      ),
    }));

    const sumRating = ratingsData.reduce(
      (sum, review) => sum + review.rating,
      0,
    );

    const bookstoreData = {
      category: shop.category,
      name: shop.name,
      avgRating: ratingsData.length ? sumRating / ratingsData.length : 0,
      city: shop.city,
      numRatings: ratingsData.length,
      sumRating,
      price: shop.price,
      photo: shop.photo,
      timestamp: bookstoreTimestamp,
    };

    return { bookstoreData, ratingsData };
  });
}
