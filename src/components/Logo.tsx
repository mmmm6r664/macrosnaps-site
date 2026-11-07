import Image from "next/image";
import { SITE } from "@/lib/site";

/** The real MacroSnaps logo (gold on transparent). On light backgrounds it sits on a black tile so the gold reads. */
export default function Logo({ size = 64, onLight = false, className = "" }: { size?: number; onLight?: boolean; className?: string }) {
  const img = <Image src={SITE.logo} alt="MacroSnaps" width={Math.round(size * 1.488)} height={size} className="h-auto w-auto" style={{ height: size, width: "auto" }} priority />;
  return onLight ? <span className={`inline-block rounded-md bg-black px-3 py-2 ${className}`}>{img}</span> : <span className={`inline-block ${className}`}>{img}</span>;
}
