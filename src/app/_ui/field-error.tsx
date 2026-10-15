import styles from "./field.module.css";
import { Icon } from "./icon";

type FieldErrorProps = {
  id: string;
  message: string;
};

// Announced as soon as it appears, and tied to its field by aria-describedby.
export function FieldError({ id, message }: FieldErrorProps) {
  return (
    <p id={id} className={styles.error} role="alert">
      <Icon name="alert" size={18} strokeWidth={2.4} className={styles.errorIcon} />
      {message}
    </p>
  );
}
