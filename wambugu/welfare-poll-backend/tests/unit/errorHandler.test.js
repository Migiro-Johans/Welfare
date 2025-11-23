const { errorHandler, AppError } = require('../../src/middleware/errorHandler');
const httpMocks = require('node-mocks-http');

// Mock logger
jest.mock('../../src/utils/logger', () => ({
    error: jest.fn()
}));

describe('Error Handler Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();
        next = jest.fn();
        process.env.NODE_ENV = 'production'; // Test production behavior
    });

    test('should handle operational errors', () => {
        const error = new AppError('Test error', 400);
        errorHandler(error, req, res, next);

        const data = res._getJSONData();
        expect(res.statusCode).toBe(400);
        expect(data.status).toBe('fail');
        expect(data.message).toBe('Test error');
    });

    test('should handle sequelize validation errors', () => {
        const error = {
            name: 'SequelizeValidationError',
            errors: [{ message: 'Validation failed' }]
        };
        errorHandler(error, req, res, next);

        const data = res._getJSONData();
        expect(res.statusCode).toBe(400);
        expect(data.message).toContain('Validation failed');
    });

    test('should handle sequelize unique constraint errors', () => {
        const error = {
            name: 'SequelizeUniqueConstraintError',
            errors: [{ path: 'email' }]
        };
        errorHandler(error, req, res, next);

        const data = res._getJSONData();
        expect(res.statusCode).toBe(409);
        expect(data.message).toContain('email already exists');
    });

    test('should handle JWT errors', () => {
        const error = {
            name: 'JsonWebTokenError'
        };
        errorHandler(error, req, res, next);

        const data = res._getJSONData();
        expect(res.statusCode).toBe(401);
        expect(data.message).toContain('Invalid token');
    });

    test('should hide details for unknown errors in production', () => {
        const error = new Error('Something exploded');
        errorHandler(error, req, res, next);

        const data = res._getJSONData();
        expect(res.statusCode).toBe(500);
        expect(data.message).toBe('Something went very wrong!');
        expect(data.error).toBeUndefined();
    });
});
