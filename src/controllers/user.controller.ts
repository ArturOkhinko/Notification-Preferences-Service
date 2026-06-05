import { Request, Response, NextFunction } from 'express';
import userService from '../services/user.services';

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

const changeUserPreferences = async (
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

export { getUserPreferences, changeUserPreferences };
