import type { ReactNode } from "react";
import type { ProductView } from "@/use-case";
import { typeset } from "./format";
import styles from "./product-modal.module.css";
import { ProductReviews } from "./product-reviews";

type ProductInformationProps = {
  view: ProductView;
  reviewsId: string;
};

export function ProductInformation({ view, reviewsId }: ProductInformationProps) {
  return (
    <>
      {view.features.length > 0 && (
        <ul className={styles.features} aria-label="Features">
          {view.features.map((feature) => (
            <li key={feature} className={styles.feature}>
              {typeset(feature)}
            </li>
          ))}
        </ul>
      )}
      {view.description !== null && (
        <p className={styles.description}>{typeset(view.description)}</p>
      )}
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
      <ProductReviews id={reviewsId} rating={view.rating} reviews={view.reviews} />
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
