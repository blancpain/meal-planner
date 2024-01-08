import * as bcrypt from 'bcryptjs';
import { TLoginSchema, FullUserForAuth, UserProfileForClient, UserForAuth } from '@/types';
import { prisma, exclude, extractUserProfile } from '@/utils';

const login = async (user: TLoginSchema): Promise<FullUserForAuth | null> => {
  const { email, password } = user;
  // NOTE: select user - if pass is wrong no need for further queries
  const targetedUser = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      passwordHash: true,
      disabled: true,
      verified: true,
    },
  });

  const passwordCorrect =
    targetedUser === null ? false : await bcrypt.compare(password, targetedUser.passwordHash);

  if (!(targetedUser && passwordCorrect)) return null;

  // NOTE: filter out passwordHash
  const filteredUser: UserForAuth = exclude(targetedUser, ['passwordHash']);

  const userProfile = await extractUserProfile(targetedUser.id);

  if (userProfile) {
    const filteredUserProfile: UserProfileForClient = exclude(userProfile, [
      'id',
      'userId',
      'createdAt',
      'updatedAt',
    ]);

    const userToBeReturned = {
      user: filteredUser,
      profile: filteredUserProfile,
    };

    return userToBeReturned;
  }

  return null;
};

const authCheck = async (email: string): Promise<FullUserForAuth | null> => {
  // NOTE: select user - if pass is wrong no need for further queries
  const targetedUser = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      disabled: true,
      verified: true,
    },
  });

  if (!targetedUser) return null;

  const userProfile = await extractUserProfile(targetedUser.id);

  if (userProfile) {
    const filteredUserProfile: UserProfileForClient = exclude(userProfile, [
      'id',
      'userId',
      'createdAt',
      'updatedAt',
    ]);

    const userToBeReturned = {
      user: targetedUser,
      profile: filteredUserProfile,
    };

    return userToBeReturned;
  }

  return null;
};
export const sessionService = { login, authCheck };
