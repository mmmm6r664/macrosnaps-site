// Resources for event professionals: /resources and /resources/{audience}.
// Facts must match the rest of the site. Never state a commission percentage: details are shared after signup.

export type Audience = {
  slug: string;
  name: string; // menu / card label
  title: string; // meta title (≤ 60 chars, absolute)
  description: string; // meta description (≤ 160 chars)
  eyebrow: string;
  h1: string;
  subtitle: string;
  heroTags: string[]; // own-photo tags for the hero
  intro: string[];
  helps: { title: string; body: string }[]; // how MacroSnaps helps this audience
  why: string[]; // why partner with us
  program: string[]; // preferred vendor / referral partner program paragraphs
  faqs: { q: string; a: string }[];
  links: { label: string; href: string }[]; // internal links to services, events, booking, locations
  subject: string; // signup form subject
  formIntro: string;
  messagePlaceholder: string;
};

const PROGRAM_STEPS = [
  { title: "Sign up", body: "Fill in the short form on this page. Our team reviews it and gets in touch by email or phone." },
  { title: "Get the details", body: "Once you are approved as a preferred vendor, we share how the program works, including the commission and how referrals are tracked." },
  { title: "Refer clients", body: "Recommend MacroSnaps to clients who need photography or videography. They book at our published prices, the same for everyone." },
  { title: "Earn on every booking", body: "You earn a commission on every booking that comes from your referral." },
];
export { PROGRAM_STEPS };

const COMMON_FAQS = {
  commission: {
    q: "How much commission do I earn?",
    a: "Commission details, and how referred bookings are tracked, are shared with you after you sign up and are approved as a preferred vendor.",
  },
  price: {
    q: "Do my clients pay more because I referred them?",
    a: "No. MacroSnaps publishes its prices and charges every client the same: photography is $250 for the first hour and $100 for each additional hour, videography is $300 for the first hour and $200 for each additional hour, with a two-hour minimum. Referral commission never changes what your client pays.",
  },
  coi: {
    q: "Can you send a certificate of insurance?",
    a: "Yes. MacroSnaps is insured through State Farm for $1 million per occurrence and $2 million aggregate. Email info@macrosnaps.com with the certificate holder's details and we will send a certificate of insurance on request.",
  },
  where: {
    q: "Where do you work?",
    a: "We have our own photographers and videographers across all US states, Washington, DC, Ontario and Quebec, with an office in Washington, DC (1300 I St NW) and a studio in New York City (Times Square).",
  },
  notice: {
    q: "How far ahead do clients need to book?",
    a: "Bookings need at least 48 hours' notice. Clients choose their hours, pick a date and pay online; for anything sooner they can call 877-622-4973.",
  },
};

