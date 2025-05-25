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
            firstName: user.firstName,
            lastName: user.lastName,
            middleName: user.middleName,
            gender: user.gender,
            dateOfBirth: user.dateOfBirth,
            email: user.email,
            createdAt: user.createdAt,
        });
    } catch (error) {
        next(error);
    }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { firstName, lastName, middleName, gender, dateOfBirth } = req.body;
        if (!firstName || !lastName || !gender || !dateOfBirth) {
            throw new ValidationError('Имя, фамилия, пол и дата рождения обязательны для заполнения.');
        }
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден.' });
        }
        user.firstName = firstName;
        user.lastName = lastName;
        user.middleName = middleName || null;
        user.gender = gender;
        user.dateOfBirth = dateOfBirth;
        await user.save();
        res.json({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            middleName: user.middleName,
            gender: user.gender,
            dateOfBirth: user.dateOfBirth,
            email: user.email,
            createdAt: user.createdAt,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
