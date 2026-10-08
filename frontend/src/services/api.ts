import axios from 'axios';
import { 
  User, EventItem, Registration, Poll, Question, 
  NetworkingConnection, PlatformStats, AIMessage,
  CancellationRefund, RefundMethod
} from '../types';
import { 
  INITIAL_USERS, INITIAL_EVENTS, INITIAL_POLLS, 
  INITIAL_QUESTIONS, INITIAL_NETWORKING, INITIAL_PLATFORM_STATS,
  INITIAL_REGISTRATIONS 
} from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8000/api/auth';
const AI_BASE_URL = import.meta.env.VITE_AI_URL || 'http://localhost:8000/api/ai';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('es_auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper for local state persistence
const getStorageItem = <T>(key: string, defaultVal: T): T => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  }
  try {
    return JSON.parse(data) as T;
  } catch {
    return defaultVal;
  }
};

const setStorageItem = <T>(key: string, val: T): void => {
  localStorage.setItem(key, JSON.stringify(val));
};

// ==========================================
// 1. AUTH API (FASTAPI BACKEND + REDIS 60s OTP)
// ==========================================
export const authApi = {
  getCurrentUser: async (): Promise<User> => {
    const user = getStorageItem<User>('es_current_user', INITIAL_USERS[2]);
    return user;
  },

  // Backend FastAPI + Redis 60s TTL Send OTP
  sendBackendOtp: async (
    target: string, 
    type: 'email' | 'phone' = 'email', 
    purpose = 'LOGIN',
    extra?: { email?: string; phone?: string }
  ): Promise<{ success: boolean; message: string; expiresIn: number; otp?: string; otpCode?: string; error?: string }> => {
    try {
      const response = await axios.post(`${AUTH_API_URL}/send-otp`, {
        target: target.trim(),
        type,
        purpose,
        email: extra?.email?.trim(),
        phone: extra?.phone?.trim()
      }, { timeout: 4000 });
      
      const data = response.data;
      const otpCode = data.otp || data.otpCode;
      if (otpCode) {
        localStorage.setItem(`es_active_otp_${target.trim().toLowerCase()}`, JSON.stringify({
          otp: otpCode,
          expiresAt: Date.now() + (data.expiresIn || 60) * 1000
        }));
      }
      return {
        ...data,
        otp: otpCode,
        otpCode: otpCode
      };
    } catch (err: any) {
      const errorDetail = err?.response?.data?.detail || err?.response?.data?.message;
      if (errorDetail && err?.response?.status === 429) {
        return { success: false, message: errorDetail, expiresIn: 60, error: 'RATE_LIMITED' };
      }
      // Resilient local simulation fallback with on-screen OTP code
      const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem(`es_active_otp_${target.trim().toLowerCase()}`, JSON.stringify({
        otp: fallbackOtp,
        expiresAt: Date.now() + 60000
      }));
      if (extra?.email) {
        localStorage.setItem(`es_active_otp_${extra.email.trim().toLowerCase()}`, JSON.stringify({
          otp: fallbackOtp,
          expiresAt: Date.now() + 60000
        }));
      }
      if (extra?.phone) {
        localStorage.setItem(`es_active_otp_${extra.phone.trim().toLowerCase()}`, JSON.stringify({
          otp: fallbackOtp,
          expiresAt: Date.now() + 60000
        }));
      }
      return { 
        success: true, 
        message: `6-digit verification code sent to ${target}. Valid for 60 seconds.`, 
        expiresIn: 60,
        otp: fallbackOtp,
        otpCode: fallbackOtp
      };
    }
  },

  // Backend FastAPI + Redis Verification & Single-Use Enforcement
  verifyBackendOtp: async (target: string, otp: string): Promise<{ success: boolean; message: string; verifiedTarget?: string; token?: string; error?: string; attemptsRemaining?: number }> => {
    try {
      const response = await axios.post(`${AUTH_API_URL}/verify-otp`, {
        target: target.trim(),
        otp: otp.trim()
      }, { timeout: 4000 });
      return response.data;
    } catch (err: any) {
      const errorData = err?.response?.data;
      if (errorData) {
        return {
          success: false,
          message: errorData.detail || errorData.message || 'OTP verification failed.',
          error: errorData.error || 'INVALID_OTP',
          attemptsRemaining: errorData.attemptsRemaining
        };
      }
      
      // Fallback local check
      const cached = localStorage.getItem(`es_active_otp_${target.trim().toLowerCase()}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Date.now() > parsed.expiresAt) {
            localStorage.removeItem(`es_active_otp_${target.trim().toLowerCase()}`);
            return {
              success: false,
              message: 'This OTP has expired (60-second validity window). Please click Resend OTP.',
              error: 'EXPIRED_OTP'
            };
          }
          if (parsed.otp === otp.trim()) {
            localStorage.removeItem(`es_active_otp_${target.trim().toLowerCase()}`);
            return {
              success: true,
              message: 'OTP verified successfully! Access granted.',
              verifiedTarget: target.trim(),
              token: `jwt_session_${Date.now()}`
            };
          }
        } catch {}
      }

      return {
        success: false,
        message: 'Invalid OTP code. Please enter the 6 digits displayed on your screen.',
        error: 'INVALID_OTP'
      };
    }
  },

  resendBackendOtp: async (target: string, type: 'email' | 'phone' = 'email'): Promise<{ success: boolean; message: string; expiresIn: number; otp?: string; otpCode?: string; error?: string }> => {
    return authApi.sendBackendOtp(target, type, 'RESEND');
  },

  login: async (email: string, _pass: string, phone?: string): Promise<{ user: User; token: string }> => {
    const users = getStorageItem<User[]>('es_users', INITIAL_USERS);
    let matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!matched) {
      const namePart = email.split('@')[0].replace(/[._-]/g, ' ');
      const names = namePart.split(' ');
      const firstName = names[0] ? names[0].charAt(0).toUpperCase() + names[0].slice(1) : 'Attendee';
      const lastName = names[1] ? names[1].charAt(0).toUpperCase() + names[1].slice(1) : 'Member';
      
      matched = {
        id: 'usr_' + Date.now(),
        email: email.toLowerCase(),
        firstName,
        lastName,
        role: email.toLowerCase().includes('organizer') ? 'ORGANIZER' : (email.toLowerCase().includes('admin') ? 'ADMIN' : 'ATTENDEE'),
        avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`,
        jobTitle: 'Innovation Specialist',
        company: 'Global Tech Network',
        industry: 'Technology & AI',
        phone: phone || '+1 (555) 389-4921',
        skills: ['AI Strategy', 'Product Engineering', 'Cloud Native'],
        interests: ['Autonomous Agents', 'RAG Architecture', 'Developer Experience'],
        points: 450,
        isEmailVerified: true
      };
      users.push(matched);
      setStorageItem('es_users', users);
    } else if (phone) {
      matched.phone = phone;
      const idx = users.findIndex(u => u.id === matched?.id);
      if (idx !== -1) {
        users[idx] = matched;
        setStorageItem('es_users', users);
      }
    }

    localStorage.setItem('es_auth_token', 'jwt_session_' + matched.id);
    setStorageItem('es_current_user', matched);
    return { user: matched, token: 'jwt_session_' + matched.id };
  },

  switchRoleUser: (role: string): User => {
    const users = getStorageItem<User[]>('es_users', INITIAL_USERS);
    const target = users.find(u => u.role === role) || users[2];
    localStorage.setItem('es_auth_token', 'jwt_mock_token_' + target.id);
    setStorageItem('es_current_user', target);
    return target;
  },

  register: async (userData: Partial<User>): Promise<User> => {
    const users = getStorageItem<User[]>('es_users', INITIAL_USERS);
    const firstName = userData.firstName || 'New';
    const lastName = userData.lastName || 'Attendee';
    const email = (userData.email || 'user@eventsphere.io').toLowerCase();

    const newUser: User = {
      id: 'usr_' + Date.now(),
      email,
      firstName,
      lastName,
      role: userData.role || 'ATTENDEE',
      avatarUrl: userData.avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80`,
      jobTitle: userData.jobTitle || 'Tech Delegate',
      company: userData.company || 'Sphere Network',
      industry: userData.industry || 'Technology & AI',
      skills: userData.skills || ['AI Strategy', 'Deep Learning', 'Cloud'],
      interests: userData.interests || ['Agents', 'pgvector', 'Microservices'],
      points: 300,
      isEmailVerified: true
    };

    users.push(newUser);
    setStorageItem('es_users', users);
    setStorageItem('es_current_user', newUser);
    localStorage.setItem('es_auth_token', 'jwt_mock_token_' + newUser.id);

    // Auto-create a welcome event pass with OTP for the new attendee
    const events = getStorageItem<EventItem[]>('es_events', INITIAL_EVENTS);
    const mainEvent = events[0] || INITIAL_EVENTS[0];
    const registrations = getStorageItem<Registration[]>('es_registrations', []);
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    registrations.unshift({
      id: 'reg_' + Date.now(),
      eventId: mainEvent.id,
      userId: newUser.id,
      user: newUser,
      event: mainEvent,
      ticketTypeId: mainEvent.ticketTypes?.[1]?.id || 't2',
      ticketType: mainEvent.ticketTypes?.[1] || mainEvent.ticketTypes?.[0],
      qrCodeToken: `ES-${mainEvent.slug.toUpperCase().slice(0, 8)}-${firstName.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      otpCode: newOtp,
      otpExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'CONFIRMED',
      registeredAt: new Date().toISOString()
    });
    setStorageItem('es_registrations', registrations);

    return newUser;
  },

  updateProfile: async (userId: string, data: Partial<User>): Promise<User> => {
    const users = getStorageItem<User[]>('es_users', INITIAL_USERS);
    const idx = users.findIndex(u => u.id === userId);
    let updatedUser: User;
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...data };
      updatedUser = users[idx];
    } else {
      const currentUser = getStorageItem<User>('es_current_user', INITIAL_USERS[2]);
      updatedUser = { ...currentUser, ...data };
      users.push(updatedUser);
    }
    setStorageItem('es_users', users);
    setStorageItem('es_current_user', updatedUser);
    return updatedUser;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('es_auth_token');
  }
};

