import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import Post, { PostDocument } from "../models/Post";
import User, { UserDocument } from "../models/User";
import { unlink } from "fs";
import { join } from "path";
import { handleErrors, prepareError } from "../utils/utils";
import { Document } from "mongoose";
const clearImage = (imagePath: string) => {
    unlink(join(__dirname, '..', '..', imagePath), (error => console.log('clearImage', error)))
}

export const getPosts = (req: Request, resp: Response, next: NextFunction) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems: number;
    Post.find().countDocuments().then(count => {
        totalItems = count;
        return Post.find().skip((+currentPage - 1) * perPage).limit(perPage)
    })
        .then(posts => {
            resp.status(200).json({ message: 'Posts fetched successfully!', posts, totalItems });
        }).catch(error => handleErrors(next, error))
}

export const createPost = (req: Request, resp: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw prepareError('Validation failed, entered data incorrect', 422)
    }
    if (!req.file) {
        throw prepareError('File messing', 422)
    }
    const { title, content } = req.body;
    const userId = (req as any).userId;
    console.log('userId', userId);
    const imageUrl = req.file.path;
    const post = new Post({
        title,
        content,
        imageUrl,
        creator: userId
    });
    let connectedUser: UserDocument;
    post.save().then(_ => {
        return User.findById(userId)
    }).then((user: UserDocument | null) => {
        connectedUser = user!;
        connectedUser.posts!.push(post);
        return connectedUser.save()
    }).then(_ => {
        resp.status(201).json({
            message: 'Post created successfully',
            post,
            creator: { _id: connectedUser._id, name: connectedUser.name }
        });
    }).catch(error => {
        handleErrors(next, error);
    })
};


export const getPost = (req: Request, resp: Response, next: NextFunction) => {
    const id = req.params.id;
    Post.findById(id).then(post => {
        if (!post) {
            throw prepareError('Could not find post', 404)
        }
        resp.status(200).json({ message: 'Fetched post', post });
    }).catch(error => handleErrors(error, next))
};

export const updatePost = (req: Request, resp: Response, next: NextFunction) => {
    const id = req.params.id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw prepareError('Validation failed, entered data incorrect', 422)
    }
    const { title, content } = req.body;
    let imageUrl = req.body.image;
    if (req.file) {
        imageUrl = req.file.path;
    }
    if (!imageUrl) {
        throw prepareError('File messing', 422)
    }
    Post.findById(id).then((post: PostDocument | null) => {
        if (!post) {
            throw prepareError('Could not find post', 404);
        }
        if (post.creator!.toString() !== (req as any).userId) {
            throw prepareError('Not authorized', 403);
        }
        if (imageUrl !== post.imageUrl) {
            clearImage(post.imageUrl!)
        }

        post.title = title;
        post.content = content;
        post.imageUrl = imageUrl;
        return post.save();
    })
        .then(resultPost => {
            resp.status(200).json({ message: 'Post updated!', post: resultPost })
        }).catch(error => handleErrors(next, error))
}


export const deletePost = (req: Request, resp: Response, next: NextFunction) => {
    const id = req.params.id;
    Post.findById(id).then((post: PostDocument | null) => {

        if (!post) {
            throw prepareError('Could not find post', 404);
        }

        if (post.creator!.toString() !== (req as any).userId) {
            throw prepareError('Not authorized', 403);
        }

        clearImage(post.imageUrl!);
        return Post.findByIdAndDelete(id);
    }).then(result => {
        const userId = (req as any).userId;
        return User.findById(userId)
    }).then((user: UserDocument | null) => {
        const loggedUser = user!;
        (loggedUser.posts! as any).pull(id);
        return loggedUser.save();
    }).then(_ => {
        resp.status(200).json({ message: 'Post deleted successfully' });
    }).catch(error => handleErrors(next, error));
}