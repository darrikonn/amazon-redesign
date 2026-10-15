import Link from "next/link";
import { type MouseEvent, useId, useState } from "react";
import type { ProductId, SearchSort } from "@/core";
import type {
  NavigationDepartmentView,
  NavigationLinkView,
  NavigationView,
  ProductTeaserView,
} from "@/use-case";
import styles from "./browse-navigation.module.css";
import { Collapsible } from "./collapsible";
import { splitPrice } from "./format";
import { Icon } from "./icon";
import { isPlainClick } from "./plain-click";
import { ProductPhoto } from "./product-photo";
import type { ProductPreview } from "./product-preview";
import { searchUrl } from "./search-url";

type BrowseNavigationProps = {
  navigation: NavigationView;
  sort: SearchSort;
  productHref: (productId: ProductId) => string;
  onBrowse: (text: string, anchor: HTMLElement) => void;
  onOpenProduct: (preview: ProductPreview) => void;
};

// Departments open, and nothing closes or shrinks by itself: the department the results
// move into opens, and the one they left stays open with its popular products, so an
// entry never slides away from the pointer. Only the shopper's own toggle closes one.
export function BrowseNavigation({
  navigation,
  sort,
  productHref,
  onBrowse,
  onOpenProduct,
}: BrowseNavigationProps) {
  const marked = navigation.departments.find((department) => department.containsResults) ?? null;
  const markedText = marked?.link.text ?? null;
  const [openState, setOpenState] = useState<ReadonlyMap<string, boolean>>(new Map());
  const [lastMarkedText, setLastMarkedText] = useState(markedText);
  if (markedText !== lastMarkedText) {
    setLastMarkedText(markedText);
    setOpenState((current) => withOpen(current, [lastMarkedText, markedText]));
  }
  const [shownPopular, setShownPopular] = useState<
    ReadonlyMap<string, readonly ProductTeaserView[]>
  >(new Map());
  if (marked !== null && marked.popular.length > 0) {
    if (shownPopular.get(marked.link.text) !== marked.popular) {
      setShownPopular((current) => new Map(current).set(marked.link.text, marked.popular));
    }
  }

  function popularFor(department: NavigationDepartmentView): readonly ProductTeaserView[] {
    if (department.popular.length > 0) return department.popular;
    return shownPopular.get(department.link.text) ?? [];
  }

  function isOpen(department: NavigationDepartmentView): boolean {
    return openState.get(department.link.text) ?? department.containsResults;
  }

  function toggle(department: NavigationDepartmentView) {
    const next = !isOpen(department);
    setOpenState((current) => new Map(current).set(department.link.text, next));
  }

  return (
    <nav aria-label="Shop by department" className={styles.navigation}>
      <h2 className={styles.sectionHeading}>Departments</h2>
      <ul className={styles.departments}>
        {navigation.departments.map((department) => (
          <DepartmentItem
            key={department.link.text}
            department={department}
            popular={popularFor(department)}
            sort={sort}
            isOpen={isOpen(department)}
            productHref={productHref}
            onToggle={() => toggle(department)}
            onBrowse={onBrowse}
            onOpenProduct={onOpenProduct}
          />
        ))}
      </ul>
    </nav>
  );
}

function withOpen(
  openState: ReadonlyMap<string, boolean>,
  departmentTexts: readonly (string | null)[],
): ReadonlyMap<string, boolean> {
  const next = new Map(openState);
  for (const text of departmentTexts) if (text !== null) next.set(text, true);
  return next;
}

type DepartmentItemProps = {
  department: NavigationDepartmentView;
  popular: readonly ProductTeaserView[];
  sort: SearchSort;
  isOpen: boolean;
  productHref: (productId: ProductId) => string;
  onToggle: () => void;
  onBrowse: (text: string, anchor: HTMLElement) => void;
  onOpenProduct: (preview: ProductPreview) => void;
};

