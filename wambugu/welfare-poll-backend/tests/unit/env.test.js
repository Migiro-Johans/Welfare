const Joi = require('joi');
const validateEnv = require('../../src/config/env');

describe('Environment Validation', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    test('should validate correct environment variables', () => {
        process.env = {
            ...process.env,
            NODE_ENV: 'test',
            PORT: '5000',
            DB_HOST: 'localhost',
            DB_PORT: '5432',
            DB_USER: 'test',
            DB_PASSWORD: 'password',
            DB_NAME: 'test_db',
            JWT_SECRET: 'a_very_long_secret_key_that_is_at_least_32_chars',
            EMAIL_USER: 'test@test.com',
            EMAIL_PASS: 'password',
            EMAIL_FROM: 'noreply@test.com',
            ADMIN_EMAIL: 'admin@test.com',
            ADMIN_INITIAL_PASSWORD: 'password123'
        };

        const env = validateEnv();
        expect(env).toBeDefined();
        expect(env.NODE_ENV).toBe('test');
    });

    test('should fail when required variables are missing', () => {
        // Mock process.exit to prevent test from exiting
        const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { });
        // Mock console.error to suppress output
        const mockConsoleError = jest.spyOn(require('../../src/utils/logger'), 'error').mockImplementation(() => { });

        process.env = {
            NODE_ENV: 'test'
            // Missing many required vars
        };

        validateEnv();

        expect(mockExit).toHaveBeenCalledWith(1);

        mockExit.mockRestore();
        mockConsoleError.mockRestore();
    });
});
