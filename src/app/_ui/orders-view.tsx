"use client";

import Link from "next/link";
import { useCallback } from "react";
import type { OrderFilter, OrderSummaryView } from "@/use-case";
import { useContainer } from "./container-context";
import { EmptyState } from "./empty-state";
import { formatOrderDate, pluralize, splitPrice } from "./format";
import { OrderLineCartButton } from "./order-line-cart-button";
import { orderStatus } from "./order-status";
import styles from "./orders-view.module.css";
import { ProductThumbnail } from "./product-thumbnail";
import page from "./shop-page.module.css";
import { orderHref, orderListHref, orderReturnHref, SHOP_PLACES } from "./shop-place";
import { useLoaded } from "./use-loaded";

type OrdersViewProps = {
  show: string;
};

const TABS: readonly { show: OrderFilter; label: string; href: string }[] = [
  { show: "all", label: "All orders", href: orderListHref("all") },
  { show: "on-the-way", label: "On the way", href: orderListHref("on-the-way") },
];

export function OrdersView({ show }: OrdersViewProps) {
  const container = useContainer();
  const load = useCallback(() => container.listOrders.execute({ show }), [container, show]);
  const list = useLoaded(load);
  const shown = list.value?.show ?? show;

  return (
    <main className={page.main}>
      <div className={page.heading}>
        <h1 className={page.title}>Your orders</h1>
        <nav aria-label="Which orders" className={page.tabs}>
          {TABS.map((tab) => (
            <Link
              key={tab.show}
              href={tab.href}
              className={tab.show === shown ? page.tabSelected : page.tab}
              aria-current={tab.show === shown ? "page" : undefined}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
      {list.isLoading && <p className={page.loading}>Loading your orders</p>}
      {list.value !== null && list.value.orders.length === 0 && (
        <EmptyState
          icon="package"
          title={shown === "on-the-way" ? "Nothing is on its way right now" : "No orders yet"}
        >
          <Link href={SHOP_PLACES.deals.href} className={page.primaryButton}>
            See today’s deals
          </Link>
        </EmptyState>
      )}
      {list.value?.orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </main>
  );
}

export function OrderCard({ order }: { order: OrderSummaryView }) {
  const hasReturnable = order.lines.some((line) => line.returnState === "returnable");
  return (
    <article className={styles.order} aria-labelledby={`order-${order.id}`}>
      <header className={styles.orderHeader}>
        <Fact label="Order placed" value={formatOrderDate(order.placedAt)} />
        <Fact label="Total" value={splitPrice(order.totalInCents).spoken} />
        <Fact label="Items" value={pluralize(order.itemCount, "item", "items")} />
        {order.isSample && <span className={page.samplePill}>Sample order</span>}
        <Link href={orderHref(order.id)} className={styles.detailsLink}>
          Order details
        </Link>
      </header>
      <div className={styles.orderBody}>
        <h2 id={`order-${order.id}`} className={styles.status}>
          {orderStatus(order)}
        </h2>
        {order.hasReturns && <p className={styles.returnNote}>Return started</p>}
        <ul className={styles.lines}>
          {order.lines.map((line) => (
            <li key={line.productId} className={styles.line}>
              <ProductThumbnail image={line.image} category={line.category} />
              <div className={styles.lineText}>
                <span className={styles.lineName}>{line.name}</span>
                <span className={styles.lineMeta}>
                  Quantity {line.quantity}
                  {line.returnState === "returned" && ", return started"}
                </span>
              </div>
              <OrderLineCartButton productId={line.productId} name={line.name} />
            </li>
          ))}
        </ul>
        {(order.isOnTheWay || hasReturnable) && (
          <div className={styles.orderActions}>
            {order.isOnTheWay && (
              <Link href={orderHref(order.id)} className={page.primaryButton}>
                Track package
              </Link>
            )}
            {hasReturnable && (
              <Link href={orderReturnHref(order.id)} className={page.secondaryButton}>
                Return items
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <span className={styles.fact}>
      <span className={styles.factLabel}>{label}</span>
      <span className={styles.factValue}>{value}</span>
    </span>
  );
}
