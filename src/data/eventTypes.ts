import { MORE_EVENT_TYPES_1 } from "./eventTypes.more1";
import { MORE_EVENT_TYPES_2 } from "./eventTypes.more2";
// Content for event-type landing pages (e.g. /bar-mitzvah-photography).
// Facts used here must stay in line with site-wide pricing, delivery and insurance details.

export type EventType = {
  slug: string; // e.g. "bar-mitzvah-photography"
  name: string; // menu label e.g. "Bar & Bat Mitzvahs"
  pro: string; // e.g. "Bar Mitzvah Photographer"
  h1: string; // e.g. "Bar & Bat Mitzvah Photography & Videography"
  title: string;
  description: string;
  intro: string[]; // 3 paragraphs, 60-100 words each; include one on transparent pricing/insurance/experience phrased for this event
  moments: { title: string; body: string }[]; // 7-8 key moments/parts we capture, 1-2 sentences each
  planning: { title: string; body: string }[]; // 4 practical planning tips (timeline, how many hours to book, light/venue, second shooter / video)
  suggestedHours: { photo: number; video: number; note: string }; // typical coverage hours
  faqs: { q: string; a: string }[]; // 5
  videoTags: ("wedding" | "party" | "event" | "corporate" | "conference" | "community")[]; // which of our YouTube videos fit
  imageSet: "wedding" | "event" | "personal" | "corporate" | "conference";
  related: string[]; // 3 other slugs from this file
};

