import { type RefObject, useEffect } from "react";

// Keeps a <dialog> shown as a modal while `isOpen`, so the browser traps focus and Escape.
export function useModalDialog(dialogRef: RefObject<HTMLDialogElement | null>, isOpen: boolean) {
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [dialogRef, isOpen]);
}