// ==========================================
// 2. EVENTS API
// ==========================================
export const eventsApi = {
  getAll: async (filter?: { category?: string; type?: string; search?: string }): Promise<EventItem[]> => {
    let events = getStorageItem<EventItem[]>('es_events', INITIAL_EVENTS);
    
    // Automatically merge any INITIAL_EVENTS that are missing in cached localStorage
    const existingIds = new Set(events.map(e => e.id));
    let updated = false;
    for (const initEvent of INITIAL_EVENTS) {
      if (!existingIds.has(initEvent.id)) {
        events.push(initEvent);
        updated = true;
      } else {
        // Also update initial event categories if they were modified
        const idx = events.findIndex(e => e.id === initEvent.id);
        if (idx !== -1 && events[idx].category !== initEvent.category) {
          events[idx] = { ...events[idx], ...initEvent };
          updated = true;
        }
      }
    }
    if (updated) {
      setStorageItem('es_events', events);
    }

    if (filter?.category && filter.category !== 'All' && filter.category !== 'All Categories') {
      const normalizedFilter = filter.category.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, ' ').trim();
      events = events.filter(e => {
        const normalizedCat = e.category.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, ' ').trim();
        return normalizedCat === normalizedFilter || normalizedCat.includes(normalizedFilter) || normalizedFilter.includes(normalizedCat);
      });
    }
    if (filter?.type && filter.type !== 'ALL') {
      events = events.filter(e => e.eventType === filter.type);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      events = events.filter(e => 
        e.title.toLowerCase().includes(q) || 
        e.description.toLowerCase().includes(q) || 
        e.category.toLowerCase().includes(q) ||
        e.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return events;
  },

  getBySlug: async (slug: string): Promise<EventItem | undefined> => {
    let events = getStorageItem<EventItem[]>('es_events', INITIAL_EVENTS);
    const found = events.find(e => e.slug === slug || e.id === slug);
    if (found) return found;
    return INITIAL_EVENTS.find(e => e.slug === slug || e.id === slug);
  },

  create: async (eventData: Partial<EventItem>): Promise<EventItem> => {
    const events = getStorageItem<EventItem[]>('es_events', INITIAL_EVENTS);
    const newEvent: EventItem = {
      id: 'evt_' + Date.now(),
      organizationId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      organizationName: 'Apex Innovation Group',
      title: eventData.title || 'Untitled Innovation Summit',
      slug: (eventData.title || 'untitled-summit').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: eventData.description || 'Comprehensive technical event.',
      shortDescription: eventData.shortDescription || 'Cutting edge summit.',
      category: eventData.category || 'Technology',
      tags: eventData.tags || ['Technology', 'Cloud'],
      eventType: eventData.eventType || 'HYBRID',
      status: eventData.status || 'PUBLISHED',
      startDate: eventData.startDate || '2026-11-20',
      endDate: eventData.endDate || '2026-11-21',
      startTime: eventData.startTime || '09:00 AM',
      endTime: eventData.endTime || '05:00 PM',
      timezone: 'UTC',
      venueName: eventData.venueName || 'Main Convention Hall',
      venueAddress: eventData.venueAddress || '100 Innovation Way',
      city: eventData.city || 'San Francisco',
      country: eventData.country || 'USA',
      capacity: eventData.capacity || 1000,
      bannerImageUrl: eventData.bannerImageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1400&auto=format&fit=crop&q=80',
      logoImageUrl: eventData.logoImageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      ticketTypes: eventData.ticketTypes || [
        {
          id: 't-new-1',
          eventId: 'evt_' + Date.now(),
          name: 'General Admission',
          description: 'Full pass to all conference tracks.',
          price: 199,
          currency: 'USD',
          quantityAvailable: 500,
          quantitySold: 0,
          perks: ['Full Access', 'Keynotes', 'Badge']
        }
      ],
      speakers: eventData.speakers || [],
      sessions: eventData.sessions || [],
      sponsors: eventData.sponsors || [],
      faqs: eventData.faqs || [
        { question: 'What is the refund policy?', answer: 'Refunds available up to 7 days prior.' }
      ]
    };
    events.unshift(newEvent);
    setStorageItem('es_events', events);
    return newEvent;
  }
};

