import { NextFunction, Request, Response } from 'express';
import { auth } from 'firebase-admin';
import { loginSchema, FullUserForClient } from '@/types';
import { sessionService } from '../services/sessionService';
import { Logger } from '@/lib';
import { prisma } from '@/utils';

const login = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  // eslint-disable-next-line prefer-destructuring
  const body: unknown = req.body;
  const result = loginSchema.safeParse(body);
  let zodErrors = {};

  if (!result.success) {
    req.session.destroy(() => {});
    result.error.issues.forEach((issue) => {
      zodErrors = { ...zodErrors, [issue.path[0]]: issue.message };
    });
    res.status(400).json({ errors: zodErrors });
  } else {
    const loggedUser = await sessionService.login(result.data);

    if (!loggedUser) {
      req.session.destroy(() => {});
      res.status(401).json({ errors: 'Invalid email or password' });
      return;
    }
    if (loggedUser.user.disabled) {
      req.session.destroy(() => {});
      res.status(401).json({ errors: 'user disabled' });
      return;
    }

    if (!loggedUser.user.verified) {
      req.session.destroy(() => {});
      res.status(401).json({ errors: 'not verified' });
      return;
    }

    // NOTE: the req.session.user type is set in tyoes/expressSession.d.ts
    req.session.user = {
      id: loggedUser.user.id,
      email: loggedUser.user.email,
      role: loggedUser.user.role,
      disabled: loggedUser.user.disabled,
      name: loggedUser.user.name,
    };
    req.session.save();

    const userToBeReturned: FullUserForClient = {
      user: {
        name: loggedUser.user.name,
        email: loggedUser.user.email,
      },
      profile: loggedUser.profile,
    };

    res.status(200).json(userToBeReturned);
  }
};

const logout = (req: Request, res: Response, _next: NextFunction): void => {
  req.session.destroy((err: unknown) => {
    if (err) {
      Logger.error('Error destroying session');
    }
  });
  res.clearCookie('firebaseSession');
  res.clearCookie('connect.sid');
  req.userId = '';
  res.status(204).end();
};

const authCheck = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const { user } = req.session;

  // social login cookies
  const firebaseSessionCookie = req.cookies.firebaseSession as string;

  if (firebaseSessionCookie) {
    const decodedToken = await auth().verifySessionCookie(firebaseSessionCookie, true);
    const { email } = decodedToken;

    if (!email) {
      res.status(401).json({ errors: 'Unauthorized' });
      return;
    }

    const userInDB = await sessionService.authCheck(email);

    if (userInDB) {
      const userToBeReturned: FullUserForClient = {
        user: {
          name: userInDB.user.email,
          email: userInDB.user.email,
        },
        profile: userInDB.profile,
      };
      res.status(200).json(userToBeReturned);
      return;
    }
    res.status(401).json({ errors: 'Unauthorized' });
    return;
  }

  if (user) {
    const userInDB = await sessionService.authCheck(user.email);

    if (userInDB) {
      const userToBeReturned: FullUserForClient = {
        user: {
          name: userInDB.user.name,
          email: userInDB.user.email,
        },
        profile: userInDB.profile,
      };
      res.status(200).json(userToBeReturned);
    } else {
      req.session.destroy(() => {});
      res.status(401).json({ errors: 'Unauthorized' });
    }
  } else {
    req.session.destroy(() => {});
    res.status(401).json({ errors: 'Unauthorized' });
  }
};

const refreshSession = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const { user } = req.session;

  // TODO: consider breaking this and the auth functions up into separate functions for social login and email login...

  // WARN:
  // this doesn't actually refresh the firebase session cookie, it just checks if it's valid
  // to refresh we actually need to create a new cookie with a new expiration date
  // but not needed for now since expiration is set to a long time (5 days)

  const firebaseSessionCookie = req.cookies.firebaseSession as string;

  if (firebaseSessionCookie) {
    const decodedToken = await auth().verifySessionCookie(firebaseSessionCookie, true);
    const { email } = decodedToken;

    if (!email) {
      res.status(401).json({ errors: 'Unauthorized' });
      return;
    }

    const userInDB = await sessionService.authCheck(email);

    // NOTE: we add the below checks for user in db as well to ensure that users
    // deleted from the DB cannot continue to have an active session
    if (userInDB) {
      const userToBeReturned: FullUserForClient = {
        user: {
          name: userInDB.user.email,
          email: userInDB.user.email,
        },
        profile: userInDB.profile,
      };
      res.status(200).json(userToBeReturned);
      return;
    }
    res.status(401).json({ errors: 'Unauthorized' });
    return;
  }

  if (user) {
    const userInDB = await prisma.user.findUnique({
      where: {
        id: user?.id,
      },
    });
    if (userInDB) {
      req.session.touch();
      res.status(200).json({ status: 'OK' });
    } else {
      req.session.destroy(() => {});
      res.status(401).json({ errors: 'Unauthorized' });
    }
  } else {
    req.session.destroy(() => {});
    res.status(401).json({ errors: 'Unauthorized' });
  }
};

export const sessionController = { login, logout, authCheck, refreshSession };
