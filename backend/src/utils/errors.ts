// Тестовая строка для проверки Husky и lint-staged
export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class AuthenticationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthenticationError';
    }
}

export class AuthorizationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthorizationError';
    }
}

// Новая ошибка для теста
export class CustomTestError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CustomTestError';
    }
}
