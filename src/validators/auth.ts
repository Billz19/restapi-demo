import { body } from "express-validator";
import User from "../models/User";


export const validateUserSignup = () => [
    body('email').isEmail().withMessage('Please enter a valid e-mail!').custom((value)=>{
         return User.findOne({email:value}).then(user => {
            if(user) return Promise.reject('E-mail already exists!')
        })
    }).normalizeEmail(),
    body('password').trim().isLength({min: 5}),
    body('name').trim().notEmpty()
]