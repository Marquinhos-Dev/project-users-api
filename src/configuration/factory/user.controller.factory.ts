import { UserController } from '../../application/controllers/user.controller';
import { IController } from '../../domain/server/interfaces/IController';
import { UserServiceFactory } from './user.service.factory';
import { authMiddleware } from '../../application/middlewares/auth.middleware';

export class UserControllerFactory {
  static create(): IController {
    return new UserController(
      UserServiceFactory.create(),
      authMiddleware,
    );
  }
}