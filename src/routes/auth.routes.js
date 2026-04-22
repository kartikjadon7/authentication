// auth.routes.js

import Router from 'express';
import { forgotPassword, login, register, resetPassword, verifyEmail } from '../controller/auth.controller.js';
import { authentication, authorize } from '../middleware/auth.middleware.js';

const authRouter = Router();

authRouter.post("/register", register);
authRouter.get("/verify", verifyEmail);

authRouter.post("/login", login);

authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);


authRouter.get("/protected", authentication, authorize("admin", "user"), (req, res) => {
    res.send(req.user)
})

export default authRouter;