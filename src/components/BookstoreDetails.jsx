// This component shows bookstore metadata, and offers some actions to the user like uploading a new bookstore image, and adding a review.

import React from "react";
import renderStars from "@/src/components/Stars.jsx";

const BookstoreDetails = ({
  bookstore,
  userId,
  handleBookstoreImage,
  setIsOpen,
  isOpen,
  children,
}) => {
  return (
    <section className="img__section">
      <img src={bookstore.photo} alt={bookstore.name} />

      <div className="actions">
        {userId && (
          <img
            alt="review"
            className="review"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
            src="/review.svg"
          />
        )}
        <label
          onChange={(event) => handleBookstoreImage(event.target)}
          htmlFor="upload-image"
          className="add"
        >
          <input
            name=""
            type="file"
            id="upload-image"
            className="file-input hidden w-full h-full"
          />

          <img className="add-image" src="/add.svg" alt="Add image" />
        </label>
      </div>

      <div className="details__container">
        <div className="details">
          <h2>{bookstore.name}</h2>

          <div className="bookstore__rating">
            <ul>{renderStars(bookstore.avgRating)}</ul>

            <span>({bookstore.numRatings})</span>
          </div>

          <p>
            {bookstore.category} | {bookstore.city}
          </p>
          <p>{"$".repeat(bookstore.price)}</p>
          {children}
        </div>
      </div>
    </section>
  );
};

export default BookstoreDetails;
