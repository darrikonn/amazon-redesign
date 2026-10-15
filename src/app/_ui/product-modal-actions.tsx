import Link from "next/link";
import type { ProductId } from "@/core";
import type { ProductView } from "@/use-case";
import { useCart } from "./cart-context";
import { Icon } from "./icon";
import styles from "./product-modal.module.css";
import { useSavedList } from "./saved-list-context";
import { withProduct } from "./search-url";
import { useSession } from "./session-context";
import { signInHref } from "./sign-in-href";
import { useCurrentAddress } from "./use-current-address";

type ActionProps = {
  productId: ProductId;
  name: string;
};

// Signed out, it asks for sign-in and comes back to this product.
export function SaveButton({ productId, name }: ActionProps) {
  const address = useCurrentAddress();
  const { shopper } = useSession();
  const { savedProductIds, toggleSaved } = useSavedList();
  const isSaved = savedProductIds.includes(productId);
  if (shopper === null) {
    return (
      <Link
        href={signInHref(withProduct(address, productId))}
        className={styles.saveButton}
        aria-label={`Sign in to save ${name} to your list`}
      >
        <Icon name="heart" size={22} strokeWidth={2.2} />
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={isSaved ? styles.saveButtonSaved : styles.saveButton}
      aria-label={isSaved ? `Remove ${name} from your list` : `Save ${name} to your list`}
      onClick={() => {
        toggleSaved(productId).catch(reportError);
      }}
    >
      <Icon name="heart" size={22} strokeWidth={2.2} />
    </button>
  );
}

type CartAvailability = "loading" | "buyable" | "sold-out";

// Until the details say whether the product is in stock, the button waits.
export function cartAvailability(view: ProductView | null): CartAvailability {
  if (view === null) return "loading";
  return view.availability?.canBuy === false ? "sold-out" : "buyable";
}

type CartButtonProps = ActionProps & {
  availability: CartAvailability;
};

export function CartButton({ productId, name, availability }: CartButtonProps) {
  const { cart, toggleCart } = useCart();
  const isInCart = cart.productIds.includes(productId);
  if (availability === "sold-out" && !isInCart) {
    return (
      <button type="button" className={styles.cartButton} disabled>
        Out of stock
      </button>
    );
  }
  return (
    <button
      type="button"
      className={isInCart ? styles.cartButtonAdded : styles.cartButton}
      aria-label={isInCart ? `In cart: remove ${name}` : `Add to cart: ${name}`}
      disabled={availability === "loading" && !isInCart}
      onClick={() => {
        toggleCart({ id: productId, name }).catch(reportError);
      }}
    >
      <Icon name={isInCart ? "check" : "add-to-cart"} size={22} strokeWidth={2.4} />
      {isInCart ? "In cart" : "Add to cart"}
    </button>
  );
}
