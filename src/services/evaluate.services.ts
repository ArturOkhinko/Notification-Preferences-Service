import { evaluateNotification, EvaluationResult } from '../domain/evaluate';
import { mergePreferences } from '../domain/preferences';
import { Channel, NotificationType, Region } from '../domain/types';
import globalPoliciesRepository from '../repositories/globalPolicies.repository';
import preferencesRepository from '../repositories/preferences.repository';
import quietHoursRepository from '../repositories/quietHours.repository';

export interface EvaluateInput {
  userId: string;
  notificationType: NotificationType;
  channel: Channel;
  region: Region;
  datetime: Date;
}

const logDecision = (input: EvaluateInput, result: EvaluationResult): void => {
  console.log(
    JSON.stringify({
      event: 'notification_evaluated',
      userId: input.userId,
      notificationType: input.notificationType,
      channel: input.channel,
      region: input.region,
      datetime: input.datetime.toISOString(),
      decision: result.decision,
      reason: result.reason,
    }),
  );
};

const evaluate = async (input: EvaluateInput): Promise<EvaluationResult> => {
  const [policyBlocked, defaults, overrides, quietHours] = await Promise.all([
    globalPoliciesRepository.isBlocked(
      input.notificationType,
      input.channel,
      input.region,
    ),
    preferencesRepository.findDefaults(),
    preferencesRepository.findUserOverrides(input.userId),
    quietHoursRepository.findByUser(input.userId),
  ]);

  const result = evaluateNotification({
    notificationType: input.notificationType,
    channel: input.channel,
    datetime: input.datetime,
    policyBlocked,
    preferences: mergePreferences(defaults, overrides),
    quietHours,
  });

  logDecision(input, result);
  return result;
};

export default { evaluate };
