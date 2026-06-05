import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user.routes';

export const createApp = () => {
  const app = express();
  app.use(cors({ origin: 'http://localhost:3001' }));
  app.use(express.json());

  app.use('/users', userRoutes);

  return app;
};
