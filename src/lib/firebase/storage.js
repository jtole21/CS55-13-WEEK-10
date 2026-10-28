import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import { storage } from "@/src/lib/firebase/clientApp";

import { updateBookstoreImageReference } from "@/src/lib/firebase/firestore";

// Upload a replacement photo and store its public URL on the bookstore document.
export async function updateBookstoreImage(bookstoreId, image) {
  try {
    if (!bookstoreId) {
      throw new Error("No bookstore ID has been provided.");
    }

    if (!image || !image.name) {
      throw new Error("A valid image has not been provided.");
    }

    // Put the file in Cloud Storage and get a URL the page can display.
    const publicImageUrl = await uploadImage(bookstoreId, image);
    // Save that URL on the bookstore so the new photo survives a reload.
    await updateBookstoreImageReference(bookstoreId, publicImageUrl);

    return publicImageUrl;
  } catch (error) {
    console.error("Error processing request:", error);
  }
}

// Upload one image file under images/<bookstoreId>/<file name>.
async function uploadImage(bookstoreId, image) {
  const filePath = `images/${bookstoreId}/${image.name}`;
  const newImageRef = ref(storage, filePath);
  await uploadBytesResumable(newImageRef, image);

  return await getDownloadURL(newImageRef);
}
