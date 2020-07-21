import express from 'express';
import { validateUserSignup } from '../validators/auth';
import { signup, login, getStatus } from '../controllers/auth';
import isAuth from '../middlewares/is-auth';

const router = express.Router();


router.put('/signup',validateUserSignup(),signup);

router.post('/login',login)

router.get('/status',isAuth,getStatus)



export default router;