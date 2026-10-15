"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useId, useRef, useState } from "react";
import type { ProductId } from "@/core";
import type { CartLineView, CartView, PlaceOrderResult } from "@/use-case";
import { useAnnounce } from "./announcer-context";
import { useBrowsing } from "./browsing-context";
import { useCart } from "./cart-context";
import styles from "./cart-page-view.module.css";
import { useContainer } from "./container-context";
import { EmptyState } from "./empty-state";
import { FieldError } from "./field-error";
import { focusAfterRemoval } from "./focus-after-removal";
import { deliveryLabel, deliveryLocationLabel, pluralize, splitPrice } from "./format";
import { Icon } from "./icon";
import { PageHeading } from "./page-heading";
import { isPlainClick } from "./plain-click";
import { ProductThumbnail } from "./product-thumbnail";
import { withProduct } from "./search-url";
import { useSession } from "./session-context";
import page from "./shop-page.module.css";
import { orderHref, SHOP_PLACES } from "./shop-place";
import { signInHref } from "./sign-in-href";
import { useLoaded } from "./use-loaded";

export function CartPageView() {
  const container = useContainer();
  const { replaceCart } = useCart();
  const announce = useAnnounce();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const load = useCallback(() => container.viewCart.execute(), [container]);
  const cart = useLoaded(load);
  const view = cart.value;

  async function changeQuantity(line: CartLineView, quantity: number) {
    const lines = view?.lines ?? [];
    const next = await container.changeCartQuantity.execute({
      productId: line.productId,
      quantity,
    });
    cart.replace(next);
    replaceCart(next);
    const subtotal = splitPrice(next.subtotalInCents).spoken;
    if (quantity > 0) {
      announce(`Quantity of ${line.name} is now ${quantity}. Subtotal ${subtotal}.`);
      return;
    }
    announce(`${line.name} removed from your cart. Subtotal ${subtotal}.`);
    focusAfterRemoval(
      lines.map((candidate) => candidate.productId),
      line.productId,
      quantityIdFor,
      titleRef.current,
    );
  }

  return (
    <main className={page.main}>
      <PageHeading place={SHOP_PLACES.cart} titleRef={titleRef} />
      {cart.isLoading && <p className={page.loading}>Loading your cart</p>}
      {view !== null && view.lines.length === 0 && (
        <EmptyState
          icon="cart"
          title="Your cart is empty"
          message="Describe what you need on the home page, or browse the deals."
        >
          <Link href={SHOP_PLACES.home.href} className={page.primaryButton}>
            Start shopping
          </Link>
          <Link href={SHOP_PLACES.deals.href} className={page.secondaryButton}>
            {SHOP_PLACES.deals.title}
          </Link>
        </EmptyState>
      )}
      {view !== null && view.lines.length > 0 && (
        <div className={styles.layout}>
          <section className={page.panel} aria-label="Items in your cart">
            <ul className={styles.lines}>
              {view.lines.map((line) => (
                <CartLine
                  key={line.productId}
                  line={line}
                  onChangeQuantity={(quantity) => {
                    changeQuantity(line, quantity).catch(reportError);
                  }}
                />
              ))}
            </ul>
          </section>
          <Checkout cart={view} onPlaced={replaceCart} />
        </div>
      )}
    </main>
  );
}

function quantityIdFor(productId: ProductId): string {
  return `quantity-${productId}`;
}

type CartLineProps = {
  line: CartLineView;
  onChangeQuantity: (quantity: number) => void;
};

function CartLine({ line, onChangeQuantity }: CartLineProps) {
  const { openProduct } = useBrowsing();
  const quantities = Array.from({ length: line.maximumQuantity }, (_, index) => index + 1);
  const quantityId = quantityIdFor(line.productId);
  return (
    <li className={styles.line}>
      <ProductThumbnail image={line.image} category={line.category} size="large" />
      <div className={styles.lineText}>
        <h2 className={styles.lineName}>
          <Link
            href={withProduct(SHOP_PLACES.cart.href, line.productId)}
            prefetch={false}
            className={styles.lineLink}
            onClick={(event) => {
              if (!isPlainClick(event)) return;
              event.preventDefault();
              openProduct({ ...line, id: line.productId });
            }}
          >
            {line.name}
          </Link>
        </h2>
        {line.shortage === null ? (
          <span className={styles.lineDelivery}>
            FREE delivery {deliveryLabel(line.deliveryDays)}
          </span>
        ) : (
          <span className={styles.lineShortage}>
            {line.shortage}: change or delete it to check out
          </span>
        )}
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
  const container = useContainer();
  const { shopper } = useSession();
  const router = useRouter();
  const [isPlacing, setIsPlacing] = useState(false);
  const [refusal, setRefusal] = useState<string | null>(null);
  const refusalId = useId();
  const subtotal = `Subtotal (${pluralize(cart.itemCount, "item", "items")}): ${splitPrice(cart.subtotalInCents).spoken}`;

  async function placeOrder() {
    setIsPlacing(true);
    const result = await container.placeOrder.execute();
    if (result.status === "placed") {
      onPlaced(await container.viewCart.execute());
      router.push(orderHref(result.orderId, { isJustPlaced: true }));
      return;
    }
    setIsPlacing(false);
    setRefusal(checkoutRefusal(result));
  }

  return (
    <aside className={`${page.panel} ${styles.checkout}`} aria-label="Checkout">
      <p className={styles.subtotal}>{subtotal}</p>
      <p className={page.muted}>FREE delivery on this order.</p>
      {shopper === null ? (
        <Link href={signInHref(SHOP_PLACES.cart.href)} className={page.primaryButton}>
          Sign in to check out
        </Link>
      ) : (
        <>
          <p className={styles.deliverTo}>
            Delivering to {shopper.fullName}, {deliveryLocationLabel(shopper)}
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
          {refusal !== null && <FieldError id={refusalId} message={refusal} />}
          <p className={styles.fine}>This is a demo shop: no payment is taken and nothing ships.</p>
        </>
      )}
    </aside>
  );
}

type CheckoutRefusal = Exclude<PlaceOrderResult, { status: "placed" }>;

function checkoutRefusal(result: CheckoutRefusal): string {
  switch (result.status) {
    case "unavailable":
      return `Change or delete what cannot be ordered as it is, then check out: ${result.productNames.join(", ")}.`;
    case "signed-out":
      return "You were signed out. Sign in again to check out.";
    case "empty-cart":
      return "Your cart is empty.";
  }
}
