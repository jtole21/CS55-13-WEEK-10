"use client";

// This components handles the review dialog and uses a next.js feature known as Server Actions to handle the form submission

import { useEffect, useLayoutEffect, useRef } from "react";
import RatingPicker from "@/src/components/RatingPicker.jsx";
import { handleReviewFormSubmission } from "@/src/app/actions.js";

const ReviewDialog = ({
  isOpen,
  handleClose,
  review,
  onChange,
  userId,
  id,
}) => {
  const dialog = useRef();

  // dialogs only render their backdrop when called with `showModal`
  useLayoutEffect(() => {
    if (isOpen) {
      dialog.current.showModal();
    } else {
      dialog.current.close();
    }
  }, [isOpen, dialog]);

  const handleClick = (e) => {
    // close if clicked outside the modal
    if (e.target === dialog.current) {
      handleClose();
    }
  };

  return (
    <dialog ref={dialog} onMouseDown={handleClick}>
      <form
        action={handleReviewFormSubmission}
        onSubmit={() => {
          handleClose();
        }}
      >
        <header>
          <h3>Add a visitor note</h3>
        </header>
        <article>
          <RatingPicker />

          <p>
            <input
              type="text"
              name="text"
              id="review"
              placeholder="What did the shop feel like?"
              required
              value={review.text}
              onChange={(e) => onChange(e.target.value, "text")}
            />
          </p>

          <input type="hidden" name="bookstoreId" value={id} />
          <input type="hidden" name="userId" value={userId} />
        </article>
        <footer>
          <menu>
            <button
              autoFocus
              type="reset"
              onClick={handleClose}
              className="button--cancel"
            >
              Cancel
            </button>
            <button type="submit" value="confirm" className="button--confirm">
              Submit
            </button>
          </menu>
        </footer>
      </form>
    </dialog>
  );
};

export default ReviewDialog;
