// Load the client component that draws the filterable bookstore grid.
import BookstoreListings from "@/src/components/BookstoreListings.jsx";
import { getBookstores } from "@/src/lib/firebase/firestore.js";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js";
import { getFirestore } from "firebase/firestore";
import {
  getPreviewBookstores,
  isPreviewMode,
} from "@/src/lib/previewCatalog.js";

// Tell Next.js to render this route on the server for every request.
// Without this, the build would freeze an empty bookstore list into static HTML.
export const dynamic = "force-dynamic";

// Setting revalidate to 0 is another way to force a fresh server render.
// export const revalidate = 0;

// Home is an async Server Component, so Next.js waits for its data before sending HTML.
export default async function Home(props) {
  // Next.js passes the URL query string as a promise; await it before reading filters.
  const searchParams = await props.searchParams;
  // A URL such as ?city=Portland&category=Poetry&sort=Review becomes the filter.
  // Preview mode reads the local catalog. Otherwise the list comes from Firestore.
  const bookstores = isPreviewMode()
    ? getPreviewBookstores(searchParams)
    : await getBookstores(
        getFirestore((await getAuthenticatedAppForUser()).firebaseServerApp),
        searchParams,
      );
  // Send the home page, with the server-fetched bookstores as the initial list.
  return (
    <main className="main__home">
      <section className="hero">
        <p className="hero__kicker">Independent bookstores</p>
        <h1>Find the shop, then read the room.</h1>
        <p>
          Shelfside collects visitor notes on independent bookstores. Filter
          by city or shelf, leave your own note, and Gemini turns those notes
          into a short summary for each shop.
        </p>
      </section>
      <BookstoreListings
        initialBookstores={bookstores} // Seed the grid with data loaded on the server.
        searchParams={searchParams} // Keep the same filters for the live snapshot listener.
      />
    </main>
  );
}
