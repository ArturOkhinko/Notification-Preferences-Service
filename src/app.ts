import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user.routes';
import evaluateRoutes from './routes/evaluate.routes';

export const createApp = () => {
  const app = express();
  app.use(cors({ origin: 'http://localhost:3001' }));
  app.use(express.json());

  app.use('/users', userRoutes);
  app.use('/evaluate', evaluateRoutes);

  return app;
};
