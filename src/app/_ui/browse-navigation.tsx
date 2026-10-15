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
import { useBrowsing } from "./browsing-context";
import { Collapsible } from "./collapsible";
import {
  followNavigation,
  isDepartmentOpen,
  popularFor,
  shownDepartments,
  startPanel,
  toggleDepartment,
} from "./department-panel";
import { splitPrice } from "./format";
import { Icon } from "./icon";
import { isPlainClick } from "./plain-click";
import { ProductPhoto } from "./product-photo";
import { searchUrl } from "./search-url";

type BrowseNavigationProps = {
  navigation: NavigationView;
  sort: SearchSort;
  productHref: (productId: ProductId) => string;
  onBrowse: (text: string, anchor: HTMLElement) => void;
};

// What every entry needs to link somewhere: the sort to keep, the address of a product,
// and what browsing to a department does.
type BrowseTarget = {
  sort: SearchSort;
  productHref: (productId: ProductId) => string;
  onBrowse: (text: string, anchor: HTMLElement) => void;
};

export function BrowseNavigation({
  navigation,
  sort,
  productHref,
  onBrowse,
}: BrowseNavigationProps) {
  const target: BrowseTarget = { sort, productHref, onBrowse };
  const [panel, setPanel] = useState(() => startPanel(navigation));
  const [isShowingAll, setIsShowingAll] = useState(false);
  const followed = followNavigation(panel, navigation);
  if (followed !== panel) setPanel(followed);
  const shown = shownDepartments(followed, navigation, isShowingAll);
  const canShowMore = isShowingAll || shown.length < navigation.departments.length;

  return (
    <nav aria-label="Shop by department" className={styles.navigation}>
      <h2 className={styles.sectionHeading}>Departments</h2>
      <ul className={styles.departments}>
        {shown.map((department) => (
          <DepartmentItem
            key={department.link.text}
            department={department}
            popular={popularFor(followed, department)}
            isOpen={isDepartmentOpen(followed, department)}
            target={target}
            onToggle={() => setPanel((current) => toggleDepartment(current, department))}
          />
        ))}
      </ul>
      {canShowMore && (
        <button
          type="button"
          className={styles.showAll}
          aria-expanded={isShowingAll}
          onClick={() => setIsShowingAll((showing) => !showing)}
        >
          {isShowingAll
            ? "Show fewer departments"
            : `See all ${navigation.departments.length} departments`}
        </button>
      )}
    </nav>
  );
}

type DepartmentItemProps = {
  department: NavigationDepartmentView;
  popular: readonly ProductTeaserView[];
  isOpen: boolean;
  target: BrowseTarget;
  onToggle: () => void;
};

function DepartmentItem({ department, popular, isOpen, target, onToggle }: DepartmentItemProps) {
  const { sort, productHref, onBrowse } = target;
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
};

function PopularProducts({ departmentLabel, products, productHref }: PopularProductsProps) {
  const { openProduct } = useBrowsing();
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
                openProduct(product);
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
