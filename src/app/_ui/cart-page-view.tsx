"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useId, useState } from "react";
import type { ProductId } from "@/core";
import type { CartLineView, CartView } from "@/use-case";
import styles from "./cart-page-view.module.css";
import { deliveryLabel, pluralize, splitPrice } from "./format";
import { Icon } from "./icon";
import { ProductThumbnail } from "./product-thumbnail";
import { useShop } from "./shop-context";
import page from "./shop-page.module.css";
import { signInHref } from "./sign-in-href";
import { useLoaded } from "./use-loaded";

export function CartPageView() {
  const { container, showCart } = useShop();
  const load = useCallback(() => container.viewCart.execute(), [container]);
  const cart = useLoaded(load);
  const view = cart.value;

  async function changeQuantity(productId: ProductId, quantity: number) {
    const next = await container.changeCartQuantity.execute({ productId, quantity });
    cart.replace(next);
    showCart(next);
  }

  return (
    <main className={page.main}>
      <h1 className={page.title}>Your cart</h1>
      {cart.isLoading && <p className={page.loading}>Loading your cart</p>}
      {view !== null && view.lines.length === 0 && (
        <div className={`${page.panel} ${page.empty}`}>
          <p className={page.emptyTitle}>Your cart is empty</p>
          <p className={page.muted}>
            Describe what you need on the home page, or browse the deals.
          </p>
          <div className={styles.emptyActions}>
            <Link href="/" className={page.primaryButton}>
              Start shopping
            </Link>
            <Link href="/deals" className={page.secondaryButton}>
              Today’s deals
            </Link>
          </div>
        </div>
      )}
      {view !== null && view.lines.length > 0 && (
        <div className={styles.layout}>
          <section className={page.panel} aria-label="Items in your cart">
            <ul className={styles.lines}>
              {view.lines.map((line) => (
                <CartLine
                  key={line.productId}
                  line={line}
                  maximumQuantity={view.maximumQuantity}
                  onChangeQuantity={(quantity) => {
                    changeQuantity(line.productId, quantity).catch(reportError);
                  }}
                />
              ))}
            </ul>
          </section>
          <Checkout cart={view} onPlaced={(next) => showCart(next)} />
        </div>
      )}
    </main>
  );
}

type CartLineProps = {
  line: CartLineView;
  maximumQuantity: number;
  onChangeQuantity: (quantity: number) => void;
};

function CartLine({ line, maximumQuantity, onChangeQuantity }: CartLineProps) {
  const quantities = Array.from({ length: maximumQuantity }, (_, index) => index + 1);
  const quantityId = useId();
  return (
    <li className={styles.line}>
      <ProductThumbnail image={line.image} category={line.category} size="large" />
      <div className={styles.lineText}>
        <span className={styles.lineName}>{line.name}</span>
        <span className={styles.lineDelivery}>
          FREE delivery {deliveryLabel(line.deliveryDays)}
        </span>
        <div className={styles.lineActions}>
          <label htmlFor={quantityId} className="visually-hidden">
            Quantity of {line.name}
          </label>
          {/* Drawn by the page, not the browser: some browsers draw their own menu face
              and ignore its text colour, which left the quantity invisible. */}
          <span className={styles.quantityField}>
            <select
              id={quantityId}
              className={styles.quantity}
              value={line.quantity}
              onChange={(event) => onChangeQuantity(Number(event.target.value))}
            >
              {quantities.map((quantity) => (
                <option key={quantity} value={quantity}>
                  Qty {quantity}
                </option>
              ))}
            </select>
            <Icon
              name="chevron-right"
              size={14}
              strokeWidth={2.6}
              className={styles.quantityIcon}
            />
          </span>
          <button
            type="button"
            className={styles.deleteButton}
            aria-label={`Delete ${line.name} from your cart`}
            onClick={() => onChangeQuantity(0)}
          >
            Delete
          </button>
        </div>
      </div>
      <span className={styles.linePrice}>{splitPrice(line.lineTotalInCents).spoken}</span>
    </li>
  );
}

type CheckoutProps = {
  cart: CartView;
  onPlaced: (cart: CartView) => void;
};

// Signed out, checkout is a sign-in that comes back here; the cart moves along (ADR 0030).
function Checkout({ cart, onPlaced }: CheckoutProps) {
  const { container, shopper } = useShop();
  const router = useRouter();
  const [isPlacing, setIsPlacing] = useState(false);
  const subtotal = `Subtotal (${pluralize(cart.itemCount, "item", "items")}): ${splitPrice(cart.subtotalInCents).spoken}`;

  async function placeOrder() {
    setIsPlacing(true);
    const result = await container.placeOrder.execute();
    if (result.status === "placed") {
      onPlaced(await container.viewCart.execute());
      router.push(`/orders/${result.orderId}?placed=1`);
      return;
    }
    setIsPlacing(false);
  }

  return (
    <aside className={`${page.panel} ${styles.checkout}`} aria-label="Checkout">
      <p className={styles.subtotal}>{subtotal}</p>
      <p className={page.muted}>FREE delivery on this order.</p>
      {shopper === null ? (
        <Link href={signInHref("/cart")} className={page.primaryButton}>
          Sign in to check out
        </Link>
      ) : (
        <>
          <p className={styles.deliverTo}>
            Delivering to {shopper.fullName},{" "}
            {[shopper.deliveryCity, shopper.deliveryPostalCode].filter(Boolean).join(" ")}
          </p>
          <button
            type="button"
            className={page.primaryButton}
            disabled={isPlacing}
            onClick={() => {
              placeOrder().catch(reportError);
            }}
          >
            {isPlacing ? "Placing your order" : "Place your order"}
          </button>
          <p className={styles.fine}>This is a demo shop: no payment is taken and nothing ships.</p>
        </>
      )}
    </aside>
  );
}
