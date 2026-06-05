import { Request, Response, NextFunction } from 'express';
import { EvaluateBody } from '../schemas/evaluate.schemas';
import evaluateService from '../services/evaluate.services';

const evaluate = async (
  req: Request<unknown, unknown, EvaluateBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { datetime, ...rest } = req.body;
    const result = await evaluateService.evaluate({
      ...rest,
      datetime: new Date(datetime),
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
};

export { evaluate };
