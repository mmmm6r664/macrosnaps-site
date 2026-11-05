import Link from "next/link";
export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl px-4 py-28 text-center">
      <h1 className="font-script text-5xl">Page not found</h1>
      <p className="mt-4 text-muted">The page you&apos;re looking for has moved or doesn&apos;t exist.</p>
      <div className="mt-8 flex justify-center gap-4"><Link href="/" className="btn-dark">Home</Link><Link href="/locations" className="btn-outline">Find your city</Link></div>
    </section>
  );
}
