export type Vertical = {
  slug: string; // kebab-case, e.g. "dental-clinics"
  kind: "industry" | "solution";
  name: string; // short menu label, e.g. "Dental Clinics"
  h1: string; // e.g. "Photography & Video for Dental Clinics"
  title: string; // meta title
  description: string; // meta description
  eyebrow: string; // short kicker above H1
  intro: string[]; // 2-3 paragraphs
  challenges: { title: string; body: string }[]; // exactly 3: what this business needs / why visuals matter
  deliverables: { title: string; body: string }[]; // exactly 6: specific photos & videos we create
  uses: string[]; // 6-9 places the content gets used
  services: string[]; // 2-4 service slugs, most relevant first
  faqs: { q: string; a: string }[]; // 4-5, specific to this vertical
  macrohype: string; // 1-2 sentences on how MacroHype helps for this vertical
  related: string[]; // 3 other vertical slugs from this same file
  imageSet: "commercial" | "conference" | "corporate" | "event" | "wedding" | "personal" | "realEstate";
};

export const VERTICALS: Vertical[] = [
  // ---------------------------------------------------------------------------
  // INDUSTRIES
  // ---------------------------------------------------------------------------
  {
    slug: "dental-clinics",
    kind: "industry",
    name: "Dental Clinics",
    h1: "Photography & Video for Dental Clinics",
    title: "Dental Clinic Photography & Video | MacroSnaps",
    description:
      "Photos and video for dental clinics: dentist headshots, office and operatory photos, team portraits and patient-friendly videos for your website and ads.",
    eyebrow: "Dental marketing visuals",
    intro: [
      "Most new patients choose a dentist after looking at a website, a Google listing and a few reviews. Real photos of your dentists, your hygienists and your treatment rooms answer the questions people have before they call: Is this office clean and modern? Will the staff be kind? Will I feel comfortable in that chair? Stock images of smiling models do not answer any of them.",
      "MacroSnaps sends our own photographers and videographers to your practice to capture the people, rooms and equipment that make your clinic what it is. We work around your patient schedule, often before opening, at lunch or after hours, so the shoot does not interrupt care. The crew brings its own lighting and backdrops and works from a shot list we agree on with you before the visit.",
      "We only photograph staff and patients who have agreed to be on camera, and we frame shots to keep charts, screens and other identifiable patient information out of view. Edited photos arrive in about a week and finished video in two to four weeks. You book and pay online, every shoot is fully insured, and the files are yours to use on your website, listings and ads.",
    ],
    challenges: [
      {
        title: "Patients are nervous before they arrive",
        body: "Dental anxiety is common. Warm, honest photos of your team and a short welcome video help a first-time patient know what to expect and make the first call easier.",
      },
      {
        title: "Your technology is hard to show",
        body: "Intraoral scanners, digital X-ray, same-day crowns and modern sterilization are real reasons to choose a practice, but they need clear, well-lit photos and video to make sense to a patient.",
      },
      {
        title: "Privacy comes first",
        body: "Clinical spaces are full of screens, charts and people who did not ask to be photographed. We plan the shot list with you, use consenting staff or volunteers, and keep patient information out of frame.",
      },
    ],
    deliverables: [
      {
        title: "Dentist and staff headshots",
        body: "Consistent, approachable portraits of each dentist, hygienist and front-desk team member for your About page, Google profile and insurance directories.",
      },
      {
        title: "Office and operatory photos",
        body: "Reception, waiting area, treatment rooms and sterilization area, photographed clean and bright so patients see the space before they visit.",
      },
      {
        title: "Technology and procedure close-ups",
        body: "Detail shots of scanners, imaging equipment and chairside work, staged with staff so no patient is identifiable.",
      },
      {
        title: "Dentist introduction video",
        body: "A one- to two-minute video of the dentist explaining their approach to care, filmed in your office for the homepage and Google profile.",
      },
      {
        title: "Patient testimonial videos",
        body: "Short interviews with patients who volunteer to share their experience, filmed with signed consent and without clinical details.",
      },
      {
        title: "Social clips and ad spots",
        body: "Vertical clips for Instagram, Facebook and TikTok, plus 15- and 30-second ads for YouTube, Google and local TV.",
      },
    ],
    uses: [
      "Website & landing pages",
      "Google Business Profile",
      "Insurance and dentist directories",
      "Facebook & Instagram ads",
      "YouTube & Google ads",
      "Local TV commercials",
      "Patient welcome emails",
      "Printed brochures and signage",
    ],
    services: ["commercial-photography", "commercial-videography", "photo-retouching", "video-editing"],
    faqs: [
      {
        q: "Do you photograph real patients?",
        a: "Only patients who agree to it and sign a release, which your office collects. Many practices use staff or friends as models for chairside shots. Either way, we keep charts, screens and other identifiable patient information out of the frame.",
      },
      {
        q: "Can you shoot without closing the office?",
        a: "Yes. Most dental shoots happen before opening, during a blocked lunch hour or after the last patient. A typical practice needs two to four hours to cover headshots, rooms and a short video interview.",
      },
      {
        q: "What does a dental photo shoot cost?",
        a: "Photography is $250 for the first hour and $100 for each additional hour, with a two-hour minimum, so a shoot starts at $350. Video is $300 for the first hour and $200 for each additional hour. Bigger ad productions get a custom quote.",
      },
      {
        q: "Can you make a TV commercial for our practice?",
        a: "Yes. We produce broadcast-ready commercials for local TV along with versions for YouTube, Google, Facebook and Instagram. We handle the production; airtime is booked separately with the station or your media buyer.",
      },
      {
        q: "How soon will we get the photos?",
        a: "Edited photos are delivered in about one week. Edited videos usually take two to four weeks, depending on length and revisions.",
      },
    ],
    macrohype:
      "If your practice also needs a new website, Google Ads or local SEO, our sister agency MacroHype builds dental websites and runs patient acquisition campaigns that put these photos and videos to work.",
    related: ["medical-practices", "testimonial-videos", "team-headshots"],
    imageSet: "commercial",
  },
  {
    slug: "medical-practices",
    kind: "industry",
    name: "Medical & Wellness Practices",
    h1: "Photography & Video for Medical & Wellness Practices",
    title: "Medical & Wellness Practice Photography | MacroSnaps",
    description:
      "Photos and video for med spas, chiropractors, physical therapy and medical practices: provider portraits, clinic photos, treatment videos and ad content.",
    eyebrow: "Med spas, chiropractic & PT",
    intro: [
      "Med spas, chiropractic offices, physical therapy clinics and private medical practices all sell trust. A prospective patient wants to see who will treat them, what the space looks like and how a session actually works. Real photos and video show that far better than a paragraph of text or a stock image that appears on a dozen other sites.",
      "MacroSnaps photographers and videographers come to your clinic and capture providers, treatment rooms, equipment and the flow of a visit. For med spas we photograph the setting, the products and the experience. For chiropractic and physical therapy we film adjustments, exercises and equipment so patients understand what to expect before their first appointment, and we keep the shoot schedule tight so it fits between patients.",
      "We only photograph staff and patients who have consented, and we keep screens, charts and identifiable patient information out of every frame. Many clinics use staff or models for treatment shots. Photos arrive in about a week and videos in two to four weeks, ready for your website, booking pages, Google profile and ad campaigns on social media, YouTube and local TV.",
    ],
    challenges: [
      {
        title: "Treatments are hard to picture",
        body: "Most people have never seen a microneedling session, a spinal decompression table or a PT evaluation. Clear photos and short videos remove the guesswork that keeps them from booking.",
      },
      {
        title: "Competing on more than price",
        body: "Wellness markets are crowded and promotions are easy to copy. Showing your providers, your space and the care you take is what sets a practice apart.",
      },
      {
        title: "Patient privacy on camera",
        body: "We plan the shoot with your team, use consenting staff or models for treatment shots, and avoid any identifiable patient information.",
      },
    ],
    deliverables: [
      {
        title: "Provider portraits",
        body: "Headshots and environmental portraits of physicians, nurse practitioners, injectors, chiropractors and therapists.",
      },
      {
        title: "Clinic and treatment room photos",
        body: "Reception, private rooms, gym floors and equipment, lit and framed to show a clean, comfortable space.",
      },
      {
        title: "Treatment demonstration video",
        body: "Short walkthroughs of popular services, filmed with consenting models so patients know what a session looks like.",
      },
      {
        title: "Provider explainer videos",
        body: "Practitioners answering common questions on camera, ready for your website, YouTube and social channels.",
      },
      {
        title: "Product and retail photos",
        body: "Clean product shots of the skincare, supplements or recovery tools you sell in the clinic or online.",
      },
      {
        title: "Ad spots and social clips",
        body: "Vertical Reels and TikToks plus 15- and 30-second ads for Facebook, Instagram, YouTube, Google and local TV.",
      },
    ],
    uses: [
      "Website & service pages",
      "Google Business Profile",
      "Booking platform listings",
      "Facebook & Instagram ads",
      "YouTube & Google ads",
      "TikTok & Instagram Reels",
      "Local TV commercials",
      "Email newsletters",
    ],
    services: ["commercial-photography", "commercial-videography", "product-photography", "video-editing"],
    faqs: [
      {
        q: "Can you photograph before-and-after results?",
        a: "We can photograph consenting clients under consistent lighting so results are comparable. Your practice collects the releases and decides what is appropriate to publish under the rules that apply to your field.",
      },
      {
        q: "How do you handle patient privacy?",
        a: "We photograph only staff and patients who have agreed to be on camera, and we keep charts, monitors and other identifiable patient information out of view. Many clinics use staff or models for treatment shots.",
      },
      {
        q: "How long should we book?",
        a: "Two to three hours covers provider headshots and clinic photos for most practices. Add time if you want treatment videos or interviews. Photography starts at $350 for two hours; video starts at $500.",
      },
      {
        q: "Do you work with multi-location practices?",
        a: "Yes. Our photographers and videographers work across the US, Ontario and Quebec, so we can give every location the same look and shot list.",
      },
    ],
    macrohype:
      "MacroHype, our sister agency, builds websites and runs Google, Facebook and Instagram campaigns for med spas and clinics, so the new photos and videos go straight into pages and ads that bring in bookings.",
    related: ["dental-clinics", "fitness-gyms", "salons-beauty"],
    imageSet: "commercial",
  },
  {
    slug: "restaurants",
    kind: "industry",
    name: "Restaurants & Cafés",
    h1: "Photography & Video for Restaurants & Cafés",
    title: "Restaurant & Café Photography and Video | MacroSnaps",
    description:
      "Food photography and video for restaurants and cafés: dish photos, menus, delivery app images, interiors, chef stories and ads for social and local TV.",
    eyebrow: "Food, menus & dining rooms",
    intro: [
      "People decide where to eat with their eyes, usually on a phone. Your photos on Google, Instagram, Uber Eats and your own website do the work a host and a menu used to do. When the dishes look flat or the only interior shot is a dim phone photo, guests pick the place down the street.",
      "MacroSnaps food photographers and videographers come to your restaurant or caf\u00e9 and shoot your actual dishes, drinks, dining room and team. We work with your kitchen to plate each item, light it properly and capture it quickly, so food goes from the pass to the camera while it still looks fresh. Most shoots happen before opening or between lunch and dinner service.",
      "The same visit can produce menu photos, delivery app images, interior shots, a chef story video and short clips for Instagram and TikTok. We also produce ad spots for Facebook, Instagram, YouTube and Google, plus broadcast-ready commercials for local TV. Edited photos arrive in about a week and videos in two to four weeks, so new dishes can go live quickly.",
    ],
    challenges: [
      {
        title: "Delivery apps reward good photos",
        body: "On Uber Eats, DoorDash and Grubhub, the photo is often the only thing a customer sees before ordering. Every item needs a clear, appetizing image in the right format.",
      },
      {
        title: "Menus change often",
        body: "Seasonal dishes, specials and new cocktails need fresh photos. A repeatable lighting setup keeps new shots consistent with the ones you already have.",
      },
      {
        title: "The room sells the reservation",
        body: "For date nights, private events and brunch crowds, guests want to see the atmosphere: the bar, the patio, the lighting at dinner. That takes more than a quick phone photo.",
      },
    ],
    deliverables: [
      {
        title: "Dish and drink photos",
        body: "Hero shots and overhead flat-lays of every menu item, cocktail and dessert, styled with your kitchen and bar staff.",
      },
      {
        title: "Delivery app image sets",
        body: "Clean, consistently lit photos cropped to the specs for Uber Eats, DoorDash, Grubhub and your online ordering system.",
      },
      {
        title: "Interior and exterior photos",
        body: "Dining room, bar, patio, private event space and storefront, shot during golden hour or set for service.",
      },
      {
        title: "Chef and team stories",
        body: "Portraits and short documentary-style videos of your chef, owners and staff talking about the food and the place.",
      },
      {
        title: "Kitchen action video",
        body: "Searing, plating, pouring and pulling pizzas out of the oven: short clips for Reels, TikTok and ads.",
      },
      {
        title: "Ads for social, YouTube and local TV",
        body: "15- and 30-second spots for Facebook, Instagram, YouTube and Google, plus broadcast-ready commercials for local TV.",
      },
    ],
    uses: [
      "Printed and digital menus",
      "Delivery apps (Uber Eats, DoorDash)",
      "Google Business Profile",
      "Website & online ordering",
      "Instagram & TikTok",
      "Facebook & Instagram ads",
      "YouTube & Google ads",
      "Local TV commercials",
      "Reservation platforms",
    ],
    services: ["food-photography", "commercial-videography", "commercial-photography", "video-editing"],
    faqs: [
      {
        q: "How many dishes can you photograph in a session?",
        a: "It depends on how quickly the kitchen can plate and how much styling each dish needs. A two-hour session usually covers a focused menu plus a few interior shots; full menus and video need more time. We'll help you plan the order.",
      },
      {
        q: "Do you bring a food stylist?",
        a: "Our photographers handle basic styling and arrangement with your chef. For heavily styled advertising work, we can add a stylist as part of a custom quote.",
      },
      {
        q: "Can you shoot during service?",
        a: "We recommend shooting dishes before opening or between lunch and dinner. Atmosphere photos with guests can be taken during service if your guests are comfortable with it.",
      },
      {
        q: "Can you make a TV commercial for our restaurant?",
        a: "Yes. We produce broadcast-ready commercials for local TV along with cut-downs for YouTube, Facebook, Instagram and TikTok. We produce the spot; airtime is purchased separately.",
      },
      {
        q: "What does restaurant photography cost?",
        a: "Photography is $250 for the first hour and $100 for each additional hour with a two-hour minimum. Video is $300 for the first hour and $200 for each additional hour. Multi-day or ad campaign shoots get a custom quote.",
      },
    ],
    macrohype:
      "If you also need a new restaurant website, online ordering pages or local ad campaigns, our sister agency MacroHype handles websites, Google Ads, social media and SEO for restaurants.",
    related: ["menu-photography", "food-brands", "social-media-content"],
    imageSet: "commercial",
  },
  {
    slug: "food-brands",
    kind: "industry",
    name: "Food & Beverage Brands",
    h1: "Photography & Video for Food & Beverage Brands",
    title: "Food & Beverage Brand Photography | MacroSnaps",
    description:
      "Product photos and video for packaged food, beverage and CPG brands: e-commerce and Amazon images, lifestyle shots, recipe content and ads for every channel.",
    eyebrow: "Packaged food, drinks & CPG",
    intro: [
      "A food or beverage brand lives on two kinds of images: the clean packshot that sells the product on Amazon and retailer sites, and the appetizing lifestyle photo that makes someone want to taste it. Most brands need both, in many sizes and crops, and they need to refresh them every time packaging, flavors or retail partners change.",
      "MacroSnaps shoots packaged foods, snacks, beverages, sauces, coffee, spirits and other consumer goods in a controlled setup or on location. We photograph packaging on white for marketplaces, then style the product in use: poured, plated, opened, shared at a table or carried on a hike. Every image is retouched for accurate color and readable labels.",
      "We also produce video, from short product loops and recipe clips to full ad spots for YouTube, Google, Facebook, Instagram, TikTok and broadcast-ready commercials for local TV. Smaller product shoots are booked by the hour online. Larger campaign shoots, multi-day productions and full catalog work get a custom quote with a shot list and schedule planned around your launch calendar.",
    ],
    challenges: [
      {
        title: "Marketplace image rules",
        body: "Amazon and retailer sites have strict requirements for main images. Packshots need clean white backgrounds, accurate color and readable labels.",
      },
      {
        title: "Making product look like food",
        body: "A bag of granola or a can of seltzer is not appetizing on its own. Lifestyle and ingredient shots show the taste, the moment and the people it is for.",
      },
      {
        title: "Content for every channel",
        body: "Retail sell sheets, e-commerce, social, paid ads and trade shows all need different crops and formats. Planning the shoot around them saves reshoots.",
      },
    ],
    deliverables: [
      {
        title: "White-background packshots",
        body: "Front, back, side and group shots of every SKU, retouched for Amazon, Walmart, Instacart and your online store.",
      },
      {
        title: "Lifestyle product photos",
        body: "Your product in kitchens, picnics, offices and gyms, with people when it fits the brand.",
      },
      {
        title: "Ingredient and texture shots",
        body: "Pours, splashes, crumbs and close-ups that show what is inside and how it tastes.",
      },
      {
        title: "Recipe and serving content",
        body: "Step-by-step recipe photos and short videos that show customers new ways to use your product.",
      },
      {
        title: "Product loop and unboxing video",
        body: "Short turntable, pour and unboxing clips for product pages, Amazon listings and social.",
      },
      {
        title: "Ad spots",
        body: "15- to 60-second commercials for YouTube, Google, Facebook, Instagram, TikTok and local TV.",
      },
    ],
    uses: [
      "Amazon & marketplace listings",
      "E-commerce product pages",
      "Retailer and distributor sell sheets",
      "Facebook & Instagram ads",
      "TikTok & Instagram Reels",
      "YouTube & Google ads",
      "Local TV commercials",
      "Trade show booths and displays",
      "Packaging and point-of-sale",
    ],
    services: ["product-photography", "food-photography", "commercial-videography", "photo-retouching"],
    faqs: [
      {
        q: "Can you shoot all our SKUs at once?",
        a: "Yes. Send us the product list and we will plan a shot list and schedule. Large catalogs or multi-day shoots get a custom quote.",
      },
      {
        q: "Do your packshots meet Amazon requirements?",
        a: "We shoot and retouch main images on pure white with the product filling the frame, which is what Amazon's main image guidelines ask for. You should still review each marketplace's current rules before uploading.",
      },
      {
        q: "Do you work in a studio or on location?",
        a: "Both. Packshots are usually done in a controlled setup; lifestyle content works best in real kitchens, homes or outdoor locations that match your brand.",
      },
      {
        q: "Can you produce a commercial for TV?",
        a: "Yes. We produce broadcast-ready spots for local TV and versions for YouTube, social and streaming ads. We do the production; media buying and airtime are handled separately.",
      },
    ],
    macrohype:
      "Our sister agency MacroHype builds e-commerce websites and runs Google, Facebook, Instagram and TikTok campaigns for consumer brands, so your new product content goes straight into ads and pages that sell.",
    related: ["retail-ecommerce", "product-launch-content", "video-ads"],
    imageSet: "commercial",
  },
  {
    slug: "law-firms",
    kind: "industry",
    name: "Law Firms",
    h1: "Photography & Video for Law Firms",
    title: "Law Firm Photography & Attorney Video | MacroSnaps",
    description:
      "Attorney headshots, office photos, video bios and client testimonial videos for law firms. Consistent, professional visuals for your website and ads.",
    eyebrow: "Attorneys & legal practices",
    intro: [
      "Hiring a lawyer is a personal decision, often made at a stressful moment. Before someone calls your firm, they read the attorney bio pages and try to judge whether this is a person they can trust. A dated or mismatched set of headshots works against you; a clear, consistent set of portraits and a short video introduction work for you.",
      "MacroSnaps photographs and films attorneys and staff at your office, with matching lighting and backgrounds so every bio page looks like it belongs to the same firm. We set up once and bring attorneys through in short slots, so nobody loses much billable time. We also capture conference rooms, reception and exterior shots that show clients where they will meet you.",
      "Video bios and client testimonial videos let prospective clients hear from your attorneys and past clients directly. They work on your website, on YouTube and in Google, social and local TV ads. Edited photos arrive in about a week and videos in two to four weeks, and your firm reviews every edit before anything is published or shared.",
    ],
    challenges: [
      {
        title: "Consistency across the firm",
        body: "Partners and associates photographed years apart by different photographers make the firm look disjointed. A single setup gives every attorney the same quality.",
      },
      {
        title: "Showing approachability",
        body: "Clients want competence and empathy. Natural portraits and an on-camera introduction show both in a way a list of credentials cannot.",
      },
      {
        title: "Busy attorney schedules",
        body: "We set up once and photograph attorneys in short slots throughout the day, so no one loses more than a few minutes of billable time.",
      },
    ],
    deliverables: [
      {
        title: "Attorney headshots",
        body: "Consistent portraits of partners, associates and paralegals on a matching backdrop or in your office.",
      },
      {
        title: "Office and conference room photos",
        body: "Reception, meeting rooms, library and exterior, photographed to show a professional, welcoming space.",
      },
      {
        title: "Team and practice group photos",
        body: "Group portraits for practice area pages, recruiting materials and press.",
      },
      {
        title: "Attorney video bios",
        body: "One- to two-minute interviews where each attorney explains their practice and how they help clients.",
      },
      {
        title: "Client testimonial videos",
        body: "Interviews with clients who agree to speak on camera about their experience working with your firm.",
      },
      {
        title: "Ad and explainer videos",
        body: "Short spots for YouTube, Google, Facebook and local TV, plus explainers on common legal questions.",
      },
    ],
    uses: [
      "Attorney bio pages",
      "Website & practice area pages",
      "Google Business Profile",
      "Legal directories and LinkedIn",
      "YouTube & Google ads",
      "Facebook & Instagram ads",
      "Local TV commercials",
      "Press releases and speaking bios",
    ],
    services: ["corporate-videography", "commercial-photography", "commercial-videography", "photo-retouching"],
    faqs: [
      {
        q: "Can you photograph all our attorneys in one visit?",
        a: "Yes. We set up a portrait station in your office and photograph each attorney in a short slot. Most firms can cover 15 to 25 people in a few hours.",
      },
      {
        q: "Do you offer dedicated headshot sessions?",
        a: "Yes. For headshot-only sessions, our sister brand MacroHeadshots (macroheadshots.com) specializes in individual and team headshots. MacroSnaps handles headshots combined with office photos and video.",
      },
      {
        q: "How do testimonial videos work?",
        a: "You choose clients willing to participate and collect their consent. We interview them on camera with a short list of questions and edit the answers into a one- to two-minute video. Your firm reviews everything before it is published.",
      },
      {
        q: "What does it cost?",
        a: "Photography is $250 for the first hour plus $100 for each additional hour, with a two-hour minimum. Video is $300 for the first hour plus $200 for each additional hour.",
      },
    ],
    macrohype:
      "If your firm needs a new website, Google Ads for practice areas or local SEO, our sister agency MacroHype builds law firm websites and manages the campaigns that bring in client inquiries.",
    related: ["financial-services", "team-headshots", "testimonial-videos"],
    imageSet: "corporate",
  },
  {
    slug: "real-estate",
    kind: "industry",
    name: "Real Estate Agents & Brokerages",
    h1: "Photography & Video for Real Estate Agents & Brokerages",
    title: "Real Estate Photography & Video for Agents | MacroSnaps",
    description:
      "Listing photos, property videos, Matterport 3D tours and agent branding for real estate agents and brokerages across the US, Ontario and Quebec. Book online.",
    eyebrow: "Listings, tours & agent branding",
    intro: [
      "Buyers start nearly every home search online, and the listing photos decide whether they schedule a showing. Bright, straight, well-composed photos make rooms read correctly and help a home stand out on the MLS, Zillow and Realtor.com. A property video and a 3D tour let relocating and out-of-town buyers walk the home before they ever book a flight.",
      "MacroSnaps real estate photographers and videographers shoot homes, condos, rentals and commercial properties for agents and brokerages across the US, Ontario and Quebec. We capture interiors, exteriors, amenities and neighborhood details, and in Virginia, Maryland, Washington DC, New York and New Jersey we offer Matterport 3D virtual tours for listings that need them. Edited listing photos come back quickly so you can go live on your schedule.",
      "We also photograph and film the agent. Headshots, personal brand photos, intro videos and team portraits help you win the listing appointment, not just market the home once you have it. Brokerages can use the same crews to give every agent and office a consistent look across websites, signs, mailers, social posts and paid ad campaigns.",
    ],
    challenges: [
      {
        title: "Listings compete on photos",
        body: "On Zillow, Realtor.com and the MLS, the first photo is the first impression. Dark rooms, crooked lines and wide-angle distortion push buyers to the next listing.",
      },
      {
        title: "Remote and relocating buyers",
        body: "Buyers moving from another city need more than photos. Walkthrough videos and 3D tours let them understand layout and flow before they fly in.",
      },
      {
        title: "Agents need a brand too",
        body: "Sellers choose agents partly on how they present themselves. Current headshots and an agent video help win the listing appointment.",
      },
    ],
    deliverables: [
      {
        title: "Listing photos",
        body: "Interior and exterior photos with balanced exposure, straight verticals and accurate color, ready for the MLS.",
      },
      {
        title: "Property walkthrough videos",
        body: "Cinematic tours of the home and its features, with horizontal and vertical versions for listings and social.",
      },
      {
        title: "Matterport 3D virtual tours",
        body: "Interactive tours that let buyers move through every room, embedded on your listing and website.",
      },
      {
        title: "Twilight and amenity photos",
        body: "Dusk exteriors, pools, rooftop decks, gyms and lobbies for higher-end and multifamily properties.",
      },
      {
        title: "Agent headshots and brand photos",
        body: "Portraits and lifestyle photos of agents for signs, websites, business cards and social media.",
      },
      {
        title: "Agent intro and market videos",
        body: "Short videos of agents introducing themselves, their neighborhoods and market updates for social and ads.",
      },
    ],
    uses: [
      "MLS and listing sites",
      "Zillow & Realtor.com",
      "Agent and brokerage websites",
      "Instagram & Facebook",
      "YouTube property tours",
      "Facebook & Instagram ads",
      "Printed flyers and brochures",
      "Yard signs and mailers",
    ],
    services: ["real-estate-photography", "real-estate-videography", "virtualtours", "photo-retouching"],
    faqs: [
      {
        q: "Do you offer Matterport 3D tours?",
        a: "Yes, in Virginia, Maryland, Washington DC, New York and New Jersey. We scan properties with Matterport and deliver an interactive 3D tour you can embed on your listing and website. Tours start at $200 for up to 1,000 sq ft, with the first month of hosting included.",
      },
      {
        q: "Can you shoot commercial and multifamily properties?",
        a: "Yes. We photograph and film apartment buildings, offices, retail space and amenities for owners, brokers and property managers.",
      },
      {
        q: "Do you work with brokerages on volume?",
        a: "Yes. Brokerages with regular listing volume can contact us for a custom arrangement covering multiple agents and markets across the US, Ontario and Quebec.",
      },
      {
        q: "How should the home be prepared?",
        a: "Declutter counters, open blinds, turn on all lights, hide personal items and move cars from the driveway. We will send a short prep checklist after you book.",
      },
    ],
    macrohype:
      "Our sister agency MacroHype builds agent and brokerage websites and runs Google, Facebook and Instagram ads for listings and seller leads, using the photos and videos from your shoots.",
    related: ["hotels-hospitality", "event-venues", "website-photos-video"],
    imageSet: "realEstate",
  },
  {
    slug: "hotels-hospitality",
    kind: "industry",
    name: "Hotels & Hospitality",
    h1: "Photography & Video for Hotels & Hospitality",
    title: "Hotel & Hospitality Photography and Video | MacroSnaps",
    description:
      "Hotel photography and video: guest rooms, lobbies, dining, amenities, event spaces and 3D tours for your booking site, OTAs, social media and ad campaigns.",
    eyebrow: "Hotels, inns & resorts",
    intro: [
      "Travelers compare hotels on photos long before they compare prices. On Booking.com, Expedia, Google Hotels and your own site, the images show room size, light, view and the feel of the property. If yours are old, dark or inconsistent from one room type to the next, guests assume the property is too, and they keep scrolling.",
      "MacroSnaps photographs and films hotels, boutique inns, resorts and serviced apartments. We cover every room type, the lobby, restaurant and bar, pool and spa, meeting and event rooms, and the neighborhood around you. In Virginia, Maryland, Washington DC, New York and New Jersey we can also create Matterport 3D tours of suites, ballrooms and meeting space for planners and couples who cannot visit in person.",
      "Lifestyle shoots with models bring the property to life, and short video gives your social channels and ad campaigns something to run. We coordinate with housekeeping and the front desk so guests are not disturbed. Smaller properties can book by the hour online; larger multi-day shoots for resorts and hotel groups get a custom quote and a detailed schedule.",
    ],
    challenges: [
      {
        title: "Every room type needs coverage",
        body: "Guests want to see exactly what they are booking. Kings, doubles, suites and accessible rooms each need accurate photos for every channel.",
      },
      {
        title: "Selling the experience",
        body: "Empty rooms show square footage. Lifestyle images of guests at breakfast, at the pool or in the bar show what a stay actually feels like.",
      },
      {
        title: "Groups and events are a separate sale",
        body: "Wedding couples and meeting planners need their own photos and tours of ballrooms, boardrooms and catering setups.",
      },
    ],
    deliverables: [
      {
        title: "Guest room and suite photos",
        body: "Every room category photographed with balanced light, straight lines and views where you have them.",
      },
      {
        title: "Public space and amenity photos",
        body: "Lobby, restaurant, bar, pool, spa, fitness center and rooftop, photographed at the right time of day.",
      },
      {
        title: "Lifestyle photos with guests",
        body: "Models check in, have breakfast, relax by the pool and use the space the way your guests do.",
      },
      {
        title: "Property tour video",
        body: "A one- to two-minute video of the property for your homepage, YouTube and OTA listings that accept video.",
      },
      {
        title: "Matterport 3D tours",
        body: "Interactive tours of rooms, suites and event spaces for planners and couples who cannot visit in person.",
      },
      {
        title: "Social and ad content",
        body: "Vertical clips for Reels and TikTok plus ad spots for YouTube, Google, Facebook, Instagram and local TV.",
      },
    ],
    uses: [
      "Hotel website & booking engine",
      "Booking.com, Expedia & Google Hotels",
      "Google Business Profile",
      "Instagram & TikTok",
      "Facebook & Instagram ads",
      "YouTube & Google ads",
      "Wedding and meeting planner sales kits",
      "Printed brochures",
    ],
    services: ["real-estate-photography", "commercial-photography", "commercial-videography", "virtualtours"],
    faqs: [
      {
        q: "How long does a hotel shoot take?",
        a: "It depends on the number of room types and amenities. A boutique hotel can often be covered in a half day; a larger property with dining, spa and event space may need one or more full days, quoted in advance.",
      },
      {
        q: "Can you photograph while guests are staying?",
        a: "Yes. We coordinate with housekeeping and front desk to shoot vacant rooms and photograph public spaces at quiet times or with models.",
      },
      {
        q: "Do you provide models?",
        a: "We can include models as part of a custom quote, or photograph your staff and guests who agree to appear.",
      },
      {
        q: "Can you photograph events held at the hotel?",
        a: "Yes. We cover weddings, conferences and corporate events at hotels, which gives your sales team real event photos to show future clients.",
      },
    ],
    macrohype:
      "MacroHype, our sister agency, builds hotel websites and runs Google, Facebook and Instagram campaigns aimed at direct bookings, using your new photos and video.",
    related: ["event-venues", "real-estate", "website-photos-video"],
    imageSet: "realEstate",
  },
  {
    slug: "event-venues",
    kind: "industry",
    name: "Event & Wedding Venues",
    h1: "Photography & Video for Event & Wedding Venues",
    title: "Event & Wedding Venue Photography | MacroSnaps",
    description:
      "Photos, video and 3D tours for event and wedding venues. Show couples and planners your spaces empty, set and in use, with content for your site and ads.",
    eyebrow: "Wedding & event spaces",
    intro: [
      "Couples and event planners shortlist venues from photos. They want to see the room empty so they can picture their own design, the room set for a wedding or a gala, and the room full of people having a good time. Most venues only have one of the three, and it is often a few years old.",
      "MacroSnaps photographs and films ballrooms, barns, lofts, rooftops, estates, galleries and private dining rooms. We shoot your spaces empty and styled, create Matterport 3D tours for remote planners (available in Virginia, Maryland, Washington DC, New York and New Jersey), and can cover real weddings and events held at your venue with the hosts' agreement. Seasonal shoots keep gardens, terraces and outdoor ceremony sites current throughout the year.",
      "Because our photographers already cover weddings, conferences and corporate events across the US, Ontario and Quebec, we know which angles planners look for and which details couples ask about: ceiling height, natural light, ceremony sight lines, the bar and the getting-ready rooms. Edited photos arrive in about a week, ready for your website, listing sites, sales kits and ads.",
    ],
    challenges: [
      {
        title: "Planners need to see capacity",
        body: "Floor area, ceiling height, layout options and natural light are what planners judge. Wide, accurate photos and 3D tours answer those questions.",
      },
      {
        title: "Couples need to picture their day",
        body: "Photos of real ceremonies, receptions and details show what is possible at your venue far better than an empty room.",
      },
      {
        title: "Seasons change the look",
        body: "A garden venue in June and in October are different places. Seasonal shoots keep your gallery current year-round.",
      },
    ],
    deliverables: [
      {
        title: "Empty space photos",
        body: "Wide, straight photos of every room, terrace and lawn, showing size, light and architectural details.",
      },
      {
        title: "Styled setup photos",
        body: "Ceremony, reception, cocktail and conference layouts, styled with your vendors or a coordinated styled shoot.",
      },
      {
        title: "Real wedding and event coverage",
        body: "Photos and video of actual weddings and events at your venue, captured with the hosts' agreement.",
      },
      {
        title: "Matterport 3D tours",
        body: "Interactive tours that let planners and couples walk the venue from anywhere.",
      },
      {
        title: "Venue tour video",
        body: "A short cinematic tour of the property for your website, YouTube and wedding listing sites.",
      },
      {
        title: "Social clips and ads",
        body: "Vertical clips and 15- to 30-second spots for Instagram, TikTok, Facebook, YouTube and local TV.",
      },
    ],
    uses: [
      "Venue website & gallery",
      "Wedding listing sites",
      "Event planner sales kits",
      "Instagram & Pinterest",
      "Facebook & Instagram ads",
      "YouTube & Google ads",
      "Google Business Profile",
      "Open house and bridal show displays",
    ],
    services: ["real-estate-photography", "virtualtours", "wedding-photography", "event-videography"],
    faqs: [
      {
        q: "Can you photograph a real wedding at our venue for marketing?",
        a: "Yes, if the couple agrees. Many venues ask their couples for permission and we coordinate with the couple's own photographer so we do not get in the way.",
      },
      {
        q: "Do you organize styled shoots?",
        a: "We photograph and film styled shoots arranged with your preferred florists, rental companies and planners. Larger styled productions are quoted individually.",
      },
      {
        q: "Do you offer 3D virtual tours?",
        a: "Yes, in Virginia, Maryland, Washington DC, New York and New Jersey. We create Matterport tours of venues, which planners can share with their clients and use to plan layouts. Tours are priced by the size of the space, from $200 for up to 1,000 sq ft.",
      },
      {
        q: "What does a venue shoot cost?",
        a: "Photography is $250 for the first hour plus $100 for each additional hour, two-hour minimum. Video is $300 for the first hour plus $200 for each additional hour. 3D tours are priced by the size of the space, from $200 for up to 1,000 sq ft, in VA, MD, DC, NY and NJ.",
      },
    ],
    macrohype:
      "MacroHype, our sister agency, builds venue websites and runs Google, Instagram and Facebook campaigns aimed at couples and event planners, using the photos and tours from your shoot.",
    related: ["hotels-hospitality", "restaurants", "event-marketing-content"],
    imageSet: "wedding",
  },
  {
    slug: "fitness-gyms",
    kind: "industry",
    name: "Gyms, Fitness Studios & Spas",
    h1: "Photography & Video for Gyms, Fitness Studios & Spas",
    title: "Gym, Fitness Studio & Spa Photography | MacroSnaps",
    description:
      "Photos and video for gyms, fitness studios and spas: classes in action, trainers, facility photos and social content and ads that bring in new members.",
    eyebrow: "Gyms, studios & spas",
    intro: [
      "People join a gym or book a spa based on how it feels to be there. They want to see the equipment, the class energy, the trainers and the changing rooms. Photos and video of real sessions, with your members and coaches, answer that before anyone walks through the door, and they do it better than any stock image of a model with dumbbells.",
      "MacroSnaps photographs and films CrossFit boxes, boutique studios, yoga and Pilates rooms, climbing gyms, martial arts schools, day spas and full-service clubs. We shoot classes in action, trainer portraits, empty facility photos and calm spa interiors. Our crews work quietly around members, and we recommend posting notice ahead of time so anyone who prefers not to appear can say so.",
      "Fitness content moves fast on social media, so we plan each shoot to give you a library of photos and vertical clips for weeks of posts. The same footage can be cut into membership ads for Facebook, Instagram, YouTube, Google and local TV. Photos arrive in about a week and edited video in two to four weeks.",
    ],
    challenges: [
      {
        title: "Showing energy, not just equipment",
        body: "A row of machines does not sell a membership. Photos and video of real classes and coaching show the experience people are buying.",
      },
      {
        title: "Trainers are the brand",
        body: "Members often choose a studio for a coach. Portraits and intro videos help new members pick a class and a trainer.",
      },
      {
        title: "Social channels need constant content",
        body: "Fitness audiences expect regular posts. A single shoot planned well can supply clips and photos for weeks.",
      },
    ],
    deliverables: [
      {
        title: "Class and training action photos",
        body: "Group classes, personal training and open gym, shot with fast shutter speeds and good light.",
      },
      {
        title: "Trainer and therapist portraits",
        body: "Headshots and in-action portraits for your website, booking app and social channels.",
      },
      {
        title: "Facility and spa interior photos",
        body: "Gym floor, studios, locker rooms, treatment rooms and relaxation areas, clean and well lit.",
      },
      {
        title: "Class preview videos",
        body: "Short videos showing what each class looks like, so new members know what to expect.",
      },
      {
        title: "Reels and TikToks",
        body: "Vertical clips of workouts, transformations and studio moments, edited for social.",
      },
      {
        title: "Membership ad spots",
        body: "15- to 30-second ads for Facebook, Instagram, YouTube, Google and local TV.",
      },
    ],
    uses: [
      "Website & class schedule",
      "Booking apps (Mindbody, ClassPass)",
      "Instagram & TikTok",
      "Facebook & Instagram ads",
      "YouTube & Google ads",
      "Local TV commercials",
      "Google Business Profile",
      "In-studio screens and signage",
    ],
    services: ["commercial-photography", "commercial-videography", "video-editing", "event-photography"],
    faqs: [
      {
        q: "Can you shoot during a live class?",
        a: "Yes. We work quietly around members during class, and we recommend posting notice in advance so members who prefer not to be photographed can say so.",
      },
      {
        q: "Do members need to sign releases?",
        a: "Anyone clearly identifiable in marketing photos or video should sign a release. Many studios add this to membership agreements; we can also bring release forms.",
      },
      {
        q: "Can you cover multiple locations?",
        a: "Yes. Our photographers and videographers work across the US, Ontario and Quebec, so franchises and multi-location studios get consistent content.",
      },
      {
        q: "How much content will we get?",
        a: "A two-hour photo session usually produces dozens of edited images across classes, portraits and facility shots. Video sessions produce a set of short clips and one or more edited ads, depending on what you book.",
      },
    ],
    macrohype:
      "Our sister agency MacroHype runs membership campaigns on Google, Facebook and Instagram and builds fitness websites, so your new content turns into trial sign-ups.",
    related: ["social-media-content", "salons-beauty", "medical-practices"],
    imageSet: "commercial",
  },
  {
    slug: "salons-beauty",
    kind: "industry",
    name: "Salons, Barbers & Beauty",
    h1: "Photography & Video for Salons, Barbers & Beauty",
    title: "Salon, Barber & Beauty Photography | MacroSnaps",
    description:
      "Photos and video for hair salons, barbershops, nail studios and beauty brands: portfolio work, stylist portraits, interiors, product shots and social clips.",
    eyebrow: "Salons, barbers & beauty",
    intro: [
      "In beauty, the work is the advertisement. New clients scroll through Instagram, Google and booking apps looking at cuts, colors, nails and brows before choosing who to book. Well-lit, sharp photos of finished work, taken in your own space, make your portfolio look as good as your stylists actually are, and they give every post a consistent, recognizable look.",
      "MacroSnaps photographs and films hair salons, barbershops, nail studios, lash and brow bars, makeup artists and beauty product brands. We shoot finished looks, process clips, stylist and barber portraits, the space itself and the products you sell. Controlled lighting and color-accurate editing keep hair color and skin tones true to how they look in person.",
      "Short video works especially well for beauty. Transformations, color reveals, fades and nail art all perform on Reels and TikTok. We plan each shoot to give you a mix of photos and clips you can post for weeks, and we can cut ad spots for Facebook, Instagram and local TV. Edited photos arrive in about a week.",
    ],
    challenges: [
      {
        title: "Phone photos undersell the work",
        body: "Salon lighting rarely flatters hair color or skin. Proper lighting shows the real tone, shine and detail of the work.",
      },
      {
        title: "Clients book a person",
        body: "Stylists and barbers build their own following. Individual portraits and portfolios help clients choose who to book with.",
      },
      {
        title: "Retail needs product shots",
        body: "If you sell hair care, skincare or your own product line, you need clean product photos for your shop and social channels.",
      },
    ],
    deliverables: [
      {
        title: "Finished look portfolio",
        body: "Cuts, color, styling, nails, lashes and makeup photographed with consistent lighting.",
      },
      {
        title: "Transformation videos",
        body: "Before, process and reveal clips edited for Reels and TikTok.",
      },
      {
        title: "Stylist and barber portraits",
        body: "Individual portraits and team photos for booking pages, your website and social bios.",
      },
      {
        title: "Salon interior photos",
        body: "Chairs, stations, wash area and storefront, photographed to show the atmosphere.",
      },
      {
        title: "Product photography",
        body: "Clean and styled shots of retail products and private-label lines for e-commerce and social.",
      },
      {
        title: "Promo and ad spots",
        body: "Short ads for Facebook, Instagram, TikTok, YouTube and local TV promoting services or openings.",
      },
    ],
    uses: [
      "Instagram & TikTok",
      "Booking apps and online scheduling",
      "Google Business Profile",
      "Website & service menu",
      "Facebook & Instagram ads",
      "Online shop",
      "Local TV commercials",
      "In-salon displays",
    ],
    services: ["commercial-photography", "commercial-videography", "product-photography", "photo-retouching"],
    faqs: [
      {
        q: "Can you shoot clients during real appointments?",
        a: "Yes, if the client agrees. Many salons schedule a few model appointments for the shoot so stylists can focus on their best work.",
      },
      {
        q: "How do you keep hair color accurate?",
        a: "We use controlled lighting and color-calibrated editing so tones look the way they do in person, not shifted by salon lights.",
      },
      {
        q: "Can each stylist get their own photos?",
        a: "Yes. We can plan short portfolio blocks for each stylist so everyone leaves with portraits and work photos for their own pages.",
      },
      {
        q: "What does a salon shoot cost?",
        a: "Photography is $250 for the first hour plus $100 for each additional hour, two-hour minimum. Video is $300 for the first hour plus $200 for each additional hour.",
      },
    ],
    macrohype:
      "MacroHype, our sister agency, builds salon websites and runs Instagram, Facebook and Google campaigns for new client bookings, using the content from your shoot.",
    related: ["fitness-gyms", "social-media-content", "brand-photography"],
    imageSet: "personal",
  },
  {
    slug: "retail-ecommerce",
    kind: "industry",
    name: "Retail & E-commerce",
    h1: "Photography & Video for Retail & E-commerce",
    title: "Retail & E-commerce Photography and Video | MacroSnaps",
    description:
      "Product photos, lifestyle shoots and video for retail stores and e-commerce brands: white-background images, store photos, product videos and ad content.",
    eyebrow: "Stores & online shops",
    intro: [
      "Online shoppers cannot touch the product, so the photos have to do it for them: accurate color, every angle, scale, texture and the product in use. Physical stores face a different problem. They need to give people a reason to visit, with photos of the space, the displays, the window and the people who work there.",
      "MacroSnaps photographs and films products for e-commerce stores, Amazon sellers, boutiques and retail chains. We shoot white-background catalog images, styled lifestyle scenes, detail close-ups and short product videos, and we photograph storefronts and interiors for local shops. We can set up a product station at your store or warehouse, or shoot lifestyle scenes on location.",
      "We retouch every image for consistency across your catalog, so new products match the ones already on your site. We also produce video ads for Google, YouTube, Facebook, Instagram, TikTok and broadcast-ready spots for local TV. Smaller shoots are booked by the hour online; large catalogs and campaign shoots get a custom quote and a schedule.",
    ],
    challenges: [
      {
        title: "Catalog consistency",
        body: "Mixed backgrounds, lighting and angles make a shop look unreliable. A consistent setup keeps every product page uniform.",
      },
      {
        title: "Showing scale and use",
        body: "Shoppers return items that are smaller or different than they expected. Lifestyle and in-hand shots show size and use.",
      },
      {
        title: "Ads need video",
        body: "Social and shopping ads increasingly favor short video. Product clips give your campaigns more to work with than still images alone.",
      },
    ],
    deliverables: [
      {
        title: "White-background product photos",
        body: "Clean catalog images from multiple angles, retouched for your store, Amazon and other marketplaces.",
      },
      {
        title: "Lifestyle product photos",
        body: "Products styled in real settings or with models to show how they fit into a customer's life.",
      },
      {
        title: "Detail and texture shots",
        body: "Close-ups of materials, stitching, finishes and features that customers want to inspect.",
      },
      {
        title: "Product videos",
        body: "Short demos, 360 spins and unboxing videos for product pages and listings.",
      },
      {
        title: "Store and display photos",
        body: "Storefront, interior and window displays for local search and your website.",
      },
      {
        title: "Social and ad spots",
        body: "Vertical clips and 15- to 30-second ads for Facebook, Instagram, TikTok, YouTube, Google and local TV.",
      },
    ],
    uses: [
      "E-commerce product pages",
      "Amazon & marketplace listings",
      "Google Shopping",
      "Facebook & Instagram ads",
      "TikTok & Instagram Reels",
      "YouTube & Google ads",
      "Email campaigns",
      "Google Business Profile",
      "In-store signage and catalogs",
    ],
    services: ["product-photography", "commercial-photography", "commercial-videography", "photo-retouching"],
    faqs: [
      {
        q: "Do you photograph products in a studio or on site?",
        a: "Both. We can set up a product station at your warehouse or store, or shoot lifestyle scenes on location.",
      },
      {
        q: "How many products can you shoot in a session?",
        a: "It depends on the product size and number of angles. Simple items on white move quickly; styled scenes and models take longer. Send us your list and we will estimate the time.",
      },
      {
        q: "Do you retouch product images?",
        a: "Yes. Retouching includes background cleanup, dust removal and color correction. Advanced retouching is available as a separate service.",
      },
      {
        q: "Can you produce ads for our online store?",
        a: "Yes. We produce video ads for Google, YouTube, Facebook, Instagram and TikTok, and broadcast-ready spots for local TV.",
      },
    ],
    macrohype:
      "Our sister agency MacroHype builds e-commerce websites and runs Google Shopping, Facebook, Instagram and TikTok ads, so your product content goes straight into campaigns.",
    related: ["food-brands", "product-launch-content", "video-ads"],
    imageSet: "commercial",
  },
  {
    slug: "tech-startups",
    kind: "industry",
    name: "Tech Companies & Startups",
    h1: "Photography & Video for Tech Companies & Startups",
    title: "Tech Company & Startup Photography & Video | MacroSnaps",
    description:
      "Photo and video for tech companies and startups: product launches, team and office photos, conference coverage and recruiting videos in the US and Canada.",
    eyebrow: "Software, hardware & startups",
    intro: [
      "Tech companies need a lot of visual content and rarely have time to plan it. A launch needs a demo video. The careers page needs real photos of the team. The founder needs a headshot for a funding announcement. The booth at next month's conference needs coverage, and the sales team wants customer stories it can send to prospects.",
      "MacroSnaps works with software companies, hardware makers and startups at every stage. Our photographers and videographers cover product launches, offices, team portraits, user conferences, trade shows, customer interviews and recruiting videos. Our editors can combine filmed footage with your screen recordings and interface assets, so software demos show both the product and the people using it.",
      "Because we have our own crews across the US, Ontario and Quebec, distributed teams get the same quality and style in every office and at every event. We also live stream launches, keynotes and all-hands meetings. Edited photos arrive in about a week, and launch, customer and recruiting videos are typically delivered in two to four weeks.",
    ],
    challenges: [
      {
        title: "Software is hard to film",
        body: "Screens alone are dull. Good tech video combines people using the product, clear screen recordings and customers explaining the result.",
      },
      {
        title: "Hiring depends on culture",
        body: "Candidates compare offices, teams and perks before applying. Real photos and recruiting videos show what working there is like.",
      },
      {
        title: "Events happen everywhere",
        body: "User conferences, trade shows and meetups happen in different cities. A single provider with crews in many markets keeps the coverage consistent.",
      },
    ],
    deliverables: [
      {
        title: "Product launch video",
        body: "Demo and announcement videos combining product footage, team interviews and screen recordings.",
      },
      {
        title: "Team and founder photos",
        body: "Headshots, leadership portraits and team photos for the website, press kit and investor materials.",
      },
      {
        title: "Office and culture photos",
        body: "Candid photos of people working, collaborating and meeting in your office.",
      },
      {
        title: "Conference and trade show coverage",
        body: "Keynotes, booths, demos and networking at your own events or industry shows.",
      },
      {
        title: "Customer story videos",
        body: "Interviews with customers explaining how they use your product, filmed on site or at events.",
      },
      {
        title: "Recruiting videos",
        body: "Employee interviews and day-in-the-life footage for careers pages, LinkedIn and job ads.",
      },
    ],
    uses: [
      "Website & product pages",
      "Careers page and job posts",
      "LinkedIn",
      "Press kits and funding announcements",
      "YouTube & Google ads",
      "Facebook & Instagram ads",
      "Sales decks and demos",
      "Conference booths and screens",
    ],
    services: ["corporate-videography", "conference-photography", "trade-show-photography", "commercial-videography"],
    faqs: [
      {
        q: "Can you cover our team in several cities?",
        a: "Yes. MacroSnaps has its own photographers and videographers across the US, Ontario and Quebec, so we can schedule shoots at multiple offices with the same style.",
      },
      {
        q: "Do you live stream product launches or events?",
        a: "Yes. We offer live streaming for launches, keynotes, all-hands meetings and webinars, alongside photo and video coverage.",
      },
      {
        q: "Can you combine screen recordings with filmed footage?",
        a: "Yes. Send us your screen recordings or UI assets and our editors will cut them together with interviews and product footage.",
      },
      {
        q: "How do you price a launch video?",
        a: "Simple shoots are booked by the hour: video is $300 for the first hour and $200 for each additional hour. Launch campaigns with scripting, multiple locations or motion graphics get a custom quote.",
      },
    ],
    macrohype:
      "MacroHype, our sister agency, builds websites and runs Google, Facebook, Instagram and social media campaigns for tech companies, and can put your launch content to work across paid and organic channels.",
    related: ["product-launch-content", "recruiting-videos", "event-marketing-content"],
    imageSet: "corporate",
  },
  {
    slug: "financial-services",
    kind: "industry",
    name: "Banks & Financial Services",
    h1: "Photography & Video for Banks & Financial Services",
    title: "Bank & Financial Services Photography | MacroSnaps",
    description:
      "Photos and video for banks, credit unions, advisors and insurance firms: executive portraits, branch photos, client stories, event coverage and ad spots.",
    eyebrow: "Banks, advisors & insurance",
    intro: [
      "Financial decisions rest on trust, and trust is easier to give to people you can see. Banks, credit unions, wealth managers, insurance agencies and accounting firms all benefit from showing their real advisors, branches and community work instead of generic stock images of handshakes and couples at a kitchen table reviewing paperwork.",
      "MacroSnaps photographs and films executives, advisors, branch teams and offices, and covers the events financial firms run: client seminars, annual meetings, community sponsorships and conferences. We also produce explainer videos, client and member stories, and ad spots for YouTube, Google, social media and local TV. Live streaming is available for annual and member meetings.",
      "We work discreetly in offices and branches, usually before opening or after closing, and keep screens, documents and customer information out of frame. Your compliance team reviews scripts and edits before anything goes live. Smaller shoots are booked by the hour online, while multi-branch and campaign productions get a custom quote and a shared shot list for every location.",
    ],
    challenges: [
      {
        title: "Stock photos erode trust",
        body: "Customers recognize the same smiling couple at the kitchen table on a dozen bank sites. Your own people and places are more credible.",
      },
      {
        title: "Products are abstract",
        body: "Mortgages, retirement plans and insurance are hard to picture. Short explainers and client stories make them easier to understand.",
      },
      {
        title: "Community presence matters",
        body: "Local banks and credit unions sponsor events and support local causes. Photos and video of that work show customers you are part of the community.",
      },
    ],
    deliverables: [
      {
        title: "Executive and advisor portraits",
        body: "Consistent headshots and environmental portraits for leadership pages, advisor profiles and annual reports.",
      },
      {
        title: "Branch and office photos",
        body: "Lobbies, offices and exteriors for your website, Google listings and branch pages.",
      },
      {
        title: "Client and member stories",
        body: "Interviews with customers who agree to share how you helped them buy a home, grow a business or plan retirement.",
      },
      {
        title: "Explainer videos",
        body: "Advisors explaining products and common financial questions in plain language.",
      },
      {
        title: "Event and sponsorship coverage",
        body: "Client seminars, annual meetings, community events and conferences, photographed and filmed.",
      },
      {
        title: "Ad spots",
        body: "Spots for YouTube, Google, Facebook, Instagram and broadcast-ready commercials for local TV.",
      },
    ],
    uses: [
      "Website & branch pages",
      "Advisor profiles",
      "Annual reports",
      "LinkedIn",
      "YouTube & Google ads",
      "Facebook & Instagram ads",
      "Local TV commercials",
      "Branch screens and printed materials",
    ],
    services: ["corporate-videography", "corporate-event-photography", "commercial-photography", "live-stream"],
    faqs: [
      {
        q: "Can you photograph all our branches?",
        a: "Yes. We schedule branch shoots across the US, Ontario and Quebec with a shared shot list so every location matches.",
      },
      {
        q: "How do you handle customer privacy in a branch?",
        a: "We shoot before opening or after closing when possible, keep screens and documents out of frame and only photograph customers or members who agree to it.",
      },
      {
        q: "Can you live stream our annual meeting?",
        a: "Yes. We provide live streaming for annual meetings, shareholder and member events, along with photo and video coverage.",
      },
      {
        q: "Do you write scripts for explainer videos?",
        a: "We help shape talking points and interview questions. Your compliance team should review final scripts and edits before publishing.",
      },
    ],
    macrohype:
      "Our sister agency MacroHype builds websites and runs Google, social and SEO campaigns for financial firms, and can use your new photos and videos across those channels.",
    related: ["law-firms", "nonprofits-associations", "team-headshots"],
    imageSet: "corporate",
  },
  {
    slug: "nonprofits-associations",
    kind: "industry",
    name: "Nonprofits & Associations",
    h1: "Photography & Video for Nonprofits & Associations",
    title: "Nonprofit & Association Photography and Video | MacroSnaps",
    description:
      "Event photos, fundraising videos and program coverage for nonprofits and associations: galas, annual meetings, conferences and impact stories.",
    eyebrow: "Nonprofits & member groups",
    intro: [
      "Donors and members support organizations they can see in action. A gala photo gallery, a three-minute fundraising video or a set of program photos shows where the money goes and who it helps. Without those images, appeals, annual reports and grant applications lean on text alone, and supporters have a harder time connecting with the work.",
      "MacroSnaps covers galas, award dinners, annual meetings, advocacy days, member conferences and community programs. We photograph honorees, speakers, sponsors and attendees, and we film fundraising videos, impact stories and event recaps. Program participants are photographed only with consent and under your organization's guidelines, with extra care taken for vulnerable groups and minors.",
      "MacroSnaps is part of MacroHype, a New York and Washington DC digital media and marketing company working with businesses since 2011, and our crews cover events across the US, Ontario and Quebec. Hourly pricing makes it possible to cover a reception or a short program without a large production budget, and gala photos arrive in about a week, in time for thank-you notes and sponsor follow-ups.",
    ],
    challenges: [
      {
        title: "Showing impact",
        body: "Donors want to see results. Photos and stories from programs connect a gift to the people and places it supports.",
      },
      {
        title: "Recognizing sponsors and honorees",
        body: "Sponsors expect photos of their branding and their people. Honorees expect a good photo of their moment on stage.",
      },
      {
        title: "Tight budgets",
        body: "Hourly booking and a clear shot list let you cover what matters most without paying for time you do not need.",
      },
    ],
    deliverables: [
      {
        title: "Gala and dinner photography",
        body: "Arrivals, step-and-repeat, speakers, award presentations, sponsors and candid guest photos.",
      },
      {
        title: "Fundraising and appeal videos",
        body: "Short films for galas, year-end campaigns and giving days, built around the people you serve.",
      },
      {
        title: "Annual meeting and conference coverage",
        body: "Keynotes, panels, breakouts and networking for associations and member organizations.",
      },
      {
        title: "Program and field photography",
        body: "Photos of your programs, volunteers and staff at work in the community.",
      },
      {
        title: "Event recap videos",
        body: "One- to three-minute highlight videos for members, sponsors and next year's promotion.",
      },
      {
        title: "Live streaming",
        body: "Live streams of galas, annual meetings and advocacy events for remote supporters and members.",
      },
    ],
    uses: [
      "Website & donation pages",
      "Annual reports",
      "Year-end appeals and newsletters",
      "Gala screens and presentations",
      "Facebook & Instagram",
      "LinkedIn",
      "Sponsor reports",
      "Grant applications",
    ],
    services: ["event-photography", "event-videography", "conference-photography", "live-stream"],
    faqs: [
      {
        q: "Can you play a fundraising video at our gala?",
        a: "Yes. We film and edit the video in advance so it is ready for the event. Allow two to four weeks for editing, plus time for your review.",
      },
      {
        q: "How quickly do we get gala photos?",
        a: "Edited photos are delivered in about one week, which is usually in time for thank-you emails and sponsor follow-ups.",
      },
      {
        q: "Do you photograph program participants?",
        a: "Yes, with their consent and your organization's release forms. We are careful with vulnerable groups and follow your guidelines on what can be shown.",
      },
      {
        q: "What does gala coverage cost?",
        a: "Photography is $250 for the first hour and $100 for each additional hour, with a two-hour minimum. Video is $300 for the first hour and $200 for each additional hour.",
      },
    ],
    macrohype:
      "MacroHype, our sister agency, builds nonprofit and association websites and runs digital campaigns, social media and PR, so your gala and program content reaches donors and members.",
    related: ["event-marketing-content", "education", "financial-services"],
    imageSet: "event",
  },
  {
    slug: "education",
    kind: "industry",
    name: "Schools & Universities",
    h1: "Photography & Video for Schools & Universities",
    title: "School & University Photography and Video | MacroSnaps",
    description:
      "Campus photos, admissions videos, faculty portraits, commencement and event coverage for schools, colleges and universities across the US, Ontario and Quebec.",
    eyebrow: "Schools, colleges & universities",
    intro: [
      "Families and students judge a school by what they see online, usually long before they take a tour. Current campus photos, real classrooms, faculty at work and students in clubs, labs and athletics make the case for a school far better than a brochure full of empty buildings and the same few photos reused for years.",
      "MacroSnaps photographs and films private schools, charter schools, colleges, universities and continuing education programs. We cover campus and facilities, classrooms and labs, faculty and staff portraits, admissions videos and the events that fill the calendar: open houses, conferences, galas, alumni weekends and commencement. We can also live stream ceremonies for families who cannot attend.",
      "We follow your school's media consent policies, work from your opt-out lists and only feature students who are cleared to appear. Photos that include opted-out students are removed in editing. Edited photos arrive in about a week and videos in two to four weeks, ready for your website, viewbooks, social channels and enrollment campaigns.",
    ],
    challenges: [
      {
        title: "Admissions is visual",
        body: "Prospective families compare campuses online. Photos and videos of real student life shape which schools make the shortlist.",
      },
      {
        title: "Consent and student privacy",
        body: "Schools manage photo permissions for every student. We work from your opt-out lists and guidelines.",
      },
      {
        title: "A busy calendar",
        body: "Open houses, athletics, performances, alumni events and commencement all need coverage, often in the same month.",
      },
    ],
    deliverables: [
      {
        title: "Campus and facility photos",
        body: "Buildings, grounds, libraries, labs, studios and athletic facilities across the seasons.",
      },
      {
        title: "Classroom and student life",
        body: "Candid photos of teaching, labs, clubs, arts and athletics.",
      },
      {
        title: "Faculty and staff portraits",
        body: "Consistent headshots for directories, department pages and admissions materials.",
      },
      {
        title: "Admissions and recruitment videos",
        body: "Tours, student and faculty interviews and program highlights for prospective families.",
      },
      {
        title: "Commencement and event coverage",
        body: "Graduations, convocations, galas, alumni weekends and academic conferences.",
      },
      {
        title: "Live streaming",
        body: "Live streams of commencement, lectures and events for families and alumni who cannot attend.",
      },
    ],
    uses: [
      "Website & admissions pages",
      "Viewbooks and brochures",
      "Instagram, Facebook & TikTok",
      "YouTube & Google ads",
      "Facebook & Instagram ads",
      "Alumni magazines and newsletters",
      "Fundraising campaigns",
      "Faculty and staff directories",
    ],
    services: ["event-photography", "corporate-videography", "commercial-photography", "live-stream"],
    faqs: [
      {
        q: "How do you handle students who opt out of photos?",
        a: "We work from your school's consent list and follow your staff's guidance on the day. Photos that include opted-out students are removed during editing.",
      },
      {
        q: "Can you live stream commencement?",
        a: "Yes. We offer live streaming for commencement, convocation and other ceremonies, and can also deliver an edited highlight video afterward.",
      },
      {
        q: "Can you photograph the whole faculty in one day?",
        a: "Yes. We set up a portrait station and schedule faculty and staff in short time slots.",
      },
      {
        q: "Do you work with schools outside major cities?",
        a: "Yes. Our photographers and videographers work across the US, Ontario and Quebec, including smaller towns and rural campuses.",
      },
    ],
    macrohype:
      "MacroHype, our sister agency, builds school websites and runs enrollment campaigns on Google, Facebook and Instagram, using the admissions photos and videos from your shoots.",
    related: ["nonprofits-associations", "recruiting-videos", "team-headshots"],
    imageSet: "event",
  },
  {
    slug: "home-services",
    kind: "industry",
    name: "Contractors & Home Services",
    h1: "Photography & Video for Contractors & Home Services",
    title: "Contractor & Home Services Photography | MacroSnaps",
    description:
      "Before-and-after photos, crew portraits and project videos for contractors, remodelers, roofers, landscapers and home service companies. Book online.",
    eyebrow: "Contractors & home services",
    intro: [
      "Homeowners hiring a contractor want proof: what your finished work looks like, who will show up at their door and how the job gets done. Professional before-and-after photos, crew portraits and short project videos give them that proof on your website, your Google listing, review sites and in the ads you run across your service area.",
      "MacroSnaps works with remodelers, builders, roofers, HVAC and plumbing companies, landscapers, painters, cleaners and other home service businesses. We photograph finished kitchens, baths, basements, additions and outdoor projects, and we film crews on the job. Matched before-and-after angles make the change easy to see, and longer projects can be filmed over several short visits.",
      "Book a photographer for a completed project, a videographer for a job in progress, or both. Shoot right after completion, before the homeowner moves furniture back in. Edited photos arrive in about a week, in time for your next portfolio update, and we can cut ad spots for YouTube, Facebook, Instagram and local TV.",
    ],
    challenges: [
      {
        title: "Phone photos sell the work short",
        body: "A new kitchen photographed with a phone in bad light looks like an average kitchen. Proper lighting and composition show the craftsmanship.",
      },
      {
        title: "Homeowners want to know who is coming",
        body: "Photos of your actual crew, trucks and uniforms make a company look established and trustworthy.",
      },
      {
        title: "Projects disappear once finished",
        body: "The best time to document a project is right after completion, before the homeowner moves in furniture. Booking a shoot captures it.",
      },
    ],
    deliverables: [
      {
        title: "Before-and-after photos",
        body: "Matched angles of the same space before and after, ready for galleries, social posts and ads.",
      },
      {
        title: "Finished project portfolio",
        body: "Detailed photos of completed kitchens, baths, basements, decks, roofs and landscapes.",
      },
      {
        title: "Crew and owner portraits",
        body: "Photos of the owner, project managers and crews, with trucks and equipment.",
      },
      {
        title: "Project walkthrough videos",
        body: "Short videos walking through a finished project, with the owner or project manager explaining the work.",
      },
      {
        title: "Work-in-progress footage",
        body: "Crews at work on site, edited into time-lapse-style clips and social posts.",
      },
      {
        title: "Ad spots",
        body: "15- to 30-second spots for YouTube, Google, Facebook, Instagram and local TV.",
      },
    ],
    uses: [
      "Website & project gallery",
      "Google Business Profile",
      "Review and referral sites",
      "Facebook & Instagram ads",
      "YouTube & Google ads",
      "Local TV commercials",
      "Truck wraps and yard signs",
      "Printed estimates and mailers",
    ],
    services: ["commercial-photography", "real-estate-photography", "commercial-videography", "video-editing"],
    faqs: [
      {
        q: "Can you shoot the 'before' photos too?",
        a: "Yes. Book a short session before work starts and another when it is finished. We match the angles so the comparison is clear.",
      },
      {
        q: "Can you film a project over several weeks?",
        a: "Yes. We can schedule several short visits during the job and edit them into a single project video.",
      },
      {
        q: "Do you need the homeowner's permission?",
        a: "Yes. You arrange access and permission with the homeowner. We avoid showing house numbers or personal items if the homeowner prefers.",
      },
      {
        q: "Can you make a commercial for local TV?",
        a: "Yes. We produce broadcast-ready commercials plus versions for YouTube, Facebook and Instagram. Airtime is purchased separately.",
      },
    ],
    macrohype:
      "Our sister agency MacroHype builds contractor websites and runs Google Ads, local service campaigns and SEO, so your new project photos bring in estimate requests.",
    related: ["real-estate", "video-ads", "website-photos-video"],
    imageSet: "realEstate",
  },

  // ---------------------------------------------------------------------------
  // SOLUTIONS
  // ---------------------------------------------------------------------------
  {
    slug: "video-ads",
    kind: "solution",
    name: "Video Ads for Google, Facebook & TV",
    h1: "Video Ads for Google, YouTube, Facebook, TikTok & Local TV",
    title: "Video Ad Production for Google, Social & TV | MacroSnaps",
    description:
      "We produce video ads for Google and YouTube, Facebook and Instagram, TikTok and broadcast-ready local TV commercials. Our own crews across the US, Ontario and Quebec.",
    eyebrow: "Video ad production",
    intro: [
      "A good video ad does one job in a few seconds: stop the scroll, show the offer and tell people what to do next. Each platform has its own rules. YouTube allows a slower open, TikTok needs vertical footage that feels native, Facebook and Instagram need captions for sound-off viewing, and local TV needs a broadcast-ready file in the station's format.",
      "MacroSnaps produces video ads for businesses of every size, from a single 15-second spot to a full campaign. Our own videographers film on location with your products, staff and customers, and our editors cut the footage into horizontal, vertical and square versions for every platform you run, with different hooks and lengths so you can test what works.",
      "We produce the ads; we do not buy airtime or media. You or your media buyer place the spots with stations and platforms, or our sister agency MacroHype can run the digital campaigns for you. Simple ads can be shot at our hourly video rate, and larger productions with scripting, talent or multiple locations get a custom quote.",
    ],
    challenges: [
      {
        title: "Every platform wants a different cut",
        body: "16:9 for YouTube and TV, 9:16 for TikTok and Reels, 1:1 or 4:5 for feeds. Planning the shoot for all of them avoids reshoots.",
      },
      {
        title: "The first seconds decide",
        body: "Viewers skip or scroll quickly. Ads need a clear hook, a simple message and a visible call to action.",
      },
      {
        title: "TV has technical specs",
        body: "Stations require specific lengths, formats and audio levels. We deliver files built to those specs.",
      },
    ],
    deliverables: [
      {
        title: "YouTube and Google video ads",
        body: "6-second bumpers, 15- and 30-second in-stream ads and longer versions for YouTube and Google's video network.",
      },
      {
        title: "Facebook and Instagram ads",
        body: "Feed, Stories and Reels versions with captions, in square, vertical and horizontal formats.",
      },
      {
        title: "TikTok ads",
        body: "Vertical, native-style spots built for TikTok's pace, with on-screen text and trending formats.",
      },
      {
        title: "Local TV commercials",
        body: "Broadcast-ready 15- and 30-second commercials delivered in the formats your stations require.",
      },
      {
        title: "Testimonial and demo ads",
        body: "Customer and product demo footage edited into short, persuasive spots.",
      },
      {
        title: "Ad variations for testing",
        body: "Multiple hooks, lengths and calls to action from one shoot, so you can test what works.",
      },
    ],
    uses: [
      "YouTube & Google ads",
      "Facebook & Instagram ads",
      "TikTok ads",
      "Local TV commercials",
      "Streaming and connected TV ads",
      "Website & landing pages",
      "In-store and event screens",
    ],
    services: ["commercial-videography", "video-editing", "product-photography"],
    faqs: [
      {
        q: "Do you buy TV airtime?",
        a: "No. We produce broadcast-ready commercials. Airtime is purchased from the station or through your media buyer.",
      },
      {
        q: "Can one shoot produce ads for all platforms?",
        a: "Yes. We plan framing and shots so the footage can be cut into horizontal, vertical and square versions for each platform.",
      },
      {
        q: "How much does a video ad cost?",
        a: "Simple ads can be shot on our hourly rate: $300 for the first hour and $200 for each additional hour, two-hour minimum, plus editing. Campaigns with scripting, talent or multiple locations get a custom quote.",
      },
      {
        q: "How long does production take?",
        a: "Most ads are delivered in two to four weeks after the shoot, depending on the number of versions and rounds of revisions.",
      },
      {
        q: "Can you write the script?",
        a: "We help shape the concept, shot list and on-screen messaging. Full creative development for larger campaigns is included in custom quotes.",
      },
    ],
    macrohype:
      "MacroHype, our sister agency, runs Google, YouTube, Facebook, Instagram and TikTok ad campaigns, so the ads we produce can be launched, targeted and measured by one team.",
    related: ["social-media-content", "testimonial-videos", "product-launch-content"],
    imageSet: "commercial",
  },
  {
    slug: "social-media-content",
    kind: "solution",
    name: "Social Media Content",
    h1: "Social Media Photo & Video Content",
    title: "Social Media Photo & Video Content | MacroSnaps",
    description:
      "Monthly content days for social media: photos, Reels and TikToks of your products, team and space, shot by our own crews and edited for each platform.",
    eyebrow: "Content for Reels, TikTok & feeds",
    intro: [
      "Social media rewards businesses that post often, and most teams run out of good photos and clips within a few weeks. Phone content has its place, but a feed built only on it rarely shows your products, people and space at their best, and it is hard to turn into ads that look as good as your competitors'.",
      "MacroSnaps runs content days: a photographer, a videographer or both visit your business for a few hours and capture a batch of photos, vertical clips and short interviews planned around your calendar. Our editors turn that footage into Reels, TikToks, Stories and feed posts ready to schedule, with captions and crops built for each platform.",
      "Many businesses book a content day every month or every season, so there is always fresh material for organic posts and paid ads. Shooting with both in mind means the same clips can run as Facebook, Instagram and TikTok ads. Edited photos arrive in about a week, and short-form videos are delivered in batches you can schedule.",
    ],
    challenges: [
      {
        title: "Posting consistently",
        body: "Feeds go quiet when the team is busy. A content day produces a batch of material you can post over several weeks.",
      },
      {
        title: "Video is the default",
        body: "Reels and TikTok favor short vertical video. Planning shots in 9:16 from the start avoids awkward crops.",
      },
      {
        title: "Organic and paid together",
        body: "The same footage can feed organic posts and ad campaigns, if it is shot with both in mind.",
      },
    ],
    deliverables: [
      {
        title: "Monthly content days",
        body: "A scheduled visit each month or season with a shot list built around your promotions and calendar.",
      },
      {
        title: "Reels and TikToks",
        body: "Short vertical videos with captions, edited to each platform's pacing.",
      },
      {
        title: "Feed and Stories photos",
        body: "Products, people, behind-the-scenes and atmosphere photos cropped for feeds and Stories.",
      },
      {
        title: "Behind-the-scenes clips",
        body: "Footage of your team at work, prep, packing, building or serving customers.",
      },
      {
        title: "Short interviews",
        body: "Owners, staff and customers answering questions on camera, cut into quick clips.",
      },
      {
        title: "Ad-ready versions",
        body: "Select clips cut as Facebook, Instagram and TikTok ads with on-screen calls to action.",
      },
    ],
    uses: [
      "Instagram feed, Stories & Reels",
      "TikTok",
      "Facebook",
      "YouTube Shorts",
      "LinkedIn",
      "Facebook & Instagram ads",
      "TikTok ads",
      "Email newsletters",
    ],
    services: ["commercial-videography", "commercial-photography", "video-editing", "photo-retouching"],
    faqs: [
      {
        q: "How much content do we get from a content day?",
        a: "It depends on the length of the visit and how much editing you want. A typical half-day produces a set of edited photos plus several short vertical videos. We agree on the deliverables when you book.",
      },
      {
        q: "Do you post the content for us?",
        a: "MacroSnaps creates the content. If you want someone to plan, post and manage your accounts, our sister agency MacroHype offers social media management.",
      },
      {
        q: "Can we book monthly?",
        a: "Yes. Many clients schedule recurring content days. Contact us to set a regular schedule.",
      },
      {
        q: "Do you follow trends?",
        a: "We can shoot trend-based formats you choose. We recommend balancing trends with evergreen content that shows your products and people.",
      },
    ],
    macrohype:
      "If you want the posting, community management and ad campaigns handled too, our sister agency MacroHype manages social media and paid social for businesses.",
    related: ["video-ads", "brand-photography", "restaurants"],
    imageSet: "commercial",
  },
  {
    slug: "menu-photography",
    kind: "solution",
    name: "Menu & Food Photography",
    h1: "Menu & Food Photography",
    title: "Menu & Food Photography for Restaurants | MacroSnaps",
    description:
      "Menu photography for restaurants, cafés, bars and caterers: every dish and drink shot for printed menus, online ordering, delivery apps and social media.",
    eyebrow: "Menus, ordering & delivery apps",
    intro: [
      "Menu photos do the selling at the moment of decision: when someone is scanning an online menu, choosing on a delivery app or looking up at a menu board. Clear, appetizing photos of each item help customers decide quickly, try something new and add a dessert or drink they might have skipped if all they had was a line of text.",
      "MacroSnaps food photographers work in your kitchen with your chef. We set up lighting near the pass, photograph each dish as soon as it is plated and capture overhead and angled versions so you have options for every layout. Working quickly at the pass keeps food looking the way it does when it reaches the table.",
      "We deliver images cropped and sized for your printed menu, website, online ordering system and delivery apps such as Uber Eats and DoorDash, with one consistent look across the whole menu. When dishes change, we can match the original lighting and angles so new photos fit right in. Sessions are booked by the hour online and start at $350.",
    ],
    challenges: [
      {
        title: "Consistency across the menu",
        body: "Mixed lighting and angles make a menu look patched together. One setup for all items keeps the menu uniform.",
      },
      {
        title: "Delivery app specs",
        body: "Each app crops and sizes photos differently. We deliver versions that fit their formats.",
      },
      {
        title: "Food changes fast",
        body: "Dishes wilt, melt and cool within minutes. Working right at the pass keeps food looking the way it does when served.",
      },
    ],
    deliverables: [
      {
        title: "Full menu photography",
        body: "Every dish, side, dessert and drink photographed in a consistent style.",
      },
      {
        title: "Overhead flat-lays",
        body: "Top-down shots of single plates and full spreads for menus and social posts.",
      },
      {
        title: "Delivery app image sets",
        body: "Images cropped and sized for Uber Eats, DoorDash, Grubhub and your online ordering platform.",
      },
      {
        title: "Menu board and print images",
        body: "High-resolution files for printed menus, table tents and menu boards.",
      },
      {
        title: "Cocktail and beverage photos",
        body: "Drinks shot with controlled backlight to show color and clarity.",
      },
      {
        title: "Short food clips",
        body: "Pours, sizzles and cheese pulls for Reels, TikTok and digital menu screens.",
      },
    ],
    uses: [
      "Printed and digital menus",
      "Delivery apps (Uber Eats, DoorDash)",
      "Online ordering",
      "Website & menu page",
      "Google Business Profile",
      "Instagram & TikTok",
      "Digital menu boards",
      "Facebook & Instagram ads",
    ],
    services: ["food-photography", "product-photography", "photo-retouching"],
    faqs: [
      {
        q: "How many menu items can you shoot in two hours?",
        a: "It depends on plating time and styling. A kitchen that plates efficiently can often cover a focused menu in two hours; larger menus need more time. We will help you plan the order.",
      },
      {
        q: "Do you photograph on white backgrounds?",
        a: "Yes, if your ordering system or menu design calls for it. We can also shoot on tables and surfaces that match your restaurant.",
      },
      {
        q: "Can you match our existing photos?",
        a: "Yes. Send us examples and we will set up lighting and angles to match, so new dishes fit with the rest of the menu.",
      },
      {
        q: "What does menu photography cost?",
        a: "Photography is $250 for the first hour and $100 for each additional hour, with a two-hour minimum, so sessions start at $350. Edited photos arrive in about a week.",
      },
    ],
    macrohype:
      "MacroHype, our sister agency, can build your restaurant website and online ordering pages and run local Google and social ads that feature your new menu photos.",
    related: ["restaurants", "food-brands", "social-media-content"],
    imageSet: "commercial",
  },
  {
    slug: "website-photos-video",
    kind: "solution",
    name: "Website Photos & Video",
    h1: "Website Photos & Video",
    title: "Website Photography & Video Production | MacroSnaps",
    description:
      "Custom photos and video for your website: hero images, team and office photos, service shots and homepage videos, planned around your page layouts.",
    eyebrow: "Photos for every page",
    intro: [
      "A website built on stock images looks like every other website in your industry. Visitors notice, even if they cannot say why. Your own photos and video show the real people, place and work behind the business, which makes the copy around them more believable and gives visitors a reason to call, book or buy instead of going back to search.",
      "MacroSnaps plans website shoots around your page layouts. We photograph wide hero images with room for headlines, team and office photos for the About page, service and product shots for inner pages, and short silent loops for homepage backgrounds. In Virginia, Maryland, Washington DC, New York and New Jersey we can also create Matterport 3D tours of showrooms, offices and venues that embed directly on your site.",
      "If you are redesigning a site, book the shoot while the design is in progress so the images are made to fit. Share your wireframes and we will build the shot list and crops around them. We deliver high-resolution files plus web-optimized versions, so pages look sharp on large screens and still load quickly on phones.",
    ],
    challenges: [
      {
        title: "Stock images look generic",
        body: "Visitors recognize stock photos. Real images of your business build credibility in seconds.",
      },
      {
        title: "Layouts need specific shapes",
        body: "Hero banners, cards and backgrounds need wide crops and space for text. Planning the shots around your design avoids awkward crops.",
      },
      {
        title: "Pages load on phones",
        body: "Images and video must look good on mobile and still load quickly. We deliver web-ready sizes and files.",
      },
    ],
    deliverables: [
      {
        title: "Hero and banner images",
        body: "Wide images composed with space for headlines and buttons.",
      },
      {
        title: "Team and office photos",
        body: "Portraits, group shots and workplace photos for About and Careers pages.",
      },
      {
        title: "Service and product photos",
        body: "Images that show what you do or sell for each service or product page.",
      },
      {
        title: "Homepage background video",
        body: "Short, silent looping footage designed to sit behind text on your homepage.",
      },
      {
        title: "About and brand video",
        body: "A one- to two-minute video introducing your business, its people and its approach.",
      },
      {
        title: "3D virtual tours",
        body: "Matterport tours of showrooms, offices, venues or properties that embed on your site (VA, MD, DC, NY and NJ).",
      },
    ],
    uses: [
      "Homepage hero",
      "About and team pages",
      "Service and product pages",
      "Landing pages",
      "Careers page",
      "Blog headers",
      "Google Business Profile",
      "Social media profiles",
    ],
    services: ["commercial-photography", "corporate-videography", "virtualtours", "photo-retouching"],
    faqs: [
      {
        q: "Can you work with our web designer?",
        a: "Yes. Share your wireframes or page designs and we will plan the shot list and crops around them.",
      },
      {
        q: "What file sizes do you deliver?",
        a: "We deliver high-resolution files plus web-optimized versions. Video is delivered in formats suitable for web playback and background loops.",
      },
      {
        q: "How long should the shoot be?",
        a: "Most small business websites can be covered in two to four hours. Larger sites with several locations or many services may need a full day.",
      },
      {
        q: "Can you also build the website?",
        a: "MacroSnaps focuses on photo and video. Our sister agency MacroHype designs and builds websites and can use your new content.",
      },
    ],
    macrohype:
      "If you need the website itself, our sister agency MacroHype designs and builds websites, handles SEO and runs ad campaigns that send traffic to the new pages.",
    related: ["brand-photography", "team-headshots", "real-estate"],
    imageSet: "corporate",
  },
  {
    slug: "brand-photography",
    kind: "solution",
    name: "Brand & Lifestyle Photography",
    h1: "Brand & Lifestyle Photography",
    title: "Brand & Lifestyle Photography | MacroSnaps",
    description:
      "Brand and lifestyle photography for businesses: your people, products and places captured in a consistent style for your website, ads and social media.",
    eyebrow: "Your brand, photographed",
    intro: [
      "Brand photography is the library of images that represents your business everywhere: the website, social channels, ads, pitch decks, press and packaging. When those images share a consistent look, people recognize your brand before they read your name. When they come from a mix of phones, stock sites and old shoots, the brand looks less certain of itself.",
      "MacroSnaps brand shoots combine portraits, lifestyle scenes, product details and workplace photos in one planned session. We build a shot list from your brand guidelines and marketing calendar, then photograph your people, customers or models in real settings. We shoot horizontal and vertical frames, with and without people, and leave room for text where you need it.",
      "Lifestyle photography shows your product or service in use, which helps customers picture themselves in the scene. Matching video clips can be captured alongside the photos for social media and your website. Smaller shoots are booked by the hour online, and larger multi-location or model-heavy shoots get a custom quote with locations and casting planned in advance.",
    ],
    challenges: [
      {
        title: "A consistent look",
        body: "Images from different photographers and phones rarely match. A planned brand shoot gives you a coherent set.",
      },
      {
        title: "Showing the customer",
        body: "Lifestyle images show who your product is for and how it fits into their day.",
      },
      {
        title: "Enough images to go around",
        body: "Marketing teams need variety: horizontal and vertical, with and without people, room for text. Planning for that up front saves reshoots.",
      },
    ],
    deliverables: [
      {
        title: "Founder and team portraits",
        body: "Portraits in your brand style for websites, press and speaking.",
      },
      {
        title: "Lifestyle scenes",
        body: "Customers or models using your product or service in real settings.",
      },
      {
        title: "Product and detail shots",
        body: "Close-ups and styled shots that match your brand palette.",
      },
      {
        title: "Workplace and process photos",
        body: "Your team making, building, serving or meeting with clients.",
      },
      {
        title: "Text-friendly images",
        body: "Photos composed with negative space for headlines, ads and presentations.",
      },
      {
        title: "Short brand video clips",
        body: "Matching video clips captured alongside the photos for social and web.",
      },
    ],
    uses: [
      "Website & landing pages",
      "Facebook & Instagram ads",
      "Instagram & LinkedIn",
      "Pitch decks and proposals",
      "Press kits",
      "Email campaigns",
      "Packaging and print",
      "YouTube & Google ads",
    ],
    services: ["commercial-photography", "product-photography", "commercial-videography", "photo-retouching"],
    faqs: [
      {
        q: "How do you plan a brand shoot?",
        a: "We review your brand guidelines, current images and upcoming campaigns, then agree on a shot list, locations and people before the shoot.",
      },
      {
        q: "Do you provide models?",
        a: "We can include models in a custom quote, or photograph your team and customers who agree to appear.",
      },
      {
        q: "Can we shoot at more than one location?",
        a: "Yes. Multi-location shoots are common. Travel time between locations is part of the booked time or a custom quote.",
      },
      {
        q: "How often should we update brand photos?",
        a: "Many businesses refresh once or twice a year, or when they launch a new product, open a location or update their brand.",
      },
    ],
    macrohype:
      "MacroHype, our sister agency, can put your new brand library to work on a redesigned website, social media and digital ad campaigns.",
    related: ["website-photos-video", "social-media-content", "team-headshots"],
    imageSet: "personal",
  },
  {
    slug: "testimonial-videos",
    kind: "solution",
    name: "Customer Testimonial Videos",
    h1: "Customer Testimonial Videos",
    title: "Customer Testimonial Video Production | MacroSnaps",
    description:
      "Customer testimonial and case study videos: interviews with real clients, filmed and edited for your website, sales team, social media and video ads.",
    eyebrow: "Customer stories on camera",
    intro: [
      "Prospects trust other customers more than they trust your marketing. A real customer explaining the problem they had, why they chose you and what changed is one of the most persuasive pieces of content a business can have. It works on your website, in sales conversations and in ads, and it answers objections your own copy cannot.",
      "MacroSnaps films testimonial and case study videos at your customer's location, your office or an event where clients are already gathered. You choose and invite the customers; we prepare the questions with you, guide the interview so the answers are natural and specific, then edit them into a short story with supporting footage of the product, place or people.",
      "Each interview can produce a full case study video, short captioned clips for social media and 15- or 30-second ad cut-downs for YouTube, Google, Facebook and Instagram. Everyone on camera signs a release, and your team approves every edit before anything is published. Edited videos are typically delivered in two to four weeks after filming.",
    ],
    challenges: [
      {
        title: "Getting natural answers",
        body: "Customers are not actors. A relaxed interview with good questions produces honest, usable answers.",
      },
      {
        title: "Scheduling around customers",
        body: "Customers are giving their time. We keep setups quick and can film several at an event or one location.",
      },
      {
        title: "One interview, many uses",
        body: "Sales teams, websites and ad campaigns need different lengths. We cut each interview into several versions.",
      },
    ],
    deliverables: [
      {
        title: "Testimonial interviews",
        body: "Two-camera interviews with good lighting and clean audio at your chosen location.",
      },
      {
        title: "Case study videos",
        body: "Two- to three-minute stories combining interviews with footage of the product or service in use.",
      },
      {
        title: "Short social clips",
        body: "30- to 60-second highlights with captions for LinkedIn, Instagram and Facebook.",
      },
      {
        title: "Ad cut-downs",
        body: "15- and 30-second versions for YouTube, Google, Facebook and Instagram ads.",
      },
      {
        title: "Event testimonial booths",
        body: "A filming station at your conference or event where several customers record short interviews.",
      },
      {
        title: "Customer portraits",
        body: "Still photos of each customer for case study pages and quotes.",
      },
    ],
    uses: [
      "Website & case study pages",
      "Sales decks and proposals",
      "YouTube & Google ads",
      "Facebook & Instagram ads",
      "LinkedIn",
      "Email nurture campaigns",
      "Landing pages",
      "Event and trade show screens",
    ],
    services: ["corporate-videography", "commercial-videography", "video-editing", "conference-videography"],
    faqs: [
      {
        q: "Do you find customers for us?",
        a: "No. You choose and invite the customers. We help you prepare them and handle the interview and filming.",
      },
      {
        q: "Do you write the questions?",
        a: "Yes. We suggest questions based on your goals and review them with you before the shoot. Customers do not need a script.",
      },
      {
        q: "Can you film several testimonials in one day?",
        a: "Yes. At an event or a single location we can usually film several short interviews in a few hours.",
      },
      {
        q: "Do customers need to sign a release?",
        a: "Yes. Everyone who appears on camera should sign a release. We can bring a standard release or use yours.",
      },
    ],
    macrohype:
      "MacroHype, our sister agency, can feature your testimonials on landing pages and run them as Google, YouTube and social ads to reach new prospects.",
    related: ["video-ads", "event-marketing-content", "law-firms"],
    imageSet: "corporate",
  },
  {
    slug: "event-marketing-content",
    kind: "solution",
    name: "Event Recaps & Marketing Content",
    h1: "Event Recap Videos & Marketing Content",
    title: "Event Recap Videos & Event Marketing Content | MacroSnaps",
    description:
      "Conference and event recap videos, sponsor content, speaker clips and photo galleries that promote your next event and give sponsors what they paid for.",
    eyebrow: "Conferences, galas & corporate events",
    intro: [
      "An event lasts a day or two. The content from it can sell the next one for a year. Recap videos, speaker clips and photo galleries show prospective attendees and sponsors what they missed, give sponsors proof of what they paid for and give your marketing team material long after the venue is cleared.",
      "MacroSnaps covers conferences, trade shows, summits, galas, product launches and corporate events across the US, Ontario and Quebec. Our photographers and videographers capture keynotes, panels, booths, networking and the details planners worked hard on, with a shot list built around your marketing plan and sponsor commitments. Multi-track events get enough crew to cover parallel sessions.",
      "We can live stream keynotes and sessions for remote attendees, and deliver the full retouched gallery in about a week. Highlight and recap videos are edited in two to four weeks, with short speaker and sponsor clips cut from the same footage. Multi-day events get a custom quote.",
    ],
    challenges: [
      {
        title: "Selling next year's event",
        body: "A recap video and strong photos are the clearest way to show prospective attendees and sponsors what the event offers.",
      },
      {
        title: "Sponsor commitments",
        body: "Sponsors expect proof of logo placement, booth traffic and stage time. Covering it on a shot list makes reporting easy.",
      },
      {
        title: "Many rooms at once",
        body: "Multi-track conferences run several sessions in parallel. Multiple photographers and videographers keep every key moment covered.",
      },
    ],
    deliverables: [
      {
        title: "Event recap video",
        body: "A one- to three-minute highlight video with music, crowd moments and speaker soundbites.",
      },
      {
        title: "Sponsor content",
        body: "Photos and clips of sponsor booths, signage and stage moments for sponsor reports.",
      },
      {
        title: "Speaker and session clips",
        body: "Short edited clips of keynotes and panels for social media and next year's promotion.",
      },
      {
        title: "Event photo galleries",
        body: "Keynotes, breakouts, networking, exhibit hall and venue details, delivered in about a week.",
      },
      {
        title: "Attendee interviews",
        body: "Short on-site interviews with attendees, speakers and sponsors.",
      },
      {
        title: "Live streaming",
        body: "Live streams of keynotes and sessions for remote attendees.",
      },
    ],
    uses: [
      "Event website & registration pages",
      "Sponsor prospectus and reports",
      "LinkedIn",
      "Instagram & Facebook",
      "YouTube",
      "Facebook & Instagram ads",
      "Email promotion for next year",
      "Press and media kits",
    ],
    services: ["conference-videography", "conference-photography", "event-videography", "live-stream"],
    faqs: [
      {
        q: "Can you deliver photos during the event?",
        a: "Yes. We can send a selection of quickly edited photos the same day for social posts, with the full gallery delivered in about a week.",
      },
      {
        q: "How many photographers do we need?",
        a: "One photographer can cover a single-track event. Multi-track conferences, large exhibit halls or galas with several moments at once often need two or more. We will recommend a crew size.",
      },
      {
        q: "Do you cover events outside New York and DC?",
        a: "Yes. Our own photographers and videographers work across the US, Ontario and Quebec.",
      },
      {
        q: "How long does a recap video take?",
        a: "Highlight videos are typically delivered in two to four weeks. Short social clips can be prioritized.",
      },
      {
        q: "What does event coverage cost?",
        a: "Photography is $250 for the first hour and $100 for each additional hour; video is $300 for the first hour and $200 for each additional hour. Two-hour minimum. Multi-day events get a custom quote.",
      },
    ],
    macrohype:
      "Our sister agency MacroHype can build your event website and run registration campaigns on Google, Facebook, Instagram and LinkedIn using the recap content.",
    related: ["nonprofits-associations", "tech-startups", "testimonial-videos"],
    imageSet: "conference",
  },
  {
    slug: "team-headshots",
    kind: "solution",
    name: "Team Photos & Headshots",
    h1: "Team Photos & Headshots",
    title: "Team Photos & Office Headshots | MacroSnaps",
    description:
      "Team photos, office headshots and group portraits for websites, LinkedIn and press. On-site sessions across the US, Ontario and Quebec with consistent lighting.",
    eyebrow: "Teams, offices & groups",
    intro: [
      "Your team page is one of the most visited pages on your website. Matching headshots and a good group photo make a company look organized and approachable; a mix of selfies, old photos and missing faces does the opposite. The same photos also show up on LinkedIn, in email signatures, proposals and press releases.",
      "MacroSnaps sets up a portrait station at your office or event and photographs each person in a short slot, with the same lighting and background so every photo matches. We also take group photos, department photos and candid workplace shots. We record the setup, so new hires photographed months later can match the original set, even in another city.",
      "For dedicated headshot sessions, including individual bookings and studio-style sessions, our sister brand MacroHeadshots (https://macroheadshots.com/) specializes in headshots. MacroSnaps is the better fit when you want headshots combined with team, office, event or brand photography in a single visit. Light retouching is included, and edited photos are delivered in about a week.",
    ],
    challenges: [
      {
        title: "Everyone needs to match",
        body: "Consistent lighting, background and framing make a team page look professional. We keep the setup the same for everyone.",
      },
      {
        title: "Minimal time away from work",
        body: "Each person sits for a few minutes. We schedule slots so departments rotate through without disrupting the day.",
      },
      {
        title: "New hires keep arriving",
        body: "We record the setup so later sessions can match the original photos.",
      },
    ],
    deliverables: [
      {
        title: "Matching team headshots",
        body: "Consistent portraits of every employee on a backdrop or in your office.",
      },
      {
        title: "Group and department photos",
        body: "Full-team and department photos for the website, annual reports and press.",
      },
      {
        title: "Leadership portraits",
        body: "Executive portraits for leadership pages, press releases and speaking bios.",
      },
      {
        title: "Candid workplace photos",
        body: "People working, meeting and collaborating, for Careers and About pages.",
      },
      {
        title: "Event headshot stations",
        body: "Headshot stations at conferences and corporate events for attendees or staff.",
      },
      {
        title: "Retouched finals",
        body: "Light retouching for skin, flyaways and backgrounds, with consistent color across the set.",
      },
    ],
    uses: [
      "Website team pages",
      "LinkedIn profiles",
      "Email signatures",
      "Press releases and media kits",
      "Speaker and event bios",
      "Internal directories",
      "Proposals and pitch decks",
    ],
    services: ["corporate-event-photography", "commercial-photography", "photo-retouching", "conference-photography"],
    faqs: [
      {
        q: "What's the difference between MacroSnaps and MacroHeadshots?",
        a: "MacroHeadshots (macroheadshots.com) specializes in headshot sessions. MacroSnaps handles headshots as part of larger shoots that also include team, office, event or brand photography.",
      },
      {
        q: "How many people can you photograph in an hour?",
        a: "It depends on how many photos each person wants to choose from, but a well-scheduled session moves quickly. Tell us your headcount and we will estimate the time.",
      },
      {
        q: "Can remote employees match the office photos?",
        a: "Yes. Our photographers work across the US, Ontario and Quebec and can recreate the same setup in other cities.",
      },
      {
        q: "Do you retouch headshots?",
        a: "Yes. Light retouching is included. Advanced retouching is available as a separate service.",
      },
    ],
    macrohype:
      "MacroHype, our sister agency, can redesign your team and About pages, refresh your LinkedIn presence and handle PR that uses your new photos.",
    related: ["law-firms", "website-photos-video", "recruiting-videos"],
    imageSet: "corporate",
  },
  {
    slug: "product-launch-content",
    kind: "solution",
    name: "Product Launch Content",
    h1: "Product Launch Photos & Video",
    title: "Product Launch Photography & Video | MacroSnaps",
    description:
      "Photos and video for product launches: product shots, launch videos, event coverage, live streams and ad spots, ready for launch day across every channel.",
    eyebrow: "Launch-day content",
    intro: [
      "A product launch needs a lot of content on one date: product photos for the store and press, a launch video for the homepage, ads for each platform and coverage of the launch event itself. Planning it all as one production keeps the look consistent, avoids last-minute reshoots and keeps the deadlines realistic for everyone involved.",
      "MacroSnaps produces launch content for consumer products, food and beverage, software, hardware and services. We photograph the product on white and in context, film demo and announcement videos, cover launch parties and press events, and live stream keynote announcements. We handle pre-release products carefully and keep your shoot confidential.",
      "Photos take about a week to edit and videos two to four weeks, so we recommend shooting at least a month before launch. Larger launch campaigns with multiple shoot days or cities get a custom quote and a schedule built backward from your launch date, with ad versions for every platform you plan to run.",
    ],
    challenges: [
      {
        title: "Fixed deadlines",
        body: "Launch dates do not move. We schedule shoots and edits to give you files well before go-live.",
      },
      {
        title: "Content for every channel",
        body: "Store pages, press kits, social, ads and retailers all need different formats from the same launch.",
      },
      {
        title: "Showing what is new",
        body: "Launch content needs to make the new features clear in seconds, especially in ads.",
      },
    ],
    deliverables: [
      {
        title: "Product photos",
        body: "White-background, detail and lifestyle images for e-commerce, press and retailers.",
      },
      {
        title: "Launch announcement video",
        body: "A one- to two-minute video introducing the product, its features and who it is for.",
      },
      {
        title: "Demo and how-to videos",
        body: "Short videos showing setup, features and use.",
      },
      {
        title: "Launch event coverage",
        body: "Photos and video of launch parties, press events and keynote announcements.",
      },
      {
        title: "Live stream",
        body: "Live broadcast of the announcement to customers, press and partners.",
      },
      {
        title: "Launch ad set",
        body: "Spots for YouTube, Google, Facebook, Instagram, TikTok and local TV.",
      },
    ],
    uses: [
      "Product pages and online store",
      "Amazon & marketplace listings",
      "Press kits",
      "YouTube & Google ads",
      "Facebook & Instagram ads",
      "TikTok ads",
      "Retailer and distributor materials",
      "Email announcements",
    ],
    services: ["product-photography", "commercial-videography", "live-stream", "corporate-event-photography"],
    faqs: [
      {
        q: "How far ahead should we book?",
        a: "Book as early as possible. Photos take about a week to edit and videos two to four weeks, so we recommend shooting at least a month before launch.",
      },
      {
        q: "Can you shoot prototypes or pre-release products?",
        a: "Yes. We handle pre-release products carefully and keep your shoot confidential.",
      },
      {
        q: "Can you live stream the launch?",
        a: "Yes. We live stream launch events and keynotes and can record the stream for later editing.",
      },
      {
        q: "Do you handle launches in multiple cities?",
        a: "Yes. Our crews work across the US, Ontario and Quebec, so we can cover simultaneous launch events.",
      },
    ],
    macrohype:
      "MacroHype, our sister agency, can build the launch landing page, run Google and social ad campaigns and handle PR outreach using your launch content.",
    related: ["tech-startups", "food-brands", "video-ads"],
    imageSet: "commercial",
  },
  {
    slug: "recruiting-videos",
    kind: "solution",
    name: "Recruiting & Culture Videos",
    h1: "Recruiting & Company Culture Videos",
    title: "Recruiting & Company Culture Videos | MacroSnaps",
    description:
      "Recruiting and culture videos with real employees: day-in-the-life footage, team interviews and office photos for your careers page, LinkedIn and job ads.",
    eyebrow: "Careers & employer brand",
    intro: [
      "Candidates research employers the way customers research products. They want to see the office, meet the team and hear from people doing the job. A recruiting video and real workplace photos answer those questions better than a list of benefits, and they help your listings stand out on job boards where most posts read the same.",
      "MacroSnaps films recruiting and culture videos with your actual employees. We interview team members about their work, film day-in-the-life footage and capture company events, then edit it into a careers page video, role-specific clips and short social posts. Interviews stay conversational, so people who have never been on camera still come across naturally.",
      "We also photograph offices, teams and culture events for your careers page and job listings. For companies hiring in several cities, our own crews across the US, Ontario and Quebec can film each location in the same style. Filming usually takes a half day to a full day per location, and editing takes two to four weeks.",
    ],
    challenges: [
      {
        title: "Job posts look the same",
        body: "Most listings read alike. Video of real people and real workspaces helps your roles stand out.",
      },
      {
        title: "Employees are not actors",
        body: "We keep interviews conversational so team members come across naturally on camera.",
      },
      {
        title: "Different roles, different stories",
        body: "Engineers, nurses, drivers and sales teams want to see their own role. Role-specific clips speak to each audience.",
      },
    ],
    deliverables: [
      {
        title: "Careers page video",
        body: "A two- to three-minute video about your company, culture and people.",
      },
      {
        title: "Employee interviews",
        body: "Team members talking about their work, growth and what they like about the company.",
      },
      {
        title: "Day-in-the-life videos",
        body: "Footage following a role through a typical day, for specific job openings.",
      },
      {
        title: "Office and team photos",
        body: "Workplace, team and candid photos for your careers page and job posts.",
      },
      {
        title: "Culture event coverage",
        body: "Team outings, volunteer days, offsites and holiday parties.",
      },
      {
        title: "Social and job ad clips",
        body: "Short vertical and square clips for LinkedIn, Instagram, TikTok and recruiting ads.",
      },
    ],
    uses: [
      "Careers page",
      "LinkedIn company page and posts",
      "Job boards and listings",
      "Facebook & Instagram ads",
      "TikTok & Instagram Reels",
      "YouTube",
      "Career fairs and campus recruiting",
      "Onboarding materials",
    ],
    services: ["corporate-videography", "corporate-event-photography", "video-editing", "commercial-photography"],
    faqs: [
      {
        q: "How do you choose who to interview?",
        a: "You select employees who are willing to participate. We suggest a mix of roles, tenure and locations, and prepare questions with you.",
      },
      {
        q: "Can you film at several offices or sites?",
        a: "Yes. Our own crews work across the US, Ontario and Quebec, so we can film each location with the same style.",
      },
      {
        q: "How long does a recruiting video take?",
        a: "Filming is usually a half day to a full day per location. Editing takes two to four weeks, depending on the number of versions.",
      },
      {
        q: "What does it cost?",
        a: "Video is $300 for the first hour and $200 for each additional hour, with a two-hour minimum. Multi-location productions get a custom quote.",
      },
    ],
    macrohype:
      "MacroHype, our sister agency, can build or refresh your careers site and run recruiting ad campaigns on Google, Facebook and Instagram using your new videos.",
    related: ["tech-startups", "team-headshots", "education"],
    imageSet: "corporate",
  },
];
