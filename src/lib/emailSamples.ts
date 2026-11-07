// Sample versions of every automated email, for the admin "Emails & automations" page (preview + send a test).
import "server-only";
import * as E from "./emails";
import { ORIGIN } from "./emailTemplate";
import { emailHtml } from "./newsletter";

const lines = [{ label: "Nov 20: Photography, 4 hrs", amount: 550 }, { label: "Nov 20: Premium editing, 4 photographer-hrs", amount: 200 }];
const booking: E.BookingInfo = { firstName: "Sara Khan", service: "Wedding Photography", ref: "MS-SAMPLE1", schedule: "Fri, Nov 20, 2:00 PM–6:00 PM", city: "Dallas, TX", venue: "The Adolphus", lines, total: "$750.00 USD", email: "sara@example.com", phone: "555-111-2222", notes: "Please capture the grandparents." };
const ab = { firstName: "Sara", service: "Wedding Photography", schedule: "Fri, Nov 20, 2:00 PM–6:00 PM", city: "Dallas, TX", lines, total: "$750 USD", resumeUrl: `${ORIGIN}/book`, stopUrl: `${ORIGIN}/` };
const unsub = `${ORIGIN}/unsubscribe`;
const W = "https://static.wixstatic.com/media/";
export const NEWSLETTER_SAMPLE = `# Fall wedding season is here

Hi friends,

October and November are some of the most beautiful months to get married, and Saturdays are booking fast. Here's what's new at MacroSnaps this month.

![A golden-hour portrait from a fall wedding](${W}1f3625_d2741b395b5d446da5d8ca57e5f286b2~mv2.jpg)

## Three tips for golden-hour portraits

- Plan 20 minutes for portraits in the hour before sunset.
- Scout one spot with open shade as a backup.
- Keep the bouquet low so it doesn't hide your hands.

> "They captured every moment, and we had our gallery in a week." Sara & Ali, Dallas

## Recently on our blog and YouTube

{{Conference season recap | Highlights from summits in New York, DC and Toronto. | ${W}b8cb3c_af143925a50c4d24a9cdd29895d94165~mv2.jpg | https://www.macrosnaps.com/conference-photography}}

{{Planning an Indian wedding? | What to expect from a multi-day celebration. | ${W}1f3625_79013331208a4ec8826fcde024545575~mv2.jpg | https://www.macrosnaps.com/indian-wedding-photography}}

---

[[See available dates|https://www.macrosnaps.com/book]]`;

