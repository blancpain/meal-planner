import { NextFunction, Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { nanoid } from 'nanoid';
import { auth } from 'firebase-admin';
import { FullUserForClient, UserProfileForClient, signUpSchema } from '@/types';
import { userService } from '../services/userService';
import { exclude, extractUserProfile, prisma } from '@/utils';
import { mailgunClient } from '@/config';

const DOMAIN = process.env.MAILGUN_DOMAIN as string;

// WARN: might be worth setting expiration time on verification tokens as per best practices

const addUser = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  // eslint-disable-next-line prefer-destructuring
  const body: unknown = req.body;
  const result = signUpSchema.safeParse(body);
  let zodErrors = {};
  // NOTE: we do not want to destroy the session in test or development mode as we aren't sessions per se
  if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'development') {
    // Avoid creating new sessions if there are errors
    req.session.destroy(() => {});
  }
  if (!result.success) {
    req.session.destroy(() => {});
    result.error.issues.forEach((issue) => {
      zodErrors = { ...zodErrors, [issue.path[0]]: issue.message };
    });
    res.status(400).json({ errors: zodErrors });
  } else {
    const savedUser = await userService.createUser(result.data);
    if (!savedUser) {
      res.status(400).json({ errors: 'Error during user registration' });
      return;
    }

    // NOTE: we need to encode the token in case it contains special characters to allow the browser to parse it
    const verificationLink = `https://mangify.org/verify-email?key=${encodeURIComponent(
      savedUser.verificationToken,
    )}`;
    const messageData = {
      from: 'admin@mangify.com',
      to: `${savedUser.email}`,
      subject: '[No reply]Please verify your mangify email',
      text: `Please verify your mangify email by clicking the link below:\n\n${verificationLink}`,
    };

    await mailgunClient.messages.create(DOMAIN, messageData);

    res.status(201).json(savedUser);
  }
};

const verifyUser = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const { key } = req.body as { key: string };

  const user = await prisma.user.findUnique({
    where: {
      verificationToken: key,
    },
  });

  if (!user) {
    res.status(401).json({ errors: 'Unauthorized' });
    return;
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      verified: true,
      verificationToken: '',
    },
  });

  res.status(204).end();
};

const reVerifyUser = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const { email } = req.body as { email: string };

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    res.status(401).json({ errors: 'Unauthorized' });
    return;
  }

  if (user.verified) {
    res.status(204).end();
  }

  const newVerificationToken = nanoid();
  const verificationLink = `https://mangify.org/verify-email?key=${encodeURIComponent(
    newVerificationToken,
  )}`;

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      verificationToken: newVerificationToken,
    },
  });

  const messageData = {
    from: 'admin@mangify.com',
    to: `${user.email}`,
    subject: '[No reply]Please verify your mangify email',
    text: `Please verify your mangify email by clicking the link below:\n\n${verificationLink}`,
  };

  await mailgunClient.messages.create(DOMAIN, messageData);

  res.status(204).end();
};

const googleSignIn = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  // NOTE: hard typing should be OK since this is coming from Firebase Google Auth
  const { idToken } = req.body as { idToken: string };

  const decodedToken = await admin.auth().verifyIdToken(idToken);
  const { email } = decodedToken;
  if (!email) {
    res.status(400).json({ errors: 'Invalid or missing email in Google token' });
    return;
  }

  // Set session expiration to 5 days
  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  // Create the Firebase session cookie
  const firebaseSessionCookie = await auth().createSessionCookie(idToken, { expiresIn });

  // Set cookie policy for Firebase session cookie
  const firebaseCookieOptions = { maxAge: expiresIn, httpOnly: true, secure: true };
  res.cookie('firebaseSession', firebaseSessionCookie, firebaseCookieOptions);

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  // NOTE: case when there is no user
  if (!user) {
    const newUser = await userService.createUser({
      email,
      password: nanoid(),
      confirmPassword: nanoid(),
      name: email,
    });

    if (!newUser) {
      res.status(400).json({ errors: 'Error during Google sign-in' });
      return;
    }

    const userProfile = await extractUserProfile(newUser.id);

    if (userProfile) {
      const filteredUserProfile: UserProfileForClient = exclude(userProfile, [
        'id',
        'userId',
        'createdAt',
        'updatedAt',
      ]);

      // NOTE: set user to verified since we are using Google Auth
      await prisma.user.update({
        where: {
          id: newUser.id,
        },
        data: {
          verified: true,
        },
      });

      const filteredUser = {
        name: newUser.name,
        email: newUser.email,
      };

      const userToBeReturned: FullUserForClient = {
        user: filteredUser,
        profile: filteredUserProfile,
      };

      res.status(201).json(userToBeReturned);
      return;
    }
    res.status(400).json({ errors: 'Error during Google sign-in' });
    return;
  }

  // NOTE: case when there is a user
  const userProfile = await extractUserProfile(user.id);

  if (userProfile) {
    const filteredUserProfile: UserProfileForClient = exclude(userProfile, [
      'id',
      'userId',
      'createdAt',
      'updatedAt',
    ]);

    // NOTE: set user to verified since we are using Google Auth
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        verified: true,
      },
    });

    const filteredUser = {
      name: user.name,
      email: user.email,
    };

    const userToBeReturned: FullUserForClient = {
      user: filteredUser,
      profile: filteredUserProfile,
    };
    res.status(200).json(userToBeReturned);
  } else {
    res.status(400).json({ errors: 'Error during Google sign-in' });
  }
};

