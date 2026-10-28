// Load the generator that builds sample bookstores and their reviews.
import { generateFakeBookstoresAndReviews } from "@/src/lib/fakeBookstores.js";

// Load the Firestore operations used to read, filter, and write bookstore data.
import {
  collection, // Points at a collection such as bookstores or ratings.
  onSnapshot, // Subscribes to live document or query updates.
  query, // Combines a collection with filters and sort orders.
  getDocs, // Reads every document that matches a query once.
  doc, // Points at one document, or creates a reference for a new one.
  getDoc, // Reads a single document once.
  updateDoc, // Patches fields on an existing document.
  orderBy, // Sorts query results by a field.
  Timestamp, // Converts a JavaScript date into a Firestore timestamp.
  runTransaction, // Applies the rating update and the new review atomically.
  where, // Adds an equality filter to a query.
  addDoc, // Creates a document with an automatic id.
} from "firebase/firestore";

// Load the client Firestore instance used by browser-side listeners and writes.
import { db } from "@/src/lib/firebase/clientApp";

// Save a new public image URL onto the bookstore document it belongs to.
export async function updateBookstoreImageReference(
  bookstoreId, // The bookstore whose photo is being replaced.
  publicImageUrl, // The Cloud Storage download URL for the uploaded file.
) {
  // Build a reference to that bookstore document.
  const bookstoreRef = doc(collection(db, "bookstores"), bookstoreId);
  // Only write when the reference was created.
  if (bookstoreRef) {
    // Replace the photo field with the new public URL.
    await updateDoc(bookstoreRef, { photo: publicImageUrl });
  }
}

// Inside a transaction, recompute the bookstore rating and insert the new review.
const updateWithRating = async (
  transaction, // The transaction that will read and write atomically.
  docRef, // The bookstore document whose averages must change.
  newRatingDocument, // The new document in the ratings subcollection.
  review, // The submitted rating, text, and user id.
) => {
  // Read the current bookstore inside the transaction.
  const bookstore = await transaction.get(docRef);
  // Read its fields, which may be missing on an unexpected document.
  const data = bookstore.data();
  // Increase the rating count by one, starting from one when this is the first review.
  const newNumRatings = data?.numRatings ? data.numRatings + 1 : 1;
  // Add this review's star value to the running sum.
  const newSumRating = (data?.sumRating || 0) + Number(review.rating);
  // Divide the new sum by the new count to get the average star rating.
  const newAverage = newSumRating / newNumRatings;

  // Store the updated count, sum, and average on the bookstore.
  transaction.update(docRef, {
    numRatings: newNumRatings, // Total number of submitted ratings.
    sumRating: newSumRating, // Sum of every star rating so far.
    avgRating: newAverage, // Average used by the bookstore list sort.
  });

  // Insert the review itself, including a server-friendly timestamp.
  transaction.set(newRatingDocument, {
    ...review, // Copy the text, rating, and user id from the form.
    timestamp: Timestamp.fromDate(new Date()), // Record when the review was submitted.
  });
};

// Add one review to a bookstore and update that bookstore's rating totals.
export async function addReviewToBookstore(db, bookstoreId, review) {
  // Refuse to write when the caller did not name a bookstore.
  if (!bookstoreId) {
    // Surface a clear error to the server action.
    throw new Error("No bookstore ID has been provided.");
  }

  // Refuse to write when the review payload is missing.
  if (!review) {
    // Surface a clear error to the server action.
    throw new Error("A valid review has not been provided.");
  }

  // A transaction can fail if the document changes, so report that failure.
  try {
    // Point at the bookstore document that owns this review.
    const docRef = doc(collection(db, "bookstores"), bookstoreId);
    // Create a new document reference in that bookstore's ratings subcollection.
    const newRatingDocument = doc(
      collection(db, `bookstores/${bookstoreId}/ratings`), // The reviews live under the bookstore.
    );

    // Run the rating math and the review insert as one transaction.
    await runTransaction(db, (transaction) =>
      updateWithRating(transaction, docRef, newRatingDocument, review),
    );
  } catch (error) {
    // Log the Firestore error before rethrowing it to the caller.
    console.error(
      "There was an error adding the rating to the bookstore",
      error, // The original Firestore error.
    );
    // Let the server action fail so the user interface can react.
    throw error;
  }
}

