import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import 'express-async-errors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as admin from 'firebase-admin';
import { connectToDatabase, connectToRedis } from '@/utils';
import { Logger } from '@/lib';

// routers
import { userRouter, sessionRouter } from '@/features/auth';
import { mealGeneratorShowcaseRouter } from '@/features/meal_generator_showcase';
import { userSettingsRouter } from '@/features/users';
import { mealsRouter } from '@/features/meal_planner';
import { testingRouter } from '@/testing';

// middleware
import { morganMiddleware, sessionOptions, errorHandler } from '@/middleware';

// firebase admin initialization
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // replace \\n with \n
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

// rate limiter for /meals and /meal-generator-showcase endpoints
const sharedLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  max: 1000, // Maximum requests per day as per current API plan
  message: 'Daily request limit exceeded.', // NOTE: status code 429 is returned here
});

export const app = express();
app.set('trust proxy', 1); // needed for rate limiter to work behind nginx proxy
app.use(helmet());

connectToDatabase().catch((_e) => {
  Logger.debug('An error occurred during postgres initialization:');
});

connectToRedis().catch((_e) => {
  Logger.debug('An error occurred during redis initialization:');
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: 'http://localhost:5173', // NOTE: can add more as needed
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(session(sessionOptions));
app.use(morganMiddleware);

if (process.env.NODE_ENV === 'development') {
  app.use('/api/testing', testingRouter);
}

app.use('/api/users', userRouter);
app.use('/api/session', sessionRouter);
app.use(['/api/meals', '/api/meal-generator-showcase'], sharedLimiter); // rate limiter applied to these endpoints
app.use('/api/meal-generator-showcase', mealGeneratorShowcaseRouter);
app.use('/api/user', userSettingsRouter);
app.use('/api/meals', mealsRouter);
app.use(errorHandler);