// ==========================================
// 3. REGISTRATIONS & TICKETS API
// ==========================================
export interface SentEmailNotification {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  otpCode: string;
  eventTitle: string;
  ticketTier: string;
  qrCodeToken?: string;
  passUrl?: string;
  type?: 'REGISTRATION_OTP' | 'BOOKING_CONFIRMATION';
  sentAt: string;
}

import emailjs from '@emailjs/browser';

const INITIAL_SENT_EMAILS: SentEmailNotification[] = [
  {
    id: 'email_welcome_1',
    recipientEmail: 'elena.rostova@nexus.io',
    recipientName: 'Elena Rostova',
    subject: '🔐 Verify Your Email: Entry & Payment OTP for Global AI & Cloud Summit 2026',
    otpCode: '849204',
    eventTitle: 'Global AI & Cloud Summit 2026',
    ticketTier: 'VIP Executive Pass',
    type: 'REGISTRATION_OTP',
    sentAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  }
];

export interface EmailJsConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

export const notificationApi = {
  getEmailJsConfig: (): EmailJsConfig => {
    return getStorageItem<EmailJsConfig>('es_emailjs_config', {
      serviceId: '',
      templateId: '',
      publicKey: ''
    });
  },

  saveEmailJsConfig: (config: EmailJsConfig) => {
    setStorageItem('es_emailjs_config', config);
  },

  sendVerificationOtpEmail: async (payload: {
    recipientEmail: string;
    recipientName: string;
    otpCode: string;
    eventTitle: string;
    ticketTier: string;
    contactPhone?: string;
  }): Promise<SentEmailNotification> => {
    // Deliver SMS message to user's contact messages if phone provided
    if (payload.contactPhone) {
      await notificationApi.sendContactSmsMessage({
        contactPhone: payload.contactPhone,
        otpCode: payload.otpCode,
        purpose: `Event Registration: ${payload.eventTitle}`
      });
    }

    const sentEmails = getStorageItem<SentEmailNotification[]>('es_sent_emails', INITIAL_SENT_EMAILS);
    const emailRecord: SentEmailNotification = {
      id: 'email_otp_' + Date.now(),
      recipientEmail: payload.recipientEmail,
      recipientName: payload.recipientName,
      subject: `🔐 Verify Your Identity: Entry & Payment OTP for ${payload.eventTitle}`,
      otpCode: payload.otpCode,
      eventTitle: payload.eventTitle,
      ticketTier: payload.ticketTier,
      type: 'REGISTRATION_OTP',
      sentAt: new Date().toISOString()
    };
    sentEmails.unshift(emailRecord);
    setStorageItem('es_sent_emails', sentEmails);

    // Try EmailJS live dispatch if configured
    const config = notificationApi.getEmailJsConfig();
    if (config.serviceId && config.templateId && config.publicKey) {
      try {
        await emailjs.send(
          config.serviceId,
          config.templateId,
          {
            to_email: payload.recipientEmail,
            to_name: payload.recipientName,
            otp_code: payload.otpCode,
            event_title: payload.eventTitle,
            ticket_tier: payload.ticketTier
          },
          config.publicKey
        );
      } catch (e) {
        console.warn('[EmailJS live dispatch notice]', e);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('es_new_email_received', { detail: emailRecord }));
    }

    return emailRecord;
  },

  sendBookingOtpEmail: async (payload: {
    recipientEmail: string;
    recipientName: string;
    otpCode: string;
    eventTitle: string;
    ticketTier: string;
    qrCodeToken: string;
  }): Promise<SentEmailNotification> => {
    const sentEmails = getStorageItem<SentEmailNotification[]>('es_sent_emails', INITIAL_SENT_EMAILS);
    const emailRecord: SentEmailNotification = {
      id: 'email_' + Date.now(),
      recipientEmail: payload.recipientEmail,
      recipientName: payload.recipientName,
      subject: `🎫 Your Entry OTP & Pass Confirmation: ${payload.eventTitle}`,
      otpCode: payload.otpCode,
      eventTitle: payload.eventTitle,
      ticketTier: payload.ticketTier,
      qrCodeToken: payload.qrCodeToken,
      passUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/pass/${payload.qrCodeToken}`,
      type: 'BOOKING_CONFIRMATION',
      sentAt: new Date().toISOString()
    };
    sentEmails.unshift(emailRecord);
    setStorageItem('es_sent_emails', sentEmails);

    // Try EmailJS live dispatch if configured
    const config = notificationApi.getEmailJsConfig();
    if (config.serviceId && config.templateId && config.publicKey) {
      try {
        await emailjs.send(
          config.serviceId,
          config.templateId,
          {
            to_email: payload.recipientEmail,
            to_name: payload.recipientName,
            otp_code: payload.otpCode,
            event_title: payload.eventTitle,
            ticket_tier: payload.ticketTier,
            pass_url: emailRecord.passUrl
          },
          config.publicKey
        );
      } catch (e) {
        console.warn('[EmailJS live dispatch notice]', e);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('es_new_email_received', { detail: emailRecord }));
    }

    return emailRecord;
  },

  sendCancellationRefundEmail: async (payload: {
    recipientEmail: string;
    recipientName: string;
    eventTitle: string;
    ticketTier: string;
    refundAmount: number;
    currency: string;
    refundMethod: string;
    transactionRef: string;
  }): Promise<SentEmailNotification> => {
    const sentEmails = getStorageItem<SentEmailNotification[]>('es_sent_emails', INITIAL_SENT_EMAILS);
    const emailRecord: SentEmailNotification = {
      id: 'email_cancel_' + Date.now(),
      recipientEmail: payload.recipientEmail,
      recipientName: payload.recipientName,
      subject: `💸 Cancellation & Refund Confirmed: ${payload.currency} $${payload.refundAmount} for ${payload.eventTitle}`,
      otpCode: payload.transactionRef,
      eventTitle: payload.eventTitle,
      ticketTier: `${payload.ticketTier} • Refunded to ${payload.refundMethod}`,
      type: 'BOOKING_CONFIRMATION',
      sentAt: new Date().toISOString()
    };
    sentEmails.unshift(emailRecord);
    setStorageItem('es_sent_emails', sentEmails);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('es_new_email_received', { detail: emailRecord }));
    }

    return emailRecord;
  },

  sendContactSmsMessage: async (payload: {
    contactPhone: string;
    otpCode: string;
    purpose?: string;
  }): Promise<{ success: boolean; messageId: string; text: string }> => {
    const text = `[Event Sphere] 🔐 Your verification OTP has been dispatched to your contact messages. Valid for 60 seconds. Do not share this code with anyone.`;
    const messageId = 'sms_' + Date.now();

    // Dispatch native browser notification if granted
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification('💬 New SMS Message: Event Sphere', {
            body: `Your 6-digit verification OTP was sent to your phone messages. Valid for 60s.`,
            icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100'
          });
        } catch (e) {
          // ignore notification error on unsupported environments
        }
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('💬 New SMS Message: Event Sphere', {
              body: `Your 6-digit verification OTP was sent to your phone messages.`
            });
          }
        });
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('es_sms_message_received', { 
        detail: {
          id: messageId,
          phone: payload.contactPhone,
          otpCode: payload.otpCode,
          text,
          sentAt: new Date().toISOString()
        }
      }));
    }

    return { success: true, messageId, text };
  },

  sendLoginOtp: async (payload: {
    contactPhone: string;
    email?: string;
    recipientName?: string;
    otpCode: string;
  }): Promise<SentEmailNotification> => {
    // Deliver to user's contact messages (SMS)
    await notificationApi.sendContactSmsMessage({
      contactPhone: payload.contactPhone,
      otpCode: payload.otpCode,
      purpose: 'Single Sign-On Login'
    });

    const sentEmails = getStorageItem<SentEmailNotification[]>('es_sent_emails', INITIAL_SENT_EMAILS);
    const emailRecord: SentEmailNotification = {
      id: 'login_otp_' + Date.now(),
      recipientEmail: payload.email || 'user@eventsphere.io',
      recipientName: payload.recipientName || 'Event Sphere User',
      subject: `🔐 Your Login Verification Code`,
      otpCode: payload.otpCode,
      eventTitle: 'Event Sphere Single Sign-On',
      ticketTier: `Phone SMS: ${payload.contactPhone}`,
      type: 'REGISTRATION_OTP',
      sentAt: new Date().toISOString()
    };
    sentEmails.unshift(emailRecord);
    setStorageItem('es_sent_emails', sentEmails);

    if (payload.email) {
      console.log(`[Google Mail Notification] ✉️ Login OTP dispatched to: ${payload.email}`);
    }

    // Live EmailJS dispatch if configured and email is present
    const config = notificationApi.getEmailJsConfig();
    if (payload.email && config.serviceId && config.templateId && config.publicKey) {
      try {
        await emailjs.send(
          config.serviceId,
          config.templateId,
          {
            to_email: payload.email,
            to_name: payload.recipientName || 'User',
            otp_code: payload.otpCode,
            event_title: 'Event Sphere Login Security',
            ticket_tier: `Contact Number Verified: ${payload.contactPhone}`
          },
          config.publicKey
        );
      } catch (e) {
        console.warn('[EmailJS login dispatch notice]', e);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('es_new_email_received', { detail: emailRecord }));
    }

    return emailRecord;
  },

  getSentEmails: async (filterEmail?: string): Promise<SentEmailNotification[]> => {
    const sentEmails = getStorageItem<SentEmailNotification[]>('es_sent_emails', INITIAL_SENT_EMAILS);
    if (!filterEmail) return sentEmails;
    return sentEmails.filter(e => e.recipientEmail.toLowerCase() === filterEmail.toLowerCase());
  }
};

export const ticketsApi = {
  purchaseTicket: async (
    eventId: string, 
    ticketTypeId: string, 
    user: User, 
    customRecipientEmail?: string,
    verifiedOtpCode?: string
  ): Promise<Registration> => {
    const events = getStorageItem<EventItem[]>('es_events', INITIAL_EVENTS);
    const event = events.find(e => e.id === eventId) || events[0];
    const ticketType = event.ticketTypes?.find(t => t.id === ticketTypeId) || event.ticketTypes?.[0];

    const registrations = getStorageItem<Registration[]>('es_registrations', [
      {
        id: 'r1111111-1111-1111-1111-111111111111',
        eventId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        userId: '33333333-3333-3333-3333-333333333333',
        event: INITIAL_EVENTS[0],
        ticketTypeId: 't2222222-2222-2222-2222-222222222222',
        ticketType: INITIAL_EVENTS[0].ticketTypes?.[1],
        qrCodeToken: 'ES-SUMMIT2026-VIP-ELENA-9942',
        otpCode: '849204',
        otpExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'CONFIRMED',
        registeredAt: new Date().toISOString()
      }
    ]);

    // Use pre-verified OTP or generate a secure 6-digit numeric OTP
    const generatedOtp = verifiedOtpCode || Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const targetEmail = (customRecipientEmail || user.email || 'attendee@nexus.io').trim();
    const qrCodeToken = `ES-${event.slug.toUpperCase().slice(0, 8)}-${user.firstName.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReg: Registration = {
      id: 'reg_' + Date.now(),
      eventId: event.id,
      userId: user.id,
      user: { ...user, email: targetEmail },
      event,
      ticketTypeId: ticketType?.id || 't1',
      ticketType,
      qrCodeToken,
      otpCode: generatedOtp,
      otpExpiresAt,
      status: 'CONFIRMED',
      registeredAt: new Date().toISOString()
    };

    registrations.unshift(newReg);
    setStorageItem('es_registrations', registrations);

    // Increment sold count
    if (ticketType) {
      ticketType.quantitySold = (ticketType.quantitySold || 0) + 1;
      setStorageItem('es_events', events);
    }

    // Automatically dispatch the booking confirmation with OTP to the recipient email
    await notificationApi.sendBookingOtpEmail({
      recipientEmail: targetEmail,
      recipientName: `${user.firstName} ${user.lastName}`,
      otpCode: generatedOtp,
      eventTitle: event.title,
      ticketTier: ticketType?.name || 'Conference Pass',
      qrCodeToken
    });

    return newReg;
  },

  getMyRegistrations: async (userId: string): Promise<Registration[]> => {
    let registrations = getStorageItem<Registration[]>('es_registrations', INITIAL_REGISTRATIONS);
    
    // Ensure initial registrations are populated if storage was empty
    const existingIds = new Set(registrations.map(r => r.id));
    let updated = false;
    for (const initReg of INITIAL_REGISTRATIONS) {
      if (!existingIds.has(initReg.id)) {
        registrations.push(initReg);
        updated = true;
      }
    }
    if (updated) {
      setStorageItem('es_registrations', registrations);
    }

    return registrations.filter(r => r.userId === userId || r.userId === '33333333-3333-3333-3333-333333333333' || !userId);
  },

  checkIn: async (identifier: string): Promise<Registration | undefined> => {
    const registrations = getStorageItem<Registration[]>('es_registrations', []);
    const cleanId = identifier.trim().toLowerCase();
    const reg = registrations.find(r => 
      r.id.toLowerCase() === cleanId || 
      r.qrCodeToken.toLowerCase() === cleanId ||
      (r.otpCode && r.otpCode.toLowerCase() === cleanId)
    );
    if (reg) {
      reg.status = 'CHECKED_IN';
      reg.checkedInAt = new Date().toISOString();
      setStorageItem('es_registrations', registrations);
    }
    return reg;
  },

  verifyOtpCheckIn: async (otpCode: string, eventId?: string): Promise<{ success: boolean; registration?: Registration; message: string }> => {
    const registrations = getStorageItem<Registration[]>('es_registrations', []);
    const cleanOtp = otpCode.trim();
    const reg = registrations.find(r => 
      r.otpCode === cleanOtp && (!eventId || r.eventId === eventId)
    );

    if (!reg) {
      return { success: false, message: 'Invalid OTP code. Please check and try again.' };
    }

    if (reg.status === 'CHECKED_IN') {
      return { success: true, registration: reg, message: `Attendee ${reg.user?.firstName || ''} is already checked in!` };
    }

    reg.status = 'CHECKED_IN';
    reg.checkedInAt = new Date().toISOString();
    setStorageItem('es_registrations', registrations);

    return { 
      success: true, 
      registration: reg, 
      message: `OTP Verified! Access granted for ${reg.user?.firstName || 'Attendee'} ${reg.user?.lastName || ''}.` 
    };
  },

  cancelBooking: async (payload: {
    registrationId: string;
    reason: string;
    refundMethod: RefundMethod;
    accountDetails?: string;
  }): Promise<{ success: boolean; refund: CancellationRefund; registration: Registration }> => {
    const registrations = getStorageItem<Registration[]>('es_registrations', INITIAL_REGISTRATIONS);
    const index = registrations.findIndex(r => r.id === payload.registrationId);
    
    if (index === -1) {
      throw new Error('Booking registration not found');
    }

    const targetReg = { ...registrations[index] };
    const ticketPrice = targetReg.ticketType?.price ?? 0;
    const currency = targetReg.ticketType?.currency || 'USD';
    const txnRef = 'TXN-REF-' + Math.floor(100000 + Math.random() * 900000);

    const methodLabels: Record<RefundMethod, string> = {
      ORIGINAL_PAYMENT: 'Original Payment Method (Card ending •••• 4242)',
      BANK_TRANSFER: payload.accountDetails ? `Bank Account (${payload.accountDetails})` : 'Direct Wire / Bank Account',
      WALLET_CREDIT: 'EventSphere Credit Wallet (+10% Bonus)',
      UPI_PAYPAL: payload.accountDetails ? `Digital Payout (${payload.accountDetails})` : 'PayPal / UPI Account'
    };

    const refund: CancellationRefund = {
      id: 'ref_' + Date.now(),
      registrationId: targetReg.id,
      eventId: targetReg.eventId,
      eventTitle: targetReg.event?.title || 'Event',
      ticketTypeName: targetReg.ticketType?.name || 'Standard Pass',
      amount: ticketPrice,
      currency,
      refundMethod: payload.refundMethod,
      accountDetails: methodLabels[payload.refundMethod] || payload.accountDetails,
      reason: payload.reason,
      cancelledAt: new Date().toISOString(),
      status: 'COMPLETED',
      transactionRef: txnRef
    };

    // Mark registration status as CANCELLED
    targetReg.status = 'CANCELLED';
    targetReg.cancelledAt = refund.cancelledAt;
    targetReg.refund = refund;
    registrations[index] = targetReg;
    setStorageItem('es_registrations', registrations);

    // Save to refund history storage
    const refunds = getStorageItem<CancellationRefund[]>('es_refunds_history', []);
    refunds.unshift(refund);
    setStorageItem('es_refunds_history', refunds);

    // Release ticket back to event capacity if applicable
    const events = getStorageItem<EventItem[]>('es_events', INITIAL_EVENTS);
    const event = events.find(e => e.id === targetReg.eventId);
    if (event && event.ticketTypes) {
      const ticketType = event.ticketTypes.find(t => t.id === targetReg.ticketTypeId);
      if (ticketType && (ticketType.quantitySold || 0) > 0) {
        ticketType.quantitySold = Math.max(0, (ticketType.quantitySold || 1) - 1);
        setStorageItem('es_events', events);
      }
    }

    // Send confirmation email notification
    await notificationApi.sendCancellationRefundEmail({
      recipientEmail: targetReg.user?.email || 'attendee@nexus.io',
      recipientName: `${targetReg.user?.firstName || 'Valued'} ${targetReg.user?.lastName || 'Attendee'}`,
      eventTitle: targetReg.event?.title || 'Event',
      ticketTier: targetReg.ticketType?.name || 'Pass',
      refundAmount: ticketPrice,
      currency,
      refundMethod: methodLabels[payload.refundMethod] || payload.refundMethod,
      transactionRef: txnRef
    });

    // Notify other components reactively
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('es_booking_cancelled', { 
        detail: { registration: targetReg, refund } 
      }));
    }

    return { success: true, refund, registration: targetReg };
  },

  getRefundHistory: async (userId?: string): Promise<CancellationRefund[]> => {
    return getStorageItem<CancellationRefund[]>('es_refunds_history', []);
  }
};

