"use client";
/** A submit button that asks for confirmation first (for deletes). */
export default function ConfirmButton({ message, className, children }: { message: string; className?: string; children: React.ReactNode }) {
  return <button type="submit" className={className} onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}>{children}</button>;
}
