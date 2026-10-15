import Link from "next/link";
import type { ProductId } from "@/core";
import type { ProductView } from "@/use-case";
import { Icon } from "./icon";
import styles from "./product-modal.module.css";
import { withProduct } from "./search-url";
import { signInHref } from "./sign-in-href";
import { useCurrentAddress } from "./use-current-address";

type SaveButtonProps = {
  productId: ProductId;
  name: string;
  isSignedIn: boolean;
  isSaved: boolean;
  onToggleSaved: (productId: ProductId) => void;
};

// Signed out, it asks for sign-in and comes back to this product.
export function SaveButton({
  productId,
  name,
  isSignedIn,
  isSaved,
  onToggleSaved,
}: SaveButtonProps) {
  const address = useCurrentAddress();
  if (!isSignedIn) {
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
      onClick={() => onToggleSaved(productId)}
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

type CartButtonProps = {
  productId: ProductId;
  name: string;
  availability: CartAvailability;
  isInCart: boolean;
  onToggleCart: (productId: ProductId) => void;
};

export function CartButton({
  productId,
  name,
  availability,
  isInCart,
  onToggleCart,
}: CartButtonProps) {
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
      aria-label={isInCart ? `Remove ${name} from cart` : `Add ${name} to cart`}
      disabled={availability === "loading" && !isInCart}
      onClick={() => onToggleCart(productId)}
    >
      <Icon name={isInCart ? "check" : "add-to-cart"} size={22} strokeWidth={2.4} />
      {isInCart ? "In cart" : "Add to cart"}
    </button>
  );
}