const facebookSignIn = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const { idToken } = req.body as { idToken: string };

  const decodedToken = await admin.auth().verifyIdToken(idToken);
  const { email } = decodedToken;
  if (!email) {
    res.status(400).json({ errors: 'Invalid or missing email in Facebook token' });
    return;
  }

  // Set session expiration to 5 days
  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  // Create the Firebase session cookie
  const firebaseSessionCookie = await auth().createSessionCookie(idToken, { expiresIn });

  // Set cookie policy for Firebase session cookie
  const firebaseCookieOptions = { maxAge: expiresIn, httpOnly: true, secure: true };
  res.cookie('firebaseSession', firebaseSessionCookie, firebaseCookieOptions);

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    const newUser = await userService.createUser({
      email,
      password: nanoid(),
      confirmPassword: nanoid(),
      name: email,
    });

    if (!newUser) {
      res.status(400).json({ errors: 'Error during Facebook sign-in' });
      return;
    }

    const userProfile = await extractUserProfile(newUser.id);

    if (userProfile) {
      const filteredUserProfile: UserProfileForClient = exclude(userProfile, [
        'id',
        'userId',
        'createdAt',
        'updatedAt',
      ]);

      await prisma.user.update({
        where: {
          id: newUser.id,
        },
        data: {
          verified: true,
        },
      });

      const filteredUser = {
        name: newUser.name,
        email: newUser.email,
      };

      const userToBeReturned: FullUserForClient = {
        user: filteredUser,
        profile: filteredUserProfile,
      };

      res.status(201).json(userToBeReturned);
      return;
    }
    res.status(400).json({ errors: 'Error during Facebook sign-in' });
    return;
  }

  const userProfile = await extractUserProfile(user.id);

  if (userProfile) {
    const filteredUserProfile: UserProfileForClient = exclude(userProfile, [
      'id',
      'userId',
      'createdAt',
      'updatedAt',
    ]);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        verified: true,
      },
    });

    const filteredUser = {
      name: user.name,
      email: user.email,
    };

    const userToBeReturned: FullUserForClient = {
      user: filteredUser,
      profile: filteredUserProfile,
    };
    res.status(200).json(userToBeReturned);
  } else {
    res.status(400).json({ errors: 'Error during Facebook sign-in' });
  }
};

// NOTE: below 3 are not currently being used
// if to be used in future need to accomodate firebase auth

const deleteUser = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const userToBeDeleted = await userService.deleteUser(id);

  if (!userToBeDeleted) {
    res.status(404).json({ errors: 'user not found' });
    return;
  }
  res.status(204).end();
};

const getAll = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const allUsers = await userService.getAll();
  res.json(allUsers);
};

const getOne = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const user = await userService.getOne(id);
  if (!user) {
    res.status(404).json({ errors: 'user not found' });
    return;
  }
  res.json(user);
};

export const userController = {
  getAll,
  getOne,
  addUser,
  deleteUser,
  googleSignIn,
  facebookSignIn,
  verifyUser,
  reVerifyUser,
};
