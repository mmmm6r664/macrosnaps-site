// Every MacroSnaps email in one place. Each builder returns { subject, html } using the branded layout.
import { SITE } from "./site";
import { RATES } from "./pricing";
import { IMG, byTags } from "./images";
import { layout, p, small, h2, eyebrow, button, callout, details, priceTable, photoRow, steps, divider, esc, ORIGIN } from "./emailTemplate";

export type Email = { subject: string; html: string };
type Line = { label: string; amount: number };
export type BookingInfo = {
  firstName: string; service: string; ref: string; schedule: string; city?: string; venue?: string;
  lines: Line[]; total: string; phone?: string; email?: string; company?: string; notes?: string;
};
const first = (n: string) => esc((n || "").trim().split(/\s+/)[0] || "there");
const PORTAL = `${ORIGIN}/account`;

/* ---------- bookings ---------- */
export function bookingConfirmed(b: BookingInfo): Email {
  return {
    subject: `Booking confirmed: ${b.service} on ${b.schedule.split(";")[0]}${b.schedule.includes(";") ? " +more" : ""} (ref ${b.ref})`,
    html: layout({
      title: "Your booking is confirmed",
      preheader: `Your ${b.service.toLowerCase()} is confirmed. Here are your details and what happens next.`,
      hero: IMG.hero,
      body:
        p(`Hi ${first(b.firstName)},`) +
        p(`Thank you for choosing MacroSnaps. Your payment has been received and your date is reserved. Your booking details are below.`) +
        eyebrow("Your booking") +
        details([["Service", b.service], ["When", b.schedule], ["Where", [b.venue, b.city].filter(Boolean).join(", ")], ["Booking ref", b.ref]]) +
        eyebrow("Receipt") +
        priceTable(b.lines, "Total paid", b.total) +
        h2("What happens next") +
        steps([
          ["We assign your crew", "An experienced MacroSnaps photographer or videographer is assigned to your event. Our team is your single point of contact throughout."],
          ["Event day", "Your crew arrives about 15 minutes before the start time. To share a shot list or key people, simply reply to this email."],
          ["Delivery", "Edited, retouched photographs are delivered to your private online gallery within about one week; highlight films within two to four weeks."],
        ]) +
        button("Track your order", PORTAL) +
        small(`Sign in to your client portal with this email address to check your order status and, later, view and download your gallery. Your signed Terms and Conditions are on file with this booking.`),
      footerNote: `You're receiving this because you booked with MacroSnaps (ref ${esc(b.ref)}).`,
    }),
  };
}

export function teamNewBooking(b: BookingInfo, adminUrl?: string): Email {
  return {
    subject: `NEW PAID BOOKING ${b.ref}: ${b.service} · ${b.city ?? ""} · ${b.schedule.split(";")[0]} · ${b.total}`,
    html: layout({
      title: "New paid booking 🎉",
      preheader: `${b.firstName} booked ${b.service} for ${b.total}.`,
      body:
        callout(`<b>${esc(b.service)}</b> · ${esc(b.schedule)}<br>${esc([b.venue, b.city].filter(Boolean).join(", "))}`) +
        priceTable(b.lines, "Paid", b.total) +
        details([["Client", b.firstName], ["Email", b.email], ["Phone", b.phone], ["Company", b.company], ["Notes", b.notes], ["Booking ref", b.ref]]) +
        (adminUrl ? button("Open in admin portal", adminUrl) : ""),
      footerNote: "MacroSnaps booking alert.",
      signoff: false,
    }),
  };
}

/* ---------- client portal ---------- */
export function signInLink(url: string): Email {
  return {
    subject: "Your MacroSnaps sign-in link",
    html: layout({
      title: "Sign in to your client portal",
      preheader: "Your one-time sign-in link (expires in 20 minutes).",
      body:
        p("Click below to sign in and see your bookings, order status and galleries. No password needed.") +
        button("Sign in", url) +
        small("This link works once and expires in 20 minutes. If you didn't ask for it, you can safely ignore this email."),
    }),
  };
}

export function stageUpdate(name: string, stageLabel: string, stageText: string, service: string, ref: string, url: string): Email {
  return {
    subject: `Order update: ${stageLabel} · ${service}`,
    html: layout({
      title: `Your order: ${stageLabel}`,
      preheader: stageText,
      body: p(`Hi ${first(name)},`) + callout(esc(stageText)) + details([["Service", service], ["Booking ref", ref]]) + button("Track your order", url),
      footerNote: `Order updates for booking ${esc(ref)}.`,
    }),
  };
}

export function galleryReady(name: string, service: string, url: string, email: string, previews: string[] = []): Email {
  return {
    subject: "Your MacroSnaps gallery is ready",
    html: layout({
      title: "Your gallery is ready",
      preheader: `Your photos from your ${service.toLowerCase()} are ready to view and download.`,
      hero: previews.length ? undefined : IMG.hero,
      body:
        p(`Hi ${first(name)},`) +
        p(`Your edited and retouched photographs from your <b>${esc(service.toLowerCase())}</b> are now available in your private gallery.`) +
        (previews.length ? photoRow(previews) : "") +
        button("View your gallery", url) +
        small(`Sign in with ${esc(email)}. You can view every photo full-screen and download them. Galleries are kept online for 30 days, so please download your favorites soon.`) +
        divider() +
        p(`We would value your feedback. You can rate your experience directly in your client portal; it takes only a moment.`),
    }),
  };
}

