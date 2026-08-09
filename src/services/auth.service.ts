import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { db } from '../config/db';
import { env } from '../config/env';
import {
  AUTH_ERRORS,
  JWT_EXPIRES_IN,
  SALT_ROUNDS,
} from '../constants/auth.constants';
import { AppError } from '../utils/app-error';
import { UserInstance } from '../models/user.model';

export async function registerUser(
  email: string,
  plainPassword: string
): Promise<UserInstance> {
  const existingUser = await db.User.findOne({ where: { email } });
  if (existingUser) {
    throw new AppError(AUTH_ERRORS.EMAIL_TAKEN, 409);
  }

  const passwordHash = await bcrypt.hash(plainPassword, SALT_ROUNDS);

  const created = await db.User.create({
    email,
    passwordHash,
  });

  const user = await db.User.findByPk(created.id);
  if (!user) {
    throw new AppError('Failed to create user.', 500);
  }

  return user;
}

export async function loginUser(
  email: string,
  plainPassword: string
): Promise<{ user: UserInstance; token: string }> {
  const user = await db.User.scope('withPassword').findOne({
    where: { email },
  });

  if (!user || !(await bcrypt.compare(plainPassword, user.passwordHash))) {
    throw new AppError(AUTH_ERRORS.INVALID_CREDENTIALS, 401);
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email },
    env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'] }
  );

  const safeUser = await db.User.findByPk(user.id);
  if (!safeUser) {
    throw new AppError(AUTH_ERRORS.INVALID_CREDENTIALS, 401);
  }

  return { user: safeUser, token };
}
