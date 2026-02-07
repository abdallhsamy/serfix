import { Request, Response } from 'express';
import { errorHandler, AppError } from '../../src/middleware/errorHandler';

jest.mock('../../src/utils/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn(), warn: jest.fn() },
}));

describe('errorHandler', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockReq = {};
    mockRes = { status: statusMock, json: jsonMock };
  });

  it('sends AppError status and message with code', () => {
    const err = new AppError(404, 'Not found', 'NOT_FOUND');
    errorHandler(err, mockReq as Request, mockRes as Response, () => {});
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Not found',
      code: 'NOT_FOUND',
    });
  });

  it('sends 400 for validation error', () => {
    const err = new AppError(400, 'Invalid input', 'VALIDATION_ERROR');
    errorHandler(err, mockReq as Request, mockRes as Response, () => {});
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Invalid input', code: 'VALIDATION_ERROR' })
    );
  });

  it('sends 500 and generic message for unknown Error', () => {
    const err = new Error('Something broke');
    errorHandler(err, mockReq as Request, mockRes as Response, () => {});
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Internal server error' })
    );
  });

  it('includes stack in response when not production (for non-AppError)', () => {
    const orig = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';
    const err = new Error('Boom');
    errorHandler(err, mockReq as Request, mockRes as Response, () => {});
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Internal server error',
        stack: expect.any(String),
      })
    );
    process.env.NODE_ENV = orig;
  });
});
