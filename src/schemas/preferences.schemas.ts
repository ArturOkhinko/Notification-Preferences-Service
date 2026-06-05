import { z } from 'zod';
import { CHANNELS, NOTIFICATION_TYPES } from '../domain/types';

export const userIdParamsSchema = z.object({
  id: z.string().min(1).max(64),
});
const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export const quietHoursSchema = z.object({
  startTime: timeSchema,
  endTime: timeSchema,
  timezone: z
    .string()
    .refine((tz) => Intl.supportedValuesOf('timeZone').includes(tz), {
      message: 'Invalid IANA timezone',
    }),
});

export const updatePreferencesSchema = z
  .object({
    preference: z
      .object({
        notificationType: z.enum(NOTIFICATION_TYPES),
        channel: z.enum(CHANNELS),
        enabled: z.boolean(),
      })
      .optional(),
    quietHours: quietHoursSchema.optional(),
  })
  .refine((b) => b.preference || b.quietHours, {
    message: 'Provide preference or quietHours',
  });
