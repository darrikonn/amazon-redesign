import type { ReactNode } from "react";
import type { ProductView } from "@/use-case";
import styles from "./product-modal.module.css";
import { ProductReviews } from "./product-reviews";

export function ProductInformation({ view }: { view: ProductView }) {
  return (
    <>
      {view.features.length > 0 && (
        <ul className={styles.features} aria-label="Features">
          {view.features.map((feature) => (
            <li key={feature} className={styles.feature}>
              {feature}
            </li>
          ))}
        </ul>
      )}
      {view.description !== null && <p className={styles.description}>{view.description}</p>}
      <dl className={styles.facts}>
        {view.availability !== null && (
          <Fact label="Availability">
            <span className={view.availability.canBuy ? styles.inStock : styles.outOfStock}>
              {view.availability.label}
            </span>
          </Fact>
        )}
        {view.facts.map((fact) => (
          <Fact key={fact.label} label={fact.label}>
            {fact.value}
          </Fact>
        ))}
      </dl>
      <ProductReviews rating={view.rating} reviews={view.reviews} />
    </>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.fact}>
      <dt className={styles.factLabel}>{label}</dt>
      <dd className={styles.factValue}>{children}</dd>
    </div>
  );
}
