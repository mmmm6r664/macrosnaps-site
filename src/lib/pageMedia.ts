import type { Tag } from "@/data/videos";
// Which own photos / videos belong on industry, solution and event-type pages.

export const VERTICAL_MEDIA: Record<string, { photos: string[]; videos: Tag[] }> = {
  "dental-clinics": { photos: ["medical"], videos: [] },
  "medical-practices": { photos: ["medical"], videos: [] },
  restaurants: { photos: [], videos: ["restaurant"] },
  "food-brands": { photos: [], videos: ["restaurant"] },
  "law-firms": { photos: [], videos: [] },
  "real-estate": { photos: ["realestate"], videos: [] },
  "hotels-hospitality": { photos: [], videos: ["tradeshow"] },
  "event-venues": { photos: ["wedding", "gala"], videos: ["wedding"] },
  "fitness-gyms": { photos: [], videos: [] },
  "salons-beauty": { photos: ["retouching"], videos: [] },
  "retail-ecommerce": { photos: ["studio"], videos: ["commercial"] },
  "tech-startups": { photos: ["conference", "corporate"], videos: ["conference"] },
  "financial-services": { photos: ["corporate"], videos: ["corporate"] },
  "nonprofits-associations": { photos: ["gala", "event", "conference"], videos: ["community", "corporate"] },
  education: { photos: ["graduation"], videos: ["party"] },
  "home-services": { photos: [], videos: [] },
  "video-ads": { photos: [], videos: ["restaurant", "commercial"] },
  "social-media-content": { photos: ["party", "event"], videos: ["commercial", "event"] },
  "menu-photography": { photos: [], videos: ["restaurant"] },
  "website-photos-video": { photos: ["studio", "corporate"], videos: ["commercial"] },
  "brand-photography": { photos: ["portrait", "studio"], videos: ["commercial"] },
  "testimonial-videos": { photos: [], videos: ["corporate"] },
  "event-marketing-content": { photos: ["conference", "tradeshow"], videos: ["conference", "tradeshow"] },
  "team-headshots": { photos: ["corporate"], videos: [] },
  "product-launch-content": { photos: ["conference", "corporate"], videos: ["conference", "tradeshow"] },
  "recruiting-videos": { photos: ["corporate"], videos: ["corporate"] },
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
  "corporate-event-photography": ["corporate", "conference"], "corporate-videography": ["corporate", "conference"],
  "trade-show-photography": ["tradeshow"], "event-photography": ["party", "event"], "event-videography": ["party", "event"],
  "wedding-photography": ["wedding"], "wedding-videography": ["wedding"], "engagement-photography": ["wedding"], "engagement-videography": ["wedding"],
  "commercial-photography": ["commercial"], "commercial-videography": ["commercial"], "food-photography": ["restaurant"],
  "photo-booth": ["party"], "video-editing": ["conference", "wedding"], "graduation-photography": ["party"],
  photographers: ["conference", "wedding", "party"], videographers: ["conference", "wedding", "commercial"],
};

/** States where Matterport 3D virtual tours are offered. */
export const TOUR_STATES = ["VA", "MD", "DC", "NY", "NJ"];

/** Event types to feature on wedding vs. event pages. */
export const WEDDING_EVENTS = ["indian-wedding-photography", "pakistani-wedding-photography", "engagement-party-photography", "religious-ceremony-photography"];
