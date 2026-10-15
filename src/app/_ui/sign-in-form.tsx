"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useId, useRef, useState } from "react";
import { AmazonLogo } from "./amazon-logo";
import field from "./field.module.css";
import { FieldError } from "./field-error";
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
  const inputRef = useRef<HTMLInputElement>(null);

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
    setError("That doesn’t look like an email address. Check it reads like darri@example.com.");
    inputRef.current?.focus();
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
          ref={inputRef}
          id={inputId}
          name="email"
          type="email"
          className={field.input}
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
          <FieldError id={errorId} message={error} />
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
