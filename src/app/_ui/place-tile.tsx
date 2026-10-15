import Link from "next/link";
import { Icon, type IconName } from "./icon";
import styles from "./place-tile.module.css";

type PlaceTileProps = {
  icon: IconName;
  title: string;
  description: string;
} & ({ href: string } | { onClick: () => void });

// A tile that goes somewhere (a link) or opens something here (a button); both look alike.
export function PlaceTile(props: PlaceTileProps) {
  const contents = (
    <>
      <span className={styles.iconTile}>
        <Icon name={props.icon} size={24} />
      </span>
      <span className={styles.text}>
        <span className={styles.title}>{props.title}</span>
        <span className={styles.description}>{props.description}</span>
      </span>
      <Icon name="chevron-right" size={18} strokeWidth={2.4} className={styles.chevron} />
    </>
  );
  if ("href" in props) {
    return (
      <Link href={props.href} className={styles.tile}>
        {contents}
      </Link>
    );
  }
  return (
    <button type="button" className={styles.tile} onClick={props.onClick}>
      {contents}
    </button>
  );
}
