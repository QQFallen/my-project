import express, { Request, Response, NextFunction } from 'express';
import User from '@models/User';
import { ValidationError } from '@utils/errors';

const router = express.Router();

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            throw new ValidationError('Имя, email и пароль обязательны для заполнения.');
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw new ValidationError('Пользователь с таким email уже существует.');
        }

        const user = await User.create({ name, email, password, role: 'user' });
        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