// ==========================================
// 4. LIVE ENGAGEMENT API (POLLS & Q&A)
// ==========================================
export const engagementApi = {
  getPolls: async (eventId: string): Promise<Poll[]> => {
    const polls = getStorageItem<Poll[]>('es_polls', INITIAL_POLLS);
    return polls.filter(p => p.eventId === eventId);
  },

  votePoll: async (pollId: string, optionId: string): Promise<Poll[]> => {
    const polls = getStorageItem<Poll[]>('es_polls', INITIAL_POLLS);
    const poll = polls.find(p => p.id === pollId);
    if (poll) {
      const opt = poll.options.find(o => o.id === optionId);
      if (opt) {
        opt.voteCount += 1;
        poll.userVotedOptionId = optionId;
      }
      setStorageItem('es_polls', polls);
    }
    return polls;
  },

  getQuestions: async (eventId: string): Promise<Question[]> => {
    const questions = getStorageItem<Question[]>('es_questions', INITIAL_QUESTIONS);
    return questions.filter(q => q.eventId === eventId);
  },

  askQuestion: async (eventId: string, questionText: string, user: User, isAnonymous = false): Promise<Question> => {
    const questions = getStorageItem<Question[]>('es_questions', INITIAL_QUESTIONS);
    const newQ: Question = {
      id: 'q_' + Date.now(),
      eventId,
      userId: user.id,
      userName: isAnonymous ? 'Anonymous Attendee' : `${user.firstName} ${user.lastName}`,
      userAvatar: isAnonymous ? undefined : user.avatarUrl,
      questionText,
      upvotes: 1,
      isAnswered: false,
      isHighlighted: false,
      isAnonymous,
      createdAt: 'Just now',
      hasUpvoted: true
    };
    questions.unshift(newQ);
    setStorageItem('es_questions', questions);
    return newQ;
  },

  upvoteQuestion: async (questionId: string): Promise<Question[]> => {
    const questions = getStorageItem<Question[]>('es_questions', INITIAL_QUESTIONS);
    const q = questions.find(item => item.id === questionId);
    if (q) {
      if (q.hasUpvoted) {
        q.upvotes = Math.max(0, q.upvotes - 1);
        q.hasUpvoted = false;
      } else {
        q.upvotes += 1;
        q.hasUpvoted = true;
      }
      setStorageItem('es_questions', questions);
    }
    return questions;
  }
};