export function reviewRequest(name: string, reviewUrl: string): Email {
  return {
    subject: "Would you share your experience on Google?",
    html: layout({
      title: "Thank you for your kind words",
      preheader: "A quick Google review helps other people find us.",
      body:
        p(`Hi ${first(name)},`) +
        p("Thank you for choosing MacroSnaps. Reviews help other clients find us, and a few words about your experience would be greatly appreciated.") +
        `<p style="margin:0 0 6px;text-align:center;font-size:30px;color:#ccba56;letter-spacing:6px">★★★★★</p>` +
        button("Leave a Google review", reviewUrl) +
        small("It takes about a minute. Thank you for your support."),
    }),
  };
}

/** Sent a few days after the gallery is delivered. Each star links straight to the rating form. */
export function feedbackRequest(name: string, service: string, orderUrl: string): Email {
  const stars = [1, 2, 3, 4, 5]
    .map((n) => `<a href="${esc(`${orderUrl}?rate=${n}#feedback`)}" style="text-decoration:none;font-size:38px;line-height:1;color:#ccba56;padding:0 4px" title="${n} star${n > 1 ? "s" : ""}">★</a>`)
    .join("");
  return {
    subject: "How was your experience with MacroSnaps?",
    html: layout({
      title: "How did we do?",
      preheader: `Tell us about your ${service.toLowerCase()}. One click is all it takes.`,
      body:
        p(`Hi ${first(name)},`) +
        p(`We hope you are enjoying your photographs. Your feedback helps us maintain the highest standards. How would you rate your experience with MacroSnaps?`) +
        `<p style="margin:8px 0 6px;text-align:center">${stars}</p>` +
        small(`<span style="display:block;text-align:center">Tap a star to rate. Only our team sees your answer.</span>`) +
        button("Leave feedback", `${orderUrl}#feedback`),
    }),
  };
}

export function lowRatingAlert(rating: number, client: string, email: string, service: string, ref: string, comment: string): Email {
  return {
    subject: `Follow up: ${rating}-star feedback on ${ref}`,
    html: layout({
      title: "Client feedback needs follow-up",
      signoff: false,
      body: callout(`<b>${rating}/5</b> from ${esc(client)} (${esc(email)})<br>${esc(service)} · ${esc(ref)}`) + p(esc(comment) || "<i>No comment left.</i>") + small("Reply to this email to contact the client directly."),
    }),
  };
}

/* ---------- abandoned booking reminders (3 emails) ---------- */
type Abandoned = { firstName: string; service: string; schedule: string; city?: string; lines: Line[]; total: string; resumeUrl: string; stopUrl: string };
const reminderFooter = (stop: string) => `You started a booking on macrosnaps.com but didn't finish paying. <a href="${esc(stop)}" style="color:#9a9a9a">Stop these reminders</a>`;

export function abandoned1(a: Abandoned): Email {
  return {
    subject: `Your ${a.service.toLowerCase()} booking isn't finished yet`,
    html: layout({
      title: "Your booking is almost complete",
      preheader: "Your date isn't reserved until payment is complete. It only takes a minute.",
      body:
        p(`Hi ${first(a.firstName)},`) +
        p(`You recently started a booking with MacroSnaps but did not complete payment. We have saved your details so you can finish in under a minute.`) +
        details([["Service", a.service], ["When", a.schedule], ["Where", a.city]]) +
        priceTable(a.lines, "Total", a.total) +
        button("Finish my booking", a.resumeUrl) +
        small("Pay securely by card, Apple Pay, Google Pay, Cash App Pay, Amazon Pay, or in installments with Klarna or Afterpay. If you need any assistance, simply reply to this email."),
      footerNote: reminderFooter(a.stopUrl),
    }),
  };
}

export function abandoned2(a: Abandoned): Email {
  return {
    subject: `Reserve your date: ${a.service}`,
    html: layout({
      title: "Secure your date",
      preheader: "We can't hold your date until the booking is paid. Here's your saved booking.",
      hero: IMG.hero,
      body:
        p(`Hi ${first(a.firstName)},`) +
        p(`A brief reminder that your booking for <b>${esc(a.schedule)}</b> is not yet reserved. Our crews are in high demand, particularly on weekends and during conference season.`) +
        h2("Why clients choose MacroSnaps") +
        steps([
          ["Transparent pricing", `Published rates for every client: photography from $${RATES.photo.first} for the first hour, with no hidden fees.`],
          ["Experienced professionals", "Seasoned photographers and videographers, fully insured ($1M / $2M)."],
          ["Prompt delivery", "Edited, retouched photographs in about one week, delivered to a private online gallery."],
        ]) +
        button("Complete my booking", a.resumeUrl) +
        small("Questions about the details? Reply to this email or call us and we will be glad to help."),
      footerNote: reminderFooter(a.stopUrl),
    }),
  };
}

export function abandoned3(a: Abandoned): Email {
  return {
    subject: "Last reminder: your saved MacroSnaps booking",
    html: layout({
      title: "Your saved booking",
      preheader: "This is our last reminder about your saved booking.",
      body:
        p(`Hi ${first(a.firstName)},`) +
        p(`This is our final reminder about your saved booking for <b>${esc(a.service.toLowerCase())}</b> on ${esc(a.schedule)}.`) +
        callout(`If your plans have changed, we are happy to help. Reply to this email and we will arrange the right date, time or service for you.`) +
        button("Finish my booking", a.resumeUrl) +
        small(`You may also call us at ${esc(SITE.phone)}.`),
      footerNote: reminderFooter(a.stopUrl),
    }),
  };
}

/* ---------- nurture series for new subscribers (3 emails) ---------- */
export function nurture1(name: string, unsubUrl: string): Email {
  return {
    subject: "Welcome to MacroSnaps",
    html: layout({
      title: "Welcome to MacroSnaps",
      preheader: "Thank you for joining us. Here is what to expect from MacroSnaps.",
      hero: IMG.hero,
      body:
        p(`Hi ${first(name)},`) +
        p("Thank you for joining the MacroSnaps community. MacroSnaps is America&rsquo;s premier photography and videography company, serving clients in all 50 states, Washington, DC, Ontario and Quebec.") +
        p("From time to time we will share planning insights, recent work and exclusive offers. We respect your inbox.") +
        h2("Our services") +
        steps([
          ["Conferences & corporate events", "Keynotes, panels, galas, trade shows, recap films and live streaming."],
          ["Weddings & celebrations", "Weddings, engagements and milestone celebrations, captured with artistry and care."],
          ["Brand & business content", "Executive headshots, product, food and real estate photography, 3D tours and video."],
        ]) +
        button("View our portfolio", `${ORIGIN}/portfolio`),
      unsubUrl,
      footerNote: "You are receiving this because you subscribed to MacroSnaps updates.",
    }),
  };
}

export function nurture2(name: string, unsubUrl: string): Email {
  const pics = [...byTags("wedding").slice(0, 1), ...byTags("conference").slice(0, 1), ...byTags("family").slice(0, 1)];
  return {
    subject: "Five ways to get exceptional event photography",
    html: layout({
      title: "Five tips for exceptional event photography",
      preheader: "Small things that make a big difference on the day.",
      body:
        p(`Hi ${first(name)},`) +
        p("Drawing on thousands of events, these are the details that make the greatest difference:") +
        photoRow(pics) +
        steps([
          ["Share a shot list", "Identify key moments and VIPs so your photographer captures everything that matters."],
          ["Plan for light", "The hour before sunset offers the most flattering light for portraits. We are happy to advise on timing."],
          ["Allow buffer time", "Ten additional minutes for group photographs keeps the schedule relaxed."],
          ["Inform your guests", "A brief note in advance helps guests feel at ease in front of the camera."],
          ["Reserve early", "Weekends and conference season fill quickly. Book online in minutes at published rates."],
        ]) +
        button("Plan my shoot", `${ORIGIN}/book`),
      unsubUrl,
      footerNote: "You are receiving this because you subscribed to MacroSnaps updates.",
    }),
  };
}

export function nurture3(name: string, unsubUrl: string): Email {
  return {
    subject: "Transparent pricing, effortless booking",
    html: layout({
      title: "Ready when you are",
      preheader: "Our rates are published, and you can book and pay online in minutes.",
      hero: IMG.conferenceHero,
      body:
        p(`Hi ${first(name)},`) +
        p("We publish our rates, so you know the investment before you book:") +
        priceTable(
          [{ label: `Photography, 2 hours (${RATES.minHours}-hour minimum)`, amount: RATES.photo.first + RATES.photo.extra }, { label: "Each additional hour of photography", amount: RATES.photo.extra }, { label: "Videography, 2 hours", amount: RATES.video.first + RATES.video.extra }],
          "Published rates",
          "No hidden fees",
        ) +
        p("Select your date and time, review the terms and pay securely in about two minutes, then follow every step in your client portal.") +
        button("Book now", `${ORIGIN}/book`) +
        small(`Planning a multi-day conference or a larger production? Reply to this email or call ${esc(SITE.phone)} for a tailored proposal.`),
      unsubUrl,
      footerNote: "You are receiving this because you subscribed to MacroSnaps updates.",
    }),
  };
}

/* ---------- photographer / videographer network ---------- */
export function photographerAccepted(name: string, signUrl: string | null, setupUrl: string): Email {
  return {
    subject: "Welcome to the MacroSnaps network",
    html: layout({
      title: "Welcome to the team!",
      preheader: "Your application was accepted. Two quick steps to start getting shoots.",
      hero: IMG.conferenceHero,
      body:
        p(`Hi ${first(name)},`) +
        p("Congratulations! We loved your portfolio, and we're excited to welcome you to the MacroSnaps network of photographers and videographers.") +
        p("Here's how to get started. It takes about 10 minutes:") +
        steps([
          ...(signUrl ? ([["Sign your contractor agreement", "Review and e-sign our Contractor Photographer &amp; Videographer Agreement. You'll get a signed PDF copy by email."]] as [string, string][]) : []),
          ["Set up your staff portal", "Create your password, then add your payout method (Venmo, PayPal or Cash App), W-9 details and the shoot types you want."],
          ["Start getting shoots", "We'll send shoot offers in your area by email and in your portal. Accept the ones that fit your schedule."],
        ]) +
        (signUrl ? button("Review & sign the agreement", signUrl) : "") +
        button(signUrl ? "Set up my staff portal" : "Set up my account", setupUrl) +
        small("The account setup link works for 7 days. Your signing link is private to you, so please don't forward it.") +
        divider() +
        p("Questions? Just reply to this email. We're happy to help."),
      footerNote: "You're receiving this because you applied to join the MacroSnaps team.",
    }),
  };
}

/** Sent when a new photographer/videographer is fully onboarded (contract on file). */
export function photographerWelcome(name: string, portalUrl: string, firstLogin: boolean): Email {
  return {
    subject: "Welcome to MacroSnaps",
    html: layout({
      title: "Welcome to MacroSnaps",
      preheader: "Your contractor agreement is on file. Here's how working with us works.",
      hero: IMG.conferenceHero,
      body:
        p(`Hi ${first(name)},`) +
        p("Welcome to MacroSnaps! We're thrilled to have you on the team. Your contractor agreement is on file, so you're all set to start receiving shoots.") +
        h2("How it works") +
        steps([
          [firstLogin ? "Set up your crew portal" : "Complete your crew portal", "Add your payout method (Venmo, PayPal or Cash App), W-9 details, the shoot types you do and how far you'll travel. This is how we match you with shoots."],
          ["Accept shoot offers", "We'll send shoot offers in your area by email and in your portal. Accept the ones that fit your schedule. All the details you need are in the portal."],
          ["Shoot as MacroSnaps", "On a MacroSnaps shoot you represent MacroSnaps only. Please share only MacroSnaps materials and contact details with clients."],
          ["Deliver within 24 hours", "After each shoot, upload all original RAW files and the edited .JPG files to Google Drive. We'll email you a link to send it to us. Everything is due within 24 hours of the event."],
          ["Get paid", "Payment is released once all edited and RAW files are delivered. You can track it under Payments in your portal."],
        ]) +
        button(firstLogin ? "Set up my crew portal" : "Open my crew portal", portalUrl) +
        (firstLogin ? small("The setup link works for 7 days. After that, use \u201cForgot password\u201d on the sign-in page.") : "") +
        divider() +
        p("Questions about a shoot, payments or anything else? Open a support ticket in your portal or just reply to this email. We're happy to help.") +
        p("We're excited to work with you!"),
      footerNote: "You're receiving this because you joined the MacroSnaps team.",
    }),
  };
}

/* ---------- contracts (e-signature) ---------- */
export function contractToSign(name: string, companySigner: string, docTitle: string, url: string, docId: string): Email {
  return {
    subject: `Please sign: MacroSnaps ${docTitle}`,
    html: layout({
      title: "Your contract is ready to sign",
      preheader: `MacroSnaps sent you our ${docTitle}.`,
      body:
        p(`Hi ${first(name)},`) +
        p(`MacroSnaps has signed and sent you our <b>${esc(docTitle)}</b>. Please review it and sign online. It takes about two minutes and works on your phone.`) +
        button("Review & sign", url) +
        callout("After you sign, you'll both receive the signed PDF by email.") +
        small("This link is private to you. Please don't forward it. If you have questions about the agreement, just reply to this email."),
      footerNote: `Document ID ${esc(docId)}`,
    }),
  };
}

const contractInfo = (docTitle: string, version: string, docId: string, signer: string, email: string, _company: string) =>
  details([["Document", `${docTitle} (v${version})`], ["Document ID", docId], ["Signed by", `${signer} <${email}>`]]);

export function contractSignedSigner(name: string, docTitle: string, version: string, docId: string, email: string, company: string): Email {
  return {
    subject: `Signed: MacroSnaps ${docTitle}`,
    html: layout({
      title: "You're all signed",
      preheader: "Your signed contract is attached.",
      body: p(`Hi ${first(name)},`) + p("Thank you! Your signed agreement is attached as a PDF for your records.") + contractInfo(docTitle, version, docId, name, email, company) + p("Next, set up your staff portal (if you haven't yet) so we can start sending you shoot offers.") + button("Open my staff portal", `${ORIGIN}/staff`) + small("Keep this email. You can also ask us for a copy at any time."),
    }),
  };
}

export function contractSignedTeam(name: string, docTitle: string, version: string, docId: string, email: string, company: string): Email {
  return {
    subject: `Contract signed: ${name} (${docId})`,
    html: layout({
      title: "Contract signed ✍️",
      signoff: false,
      body: p(`<b>${esc(name)}</b> signed the ${esc(docTitle)}. The signed PDF with the audit certificate is attached and saved in the admin portal.`) + contractInfo(docTitle, version, docId, name, email, company) + button("Open contracts", `${ORIGIN}/admin/contracts`),
    }),
  };
}

/* ---------- generic (contact forms, staff, admin alerts, newsletters) ---------- */
export const generic = (title: string, bodyHtml: string, opts: { preheader?: string; unsubUrl?: string; footerNote?: string; signoff?: boolean } = {}) => layout({ title, body: bodyHtml, ...opts });
export { details as detailsTable };

/* ---------- replies from the admin inbox ---------- */
/** A personal reply typed in the admin inbox. Plain text in, branded email out; optional "Book online" button. */
export function inquiryReply(subject: string, message: string, bookButton: boolean): Email {
  const linkify = (s: string) => s.replace(/https?:\/\/[^\s<]+[^\s<.,;:!?)]/g, (u) => `<a href="${u}" style="color:#8a7a2c">${u}</a>`);
  const paras = message.trim().split(/\n\s*\n/).map((para) => p(linkify(esc(para.trim())).replace(/\n/g, "<br>"))).join("");
  return {
    subject,
    html: layout({
      title: subject.replace(/^re:\s*/i, ""),
      preheader: message.trim().split("\n").find((l) => l.trim() && !/^(hi|hello|dear)\b/i.test(l.trim()))?.slice(0, 120) ?? "",
      body: paras + (bookButton ? button("Book your date online", `${ORIGIN}/book`) : ""),
    }),
  };
}

