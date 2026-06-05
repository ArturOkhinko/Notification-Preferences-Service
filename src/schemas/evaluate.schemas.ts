import { z } from 'zod';
import { CHANNELS, NOTIFICATION_TYPES } from '../domain/types';

export const evaluateSchema = z.object({
  userId: z.string().min(1).max(64),
  notificationType: z.enum(NOTIFICATION_TYPES),
  channel: z.enum(CHANNELS),
  region: z.string().regex(/^[A-Z]{2,8}$/),
  datetime: z.iso.datetime({ offset: true }),
});

export type EvaluateBody = z.infer<typeof evaluateSchema>;
