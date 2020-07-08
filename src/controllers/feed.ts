import { Request, Response, NextFunction } from "express";

export const getPosts = (req: Request, resp: Response, next: NextFunction) => {
 return resp.status(200).json({
     posts: [{title: 'First post',content:'This is the first post'}]
 });
}

export const createPost = (req: Request, resp: Response, next: NextFunction)=>{
const {title,content} = req.body;
resp.status(201).json({
    message: 'Post created successfully',
    post:{
        id: new Date().toISOString(),
        title,
        content
    }
})
}