function DepartmentItem({
  department,
  popular,
  sort,
  isOpen,
  productHref,
  onToggle,
  onBrowse,
  onOpenProduct,
}: DepartmentItemProps) {
  const contentsId = useId();
  const { link, containsResults, groups } = department;
  const hasContents = groups.length > 0 || popular.length > 0;
  return (
    <li>
      <div className={styles.departmentRow}>
        <BrowseLink
          link={link}
          sort={sort}
          className={containsResults ? styles.resultDepartment : styles.department}
          isResultDepartment={containsResults}
          onBrowse={onBrowse}
        />
        {hasContents && (
          <button
            type="button"
            className={isOpen ? styles.toggleOpen : styles.toggle}
            aria-expanded={isOpen}
            aria-controls={contentsId}
            aria-label={`${link.label} categories`}
            onClick={onToggle}
          >
            <Icon name="chevron-right" size={16} strokeWidth={2.6} />
          </button>
        )}
      </div>
      {hasContents && (
        <Collapsible isOpen={isOpen}>
          <div id={contentsId} className={styles.contents}>
            {groups.length > 0 && (
              <ul className={styles.groups}>
                {groups.map((group) => (
                  <li key={group.text}>
                    <BrowseLink
                      link={group}
                      sort={sort}
                      className={group.isCurrent ? styles.currentGroup : styles.group}
                      isResultDepartment={false}
                      onBrowse={onBrowse}
                    />
                  </li>
                ))}
              </ul>
            )}
            {popular.length > 0 && (
              <PopularProducts
                departmentLabel={link.label}
                products={popular}
                productHref={productHref}
                onOpenProduct={onOpenProduct}
              />
            )}
          </div>
        </Collapsible>
      )}
    </li>
  );
}

type PopularProductsProps = {
  departmentLabel: string;
  products: readonly ProductTeaserView[];
  productHref: (productId: ProductId) => string;
  onOpenProduct: (preview: ProductPreview) => void;
};

function PopularProducts({
  departmentLabel,
  products,
  productHref,
  onOpenProduct,
}: PopularProductsProps) {
  const headingId = useId();
  return (
    <section className={styles.popular} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.popularHeading}>
        Popular in {departmentLabel.toLowerCase()}
      </h3>
      <ul className={styles.popularList}>
        {products.map((product) => (
          <li key={product.id}>
            <Link
              href={productHref(product.id)}
              prefetch={false}
              className={styles.teaser}
              onClick={(event) => {
                if (!isPlainClick(event)) return;
                event.preventDefault();
                onOpenProduct(product);
              }}
            >
              <span className={styles.teaserImage}>
                <ProductPhoto
                  image={product.image}
                  category={product.category}
                  alt=""
                  sizes="52px"
                  className={styles.photo}
                />
              </span>
              <span className={styles.teaserText}>
                <span className={styles.teaserName}>{product.name}</span>
                <span className={styles.teaserPrice}>
                  {splitPrice(product.priceInCents).spoken}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

type BrowseLinkProps = {
  link: NavigationLinkView;
  sort: SearchSort;
  className: string | undefined;
  isResultDepartment: boolean;
  onBrowse: (text: string, anchor: HTMLElement) => void;
};

// A real link, so it can open in a new tab, but a plain click searches in place instead
// of reloading the page.
function BrowseLink({ link, sort, className, isResultDepartment, onBrowse }: BrowseLinkProps) {
  function navigate(event: MouseEvent<HTMLAnchorElement>) {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    onBrowse(link.text, event.currentTarget);
  }

  return (
    <Link
      href={searchUrl({ text: link.text, sort })}
      prefetch={false}
      className={className}
      aria-current={currentMarker(link, isResultDepartment)}
      onClick={navigate}
    >
      <span className={styles.label}>{link.label}</span>
      <span className={styles.count}>{link.productCount.toLocaleString("en-US")}</span>
    </Link>
  );
}

// "page" when the search is exactly this entry; "true" for the department the results
// belong to, so screen readers hear where the shopper is even on a narrower search.
function currentMarker(link: NavigationLinkView, isResultDepartment: boolean) {
  if (link.isCurrent) return "page";
  return isResultDepartment ? "true" : undefined;
}
