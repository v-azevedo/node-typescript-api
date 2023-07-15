import AuthService from '@src/services/auth';
import { authMiddleWare } from '../auth';

describe('AuthMiddleWare', () => {
  it('should verify a JWT token and call the next middleware', () => {
    const jwtToken = AuthService.generateToken({ data: 'any' });
    const reqMock = {
      headers: {
        'x-access-token': jwtToken,
      },
    };
    const resMock = {};
    const nextMock = jest.fn();

    authMiddleWare(reqMock, resMock, nextMock);

    expect(nextMock).toHaveBeenCalled();
  });

  it('should return UNAUTHORIZED if there is a problem on the token verification', () => {
    const reqMock = {
      headers: {
        'x-access-token': 'invalid token',
      },
    };
    const sendMock = jest.fn();
    const resMock = {
      status: jest.fn(() => ({ send: sendMock })),
    };
    const nextMock = jest.fn();

    authMiddleWare(reqMock, resMock as object, nextMock);

    expect(resMock.status).toHaveBeenCalledWith(401);
    expect(sendMock).toHaveBeenCalledWith({
      code: 401,
      error: 'jwt malformed',
    });
  });

  it(`should return UNAUTHORIZED middleware if there's no token`, () => {
    const reqMock = {
      headers: {},
    };
    const sendMock = jest.fn();
    const resMock = {
      status: jest.fn(() => ({ send: sendMock })),
    };
    const nextMock = jest.fn();

    authMiddleWare(reqMock, resMock as object, nextMock);

    expect(resMock.status).toHaveBeenCalledWith(401);
    expect(sendMock).toHaveBeenCalledWith({
      code: 401,
      error: 'jwt must be provided',
    });
  });
});
