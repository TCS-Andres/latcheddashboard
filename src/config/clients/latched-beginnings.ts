import type { ClientConfig } from './types';

// All client-specific identity, vocabulary, and defaults live here.
// Wiring real APIs later means editing src/lib/data/ — pages don't change.
export const latchedBeginnings: ClientConfig = {
  slug: 'latched-beginnings',
  name: 'Latched Beginnings',
  ownerName: 'Dr. Kacie Culotta, DDS',
  tagline: 'Healthy Beginnings That Last a Lifetime',
  location: 'Austin, Texas',
  phone: '(512) 814-7480',
  website: 'https://latchedbeginnings.com',
  timezone: 'America/Chicago',

  // Vocabulary — drives every UI label.
  // The practice serves infants, but the buying/decision-making "customer"
  // is the parent (typically the mother). We use "Family" as the unit of care.
  vocabulary: {
    customer: 'Family',         // unit of care
    customerPlural: 'Families',
    lead: 'Inquiry',            // contact-form, ManyChat trigger, quiz finish
    leadPlural: 'Inquiries',
    conversion: 'Consultation', // primary conversion event
    conversionVerb: 'Booked',
    procedure: 'Release',       // secondary conversion: tongue-tie release performed
  },

  // Privacy regime
  // Per UNIVERSAL_DASHBOARD_PROMPT.md — healthcare practice, HIPAA-adjacent.
  // Dashboard is AGGREGATION-ONLY. No PHI. Record-level workflows deep-link
  // to ClientSecure (their practice-management system).
  privacy: {
    regime: 'HIPAA',
    aggregationOnly: true,
    crmName: 'ClientSecure',
    crmDeepLinkLabel: 'View in ClientSecure',
    crmDeepLink: 'https://app.clientsecure.com', // placeholder — replace with real org URL
  },

  // Brand
  brand: {
    primary: 'hsl(5, 73%, 73%)',      // coral / latched pink
    primaryHex: '#F2A39E',
    secondary: '#1A1414',
    fontDisplay: '"DM Serif Display", Georgia, serif',
    fontBody: 'Inter, system-ui, sans-serif',
    logoText: { latched: 'Latched', beginnings: 'Beginnings' },
  },

  // Channels actively used (drives Social + Paid Ads tabs)
  channels: {
    social: ['instagram', 'facebook'],
    paidAds: ['meta'],
  },

  // Default monthly targets (overridable in Data tab)
  // Numbers reflect a specialty practice with ~10-25 procedures/month
  // and meaningful average case value. Adjust in Data tab when real numbers arrive.
  targets: {
    consultationsBooked: 35,
    consultationsAttended: 28,
    procedures: 18,
    revenue: 45000,
    providerReferrals: 12,
    instagramFollowers: 8500,
    leadMagnetDownloads: 80,
    googleReviewsCount: 4,        // new reviews per month
    nps: 70,
  },

  // Acquisition funnel stages (Awareness → Family)
  funnel: [
    { key: 'reach', label: 'Reach (IG + Web)' },
    { key: 'engagement', label: 'Engaged Sessions' },
    { key: 'inquiry', label: 'Inquiries' },
    { key: 'booked', label: 'Consultations Booked' },
    { key: 'attended', label: 'Consultations Attended' },
    { key: 'procedure', label: 'Releases Performed' },
  ],

  // Source mix labels for acquisition pie chart
  acquisitionSources: [
    { key: 'referral_provider', label: 'Provider Referral' },
    { key: 'referral_word_of_mouth', label: 'Word of Mouth' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'google', label: 'Google Search' },
    { key: 'facebook', label: 'Facebook' },
    { key: 'quiz', label: 'Oral-Tie Quiz' },
    { key: 'other', label: 'Other' },
  ],
};
