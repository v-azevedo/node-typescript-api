import { Controller, Get, Middleware, Post } from '@overnightjs/core';
import { User } from '@src/models/user';
import { Request, Response } from 'express';
import { BaseController } from '.';
import AuthService from '@src/services/auth';
import { authMiddleWare } from '@src/middleware/auth';

@Controller('users')
export class UsersController extends BaseController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const user = new User(req.body);
      const newUser = await user.save();

      res.status(201).send(newUser);
    } catch (err) {
      this.sendCreatedUpdatedErrorResponse(res, err);
    }
  }

  @Post('authenticate')
  public async authenticate(
    req: Request,
    res: Response
  ): Promise<Response | undefined> {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return this.sendErrorResponse(res, {
        code: 401,
        message: 'User not found!',
      });

    if (!(await AuthService.comparePassword(password, user.password)))
      return this.sendErrorResponse(res, {
        code: 401,
        message: 'Password does not match!',
      });

    const token = AuthService.generateToken(user.toJSON());

    return res.status(200).send({ ...user.toJSON(), ...{ token } });
  }

  @Get('me')
  @Middleware(authMiddleWare)
  public async me(req: Request, res: Response): Promise<Response> {
    const email = req.decoded ? req.decoded.email : undefined;
    const user = await User.findOne({ email });

    if (!user) {
      return this.sendErrorResponse(res, {
        code: 404,
        message: 'User not found!',
      });
    }

    return res.send({ user });
  }
}
