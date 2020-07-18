import express from 'express';
import { validateUserSignup } from '../validators/auth';
import { signup, login } from '../controllers/auth';

const router = express.Router();


router.put('/signup',validateUserSignup(),signup);

router.post('/login',login)



export default router;