/* ---------- crew: deliver files after the shoot ---------- */
export type CrewShoot = { name: string; service: string; ref: string; order?: string; client: string; when: string; venue: string; deadline: string; url: string; folder: string };

/** Sent to each photographer/videographer when the shoot ends (and once more as a reminder) asking for the Google Drive link. */
export function crewDriveRequest(c: CrewShoot, reminder = false): Email {
  return {
    subject: reminder ? `Reminder: Google Drive link for ${c.ref} is due by ${c.deadline}` : `Thank you! Please send the Google Drive link for ${c.ref} within 24 hours`,
    html: layout({
      title: reminder ? "Your files are due soon" : "Thanks for a great shoot!",
      preheader: `Upload everything to Google Drive and send us the link by ${c.deadline}.`,
      body:
        p(`Hi ${first(c.name)},`) +
        p(reminder
          ? `We haven't received the Google Drive link for this shoot yet. As a reminder, all files are due <b>within 24 hours of the event</b>, by <b>${esc(c.deadline)}</b>.`
          : `Thank you for covering this shoot for MacroSnaps. Please upload <b>all original RAW files and the edited .JPG files</b> (and video files, if you filmed) to a Google Drive folder and send us the link <b>within 24 hours</b>, by <b>${esc(c.deadline)}</b>.`) +
        details([["Order", c.order], ["Shoot", c.service], ["Client", c.client], ["When", c.when], ["Venue", c.venue]]) +
        button("Send the Google Drive link", c.url) +
        steps([
          ["Create one folder", `Name it “${esc(c.folder)}”, with RAW and Edited subfolders.`],
          ["Share it with us only", "Share the folder with <b>info@macrosnaps.com</b> only. Please do not set it to “Anyone with the link”, and never share files or links with the client: MacroSnaps delivers everything to the client."],
          ["Paste the link", "Use the button above. It only takes a moment and no login is needed."],
        ]) +
        small("Payment for the shoot is released once all edited and RAW files are delivered. Questions? Just reply to this email."),
    }),
  };
}

