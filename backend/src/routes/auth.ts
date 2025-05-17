import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '@models/User';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

interface RegisterRequest {
    email: string;
    name: string;
    password: string;
}

interface LoginRequest {
    email: string;
    password: string;
}

interface UserResponse {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'admin';
}

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRegisterRequest'
 *     responses:
 *       201:
 *         description: Регистрация успешна
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Регистрация успешна
 *       400:
 *         description: Ошибка валидации или email уже используется
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email уже используется
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ошибка сервера
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Тело запроса при регистрации:', req.body);
        const { email, name, password } = req.body as RegisterRequest;

        console.log('Данные для регистрации:', { email, name, password });
        console.log('Тип пароля:', typeof password);
        console.log('Длина пароля:', password?.length);

        if (!email || !name || !password) {
            res.status(400).json({ message: 'Заполните все поля' });
            return;
        }

        // Проверка длины пароля
        if (password.length < 6) {
            res.status(400).json({ message: 'Пароль должен содержать минимум 6 символов' });
            return;
        }

        // Проверяем, существует ли уже пользователь
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'Пользователь с таким email уже существует' });
            return;
        }

        // Проверяем, есть ли уже пользователи в системе
        const userCount = await User.count();
        const role = userCount === 0 ? 'admin' : 'user';

        // Хешируем пароль
        console.log('Хеширование пароля...');
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Хеш пароля:', hashedPassword);

        // Создаём пользователя
        const user = await User.create({
            email,
            name,
            password: hashedPassword,
            role
        });

        console.log('Пользователь создан:', { id: user.id, email: user.email, role: user.role });

        // Создаём JWT токен
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Отправляем ответ
        const userResponse: UserResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        res.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            user: userResponse,
            token
        });
    } catch (err) {
        console.error('Ошибка при регистрации:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Авторизация пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Успешная авторизация
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT токен
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Неверные данные
 *       401:
 *         description: Неверный email или пароль
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Полное тело запроса:', req.body);
        console.log('Тип пароля:', typeof req.body.password);
        console.log('Длина пароля:', req.body.password?.length);
        
        const { email, password } = req.body as LoginRequest;

        console.log('Попытка входа:', { email });
        console.log('Введенный пароль:', password);
        console.log('Тип введенного пароля:', typeof password);
        console.log('Длина введенного пароля:', password?.length);

        if (!email || !password) {
            console.log('Отсутствуют email или пароль');
            res.status(400).json({ message: 'Email и пароль обязательны' });
            return;
        }

        const user = await User.findOne({ where: { email } });
        console.log('Найден пользователь:', user ? 'Да' : 'Нет');
        
        if (!user) {
            console.log('Пользователь не найден');
            res.status(401).json({ message: 'Неверный email или пароль' });
            return;
        }

        console.log('Хеш пароля в базе:', user.password);
        console.log('Сравнение паролей...');
        
        // Создаем хеш введенного пароля для сравнения
        const hashedInputPassword = await bcrypt.hash(password, 10);
        console.log('Хеш введенного пароля:', hashedInputPassword);
        
        // Пробуем сравнить пароли напрямую
        console.log('Прямое сравнение паролей:', password === user.password);
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Результат сравнения паролей:', isPasswordValid);

        if (!isPasswordValid) {
            console.log('Неверный пароль');
            res.status(401).json({ message: 'Неверный email или пароль' });
            return;
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        const userResponse: UserResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };

        console.log('Успешная авторизация для пользователя:', user.email);
        res.json({
            token,
            user: userResponse,
        });
    } catch (err) {
        console.error('Ошибка при входе:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

export default router;