export const SAMPLES: { key: string; group: string; when: string; build: () => E.Email }[] = [
  { key: "confirm", group: "Bookings", when: "Customer pays", build: () => E.bookingConfirmed(booking) },
  { key: "team", group: "Bookings", when: "Customer pays (to info@macrosnaps.com)", build: () => E.teamNewBooking(booking, `${ORIGIN}/admin`) },
  { key: "ab1", group: "Abandoned booking", when: "~1 hour after leaving the payment page", build: () => E.abandoned1(ab) },
  { key: "ab2", group: "Abandoned booking", when: "~1 day later", build: () => E.abandoned2(ab) },
  { key: "ab3", group: "Abandoned booking", when: "~2 days after that (last one)", build: () => E.abandoned3(ab) },
  { key: "stage", group: "Client portal", when: "You update the order stage (if 'email the client' is ticked)", build: () => E.stageUpdate("Sara", "Editing", "Our editors are working on your photos and videos.", "Wedding Photography", "MS-SAMPLE1", `${ORIGIN}/account`) },
  { key: "gallery", group: "Client portal", when: "You publish the gallery", build: () => E.galleryReady("Sara", "Wedding Photography", `${ORIGIN}/account`, "sara@example.com") },
  { key: "feedback", group: "Reviews", when: "3 days after the gallery is published, if they haven't rated", build: () => E.feedbackRequest("Sara", "Wedding Photography", `${ORIGIN}/account/orders/MS-SAMPLE1`) },
  { key: "review", group: "Reviews", when: "Client rates 4 or 5 stars", build: () => E.reviewRequest("Sara", "https://g.page/r/your-review-link") },
  { key: "low", group: "Reviews", when: "Client rates 1–3 stars (to you only)", build: () => E.lowRatingAlert(2, "Sara Khan", "sara@example.com", "Wedding Photography", "MS-SAMPLE1", "Photos arrived later than expected.") },
  { key: "signin", group: "Client portal", when: "Client asks for a sign-in link", build: () => E.signInLink(`${ORIGIN}/account`) },
  { key: "n1", group: "Welcome series (new subscribers)", when: "Right after subscribing", build: () => E.nurture1("Sara", unsub) },
  { key: "n2", group: "Welcome series (new subscribers)", when: "2 days later", build: () => E.nurture2("Sara", unsub) },
  { key: "n3", group: "Welcome series (new subscribers)", when: "3 days after that", build: () => E.nurture3("Sara", unsub) },
  { key: "accepted", group: "Photographer network", when: "You approve an application (with the contract)", build: () => E.photographerAccepted("Juan Perez", `${ORIGIN}/sign/sample`, `${ORIGIN}/staff/login`) },
  { key: "c-send", group: "Photographer network", when: "You send a contract from admin → Contracts", build: () => E.contractToSign("Juan Perez", "Rehman Siddiq", "Contractor Photographer & Videographer Agreement", `${ORIGIN}/sign/sample`, "MS-C7") },
  { key: "c-signed", group: "Photographer network", when: "Photographer signs (to them, signed PDF attached)", build: () => E.contractSignedSigner("Juan Perez", "Contractor Photographer & Videographer Agreement", "2026-11-07.2", "MS-C7", "juan@example.com", "Rehman Siddiq") },
  { key: "c-team", group: "Photographer network", when: "Photographer signs (to info@macrosnaps.com, signed PDF attached)", build: () => E.contractSignedTeam("Juan Perez", "Contractor Photographer & Videographer Agreement", "2026-11-07.2", "MS-C7", "juan@example.com", "Rehman Siddiq") },
  { key: "crew-files", group: "Photographer network", when: "About 1 hour after each shoot ends (to every assigned photographer/videographer)", build: () => E.crewDriveRequest({ name: "Juan Perez", service: "Event Photography", ref: "MS-24817", order: "MS-24817", folder: "MS-24817 - Acme Corp", client: "Acme Corp", when: "Fri, Nov 6, 2026, 6:00 PM–10:00 PM", venue: "Marriott Marquis, New York", deadline: "Sat, Nov 7, 10:00 PM EST", url: `${ORIGIN}/deliver` }) },
  { key: "crew-files-rem", group: "Photographer network", when: "6 hours before the files are due, if no link yet", build: () => E.crewDriveRequest({ name: "Juan Perez", service: "Event Photography", ref: "MS-24817", order: "MS-24817", folder: "MS-24817 - Acme Corp", client: "Acme Corp", when: "Fri, Nov 6, 2026, 6:00 PM–10:00 PM", venue: "Marriott Marquis, New York", deadline: "Sat, Nov 7, 10:00 PM EST", url: `${ORIGIN}/deliver` }, true) },
  { key: "crew-files-team", group: "Photographer network", when: "Crew sends the link (to info@macrosnaps.com); also if it's overdue", build: () => E.crewDriveTeam("received", { name: "Juan Perez", email: "juan@example.com", ref: "MS-24817", service: "Event Photography", client: "Acme Corp", link: "https://drive.google.com/drive/folders/sample", adminUrl: `${ORIGIN}/admin/bookings` }) },
  { key: "news", group: "Newsletters", when: "When you send a newsletter", build: () => ({ subject: "Fall wedding season is here", html: emailHtml("Fall wedding season is here", "Three tips for golden-hour portraits", NEWSLETTER_SAMPLE, unsub) }) },
];
