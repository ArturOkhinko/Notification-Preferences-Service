import { Preference, QuietHours } from '../domain/types';

jest.mock('../repositories/preferences.repository', () => ({
  __esModule: true,
  default: {
    findDefaults: jest.fn(),
    findUserOverrides: jest.fn(),
    upsertUserPreference: jest.fn(),
  },
}));

jest.mock('../repositories/user.repository', () => ({
  __esModule: true,
  default: { ensureUser: jest.fn() },
}));

jest.mock('../repositories/quietHours.repository', () => ({
  __esModule: true,
  default: { findByUser: jest.fn(), upsertQuietHours: jest.fn() },
}));

import userService from './user.services';
import preferencesRepository from '../repositories/preferences.repository';
import usersRepository from '../repositories/user.repository';
import quietHoursRepository from '../repositories/quietHours.repository';

const defaults: Preference[] = [
  { notificationType: 'transactional', channel: 'email', enabled: true },
  { notificationType: 'marketing', channel: 'email', enabled: true },
];

const keyOf = (userId: string, p: Preference) =>
  `${userId}:${p.notificationType}:${p.channel}`;

const createInMemoryStore = () => {
  const store = new Map<string, Preference>();
  (preferencesRepository.findDefaults as jest.Mock).mockResolvedValue(defaults);
  (preferencesRepository.findUserOverrides as jest.Mock).mockImplementation(
    async (userId: string) =>
      [...store.entries()]
        .filter(([key]) => key.startsWith(`${userId}:`))
        .map(([, value]) => value),
  );
  (preferencesRepository.upsertUserPreference as jest.Mock).mockImplementation(
    async (userId: string, pref: Preference) => {
      store.set(keyOf(userId, pref), pref);
    },
  );
  (usersRepository.ensureUser as jest.Mock).mockResolvedValue(undefined);
  (quietHoursRepository.upsertQuietHours as jest.Mock).mockResolvedValue(
    undefined,
  );
  return store;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getUserPreferences', () => {
  it('returns defaults for a new user', async () => {
    createInMemoryStore();

    const result = await userService.getUserPreferences('new-user');

    expect(result).toEqual(expect.arrayContaining(defaults));
    expect(result).toHaveLength(defaults.length);
  });

  it('reflects a user change and keeps transactional enabled', async () => {
    createInMemoryStore();
    const disableMarketingEmail: Preference = {
      notificationType: 'marketing',
      channel: 'email',
      enabled: false,
    };

    await userService.changeUserPreferences('user-1', {
      preference: disableMarketingEmail,
    });
    const result = await userService.getUserPreferences('user-1');

    expect(result).toContainEqual(disableMarketingEmail);
    expect(result).toContainEqual({
      notificationType: 'transactional',
      channel: 'email',
      enabled: true,
    });
  });
});

describe('changeUserPreferences', () => {
  it('creates the user before saving the preference', async () => {
    createInMemoryStore();

    await userService.changeUserPreferences('user-1', {
      preference: defaults[0],
    });

    expect(usersRepository.ensureUser).toHaveBeenCalledWith('user-1');
    expect(preferencesRepository.upsertUserPreference).toHaveBeenCalledWith(
      'user-1',
      defaults[0],
    );
  });

  it('is idempotent: repeating the same command keeps the same state', async () => {
    createInMemoryStore();
    const command: Preference = {
      notificationType: 'marketing',
      channel: 'email',
      enabled: false,
    };

    await userService.changeUserPreferences('user-1', { preference: command });
    const afterFirst = await userService.getUserPreferences('user-1');
    await userService.changeUserPreferences('user-1', { preference: command });
    const afterSecond = await userService.getUserPreferences('user-1');

    expect(afterSecond).toEqual(afterFirst);
  });

  it('saves quiet hours when provided', async () => {
    createInMemoryStore();
    const quietHours: QuietHours = {
      startTime: '22:00',
      endTime: '08:00',
      timezone: 'Europe/Berlin',
    };

    await userService.changeUserPreferences('user-1', { quietHours });

    expect(quietHoursRepository.upsertQuietHours).toHaveBeenCalledWith(
      'user-1',
      quietHours,
    );
    expect(preferencesRepository.upsertUserPreference).not.toHaveBeenCalled();
  });
});
