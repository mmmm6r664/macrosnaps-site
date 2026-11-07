"use client";
import { startTransition, type FormEvent } from "react";

/** Submit a form to a server action WITHOUT React's automatic form reset, so typed values survive an error. */
export const noReset = (act: (fd: FormData) => void) => (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
  const fd = new FormData(e.currentTarget, submitter);
  startTransition(() => act(fd));
};
