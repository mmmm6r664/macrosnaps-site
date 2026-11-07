// 301s from the old site URLs so existing rankings and links carry over.
type R = { source: string; destination: string; permanent: true };
const r = (source: string, destination: string): R => ({ source, destination, permanent: true });

const PRODUCT: Record<string, string> = {
  "event-photography": "event-photography", "wedding-photography": "wedding-photography", "engagement-portraits": "engagement-photography",
  "commercial-photography": "commercial-photography", "real-estate-photography": "real-estate-photography", "family-portraits": "family-photography",
  "maternity-shoot": "maternity-photography", "newborn-portraits": "newborn-photography", "dating-portraits": "dating-photography",
  "graduation-portraits": "graduation-photography", "event-videography": "event-videography", "real-estate-videography": "real-estate-videography",
  "commercial-videography": "commercial-videography", "wedding-videography": "wedding-videography",
};

export const redirects: R[] = [
  // Old blog: every post and blog page goes to the homepage (specific post redirects listed below take priority).
  r("/blog", "/"),
  r("/blog/:path*", "/"),
  r("/blogs/:path*", "/"),
  r("/favicon.ico", "/icon-64.png"),
  r("/new-york-city-photographers", "/photographers/new-york-city-ny"),
  r("/newyorkheadshots", "/photographers/new-york-city-ny"),
  r("/reston-virginia-photography", "/photographers/reston-va"),
  r("/germantown-maryland-photography", "/photographers/germantown-md"),
  r("/arlington-virginia-photographers", "/photographers/arlington-va"),
  r("/passaic-new-jersey-photography", "/photographers/passaic-nj"),
  r("/paterson-new-jersey-photography", "/photographers/paterson-nj"),
  r("/book-online", "/book"),
  r("/photography-services", "/photographers"),
  r("/videography-services", "/videographers"),
  r("/book-now", "/book"),
  r("/videography", "/videographers"),
  r("/shop", "/book"),
  r("/terms-conditions", "/terms"),
  r("/privacy-policy", "/privacy"),
  r("/post/macrosnaps-faq-knowledge-base", "/faq"),
  r("/product-page/headshot-photography", "https://macroheadshots.com/"),
  r("/product-page/boudoir", "/book"),
  ...Object.entries(PRODUCT).map(([from, to]) => r(`/product-page/${from}`, `/book?service=${to}`)),
  r("/post/:slug*", "/"),
];
