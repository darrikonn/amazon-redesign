"use client";

import Link from "next/link";
import { type FormEvent, useCallback, useId, useState } from "react";
import type { ProductId } from "@/core";
import type { OrderView } from "@/use-case";
import { formatDayAndDate, formatOrderDate, splitPrice } from "./format";
import styles from "./order-detail-view.module.css";
import { orderStatus } from "./order-status";
import { ProductThumbnail } from "./product-thumbnail";
import { returnStatus } from "./return-status";
import { useShop } from "./shop-context";
import page from "./shop-page.module.css";
import { useLoaded } from "./use-loaded";

type OrderDetailViewProps = {
  orderId: string;
  isJustPlaced: boolean;
};

export function OrderDetailView({ orderId, isJustPlaced }: OrderDetailViewProps) {
  const { container } = useShop();
  const load = useCallback(() => container.viewOrder.execute({ orderId }), [container, orderId]);
  const order = useLoaded(load);

  if (order.isLoading) {
    return (
      <main className={page.main}>
        <p className={page.loading}>Loading your order</p>
      </main>
    );
  }
  if (order.value === null) {
    return (
      <main className={page.main}>
        <div className={`${page.panel} ${page.empty}`}>
          <p className={page.emptyTitle}>We could not find that order</p>
          <Link href="/orders" className={page.primaryButton}>
            See your orders
          </Link>
        </div>
      </main>
    );
  }
  return <OrderDetail order={order.value} isJustPlaced={isJustPlaced} onChange={order.replace} />;
}

type OrderDetailProps = {
  order: OrderView;
  isJustPlaced: boolean;
  onChange: (order: OrderView) => void;
};

function OrderDetail({ order, isJustPlaced, onChange }: OrderDetailProps) {
  const returnable = order.lines.filter((line) => line.isReturnable);
  return (
    <main className={page.main}>
      <div className={page.heading}>
        <div>
          <Link href="/orders" className={styles.back}>
            Your orders
          </Link>
          <h1 className={page.title}>Order details</h1>
          <p className={page.lede}>
            Ordered {formatOrderDate(order.placedAt)}
            {order.isSample && <span className={styles.sample}>Sample order</span>}
          </p>
        </div>
      </div>
      {isJustPlaced && (
        <p className={styles.placed} role="status">
          Thank you, your order is placed. It arrives {formatDayAndDate(order.deliveredAt)}.
        </p>
      )}
      <section className={page.panel} aria-labelledby="tracking-heading">
        <h2 id="tracking-heading" className={styles.sectionTitle}>
          {orderStatus(order)}
        </h2>
        <ol className={styles.steps}>
          {order.steps.map((step) => (
            <li key={step.stage} className={step.isReached ? styles.stepReached : styles.step}>
              <span className={styles.stepDot} aria-hidden="true" />
              <span className={styles.stepLabel}>{step.label}</span>
              <span className={styles.stepDate}>{formatOrderDate(step.at)}</span>
              <span className="visually-hidden">{step.isReached ? ", done" : ", to come"}</span>
            </li>
          ))}
        </ol>
        <p className={page.muted}>
          Delivering to {[order.deliveryCity, order.deliveryPostalCode].filter(Boolean).join(" ")}
        </p>
      </section>
      <section className={page.panel} aria-labelledby="items-heading">
        <h2 id="items-heading" className={styles.sectionTitle}>
          Items
        </h2>
        <ul className={styles.lines}>
          {order.lines.map((line) => (
            <li key={line.productId} className={styles.line}>
              <ProductThumbnail image={line.image} category={line.category} size="large" />
              <div className={styles.lineText}>
                <span className={styles.lineName}>{line.name}</span>
                <span className={page.muted}>
                  {line.quantity} at {splitPrice(line.priceInCents).spoken}
                </span>
                <span className={styles.returnStatus}>{returnStatus(line, order.stage)}</span>
              </div>
            </li>
          ))}
        </ul>
        <p className={styles.total}>Order total: {splitPrice(order.totalInCents).spoken}</p>
      </section>
      {order.returns.length > 0 && (
        <section className={page.panel} aria-labelledby="returns-heading">
          <h2 id="returns-heading" className={styles.sectionTitle}>
            Returns
          </h2>
          {order.returns.map((orderReturn) => (
            <p key={orderReturn.requestedAt}>
              Started {formatOrderDate(orderReturn.requestedAt)} for{" "}
              {orderReturn.productIds
                .map((productId) => order.lines.find((line) => line.productId === productId)?.name)
                .filter(Boolean)
                .join(", ")}
              : {orderReturn.reasonLabel}. Pack the items and drop them at any carrier point; the
              refund follows once they arrive.
            </p>
          ))}
        </section>
      )}
      {returnable.length > 0 && <ReturnForm order={order} onReturned={onChange} />}
    </main>
  );
}

type ReturnFormProps = {
  order: OrderView;
  onReturned: (order: OrderView) => void;
};

function ReturnForm({ order, onReturned }: ReturnFormProps) {
  const { container } = useShop();
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
    } else {
      setMessage("Choose at least one item that can still be returned.");
    }
  }

  return (
    <section id="return" className={page.panel} aria-labelledby="return-heading">
      <h2 id="return-heading" className={styles.sectionTitle}>
        Return or replace items
      </h2>
      <form className={styles.returnForm} onSubmit={submit}>
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Which items?</legend>
          {order.lines
            .filter((line) => line.isReturnable)
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
          defaultValue="no-longer-needed"
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
        <button type="submit" className={page.primaryButton} disabled={chosen.length === 0}>
          Start return
        </button>
      </form>
    </section>
  );
}
