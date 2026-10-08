export type UserRole = 'ADMIN' | 'ORGANIZER' | 'ATTENDEE' | 'SPEAKER' | 'SPONSOR';

export type EventType = 'ONLINE' | 'OFFLINE' | 'HYBRID';
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED';
export type RegistrationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'WAITLISTED' | 'CHECKED_IN';
export type SponsorTier = 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  jobTitle?: string;
  company?: string;
  industry?: string;
  phone?: string;
  skills?: string[];
  interests?: string[];
  points?: number;
  isEmailVerified?: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  websiteUrl: string;
  contactEmail: string;
}

export interface TicketType {
  id: string;
  eventId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  quantityAvailable: number;
  quantitySold: number;
  perks: string[];
}

export interface Speaker {
  id: string;
  eventId: string;
  name: string;
  jobTitle: string;
  company: string;
  bio: string;
  avatarUrl: string;
  featured?: boolean;
}

export interface Sponsor {
  id: string;
  eventId: string;
  name: string;
  tier: SponsorTier;
  logoUrl: string;
  websiteUrl?: string;
  boothLocation?: string;
  description?: string;
}

export interface Session {
  id: string;
  eventId: string;
  title: string;
  description: string;
  sessionType: 'KEYNOTE' | 'WORKSHOP' | 'PANEL' | 'BREAKOUT';
  track: string;
  room: string;
  startTime: string;
  endTime: string;
  capacity: number;
  speakerIds?: string[];
  speakers?: Speaker[];
}

export interface EventItem {
  id: string;
  organizationId: string;
  organizationName?: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;
  tags: string[];
  eventType: EventType;
  status: EventStatus;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  timezone: string;
  venueName?: string;
  venueAddress?: string;
  city?: string;
  country?: string;
  onlineMeetingUrl?: string;
  capacity: number;
  bannerImageUrl: string;
  logoImageUrl: string;
  ticketTypes?: TicketType[];
  speakers?: Speaker[];
  sponsors?: Sponsor[];
  sessions?: Session[];
  faqs?: { question: string; answer: string }[];
  policies?: string;
}

export type RefundMethod = 'ORIGINAL_PAYMENT' | 'BANK_TRANSFER' | 'WALLET_CREDIT' | 'UPI_PAYPAL';

export interface CancellationRefund {
  id: string;
  registrationId: string;
  eventId: string;
  eventTitle: string;
  ticketTypeName: string;
  amount: number;
  currency: string;
  refundMethod: RefundMethod;
  accountDetails?: string;
  reason: string;
  cancelledAt: string;
  status: 'COMPLETED' | 'PROCESSING';
  transactionRef: string;
}

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  user?: User;
  event?: EventItem;
  ticketTypeId: string;
  ticketType?: TicketType;
  qrCodeToken: string;
  otpCode?: string;
  otpExpiresAt?: string;
  status: RegistrationStatus;
  registeredAt: string;
  checkedInAt?: string;
  cancelledAt?: string;
  refund?: CancellationRefund;
}

export interface PollOption {
  id: string;
  pollId: string;
  optionText: string;
  voteCount: number;
}

export interface Poll {
  id: string;
  eventId: string;
  sessionId?: string;
  question: string;
  isActive: boolean;
  options: PollOption[];
  userVotedOptionId?: string;
}

export interface Question {
  id: string;
  eventId: string;
  sessionId?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  questionText: string;
  upvotes: number;
  isAnswered: boolean;
  isHighlighted: boolean;
  isAnonymous: boolean;
  createdAt: string;
  hasUpvoted?: boolean;
}

export interface NetworkingConnection {
  id: string;
  user: User;
  matchScore: number;
  status: 'NONE' | 'PENDING' | 'ACCEPTED' | 'DECLINED';
  commonInterests: string[];
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: string[];
  suggestedActions?: { label: string; action: string }[];
}

export interface PlatformStats {
  totalUsers: number;
  totalOrganizations: number;
  totalEvents: number;
  totalRegistrations: number;
  totalRevenue: number;
  activeEventsCount: number;
  platformEngagementRate: number;
}
