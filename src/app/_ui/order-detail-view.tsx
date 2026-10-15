"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";
import type { OrderView } from "@/use-case";
import { useAnnounce } from "./announcer-context";
import { useContainer } from "./container-context";
import { EmptyState } from "./empty-state";
import { formatDayAndDate, formatOrderDate } from "./format";
import { Icon } from "./icon";
import styles from "./order-detail-view.module.css";
import { ItemsSection, ReturnsSection, TrackingSection } from "./order-sections";
import { ReturnForm, useReturnFormInView } from "./return-form";
import page from "./shop-page.module.css";
import { SHOP_PLACES } from "./shop-place";
import { useLoaded } from "./use-loaded";

type OrderDetailViewProps = {
  orderId: string;
  isJustPlaced: boolean;
};

export function OrderDetailView({ orderId, isJustPlaced }: OrderDetailViewProps) {
  const container = useContainer();
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
        <EmptyState
          icon="package"
          title="We could not find that order"
          message="It may belong to another account, or the link may be old."
        >
          <Link href={SHOP_PLACES.orders.href} className={page.primaryButton}>
            See your orders
          </Link>
        </EmptyState>
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
  const announce = useAnnounce();
  const returnsHeadingRef = useRef<HTMLHeadingElement>(null);
  const returnable = order.lines.filter((line) => line.returnState === "returnable");
  useReturnFormInView();

  // The form that was used may be gone, so focus moves to the returns it just added to.
  function returned(next: OrderView) {
    onChange(next);
    announce("Return started. Drop the items at any carrier point.");
    requestAnimationFrame(() => returnsHeadingRef.current?.focus());
  }

  return (
    <main className={page.main}>
      <div className={page.heading}>
        <div>
          <Link href={SHOP_PLACES.orders.href} className={styles.back}>
            <Icon name="chevron-right" size={16} strokeWidth={2.6} className={styles.backIcon} />
            {SHOP_PLACES.orders.title}
          </Link>
          <h1 className={page.title}>Order details</h1>
          <p className={page.lede}>
            Ordered {formatOrderDate(order.placedAt)}
            {order.isSample && (
              <span className={`${page.samplePill} ${styles.sample}`}>Sample order</span>
            )}
          </p>
        </div>
      </div>
      {isJustPlaced && (
        <p className={styles.placed} role="status">
          Thank you, your order is placed. It arrives {formatDayAndDate(order.deliveredAt)}.
        </p>
      )}
      <TrackingSection order={order} />
      <ItemsSection order={order} />
      {order.returns.length > 0 && <ReturnsSection order={order} headingRef={returnsHeadingRef} />}
      {returnable.length > 0 && <ReturnForm order={order} onReturned={returned} />}
    </main>
  );
}
