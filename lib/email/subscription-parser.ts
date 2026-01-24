/**
 * Email Subscription Parser
 * Extracts subscription information from email content
 */

export interface ParsedSubscription {
  application_name: string;
  cost_aed?: number;
  billing_cycle?: 'monthly' | 'quarterly' | 'yearly' | 'one-time';
  date_subscribed?: string;
  confidence: number; // 0-100
  email_subject?: string;
  email_from?: string;
}

// Common subscription-related keywords
const SUBSCRIPTION_KEYWORDS = [
  'subscription',
  'subscribe',
  'renewal',
  'payment',
  'invoice',
  'receipt',
  'billing',
  'charged',
  'premium',
  'plan',
  'membership',
];

// Common services and their patterns
const KNOWN_SERVICES = [
  { name: 'Netflix', patterns: ['netflix', 'netflix.com'] },
  { name: 'Spotify', patterns: ['spotify', 'spotify.com'] },
  { name: 'Apple Music', patterns: ['apple music', 'music.apple.com'] },
  { name: 'YouTube Premium', patterns: ['youtube premium', 'youtube.com'] },
  { name: 'Amazon Prime', patterns: ['amazon prime', 'prime video'] },
  { name: 'Disney+', patterns: ['disney+', 'disneyplus'] },
  { name: 'HBO Max', patterns: ['hbo max', 'hbomax'] },
  { name: 'Adobe', patterns: ['adobe', 'creative cloud'] },
  { name: 'Microsoft 365', patterns: ['microsoft 365', 'office 365'] },
  { name: 'iCloud', patterns: ['icloud', 'icloud storage'] },
  { name: 'Dropbox', patterns: ['dropbox'] },
  { name: 'Google One', patterns: ['google one', 'google storage'] },
  { name: 'GitHub', patterns: ['github', 'github.com'] },
  { name: 'Zoom', patterns: ['zoom', 'zoom.us'] },
];

// Currency patterns (AED, USD, EUR, etc.)
const CURRENCY_PATTERNS = {
  aed: /AED\s*(\d+(?:\.\d{2})?)/gi,
  usd: /\$(\d+(?:\.\d{2})?)/g,
  eur: /€(\d+(?:\.\d{2})?)/g,
  gbp: /£(\d+(?:\.\d{2})?)/g,
};

// Billing cycle patterns
const BILLING_CYCLE_PATTERNS = {
  monthly: /month(?:ly)?/i,
  quarterly: /quarter(?:ly)?|3\s*month/i,
  yearly: /year(?:ly)?|annual(?:ly)?|12\s*month/i,
  'one-time': /one[- ]time|single\s*payment/i,
};

/**
 * Extract application name from email
 */
function extractApplicationName(subject: string, from: string, body: string): string | null {
  const searchText = `${subject} ${from} ${body}`.toLowerCase();

  // Check known services first
  for (const service of KNOWN_SERVICES) {
    for (const pattern of service.patterns) {
      if (searchText.includes(pattern.toLowerCase())) {
        return service.name;
      }
    }
  }

  // Try to extract from email sender
  const fromMatch = from.match(/from\s+([^<\s]+)/i) || from.match(/^([^<@]+)/);
  if (fromMatch) {
    const sender = fromMatch[1].trim();
    // Capitalize first letter of each word
    return sender
      .split(/[\s-_.]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  return null;
}

/**
 * Extract cost in AED
 */
function extractCost(text: string): number | null {
  // Try AED first
  const aedMatch = text.match(CURRENCY_PATTERNS.aed);
  if (aedMatch && aedMatch[0]) {
    const amount = parseFloat(aedMatch[0].replace(/AED\s*/i, ''));
    if (!isNaN(amount)) return amount;
  }

  // Try other currencies and convert (simplified - you'd want a real currency API)
  const usdMatch = text.match(CURRENCY_PATTERNS.usd);
  if (usdMatch && usdMatch[0]) {
    const amount = parseFloat(usdMatch[0].replace('$', ''));
    if (!isNaN(amount)) return amount * 3.67; // Approximate USD to AED conversion
  }

  return null;
}

/**
 * Extract billing cycle
 */
function extractBillingCycle(text: string): 'monthly' | 'quarterly' | 'yearly' | 'one-time' | null {
  for (const [cycle, pattern] of Object.entries(BILLING_CYCLE_PATTERNS)) {
    if (pattern.test(text)) {
      return cycle as 'monthly' | 'quarterly' | 'yearly' | 'one-time';
    }
  }
  return null;
}

/**
 * Extract date from email
 */
function extractDate(dateString?: string): string | null {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    }
  } catch (e) {
    // Invalid date
  }

  return null;
}

/**
 * Calculate confidence score
 */
function calculateConfidence(
  hasAppName: boolean,
  hasCost: boolean,
  hasBillingCycle: boolean,
  hasKeywords: boolean
): number {
  let score = 0;

  if (hasAppName) score += 40;
  if (hasCost) score += 30;
  if (hasBillingCycle) score += 20;
  if (hasKeywords) score += 10;

  return Math.min(score, 100);
}

/**
 * Check if email contains subscription keywords
 */
function hasSubscriptionKeywords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return SUBSCRIPTION_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

/**
 * Parse email and extract subscription information
 */
export function parseEmailForSubscription(
  subject: string,
  from: string,
  body: string,
  date?: string
): ParsedSubscription | null {
  const fullText = `${subject} ${body}`;

  // Check if this looks like a subscription email
  if (!hasSubscriptionKeywords(fullText)) {
    return null;
  }

  const application_name = extractApplicationName(subject, from, body);
  const cost_aed = extractCost(fullText);
  const billing_cycle = extractBillingCycle(fullText);
  const date_subscribed = extractDate(date);

  const confidence = calculateConfidence(
    !!application_name,
    !!cost_aed,
    !!billing_cycle,
    hasSubscriptionKeywords(fullText)
  );

  // Only return if we have at least the application name
  if (!application_name) {
    return null;
  }

  return {
    application_name,
    cost_aed: cost_aed || undefined,
    billing_cycle: billing_cycle || undefined,
    date_subscribed: date_subscribed || undefined,
    confidence,
    email_subject: subject,
    email_from: from,
  };
}

/**
 * Batch parse multiple emails
 */
export function parseMultipleEmails(
  emails: Array<{ subject: string; from: string; body: string; date?: string }>
): ParsedSubscription[] {
  return emails
    .map(email => parseEmailForSubscription(email.subject, email.from, email.body, email.date))
    .filter((result): result is ParsedSubscription => result !== null)
    .sort((a, b) => b.confidence - a.confidence); // Sort by confidence
}