/** Team alert when a crew member sends their link, or when one is overdue. */
export function crewDriveTeam(kind: "received" | "overdue", c: { name: string; email: string; ref: string; service: string; client: string; link?: string; adminUrl: string }): Email {
  return {
    subject: kind === "received" ? `[Internal] Files delivered for ${c.ref} by ${c.name}` : `Overdue: no Google Drive link for ${c.ref} from ${c.name}`,
    html: layout({
      title: kind === "received" ? "Files delivered" : "Files overdue",
      signoff: false,
      body:
        (kind === "received" ? callout("Internal only: this email shows the crew member's name, email and Drive folder. Please don't forward it to the client; deliver through the client gallery instead.") : "") +
        p(kind === "received" ? `${esc(c.name)} sent the Google Drive link for this shoot.` : `It has been more than 24 hours since the shoot ended and ${esc(c.name)} (${esc(c.email)}) hasn't sent the Google Drive link yet. They've had the request and one reminder.`) +
        details([["Order", c.ref], ["Service", c.service], ["Client", c.client], ["Crew", `${c.name} <${c.email}>`], ...(c.link ? [["Drive link", c.link] as [string, string]] : [])]) +
        (c.link ? button("Open the Drive folder", c.link) : "") +
        button("Open the booking", c.adminUrl),
    }),
  };
}

