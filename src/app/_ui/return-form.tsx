"use client";

import { type FormEvent, useEffect, useId, useState } from "react";
import type { ProductId } from "@/core";
import type { OrderView } from "@/use-case";
import { useContainer } from "./container-context";
import styles from "./order-detail-view.module.css";
import page from "./shop-page.module.css";
import { RETURN_FORM_ID } from "./shop-place";

const RETURN_REFUSALS = {
  "nothing-chosen": "Choose at least one item to return.",
  "unknown-reason": "Choose why you are returning them.",
  "not-returnable":
    "Something changed since this page opened, so the list now shows only what can still be returned.",
  "not-found": "This order is no longer in your account.",
  "signed-out": "Sign in again to start a return.",
} as const;

// The order loads after the page, so the browser has already given up on #return by the time
// the form exists; this finishes the jump once it does.
export function useReturnFormInView() {
  useEffect(() => {
    if (window.location.hash !== `#${RETURN_FORM_ID}`) return;
    const heading = document.getElementById("return-heading");
    heading?.scrollIntoView({ block: "start" });
    heading?.focus({ preventScroll: true });
  }, []);
}

type ReturnFormProps = {
  order: OrderView;
  onReturned: (order: OrderView) => void;
  // A newer copy of the order, read after a refusal that shows this one is out of date.
  onRefreshed: (order: OrderView) => void;
};

export function ReturnForm({ order, onReturned, onRefreshed }: ReturnFormProps) {
  const container = useContainer();
  const reasonId = useId();
  const [chosen, setChosen] = useState<readonly ProductId[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  function toggle(productId: ProductId) {
    setChosen((current) =>
      current.includes(productId)
        ? current.filter((candidate) => candidate !== productId)
        : [...current, productId],
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const reason = new FormData(event.currentTarget).get("reason");
    const result = await container.startReturn.execute({
      orderId: order.id,
      productIds: chosen,
      reason: typeof reason === "string" ? reason : "",
    });
    if (result.status === "started") {
      setChosen([]);
      setMessage(null);
      onReturned(result.order);
      return;
    }
    setMessage(RETURN_REFUSALS[result.status]);
    // Another tab may have returned the item already; the form shows what is true now.
    if (result.status === "not-returnable") {
      const fresh = await container.viewOrder.execute({ orderId: order.id });
      if (fresh !== null) {
        setChosen([]);
        onRefreshed(fresh);
      }
    }
  }

  return (
    <section id={RETURN_FORM_ID} className={page.panel} aria-labelledby="return-heading">
      <h2 id="return-heading" className={styles.sectionTitle} tabIndex={-1}>
        Return items
      </h2>
      <form className={styles.returnForm} onSubmit={submit}>
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Which items?</legend>
          {order.lines
            .filter((line) => line.returnState === "returnable")
            .map((line) => (
              <label key={line.productId} className={styles.choice}>
                <input
                  type="checkbox"
                  checked={chosen.includes(line.productId)}
                  onChange={() => toggle(line.productId)}
                />
                {line.name}
              </label>
            ))}
        </fieldset>
        <label htmlFor={reasonId} className={styles.legend}>
          Why are you returning them?
        </label>
        <select
          id={reasonId}
          name="reason"
          className={styles.select}
          defaultValue={order.defaultReturnReason}
        >
          {order.returnReasons.map((option) => (
            <option key={option.reason} value={option.reason}>
              {option.label}
            </option>
          ))}
        </select>
        {message !== null && (
          <p className={styles.formMessage} role="alert">
            {message}
          </p>
        )}
        <button type="submit" className={page.primaryButton}>
          Start return
        </button>
      </form>
    </section>
  );
}
