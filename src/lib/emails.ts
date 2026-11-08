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
    subject: `You're booked! ${b.service} on ${b.schedule.split(";")[0]}${b.schedule.includes(";") ? " +more" : ""} (ref ${b.ref})`,
    html: layout({
      title: "You're booked!",
      preheader: `Your ${b.service.toLowerCase()} is confirmed. Here are your details and what happens next.`,
      hero: IMG.hero,
      body:
        p(`Hi ${first(b.firstName)},`) +
        p(`Thank you for choosing MacroSnaps. Your payment went through and your date is reserved. Here's everything in one place.`) +
        eyebrow("Your booking") +
        details([["Service", b.service], ["When", b.schedule], ["Where", [b.venue, b.city].filter(Boolean).join(", ")], ["Booking ref", b.ref]]) +
        eyebrow("Receipt") +
        priceTable(b.lines, "Total paid", b.total) +
        h2("What happens next") +
        steps([
          ["We assign your crew", "You'll get an email with your photographer's or videographer's name and contact details before the shoot."],
          ["Shoot day", "Your crew arrives about 15 minutes early. Share a shot list or key people by replying to this email."],
          ["Your gallery", "Edited and retouched photos arrive in your private online gallery in about a week; highlight videos in 2 to 4 weeks."],
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
    subject: "Your MacroSnaps gallery is ready! 📸",
    html: layout({
      title: "Your gallery is ready",
      preheader: `Your photos from your ${service.toLowerCase()} are ready to view and download.`,
      hero: previews.length ? undefined : IMG.hero,
      body:
        p(`Hi ${first(name)},`) +
        p(`The wait is over! Your edited and retouched photos from your <b>${esc(service.toLowerCase())}</b> are ready in your private gallery.`) +
        (previews.length ? photoRow(previews) : "") +
        button("View your gallery", url) +
        small(`Sign in with ${esc(email)}. You can view every photo full-screen and download them. Galleries are kept online for 30 days, so please download your favorites soon.`) +
        divider() +
        p(`We'd love to hear how we did. You can rate your experience right in your portal; it only takes a few seconds.`),
    }),
  };
}

export function reviewRequest(name: string, reviewUrl: string): Email {
  return {
    subject: "Thank you! Would you share your experience on Google?",
    html: layout({
      title: "Thank you for the kind words",
      preheader: "A quick Google review helps other people find us.",
      body:
        p(`Hi ${first(name)},`) +
        p("We're so glad you loved working with MacroSnaps. Reviews are how most of our clients find us, so a few words from you mean a lot.") +
        `<p style="margin:0 0 6px;text-align:center;font-size:30px;color:#ccba56;letter-spacing:6px">★★★★★</p>` +
        button("Leave a Google review", reviewUrl) +
        small("It takes about a minute. Thank you for supporting a small business!"),
    }),
  };
}

/** Sent a few days after the gallery is delivered. Each star links straight to the rating form. */
export function feedbackRequest(name: string, service: string, orderUrl: string): Email {
  const stars = [1, 2, 3, 4, 5]
    .map((n) => `<a href="${esc(`${orderUrl}?rate=${n}#feedback`)}" style="text-decoration:none;font-size:38px;line-height:1;color:#ccba56;padding:0 4px" title="${n} star${n > 1 ? "s" : ""}">★</a>`)
    .join("");
  return {
    subject: "How did we do? (takes 10 seconds)",
    html: layout({
      title: "How did we do?",
      preheader: `Tell us about your ${service.toLowerCase()}. One click is all it takes.`,
      body:
        p(`Hi ${first(name)},`) +
        p(`We hope you're enjoying your photos! Your opinion helps us get better, so how would you rate your experience with MacroSnaps?`) +
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
      title: "You're one step away",
      preheader: "Your date isn't reserved until payment is complete. It only takes a minute.",
      body:
        p(`Hi ${first(a.firstName)},`) +
        p(`It looks like you started booking with us but didn't get to the payment step. We've saved everything for you, so you can finish in under a minute.`) +
        details([["Service", a.service], ["When", a.schedule], ["Where", a.city]]) +
        priceTable(a.lines, "Total", a.total) +
        button("Finish my booking", a.resumeUrl) +
        small("Pay securely by card, Apple Pay, Google Pay, Cash App Pay, Amazon Pay, or in installments with Klarna or Afterpay. Hit a snag? Just reply and we'll help."),
      footerNote: reminderFooter(a.stopUrl),
    }),
  };
}

export function abandoned2(a: Abandoned): Email {
  return {
    subject: `Is your date still open? Let's lock in your ${a.service.toLowerCase()}`,
    html: layout({
      title: "Popular dates go fast",
      preheader: "We can't hold your date until the booking is paid. Here's your saved booking.",
      hero: IMG.hero,
      body:
        p(`Hi ${first(a.firstName)},`) +
        p(`Just a friendly reminder: your booking for <b>${esc(a.schedule)}</b> isn't reserved yet. Our crews book up quickly, especially on weekends and during conference season.`) +
        h2("Why clients choose MacroSnaps") +
        steps([
          ["Published prices", `The same rates for everyone: photography from $${RATES.photo.first} for the first hour, no surprise fees.`],
          ["Our own crews", "Experienced photographers and videographers, insured by State Farm ($1M / $2M)."],
          ["Fast delivery", "Edited and retouched photos in about a week, in a private online gallery."],
        ]) +
        button("Complete my booking", a.resumeUrl) +
        small("Questions about the details? Reply to this email or call us and we'll sort it out."),
      footerNote: reminderFooter(a.stopUrl),
    }),
  };
}

export function abandoned3(a: Abandoned): Email {
  return {
    subject: "Last reminder: your saved MacroSnaps booking",
    html: layout({
      title: "Still need a photographer?",
      preheader: "This is our last reminder about your saved booking.",
      body:
        p(`Hi ${first(a.firstName)},`) +
        p(`We don't want you to miss out, so this is our last note about your saved booking for <b>${esc(a.service.toLowerCase())}</b> on ${esc(a.schedule)}.`) +
        callout(`Plans changed? No problem. If you need a different date, time or service, reply to this email and we'll help you put together the right booking.`) +
        button("Finish my booking", a.resumeUrl) +
        small(`Or call ${esc(SITE.phone)}. We're happy to answer any questions.`),
      footerNote: reminderFooter(a.stopUrl),
    }),
  };
}

/* ---------- nurture series for new subscribers (3 emails) ---------- */
export function nurture1(name: string, unsubUrl: string): Email {
  return {
    subject: "Welcome to MacroSnaps 📸",
    html: layout({
      title: "Welcome to MacroSnaps",
      preheader: "Thanks for joining us. Here's what to expect (and a little about us).",
      hero: IMG.hero,
      body:
        p(`Hi ${first(name)},`) +
        p("Thanks for subscribing! We're MacroSnaps: photographers and videographers for conferences, corporate events, weddings and celebrations across all 50 states, Washington, DC, Ontario and Quebec.") +
        p("A few times a year we'll send photo tips, event-planning ideas and the occasional offer. Never spam.") +
        h2("What we do") +
        steps([
          ["Events & conferences", "Keynotes, panels, galas, trade shows, recap videos and live streaming."],
          ["Weddings & celebrations", "Indian, Pakistani, Muslim, Jewish and every other kind of wedding, plus Bar and Bat Mitzvahs, sweet 16s and more."],
          ["Business content", "Headshots, product, food and real estate photos, 3D tours and video ads."],
        ]) +
        button("See our work", `${ORIGIN}/portfolio`),
      unsubUrl,
      footerNote: "You're receiving this because you subscribed on macrosnaps.com.",
    }),
  };
}

export function nurture2(name: string, unsubUrl: string): Email {
  const pics = [...byTags("wedding").slice(0, 1), ...byTags("conference").slice(0, 1), ...byTags("family").slice(0, 1)];
  return {
    subject: "How to get photos you'll love (5 quick tips)",
    html: layout({
      title: "5 tips for better event photos",
      preheader: "Small things that make a big difference on the day.",
      body:
        p(`Hi ${first(name)},`) +
        p("After thousands of events, here's what we've learned makes the biggest difference:") +
        photoRow(pics) +
        steps([
          ["Share a shot list", "Name the must-have moments and VIPs. Your photographer will make sure nothing gets missed."],
          ["Plan for light", "Golden hour (the hour before sunset) is magic for portraits. Ask us about timing."],
          ["Build in buffer time", "Ten extra minutes for group photos keeps the day relaxed."],
          ["Tell guests", "A quick heads-up helps people relax in front of the camera."],
          ["Book early", "Weekends and conference season fill up fast. Book online in minutes at published prices."],
        ]) +
        button("Plan my shoot", `${ORIGIN}/book`),
      unsubUrl,
      footerNote: "You're receiving this because you subscribed on macrosnaps.com.",
    }),
  };
}

export function nurture3(name: string, unsubUrl: string): Email {
  return {
    subject: "Simple, published pricing (and booking takes 2 minutes)",
    html: layout({
      title: "Ready when you are",
      preheader: "Our rates are published, and you can book and pay online in minutes.",
      hero: IMG.conferenceHero,
      body:
        p(`Hi ${first(name)},`) +
        p("Most photographers make you ask for a quote. We publish ours, so you know the price before you book:") +
        priceTable(
          [{ label: `Photography, 2 hours (${RATES.minHours}-hour minimum)`, amount: RATES.photo.first + RATES.photo.extra }, { label: "Each additional hour of photography", amount: RATES.photo.extra }, { label: "Videography, 2 hours", amount: RATES.video.first + RATES.video.extra }],
          "Same price for everyone",
          "No hidden fees",
        ) +
        p("Pick your date and time, sign the terms online and pay securely, all in about two minutes. Then track everything in your client portal.") +
        button("Book now", `${ORIGIN}/book`) +
        small(`Planning something bigger, like a multi-day conference? Reply to this email or call ${esc(SITE.phone)}.`),
      unsubUrl,
      footerNote: "You're receiving this because you subscribed on macrosnaps.com.",
    }),
  };
}

/* ---------- photographer / videographer network ---------- */
export function photographerAccepted(name: string, signUrl: string | null, setupUrl: string): Email {
  return {
    subject: "Congratulations! You've been accepted to MacroSnaps 🎉",
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
    subject: "Welcome to MacroSnaps! 🎉",
    html: layout({
      title: "Welcome to MacroSnaps!",
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
      preheader: `${companySigner} sent you the MacroSnaps ${docTitle}.`,
      body:
        p(`Hi ${first(name)},`) +
        p(`${esc(companySigner)} has signed and sent you our <b>${esc(docTitle)}</b>. Please review it and sign online. It takes about two minutes and works on your phone.`) +
        button("Review & sign", url) +
        callout("After you sign, you'll both receive the signed PDF by email.") +
        small("This link is private to you. Please don't forward it. If you have questions about the agreement, just reply to this email."),
      footerNote: `Document ID ${esc(docId)}`,
    }),
  };
}

const contractInfo = (docTitle: string, version: string, docId: string, signer: string, email: string, company: string) =>
  details([["Document", `${docTitle} (v${version})`], ["Document ID", docId], ["Signed by", `${signer} <${email}>`], ["Countersigned by", `${company}, MacroSnaps`]]);

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
          ["Share it", "Set sharing to “Anyone with the link can view” (or share it with info@macrosnaps.com)."],
          ["Paste the link", "Use the button above. It only takes a moment and no login is needed."],
        ]) +
        small("Payment for the shoot is released once all edited and RAW files are delivered. Questions? Just reply to this email."),
    }),
  };
}

