import { evaluateNotification, isInQuietHours, EvaluationContext } from './evaluate';
import { Preference, QuietHours } from './types';

const preferences: Preference[] = [
  { notificationType: 'transactional', channel: 'email', enabled: true },
  { notificationType: 'marketing', channel: 'email', enabled: false },
  { notificationType: 'marketing', channel: 'push', enabled: true },
];

const berlinNight: QuietHours = {
  startTime: '22:00',
  endTime: '08:00',
  timezone: 'Europe/Berlin',
};

const context = (overrides: Partial<EvaluationContext>): EvaluationContext => ({
  notificationType: 'marketing',
  channel: 'push',
  datetime: new Date('2026-05-21T10:00:00Z'),
  policyBlocked: false,
  preferences,
  quietHours: null,
  ...overrides,
});

describe('evaluateNotification', () => {
  it('denies when a global policy blocks the notification', () => {
    const result = evaluateNotification(context({ policyBlocked: true }));

    expect(result).toEqual({
      decision: 'deny',
      reason: 'blocked_by_global_policy',
    });
  });

  it('denies when the preference is disabled', () => {
    const result = evaluateNotification(
      context({ notificationType: 'marketing', channel: 'email' }),
    );

    expect(result).toEqual({
      decision: 'deny',
      reason: 'disabled_by_preference',
    });
  });

  it('denies when no preference exists for the pair', () => {
    const result = evaluateNotification(
      context({ notificationType: 'transactional', channel: 'sms' }),
    );

    expect(result).toEqual({
      decision: 'deny',
      reason: 'disabled_by_preference',
    });
  });

  it('denies marketing push during quiet hours in the user timezone', () => {
    const result = evaluateNotification(
      context({
        datetime: new Date('2026-05-21T21:30:00Z'),
        quietHours: berlinNight,
      }),
    );

    expect(result).toEqual({
      decision: 'deny',
      reason: 'blocked_by_quiet_hours',
    });
  });

  it('allows transactional notifications during quiet hours', () => {
    const result = evaluateNotification(
      context({
        notificationType: 'transactional',
        channel: 'email',
        datetime: new Date('2026-05-21T21:30:00Z'),
        quietHours: berlinNight,
      }),
    );

    expect(result).toEqual({ decision: 'allow', reason: 'allowed' });
  });

  it('allows marketing push outside quiet hours', () => {
    const result = evaluateNotification(
      context({
        datetime: new Date('2026-05-21T10:00:00Z'),
        quietHours: berlinNight,
      }),
    );

    expect(result).toEqual({ decision: 'allow', reason: 'allowed' });
  });

  it('checks policy before preferences', () => {
    const result = evaluateNotification(
      context({
        notificationType: 'marketing',
        channel: 'email',
        policyBlocked: true,
      }),
    );

    expect(result.reason).toBe('blocked_by_global_policy');
  });
});

describe('isInQuietHours', () => {
  it('is true just before the overnight interval ends', () => {
    expect(
      isInQuietHours(new Date('2026-05-22T05:59:00Z'), berlinNight),
    ).toBe(true);
  });

  it('is false exactly when the interval ends', () => {
    expect(
      isInQuietHours(new Date('2026-05-22T06:00:00Z'), berlinNight),
    ).toBe(false);
  });

  it('is true exactly when the interval starts', () => {
    expect(
      isInQuietHours(new Date('2026-05-21T20:00:00Z'), berlinNight),
    ).toBe(true);
  });

  it('supports an interval inside one day', () => {
    const daytime: QuietHours = {
      startTime: '12:00',
      endTime: '14:00',
      timezone: 'UTC',
    };

    expect(isInQuietHours(new Date('2026-05-21T13:00:00Z'), daytime)).toBe(true);
    expect(isInQuietHours(new Date('2026-05-21T15:00:00Z'), daytime)).toBe(false);
  });

  it('treats equal start and end as no quiet hours', () => {
    const empty: QuietHours = {
      startTime: '10:00',
      endTime: '10:00',
      timezone: 'UTC',
    };

    expect(isInQuietHours(new Date('2026-05-21T10:00:00Z'), empty)).toBe(false);
  });
});
