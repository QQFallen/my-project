import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '@models/User';
import dotenv from 'dotenv';

dotenv.config();

// Тип для содержимого токена
interface DecodedToken extends JwtPayload {
  id: number;
}

// Расширяем тип Request, чтобы добавить поле auth
declare module 'express' {
  interface Request {
    auth?: {
      user: Partial<User>;
      token: string;
    };
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  console.log('AUTH MIDDLEWARE:', req.header('Authorization'));
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Требуется токен авторизации',
    });
  }

  const token = authHeader.split(' ')[1].trim();

  try {
    // 1. Проверка токена
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "123",
    ) as DecodedToken;

    // 2. Поиск пользователя
    const user = await User.findOne({
      where: { id: decoded.id },
      attributes: ['id', 'email', 'name'],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не найден',
      });
    }

    req.auth = {
      user: user.get({ plain: true }),
      token,
    };
    console.log('AUTH OK, user:', req.auth.user);

    next();
  } catch (err: unknown) {
    console.error('Auth error:', err);

    const response: Record<string, unknown> = {
      success: false,
      message: 'Неверный токен',
    };

    if (err instanceof jwt.TokenExpiredError) {
      response.message = 'Токен истек';
    }

    if (process.env.NODE_ENV === 'development') {
      response.error = (err as Error).message;
    }

    return res.status(401).json(response);
  }
};