/* ---------- form confirmations ---------- */
/** Auto-reply to someone who used the contact form. */
export function contactReceived(name: string, subject: string, message: string): Email {
  return {
    subject: "We received your message | MacroSnaps",
    html: layout({
      title: "Thank you for contacting MacroSnaps",
      preheader: "We'll reply within one business day.",
      body:
        p(`Hi ${first(name)},`) +
        p("Thank you for contacting MacroSnaps. We have received your message, and a member of our team will respond <b>within one business day</b>.") +
        details([["Subject", subject || "General inquiry"]]) +
        `<div style="margin:0 0 22px;padding:14px 18px;border-left:3px solid #ccba56;background:#faf8f2;font:15px/1.6 Arial,sans-serif;color:#333">${esc(message).replace(/\n/g, "<br>")}</div>` +
        p("You can also review our rates and reserve your date online in just a few minutes.") +
        button("View rates & book online", `${ORIGIN}/book`),
    }),
  };
}

/** Confirmation to a careers applicant. */
export function applicationReceived(name: string, role: string): Email {
  return {
    subject: "We received your application | MacroSnaps",
    html: layout({
      title: "Thank you for your application",
      preheader: "Our team reviews every application. Here's what happens next.",
      body:
        p(`Hi ${first(name)},`) +
        p(`Thank you for applying to join MacroSnaps as a ${esc((role || "photographer").toLowerCase())}. We've received your application and portfolio.`) +
        steps([
          ["We review your work", "Our team looks at every portfolio and your gear and experience."],
          ["We get in touch", "If it's a fit, we'll email you with next steps, including your contractor agreement and crew portal access."],
        ]) +
        p("There's nothing else you need to do right now. Questions? Just reply to this email."),
      footerNote: "You're receiving this because you applied to join the MacroSnaps team.",
    }),
  };
}

/* ---------- support tickets ---------- */
export type TicketMail = { no: string; name: string; subject: string; category: string; orderRef?: string | null; url: string };
const quote = (body: string) => `<div style="margin:0 0 22px;padding:14px 18px;border-left:3px solid #ccba56;background:#faf8f2;font:15px/1.6 Arial,sans-serif;color:#333">${esc(body).replace(/\n/g, "<br>")}</div>`;

