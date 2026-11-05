// Service catalog. Copy marked "from macrosnaps.com" is carried over from the current site.
import { IMG, imagesForService } from "./images";

export type Package = {
  id: string;
  name: string;
  hours?: number;
  price: number; // USD, full price charged at checkout
  priceNote?: string;
  features: string[];
  /** Shown as a price card but handled by quote, not online checkout */
  quoteOnly?: boolean;
};

export type Faq = { q: string; a: string };

export type Service = {
  slug: string;
  name: string; // "Conference Photography"
  kind: "photo" | "video" | "other";
  group: "corporate" | "wedding" | "personal" | "business" | "post";
  /** Person noun used in city titles, e.g. "Conference Photographer" */
  pro: string;
  title: string; // national meta title
  description: string; // national meta description
  heroTitle?: string;
  intro: string[];
  sections?: { heading: string; body: string }[];
  coverage: string[];
  packages: Package[];
  pricingNote?: string;
  faqs: Faq[];
  images: string[];
  /** Has city + state landing pages */
  local: boolean;
  related: string[];
};

const PHOTO_FEATURES = (h: number) => [
  "1 photographer",
  `${h} hours of coverage`,
  "All pictures retouched, edited and color graded",
  "Online gallery of high-resolution pictures",
  "Raw pictures delivered on request",
  "Turnaround time: 1 week",
];

const photoPackages = (prices: number[], prefix = "photo"): Package[] =>
  prices.map((price, i) => ({ id: `${prefix}-${i + 2}h`, name: `${i + 2} Hour Photography`, hours: i + 2, price, features: PHOTO_FEATURES(i + 2) }));

const VIDEO_TABLE: [number, number, string, number, string][] = [
  // hours, price, clip length, re-edits, turnaround — from macrosnaps.com event videography pricing
  [2, 450, "3 - 5 mins", 1, "2 to 4 weeks"],
  [3, 650, "3 - 5 mins", 1, "2 to 4 weeks"],
  [4, 850, "3 - 5 mins", 1, "2 to 4 weeks"],
  [5, 1250, "3 - 6 mins", 2, "2 to 4 weeks"],
  [6, 1450, "4 - 7 mins", 3, "3 to 4 weeks"],
  [7, 1650, "4 - 8 mins", 3, "3 to 4 weeks"],
];
const SECOND_SHOOTER: Record<number, number> = { 2: 400, 3: 600, 4: 800, 5: 1000, 6: 1200, 7: 1400 };

const videoPackages = (prefix = "video", prices?: number[]): Package[] =>
  VIDEO_TABLE.map(([h, base, len, re, tat], i) => ({ price: prices?.[i] ?? base,
    id: `${prefix}-${h}h`,
    name: `${h} Hour Videography`,
    hours: h,
    priceNote: `Second shooter +$${SECOND_SHOOTER[h].toLocaleString()}`,
    features: [
      `1 videographer, ${h} hours of filming`,
      `1 edited highlights video (${len})`,
      `Best moments selected from ${h} hours of footage`,
      "Song / music of your choice",
      `${re} re-edit request${re > 1 ? "s" : ""}`,
      "Raw footage available on request",
      `Turnaround time: ${tat}`,
    ],
  }));

// Prices from macrosnaps.com
const EVENT_PHOTO = photoPackages([300, 400, 500, 600, 700, 800]);
const WEDDING_PHOTO = photoPackages([350, 450, 550, 650, 750, 850], "wedding");
const EVENT_VIDEO = videoPackages();

const simple = (prefix: string, rows: [string, number, string[]][]): Package[] =>
  rows.map(([name, price, features], i) => ({ id: `${prefix}-${i + 1}`, name, price, features }));

const SESSION_PHOTO = (prefix: string) =>
  simple(prefix, [
    ["1 Hour Session", 200, ["1 photographer", "1 hour session", "Retouched, high-resolution photos", "Online gallery"]],
    ["2 Hour Session", 300, ["1 photographer", "2 hour session", "Retouched, high-resolution photos", "Online gallery"]],
    ["3 Hour Session", 400, ["1 photographer", "3 hour session", "Retouched, high-resolution photos", "Online gallery"]],
  ]);
const PORTRAITS = (prefix: string) =>
  simple(prefix, [
    ["10 Portraits", 150, ["10 retouched portraits", "30 minute session"]],
    ["20 Portraits", 200, ["20 retouched portraits", "1 hour session"]],
    ["40 Portraits", 300, ["40 retouched portraits", "2 hour session"]],
  ]);

const CORPORATE_NOTE =
  "Multi-day conferences, multi-camera crews, same-day edits, headshot lounges and events in several cities are quoted separately — request a corporate quote and we will invoice your company.";

const GENERAL_FAQS: Faq[] = [
  {
    q: "Are the pictures edited?",
    a: "Yes. We color grade and retouch all the pictures delivered to our clients. Additional editing requests (for example slimming or skin-tone changes) are available at an extra charge, and re-edits of any photo you are not happy with are free.",
  },
  {
    q: "Is MacroSnaps insured?",
    a: "Yes. We are fully insured through State Farm for $1 million each occurrence and $2 million general aggregate. If your venue needs a certificate of insurance, email info@macrosnaps.com and we will send it.",
  },
  {
    q: "Why is the first hour priced differently from additional hours?",
    a: "We leave a gap between shoots so our crew always arrives on time, and the time and cost of travelling to your venue is built into the first hour. That is why package prices are the same wherever you book.",
  },
  {
    q: "What is your refund and rescheduling policy?",
    a: "Bookings are non-refundable because we reserve your slot and turn away other bookings for that time. Bookings can be rescheduled at no charge because of extreme weather or a serious emergency (proof required).",
  },
];

