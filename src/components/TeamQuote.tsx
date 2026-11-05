import Image from "next/image";

export const TEAM = {
  juan: {
    name: "Juan",
    role: "Head Photographer · DC Metro Region",
    quote: "We aim to make all your events special.",
    photo: "/team/juan.png",
    alt: "Juan, Head Photographer for the DC Metro region at MacroSnaps",
    regions: ["DC", "MD", "VA"],
  },
  dusan: {
    name: "Dusan",
    role: "Head Videographer · New York Metro Region",
    quote: "At MacroSnaps, we take your story seriously — every frame, every cut.",
    photo: "/team/dusan.png",
    alt: "Dusan, Head Videographer for the New York Metro region at MacroSnaps",
    regions: ["NY", "NJ", "CT"],
  },
};
type Member = (typeof TEAM)[keyof typeof TEAM];

function Card({ m, large }: { m: Member; large?: boolean }) {
  return (
    <figure className={`flex flex-col items-center gap-8 ${large ? "md:flex-row" : ""}`}>
      <div className={`relative shrink-0 overflow-hidden rounded-t-full border-4 border-gold shadow-xl ${large ? "h-72 w-56 md:h-96 md:w-72" : "h-72 w-56"}`}>
        <Image src={m.photo} alt={m.alt} fill sizes="288px" className="object-cover object-top" />
      </div>
      <div className={`text-center ${large ? "md:text-left" : ""}`}>
        <svg viewBox="0 0 48 36" className={`mx-auto h-8 w-10 text-gold ${large ? "md:mx-0" : ""}`} fill="currentColor" aria-hidden><path d="M0 36V22C0 9 7 1 19 0l2 5C14 7 11 12 11 18h8v18H0zm27 0V22C27 9 34 1 46 0l2 5c-7 2-10 7-10 13h8v18H27z" /></svg>
        <blockquote className={`mt-3 font-script leading-tight text-ink ${large ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl"}`}>{m.quote}</blockquote>
        <figcaption className="mt-5">
          <span className="block font-serif text-2xl">{m.name}</span>
          <span className="text-sm uppercase tracking-[.2em] text-gold-dark">{m.role}</span>
        </figcaption>
      </div>
    </figure>
  );
}

/** Team quotes. Pass a state/province code to show the local lead only (nothing if none). */
export default function TeamQuote({ region }: { region?: string }) {
  const members = region ? Object.values(TEAM).filter((m) => m.regions.includes(region)) : Object.values(TEAM);
  if (!members.length) return null;
  return (
    <section className="marble px-4 py-16 md:px-6" data-reveal>
      {!region && (
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="eyebrow">Meet the team</p>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl">The people behind the camera</h2>
        </div>
      )}
      <div className={`mx-auto grid max-w-6xl gap-16 ${members.length > 1 ? "md:grid-cols-2" : "max-w-5xl"}`}>
        {members.map((m) => <Card key={m.name} m={m} large={members.length === 1} />)}
      </div>
    </section>
  );
}
