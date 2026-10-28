import { bookstoreCatalog } from "@/src/lib/bookstoreCatalog.js";

// Local UI preview used before a Firebase project is connected.
// App Hosting does not set NEXT_PUBLIC_SHELFSIDE_PREVIEW, so deployed
// reads still come from Cloud Firestore.

function toBookstore(shop, index) {
  const sumRating = shop.reviews.reduce((sum, review) => sum + review.rating, 0);
  return {
    id: shop.photo.split("/").pop().replace(".svg", ""),
    name: shop.name,
    category: shop.category,
    city: shop.city,
    price: shop.price,
    photo: shop.photo,
    numRatings: shop.reviews.length,
    sumRating,
    avgRating: shop.reviews.length ? sumRating / shop.reviews.length : 0,
    timestamp: new Date(Date.UTC(2024, index, 14)),
    reviews: shop.reviews.map((review, reviewIndex) => ({
      id: `${index}-${reviewIndex}`,
      rating: review.rating,
      text: review.text,
      userId: review.userId,
      timestamp: new Date(Date.UTC(2025, (index + reviewIndex) % 12, 8)),
    })),
  };
}

const previewBookstores = bookstoreCatalog.map(toBookstore);

export function isPreviewMode() {
  return process.env.NEXT_PUBLIC_SHELFSIDE_PREVIEW === "1";
}

export function getPreviewBookstores(filters = {}) {
  let shops = [...previewBookstores];

  if (filters.category) {
    shops = shops.filter((shop) => shop.category === filters.category);
  }
  if (filters.city) {
    shops = shops.filter((shop) => shop.city === filters.city);
  }
  if (filters.price) {
    shops = shops.filter((shop) => shop.price === filters.price.length);
  }

  shops.sort((left, right) => {
    if (filters.sort === "Review") {
      return right.numRatings - left.numRatings;
    }
    return right.avgRating - left.avgRating;
  });

  return shops.map(({ reviews, ...shop }) => shop);
}

export function getPreviewBookstore(id) {
  return previewBookstores.find((shop) => shop.id === id);
}
