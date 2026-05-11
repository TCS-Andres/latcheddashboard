export interface Vocabulary {
  customer: string;
  customerPlural: string;
  lead: string;
  leadPlural: string;
  conversion: string;
  conversionVerb: string;
  procedure: string;
}

export interface PrivacyConfig {
  regime: 'HIPAA' | 'GDPR' | 'FERPA' | 'PCI' | 'NONE';
  aggregationOnly: boolean;
  crmName: string;
  crmDeepLinkLabel: string;
  crmDeepLink: string;
}

export interface BrandConfig {
  primary: string;
  primaryHex: string;
  secondary: string;
  fontDisplay: string;
  fontBody: string;
  logoText: { latched: string; beginnings: string };
}

export interface Targets {
  consultationsBooked: number;
  consultationsAttended: number;
  procedures: number;
  revenue: number;
  providerReferrals: number;
  instagramFollowers: number;
  leadMagnetDownloads: number;
  googleReviewsCount: number;
  nps: number;
}

export interface FunnelStage {
  key: string;
  label: string;
}

export interface AcquisitionSource {
  key: string;
  label: string;
}

export interface ClientConfig {
  slug: string;
  name: string;
  ownerName: string;
  tagline: string;
  location: string;
  phone: string;
  website: string;
  timezone: string;
  vocabulary: Vocabulary;
  privacy: PrivacyConfig;
  brand: BrandConfig;
  channels: {
    social: ('instagram' | 'facebook' | 'tiktok' | 'youtube' | 'linkedin')[];
    paidAds: ('meta' | 'google' | 'tiktok')[];
  };
  targets: Targets;
  funnel: FunnelStage[];
  acquisitionSources: AcquisitionSource[];
}
