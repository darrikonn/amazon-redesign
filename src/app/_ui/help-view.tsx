import Link from "next/link";
import styles from "./help-view.module.css";
import { PageHeading } from "./page-heading";
import page from "./shop-page.module.css";
import { type HelpTopicId, SHOP_PLACES, type ShopPlace } from "./shop-place";

type HelpTopic = {
  id: HelpTopicId;
  title: string;
  answers: readonly string[];
  link: ShopPlace;
};

const TOPICS: readonly HelpTopic[] = [
  {
    id: "delivery",
    title: "Delivery",
    answers: [
      "Delivery is free on every order, whatever it costs.",
      "Each product shows when it arrives: tomorrow, or in a set number of days.",
      "Your ZIP code says where your orders go. Change it from the header or your account.",
    ],
    link: SHOP_PLACES.trackOrder,
  },
  {
    id: "returns",
    title: "Returns",
    answers: [
      "Each product shows its return policy, and the return window starts on the day it is delivered.",
      "Start a return from the order: pick the items and a reason, then drop them at any carrier.",
      "An item that is still on its way can be returned once it arrives.",
    ],
    link: SHOP_PLACES.orders,
  },
  {
    id: "account",
    title: "Your account",
    answers: [
      "Sign in with any email address; there is no password, and your name comes from the email.",
      "Your cart, orders, and list are kept in this browser, so they are here when you come back.",
      "This is a demo shop: no payment is taken and nothing ships.",
    ],
    link: SHOP_PLACES.account,
  },
  {
    id: "accessibility",
    title: "Accessibility",
    answers: [
      "Everything works from the keyboard, with a visible focus ring on every control.",
      "Pages are built with headings, landmarks, and labels for screen readers, and results are announced as they change.",
      "Motion stops when your device asks for reduced motion.",
    ],
    link: SHOP_PLACES.home,
  },
];

export function HelpView() {
  return (
    <main className={page.main}>
      <PageHeading place={SHOP_PLACES.help} lede="How delivery, returns, and your account work." />
      <nav aria-label="Help topics">
        <ul className={styles.topicLinks}>
          {TOPICS.map((topic) => (
            <li key={topic.id}>
              <a href={`#${topic.id}`} className={styles.topicLink}>
                {topic.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {TOPICS.map((topic) => (
        <section
          key={topic.id}
          id={topic.id}
          className={`${page.panel} ${styles.topic}`}
          aria-labelledby={`${topic.id}-heading`}
        >
          <h2 id={`${topic.id}-heading`} className={styles.topicTitle}>
            {topic.title}
          </h2>
          <ul className={styles.answers}>
            {topic.answers.map((answer) => (
              <li key={answer}>{answer}</li>
            ))}
          </ul>
          <Link href={topic.link.href} className={styles.topicAction}>
            {topic.link.title}
          </Link>
        </section>
      ))}
    </main>
  );
}