/** To the person who opened the ticket. */
export function ticketOpened(t: TicketMail, body: string): Email {
  return {
    subject: `We received your request [${t.no}]: ${t.subject}`,
    html: layout({
      title: "We’re on it",
      preheader: `Your ticket number is ${t.no}. We usually reply within one business day.`,
      body:
        p(`Hi ${first(t.name)},`) +
        p(`Thanks for contacting MacroSnaps. We’ve received your request and a member of our team will reply <b>within one business day</b> (usually much sooner).`) +
        details([["Ticket", t.no], ["Topic", t.category], ["Order", t.orderRef], ["Subject", t.subject]]) +
        quote(body) +
        button("View or add to your ticket", t.url) +
        small("Keep this email: the button above always takes you back to your ticket. To add more details or links, open the ticket and write a reply."),
    }),
  };
}

/** Our reply, or a status change, to the person who opened the ticket. */
export function ticketUpdated(t: TicketMail, status: string, message: string | null): Email {
  const resolved = status === "resolved";
  const label: Record<string, string> = { open: "Open", in_progress: "In progress", waiting: "Waiting for your reply", resolved: "Resolved", closed: "Closed" };
  return {
    subject: resolved ? `Resolved [${t.no}]: ${t.subject}` : message ? `New reply on your request [${t.no}]: ${t.subject}` : `Update on your request [${t.no}]: ${label[status] ?? status}`,
    html: layout({
      title: resolved ? "Your request is resolved" : message ? "We replied to your request" : "Your request was updated",
      preheader: message ? message.slice(0, 120) : `Status: ${label[status] ?? status}`,
      body:
        p(`Hi ${first(t.name)},`) +
        (message ? quote(message) : "") +
        (resolved
          ? p("We’ve marked this request as <b>resolved</b>. If anything still isn’t right, just open the ticket and reply. It will reopen automatically.")
          : status === "waiting"
            ? p("We need a little more information from you to continue. Please open the ticket and reply.")
            : !message ? p(`Your request is now <b>${esc(label[status] ?? status)}</b>.`) : "") +
        details([["Ticket", t.no], ["Status", label[status] ?? status], ["Subject", t.subject]]) +
        button(resolved ? "View ticket" : "Open & reply", t.url),
    }),
  };
}

/** To the team: a new ticket, or the customer replied. */
export function ticketTeam(kind: "new" | "reply", t: TicketMail & { email: string; source: string; phone?: string | null }, body: string): Email {
  return {
    subject: `${kind === "new" ? "New support ticket" : "Customer replied"} [${t.no}]: ${t.subject}`,
    html: layout({
      title: kind === "new" ? "New support ticket" : "New reply on a ticket",
      signoff: false,
      body:
        details([["Ticket", t.no], ["From", `${t.name} <${t.email}>`], ["Phone", t.phone], ["Who", t.source === "photographer" ? "Photographer / videographer" : t.source === "client" ? "Client (signed in)" : "Website visitor"], ["Topic", t.category], ["Order", t.orderRef], ["Subject", t.subject]]) +
        quote(body) +
        button("Open in admin", t.url),
    }),
  };
}

/* ---------- crew: shoot assignment confirmation ---------- */
export type CrewAssignment = {
  name: string;            // photographer's full name
  type: string;            // e.g. "Conference Photography"
  dates: string;           // e.g. "Friday & Saturday"
  sessions: { day: string; time: string }[]; // e.g. { day: "Friday 16th October", time: "3:00 PM – 5:00 PM (2 hours)" }
  location: string;        // multi-line: venue, street, city
  pay: string;             // e.g. "$350"
  scope: string[];         // scope-of-work bullets
  city?: string;           // used in the subject, e.g. "New York, NY"
};

const bullets = (items: string[]) =>
  `<ul style="margin:0 0 18px;padding-left:22px;font:16px/1.65 Helvetica,Arial,sans-serif;color:#333">${items.map((i) => `<li style="margin:0 0 8px">${i}</li>`).join("")}</ul>`;
const head = (t: string) => `<p style="margin:22px 0 10px;font:700 17px/1.4 Helvetica,Arial,sans-serif;color:#111">${esc(t)}</p>`;

/** Default scope bullets for common shoot types (edit per assignment). */
export const DEFAULT_SCOPE: Record<string, string[]> = {
  conference: [
    "Capture speakers on stage, keynote presentations, panel discussions, and other important conference sessions.",
    "Take candid and posed photographs of attendees, networking moments, and group interactions.",
    "Capture event branding, signage, sponsor displays, and venue details.",
    "Make sure to photograph individual speakers and important moments during each session.",
    "Focus on storytelling through photography, capturing the energy, professionalism, and atmosphere of the event.",
    "Ensure consistent photography coverage across all days.",
  ],
  video: [
    "Record all sessions/speeches using one camera on a tripod for continuous coverage.",
    "Use a second camera on a gimbal or crane for dynamic angles and movement (very important for stable footage).",
    "Capture clear, professional audio using lav mics (plugged into the venue's audio system where available).",
    "Record audience engagement, speaker moments and guest interactions that represent the event atmosphere, including breaks and shots outside and inside the venue.",
  ],
};

/** True when an assignment type is videography (gets the video guidelines). */
export const isVideoAssignment = (type: string) => /video|film|cinemat/i.test(type);

