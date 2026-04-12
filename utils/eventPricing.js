/**
 * Merge paid per-event prices from chat history (BiddingOffer rows with payment done).
 * @param {Array} messages - chat.messages (any order)
 * @returns {Record<string, { eventName: string, amount: number, paid: boolean, orderId?: string }>}
 */
export function collectPaidEventPricingByName(messages) {
  const map = {};
  if (!Array.isArray(messages)) return map;
  const sorted = [...messages].sort(
    (a, b) =>
      new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
  );
  for (const m of sorted) {
    if (m.contentType !== "BiddingOffer") continue;
    const paidDone = Boolean(m.other?.orderPaymentDone || m.other?.paymentDone);
    if (!paidDone) continue;
    const oid = m.other?.order;
    const ep = m.other?.eventPricing;
    if (Array.isArray(ep) && ep.length && paidDone) {
      ep.forEach((row) => {
        const n = String(row.eventName || "").trim();
        if (!n) return;
        if (!map[n]) {
          map[n] = {
            eventName: n,
            amount: Number(row.amount) || 0,
            paid: true,
            orderId:
              row.orderId != null
                ? String(row.orderId)
                : oid != null
                  ? String(oid)
                  : undefined,
          };
        }
      });
    } else if (m.other?.events?.length === 1) {
      const n = String(m.other.events[0].eventName || "").trim();
      if (n) {
        const amt = parseInt(String(m.content ?? ""), 10);
        if (!map[n] && Number.isFinite(amt) && amt > 0) {
          map[n] = {
            eventName: n,
            amount: amt,
            paid: true,
            orderId: oid != null ? String(oid) : undefined,
          };
        }
      }
    }
  }
  return map;
}

/** Sum all line items (for “Your offer” / totals). */
export function sumEventPricingAmounts(eventPricing, fallbackContent) {
  if (Array.isArray(eventPricing) && eventPricing.length) {
    return eventPricing.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  }
  const n = parseInt(String(fallbackContent ?? ""), 10);
  return Number.isFinite(n) ? n : 0;
}

/** Amount the customer still pays (unpaid lines only). */
export function unpaidTotalFromEventPricing(eventPricing, fallbackContent) {
  if (!Array.isArray(eventPricing) || !eventPricing.length) {
    const n = parseInt(String(fallbackContent ?? ""), 10);
    return Number.isFinite(n) ? n : 0;
  }
  const unpaid = eventPricing
    .filter((e) => !e.paid)
    .reduce((s, e) => s + (Number(e.amount) || 0), 0);
  if (unpaid > 0) return unpaid;
  return eventPricing.reduce((s, e) => s + (Number(e.amount) || 0), 0);
}
