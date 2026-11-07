// Live Matterport tours and content from macrosnaps.com/virtualtours.
// Only tours that are still live on Matterport. (aqQJkB12Usm, J6SGzkjpFCv, cKveLi4w5tr, JAikWQf2Jd3 and
// ERM6wY2E3pu on the old site show "model not available"; reactivate them in Matterport, then add them back here.)
export const TOUR_CATEGORIES: { name: string; tours: string[] }[] = [
  { name: "Wedding Banquets", tours: ["eoszL4B7aaW", "6QZbEnjnFFM"] },
  { name: "Hotels", tours: ["gNqFVNDTAPy", "2TQAGZ2JRT6"] },
  { name: "Real Estate", tours: ["1HPbtLDTsdC"] },
  { name: "Museums", tours: ["LAFuHDGRL2q"] },
  { name: "Restaurants", tours: ["3h63g6NWcJ2"] },
];

export const TOUR_INDUSTRIES = [
  "Condos & Apartments", "Golf Courses", "Assisted Living", "Commercial & Industrial", "Healthcare", "Hotels & Resorts",
  "Country Clubs", "Luxury Real Estate", "Educational Facilities", "Restaurants", "Event Venues", "Sports Venues",
];

export const TOUR_CITIES: { region: string; cities: string[] }[] = [
  { region: "New York", cities: ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island", "Long Island", "New York City"] },
  { region: "New Jersey", cities: ["Newark", "Jersey City", "Hoboken", "Secaucus", "Elizabeth", "Paterson", "Clifton", "Hackensack", "Fort Lee", "Englewood", "Wayne", "Parsippany", "Morristown", "Union"] },
  { region: "Washington, DC", cities: ["Washington, DC"] },
  { region: "Maryland", cities: ["Bethesda", "Silver Spring", "Rockville", "Gaithersburg", "Hyattsville", "College Park"] },
  { region: "Virginia", cities: ["Arlington", "Alexandria", "Fairfax", "Falls Church", "Tysons", "Reston", "Herndon"] },
];

export const TOUR_TESTIMONIAL = {
  quote: "We got a genuinely captivating, customized virtual experience for our golf club. It was an exceptionally positive experience and we look forward to working with MacroSnaps again.",
  name: "Jason B.", role: "Director, CountrySide Golf Resorts",
};

export const TOUR_FAQS = [
  { q: "Where do you provide 3D virtual tours?", a: "We create Matterport 3D virtual tours in Virginia, Maryland, Washington, DC, New York and New Jersey, including Manhattan, Brooklyn, Newark, Jersey City, Hoboken, Bethesda, Arlington, Tysons and Reston. Tell us the property address when you book and we'll schedule your scan." },
  { q: "Which camera do you use for virtual tours?", a: "We scan with a Matterport camera, so your tour has the familiar Matterport walkthrough, dollhouse view and floor plan views." },
  { q: "How long does it take to scan a location?", a: "Anywhere from 30 minutes to 2 hours, depending on the size and layout of the space." },
  { q: "How much does a 3D virtual tour cost?", a: "Prices are by size: $200 up to 1,000 sq ft, $300 for 1,000–2,499 sq ft, $400 for 2,500–4,999 sq ft, $500 for 5,000–7,499 sq ft and $600 for 7,500–10,000 sq ft. Every tour includes 1 month of hosting; after that, hosting is $10 per month to keep the tour live. For spaces over 10,000 sq ft, call 877-622-4973 or email info@macrosnaps.com." },
  { q: "Which industries are virtual tours useful for?", a: "Real estate and rentals, wedding and banquet venues, restaurants, bars, hotels and resorts, museums, schools and day care centers, golf courses and country clubs, healthcare and assisted living, offices, retail and sports venues." },
  { q: "What devices do the tours work on?", a: "Every tour works in a web browser on iPhones, iPads, Android phones and tablets, Microsoft Surface, Mac and PC, and in VR headsets. We can also export a tour as an offline file for sharing without an internet connection." },
  { q: "Can I put the tour on my website or listing?", a: "Yes. You get a share link and an embed code for your website, MLS listing, Google Business Profile or social media." },
  { q: "What does a virtual tour photographer do?", a: "A virtual tour photographer captures a space with a 3D camera from many positions, then the scans are stitched into an interactive model that people can walk through online as if they were there." },
];
