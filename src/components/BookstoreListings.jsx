"use client";

// This components handles the bookstore listings page
// It receives data from src/app/page.jsx, such as the initial bookstores and search params from the URL

import Link from "next/link";
import { React, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import renderStars from "@/src/components/Stars.jsx";
import { getBookstoresSnapshot } from "@/src/lib/firebase/firestore.js";
import Filters from "@/src/components/Filters.jsx";

const BookstoreItem = ({ bookstore }) => (
  <li key={bookstore.id}>
    <Link href={`/bookstore/${bookstore.id}`}>
      <ActiveResturant bookstore={bookstore} />
    </Link>
  </li>
);

const ActiveResturant = ({ bookstore }) => (
  <div>
    <ImageCover photo={bookstore.photo} name={bookstore.name} />
    <ResturantDetails bookstore={bookstore} />
  </div>
);

const ImageCover = ({ photo, name }) => (
  <div className="image-cover">
    <img src={photo} alt={name} />
  </div>
);

const ResturantDetails = ({ bookstore }) => (
  <div className="bookstore__details">
    <h2>{bookstore.name}</h2>
    <BookstoreRating bookstore={bookstore} />
    <BookstoreMetadata bookstore={bookstore} />
  </div>
);

const BookstoreRating = ({ bookstore }) => (
  <div className="bookstore__rating">
    <ul>{renderStars(bookstore.avgRating)}</ul>
    <span>({bookstore.numRatings})</span>
  </div>
);

const BookstoreMetadata = ({ bookstore }) => (
  <div className="bookstore__meta">
    <p>
      {bookstore.category} | {bookstore.city}
    </p>
    <p>{"$".repeat(bookstore.price)}</p>
  </div>
);

export default function BookstoreListings({
  initialBookstores,
  searchParams,
}) {
  const router = useRouter();

  // The initial filters are the search params from the URL, useful for when the user refreshes the page
  const initialFilters = {
    city: searchParams.city || "",
    category: searchParams.category || "",
    price: searchParams.price || "",
    sort: searchParams.sort || "",
  };

  const [bookstores, setBookstores] = useState(initialBookstores);
  const [filters, setFilters] = useState(initialFilters);

  const applyFilters = (updater) => {
    const nextFilters = typeof updater === "function" ? updater(filters) : updater;
    setFilters(nextFilters);
    routerWithFilters(router, nextFilters);
  };

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SHELFSIDE_PREVIEW === "1") {
      return;
    }
    return getBookstoresSnapshot((data) => {
      setBookstores(data);
    }, filters);
  }, [filters]);

  const visibleBookstores =
    process.env.NEXT_PUBLIC_SHELFSIDE_PREVIEW === "1"
      ? initialBookstores
      : bookstores;

  return (
    <article>
      <Filters filters={filters} setFilters={applyFilters} />
      {visibleBookstores.length === 0 ? (
        <p className="empty-state">
          {filters.city || filters.category || filters.price
            ? "No bookstores match these filters."
            : "No bookstores yet. Sign in with Google, open the profile menu, and choose Add sample bookstores."}
        </p>
      ) : (
        <ul className="bookstores">
          {visibleBookstores.map((bookstore) => (
            <BookstoreItem key={bookstore.id} bookstore={bookstore} />
          ))}
        </ul>
      )}
    </article>
  );
}

function routerWithFilters(router, filters) {
  const queryParams = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      queryParams.append(key, value);
    }
  }

  const queryString = queryParams.toString();
  router.push(`?${queryString}`);
}