export const SERVICES: Service[] = [
  // ───────────────────────── Corporate & conferences
  {
    slug: "conference-photography",
    name: "Conference Photography",
    kind: "photo",
    group: "corporate",
    pro: "Conference Photographer",
    title: "Conference Photographer | Corporate Conference Photography Worldwide",
    description:
      "Professional conference photography for keynotes, panels, breakouts, expos and networking. MacroSnaps crews cover conferences across the US and Canada. From $300.",
    intro: [
      "Capturing the essence of a conference requires a unique set of skills and equipment, and we are committed to providing top-quality photography services for your event.",
      "From the opening keynote to the closing reception, MacroSnaps photographers document speakers, panels, breakout sessions, sponsors, exhibitors and the conversations that happen between sessions, giving your marketing, PR and sponsorship teams images they can publish the same week.",
    ],
    sections: [
      {
        heading: "Built for event organizers and marketing teams",
        body: "We have photographed summits, association meetings, award ceremonies and multi-day industry conferences for organizations such as IEEE, PwC, Deloitte, Steelcase and the Department of Justice. Our photographers work quietly around stages and AV crews, follow your run-of-show, and know which shots sponsors and speakers will ask for afterwards.",
      },
      {
        heading: "Fast delivery for post-event marketing",
        body: "Every image is retouched and color graded and delivered in a high-resolution online gallery, organized so your team can find each session, speaker and sponsor quickly. Need highlights during the event for social media? Ask about same-day selects when you request a corporate quote.",
      },
    ],
    coverage: [
      "Keynote speakers & stage presentations",
      "Panels, fireside chats & breakout sessions",
      "Expo halls, exhibitor booths & sponsor activations",
      "Networking receptions & VIP dinners",
      "Registration, branding & venue details",
      "Award ceremonies & gala dinners",
      "Group photos & on-site headshots",
      "Candid attendee engagement for next year's marketing",
    ],
    packages: EVENT_PHOTO,
    pricingNote: CORPORATE_NOTE,
    faqs: [
      { q: "Can you cover a multi-day conference?", a: "Yes. We regularly cover two- and three-day conferences, with one or several photographers per day depending on how many rooms run at the same time. Request a corporate quote with your agenda and we will propose a crew plan." },
      { q: "Can you provide photos during the event for social media?", a: "Yes. Same-day selects can be arranged so your social and comms teams can post while the event is still running. Mention it in your quote request." },
      { q: "Do you also film the conference?", a: "Yes. Our conference videography team records keynotes and panels and edits highlight recap videos, and we can live stream sessions for remote attendees." },
      { q: "Can you invoice our company instead of paying by card?", a: "Yes, for corporate bookings we can issue an invoice. Use the corporate quote form and tell us your billing requirements." },
      ...GENERAL_FAQS,
    ],
    images: IMG.conference,
    local: true,
    related: ["conference-videography", "corporate-event-photography", "live-stream", "event-photography"],
  },
  {
    slug: "corporate-event-photography",
    name: "Corporate Event Photography",
    kind: "photo",
    group: "corporate",
    pro: "Corporate Event Photographer",
    title: "Corporate Event Photographer | Company Events, Galas & Trade Shows",
    description:
      "Corporate event photography for company parties, product launches, galas, award nights, trade shows and team offsites. Our own crews across the US & Canada. From $300.",
    intro: [
      "Your company events are some of your best marketing material. MacroSnaps photographs product launches, holiday parties, client appreciation nights, galas, award ceremonies, trade show booths and team offsites, and delivers polished images your brand, HR and sales teams can use for months.",
      "Our photographers dress for the room, work discreetly around executives and guests, and capture both the moments your leadership wants on record and the candid energy that shows what your company is really like.",
    ],
    sections: [
      {
        heading: "One partner for every office",
        body: "Because MacroSnaps has its own photographers and videographers across the United States and Canada, companies with several offices can book the same standard of coverage in every city, with one point of contact and consistent editing across all of their events.",
      },
    ],
    coverage: [
      "Product launches & press events",
      "Holiday parties & company celebrations",
      "Galas, fundraisers & award ceremonies",
      "Trade show booths & exhibitor activations",
      "Team offsites, retreats & town halls",
      "Client appreciation & networking events",
      "Executive portraits & team photos",
      "Office and workplace culture photography",
    ],
    packages: EVENT_PHOTO,
    pricingNote: CORPORATE_NOTE,
    faqs: [
      { q: "Do you work with companies that have events in several cities?", a: "Yes. We have our own crews across the US and Canada, so national companies can book consistent coverage for every office or roadshow stop, with one point of contact." },
      { q: "Can you take headshots at our corporate event?", a: "Yes. We can set up a headshot station alongside event coverage. For dedicated headshot sessions, see our business headshots service at MacroHeadshots." },
      { q: "Can we pay by invoice?", a: "Yes. Corporate clients can request an invoice through the corporate quote form." },
      ...GENERAL_FAQS,
    ],
    images: IMG.corporate,
    local: true,
    related: ["conference-photography", "corporate-videography", "event-photography", "photo-booth"],
  },
  {
    slug: "trade-show-photography",
    name: "Trade Show Photography",
    kind: "photo",
    group: "corporate",
    pro: "Trade Show Photographer",
    title: "Trade Show & Expo Photographer | Booth & Exhibitor Photography",
    description:
      "Trade show and expo photography: booth photos, product demos, crowds, exhibitor and sponsor coverage at convention centers across the US and Canada. From $300.",
    intro: [
      "A trade show booth costs a lot to design and staff, and good photographs are how you prove its value to leadership and reuse it in marketing. MacroSnaps photographs booths before the doors open, product demos, visitor traffic, meetings and team photos at convention centers across North America.",
      "For show organizers, we cover the full expo floor, sponsor activations, ribbon cuttings and stage programming, so every exhibitor and sponsor gets the proof of exposure they paid for.",
    ],
    coverage: [
      "Clean booth photos before the show opens",
      "Product demos & customer conversations",
      "Crowd and traffic shots for ROI reports",
      "Sponsor branding & signage",
      "Show-floor overviews & ribbon cuttings",
      "Team and staff photos",
    ],
    packages: EVENT_PHOTO,
    pricingNote: CORPORATE_NOTE,
    faqs: [
      { q: "Can you photograph several exhibitors at the same show?", a: "Yes. Organizers often book us to cover every sponsor booth; exhibitors can also book individual time slots. Request a corporate quote with the floor plan or exhibitor list." },
      ...GENERAL_FAQS,
    ],
    images: IMG.conference,
    local: false,
    related: ["conference-photography", "corporate-event-photography", "conference-videography"],
  },
  {
    slug: "conference-videography",
    name: "Conference Videography",
    kind: "video",
    group: "corporate",
    pro: "Conference Videographer",
    title: "Conference Videographer | Keynote Recording & Recap Videos",
    description:
      "Conference videography: keynote and panel recordings, multi-camera coverage, professional audio and edited highlight recap videos. Nationwide crews. From $450.",
    intro: [
      "From keynote speeches to panel discussions, we'll capture every important moment. We pride ourselves on delivering excellent customer service and a high-quality final product.",
      "MacroSnaps films conferences, keynotes, panels and corporate events with multi-camera coverage and professional audio, then edits highlight videos your team can use to sell next year's tickets, thank sponsors and publish sessions online.",
    ],
    coverage: [
      "Full-length keynote and session recordings",
      "Multi-camera panel coverage with clean audio",
      "Highlight and sizzle recap videos",
      "Attendee and speaker interviews / testimonials",
      "Sponsor and exhibitor spotlight clips",
      "Social cut-downs for LinkedIn, Instagram & YouTube",
      "Live streaming for remote audiences",
    ],
    packages: videoPackages("confvideo"),
    pricingNote: CORPORATE_NOTE,
    faqs: [
      { q: "Can you take audio directly from the venue's AV system?", a: "Yes. Where the venue allows it we take a feed from the soundboard so recorded talks have clean audio, and we also run our own backup microphones." },
      { q: "Can you live stream our conference?", a: "Yes. We can live stream keynotes and sessions to your platform of choice. See our live stream service or request a corporate quote." },
      { q: "Can you deliver full session recordings as well as a recap video?", a: "Yes. Tell us which sessions need full-length recordings when you book or request a quote." },
      ...GENERAL_FAQS,
    ],
    images: IMG.conferenceVideo,
    local: true,
    related: ["conference-photography", "live-stream", "corporate-videography", "event-videography"],
  },
  {
    slug: "corporate-videography",
    name: "Corporate Videography",
    kind: "video",
    group: "corporate",
    pro: "Corporate Videographer",
    title: "Corporate Videographer | Company Event, Brand & Testimonial Videos",
    description:
      "Corporate videography for company events, brand stories, executive interviews, client testimonials and training videos. MacroSnaps crews across the US & Canada.",
    intro: [
      "Video is now the most-used format in B2B marketing, recruiting and internal communication. MacroSnaps films corporate events, executive interviews, customer testimonials, brand and culture videos and training content, with the same crew quality in every city where you operate.",
      "As part of MacroHype LLC, a digital media and marketing company working with businesses since 2011, our team plans, shoots and edits corporate video with your audience and channels in mind.",
    ],
    coverage: [
      "Company event & party recap videos",
      "Executive and leadership interviews",
      "Client testimonial & case-study videos",
      "Brand, culture and recruiting videos",
      "Training & internal communications",
      "Product launch & demo videos",
    ],
    packages: videoPackages("corpvideo"),
    pricingNote: CORPORATE_NOTE,
    faqs: [
      { q: "Do you help with planning and scripting?", a: "Yes. For brand, testimonial and training videos we can help with interview questions, shot lists and structure. Request a corporate quote and describe the project." },
      ...GENERAL_FAQS,
    ],
    images: IMG.corporate,
    local: true,
    related: ["commercial-videography", "conference-videography", "corporate-event-photography"],
  },
  // ───────────────────────── Events
  {
    slug: "event-photography",
    name: "Event Photography",
    kind: "photo",
    group: "corporate",
    pro: "Event Photographer",
    title: "Event Photographer | Corporate, Private & Social Event Photography",
    description:
      "Event photography for corporate events, galas, birthdays, Bar & Bat Mitzvahs, cultural celebrations and parties. Transparent prices from $300. Book online.",
    intro: [
      "There's nothing more beautiful than people cheering moments of small happiness and spreading smiles! We believe that those magical, intense and alluring moments of any event spent with friends, family and loved ones deserve to be captured, highlighted and presented to everyone as a showcase.",
      "We value the effort and time it took to put the whole plan together, from planning to execution, and we take it as our responsibility to help it shine forever. From corporate receptions and galas to birthdays, Bar and Bat Mitzvahs and cultural celebrations, MacroSnaps photographers cover events of every size.",
    ],
    coverage: [
      "Corporate events & receptions",
      "Galas, fundraisers & award nights",
      "Birthday & anniversary parties",
      "Bar & Bat Mitzvahs",
      "Indian, South Asian & cultural celebrations",
      "Gender reveals & baby showers",
      "Holiday parties",
      "Community & nonprofit events",
    ],
    packages: EVENT_PHOTO,
    pricingNote: CORPORATE_NOTE,
    faqs: GENERAL_FAQS,
    images: IMG.event,
    local: true,
    related: ["event-videography", "corporate-event-photography", "photo-booth", "conference-photography"],
  },
  {
    slug: "event-videography",
    name: "Event Videography",
    kind: "video",
    group: "corporate",
    pro: "Event Videographer",
    title: "Event Videographer | Conferences, Galas & Celebrations",
    description:
      "Professional event videography nationwide: conference recap videos, keynote recordings, galas, Bar Mitzvahs, Indian events and parties. From $450.",
    intro: [
      "Our experienced videographers will work with you to understand your vision for the event and create a customized video that showcases the joy and anticipation of the occasion.",
      "Our versatile approach captures a wide range of events beyond weddings. From birthdays to corporate events, our team of experienced videographers can expertly document the unique story and atmosphere of your event.",
    ],
    sections: [
      { heading: "Gender Reveal", body: "Our experienced videographers will work with you to understand your vision for the event and create a customized video that showcases the joy and anticipation of this special occasion. With high-quality equipment and expert editing, we deliver a beautiful and timeless keepsake that you and your family will cherish for years to come." },
      { heading: "Birthday Parties", body: "At MacroSnaps, we love capturing the joy and excitement of birthday parties. From the decorations and cake to the laughter and dancing, we make sure that every aspect of your special day is documented in a beautiful and timeless manner." },
      { heading: "Other Events", body: "From birthdays to corporate events, our team of experienced photographers and videographers can expertly document the unique story and atmosphere of your event. Let us preserve your precious memories and bring your event to life through our lens." },
    ],
    coverage: ["Conference & keynote recordings", "Gala & award night videos", "Birthday & milestone parties", "Bar & Bat Mitzvahs", "Cultural & Indian events", "Gender reveals"],
    packages: EVENT_VIDEO,
    pricingNote: CORPORATE_NOTE,
    faqs: GENERAL_FAQS,
    images: IMG.event,
    local: true,
    related: ["event-photography", "conference-videography", "live-stream"],
  },
  // ───────────────────────── Weddings
  {
    slug: "wedding-photography",
    name: "Wedding Photography",
    kind: "photo",
    group: "wedding",
    pro: "Wedding Photographer",
    title: "Affordable Wedding Photographers | MacroSnaps Captures Perfect Moments",
    description:
      "Affordable wedding photographers for ceremonies, receptions, elopements and courthouse weddings across the US & Canada. Packages from $350. Book online.",
    intro: [
      "Wedding; the special day to celebrate two souls building a sweet bond of forever and vowing to be beside each other for eternity as they both whisper “I Do” in the midst of a teary-eyed crowd. Every emotion, every expression of happiness and excitement that fills the air at that second is a moment we treasure and pledge to capture.",
      "As a couple's big day approaches, they want to ensure that every aspect of their wedding is captured perfectly, including the photography. That's where MacroSnaps comes in. Our wedding photography services offer a comprehensive solution to capturing beautiful, timeless memories of your special day.",
    ],
    coverage: ["Getting ready & details", "Ceremony", "Family formals & bridal party", "Couple portraits", "Reception, speeches & first dance", "Courthouse & city hall weddings", "Elopements & micro-weddings", "Cultural & multi-day weddings"],
    packages: WEDDING_PHOTO,
    pricingNote: "Need a second photographer or a full-day package? Call us or request a quote.",
    faqs: [
      { q: "Can you photograph a courthouse or city hall wedding?", a: "Yes. Our 2-hour package is popular for courthouse and city hall weddings, including portraits nearby afterwards." },
      { q: "Can we book photography and videography together?", a: "Yes. Many couples book both; book each service online or call us and we will coordinate one crew." },
      ...GENERAL_FAQS,
    ],
    images: IMG.wedding,
    local: true,
    related: ["wedding-videography", "engagement-photography", "photo-booth", "live-stream"],
  },
  {
    slug: "wedding-videography",
    name: "Wedding Videography",
    kind: "video",
    group: "wedding",
    pro: "Wedding Videographer",
    title: "Wedding Videographer | Cinematic Wedding Films",
    description:
      "Wedding videography: cinematic HD highlight films of your ceremony and reception, with music of your choice. MacroSnaps videographers across the US & Canada.",
    intro: [
      "Our videographers capture your remarkable stories in breathtaking cinematic HD videos.",
      "From vows and speeches to the first dance, MacroSnaps wedding videographers film the day as it unfolds and edit a highlight film set to the music you choose, with raw footage available on request.",
    ],
    coverage: ["Ceremony & vows", "Speeches & toasts", "First dance & reception", "Cinematic highlight film", "Live streaming for remote guests"],
    packages: videoPackages("weddingvideo"),
    faqs: [
      { q: "Can you live stream our wedding?", a: "Yes. Our wedding live streaming lets family and friends who can't attend watch your ceremony in HD from anywhere. We send you a private link to share with guests." },
      ...GENERAL_FAQS,
    ],
    images: IMG.wedding,
    local: true,
    related: ["wedding-photography", "engagement-videography", "live-stream"],
  },
  {
    slug: "engagement-photography",
    name: "Engagement Photography",
    kind: "photo",
    group: "wedding",
    pro: "Engagement Photographer",
    title: "Engagement Photographer | Engagement & Proposal Photos",
    description: "Engagement and proposal photography at iconic locations near you. Retouched high-resolution photos delivered in 1 week. Book online with MacroSnaps.",
    intro: [
      "A lifetime memory, a gift from us to you, that holds the beauty of affection and love between you and your significant other on a momentous occasion, a step that brings you closer to your wedding vows.",
      "Our seasoned professionals help choose the location and light, plan secret proposals, and guide you through natural poses so your engagement photos feel like you.",
    ],
    coverage: ["Engagement sessions", "Surprise proposals", "Save-the-date photos", "Couples portraits"],
    packages: [],
    faqs: GENERAL_FAQS,
    images: IMG.engagement,
    local: false,
    related: ["wedding-photography", "engagement-videography"],
  },
  {
    slug: "engagement-videography",
    name: "Engagement Videography",
    kind: "video",
    group: "wedding",
    pro: "Engagement Videographer",
    title: "Engagement & Proposal Videographer",
    description: "Engagement and proposal videography — a cinematic keepsake of your love story. MacroSnaps videographers across the US & Canada.",
    intro: [
      "A stunning and emotional documentation of a couple's unique love story. We capture the special moments, candid and posed shots, and create a cherished keepsake for the couple and their loved ones.",
    ],
    coverage: ["Surprise proposals", "Engagement films", "Save-the-date videos"],
    packages: [],
    faqs: GENERAL_FAQS,
    images: IMG.engagement,
    local: false,
    related: ["engagement-photography", "wedding-videography"],
  },
  // ───────────────────────── Business
  {
    slug: "commercial-photography",
    name: "Commercial Photography",
    kind: "photo",
    group: "business",
    pro: "Commercial Photographer",
    title: "Commercial Photographer | Brand, Product & Marketing Photography",
    description: "Commercial photography for websites, social media and advertising: products, services, teams and locations. MacroSnaps, part of MacroHype LLC.",
    intro: [
      "Whether you're looking for photos to utilize on your company website, for social media, or in an advertisement, MacroSnaps offers a wide variety of product placement photography. Our team of creative photographers is here to create unique and focused imagery to showcase your products or services for your target audience.",
    ],
    coverage: ["Brand & lifestyle photography", "Website & social media imagery", "Advertising campaigns", "Workplace & team photos"],
    packages: [],
    faqs: GENERAL_FAQS,
    images: IMG.commercial,
    local: false,
    related: ["product-photography", "commercial-videography", "food-photography", "corporate-event-photography"],
  },
  {
    slug: "commercial-videography",
    name: "Commercial Videography",
    kind: "video",
    group: "business",
    pro: "Commercial Videographer",
    title: "Commercial Videographer | Brand & Advertising Video Production",
    description: "Commercial video production for brands: ads, product videos and brand stories that build recognition. MacroSnaps, part of MacroHype LLC.",
    intro: [
      "Video commercials give good brand recognition and increase your brand identity in the marketplace. The commercial productions we create are often the main content in many of our clients' advertising campaigns.",
    ],
    coverage: ["TV & online ads", "Brand story videos", "Product videos", "Social media content"],
    packages: [],
    faqs: GENERAL_FAQS,
    images: IMG.commercial,
    local: false,
    related: ["corporate-videography", "commercial-photography", "video-editing"],
  },
  {
    slug: "product-photography",
    name: "Product Photography",
    kind: "photo",
    group: "business",
    pro: "Product Photographer",
    title: "Product Photographer | E-commerce & Lifestyle Product Photos",
    description: "Product photography for e-commerce, Amazon listings, catalogs and ads — studio and lifestyle shots with professional retouching.",
    intro: ["Clean, consistent product images sell. MacroSnaps has photographed products for clients' websites and campaigns as part of MacroHype LLC since 2011, with white-background e-commerce shots, lifestyle scenes and detail images retouched for every channel."],
    coverage: ["White-background e-commerce photos", "Lifestyle product scenes", "Amazon & marketplace listings", "Catalog & lookbook images"],
    packages: [],
    faqs: GENERAL_FAQS,
    images: IMG.commercial,
    local: false,
    related: ["commercial-photography", "photo-retouching", "food-photography"],
  },
  {
    slug: "food-photography",
    name: "Food Photography",
    kind: "photo",
    group: "business",
    pro: "Food Photographer",
    title: "Food Photographer | Restaurant & Menu Photography",
    description: "Food and restaurant photography for menus, delivery apps, websites and social media.",
    intro: ["Great food photography fills tables. We photograph dishes, drinks, interiors and chefs for menus, delivery apps, websites and social media, styled and lit to make every plate look as good as it tastes."],
    coverage: ["Menu & dish photography", "Delivery app images", "Restaurant interiors", "Chef & team portraits"],
    packages: [],
    faqs: GENERAL_FAQS,
    images: IMG.commercial,
    local: false,
    related: ["commercial-photography", "product-photography"],
  },
  {
    slug: "real-estate-photography",
    name: "Real Estate Photography",
    kind: "photo",
    group: "business",
    pro: "Real Estate Photographer",
    title: "Real Estate Photographer | Listing Photos That Sell",
    description: "Professional, high-definition, fully retouched real estate photography for listings, rentals and commercial property.",
    intro: [
      "We understand we are in charge of not just amazing photos, but of marketing your home, property or ranch in the best way possible to get that property sold. MacroSnaps promises professional, high-definition and fully retouched photos in the most convenient way. Captivate more business, win more clients and sell more property with our professional services.",
    ],
    coverage: ["Residential listings", "Rentals & Airbnb", "Commercial property", "Twilight & exterior photos"],
    packages: [],
    faqs: GENERAL_FAQS,
    images: IMG.realEstate,
    local: false,
    related: ["real-estate-videography", "virtualtours"],
  },
  {
    slug: "real-estate-videography",
    name: "Real Estate Videography",
    kind: "video",
    group: "business",
    pro: "Real Estate Videographer",
    title: "Real Estate Videographer | Property Tour Videos",
    description: "Real estate videography: property walkthroughs, agent brand videos and listing clips.",
    intro: ["The savviest real estate agents are embracing the power of video: showing their personality in brand videos and introducing their properties in engaging clips."],
    coverage: ["Property walkthrough videos", "Agent brand videos", "Social listing clips"],
    packages: [],
    faqs: GENERAL_FAQS,
    images: IMG.realEstate,
    local: false,
    related: ["real-estate-photography", "virtualtours"],
  },
  {
    slug: "music-videography",
    name: "Music Videography",
    kind: "video",
    group: "business",
    pro: "Music Videographer",
    title: "Music Video Production",
    description: "Music video production for artists and bands — concept, filming and editing.",
    intro: ["From concept to final cut, MacroSnaps shoots and edits music videos and performance content for independent artists, bands and labels."],
    coverage: ["Performance videos", "Narrative music videos", "Live session recordings"],
    packages: [],
    faqs: GENERAL_FAQS,
    images: IMG.event,
    local: false,
    related: ["video-editing", "commercial-videography"],
  },
  // ───────────────────────── Personal
  {
    slug: "family-photography",
    name: "Family Photography",
    kind: "photo",
    group: "personal",
    pro: "Family Photographer",
    title: "Family Photographer | Family Portraits",
    description: "Family portrait sessions outdoors or at home. Retouched high-resolution photos delivered in an online gallery.",
    intro: ["What can be more beautiful than a group of people who complete a whole and are so much in love that they're ready to do anything for each other? MacroSnaps adores what a family is to one another; we capture that love and affection, a priceless bond, and immortalize the moments of happiness spent together in frames."],
    coverage: ["Outdoor family portraits", "In-home sessions", "Holiday card photos", "Extended family reunions"],
    packages: [],
    faqs: GENERAL_FAQS,
    images: IMG.personal,
    local: false,
    related: ["maternity-photography", "newborn-photography"],
  },
  {
    slug: "maternity-photography",
    name: "Maternity Photography",
    kind: "photo",
    group: "personal",
    pro: "Maternity Photographer",
    title: "Maternity Photographer | Maternity Photo Sessions",
    description: "Maternity photo sessions celebrating moms-to-be, outdoors or in studio.",
    intro: ["Maternity photos serve as a reminder of the time when a life is growing inside another life, something that sounds so magical and challenging. We capture that enchanting period for mothers-to-be, and create pictures that remind you of the excitement and joy that comes with bringing your child into the world."],
    coverage: ["Outdoor maternity sessions", "Studio maternity portraits", "Couples maternity photos"],
    packages: [],
    faqs: GENERAL_FAQS,
    images: IMG.personal,
    local: false,
    related: ["newborn-photography", "family-photography"],
  },
  {
    slug: "newborn-photography",
    name: "Newborn Photography",
    kind: "photo",
    group: "personal",
    pro: "Newborn Photographer",
    title: "Newborn Photographer | Newborn Portraits",
    description: "Newborn portraits in the first weeks of life, at home or in studio.",
    intro: ["We never realize how fast children grow. One day they're learning to walk and the next they're making career choices on their own. MacroSnaps is the perfect partner to photograph your little sunshine and capture them beautifully in the first weeks of their life."],
    coverage: ["In-home newborn sessions", "Family with newborn", "Milestone portraits"],
    packages: [],
    faqs: GENERAL_FAQS,
    images: IMG.personal,
    local: false,
    related: ["maternity-photography", "family-photography"],
  },
  {
    slug: "graduation-photography",
    name: "Graduation Photography",
    kind: "photo",
    group: "personal",
    pro: "Graduation Photographer",
    title: "Graduation Photographer | Cap & Gown Photos",
    description: "Graduation portraits and ceremony photography on campus or at landmarks near you.",
    intro: ["Your graduation photographs will always be a nostalgic record of probably the greatest time of your life, and ought to be something shared and valued before you set out on the next big step of your journey. Our task is to photograph this special occasion as evidence of your growth as an independent adult and your higher education."],
    coverage: ["Cap & gown portraits", "Campus sessions", "Graduation ceremonies & parties"],
    packages: [],
    faqs: GENERAL_FAQS,
    images: IMG.personal,
    local: false,
    related: ["event-photography", "family-photography"],
  },
  {
    slug: "dating-photography",
    name: "Dating Photography",
    kind: "photo",
    group: "personal",
    pro: "Dating Profile Photographer",
    title: "Dating Profile Photographer | Online Dating Photos",
    description: "Natural, flattering online dating profile photos that help you stand out on dating apps.",
    intro: [
      "MacroSnaps specializes in making sure that not only are you seen in the best light but also that the most honest version of you shines like a diamond from every angle, because YOU are the moment for us.",
      "Our online dating photographers create natural, flattering profile photos that help you stand out on dating apps, with sessions in Washington DC, New York, Boston and cities across the US.",
    ],
    coverage: ["Dating app profile photos", "Outdoor lifestyle portraits", "Multiple outfits & locations"],
    packages: [],
    faqs: GENERAL_FAQS,
    images: IMG.personal,
    local: false,
    related: ["family-photography", "graduation-photography"],
  },
  // ───────────────────────── Other services
  {
    slug: "live-stream",
    name: "Live Streaming",
    kind: "other",
    group: "corporate",
    pro: "Live Streaming Crew",
    title: "Live Streaming Services | Conferences, Events & Weddings",
    description: "Multi-camera live streaming for conferences, corporate events, town halls and weddings, to YouTube, Zoom, LinkedIn, Vimeo or a private link.",
    intro: [
      "Bring remote audiences into the room. MacroSnaps live streams keynotes, panels, town halls, product launches and weddings with multiple cameras and clean audio, to YouTube, LinkedIn, Facebook, Zoom, Vimeo or a private link.",
      "Our wedding live streaming lets family and friends who can't attend watch your ceremony in HD from anywhere.",
    ],
    coverage: ["Conference & keynote streams", "Hybrid events & town halls", "Wedding ceremony streams", "Recording of the full stream"],
    packages: [],
    pricingNote: CORPORATE_NOTE,
    faqs: GENERAL_FAQS,
    images: IMG.conferenceVideo,
    local: false,
    related: ["conference-videography", "event-videography", "wedding-videography"],
  },
  {
    slug: "photo-booth",
    name: "Photo Booth",
    kind: "other",
    group: "corporate",
    pro: "Photo Booth",
    title: "Photo Booth Rental | Corporate Events, Weddings & Parties",
    description: "Photo booth rental with branded templates for corporate events, trade shows, weddings and parties.",
    intro: ["A branded photo booth keeps guests engaged and puts your logo in every shared photo. We bring the booth, lighting, props and an attendant, with custom templates for corporate events, trade shows, weddings and parties."],
    coverage: ["Branded print & digital templates", "Instant sharing", "Props & backdrops", "Booth attendant"],
    packages: [],
    faqs: GENERAL_FAQS,
    images: IMG.event,
    local: false,
    related: ["event-photography", "corporate-event-photography", "wedding-photography"],
  },
  {
    slug: "video-editing",
    name: "Video Editing",
    kind: "other",
    group: "post",
    pro: "Video Editor",
    title: "Video Editing Services",
    description: "Professional video editing for event recaps, corporate videos, social content and YouTube.",
    intro: ["Already have footage? Our editors cut event recaps, corporate videos, social clips and YouTube content, with color correction, audio clean-up, graphics and captions."],
    coverage: ["Event & conference recaps", "Social media cut-downs", "Color grading & audio mixing", "Captions & motion graphics"],
    packages: [],
    faqs: GENERAL_FAQS,
    images: IMG.conferenceVideo,
    local: false,
    related: ["photo-retouching", "commercial-videography"],
  },
  {
    slug: "photo-retouching",
    name: "Photo Retouching",
    kind: "other",
    group: "post",
    pro: "Photo Retoucher",
    title: "Photo Retouching Services",
    description: "Professional photo retouching: commercial and product retouching, portrait retouching, color grading and advanced Photoshop editing with fast turnaround.",
    intro: ["Our professional photo retouching services cover commercial and product retouching, model and portrait retouching, photo correction, color grading and advanced Photoshop editing. Brands, photographers and agencies send us images from anywhere, and we return polished files with a fast turnaround."],
    coverage: ["Product & commercial retouching", "Portrait & model retouching", "Color grading", "Background removal & compositing"],
    packages: [],
    faqs: GENERAL_FAQS,
    images: IMG.commercial,
    local: false,
    related: ["video-editing", "product-photography"],
  },
  {
    slug: "virtualtours",
    name: "3D Virtual Tours",
    kind: "other",
    group: "business",
    pro: "3D Virtual Tour Provider",
    title: "3D & 360° Virtual Tours | Matterport",
    description: "Matterport 3D and 360-degree virtual tours for real estate, venues, restaurants, offices and commercial spaces.",
    intro: ["We provide Matterport 3D virtual tours and 360-degree virtual tour services for real estate, venues, restaurants, offices and commercial spaces. Tours work on phones, tablets, desktops and VR headsets, and can be embedded on your website or listing."],
    coverage: ["Matterport 3D tours", "360° virtual tours", "Venue & event space tours", "Google Street View"],
    packages: [],
    faqs: GENERAL_FAQS,
    images: IMG.realEstate,
    local: false,
    related: ["real-estate-photography", "real-estate-videography"],
  },
];