/** Sent to a photographer/videographer when a shoot is assigned to them. */
export function crewAssignment(a: CrewAssignment): Email {
  const firstName = first(a.name);
  const plain = (s: string) => esc(s);
  const video = isVideoAssignment(a.type);
  return {
    subject: `[CONFIRMED] ${a.type} – ${a.dates}${a.city ? ` – ${a.city}` : ""}`,
    html: layout({
      title: `Your ${a.type} assignment is confirmed`,
      preheader: `${a.dates}${a.city ? ` in ${a.city}` : ""} · Compensation ${a.pay}`,
      body:
        p(`Hi ${firstName},`) +
        p("As discussed, here are the details of your upcoming assignment:") +
        p(`<b>Type:</b> ${plain(a.type)}<br><b>Dates:</b> ${plain(a.dates)}`) +
        head("Schedule:") +
        bullets(a.sessions.map((s) => `<b>${plain(s.day)}:</b> ${plain(s.time)}`)) +
        p(`<b>Location:</b><br>${plain(a.location).replace(/\n/g, "<br>")}`) +
        p(`<b>Compensation:</b> ${plain(a.pay)}`) +
        head("Scope of Work") +
        bullets((a.scope.length ? a.scope : video ? DEFAULT_SCOPE.video : DEFAULT_SCOPE.conference).map(plain)) +
        head("Technical Shooting Guidelines") +
        bullets(video ? [
          "Shoot at <b>1080p resolution, 30 frames per second (FPS)</b> in <b>MP4 format</b>.",
          "Ensure steady <b>tripod coverage</b> for the main camera and smooth, motion-stabilized shots with the <b>gimbal/crane</b>.",
          "Confirm <b>lav mics</b> are recording properly and synced through the main audio system.",
        ] : [
          "Shoot in <b>RAW format</b>.",
          "Never drop shutter speed below <b>1/60</b>.",
          "Keep ISO no higher than <b>2500 indoors</b> and <b>500 outdoors</b>.",
          "Keep the aperture as low as possible, ideally between <b>f/2 – f/3</b>, whenever appropriate.",
          "Do <b>not use direct flash</b> — only use flash with a <b>white reflector</b> or bounce it off the ceiling for softer lighting.",
        ]) +
        head("Deliverables") +
        bullets(video ? [
          "Upload all <b>unedited raw video files (MP4)</b> to the <b>Google Drive</b> link we'll provide after the event.",
          "The client receives the raw recordings and a highlight video edited by our internal team.",
          "Retain all footage for at least <b>30 days</b> in case additional edits or revisions are needed.",
        ] : [
          "Shoot in <b>RAW format</b>.",
          "Only <b>unedited RAW files</b> are required.",
          "Send unedited RAW files via <b>Google Drive or Dropbox within 24 hours</b> after each shoot.",
          "Retain all RAW files for at least <b>30 days</b> in case they are needed.",
        ]) +
        head("As per the contract") +
        bullets([
          `Always introduce yourself as <b>${firstName} from MacroSnaps</b>.`,
          "Represent <b>MacroSnaps exclusively</b> — do not engage the client directly for future work or represent other companies.",
          `All ${video ? "footage is" : "photographs are"} the <b>intellectual property of MacroSnaps</b>. Delete all files after 30 days unless instructed otherwise.`,
          `Do not share any ${video ? "videos" : "photos"} directly with the client — all communication and delivery must go through <b>MacroSnaps</b>.`,
          "Please provide your <b>CashApp, PayPal, or Venmo ID</b> for payment after the assignment.",
        ]) +
        p("<b>Important:</b><br>Please do not ask the client directly for tips. A feedback and tipping link will be sent after delivery. Any tip received will be forwarded to you in full without deductions.") +
        p(`<b>Performance Note:</b><br>Let us know if you have any questions. We look forward to your excellent coverage of this ${plain(a.type.replace(/\s*(photography|videography)\s*$/i, "").toLowerCase() || "shoot")}. Our top-performing contractors typically receive <b>5–10 shoots per week</b>, so please always give your best. After each session, we send the client a <b>satisfaction survey</b>, and their feedback determines how many future assignments you receive.`),
    }),
  };
}

/* ---------- crew: payment sent ---------- */
/** Confirmation to a photographer/videographer that they've been paid. */
export function payoutSent(o: { name: string; amount: string; method: string | null; date: string; note?: string; portal?: boolean }): Email {
  const when = new Date(`${o.date}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return {
    subject: `Payment sent: ${o.amount}${o.note ? ` for ${o.note}` : ""}`,
    html: layout({
      title: "Your payment has been sent",
      preheader: `We sent you ${o.amount}${o.method ? ` via ${o.method}` : ""} on ${when}.`,
      body:
        p(`Hi ${first(o.name)},`) +
        p(`Thank you for your work with MacroSnaps. We've sent your payment${o.note ? ` for <b>${esc(o.note)}</b>` : ""}.`) +
        details([["Amount", o.amount], ["Method", o.method], ["Date sent", when], ["For", o.note]]) +
        p(`Please allow a little time for it to show in your ${esc(o.method || "account")}. If anything looks wrong, just reply to this email.`) +
        (o.portal ? small("You can see all your payments anytime in your crew portal under Payments.") : "") +
        p("We look forward to working with you again."),
    }),
  };
}