export const AUDIENCES: Audience[] = [
  {
    slug: "event-planners",
    name: "Event Planners",
    title: "Resources for Event Planners | MacroSnaps",
    description: "Event planners: book photo and video crews at published prices across the US, DC, Ontario & Quebec, and earn commission as a MacroSnaps preferred vendor.",
    eyebrow: "For event planners & coordinators",
    h1: "Photo & Video Partner for Event Planners",
    subtitle: "One company, our own crews, published prices. Plan your clients' coverage in minutes and earn a commission on every booking you refer.",
    heroTags: ["conference", "gala"],
    intro: [
      "Event planners juggle venues, catering, AV, décor and a run-of-show that has to hold together on the day. Photography and video should be the easy part. MacroSnaps gives you one company to call for conferences, corporate events, galas, weddings and private celebrations, with our own photographers and videographers across all US states, Washington, DC, Ontario and Quebec.",
      "Our prices are published and the same for every client, so you can build them into a proposal without waiting for a quote: photography is $250 for the first hour and $100 for each additional hour, and videography is $300 for the first hour and $200 for each additional hour, with a two-hour minimum. Multi-day programs, several rooms at once and events in several cities are booked at the same hourly rates.",
      "MacroSnaps is part of MacroHype LLC, with 13+ years' experience and 6,000+ events covered: 1,000+ corporate events and conferences and 5,000+ weddings and private events.",
    ],
    helps: [
      { title: "Published prices you can quote", body: "No quotes or back-and-forth. Add photo or video coverage to a client proposal using the same rates every client pays, and book and pay online." },
      { title: "Crews that follow your run-of-show", body: "Send the agenda, VIP list and must-have shots. Our photographers and videographers work quietly around stages, AV teams and catering." },
      { title: "One company, every city", body: "Planning events in several cities? Our own crews cover all US states, DC, Ontario and Quebec, so you deal with one team and one standard." },
      { title: "Insurance and venue paperwork", body: "Fully insured through State Farm ($1M per occurrence / $2M aggregate). Certificates of insurance for venues are available on request." },
      { title: "More than photos", body: "Photography, videography and highlight films, live streaming and photo booths, so one partner covers the whole event." },
      { title: "Delivered on time", body: "Photos are retouched, color graded and delivered in an online gallery in about a week; edited highlight videos usually take two to four weeks." },
    ],
    why: [
      "Our own photographers and videographers, not a marketplace of strangers",
      "13+ years' experience and 6,000+ events covered",
      "Published prices, the same for every client",
      "Insured by State Farm: $1M per occurrence / $2M aggregate",
      "Conferences, corporate events, weddings and private celebrations",
      "A commission on every booking you refer",
    ],
    program: [
      "Join the MacroSnaps Preferred Vendor program and recommend us to the clients you plan for. You can become a preferred vendor and earn a commission on every booking you refer.",
      "Your clients still book at our published prices, so recommending MacroSnaps never adds a markup to their budget. Commission details and how referrals are tracked are shared with you after you sign up.",
    ],
    faqs: [
      COMMON_FAQS.commission,
      COMMON_FAQS.price,
      { q: "Can you cover a multi-day conference or several rooms at once?", a: "Yes. Book each day separately online, add additional photographers or videographers per day, or send us the agenda and we will plan the crew with you at the same published hourly rates." },
      COMMON_FAQS.coi,
      COMMON_FAQS.notice,
      COMMON_FAQS.where,
    ],
    links: [
      { label: "Conference photography", href: "/conference-photography" },
      { label: "Corporate event photography", href: "/corporate-event-photography" },
      { label: "Event videography", href: "/event-videography" },
      { label: "Live streaming", href: "/live-stream" },
      { label: "Photo booth", href: "/photo-booth" },
      { label: "Corporate & multi-city events", href: "/corporate" },
      { label: "Event types we cover", href: "/events" },
      { label: "Locations", href: "/locations" },
      { label: "Prices & online booking", href: "/book" },
    ],
    subject: "Preferred vendor signup: Event planner",
    formIntro: "Tell us about your planning business and the events you work on. We'll get back to you with the program details.",
    messagePlaceholder: "Your planning business, the cities you work in and the kinds of events you plan *",
  },
  {
    slug: "venues",
    name: "Venues & Hotels",
    title: "Resources for Event Venues & Hotels | MacroSnaps",
    description: "Venues and hotels: add an insured photo and video team with published prices to your preferred vendor list, and earn commission on referred bookings.",
    eyebrow: "For venues, hotels & event spaces",
    h1: "A Preferred Photo & Video Vendor for Your Venue",
    subtitle: "Give your clients an insured photography and videography team with published prices, and earn a commission on every booking you refer.",
    heroTags: ["wedding", "gala", "conference"],
    intro: [
      "Clients ask their venue who to hire. Event managers at hotels, banquet halls, conference centers, wineries and wedding venues want to recommend a vendor who arrives on time, respects the house rules and makes the space look its best. MacroSnaps is one company with our own photographers and videographers across all US states, Washington, DC, Ontario and Quebec.",
      "Because our prices are published and the same for every client, your sales and events team can answer the photography question on the first call: photography is $250 for the first hour and $100 for each additional hour, and videography is $300 for the first hour and $200 for each additional hour, with a two-hour minimum. Clients book and pay online.",
      "We are insured through State Farm ($1 million per occurrence, $2 million aggregate) and send a certificate of insurance naming your venue on request.",
    ],
    helps: [
      { title: "A vendor you can recommend with confidence", body: "Our own insured crews, published prices and online booking, backed by 13+ years' experience and 6,000+ events covered." },
      { title: "We follow your house rules", body: "Load-in times, restricted areas, flash rules during ceremonies, noise limits and dress codes: tell us once and every crew we send follows them." },
      { title: "Certificates of insurance on request", body: "Send us your certificate holder details and we provide a COI for your venue." },
      { title: "Weddings, conferences and everything between", body: "Weddings, galas, conferences, corporate events, holiday parties, quinceañeras, bar and bat mitzvahs and more." },
      { title: "Marketing photos of your space", body: "Book commercial photography or videography of your venue at the same published rates, plus Matterport 3D virtual tours in VA, MD, DC, NY State and NJ." },
      { title: "Live streaming and photo booths", body: "Offer clients live streaming for remote guests and a photo booth with an attendant from the same team." },
    ],
    why: [
      "Our own photographers and videographers in every US state, DC, Ontario and Quebec",
      "Insured by State Farm: $1M per occurrence / $2M aggregate",
      "Published prices, the same for every client",
      "Crews that respect your venue's rules and staff",
      "3D virtual tours of your space in VA, MD, DC, NY State and NJ",
      "A commission on every booking you refer",
    ],
    program: [
      "Add MacroSnaps to your preferred vendor list and recommend us to the couples, companies and families who book your space. You can become a preferred vendor and earn a commission on every booking you refer.",
      "Your clients pay the same published prices as everyone else. Commission details and how referrals are tracked are shared with you after you sign up.",
    ],
    faqs: [
      COMMON_FAQS.commission,
      COMMON_FAQS.price,
      COMMON_FAQS.coi,
      { q: "Will your crews follow our venue's rules?", a: "Yes. Share your vendor guidelines (load-in, parking, restricted areas, flash and ceremony rules, end times) and we include them in the brief for every crew we send to your venue." },
      { q: "Can you photograph our venue for marketing?", a: "Yes. Commercial photography and videography of your space are booked at the same published hourly rates, and Matterport 3D virtual tours are available in Virginia, Maryland, Washington, DC, New York State and New Jersey." },
      COMMON_FAQS.notice,
    ],
    links: [
      { label: "Wedding photography", href: "/wedding-photography" },
      { label: "Wedding videography", href: "/wedding-videography" },
      { label: "Event photography", href: "/event-photography" },
      { label: "Conference photography", href: "/conference-photography" },
      { label: "Event venue marketing photos", href: "/industries/event-venues" },
      { label: "3D virtual tours", href: "/virtualtours" },
      { label: "Event types we cover", href: "/events" },
      { label: "Locations", href: "/locations" },
      { label: "Prices & online booking", href: "/book" },
    ],
    subject: "Preferred vendor signup: Venue",
    formIntro: "Tell us about your venue and the events you host. We'll get back to you with the program details.",
    messagePlaceholder: "Venue name and address, the events you host and your vendor guidelines if you have them *",
  },
  {
    slug: "photographers-videographers",
    name: "Photographers & Videographers",
    title: "Resources for Photographers & Videographers",
    description: "Photographers and videographers: join the MacroSnaps crew or refer the clients you can't take and earn a commission on every booking you refer.",
    eyebrow: "For photographers & videographers",
    h1: "Work With MacroSnaps: Join the Crew or Refer Clients",
    subtitle: "Shoot for MacroSnaps in your city, or send us the inquiries you can't take and earn a commission on every booking you refer.",
    heroTags: ["conference", "wedding"],
    intro: [
      "Every photographer and videographer turns work away: a date that is already booked, a city you do not travel to, a video request when you only shoot stills, or a corporate job that is not your style. MacroSnaps gives you two ways to work with us.",
      "If you want steady work, join the MacroSnaps crew. We book the clients and handle all the editing, so you focus on shooting conferences, corporate events, weddings and celebrations in your area. If you run your own business, become a referral partner and earn a commission on every booking you send us.",
      "MacroSnaps is part of MacroHype LLC, with 13+ years' experience and 6,000+ events covered, and our own photographers and videographers across all US states, Washington, DC, Ontario and Quebec.",
    ],
    helps: [
      { title: "Join the crew", body: "Get confirmed shoots in your area with no editing required: our post-production team retouches and edits everything. Apply on our careers page." },
      { title: "Refer the dates you can't take", body: "Already booked on a date? Refer the client to MacroSnaps instead of turning them away, and earn a commission when they book." },
      { title: "Refer the services you don't offer", body: "Shoot photos but get asked for video, live streaming or a photo booth? Refer that part of the job and keep your client happy." },
      { title: "Refer clients outside your area", body: "Clients planning events in other cities can book our own crews across all US states, DC, Ontario and Quebec." },
      { title: "Published prices for your clients", body: "Your clients see exactly what they will pay before they book: the same published prices for everyone." },
      { title: "Insured, professional crews", body: "Insured through State Farm ($1M per occurrence / $2M aggregate), so the clients you refer are in good hands." },
    ],
    why: [
      "Join the crew: confirmed shoots and no editing",
      "Or refer clients and earn a commission on every referred booking",
      "13+ years' experience and 6,000+ events covered",
      "Published prices, the same for every client",
      "Conferences, corporate events, weddings and private events",
      "Coverage across all US states, DC, Ontario and Quebec",
    ],
    program: [
      "Referral partners recommend MacroSnaps for the dates, services and cities they cannot cover. You can become a preferred vendor and earn a commission on every booking you refer.",
      "Commission details and how referrals are tracked are shared with you after you sign up. Want to shoot for us instead? Apply to join the crew on our careers page.",
    ],
    faqs: [
      { q: "How do I join the MacroSnaps crew?", a: "Apply on our careers page. Tell us where you are based, what you shoot and share your portfolio. Our team reviews every application." },
      COMMON_FAQS.commission,
      { q: "Can I be a referral partner and run my own business?", a: "Yes. The referral program is for independent photographers and videographers who want to send us the inquiries they cannot take, such as a date that is already booked, a city they do not serve, or a service they do not offer." },
      COMMON_FAQS.price,
      { q: "Do I have to edit photos or videos for MacroSnaps?", a: "No. Crew members shoot; our post-production team retouches, color grades and edits everything." },
      COMMON_FAQS.where,
    ],
    links: [
      { label: "Careers: join the crew", href: "/careers" },
      { label: "Photography services", href: "/photographers" },
      { label: "Videography services", href: "/videographers" },
      { label: "Live streaming", href: "/live-stream" },
      { label: "Photo booth", href: "/photo-booth" },
      { label: "Event types we cover", href: "/events" },
      { label: "Locations", href: "/locations" },
      { label: "Prices & online booking", href: "/book" },
    ],
    subject: "Referral partner signup: Photographer / videographer",
    formIntro: "Sign up as a referral partner. To shoot for MacroSnaps instead, apply on our careers page.",
    messagePlaceholder: "What you shoot, where you are based, and the kinds of inquiries you would refer *",
  },
  {
    slug: "wedding-officiants",
    name: "Wedding Officiants",
    title: "Resources for Wedding Officiants | MacroSnaps",
    description: "Wedding officiants: recommend wedding photographers and videographers who respect your ceremony, and earn commission as a MacroSnaps preferred vendor.",
    eyebrow: "For wedding officiants",
    h1: "Wedding Photo & Video Partner for Officiants",
    subtitle: "Recommend a photo and video team that respects your ceremony, with published prices couples can see upfront, and earn a commission on every booking you refer.",
    heroTags: ["wedding", "courthouse", "engagement"],
    intro: [
      "Couples often meet their officiant early and ask for recommendations. Whether you lead religious ceremonies, civil weddings, elopements or courthouse marriages, the photographer and videographer in the room affect how the ceremony feels. MacroSnaps crews follow your rules on positioning, flash and movement, and stay out of the way of the vows.",
      "Our prices are published and the same for every couple: photography is $250 for the first hour and $100 for each additional hour, and videography is $300 for the first hour and $200 for each additional hour, with a two-hour minimum. That makes short ceremonies and elopements affordable to cover, and couples can book and pay online.",
      "MacroSnaps has covered 5,000+ weddings and private events, with our own photographers and videographers across all US states, Washington, DC, Ontario and Quebec.",
    ],
    helps: [
      { title: "Crews that respect the ceremony", body: "Tell us your guidelines on flash, aisle movement and where photographers may stand, and we brief every crew we send." },
      { title: "Affordable for short ceremonies", body: "A two-hour minimum at published hourly rates suits elopements, courthouse weddings and small ceremonies." },
      { title: "Every tradition", body: "Indian, Pakistani, Muslim, Jewish, Chinese and Asian, African and same-sex weddings, plus religious ceremonies such as baptisms and communions." },
      { title: "Live streaming for remote family", body: "Relatives who cannot travel can watch the ceremony live in HD from anywhere." },
      { title: "Photos and video from one team", body: "Couples can add videography to photography (or the other way around) in the same online booking." },
      { title: "Insured and professional", body: "Insured through State Farm ($1M per occurrence / $2M aggregate), with certificates of insurance for venues on request." },
    ],
    why: [
      "5,000+ weddings and private events covered",
      "Crews who follow your ceremony guidelines",
      "Published prices, the same for every couple",
      "Elopements, courthouse and religious ceremonies",
      "Insured by State Farm: $1M per occurrence / $2M aggregate",
      "A commission on every booking you refer",
    ],
    program: [
      "Recommend MacroSnaps to the couples you marry. You can become a preferred vendor and earn a commission on every booking you refer.",
      "Couples pay the same published prices as everyone else. Commission details and how referrals are tracked are shared with you after you sign up.",
    ],
    faqs: [
      COMMON_FAQS.commission,
      COMMON_FAQS.price,
      { q: "Will your photographers follow my ceremony rules?", a: "Yes. Share your guidelines on flash, positioning, aisle movement and any moments that must not be photographed, and we include them in the brief for every crew we send to your ceremonies." },
      { q: "Do you cover elopements and courthouse weddings?", a: "Yes. With a two-hour minimum at published hourly rates, elopements, courthouse and city hall weddings are affordable to cover." },
      COMMON_FAQS.notice,
      COMMON_FAQS.where,
    ],
    links: [
      { label: "Wedding photography", href: "/wedding-photography" },
      { label: "Wedding videography", href: "/wedding-videography" },
      { label: "Elopement photography", href: "/elopement-photography" },
      { label: "Religious ceremony photography", href: "/religious-ceremony-photography" },
      { label: "Live streaming", href: "/live-stream" },
      { label: "Event types we cover", href: "/events" },
      { label: "Locations", href: "/locations" },
      { label: "Prices & online booking", href: "/book" },
    ],
    subject: "Preferred vendor signup: Wedding officiant",
    formIntro: "Tell us about the ceremonies you officiate. We'll get back to you with the program details.",
    messagePlaceholder: "The ceremonies you officiate, the areas you serve and any guidelines for photographers *",
  },
];

export const getAudience = (slug: string) => AUDIENCES.find((a) => a.slug === slug);
