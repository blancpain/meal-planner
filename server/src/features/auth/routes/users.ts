import express, { RequestHandler } from 'express';
import { userController } from '../controllers/userController';

const userRouter = express.Router();

userRouter.post('/', userController.addUser as RequestHandler);
userRouter.post('/google-signin', userController.googleSignIn as RequestHandler);
userRouter.post('/facebook-signin', userController.facebookSignIn as RequestHandler);
userRouter.post('/verify-email', userController.verifyUser as RequestHandler);

export { userRouter };