/* ---------- client: invoice (sent by MacroSnaps; Stripe only hosts the payment page) ---------- */
export type InvoiceMail = { name: string; billTo?: string | null; number: string; total: number; due: Date | null; memo?: string | null; lines: { label: string; amount: number }[]; payUrl: string; pdfUrl?: string | null; paid?: boolean; reminder?: boolean };
export function invoiceEmail(i: InvoiceMail): Email {
  if (i.reminder) return invoiceReminderEmail(i);
  const due = i.due ? i.due.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" }) : null;
  const total = `$${i.total.toLocaleString("en-US", { minimumFractionDigits: i.total % 1 ? 2 : 0 })}`;
  return {
    subject: `Invoice ${i.number} from MacroSnaps: ${total}${due ? `, due ${due}` : ""}`,
    html: layout({
      title: `Invoice ${i.number}`,
      preheader: `${total}${due ? ` due ${due}` : ""}${i.memo ? ` · ${i.memo}` : ""}. Pay securely online.`,
      body:
        p(`Hi ${first(i.name)},`) +
        p(`Thank you for choosing MacroSnaps. Here is your invoice${i.memo ? ` for <b>${esc(i.memo)}</b>` : ""}.`) +
        details([["Invoice", i.number], ["Billed to", i.billTo ?? null], ["Amount due", total], ["Due date", due]]) +
        priceTable(i.lines, "Total due", total) +
        button("View & pay invoice", i.payUrl) +
        small(`Pay securely online by card or bank transfer (ACH).${i.pdfUrl ? ` <a href="${esc(i.pdfUrl)}">Download the PDF invoice</a>.` : ""} Need a W-9 or a different payment method? Just reply to this email.`) +
        p("We look forward to working with you."),
    }),
  };
}

/** Friendly payment reminder for an invoice that was already sent and is still open. */
function invoiceReminderEmail(i: InvoiceMail): Email {
  const due = i.due ? i.due.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" }) : null;
  const overdue = !!i.due && i.due.getTime() < Date.now() - 86_400_000;
  const total = `$${i.total.toLocaleString("en-US", { minimumFractionDigits: i.total % 1 ? 2 : 0 })}`;
  return {
    subject: `Reminder: Invoice ${i.number} from MacroSnaps: ${total}${due ? `, ${overdue ? "was due" : "due"} ${due}` : ""}`,
    html: layout({
      title: `Reminder: invoice ${i.number}`,
      preheader: `${total} still open${due ? `, ${overdue ? "was due" : "due"} ${due}` : ""}. Pay securely online to confirm your booking.`,
      body:
        p(`Hi ${first(i.name)},`) +
        p(`Just a friendly reminder that your MacroSnaps invoice${i.memo ? ` for <b>${esc(i.memo)}</b>` : ""} is still open. Your date is confirmed once the invoice is paid, so we recommend paying soon to make sure it stays available.`) +
        details([["Invoice", i.number], ["Billed to", i.billTo ?? null], ["Amount due", total], ["Due date", due]]) +
        priceTable(i.lines, "Total due", total) +
        button("View & pay invoice", i.payUrl) +
        small(`Pay securely online by card or bank transfer (ACH).${i.pdfUrl ? ` <a href="${esc(i.pdfUrl)}">Download the PDF invoice</a>.` : ""} If you've already paid, or your plans have changed, just reply to this email and let us know.`) +
        p("We look forward to working with you."),
    }),
  };
}

/* ---------- invoices: paid ---------- */
export type PaidInvoice = { name: string; billTo?: string | null; number: string; amount: number; paidAt: Date; method?: string | null; memo?: string | null; viewUrl: string; receiptUrl?: string | null; adminUrl?: string };
const usdAmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
const paidDay = (d: Date) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });

/** To the client: thank-you + receipt, sent by MacroSnaps. */
export function invoiceReceipt(i: PaidInvoice): Email {
  return {
    subject: `Payment received: ${usdAmt(i.amount)} for invoice ${i.number}`,
    html: layout({
      title: "Payment received",
      preheader: `We received your payment of ${usdAmt(i.amount)} for invoice ${i.number}.`,
      body:
        p(`Hi ${first(i.name)},`) +
        p(`Thank you. We have received your payment${i.memo ? ` for <b>${esc(i.memo)}</b>` : ""}.`) +
        details([["Invoice", i.number], ["Billed to", i.billTo ?? null], ["Amount paid", usdAmt(i.amount)], ["Paid on", paidDay(i.paidAt)], ["Payment method", i.method ?? null]]) +
        button("View paid invoice", i.viewUrl) +
        small(i.receiptUrl ? `<a href="${esc(i.receiptUrl)}">Download your receipt</a> for your records.` : "Keep this email for your records.") +
        p("We look forward to working with you."),
    }),
  };
}

/** To the team: an invoice was paid. */
export function invoicePaidTeam(i: PaidInvoice): Email {
  return {
    subject: `INVOICE PAID ${i.number}: ${usdAmt(i.amount)} from ${i.billTo?.split("\n")[0] || i.name}`,
    html: layout({
      title: `Invoice ${i.number} was paid`,
      preheader: `${usdAmt(i.amount)} received${i.method ? ` by ${i.method}` : ""}.`,
      body:
        details([["Invoice", i.number], ["Amount", usdAmt(i.amount)], ["Paid on", paidDay(i.paidAt)], ["Method", i.method ?? null], ["Client", i.name], ["Billed to", i.billTo ?? null], ["For", i.memo ?? null]]) +
        (i.adminUrl ? button("Open in admin", i.adminUrl) : ""),
    }),
  };
}
