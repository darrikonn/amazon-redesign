import { Icon } from "./icon";
import styles from "./starter-query-list.module.css";

type StarterQueryListProps = {
  queries: readonly string[];
  onPick: (query: string) => void;
};

export function StarterQueryList({ queries, onPick }: StarterQueryListProps) {
  return (
    <ul className={styles.list} aria-label="Try one of these">
      {queries.map((query) => (
        <li key={query} className={styles.item}>
          <button type="button" className={styles.pill} onClick={() => onPick(query)}>
            <Icon name="search" size={16} strokeWidth={2.6} className={styles.icon} />
            {query}
          </button>
        </li>
      ))}
    </ul>
  );
}
