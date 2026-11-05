import type { Tag } from "@/data/videos";
// Which own photos / videos belong on industry, solution and event-type pages.

export const VERTICAL_MEDIA: Record<string, { photos: string[]; videos: Tag[] }> = {
  "dental-clinics": { photos: ["medical"], videos: ["medical", "ad"] },
  "medical-practices": { photos: ["medical"], videos: ["medical", "ad"] },
  restaurants: { photos: [], videos: ["restaurant", "ad"] },
  "food-brands": { photos: [], videos: ["restaurant", "ad"] },
  "law-firms": { photos: [], videos: ["ad"] },
  "real-estate": { photos: ["realestate"], videos: [] },
  "hotels-hospitality": { photos: [], videos: ["tradeshow"] },
  "event-venues": { photos: ["wedding", "gala"], videos: ["wedding"] },
  "fitness-gyms": { photos: [], videos: ["ad"] },
  "salons-beauty": { photos: ["retouching"], videos: [] },
  "retail-ecommerce": { photos: ["studio"], videos: ["ad", "commercial"] },
  "tech-startups": { photos: ["conference", "corporate"], videos: ["tech", "conference"] },
  "financial-services": { photos: ["corporate"], videos: ["corporate"] },
  "nonprofits-associations": { photos: ["gala", "event", "conference"], videos: ["community", "corporate"] },
  education: { photos: ["graduation"], videos: ["party"] },
  "home-services": { photos: [], videos: ["homeservices", "ad"] },
  "video-ads": { photos: [], videos: ["ad"] },
  "social-media-content": { photos: ["party", "event"], videos: ["ad", "event"] },
  "menu-photography": { photos: [], videos: ["restaurant"] },
  "website-photos-video": { photos: ["studio", "corporate"], videos: ["ad"] },
  "brand-photography": { photos: ["portrait", "studio"], videos: ["ad"] },
  "testimonial-videos": { photos: [], videos: ["recruiting", "medical", "corporate"] },
  "event-marketing-content": { photos: ["conference", "tradeshow"], videos: ["conference", "tradeshow"] },
  "team-headshots": { photos: ["corporate"], videos: [] },
  "product-launch-content": { photos: ["conference", "corporate"], videos: ["conference", "tradeshow"] },
  "recruiting-videos": { photos: ["corporate"], videos: ["recruiting", "corporate"] },
};

export const EVENT_PHOTO_TAGS: Record<string, string[]> = {
  "bar-mitzvah-photography": ["party", "event"],
  "indian-wedding-photography": ["indian", "wedding"],
  "pakistani-wedding-photography": ["wedding"],
  "quinceanera-photography": ["party", "event"],
  "sweet-16-photography": ["party"],
  "birthday-party-photography": ["party"],
  "anniversary-party-photography": ["party", "event"],
  "gender-reveal-baby-shower-photography": ["maternity", "party"],
  "graduation-party-photography": ["graduation", "party"],
  "gala-fundraiser-photography": ["gala", "event"],
  "holiday-party-photography": ["party", "corporate"],
  "award-ceremony-photography": ["gala", "conference"],
  "engagement-party-photography": ["engagement"],
  "religious-ceremony-photography": ["family", "newborn"],
  "festival-community-event-photography": ["community", "event"],
};

export const SERVICE_VIDEO_TAGS: Record<string, Tag[]> = {
  "conference-photography": ["conference"], "conference-videography": ["conference"], "live-stream": ["conference"],
  "corporate-event-photography": ["corporate", "conference"], "corporate-videography": ["corporate", "ad", "conference"],
  "trade-show-photography": ["tradeshow"], "event-photography": ["party", "event"], "event-videography": ["party", "event"],
  "wedding-photography": ["wedding"], "wedding-videography": ["wedding"], "engagement-photography": ["wedding"], "engagement-videography": ["wedding"],
  "commercial-photography": ["ad", "commercial"], "commercial-videography": ["ad", "commercial"], "food-photography": ["restaurant"],
  "photo-booth": ["party"], "video-editing": ["conference", "wedding"], "graduation-photography": ["party"],
  photographers: ["conference", "wedding", "party"], videographers: ["conference", "wedding", "commercial"],
};

/** States where Matterport 3D virtual tours are offered. */
export const TOUR_STATES = ["VA", "MD", "DC", "NY", "NJ"];

/** Event types to feature on wedding vs. event pages. */
export const WEDDING_EVENTS = ["indian-wedding-photography", "pakistani-wedding-photography", "engagement-party-photography", "religious-ceremony-photography"];
