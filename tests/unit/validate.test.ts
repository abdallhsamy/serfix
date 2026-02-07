import { validate } from '../../src/middleware/validate';
import { body } from 'express-validator';

describe('validate middleware', () => {
  it('calls next() when validation passes', async () => {
    const req = { body: { email: 'a@b.com' } } as any;
    const res = {} as any;
    const next = jest.fn();
    const validations = [body('email').isEmail()];
    await validate(validations)(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('calls next(AppError) when validation fails', async () => {
    const req = { body: { email: 'not-an-email' } } as any;
    const res = {} as any;
    const next = jest.fn();
    const validations = [body('email').isEmail().withMessage('Invalid email')];
    await validate(validations)(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toHaveProperty('statusCode', 400);
    expect(err).toHaveProperty('code', 'VALIDATION_ERROR');
  });
});