// ── Real prices from macrosnaps.com, applied per service
const NEWBORN = simple("newborn", [
  ["In-Studio Newborn", 50, ["1 portrait", "5 minute session", "Choose from 3-10 shots"]],
  ["In-Studio Newborn (5 Portraits)", 100, ["5 portraits", "15 minute session", "Choose from 10-20 shots"]],
  ["In-Studio Sleeping Newborn", 150, ["10 portraits", "30 minute session", "Choose from 20-40 shots"]],
  ["In-Studio Newborn Baby", 200, ["20 portraits", "1 hour session", "Choose from 40-100 shots"]],
  ["In-Studio Mother and Baby", 275, ["40 portraits", "2 hour session", "Choose from 100-200 shots"]],
  ["We Come To You: Newborn", 200, ["10 portraits", "30 minutes", "Client provides props"]],
  ["We Come To You: Mother & Baby", 225, ["20 portraits", "1 hour session", "Client provides props"]],
  ["We Come To You: Siblings", 300, ["40 portraits", "2 hour session", "Client provides props"]],
]);
const PRICES: Record<string, Package[]> = {
  "engagement-photography": photoPackages([350, 450, 550, 650, 750, 850], "engagement"),
  "engagement-videography": videoPackages("engvideo"),
  "wedding-videography": videoPackages("weddingvideo", [500, 700, 900, 1250, 1450, 1650]),
  "commercial-videography": videoPackages("comvideo"),
  "music-videography": videoPackages("musicvideo"),
  "real-estate-videography": videoPackages("revideo", [350, 500, 650, 800, 950, 1100]),
  "commercial-photography": SESSION_PHOTO("commercial"),
  "product-photography": SESSION_PHOTO("product"),
  "photo-booth": simple("booth", [
    ["1 Hour Photo Booth", 200, ["Photo booth & attendant", "1 hour", "Digital copies of every photo"]],
    ["2 Hour Photo Booth", 300, ["Photo booth & attendant", "2 hours", "Digital copies of every photo"]],
    ["3 Hour Photo Booth", 400, ["Photo booth & attendant", "3 hours", "Digital copies of every photo"]],
  ]),
  "maternity-photography": PORTRAITS("maternity"),
  "graduation-photography": PORTRAITS("graduation"),
  "family-photography": simple("family", [
    ["30 Minute Session", 200, ["30 minute family session", "Retouched, high-resolution photos", "Online gallery"]],
    ["2 Hour Session", 300, ["2 hour family session", "Retouched, high-resolution photos", "Online gallery"]],
    ["3 Hour Session", 400, ["3 hour family session", "Retouched, high-resolution photos", "Online gallery"]],
  ]),
  "dating-photography": simple("dating", [
    ["15 Minute Studio Session", 100, ["5 retouched portraits", "In studio"]],
    ["1 Hour Session", 200, ["Outdoor portraits", "1 hour session"]],
    ["2 Hour Session", 300, ["Outdoor portraits", "2 hour session", "Multiple outfits & locations"]],
  ]),
  "newborn-photography": NEWBORN,
  virtualtours: simple("tour", [
    ["Up to 1,000 sq ft", 200, ["Matterport 3D tour", "1 month hosting included", "$10/month hosting to keep the tour active"]],
    ["1,000 - 2,499 sq ft", 300, ["Matterport 3D tour", "1 month hosting included", "$10/month hosting to keep the tour active"]],
    ["2,500 - 4,999 sq ft", 400, ["Matterport 3D tour", "1 month hosting included", "$10/month hosting to keep the tour active"]],
    ["5,000 - 7,499 sq ft", 500, ["Matterport 3D tour", "1 month hosting included", "$10/month hosting to keep the tour active"]],
    ["7,500 - 10,000 sq ft", 600, ["Matterport 3D tour", "1 month hosting included", "$10/month hosting to keep the tour active"]],
  ]),
  "photo-retouching": [
    { id: "retouch-solo", name: "Solo", price: 25, priceNote: "per picture", quoteOnly: true, features: ["Clipping paths, cropping, layout and essential editing", "Minimum 5 pictures", "Turnaround 48-72 hours", "No contracts"] },
    { id: "retouch-pro", name: "Professional", price: 10, priceNote: "per picture", quoteOnly: true, features: ["Advanced editing & color matching", "Best for studios, salons and skincare clinics"] },
    { id: "retouch-enterprise", name: "Enterprise", price: 3, priceNote: "per picture, as low as", quoteOnly: true, features: ["High-volume brands, retailers and studios", "Magazines, corporations and large photographers"] },
  ],
  "video-editing": [
    { id: "editing-monthly", name: "Video Editing Plan", price: 699, priceNote: "per month", quoteOnly: true, features: ["Brand templates & stock videos", "Proof-read captions", "Up to 10 assets per order", "Friendly customer support"] },
  ],
};
for (const s of SERVICES) {
  if (PRICES[s.slug]) s.packages = PRICES[s.slug];
  s.images = imagesForService(s.slug, s.images);
}

/** City hub "services" — /photographers/{city} and /videographers/{city}. */
export const HUBS = {
  photographers: { slug: "photographers", name: "Photography", pro: "Photographer", kind: "photo" as const },
  videographers: { slug: "videographers", name: "Videography", pro: "Videographer", kind: "video" as const },
};

export const getService = (slug: string) => SERVICES.find((s) => s.slug === slug);
export const LOCAL_SERVICES = SERVICES.filter((s) => s.local);
export const BOOKABLE_SERVICES = SERVICES.filter((s) => s.packages.some((p) => !p.quoteOnly));
export const LOCAL_SLUGS = ["photographers", "videographers", ...LOCAL_SERVICES.map((s) => s.slug)];

export function findPackage(serviceSlug: string, packageId: string) {
  return getService(serviceSlug)?.packages.find((p) => p.id === packageId);
}
