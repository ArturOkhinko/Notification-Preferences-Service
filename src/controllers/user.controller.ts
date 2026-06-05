import { Request, Response, NextFunction } from 'express';
import userService from '../services/user.services';
import z from 'zod';
import { updatePreferencesSchema } from '../schemas/preferences.schemas';

const getUserPreferences = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.params.id;
    const userPreferences = await userService.getUserPreferences(userId);
    res.json(userPreferences);
  } catch (e) {
    next(e);
  }
};

type UpdatePreferenceBody = z.infer<typeof updatePreferencesSchema>;

const changeUserPreferences = async (
  req: Request<{ id: string }, unknown, UpdatePreferenceBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.params.id;
    const pref = req.body;
    await userService.changeUserPreferences(userId, pref);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
};

export { getUserPreferences, changeUserPreferences };
