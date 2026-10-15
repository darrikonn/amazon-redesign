"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useId, useState } from "react";
import { AmazonLogo } from "./amazon-logo";
import { useSession } from "./session-context";
import page from "./shop-page.module.css";
import styles from "./sign-in-form.module.css";

type SignInFormProps = {
  returnPath: string;
};

export function SignInForm({ returnPath }: SignInFormProps) {
  const { signIn } = useSession();
  const router = useRouter();
  const inputId = useId();
  const errorId = useId();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    setIsSigningIn(true);
    const result = await signIn(typeof email === "string" ? email : "");
    if (result.status === "signed-in") {
      router.replace(returnPath);
      router.refresh();
      return;
    }
    setIsSigningIn(false);
    setError("Enter your email address, such as darri@example.com.");
  }

  return (
    <main className={`${page.main} ${page.narrow}`}>
      <form className={`${page.panel} ${styles.form}`} onSubmit={submit} noValidate>
        <div className={styles.logo}>
          <AmazonLogo />
        </div>
        <h1 className={styles.title}>Sign in</h1>
        <label htmlFor={inputId} className={styles.label}>
          Email
        </label>
        <input
          id={inputId}
          name="email"
          type="email"
          className={styles.input}
          autoComplete="email"
          inputMode="email"
          aria-invalid={error !== null}
          aria-describedby={error === null ? `${inputId}-hint` : errorId}
        />
        {error === null ? (
          <p id={`${inputId}-hint`} className={styles.hint}>
            No password needed. Any email signs you in, and your name comes from the address:
            darri.konn@example.com is greeted as Darri.
          </p>
        ) : (
          <p id={errorId} className={styles.error} role="alert">
            {error}
          </p>
        )}
        <button type="submit" className={page.primaryButton} disabled={isSigningIn}>
          {isSigningIn ? "Signing in" : "Continue"}
        </button>
        <p className={styles.note}>
          Your cart, orders, and list stay in this browser. Only your email and ZIP code are kept,
          in a cookie, so you stay signed in.
        </p>
      </form>
    </main>
  );
}
