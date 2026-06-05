import { mergePreferences } from './preferences';
import { Preference } from './types';

const defaults: Preference[] = [
  { notificationType: 'transactional', channel: 'email', enabled: true },
  { notificationType: 'marketing', channel: 'email', enabled: false },
  { notificationType: 'marketing', channel: 'push', enabled: true },
];

const findPreference = (
  preferences: Preference[],
  notificationType: Preference['notificationType'],
  channel: Preference['channel'],
) =>
  preferences.find(
    (p) => p.notificationType === notificationType && p.channel === channel,
  );

describe('mergePreferences', () => {
  it('returns all defaults for a user without overrides', () => {
    const result = mergePreferences(defaults, []);

    expect(result).toHaveLength(defaults.length);
    expect(result).toEqual(expect.arrayContaining(defaults));
  });

  it('replaces a default with the user override', () => {
    const override: Preference = {
      notificationType: 'marketing',
      channel: 'push',
      enabled: false,
    };

    const result = mergePreferences(defaults, [override]);

    expect(findPreference(result, 'marketing', 'push')).toEqual(override);
    expect(result).toHaveLength(defaults.length);
  });

  it('keeps untouched defaults when one preference is overridden', () => {
    const override: Preference = {
      notificationType: 'marketing',
      channel: 'email',
      enabled: true,
    };

    const result = mergePreferences(defaults, [override]);

    expect(findPreference(result, 'transactional', 'email')).toEqual({
      notificationType: 'transactional',
      channel: 'email',
      enabled: true,
    });
  });

  it('preserves an override that has no matching default', () => {
    const override: Preference = {
      notificationType: 'marketing',
      channel: 'messenger',
      enabled: true,
    };

    const result = mergePreferences(defaults, [override]);

    expect(findPreference(result, 'marketing', 'messenger')).toEqual(override);
    expect(result).toHaveLength(defaults.length + 1);
  });
});
