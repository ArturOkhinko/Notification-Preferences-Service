import express from 'express';
import userRoutes from './routes/user.routes';
import evaluateRoutes from './routes/evaluate.routes';
import { metrics } from './infra/metrics';

export const createApp = () => {
  const app = express();
  app.use(express.json());

  app.use('/users', userRoutes);
  app.use('/evaluate', evaluateRoutes);
  app.get('/metrics', (req, res) => res.json(metrics.snapshot()));

  return app;
};
