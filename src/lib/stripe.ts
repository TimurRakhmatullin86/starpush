import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return _stripe;
}

export const PLANS = {
  free: { name: "Free", price: 0, smsLimit: 10, locations: 1, priceId: null },
  starter: {
    name: "Starter",
    price: 19,
    smsLimit: 100,
    locations: 1,
    priceId: process.env.STRIPE_STARTER_PRICE_ID || null,
  },
  growth: {
    name: "Growth",
    price: 39,
    smsLimit: 500,
    locations: 3,
    priceId: process.env.STRIPE_GROWTH_PRICE_ID || null,
  },
  pro: {
    name: "Pro",
    price: 69,
    smsLimit: Infinity,
    locations: Infinity,
    priceId: process.env.STRIPE_PRO_PRICE_ID || null,
  },
} as const;

export type PlanKey = keyof typeof PLANS;