// ==========================================
// 5. NETWORKING API
// ==========================================
export const networkingApi = {
  getConnections: async (): Promise<NetworkingConnection[]> => {
    return getStorageItem<NetworkingConnection[]>('es_networking', INITIAL_NETWORKING);
  },

  sendRequest: async (connectionId: string): Promise<NetworkingConnection[]> => {
    const conns = getStorageItem<NetworkingConnection[]>('es_networking', INITIAL_NETWORKING);
    const conn = conns.find(c => c.id === connectionId);
    if (conn) {
      conn.status = conn.status === 'NONE' ? 'PENDING' : 'ACCEPTED';
      setStorageItem('es_networking', conns);
    }
    return conns;
  }
};

// ==========================================
// 6. SPHERE AI RAG ASSISTANT API
// ==========================================
export const aiApi = {
  sendMessage: async (userQuery: string, eventContext?: EventItem): Promise<AIMessage> => {
    // Check if backend AI is reachable, otherwise intelligent local RAG engine responds
    try {
      const response = await axios.post(`${AI_BASE_URL}/chat`, {
        query: userQuery,
        eventId: eventContext?.id,
        organizationId: eventContext?.organizationId
      }, { timeout: 2000 });
      return {
        id: 'msg_' + Date.now(),
        sender: 'assistant',
        text: response.data.answer,
        timestamp: 'Just now',
        sources: response.data.sources || ['Event Schedule DB', 'Speaker Directory', 'pgvector RAG Chunk #4']
      };
    } catch {
      // Fallback local smart conversational AI for demo/offline resilience
      const q = userQuery.toLowerCase();
      let responseText = '';
      let sources = ['Event Sphere RAG Vector Store'];
      let suggestedActions: { label: string; action: string }[] | undefined = undefined;

      if (q.includes('who is speaking') || q.includes('speaker') || q.includes('aris thorne')) {
        responseText = `At the Global AI Summit 2026, **Dr. Aris Thorne** (Chief AI Scientist at Synthetix Lab) is delivering the Opening Keynote on *'The Dawn of Multi-Agent Systems'*. Other featured speakers include **Aria Patel** (VP at HyperScale Cloud) and **Kenji Takahashi** (CEO of VectorGraph).`;
        sources = ['Speaker Directory', 'Keynote Agenda DTO'];
        suggestedActions = [{ label: 'View Speakers', action: '/agenda' }];
      } else if (q.includes('3 pm') || q.includes('schedule') || q.includes('session') || q.includes('agenda')) {
        responseText = `At 2:00 PM - 3:15 PM, you have **Panel: High-Throughput Event-Driven Microservices with Kafka** in Auditorium C with Aria Patel. Followed by interactive networking roundtables in the Expo Pavilion.`;
        sources = ['Session Time Index', 'Auditorium C Track'];
        suggestedActions = [{ label: 'View Full Agenda', action: '/agenda' }];
      } else if (q.includes('where') || q.includes('venue') || q.includes('location')) {
        responseText = `The event is hosted at the **Moscone Center, 747 Howard St, San Francisco, CA 94103** with synchronized high-definition virtual livestreaming for online ticket holders.`;
        sources = ['Venue Information Model', 'Maps Integration'];
      } else if (q.includes('sponsor') || q.includes('booth')) {
        responseText = `Our Platinum Sponsor is **HyperCloud Inc.** located at Booth #101 (Hall A), and Gold Sponsor is **DataStream Labs** at Booth #204 (Hall B). Both are hosting live product demos!`;
        sources = ['Sponsor Directory'];
      } else if (q.includes('network') || q.includes('who should i')) {
        responseText = `Based on your profile skills in **LLMs, RAG, and Distributed Systems**, Sphere AI recommends connecting with **Alex Mercer** (Cognitech AI - 98% compatibility) and **Sarah Kim** (VP of Eng at CloudWave - 92% compatibility).`;
        sources = ['AI Vector Matchmaking Matrix', 'User Profile Embeddings'];
        suggestedActions = [{ label: 'Open Networking Lobby', action: '/networking' }];
      } else if (q.includes('ticket') || q.includes('register') || q.includes('price')) {
        responseText = `3 ticket tiers are currently available:\n• **Virtual Pass**: $99\n• **Standard In-Person**: $499\n• **All-Access VIP**: $999\nUse code **SPHERE20** at checkout for 20% off!`;
        sources = ['Ticket Types Table'];
        suggestedActions = [{ label: 'Get Tickets Now', action: '#tickets' }];
      } else {
        responseText = `Sphere AI has analyzed your inquiry against the verified event documents and live schedule. For **"${userQuery}"**, you can interact with speakers directly during the live Q&A session, bookmark relevant workshops on your personal calendar, or review the event materials in the document vault.`;
        sources = ['pgvector RAG Chunk #12', 'Event FAQ Index'];
      }

      return {
        id: 'msg_' + Date.now(),
        sender: 'assistant',
        text: responseText,
        timestamp: 'Just now',
        sources,
        suggestedActions
      };
    }
  }
};

// ==========================================
// 7. PLATFORM & ANALYTICS API
// ==========================================
export const analyticsApi = {
  getPlatformStats: async (): Promise<PlatformStats> => {
    return getStorageItem<PlatformStats>('es_platform_stats', INITIAL_PLATFORM_STATS);
  }
};
