import Link from "next/link";
import { EmptyState } from "./empty-state";
import page from "./shop-page.module.css";
import { SHOP_PLACES } from "./shop-place";

export function NotFoundView() {
  return (
    <main className={page.main}>
      <h1 className={page.title}>Page not found</h1>
      <EmptyState
        icon="search"
        title="The link may be old or mistyped"
        message="Say what you need on the home page instead, or try one of these."
      >
        <Link href="/" className={page.primaryButton}>
          Start shopping
        </Link>
        <Link href={SHOP_PLACES.deals.href} className={page.secondaryButton}>
          {SHOP_PLACES.deals.title}
        </Link>
        <Link href={SHOP_PLACES.help.href} className={page.secondaryButton}>
          {SHOP_PLACES.help.title}
        </Link>
      </EmptyState>
    </main>
  );
}
