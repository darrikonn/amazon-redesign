"use client";

import { type FormEvent, useId, useRef, useState } from "react";
import { Icon } from "./icon";
import styles from "./location-dialog.module.css";
import { useSession } from "./session-context";
import { useModalDialog } from "./use-modal-dialog";

type LocationDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function LocationDialog({ isOpen, onClose }: LocationDialogProps) {
  const { shopper, changeDeliveryLocation } = useSession();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputId = useId();
  const errorId = useId();
  const [error, setError] = useState<string | null>(null);

  useModalDialog(dialogRef, isOpen);

  // An earlier mistake should not greet the shopper the next time the dialog opens.
  function close() {
    setError(null);
    onClose();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const postalCode = new FormData(event.currentTarget).get("postalCode");
    const result = await changeDeliveryLocation(typeof postalCode === "string" ? postalCode : "");
    if (result.status === "changed") {
      close();
    } else {
      setError("Enter a five-digit US ZIP code, such as 10001.");
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={`${inputId}-title`}
      onClose={close}
    >
      <form className={styles.form} onSubmit={submit}>
        <div className={styles.header}>
          <h2 id={`${inputId}-title`} className={styles.title}>
            Choose your location
          </h2>
          <button type="button" className={styles.close} aria-label="Close" onClick={close}>
            <Icon name="close" size={18} strokeWidth={2.6} />
          </button>
        </div>
        <p className={styles.lede}>
          Delivery options and estimates are shown for the ZIP code you choose.
        </p>
        <label htmlFor={inputId} className={styles.label}>
          ZIP code
        </label>
        <div className={styles.row}>
          <input
            id={inputId}
            name="postalCode"
            className={styles.input}
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            defaultValue={shopper?.deliveryPostalCode ?? ""}
            aria-invalid={error !== null}
            aria-describedby={error === null ? undefined : errorId}
          />
          <button type="submit" className={styles.apply}>
            Apply
          </button>
        </div>
        {error !== null && (
          <p id={errorId} className={styles.error} role="alert">
            {error}
          </p>
        )}
      </form>
    </dialog>
  );
}
