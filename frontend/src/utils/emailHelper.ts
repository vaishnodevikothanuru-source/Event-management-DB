export interface EmailProviderInfo {
  name: string;
  domain: string;
  url: string;
  badgeColor: string;
  iconName: 'google' | 'microsoft' | 'yahoo' | 'proton' | 'apple' | 'generic';
}

/**
 * Resolves the direct webmail inbox URL and provider metadata based on the recipient email address.
 */
export function getEmailProviderInfo(email: string): EmailProviderInfo {
  const cleanEmail = (email || '').trim().toLowerCase();
  const domain = cleanEmail.split('@')[1] || '';

  // 1. Google Mail / Google Workspace / Educational institutes on Google Suite
  if (
    domain.includes('gmail') ||
    domain.includes('googlemail') ||
    domain.endsWith('.edu') ||
    domain.endsWith('.edu.in') ||
    domain.endsWith('.ac.in') ||
    domain === 'eventsphere.io' ||
    domain === 'synthetix.ai'
  ) {
    return {
      name: 'Google Mail',
      domain: domain || 'gmail.com',
      url: `https://mail.google.com/mail/u/0/?authuser=${encodeURIComponent(cleanEmail)}#search/Event+Sphere+OR+OTP+OR+verification`,
      badgeColor: 'bg-red-500/15 text-red-400 border-red-500/30',
      iconName: 'google'
    };
  }

  // 2. Microsoft Outlook / Hotmail / Live / Office 365
  if (
    domain.includes('outlook') ||
    domain.includes('hotmail') ||
    domain.includes('live.com') ||
    domain.includes('msn.com') ||
    domain.includes('microsoft') ||
    domain.includes('office365')
  ) {
    return {
      name: 'Microsoft Outlook',
      domain: domain || 'outlook.com',
      url: 'https://outlook.live.com/mail/0/inbox',
      badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      iconName: 'microsoft'
    };
  }

  // 3. Yahoo Mail
  if (domain.includes('yahoo') || domain.includes('ymail') || domain.includes('rocketmail')) {
    return {
      name: 'Yahoo Mail',
      domain: domain || 'yahoo.com',
      url: 'https://mail.yahoo.com/',
      badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      iconName: 'yahoo'
    };
  }

  // 4. ProtonMail
  if (domain.includes('proton') || domain.includes('protonmail')) {
    return {
      name: 'Proton Mail',
      domain: domain || 'proton.me',
      url: 'https://mail.proton.me/',
      badgeColor: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
      iconName: 'proton'
    };
  }

  // 5. Apple iCloud / Me.com / Mac.com
  if (domain.includes('icloud') || domain.includes('me.com') || domain.includes('mac.com')) {
    return {
      name: 'Apple iCloud Mail',
      domain: domain || 'icloud.com',
      url: 'https://www.icloud.com/mail',
      badgeColor: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
      iconName: 'apple'
    };
  }

  // 6. Generic / Custom Domain Webmail fallback
  return {
    name: domain ? `${domain.charAt(0).toUpperCase() + domain.slice(1)} Webmail` : 'Email Inbox',
    domain: domain || 'mail',
    url: `https://mail.google.com/mail/u/0/?authuser=${encodeURIComponent(cleanEmail)}#search/Event+Sphere+OR+OTP+OR+verification`,
    badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    iconName: 'generic'
  };
}

/**
 * Automatically opens the user's webmail inbox in a new browser tab.
 */
export function openUserEmail(email: string, target = '_blank'): boolean {
  try {
    const provider = getEmailProviderInfo(email);
    const win = window.open(provider.url, target, 'noopener,noreferrer');
    if (win) {
      win.focus();
      return true;
    }
  } catch (err) {
    console.error('Failed to open email tab:', err);
  }
  return false;
}
