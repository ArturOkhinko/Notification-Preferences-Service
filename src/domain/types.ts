export const CHANNELS = ['email', 'sms', 'push', 'messenger'] as const;
export type Channel = (typeof CHANNELS)[number];

export const NOTIFICATION_TYPES = ['transactional', 'marketing'] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface Preference {
  notificationType: NotificationType;
  channel: Channel;
  enabled: boolean;
}

export interface QuietHours {
  startTime: string;
  endTime: string;
  timezone: string;
}

export interface PreferencesUpdate {
  preference?: Preference;
  quietHours?: QuietHours;
}
