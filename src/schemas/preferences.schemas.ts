import { z } from 'zod';
import { CHANNELS, NOTIFICATION_TYPES } from '../domain/types';

export const userIdParamsSchema = z.object({
  id: z.string().min(1).max(64),
});

export const updatePreferenceSchema = z.object({
    notificationType: z.enum(NOTIFICATION_TYPES),
    channel: z.enum(CHANNELS),
    enabled: z.boolean(),
})
