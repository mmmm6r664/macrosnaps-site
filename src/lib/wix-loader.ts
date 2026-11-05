// Serves images from the Wix media CDN at the requested width (no Vercel image costs).
export default function wixLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (!src.includes("static.wixstatic.com/media/")) return src;
  const base = src.split("/v1/")[0];
  const name = base.split("/").pop()!.replace(/~/g, "_");
  const q = quality || 80;
  return `${base}/v1/fit/w_${width},h_${width * 3},q_${q},enc_auto/${name}`;
}
