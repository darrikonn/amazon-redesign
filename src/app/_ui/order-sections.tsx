import type { Ref } from "react";
import type { OrderView } from "@/use-case";
import { deliveryLocationLabel, formatOrderDate, splitPrice } from "./format";
import styles from "./order-detail-view.module.css";
import { OrderLineCartButton } from "./order-line-cart-button";
import { OrderLineName } from "./order-line-name";
import { orderStatus } from "./order-status";
import { ProductThumbnail } from "./product-thumbnail";
import { returnStatus } from "./return-status";
import page from "./shop-page.module.css";

type SectionProps = {
  order: OrderView;
};

export function TrackingSection({ order }: SectionProps) {
  return (
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
      <p className={page.muted}>Delivering to {deliveryLocationLabel(order)}</p>
    </section>
  );
}

export function ItemsSection({ order }: SectionProps) {
  return (
    <section className={page.panel} aria-labelledby="items-heading">
      <h2 id="items-heading" className={styles.sectionTitle}>
        Items
      </h2>
      <ul className={styles.lines}>
        {order.lines.map((line) => (
          <li key={line.productId} className={styles.line}>
            <ProductThumbnail image={line.image} category={line.category} size="large" />
            <div className={styles.lineText}>
              <OrderLineName line={line} className={styles.lineName} />
              <span className={page.muted}>
                {line.quantity} at {splitPrice(line.priceInCents).spoken}
              </span>
              <span className={styles.returnStatus}>{returnStatus(line)}</span>
            </div>
            <OrderLineCartButton productId={line.productId} name={line.name} />
          </li>
        ))}
      </ul>
      <p className={styles.total}>Order total: {splitPrice(order.totalInCents).spoken}</p>
    </section>
  );
}

type ReturnsSectionProps = SectionProps & {
  headingRef: Ref<HTMLHeadingElement>;
};

export function ReturnsSection({ order, headingRef }: ReturnsSectionProps) {
  return (
    <section className={page.panel} aria-labelledby="returns-heading">
      <h2 ref={headingRef} id="returns-heading" className={styles.sectionTitle} tabIndex={-1}>
        Returns
      </h2>
      {order.returns.map((orderReturn) => (
        <p key={orderReturn.requestedAt}>
          Started {formatOrderDate(orderReturn.requestedAt)} for{" "}
          {orderReturn.productIds
            .map((productId) => order.lines.find((line) => line.productId === productId)?.name)
            .filter(Boolean)
            .join(", ")}
          : {orderReturn.reasonLabel}. Pack the items and drop them at any carrier point; the refund
          follows once they arrive.
        </p>
      ))}
    </section>
  );
}
