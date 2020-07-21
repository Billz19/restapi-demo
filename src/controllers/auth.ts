import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import User, { UserDocument } from "../models/User";
import { hash, compare } from "bcrypt";
import { handleErrors, prepareError, } from "../utils/utils";
import { sign } from "jsonwebtoken";


export const signup = (req: Request, resp: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw prepareError('Validation failed!', 422, errors.array())
    }
    const { name, password, email } = req.body;

    hash(password, 12).then(hashedPassword => {
        const user = new User({
            email,
            password: hashedPassword,
            name
        });
        return user.save();
    }).then(userDoc => {
        resp.status(201).json({ message: 'User created!', userId: userDoc._id });
    }).catch(error => handleErrors(next, error))
};


export const login = (req: Request, resp: Response, next: NextFunction) => {
    const { email, password } = req.body;
    let loggedUser: UserDocument;
    User.findOne({email}).then((userDoc: UserDocument | null) => {
        if (!userDoc) {
            throw prepareError('A user with this email could not be found, please try again!', 401)
        }
        loggedUser = userDoc
        return compare(password, loggedUser.password!);
    }).then(isEqual => {
        if (!isEqual) {
            throw prepareError('Wrong password', 401);
        }
        const token = sign({
            email: loggedUser.email,
            userId: loggedUser._id
        }, 'mySuperSecret', { expiresIn: '1h' });
        resp.status(200).json({ token, userId: loggedUser._id.toString() });
    }).catch(error => handleErrors(next, error))
}


export const getStatus = async (req: Request, resp: Response, next: NextFunction) => {
    const userId = (req as any).userId;
    try {
        const user = await User.findById(userId) as UserDocument;
        resp.status(200).json({status:user.status})
    } catch (error) {
        handleErrors(next,error);
    }
}