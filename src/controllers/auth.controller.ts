import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { registerUser, loginUser } from '../services/auth.service';
import { LoginInput, RegisterInput } from '../validations/auth.validation';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as RegisterInput;
  const user = await registerUser(email, password);
  res.status(201).json({ user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;
  const { user, token } = await loginUser(email, password);
  res.status(200).json({ user, token });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({ user: req.user });
});