// Add category, city, price, and sort constraints to a bookstores query.
function applyQueryFilters(q, { category, city, price, sort }) {
  // Limit the query to one cuisine when the category filter is set.
  if (category) {
    // Match the category field exactly.
    q = query(q, where("category", "==", category));
  }
  // Limit the query to one city when the city filter is set.
  if (city) {
    // Match the city field exactly.
    q = query(q, where("city", "==", city));
  }
  // Limit the query to one price level when the price filter is set.
  if (price) {
    // The UI sends "$", "$$", or "$$$", and Firestore stores that length as 1, 2, or 3.
    q = query(q, where("price", "==", price.length));
  }
  // Default to the highest average rating when no sort, or the Rating sort, is chosen.
  if (sort === "Rating" || !sort) {
    // Put the highest average rating first.
    q = query(q, orderBy("avgRating", "desc"));
  } else if (sort === "Review") {
    // Put the bookstores with the most reviews first.
    q = query(q, orderBy("numRatings", "desc"));
  }
  // Return the query with every requested constraint attached.
  return q;
}

// Read the bookstore list once on the server, using the caller's Firestore instance.
export async function getBookstores(db = db, filters = {}) {
  // Start with every document in the bookstores collection.
  let q = query(collection(db, "bookstores"));

  // Apply the filters that arrived from the page URL.
  q = applyQueryFilters(q, filters);
  // Execute the query and wait for the matching documents.
  const results = await getDocs(q);
  // Convert each Firestore document into a plain object the client can render.
  return results.docs.map((doc) => {
    // Return the document id plus its fields.
    return {
      id: doc.id, // Keep the id so links can open the bookstore page.
      ...doc.data(), // Copy the bookstore fields.
      // Firestore timestamps are class instances, so convert them to dates for the client.
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}

// Subscribe the browser to bookstore-list changes that match the current filters.
export function getBookstoresSnapshot(cb, filters = {}) {
  // A snapshot listener is useless without a function to receive the results.
  if (typeof cb !== "function") {
    // Explain the mistake and do not subscribe.
    console.log("Error: The callback parameter is not a function");
    // Leave the caller with nothing to unsubscribe.
    return;
  }

  // Start with every document in the client Firestore bookstores collection.
  let q = query(collection(db, "bookstores"));
  // Apply the same filters used by the server read.
  q = applyQueryFilters(q, filters);

  // Listen for changes and return the unsubscribe function.
  return onSnapshot(q, (querySnapshot) => {
    // Map the latest documents into plain objects.
    const results = querySnapshot.docs.map((doc) => {
      // Return the document id plus its fields.
      return {
        id: doc.id, // Keep the id for bookstore links.
        ...doc.data(), // Copy the bookstore fields.
        // Convert the timestamp so the client component receives a plain date.
        timestamp: doc.data().timestamp.toDate(),
      };
    });

    // Hand the fresh list to the component that subscribed.
    cb(results);
  });
}

// Read one bookstore by id from the server Firestore instance.
export async function getBookstoreById(db, bookstoreId) {
  // Stop when the page did not receive an id.
  if (!bookstoreId) {
    // Record the bad id for debugging.
    console.log("Error: Invalid ID received: ", bookstoreId);
    // Return nothing so the page can show its error state.
    return;
  }
  // Point at the requested bookstore document.
  const docRef = doc(db, "bookstores", bookstoreId);
  // Read that document once.
  const docSnap = await getDoc(docRef);
  // Return its fields with a plain date instead of a Firestore timestamp.
  return {
    ...docSnap.data(), // Copy the bookstore fields.
    timestamp: docSnap.data().timestamp.toDate(), // Convert the timestamp for the client.
  };
}

// Subscribe the browser to live changes for one bookstore document.
export function getBookstoreSnapshotById(bookstoreId, cb) {
  // Stop when the caller did not provide an id.
  if (!bookstoreId) {
    // Record the bad id for debugging.
    console.log("Error: Invalid ID received: ", bookstoreId);
    // Do not subscribe.
    return;
  }

  // A listener needs a function that can receive the updated bookstore.
  if (typeof cb !== "function") {
    // Explain the mistake and do not subscribe.
    console.log("Error: The callback parameter is not a function");
    // Leave the caller with nothing to unsubscribe.
    return;
  }

  // Point at the bookstore document in the client database.
  const docRef = doc(db, "bookstores", bookstoreId);
  // Listen for updates to that document and return the unsubscribe function.
  return onSnapshot(docRef, (docSnap) => {
    // Send the latest fields to the bookstore page.
    cb({
      ...docSnap.data(), // Copy the bookstore fields.
      timestamp: docSnap.data().timestamp.toDate(), // Convert the timestamp for React state.
    });
  });
}

// Read every review for one bookstore, newest first, on the server.
export async function getReviewsByBookstoreId(db, bookstoreId) {
  // Stop when the page did not receive a bookstore id.
  if (!bookstoreId) {
    // Record the bad id for debugging.
    console.log("Error: Invalid bookstoreId received: ", bookstoreId);
    // Return nothing so the caller can skip rendering reviews.
    return;
  }

  // Query the ratings subcollection, sorted with the newest review first.
  const q = query(
    collection(db, "bookstores", bookstoreId, "ratings"), // Reviews stored under this bookstore.
    orderBy("timestamp", "desc"), // Newest reviews come first.
  );

  // Execute the query once.
  const results = await getDocs(q);
  // Convert each review into a plain object.
  return results.docs.map((doc) => {
    // Return the review id plus its fields.
    return {
      id: doc.id, // Keep the id so React can key the list.
      ...doc.data(), // Copy the rating, text, and user id.
      // Convert the timestamp so a Server Component can pass it to a Client Component.
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}

// Subscribe the browser to live review changes for one bookstore.
export function getReviewsSnapshotByBookstoreId(bookstoreId, cb) {
  // Stop when the caller did not provide a bookstore id.
  if (!bookstoreId) {
    // Record the bad id for debugging.
    console.log("Error: Invalid bookstoreId received: ", bookstoreId);
    // Do not subscribe.
    return;
  }

  // Query the ratings subcollection, sorted with the newest review first.
  const q = query(
    collection(db, "bookstores", bookstoreId, "ratings"), // Reviews stored under this bookstore.
    orderBy("timestamp", "desc"), // Newest reviews come first.
  );
  // Listen for new and changed reviews and return the unsubscribe function.
  return onSnapshot(q, (querySnapshot) => {
    // Map the latest review documents into plain objects.
    const results = querySnapshot.docs.map((doc) => {
      // Return the review id plus its fields.
      return {
        id: doc.id, // Keep the id so React can key the list.
        ...doc.data(), // Copy the rating, text, and user id.
        // Convert the timestamp so the client list can render it.
        timestamp: doc.data().timestamp.toDate(),
      };
    });
    // Hand the fresh reviews to the component that subscribed.
    cb(results);
  });
}

// Insert the sample bookstores and their reviews into the client Firestore database.
export async function addFakeBookstoresAndReviews() {
  // Build the Shelfside catalog of bookstores and visitor notes.
  const data = await generateFakeBookstoresAndReviews();
  // Skip a shop that is already stored so the button does not create duplicates.
  const existing = await getDocs(collection(db, "bookstores"));
  const existingNames = new Set(existing.docs.map((shop) => shop.data().name));
  // Write each bookstore, then write the reviews that belong to it.
  for (const { bookstoreData, ratingsData } of data) {
    if (existingNames.has(bookstoreData.name)) {
      continue;
    }
    // One failed write should not hide the error, so catch it per bookstore.
    try {
      // Create the bookstore document and keep its generated id.
      const docRef = await addDoc(
        collection(db, "bookstores"), // The top-level bookstores collection.
        bookstoreData, // The generated bookstore fields.
      );

      // Write each sample review into that bookstore's ratings subcollection.
      for (const ratingData of ratingsData) {
        // Create one review document.
        await addDoc(
          collection(db, "bookstores", docRef.id, "ratings"), // Nest ratings under the new bookstore.
          ratingData, // The generated rating fields.
        );
      }
    } catch (e) {
      // Note that this bookstore could not be saved.
      console.log("There was an error adding the document");
      // Record the Firestore error for debugging.
      console.error("Error adding document: ", e);
    }
  }
}