const BASE_EVENT_TYPES: EventType[] = [
  // ---------------------------------------------------------------- Bar & Bat Mitzvahs
  {
    slug: "bar-mitzvah-photography",
    name: "Bar & Bat Mitzvahs",
    pro: "Bar Mitzvah Photographer",
    h1: "Bar & Bat Mitzvah Photography & Videography",
    title: "Bar & Bat Mitzvah Photographer & Videographer | MacroSnaps",
    description:
      "Bar and Bat Mitzvah photography and video: family portraits, the service, hora and candle-lighting. Open pricing from $350 and our own crews in every state.",
    intro: [
      "A Bar or Bat Mitzvah is years of study coming together in one weekend: the Torah reading, the speeches, the hora and a party with friends and family who may have travelled a long way to be there. MacroSnaps photographers and videographers cover the whole celebration, from formal family portraits before the service to the last song on the dance floor, so you can stay present while we keep track of the moments that matter.",
      "Many congregations do not allow photography during Shabbat or holiday services. We plan around your synagogue's rules from the start, usually with a pre-service portrait session at the sanctuary, on the bimah and with the Torah if your rabbi permits it. At the reception we follow the evening closely: the grand entrance, the hora with the chair lift, the candle-lighting ceremony with each honoree, and the speeches from parents and grandparents.",
      "Our prices are listed openly and are the same for every family: photography is $250 for the first hour and $100 for each additional hour, and videography is $300 for the first hour and $200 for each additional hour, with a two-hour minimum. You can book and pay online. MacroSnaps is part of MacroHype LLC, which has worked with clients since 2011, and we are insured through State Farm, with certificates of insurance available for your venue.",
    ],
    moments: [
      { title: "Pre-service portraits", body: "Family and individual portraits in the sanctuary, often on the bimah and with the Torah or tallit, taken before services begin so nothing conflicts with your congregation's rules." },
      { title: "The service", body: "Where your synagogue permits it, we photograph the aliyah, the Torah reading and the d'var Torah discreetly from approved positions. Where it doesn't, we focus on the arrivals and the moments outside the sanctuary." },
      { title: "Grand entrance", body: "The Bar or Bat Mitzvah's entrance into the reception, with the energy of the room and the family's first reactions." },
      { title: "The hora", body: "The circle dance and the chair lifts for the Bar or Bat Mitzvah and parents, covered from several angles so you get both the faces and the full room." },
      { title: "Candle-lighting ceremony", body: "Each relative and friend called up to light a candle, with the honoree and the cake in frame, photographed in order so the sequence tells the story." },
      { title: "Speeches and blessings", body: "Parents, grandparents and siblings giving toasts, along with the motzi and kiddush, with reactions from the family table." },
      { title: "Friends and the dance floor", body: "The kids' tables, games, the DJ or band and the dance floor, which is often where the most natural photos of the evening happen." },
      { title: "Details and décor", body: "The theme, centerpieces, sign-in board, kippot, the tallit and the cake, photographed before guests arrive." },
    ],
    planning: [
      { title: "Ask about photography rules early", body: "Check with your rabbi or synagogue office whether photography is allowed during the service. If it isn't, schedule a 45 to 60 minute portrait session on a weekday or before Shabbat begins." },
      { title: "Book enough hours for the party", body: "Most reception coverage runs 4 to 5 hours. Start before guests arrive so we can photograph the room and family, and stay through the candle-lighting and the busiest part of the dance floor." },
      { title: "Share the candle-lighting list", body: "Send us the order of honorees ahead of time. Candle-lighting moves quickly, and a list lets us anticipate each person and frame the shot before they reach the cake." },
      { title: "Add video for the speeches and hora", body: "A videographer captures the sound of the speeches and the music of the hora, which photos can't. A second videographer is useful in large ballrooms or when the hora and speeches need two angles." },
    ],
    suggestedHours: { photo: 5, video: 4, note: "Typical reception coverage, plus a separate 1-hour portrait session when photography isn't allowed during the service." },
    faqs: [
      { q: "Can you photograph during the Torah reading?", a: "Only where your congregation permits it. Many synagogues do not allow photography during Shabbat services, so we plan a pre-service portrait session at the sanctuary and focus our coverage on the reception." },
      { q: "How many hours should we book for a Bar or Bat Mitzvah?", a: "Most families book 4 to 5 hours for the reception and, where needed, an extra hour for portraits before the service. The minimum booking is 2 hours." },
      { q: "How much does Bar Mitzvah photography cost?", a: "Photography is $250 for the first hour and $100 for each additional hour, so 5 hours is $650. Videography is $300 for the first hour and $200 for each additional hour. Prices are the same for every client." },
      { q: "When will we get the photos and video?", a: "Every photo is retouched and color graded, and your online gallery is usually ready in about one week. Highlight videos of 3 to 8 minutes, set to music you choose, take 2 to 4 weeks, and one re-edit is included." },
      { q: "Does our venue need a certificate of insurance?", a: "Many do. We are insured through State Farm with $1M per occurrence and $2M general aggregate coverage, and we can send a certificate of insurance to your venue on request." },
    ],
    videoTags: ["party", "event"],
    imageSet: "event",
    related: ["quinceanera-photography", "sweet-16-photography", "religious-ceremony-photography"],
  },

  // ---------------------------------------------------------------- Indian Weddings
  {
    slug: "indian-wedding-photography",
    name: "Indian Weddings",
    pro: "Indian Wedding Photographer",
    h1: "Indian Wedding Photography & Videography",
    title: "Indian Wedding Photographer & Videographer | MacroSnaps",
    description:
      "Indian wedding photography and video for haldi, mehndi, sangeet, baraat, pheras and reception. Open hourly pricing and our own crews in all 50 states.",
    intro: [
      "An Indian wedding is rarely a single day. Between the haldi, mehndi, sangeet, baraat, ceremony and reception, there can be four or five events across a long weekend, each with its own colors, music and rituals. MacroSnaps photographers and videographers can cover one event or all of them, and we plan each day with you so the coverage follows your family's traditions rather than a generic wedding checklist.",
      "Hindu, Sikh, Jain and regional ceremonies all follow their own order, and the most important moments, such as the jaimala, kanyadaan, the pheras around the sacred fire, the sindoor and mangalsutra, or the laavan in a gurdwara, happen quickly. We ask about your rituals in advance, coordinate with your priest or granthi and planner, and position ourselves so we capture these moments without getting in the way of the family or the officiant.",
      "Because Indian weddings run across several days, clear pricing matters. Our rates are listed openly and are the same for every couple: photography is $250 for the first hour and $100 for each additional hour, and videography is $300 for the first hour and $200 for each additional hour. You can book each event separately and pay online. We are insured through State Farm and provide certificates of insurance for hotels and banquet halls.",
    ],
    moments: [
      { title: "Haldi", body: "Family applying turmeric paste to the couple, usually in daylight and often messy in the best way. We cover the laughter and the close-up details." },
      { title: "Mehndi", body: "Henna designs being applied, the bride's hands and feet in detail, and the music and dancing that fill the afternoon around her." },
      { title: "Sangeet", body: "Choreographed family performances, speeches and the open dance floor, with video capturing the music and the full routines." },
      { title: "Baraat", body: "The groom's arrival on a horse, in a car or on foot, with the dhol, dancing relatives and the milni between families at the venue entrance." },
      { title: "Jaimala and ceremony rituals", body: "The garland exchange, kanyadaan, the pheras or laavan, sindoor and mangalsutra, photographed from positions agreed with your officiant." },
      { title: "Vidaai", body: "The bride's farewell to her family, an emotional moment that we cover quietly and with care." },
      { title: "Family portraits", body: "Organized group photos with both sides of the family, which for Indian weddings can mean many combinations. We work from your list to move through them efficiently." },
      { title: "Reception", body: "The couple's entrance, first dance, speeches, cake and the dance floor, along with the outfits and décor of the evening." },
    ],
    planning: [
      { title: "Map out every event", body: "Send us a schedule for each day with start times, locations and the key rituals. This lets us suggest hours per event and plan travel between venues." },
      { title: "Book hours per event, not per weekend", body: "A haldi or mehndi is often covered well in 2 to 3 hours, while the baraat and ceremony usually need 4 to 6 and the reception 4 to 5. You only pay for the hours you need." },
      { title: "Plan for light and the mandap", body: "Haldi and mehndi photograph best in daylight or near windows. For the ceremony, let us know where the mandap will stand and whether there will be a sacred fire, so we can choose lenses and positions." },
      { title: "Add a second photographer or videographer", body: "Large guest lists and simultaneous preparations, such as the bride getting ready while the baraat assembles, are easier to cover with a second photographer or second videographer." },
    ],
    suggestedHours: { photo: 6, video: 6, note: "Typical for the ceremony day with baraat; haldi and mehndi usually need 2-3 hours each, sangeet and reception 4-5 hours each." },
    faqs: [
      { q: "Can you cover all the events of a multi-day Indian wedding?", a: "Yes. You can book any combination of haldi, mehndi, sangeet, baraat, ceremony and reception, each with its own number of hours, so you only pay for the coverage you want." },
      { q: "Do you understand the rituals of an Indian ceremony?", a: "We ask you about your specific traditions in advance, since Hindu, Sikh, Jain and regional ceremonies all differ, and we coordinate with your priest, granthi or planner on timing and where we can stand." },
      { q: "How much does Indian wedding photography cost?", a: "Photography is $250 for the first hour and $100 for each additional hour. Videography is $300 for the first hour and $200 for each additional hour. Each event has a 2-hour minimum and the rates are the same for every client." },
      { q: "When will we receive our photos and wedding video?", a: "Every photo is retouched and color graded, and the online gallery is usually ready in about one week per event. Highlight videos of 3 to 8 minutes with music of your choice take 2 to 4 weeks, with a re-edit included." },
      { q: "Can family abroad watch the ceremony live?", a: "Yes. We offer live streaming, which many families use so relatives who can't travel can watch the pheras or reception as they happen." },
    ],
    videoTags: ["wedding"],
    imageSet: "wedding",
    related: ["pakistani-wedding-photography", "engagement-party-photography", "festival-community-event-photography"],
  },

  // ---------------------------------------------------------------- Pakistani Weddings
  {
    slug: "pakistani-wedding-photography",
    name: "Pakistani Weddings",
    pro: "Pakistani Wedding Photographer",
    h1: "Pakistani Wedding Photography & Videography",
    title: "Pakistani Wedding Photographer & Videographer | MacroSnaps",
    description:
      "Pakistani wedding photography and video for the dholki, mehndi, nikah, baraat, rukhsati and valima. Open hourly rates, our own US crews.",
    intro: [
      "A Pakistani wedding often unfolds over several events: dholki evenings with family songs, a colorful mehndi, the nikah, the baraat with the rukhsati at its close, and the valima hosted by the groom's family. MacroSnaps photographers and videographers can cover each of these, and we plan the coverage around how your family celebrates, whether events are held together or separately, at home, in a masjid or in a banquet hall.",
      "We are respectful of religious and family preferences. If your nikah takes place in a masjid, we follow its guidelines on where we can stand. If your family prefers gender-segregated seating or would like women-only areas photographed in a particular way, tell us in advance and we will plan accordingly. Moments like the signing of the nikah nama, the first look in the mirror and the rukhsati are covered calmly and without interrupting.",
      "Our prices are listed openly and are the same for every family, with no quotes to negotiate: photography is $250 for the first hour and $100 for each additional hour, and videography is $300 for the first hour and $200 for each additional hour. Each event has a two-hour minimum, and you can book and pay online. MacroSnaps is part of MacroHype LLC, working with clients since 2011, and is insured through State Farm.",
    ],
    moments: [
      { title: "Dholki", body: "Evenings of dholak, wedding songs and family gatherings in the days before the wedding, usually relaxed and full of candid moments." },
      { title: "Mehndi", body: "The bride's henna, the yellow and green outfits, choreographed dances and the playful competition between both families." },
      { title: "Nikah", body: "The marriage contract, the ijab-o-qubool, the signing of the nikah nama and the dua, photographed respectfully within the guidelines of your imam or masjid." },
      { title: "Baraat arrival", body: "The groom's party arriving with dhol and dancing, the welcome by the bride's family and the playful rasms such as joota chupai." },
      { title: "Bride and groom on stage", body: "The couple seated together, the arsi mushaf, family members joining them for photos and the exchange of gifts." },
      { title: "Rukhsati", body: "The bride's departure from her family home or venue, an emotional moment we cover quietly, with the Quran held above her head where that is your family's tradition." },
      { title: "Valima", body: "The reception hosted by the groom's family, with the couple's entrance, family portraits and the more relaxed atmosphere of the final event." },
      { title: "Outfits and details", body: "Bridal jewelry, the lehenga or gharara, the groom's sherwani and the stage décor, photographed closely so the craftsmanship shows." },
    ],
    planning: [
      { title: "List each event and its venue", body: "Send us dates, times and locations for the dholki, mehndi, nikah, baraat and valima. Some families combine the nikah and baraat on one day, and the schedule determines how many hours each event needs." },
      { title: "Tell us your preferences on segregation and photography", body: "If some areas are women-only, or certain family members prefer not to be photographed, let us know early so we can plan coverage and staffing that respects those wishes." },
      { title: "Allow time for stage photos", body: "Family photos on stage with the couple take longer than most families expect. Book enough hours that the photographer is still there once the formal program ends." },
      { title: "Consider video for the mehndi and nikah", body: "Mehndi performances and the nikah recitation are moments where sound matters. A videographer, or a second videographer at large events, records these for family who couldn't attend." },
    ],
    suggestedHours: { photo: 5, video: 5, note: "Typical for the baraat or valima; a dholki or nikah alone is often covered in 2-3 hours, a mehndi in 3-4." },
    faqs: [
      { q: "Can you photograph the nikah at a masjid?", a: "Yes, within the masjid's guidelines. We confirm with you or the imam in advance where we can stand and whether any parts should not be photographed or filmed." },
      { q: "Can you accommodate gender-segregated events?", a: "Yes. Tell us how the event is arranged and any preferences you have, and we will plan coverage that respects them." },
      { q: "How much does Pakistani wedding photography cost?", a: "Photography is $250 for the first hour and $100 for each additional hour; videography is $300 for the first hour and $200 for each additional hour. Each event has a 2-hour minimum, and the rates are the same for everyone." },
      { q: "Can we book only some of the events?", a: "Yes. You can book any combination of dholki, mehndi, nikah, baraat and valima, each with its own hours." },
      { q: "When will we receive our photos and videos?", a: "Every photo is retouched and color graded, and the online gallery is usually ready in about one week. Highlight videos of 3 to 8 minutes with music you choose take 2 to 4 weeks, with a re-edit included." },
    ],
    videoTags: ["wedding"],
    imageSet: "wedding",
    related: ["muslim-wedding-photography", "indian-wedding-photography", "engagement-party-photography"],
  },

  // ---------------------------------------------------------------- Quinceañeras
  {
    slug: "quinceanera-photography",
    name: "Quinceañeras",
    pro: "Quinceañera Photographer",
    h1: "Quinceañera Photography & Videography",
    title: "Quinceañera Photographer & Videographer | MacroSnaps",
    description:
      "Quinceañera photography and video for the Mass, last doll, changing of shoes, waltz and court of honor. Open hourly pricing and our own crews nationwide.",
    intro: [
      "A quinceañera marks a young woman's fifteenth birthday with faith, family and a celebration that many families plan for a year or more. MacroSnaps photographers and videographers cover the full day, from getting ready and the Mass or church blessing to the traditions of the reception: the last doll, the changing of the shoes, the father-daughter waltz and the choreographed dances with her court of honor.",
      "Every family's quinceañera is a little different, shaped by country of origin, parish customs and personal choices. Before the day we go through your program with you, including the order of the traditions, which padrinos and madrinas will present gifts, and when the surprise dance happens, so the photographer and videographer are in place for each moment instead of reacting after it has started.",
      "Our prices are listed openly and are the same for every family. Photography is $250 for the first hour and $100 for each additional hour, and videography is $300 for the first hour and $200 for each additional hour, with a two-hour minimum. You can book and pay online without waiting for a quote. MacroSnaps has more than 13 years of experience and is insured through State Farm, with certificates of insurance available for churches and venues.",
    ],
    moments: [
      { title: "Getting ready", body: "The quinceañera's dress, hair, makeup and the tiara, with moments alongside her mother, sisters and damas before leaving for church." },
      { title: "Mass or church blessing", body: "The entrance, the blessing, the presentation of religious gifts by padrinos and madrinas, and the offering of flowers to the Virgin Mary, within your parish's rules for photography." },
      { title: "Portraits with family and court", body: "Formal portraits with parents, godparents, grandparents and the court of chambelanes and damas, often outside the church or at a nearby park." },
      { title: "Grand entrance", body: "The quinceañera and her court entering the reception, the first time many guests see the full group together." },
      { title: "Changing of the shoes", body: "Her father or another family member replacing flat shoes with heels, a moment that is short and easy to miss without planning." },
      { title: "Last doll", body: "The presentation of the última muñeca, symbolizing the end of childhood, along with the crowning if your family includes it." },
      { title: "Father-daughter waltz", body: "The waltz with her father and then with family and the court, covered on video for the full song and in photos for the expressions." },
      { title: "Surprise dance and party", body: "The choreographed surprise dance, the toast, the cake and the open dance floor with friends." },
    ],
    planning: [
      { title: "Share the full program", body: "Send us the order of events, including the Mass time, the reception program and when each tradition happens. Changing of the shoes and the last doll can be over in a minute." },
      { title: "Book from church to the surprise dance", body: "Most families book 5 to 7 hours, starting with getting ready or the church and continuing through the waltz and surprise dance. Ending coverage too early means missing the choreographed numbers." },
      { title: "Check the church's photography rules", body: "Many parishes limit where photographers can stand or ban flash during Mass. Ask your parish office early, and plan portraits outside or after the service." },
      { title: "Add video for the waltz and dances", body: "Choreographed dances are best remembered with sound and movement. A second videographer helps capture both the dance floor and the reactions of family." },
    ],
    suggestedHours: { photo: 6, video: 5, note: "Typical coverage from the Mass through the waltz and surprise dance; add an hour for getting ready." },
    faqs: [
      { q: "Can you photograph the Mass?", a: "Yes, following your parish's guidelines. Some churches limit movement or flash during Mass, so we confirm the rules in advance and plan formal portraits before or after the service." },
      { q: "How many hours do we need for a quinceañera?", a: "Most families book 5 to 7 hours to cover the church, portraits and the main reception traditions through the surprise dance. The minimum is 2 hours." },
      { q: "How much does quinceañera photography cost?", a: "Photography is $250 for the first hour and $100 for each additional hour, so 6 hours is $750. Videography is $300 for the first hour and $200 for each additional hour. Everyone pays the same rates." },
      { q: "Can we choose the music for the highlight video?", a: "Yes. Highlight videos run 3 to 8 minutes, set to music you choose, and are delivered in 2 to 4 weeks with a re-edit included." },
      { q: "Do you offer a photo booth?", a: "Yes. A photo booth is a popular addition for the reception, and live streaming is available for relatives who can't attend." },
    ],
    videoTags: ["party", "event"],
    imageSet: "event",
    related: ["sweet-16-photography", "bar-mitzvah-photography", "religious-ceremony-photography"],
  },

  // ---------------------------------------------------------------- Sweet 16
  {
    slug: "sweet-16-photography",
    name: "Sweet 16 Parties",
    pro: "Sweet 16 Photographer",
    h1: "Sweet 16 Photography & Videography",
    title: "Sweet 16 Party Photographer & Videographer | MacroSnaps",
    description:
      "Sweet 16 party photography and video: grand entrance, candle-lighting, dances, friends and family. Open pricing from $350 and our own crews across the US.",
    intro: [
      "A Sweet 16 is a party that's planned around one person and her friends, and it moves quickly: the grand entrance, the candle-lighting, a father-daughter dance, a slideshow and hours on the dance floor. MacroSnaps photographers and videographers cover the full evening, from portraits before guests arrive to the last group photo with friends, so the family can enjoy the party instead of filming it on phones.",
      "We keep coverage relaxed and natural. Sixteen-year-olds and their friends are often more comfortable when the photographer blends in, so we balance a short set of planned portraits with plenty of candid photos from the dance floor, the photo backdrop and the tables. If there's a theme, a special outfit change or a surprise performance, tell us in advance and we'll make sure it's covered.",
      "Our prices are listed openly and are the same for every client: photography is $250 for the first hour and $100 for each additional hour, and videography is $300 for the first hour and $200 for each additional hour, with a two-hour minimum. You can book and pay online. We're insured through State Farm and can send a certificate of insurance to your venue, which many banquet halls and restaurants ask for.",
    ],
    moments: [
      { title: "Portraits before the party", body: "A short session with the birthday girl or boy, the outfit and the venue, before guests arrive and the room gets busy." },
      { title: "Grand entrance", body: "The entrance, sometimes with a court or a group of friends, and the room's reaction." },
      { title: "Candle-lighting", body: "Family and friends called up one by one to light a candle, each with a short dedication, photographed in order." },
      { title: "Family dances", body: "A dance with a parent or grandparent, covered for both the moment and the people watching." },
      { title: "Friends and the dance floor", body: "Group photos with friends and candid shots on the dance floor, which are usually the photos teenagers share most." },
      { title: "Cake and toast", body: "Singing, blowing out the candles and any toasts from parents or siblings." },
      { title: "Theme and details", body: "Décor, the cake, the sign-in book and the backdrop, photographed while the room is still empty." },
    ],
    planning: [
      { title: "Plan a short portrait session", body: "Ask the guest of honor to be ready 30 to 45 minutes before guests arrive. Portraits are much easier in an empty room, and the outfit and makeup are at their freshest." },
      { title: "Book 3 to 4 hours", body: "Most Sweet 16 parties are well covered in 3 to 4 hours, starting before guests arrive and finishing after the cake and candle-lighting." },
      { title: "Think about lighting", body: "Party venues are often dim with colored lights. We bring lighting for dark rooms, but if you have a choice, schedule portraits and candle-lighting before the room goes fully dark." },
      { title: "Add video or a photo booth", body: "A highlight video captures the entrance and dances with sound, while a photo booth gives friends something to do and a set of digital photos to share." },
    ],
    suggestedHours: { photo: 4, video: 3, note: "Typical for an evening party, starting with portraits before guests arrive." },
    faqs: [
      { q: "How many hours should we book for a Sweet 16?", a: "Most families book 3 to 4 hours, which covers portraits, the entrance, candle-lighting, cake and a good part of the dance floor. The minimum is 2 hours." },
      { q: "How much does Sweet 16 photography cost?", a: "Photography is $250 for the first hour and $100 for each additional hour, so 4 hours is $550. Videography is $300 for the first hour and $200 for each additional hour." },
      { q: "When will we get the photos?", a: "Every photo is retouched and color graded, and your online gallery of high-resolution images is usually ready in about one week." },
      { q: "Do you offer a photo booth?", a: "Yes, a photo booth is available and is popular at Sweet 16 parties. Ask about it when you book." },
      { q: "Can you work in a dark party venue?", a: "Yes. We bring lighting suited to dim rooms and colored DJ lights, so the photos stay sharp and skin tones look natural." },
    ],
    videoTags: ["party"],
    imageSet: "event",
    related: ["quinceanera-photography", "birthday-party-photography", "bar-mitzvah-photography"],
  },

  // ---------------------------------------------------------------- Birthday & Milestone Parties
  {
    slug: "birthday-party-photography",
    name: "Birthday & Milestone Parties",
    pro: "Birthday Party Photographer",
    h1: "Birthday & Milestone Party Photography & Videography",
    title: "Birthday Party Photographer & Videographer | MacroSnaps",
    description:
      "Photography and video for 30th, 40th, 50th and kids' birthday parties: toasts, cake, guests and candids. Open hourly pricing, our own crews nationwide.",
    intro: [
      "Milestone birthdays bring together people who don't always share a room: old friends, colleagues, family from out of town. Whether it's a first birthday, a 30th at a restaurant, a 50th with a band or a 70th with grandchildren, MacroSnaps photographers and videographers record who was there and how the evening felt, so the host can spend time with guests instead of organizing photos.",
      "For adult milestone parties we focus on the toasts, the cake and plenty of candid photos of guests talking and dancing, along with group photos of friends and family. For kids' parties we keep things quick and playful, working around entertainers, games and short attention spans, and getting the cake photos before the frosting is everywhere. Either way, tell us who matters most and we'll make sure they're in the gallery.",
      "Our prices are listed openly and are the same for every client: photography is $250 for the first hour and $100 for each additional hour, and videography is $300 for the first hour and $200 for each additional hour, with a two-hour minimum, so a two-hour party is $350 for photos. You can book and pay online. MacroSnaps has more than 13 years of experience and is insured through State Farm.",
    ],
    moments: [
      { title: "Arrivals and greetings", body: "Guests arriving and the guest of honor greeting them, often the best moment to catch reunions with people who haven't seen each other in years." },
      { title: "Toasts and speeches", body: "Speeches from partners, children and friends, with the guest of honor's reactions." },
      { title: "The cake", body: "Singing, the candles and the first slice, photographed from an angle that shows both the cake and the people around it." },
      { title: "Group photos", body: "Organized photos of family, friends and colleagues, kept short so guests can get back to the party." },
      { title: "Candids and dancing", body: "Natural photos of guests at the tables, at the bar and on the dance floor." },
      { title: "Kids' activities", body: "For children's parties: entertainers, games, bounce houses, face painting and opening presents." },
      { title: "Venue and details", body: "Décor, the table setting, signage and any personal touches like photo displays from earlier decades." },
    ],
    planning: [
      { title: "Book the first half of the party", body: "For most birthday parties, 2 to 3 hours covering arrivals, the toasts and the cake is enough. Ask us to arrive just before guests so we can photograph the room set up." },
      { title: "Schedule toasts and cake earlier", body: "Holding the speeches and cake in the first two hours means you don't need to book coverage late into the night, and guests are still all present." },
      { title: "Give us a short group-photo list", body: "Note the combinations you want, such as college friends, siblings or grandchildren. A list keeps group photos to a few minutes." },
      { title: "Consider a short highlight video", body: "A 3 to 8 minute highlight video set to music you choose is a good way to keep the speeches and atmosphere of a 50th or 60th." },
    ],
    suggestedHours: { photo: 3, video: 2, note: "Typical for an evening milestone party; kids' parties are usually covered in 2 hours." },
    faqs: [
      { q: "What's the minimum booking for a birthday party?", a: "The minimum is 2 hours. Photography starts at $350 for two hours, and videography starts at $500." },
      { q: "Do you photograph kids' birthday parties?", a: "Yes. We cover first birthdays and children's parties, working around entertainers and games, and keeping group photos short." },
      { q: "Can you cover a surprise party?", a: "Yes. We'll coordinate with you on timing and positioning so we're ready for the moment the guest of honor walks in." },
      { q: "How quickly will we receive the photos?", a: "Every photo is retouched and color graded, and your online gallery is usually ready in about one week." },
      { q: "Do you offer a photo booth?", a: "Yes, a photo booth is available, and it works well at milestone birthdays where guests enjoy taking photos together." },
    ],
    videoTags: ["party"],
    imageSet: "personal",
    related: ["anniversary-party-photography", "sweet-16-photography", "graduation-party-photography"],
  },

  // ---------------------------------------------------------------- Anniversary
  {
    slug: "anniversary-party-photography",
    name: "Anniversary Celebrations",
    pro: "Anniversary Party Photographer",
    h1: "Anniversary Party Photography & Videography",
    title: "Anniversary Party Photographer & Videographer | MacroSnaps",
    description:
      "Anniversary party and vow renewal photography and video: toasts, family portraits, first dance and candids. Open pricing from $350, crews nationwide.",
    intro: [
      "A 25th, 40th or 50th anniversary is often the first time in years that a couple's whole family is in the same room, sometimes with three or four generations together. MacroSnaps photographers and videographers cover anniversary parties and vow renewals with that in mind: the couple themselves, the speeches from children and grandchildren, and the family portraits that may not happen again for a long time.",
      "We keep the coverage calm and unhurried, which suits couples who would rather not be directed for long. A short portrait session with the couple, organized group photos with each branch of the family, and candid photos throughout the event are usually enough. If you're renewing vows, we'll cover the ceremony itself, the exchange of rings and the first dance as a married couple again.",
      "Our prices are listed openly and are the same for every client: photography is $250 for the first hour and $100 for each additional hour, and videography is $300 for the first hour and $200 for each additional hour, with a two-hour minimum. Children planning a party for their parents can book and pay online. We're insured through State Farm, and MacroSnaps has more than 13 years of experience.",
    ],
    moments: [
      { title: "Portraits of the couple", body: "A short, relaxed session with the couple, sometimes recreating a photo from their wedding day." },
      { title: "Multi-generation family portraits", body: "Group photos with children, grandchildren and great-grandchildren, organized from your list so they're done quickly." },
      { title: "Vow renewal", body: "The ceremony, the exchange of rings and vows, and the moments right after, if the celebration includes one." },
      { title: "Toasts and stories", body: "Speeches from children, friends and members of the original wedding party, which are often the moments families treasure most." },
      { title: "First dance", body: "The couple dancing to their wedding song or a new one, and family joining in." },
      { title: "Memory displays", body: "Old wedding photos, albums and keepsakes on display, photographed so they're part of the gallery." },
      { title: "Candids with guests", body: "Natural photos of the couple greeting friends and relatives through the event." },
    ],
    planning: [
      { title: "Prepare a group-photo list", body: "Large families have many combinations. Write them down in order and name a family member to help gather people, and group photos take minutes rather than an hour." },
      { title: "Book 2 to 4 hours", body: "A dinner party with toasts is usually well covered in 2 to 3 hours. Add an hour for a vow renewal ceremony or a longer evening with dancing." },
      { title: "Keep it comfortable for the couple", body: "Plan the couple's portraits early, when they're fresh, and in a spot where they can sit if they prefer. Good window light makes a noticeable difference." },
      { title: "Record the speeches on video", body: "Toasts from children and grandchildren are worth recording with sound. A videographer can also capture interviews with guests sharing memories of the couple." },
    ],
    suggestedHours: { photo: 3, video: 3, note: "Typical for a dinner party with toasts; add an hour for a vow renewal ceremony." },
    faqs: [
      { q: "Do you cover vow renewal ceremonies?", a: "Yes. We cover the ceremony, the rings and vows, portraits and the celebration afterward." },
      { q: "How much does anniversary party photography cost?", a: "Photography is $250 for the first hour and $100 for each additional hour, so 3 hours is $450. Videography is $300 for the first hour and $200 for each additional hour." },
      { q: "Can you photograph old photos displayed at the party?", a: "Yes. We'll photograph memory tables and displays so they're included in your gallery." },
      { q: "When will the photos be ready?", a: "Every photo is retouched and color graded, and your online gallery of high-resolution images is usually ready in about one week." },
      { q: "Can relatives who can't travel watch the celebration?", a: "Yes. We offer live streaming, which is useful for vow renewals and toasts when some family members can't attend." },
    ],
    videoTags: ["party", "event"],
    imageSet: "personal",
    related: ["birthday-party-photography", "engagement-party-photography", "religious-ceremony-photography"],
  },

  // ---------------------------------------------------------------- Baby Showers & Gender Reveals
  {
    slug: "gender-reveal-baby-shower-photography",
    name: "Baby Showers & Gender Reveals",
    pro: "Baby Shower Photographer",
    h1: "Baby Shower & Gender Reveal Photography & Videography",
    title: "Baby Shower & Gender Reveal Photographer | MacroSnaps",
    description:
      "Baby shower and gender reveal photography and video: the reveal, games, gifts and family portraits. Open pricing from $350 and our own crews nationwide.",
    intro: [
      "Baby showers and gender reveals are short, busy gatherings where the most important moment can be over in a few seconds. MacroSnaps photographers and videographers cover the parents-to-be, the guests, the games and gift-opening, and, for a gender reveal, the moment itself, whether it's a cake cut, a balloon box, confetti or a smoke cannon outdoors. We also take time for relaxed portraits of the parents-to-be, so you have photos from this stage of the pregnancy.",
      "Since most showers last two or three hours, we plan coverage to fit the program: portraits of the parents-to-be early, while everyone is fresh, candid photos during games, and a clear view of gift-opening. For gender reveals, we agree on a position and a countdown in advance so both photo and video catch the color and the reactions at the same time.",
      "Our prices are listed openly and are the same for every family: photography is $250 for the first hour and $100 for each additional hour, so a two-hour shower is $350. Videography is $300 for the first hour and $200 for each additional hour. You can book and pay online without requesting a quote. We're insured through State Farm and can provide certificates of insurance for venues.",
    ],
    moments: [
      { title: "Parents-to-be portraits", body: "A few relaxed portraits of the expecting parents, alone and with close family, before the party gets busy." },
      { title: "The reveal", body: "The cake cut, balloon box, confetti or smoke, photographed in a quick sequence and filmed so you can see every reaction." },
      { title: "Guest reactions", body: "Grandparents, siblings and friends at the moment of the reveal, often the most memorable photos of the day." },
      { title: "Games and activities", body: "Shower games, guessing activities and advice cards, captured candidly." },
      { title: "Gift-opening", body: "The parents opening gifts with the giver in the frame where possible, which also helps with thank-you notes." },
      { title: "Décor and details", body: "The cake, dessert table, balloon installations and themed decorations." },
      { title: "Group photos", body: "Photos with family and friends, kept quick so guests can get back to the celebration." },
    ],
    planning: [
      { title: "Book the 2-hour minimum", body: "Most showers and gender reveals are well covered in 2 hours. Book 3 if the shower includes a longer meal or a large guest list." },
      { title: "Plan the reveal for us", body: "Tell us exactly when and where the reveal will happen and how it works. A short countdown gives the photographer and videographer time to be ready." },
      { title: "Choose good light", body: "Outdoor reveals look best in open shade or late afternoon light. For indoor showers, set the gift-opening chair near a window." },
      { title: "Add video for the reveal", body: "Reveals are over in seconds. Video captures the full reaction and sound, and a second videographer can film the guests while the first films the parents." },
    ],
    suggestedHours: { photo: 2, video: 2, note: "Typical for a shower or gender reveal gathering; add an hour for large events with a meal." },
    faqs: [
      { q: "How long should we book for a baby shower?", a: "Most showers need the 2-hour minimum, which covers portraits, games, the reveal or cake and gift-opening. Photography for two hours is $350." },
      { q: "Can you film the gender reveal?", a: "Yes. Videography is $300 for the first hour and $200 for each additional hour. Many families book photo and video together so the reveal is covered from two angles." },
      { q: "Do you cover outdoor reveals with smoke or confetti?", a: "Yes. We plan the position and timing with you in advance so the camera settings are ready for the burst of color." },
      { q: "When will we receive the photos?", a: "Every photo is retouched and color graded, and your online gallery is usually ready in about one week." },
      { q: "Can family far away watch the reveal?", a: "Yes. We offer live streaming so grandparents and relatives who can't attend can watch the reveal as it happens." },
    ],
    videoTags: ["party"],
    imageSet: "personal",
    related: ["birthday-party-photography", "religious-ceremony-photography", "engagement-party-photography"],
  },

  // ---------------------------------------------------------------- Graduation
  {
    slug: "graduation-party-photography",
    name: "Graduation Ceremonies & Parties",
    pro: "Graduation Photographer",
    h1: "Graduation Ceremony & Party Photography & Videography",
    title: "Graduation Photographer & Videographer | MacroSnaps",
    description:
      "Graduation ceremony and party photography and video for schools, colleges and families. Open hourly pricing from $350 and our own crews in all 50 states.",
    intro: [
      "Graduation is a milestone for the graduate and for everyone who helped them get there: parents, grandparents, teachers and friends. MacroSnaps photographers and videographers cover both sides of the day. We photograph and film commencement ceremonies for high schools, colleges, universities and programs, and the graduation parties that families host afterward, from backyard gatherings and restaurant dinners to larger celebrations with relatives who have travelled to be there.",
      "For families, we often combine portraits on campus in cap and gown with coverage of the party later in the day, so the gallery tells the whole story. For schools and departments, we cover the procession, the speakers, each graduate crossing the stage and the celebrations on the lawn afterward. We organize the gallery in ceremony order, which makes it easier for the institution to share photos with graduates and their families.",
      "Our prices are listed openly and are the same for every client: photography is $250 for the first hour and $100 for each additional hour, and videography is $300 for the first hour and $200 for each additional hour, with a two-hour minimum. Families and schools can book and pay online. MacroSnaps is part of MacroHype LLC, working with clients since 2011, and is insured through State Farm, with certificates of insurance for campuses and venues.",
    ],
    moments: [
      { title: "Cap and gown portraits", body: "Portraits on campus or at a meaningful location, alone and with family, before or after the ceremony." },
      { title: "The procession", body: "Graduates entering in their regalia, faculty and the start of the ceremony." },
      { title: "Speeches", body: "Valedictorian, faculty and guest speakers, and the audience's reaction." },
      { title: "Crossing the stage", body: "Each graduate receiving their diploma, photographed from a consistent position so every graduate gets a comparable photo." },
      { title: "Cap toss and celebrations", body: "The cap toss, hugs with friends and the first photos with family after the ceremony." },
      { title: "The graduation party", body: "Toasts, the cake, family and friends, and the graduate with the people who supported them." },
      { title: "Details", body: "Stoles, cords, decorated caps, diplomas and party décor." },
    ],
    planning: [
      { title: "Check where photographers can stand", body: "Many commencement venues have restricted areas. Schools that book us can arrange a position near the stage; families should plan portraits before or after the ceremony." },
      { title: "Book enough time for the ceremony", body: "Large ceremonies can run 2 to 3 hours. For schools, we suggest booking the full ceremony plus 30 minutes afterward for celebrations and group photos." },
      { title: "Plan portraits for good light", body: "Outdoor portraits work best in the morning or late afternoon. Midday sun in caps creates harsh shadows, so allow time for shaded locations." },
      { title: "Add video for schools and families", body: "Schools often want a highlight video for their website and social media. A second videographer helps cover the stage and the audience at large ceremonies." },
    ],
    suggestedHours: { photo: 3, video: 3, note: "Typical for a commencement ceremony; a family party with portraits is often covered in 2-3 hours." },
    faqs: [
      { q: "Do you photograph graduation ceremonies for schools?", a: "Yes. We cover commencement ceremonies for high schools, colleges, universities and programs, with photography and videography available." },
      { q: "Can you photograph every graduate crossing the stage?", a: "Yes, from a consistent position so each graduate gets a comparable photo. Let us know the number of graduates so we can plan." },
      { q: "How much does graduation photography cost?", a: "Photography is $250 for the first hour and $100 for each additional hour; videography is $300 for the first hour and $200 for each additional hour. The minimum booking is 2 hours." },
      { q: "Can you live stream our graduation?", a: "Yes. Live streaming lets families who can't attend watch the ceremony as it happens." },
      { q: "When will we receive the photos?", a: "Every photo is retouched and color graded, and your online gallery is usually ready in about one week. Highlight videos take 2 to 4 weeks." },
    ],
    videoTags: ["event", "community"],
    imageSet: "event",
    related: ["birthday-party-photography", "award-ceremony-photography", "festival-community-event-photography"],
  },

  // ---------------------------------------------------------------- Galas & Fundraisers
  {
    slug: "gala-fundraiser-photography",
    name: "Galas & Fundraisers",
    pro: "Gala Photographer",
    h1: "Gala & Fundraiser Photography & Videography",
    title: "Gala & Fundraiser Photographer & Videographer | MacroSnaps",
    description:
      "Gala and fundraiser photography and video: red carpet, honorees, speeches, auctions and donors. Open hourly pricing, our own crews, insured with COIs.",
    intro: [
      "Galas and fundraisers need photos that work long after the night ends: for the press release, the annual report, sponsor thank-yous and next year's invitation. MacroSnaps photographers and videographers cover the red carpet and step-and-repeat, honorees and speakers, the live auction and paddle raise, and the guests and sponsors who made the evening possible. We aim for photos your team can use across print, web and social media without extra editing.",
      "We work closely with your development and communications teams before the event. A shot list of VIPs, board members, sponsors and honorees lets us make sure the people who matter most to your organization are photographed, and the full gallery is retouched and usually ready in about one week. A highlight video can also be used to open next year's event or support your fundraising appeal.",
      "Our prices are listed openly and are the same for every organization, so nonprofits can budget without waiting for quotes. Photography is $250 for the first hour and $100 for each additional hour, and videography is $300 for the first hour and $200 for each additional hour. MacroSnaps is part of MacroHype LLC, working with organizations since 2011, and is insured through State Farm with $1M per occurrence and $2M aggregate coverage. We provide certificates of insurance for venues.",
    ],
    moments: [
      { title: "Red carpet and step-and-repeat", body: "Arriving guests, honorees and sponsors in front of your backdrop, with names noted where you need captions." },
      { title: "Cocktail reception", body: "Candid photos of guests, board members and donors in conversation, which are useful for annual reports and newsletters." },
      { title: "Program and speeches", body: "The emcee, executive director, honorees and keynote speakers on stage, with clean shots for press use." },
      { title: "Honoree presentations", body: "Awards being presented, the handshake moment and posed photos with the honoree and presenters." },
      { title: "Live auction and paddle raise", body: "The auctioneer, bidders and the room during the appeal, showing the energy of the fundraising moment." },
      { title: "Sponsors and VIPs", body: "Posed photos of sponsors, board members and VIP guests from your shot list." },
      { title: "Entertainment and dancing", body: "Performers, the band and the dance floor later in the evening." },
      { title: "Venue and design", body: "Table settings, centerpieces, signage and sponsor branding, photographed before doors open." },
    ],
    planning: [
      { title: "Send a VIP and sponsor shot list", body: "Include names and, if possible, photos of people who must be photographed. Assign a staff member to help us find them during the reception." },
      { title: "Cover the full program", body: "Most galas need 4 to 5 hours, from the room setup and arrivals through the program and auction. Dancing later in the evening can be covered by the last hour." },
      { title: "Plan the step-and-repeat lighting", body: "Ballrooms are often dim. We bring lighting for the step-and-repeat and stage, but let us know the venue's rules on stands and power." },
      { title: "Use video for next year's appeal", body: "A highlight video with speeches and interviews helps future fundraising. A second photographer or videographer is useful for large galas with simultaneous red carpet and reception." },
    ],
    suggestedHours: { photo: 5, video: 4, note: "Typical for a seated gala with reception, program and auction." },
    faqs: [
      { q: "When will we receive the photos and video?", a: "Every photo is retouched and color graded, and the online gallery is usually ready in about one week. Highlight videos of 3 to 8 minutes take 2 to 4 weeks, with a re-edit included." },
      { q: "How much does gala photography cost?", a: "Photography is $250 for the first hour and $100 for each additional hour, so 5 hours is $650. Videography is $300 for the first hour and $200 for each additional hour. The rates are the same for every organization." },
      { q: "Does the venue need a certificate of insurance?", a: "Most hotels and event venues do. We are insured through State Farm with $1M per occurrence and $2M general aggregate coverage and provide certificates on request." },
      { q: "Can you live stream our gala?", a: "Yes. Live streaming lets supporters who can't attend watch the program and participate in the appeal." },
      { q: "Do you offer a photo booth?", a: "Yes. A photo booth is a popular addition for galas and gives guests digital photos to share." },
    ],
    videoTags: ["event", "corporate", "community"],
    imageSet: "event",
    related: ["award-ceremony-photography", "holiday-party-photography", "festival-community-event-photography"],
  },

  // ---------------------------------------------------------------- Corporate Holiday Parties
  {
    slug: "holiday-party-photography",
    name: "Corporate Holiday Parties",
    pro: "Holiday Party Photographer",
    h1: "Corporate Holiday Party Photography & Videography",
    title: "Corporate Holiday Party Photographer | MacroSnaps",
    description:
      "Corporate holiday party photography and video: team photos, speeches, awards and candids. Open hourly pricing, our own crews nationwide, COIs for venues.",
    intro: [
      "A company holiday party is one of the few times a whole team is in one room, often with partners and guests. MacroSnaps photographers and videographers cover end-of-year parties for companies of all sizes, from office gatherings to ballroom events, with candid photos of colleagues, team and department group photos, leadership remarks and any awards or recognitions. The result is a record of the year's people that you can share across the company.",
      "We know these photos are often used internally, on careers pages and on social media, so we keep the coverage professional and balanced. We focus on genuine moments between colleagues rather than people mid-bite, photograph every team you ask for, and coordinate with HR or your event planner about anything that shouldn't be shared. A short highlight video works well for internal communications and recruiting.",
      "Our prices are listed openly and are the same for every company, with no quote process to slow down planning. Photography is $250 for the first hour and $100 for each additional hour, and videography is $300 for the first hour and $200 for each additional hour. You can book and pay online. MacroSnaps is part of MacroHype LLC, which has worked with businesses since 2011, and we're insured through State Farm, with certificates of insurance for venues.",
    ],
    moments: [
      { title: "Arrivals and reception", body: "Colleagues arriving and greeting each other, often the most relaxed moment of the evening." },
      { title: "Team and department photos", body: "Group photos of each team, organized with a contact from your side so nobody is missed." },
      { title: "Leadership remarks", body: "The CEO or leadership team's toast or year-end remarks, and the room's reaction." },
      { title: "Awards and recognition", body: "Employee awards, service milestones and recognitions, with clean presentation photos." },
      { title: "Candids and dancing", body: "Natural photos of colleagues and guests at tables, at the bar and on the dance floor." },
      { title: "Activities and entertainment", body: "Games, raffles, performers, casino tables or other planned entertainment." },
      { title: "Venue and branding", body: "Décor, signage and branded elements, photographed before guests arrive." },
    ],
    planning: [
      { title: "Book the first 3 to 4 hours", body: "The most useful photos happen during arrivals, remarks and awards. Most companies book 3 to 4 hours rather than covering the party until the end." },
      { title: "Assign a point of contact", body: "Someone who knows the team can help us find people for group photos and point out leadership and award recipients." },
      { title: "Let us know photo policies", body: "If some employees prefer not to be photographed, or photos will be used publicly, tell us in advance so we can plan accordingly." },
      { title: "Add a photo booth or video", body: "A photo booth gives employees photos to share, and a highlight video is useful for internal channels and recruiting." },
    ],
    suggestedHours: { photo: 3, video: 3, note: "Typical for an evening party with remarks and awards; add an hour for large ballroom events." },
    faqs: [
      { q: "How much does holiday party photography cost?", a: "Photography is $250 for the first hour and $100 for each additional hour, so 3 hours is $450. Videography is $300 for the first hour and $200 for each additional hour. Every company pays the same rates." },
      { q: "Can you provide a certificate of insurance?", a: "Yes. We are insured through State Farm with $1M per occurrence and $2M general aggregate coverage and provide certificates for venues on request." },
      { q: "When will we receive the photos?", a: "Every photo is retouched and color graded, and the online gallery is usually ready in about one week. Highlight videos take 2 to 4 weeks." },
      { q: "Do you offer a photo booth?", a: "Yes, a photo booth is available and works well at holiday parties." },
      { q: "Do you cover parties in multiple offices?", a: "Yes. We have our own photographers and videographers across all 50 states, Washington, DC, Ontario and Quebec, so companies can book parties in several cities with the same pricing." },
    ],
    videoTags: ["corporate", "party", "event"],
    imageSet: "corporate",
    related: ["award-ceremony-photography", "gala-fundraiser-photography", "birthday-party-photography"],
  },

  // ---------------------------------------------------------------- Award Ceremonies
  {
    slug: "award-ceremony-photography",
    name: "Award Ceremonies",
    pro: "Award Ceremony Photographer",
    h1: "Award Ceremony Photography & Videography",
    title: "Award Ceremony Photographer & Videographer | MacroSnaps",
    description:
      "Award ceremony photography and video: winners on stage, presentations, speeches and red carpet. Open hourly pricing, our own crews nationwide, insured.",
    intro: [
      "Award ceremonies produce photos that winners, sponsors and organizers all want to use: the presentation on stage, the acceptance speech and the posed photo with the award. MacroSnaps photographers and videographers cover industry awards, employee recognition events, school and community honors and nonprofit award dinners, making sure every honoree is photographed properly and that the photos are ready to use in announcements, newsletters and next year's promotion.",
      "The key to award coverage is preparation. We work from your run of show and list of winners, agree on a position with a clear view of the stage and plan a backdrop for posed winner photos. When a ceremony has many categories, we keep photos organized by order so your team can identify and send them to each winner without guesswork.",
      "Our prices are listed openly and are the same for every organization. Photography is $250 for the first hour and $100 for each additional hour, and videography is $300 for the first hour and $200 for each additional hour, with a two-hour minimum. You can book and pay online. MacroSnaps has more than 13 years of experience with corporate and community events and is insured through State Farm, with certificates of insurance for venues.",
    ],
    moments: [
      { title: "Arrivals and red carpet", body: "Nominees, presenters and guests arriving, with step-and-repeat photos where you have a backdrop." },
      { title: "Opening and host", body: "The host, opening remarks and any keynote speaker." },
      { title: "Winner announcements", body: "Reactions at the tables as winners are named, which often make the most natural photos of the night." },
      { title: "On-stage presentations", body: "Each award being handed over, photographed from a consistent position for every category." },
      { title: "Acceptance speeches", body: "Winners at the podium, with clean framing for press releases and social media." },
      { title: "Posed winner photos", body: "Winners with their award and presenters at a backdrop, organized by category." },
      { title: "Networking and reception", body: "Candid photos of guests and sponsors before and after the program." },
    ],
    planning: [
      { title: "Share the run of show", body: "Send the program order, the list of categories and the winners if they can be shared confidentially. This lets us name and organize photos accurately." },
      { title: "Book from arrivals to the last award", body: "Most ceremonies are covered in 3 to 4 hours. Add time for a longer reception or dinner before the program." },
      { title: "Set up a winners' backdrop", body: "A dedicated spot near the stage for posed winner photos keeps the program moving and gives consistent results." },
      { title: "Use two shooters for large programs", body: "With many categories, a second photographer or videographer can cover the stage while the other handles the posed photos and audience reactions." },
    ],
    suggestedHours: { photo: 4, video: 3, note: "Typical for an award program with reception; adjust for the number of categories." },
    faqs: [
      { q: "Can you photograph every winner on stage?", a: "Yes. We photograph each presentation from a consistent position and organize photos by category so they're easy to send to winners." },
      { q: "How much does award ceremony photography cost?", a: "Photography is $250 for the first hour and $100 for each additional hour; videography is $300 for the first hour and $200 for each additional hour. The rates are the same for every client." },
      { q: "Can you record the full ceremony on video?", a: "Yes. We can record the program and produce a 3 to 8 minute highlight video, delivered in 2 to 4 weeks with a re-edit included." },
      { q: "Can you live stream the ceremony?", a: "Yes. Live streaming lets nominees, colleagues and families who can't attend watch the awards as they happen." },
      { q: "When will we receive the photos?", a: "Every photo is retouched and color graded, and the online gallery is usually ready in about one week." },
    ],
    videoTags: ["corporate", "event", "conference"],
    imageSet: "corporate",
    related: ["gala-fundraiser-photography", "holiday-party-photography", "graduation-party-photography"],
  },

  // ---------------------------------------------------------------- Engagement Parties & Proposals
  {
    slug: "engagement-party-photography",
    name: "Engagement Parties & Proposals",
    pro: "Engagement Party Photographer",
    h1: "Engagement Party & Proposal Photography & Videography",
    title: "Engagement Party & Proposal Photographer | MacroSnaps",
    description:
      "Proposal and engagement party photography and video: the question, the ring, toasts and family. Open hourly pricing from $350 and our own crews nationwide.",
    intro: [
      "Whether you're planning a surprise proposal or celebrating with family and friends after saying yes, MacroSnaps photographers and videographers can cover it. For proposals, we work quietly in the background so the moment stays a surprise. For engagement parties, we cover the couple, the toasts and the first time both families celebrate together, including any traditions your families bring to the occasion.",
      "Proposals depend on planning. We agree on the exact location, a signal and where we'll be standing, often posing as a passer-by, so we're ready the moment you go down on one knee. Afterward, we take time for portraits of the newly engaged couple and close-up photos of the ring. Engagement parties are more relaxed, with candid photos, family portraits and speeches.",
      "Our prices are listed openly and are the same for every client: photography is $250 for the first hour and $100 for each additional hour, and videography is $300 for the first hour and $200 for each additional hour, with a two-hour minimum. You can book and pay online without telling anyone else. MacroSnaps has more than 13 years of experience and is insured through State Farm.",
    ],
    moments: [
      { title: "The proposal", body: "The question and the answer, photographed from a distance with a long lens so your partner doesn't see us coming." },
      { title: "Reactions", body: "The surprise, the tears and the laughter in the seconds after, often the photos couples like most." },
      { title: "The ring", body: "Close-up photos of the ring on the hand, with the setting in the background." },
      { title: "Couple portraits", body: "A short portrait session right after the proposal while you're both still in the moment." },
      { title: "Family celebrating together", body: "At the engagement party, the couple with both families, sometimes meeting for the first time." },
      { title: "Toasts", body: "Speeches from parents, siblings and friends, with reactions from the couple." },
      { title: "Candids and details", body: "Guests mingling, décor, the cake and any traditions your families include, such as a ring ceremony or roka." },
    ],
    planning: [
      { title: "Scout the proposal location", body: "Choose a spot with good light and a simple way to get your partner there. Send us photos or a map pin, and agree on a clear signal so we know when it's happening." },
      { title: "Plan for the right time of day", body: "Late afternoon light flatters outdoor proposals. Avoid busy times at popular landmarks if you want a clear background." },
      { title: "Book 2 hours for a proposal", body: "The 2-hour minimum covers setup, the proposal and a portrait session afterward. Engagement parties are usually 2 to 3 hours." },
      { title: "Add video for the moment itself", body: "Video captures what you said and your partner's reaction. A second videographer or photographer can film a close angle and a wide angle at the same time." },
    ],
    suggestedHours: { photo: 2, video: 2, note: "Typical for a proposal with portraits afterward; engagement parties often need 2-3 hours." },
    faqs: [
      { q: "How do you keep a proposal a surprise?", a: "We plan the location, timing and a signal with you in advance and stay at a distance until the question is asked, often looking like a tourist or passer-by." },
      { q: "How much does proposal photography cost?", a: "The 2-hour minimum starts at $350 for photography and $500 for videography. Additional hours are $100 for photos and $200 for video." },
      { q: "What if it rains on the day?", a: "Let us know your backup plan. We can adjust to a covered location or move the timing if your plans allow." },
      { q: "When will we receive the photos?", a: "Every photo is retouched and color graded, and your online gallery is usually ready in about one week." },
      { q: "Do you also photograph weddings?", a: "Yes. MacroSnaps covers weddings, including multi-day Indian and Pakistani weddings, with the same open hourly pricing." },
    ],
    videoTags: ["wedding", "party"],
    imageSet: "wedding",
    related: ["indian-wedding-photography", "pakistani-wedding-photography", "anniversary-party-photography"],
  },

  // ---------------------------------------------------------------- Religious Ceremonies
  {
    slug: "religious-ceremony-photography",
    name: "Baptisms, Christenings & First Communions",
    pro: "Baptism Photographer",
    h1: "Baptism, Christening & First Communion Photography & Videography",
    title: "Baptism & First Communion Photographer | MacroSnaps",
    description:
      "Baptism, christening and First Communion photography and video, planned around your church's rules, with family portraits after. Prices listed openly.",
    intro: [
      "Baptisms, christenings and First Communions are quiet, meaningful ceremonies, often with godparents and extended family gathered in church. MacroSnaps photographers and videographers cover the ceremony with care, along with family portraits and the gathering or brunch afterward, so you have a full record of a day that happens only once. We also photograph the small things families tend to keep, such as the gown, the candle and the certificate.",
      "Churches set their own rules for photography, and many limit movement, flash or positions during the sacrament. We confirm the rules with your parish or priest in advance and work discreetly, usually from the side aisles or the back. If photography isn't allowed during the ceremony itself, we arrange portraits at the font or altar immediately afterward, which many families find gives better results anyway.",
      "Our prices are listed openly and are the same for every family: photography is $250 for the first hour and $100 for each additional hour, and videography is $300 for the first hour and $200 for each additional hour, with a two-hour minimum, so ceremony and portraits are often covered for $350. You can book and pay online. We're insured through State Farm and can send certificates of insurance to reception venues.",
    ],
    moments: [
      { title: "Arrival at church", body: "The family arriving, the child in their christening gown or First Communion dress or suit, and godparents gathering." },
      { title: "The baptism", body: "The pouring of water or immersion, the anointing with chrism, the lighting of the baptismal candle and the white garment, within the church's guidelines." },
      { title: "First Communion", body: "The procession of communicants, receiving the Eucharist where permitted, and the group photo of the class with the priest." },
      { title: "Godparents and family", body: "Portraits with parents, godparents and grandparents at the font or altar after the ceremony." },
      { title: "Portraits of the child", body: "Close-up portraits with the candle, rosary, Bible or other keepsakes." },
      { title: "Details", body: "The gown, the candle, the cross and the church itself, photographed before or after the service." },
      { title: "Celebration afterward", body: "The brunch, lunch or party at home or at a restaurant, with the cake and family toasts." },
    ],
    planning: [
      { title: "Confirm the church's photography rules", body: "Ask your parish office whether photography and video are allowed during the sacrament and where photographers can stand. Some churches allow photography only for private baptisms." },
      { title: "Book 2 to 3 hours", body: "The 2-hour minimum usually covers the ceremony and family portraits. Add an hour or two if you'd like the reception covered as well." },
      { title: "Plan portraits after the ceremony", body: "Ask the priest whether you can stay for 15 to 20 minutes after the service for photos at the font or altar. Churches are often dim, so this time allows us to work carefully." },
      { title: "Consider video for the sacrament", body: "Video records the prayers and blessings with sound. For First Communion Masses with many children, a second photographer or videographer can cover your child while the other covers the full ceremony." },
    ],
    suggestedHours: { photo: 2, video: 2, note: "Typical for the ceremony and family portraits; add 1-2 hours for the reception." },
    faqs: [
      { q: "Can you photograph inside the church during the baptism?", a: "Where the church allows it. We confirm the rules with your parish in advance and work quietly without flash. If photography isn't permitted, we plan portraits immediately afterward." },
      { q: "Do you photograph Orthodox and other Christian ceremonies?", a: "Yes. We cover Catholic, Orthodox and Protestant baptisms, christenings and First Communions, and we ask you about the specific order and customs of your church." },
      { q: "How much does baptism photography cost?", a: "Photography is $250 for the first hour and $100 for each additional hour, so the 2-hour minimum is $350. Videography is $300 for the first hour and $200 for each additional hour." },
      { q: "Can relatives abroad watch the ceremony?", a: "Yes, where the church permits it. We offer live streaming so family who can't travel can watch the ceremony as it happens." },
      { q: "When will we receive the photos?", a: "Every photo is retouched and color graded, and your online gallery of high-resolution images is usually ready in about one week." },
    ],
    videoTags: ["event", "community"],
    imageSet: "personal",
    related: ["bar-mitzvah-photography", "quinceanera-photography", "gender-reveal-baby-shower-photography"],
  },

  // ---------------------------------------------------------------- Festivals & Community Events
  {
    slug: "festival-community-event-photography",
    name: "Festivals & Community Events",
    pro: "Festival Photographer",
    h1: "Festival & Community Event Photography & Videography",
    title: "Festival & Community Event Photographer | MacroSnaps",
    description:
      "Photography and video for cultural festivals, Diwali and Eid celebrations, parades and races. Open hourly pricing, our own crews nationwide, insured, COIs.",
    intro: [
      "Festivals and community events are large, busy and spread out, and the organizers who run them need photos for sponsors, grant reports, press and next year's promotion. MacroSnaps photographers and videographers cover cultural festivals, Diwali and Eid celebrations, Lunar New Year events, heritage parades, street fairs, charity walks and races, working to your shot list across stages, vendors and crowds.",
      "Community events often bring together many traditions in one place. We are respectful of religious and cultural practices, ask before photographing prayers or ceremonies, and follow guidance from organizers about where photography is welcome. For parades and races, we plan positions along the route in advance, covering the start, key points and the finish line, so every part of the event is represented.",
      "Our prices are listed openly and are the same for every organization, so community groups and nonprofits can budget without a quote process. Photography is $250 for the first hour and $100 for each additional hour, and videography is $300 for the first hour and $200 for each additional hour. MacroSnaps is part of MacroHype LLC, working with organizations since 2011, and is insured through State Farm with certificates of insurance available for permits and city requirements.",
    ],
    moments: [
      { title: "Opening ceremonies", body: "Ribbon cuttings, welcome remarks from organizers and officials, and blessings or invocations where appropriate." },
      { title: "Stage performances", body: "Music, dance and cultural performances, photographed from the front and the wings where access allows." },
      { title: "Diwali, Eid and holiday celebrations", body: "Diyas and rangoli, festive clothing, community prayers where welcome, food, music and the families who come together for the occasion." },
      { title: "Parades and processions", body: "Floats, marching groups, dancers and the crowds along the route, covered from planned positions." },
      { title: "Races and walks", body: "The start, participants along the course, the finish line and medal presentations." },
      { title: "Vendors and sponsors", body: "Food stalls, artisans, sponsor booths and branding, useful for sponsor reports and next year's vendor recruitment." },
      { title: "Crowds and atmosphere", body: "Wide shots that show the size of the event, alongside close candid photos of attendees." },
      { title: "Volunteers and organizers", body: "The people running the event, from setup to the end of the day." },
    ],
    planning: [
      { title: "Share a map and schedule", body: "Send the site map, stage schedule and parade or race route. This lets us plan where to be for each part of the event and how many hours to book." },
      { title: "Book by the key moments", body: "Many festivals run all day. Booking 4 to 6 hours around the opening, headline performances and busiest periods is often more efficient than covering every hour." },
      { title: "Plan for outdoor light", body: "Midday sun is harsh. If you can, schedule key performances and group photos for the morning or late afternoon, and tell us about any evening events with stage lighting." },
      { title: "Use multiple shooters for large events", body: "A second photographer or videographer helps cover multiple stages, long parade routes or a race start and finish at the same time." },
    ],
    suggestedHours: { photo: 5, video: 4, note: "Typical for a one-day festival or parade; races are often covered in 3-4 hours around the start and finish." },
    faqs: [
      { q: "Can you cover an all-day festival?", a: "Yes. Book the hours you need, and add a second photographer or videographer to cover several stages or areas at once." },
      { q: "How much does festival photography cost?", a: "Photography is $250 for the first hour and $100 for each additional hour, so 5 hours is $650. Videography is $300 for the first hour and $200 for each additional hour. The rates are the same for every organization." },
      { q: "Can you provide insurance documents for city permits?", a: "Yes. We are insured through State Farm with $1M per occurrence and $2M general aggregate coverage and can provide certificates of insurance on request." },
      { q: "Do you photograph cultural and religious celebrations respectfully?", a: "Yes. We follow organizers' guidance, ask before photographing prayers or ceremonies, and avoid intruding on private moments." },
      { q: "Can you live stream our event?", a: "Yes. Live streaming is available for opening ceremonies, performances and other parts of the event." },
    ],
    videoTags: ["community", "event"],
    imageSet: "event",
    related: ["gala-fundraiser-photography", "indian-wedding-photography", "graduation-party-photography"],
  },
];

const ORDER = [
  "bar-mitzvah-photography", "indian-wedding-photography", "pakistani-wedding-photography", "muslim-wedding-photography", "jewish-wedding-photography",
  "chinese-wedding-photography", "african-wedding-photography", "same-sex-wedding-photography", "elopement-photography", "engagement-party-photography",
  "bridal-shower-photography", "rehearsal-dinner-photography", "quinceanera-photography", "sweet-16-photography", "prom-photography",
  "birthday-party-photography", "anniversary-party-photography", "gender-reveal-baby-shower-photography", "graduation-party-photography", "retirement-party-photography",
  "gala-fundraiser-photography", "holiday-party-photography", "award-ceremony-photography", "religious-ceremony-photography", "festival-community-event-photography",
];
const ALL = [...BASE_EVENT_TYPES, ...MORE_EVENT_TYPES_1, ...MORE_EVENT_TYPES_2];
export const EVENT_TYPES: EventType[] = [...ORDER.map((s) => ALL.find((e) => e.slug === s)!).filter(Boolean), ...ALL.filter((e) => !ORDER.includes(e.slug))];