/** Team alert when a crew member sends their link, or when one is overdue. */
export function crewDriveTeam(kind: "received" | "overdue", c: { name: string; email: string; ref: string; service: string; client: string; link?: string; adminUrl: string }): Email {
  return {
    subject: kind === "received" ? `Files delivered for ${c.ref} by ${c.name}` : `Overdue: no Google Drive link for ${c.ref} from ${c.name}`,
    html: layout({
      title: kind === "received" ? "Files delivered" : "Files overdue",
      signoff: false,
      body:
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
      title: "Thanks for reaching out!",
      preheader: "We'll reply within one business day.",
      body:
        p(`Hi ${first(name)},`) +
        p("Thank you for contacting MacroSnaps. We've received your message and a member of our team will get back to you <b>within one business day</b>, usually much sooner.") +
        details([["Subject", subject || "General inquiry"]]) +
        `<div style="margin:0 0 22px;padding:14px 18px;border-left:3px solid #ccba56;background:#faf8f2;font:15px/1.6 Arial,sans-serif;color:#333">${esc(message).replace(/\n/g, "<br>")}</div>` +
        p("Ready to lock in your date? You can see prices and book online in a few minutes.") +
        button("See prices & book online", `${ORIGIN}/book`),
    }),
  };
}

/** Confirmation to a careers applicant. */
export function applicationReceived(name: string, role: string): Email {
  return {
    subject: "We received your application | MacroSnaps",
    html: layout({
      title: "Thanks for applying!",
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
};

/** Sent to a photographer/videographer when a shoot is assigned to them. */
export function crewAssignment(a: CrewAssignment): Email {
  const firstName = first(a.name);
  const plain = (s: string) => esc(s);
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
        bullets(a.scope.map(plain)) +
        head("Technical Shooting Guidelines") +
        bullets([
          "Shoot in <b>RAW format</b>.",
          "Never drop shutter speed below <b>1/60</b>.",
          "Keep ISO no higher than <b>2500 indoors</b> and <b>500 outdoors</b>.",
          "Keep the aperture as low as possible, ideally between <b>f/2 – f/3</b>, whenever appropriate.",
          "Do <b>not use direct flash</b> — only use flash with a <b>white reflector</b> or bounce it off the ceiling for softer lighting.",
        ]) +
        head("Deliverables") +
        bullets([
          "Shoot in <b>RAW format</b>.",
          "Only <b>unedited RAW files</b> are required.",
          "Send unedited RAW files via <b>Google Drive or Dropbox within 24 hours</b> after each shoot.",
          "Retain all RAW files for at least <b>30 days</b> in case they are needed.",
        ]) +
        head("As per the contract") +
        bullets([
          `Always introduce yourself as <b>${firstName} from MacroSnaps</b>.`,
          "Represent <b>MacroSnaps exclusively</b> — do not engage the client directly for future work or represent other companies.",
          "All photographs are the <b>intellectual property of MacroSnaps</b>. Delete all files after 30 days unless instructed otherwise.",
          "Do not share any photos directly with the client — all communication and delivery must go through <b>MacroSnaps</b>.",
          "Please provide your <b>CashApp, PayPal, or Venmo ID</b> for payment after the assignment.",
        ]) +
        p("<b>Important:</b><br>Please do not ask the client directly for tips. A feedback and tipping link will be sent after delivery. Any tip received will be forwarded to you in full without deductions.") +
        p(`<b>Performance Note:</b><br>Let us know if you have any questions. We look forward to your excellent coverage of this ${plain(a.type.replace(/\s*photography\s*$/i, "").toLowerCase() || "shoot")}. Our top-performing contractors typically receive <b>5–10 shoots per week</b>, so please always give your best. After each session, we send the client a <b>satisfaction survey</b>, and their feedback determines how many future assignments you receive.`),
    }),
  };
}
