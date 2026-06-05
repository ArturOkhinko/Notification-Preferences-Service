import { Channel, NotificationType, Preference, QuietHours } from './types';

export type Decision = 'allow' | 'deny';

export type EvaluationReason =
  | 'allowed'
  | 'blocked_by_global_policy'
  | 'disabled_by_preference'
  | 'blocked_by_quiet_hours';

export interface EvaluationResult {
  decision: Decision;
  reason: EvaluationReason;
}

export interface EvaluationContext {
  notificationType: NotificationType;
  channel: Channel;
  datetime: Date;
  policyBlocked: boolean;
  preferences: Preference[];
  quietHours: QuietHours | null;
}

const localTimeIn = (timezone: string, date: Date): string =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);

export const isInQuietHours = (
  datetime: Date,
  quietHours: QuietHours,
): boolean => {
  const { startTime, endTime, timezone } = quietHours;
  if (startTime === endTime) {
    return false;
  }
  const localTime = localTimeIn(timezone, datetime);
  if (startTime < endTime) {
    return localTime >= startTime && localTime < endTime;
  }
  return localTime >= startTime || localTime < endTime;
};

const isEnabled = (
  preferences: Preference[],
  notificationType: NotificationType,
  channel: Channel,
): boolean =>
  preferences.some(
    (p) =>
      p.notificationType === notificationType &&
      p.channel === channel &&
      p.enabled,
  );

const isQuietHoursApplicable = (ctx: EvaluationContext): boolean =>
  ctx.quietHours !== null &&
  ctx.notificationType !== 'transactional' &&
  isInQuietHours(ctx.datetime, ctx.quietHours as QuietHours);

export const evaluateNotification = (
  ctx: EvaluationContext,
): EvaluationResult => {
  if (ctx.policyBlocked) {
    return { decision: 'deny', reason: 'blocked_by_global_policy' };
  }
  if (!isEnabled(ctx.preferences, ctx.notificationType, ctx.channel)) {
    return { decision: 'deny', reason: 'disabled_by_preference' };
  }
  if (isQuietHoursApplicable(ctx)) {
    return { decision: 'deny', reason: 'blocked_by_quiet_hours' };
  }
  return { decision: 'allow', reason: 'allowed' };
};
