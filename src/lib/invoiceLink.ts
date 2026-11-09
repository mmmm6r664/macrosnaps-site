import { signRef, verifyRef } from "./automations";
import { SITE } from "./site";

/** Public, signed MacroSnaps link to a Stripe invoice (the client sees our page; Stripe only handles payment). */
export const invoiceLink = (id: string) => `${SITE.url}/invoice/${id}?k=${signRef(id, "invoice")}`;
export const verifyInvoiceKey = (id: string, k: string) => /^in_[A-Za-z0-9]+$/.test(id) && verifyRef(id, "invoice", k);
